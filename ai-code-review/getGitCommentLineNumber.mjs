export function getDiffPosition(diffFile, targetLine) {
  let position = 0;

  for (const chunk of diffFile.chunks) {
    for (const change of chunk.changes) {
      position++;

      // Only count added lines
      if (change.add && change.ln === targetLine) {
        return position;
      }
    }
  }

  return undefined;
}
