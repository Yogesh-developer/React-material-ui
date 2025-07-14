/**
 * Merge multiple AST code changes and remove duplicate context blocks.
 *
 * Input: Array of changed blocks with `contextCode` and `changedCode`
 * Output: One merged block with deduplicated contextCode and merged changedCode
 */

export function mergeAndDeduplicateAstChanges(astChanges, maxGap = 30) {
  if (!astChanges.length) return [];

  const merged = [];
  let current = { ...astChanges[0] };
  current.lines = [...current.lines];

  const contextSet = new Set();
  const hash = (line) => line.trim().replace(/\s+/g, " ");
  const normalizeBlock = (block) =>
    block
      .split("\n")
      .map((line) => hash(line))
      .filter(Boolean)
      .join("\n");

  // Add initial context
  normalizeBlock(current.contextCode)
    .split("\n")
    .forEach((line) => contextSet.add(line));

  for (let i = 1; i < astChanges.length; i++) {
    const change = astChanges[i];
    const lineGap = change.startLine - current.endLine;

    if (change.file === current.file && lineGap >= 0 && lineGap <= maxGap) {
      current.lines.push(...change.lines);
      current.endLine = Math.max(current.endLine, change.endLine);
      current.changedCode += "\n" + change.changedCode;

      // Deduplicate context block
      const contextLines = normalizeBlock(change.contextCode).split("\n");
      for (const line of contextLines) {
        if (!contextSet.has(line)) {
          current.contextCode += "\n" + line;
          contextSet.add(line);
        }
      }
    } else {
      merged.push({ ...current });
      current = { ...change };
      current.lines = [...change.lines];
      contextSet.clear();
      normalizeBlock(current.contextCode)
        .split("\n")
        .forEach((line) => contextSet.add(line));
    }
  }

  merged.push({ ...current });
  return merged.map((block) => ({
    file: block.file,
    lines: block.lines,
    startLine: block.startLine,
    endLine: block.endLine,
    changedCode: block.changedCode.trim(),
    contextCode: Array.from(
      new Set(normalizeBlock(block.contextCode).split("\n"))
    ).join("\n"),
  }));
}
