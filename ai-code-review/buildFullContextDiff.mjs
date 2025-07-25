import { getSettings } from "./config/setting.mjs";

function decodeBufferContent(buffer) {
  const encodings = ["utf-8", "latin1", "ascii", "utf16le"];
  for (const encoding of encodings) {
    try {
      return buffer.toString(encoding);
    } catch {
      // Try next encoding
    }
  }
  return "";
}

export function buildFullContextDiff(
  originalContent,
  patchContent,
  beforeContext = 3,
  afterContext = 3,
  filename = "",
  newFileContent = ""
) {
  if (!patchContent) return patchContent;

  // Decode content
  const original = Buffer.isBuffer(originalContent)
    ? decodeBufferContent(originalContent)
    : originalContent;
  const originalLines = original.split(/\r?\n/);
  const patchLines = patchContent.split(/\r?\n/);

  // Skip processing for certain file types
  const skipTypes = getSettings()?.config?.patch_extension_skip_types;
  if (
    skipTypes &&
    filename &&
    skipTypes.some((ext) => filename.endsWith(ext))
  ) {
    return patchContent;
  }

  let output = [];
  let currentHunk = null;
  let hunkContent = [];

  for (let i = 0; i < patchLines.length; i++) {
    const line = patchLines[i];

    if (line.startsWith("@@")) {
      // Finalize previous hunk
      if (currentHunk) {
        // Add after context
        if (afterContext > 0) {
          const endLine = currentHunk.oldStart + currentHunk.oldSize;
          const contextEnd = Math.min(
            endLine + afterContext,
            originalLines.length
          );
          const contextLines = originalLines.slice(endLine, contextEnd);
          hunkContent.push(...contextLines.map((l) => ` ${l}`));
        }
        output.push(...hunkContent);
        output.push(""); // Blank line between hunks
      }

      // Parse new hunk
      const match = line.match(
        /^@@\s-(\d+)(?:,(\d+))?\s\+(\d+)(?:,(\d+))?\s@@\s?(.*)/
      );
      if (!match) {
        currentHunk = null;
        continue;
      }

      currentHunk = {
        oldStart: parseInt(match[1]),
        oldSize: parseInt(match[2] || "0"),
        newStart: parseInt(match[3]),
        newSize: parseInt(match[4] || "0"),
        section: match[5] || "",
      };

      // Add before context
      const contextStart = Math.max(
        0,
        currentHunk.oldStart - 1 - beforeContext
      );
      const contextLines = originalLines.slice(
        contextStart,
        currentHunk.oldStart - 1
      );
      hunkContent = [
        `@@ -${contextStart + 1},${
          currentHunk.oldSize + beforeContext + afterContext
        } ` +
          `+${
            currentHunk.newStart - (currentHunk.oldStart - contextStart - 1)
          },` +
          `${currentHunk.newSize + beforeContext + afterContext} @@ ${
            currentHunk.section
          }`,
        ...contextLines.map((l) => ` ${l}`),
      ];
    } else if (currentHunk) {
      hunkContent.push(line);
    } else {
      output.push(line);
    }
  }

  // Add final hunk
  if (currentHunk && hunkContent.length > 0) {
    // Add after context
    if (afterContext > 0) {
      const endLine = currentHunk.oldStart + currentHunk.oldSize;
      const contextEnd = Math.min(endLine + afterContext, originalLines.length);
      const contextLines = originalLines.slice(endLine, contextEnd);
      hunkContent.push(...contextLines.map((l) => ` ${l}`));
    }
    output.push(...hunkContent);
  }

  return output.join("\n");
}
