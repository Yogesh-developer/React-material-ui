import { getSettings } from "./config/setting.mjs";

function decodeIfBytes(str) {
  if (Buffer.isBuffer(str)) {
    try {
      return str.toString("utf-8");
    } catch (_) {
      const encodings = ["latin1", "ascii", "utf16le"];
      for (const enc of encodings) {
        try {
          return str.toString(enc);
        } catch (_) {}
      }
      return "";
    }
  }
  return str;
}

function shouldSkipPatch(filename) {
  const skipTypes = getSettings().config.patch_extension_skip_types;
  return (
    filename && skipTypes && skipTypes.some((ext) => filename.endsWith(ext))
  );
}

function extractHunkHeaders(match) {
  const [_, start1, size1 = "0", start2, size2 = "0", sectionHeader = ""] =
    match;
  return [
    sectionHeader,
    parseInt(size1),
    parseInt(size2),
    parseInt(start1),
    parseInt(start2),
  ];
}

function checkIfHunkLinesMatchToFile(i, originalLines, patchLines, start1) {
  try {
    if (i + 1 < patchLines.length && patchLines[i + 1][0] === " ") {
      const patchLine = patchLines[i + 1].trim();
      const originalLine = originalLines[start1 - 1].trim();
      if (patchLine !== originalLine) {
        logger.info(
          `Invalid hunk: line ${start1} doesn't match original content`
        );
        return false;
      }
    }
  } catch (_) {}
  return true;
}

function processPatchLines(
  patchStr,
  originalFileStr,
  patchExtraLinesBefore,
  patchExtraLinesAfter,
  newFileStr = ""
) {
  const allowDynamicContext = getSettings().config.allow_dynamic_context;
  const patchExtraLinesBeforeDynamic =
    getSettings().config.max_extra_lines_before_dynamic_context;

  const fileOriginalLines = originalFileStr.split(/\r?\n/);
  const fileNewLines = newFileStr ? newFileStr.split(/\r?\n/) : [];
  const patchLines = patchStr.split(/\r?\n/);
  const extendedPatchLines = [];

  const RE_HUNK_HEADER =
    /^@@\s\-(\d+)(?:,(\d+))?\s\+(\d+)(?:,(\d+))?\s@@\s?(.*)/;

  let isValidHunk = true,
    start1 = -1,
    size1 = -1,
    start2 = -1,
    size2 = -1;

  for (let i = 0; i < patchLines.length; i++) {
    const line = patchLines[i];

    if (line.startsWith("@@")) {
      const match = RE_HUNK_HEADER.exec(line);
      if (match) {
        if (isValidHunk && start1 !== -1 && patchExtraLinesAfter > 0) {
          const extra = fileOriginalLines
            .slice(
              start1 + size1 - 1,
              start1 + size1 - 1 + patchExtraLinesAfter
            )
            .map((l) => ` ${l}`);
          extendedPatchLines.push(...extra);
        }

        const [sectionHeader, sz1, sz2, st1, st2] = extractHunkHeaders(match);
        size1 = sz1;
        size2 = sz2;
        start1 = st1;
        start2 = st2;

        isValidHunk = checkIfHunkLinesMatchToFile(
          i,
          fileOriginalLines,
          patchLines,
          start1
        );

        if (
          isValidHunk &&
          (patchExtraLinesBefore > 0 || patchExtraLinesAfter > 0)
        ) {
          const calcContextLimits = (beforeLines) => {
            let extStart1 = Math.max(1, start1 - beforeLines);
            let extSize1 = size1 + (start1 - extStart1) + patchExtraLinesAfter;
            let extStart2 = Math.max(1, start2 - beforeLines);
            let extSize2 = size2 + (start2 - extStart2) + patchExtraLinesAfter;
            return [extStart1, extSize1, extStart2, extSize2];
          };

          let [extendedStart1, extendedSize1, extendedStart2, extendedSize2] =
            allowDynamicContext && fileNewLines.length
              ? calcContextLimits(patchExtraLinesBeforeDynamic)
              : calcContextLimits(patchExtraLinesBefore);

          const deltaOriginal = fileOriginalLines
            .slice(extendedStart1 - 1, start1 - 1)
            .map((line) => ` ${line}`);

          extendedPatchLines.push("");
          extendedPatchLines.push(
            `@@ -${extendedStart1},${extendedSize1} +${extendedStart2},${extendedSize2} @@ ${sectionHeader}`
          );
          extendedPatchLines.push(...deltaOriginal);
          continue;
        }
      }
    }
    extendedPatchLines.push(line);
  }

  if (start1 !== -1 && patchExtraLinesAfter > 0 && isValidHunk) {
    const extra = fileOriginalLines
      .slice(start1 + size1 - 1, start1 + size1 - 1 + patchExtraLinesAfter)
      .map((l) => ` ${l}`);
    extendedPatchLines.push(...extra);
  }

  return extendedPatchLines.join("\n");
}

export function buildFullContextDiff(
  originalFileStr,
  patchStr,
  patchExtraLinesBefore = 0,
  patchExtraLinesAfter = 0,
  filename = "",
  newFileStr = ""
) {
  if (!patchStr || (!patchExtraLinesBefore && !patchExtraLinesAfter))
    return patchStr;
  originalFileStr = decodeIfBytes(originalFileStr);
  newFileStr = decodeIfBytes(newFileStr);
  if (!originalFileStr || shouldSkipPatch(filename)) return patchStr;

  try {
    return processPatchLines(
      patchStr,
      originalFileStr,
      patchExtraLinesBefore,
      patchExtraLinesAfter,
      newFileStr
    );
  } catch (err) {
    logger.warn(`Failed to extend patch: ${err}`, {
      artifact: { traceback: err.stack },
    });
    return patchStr;
  }
}
