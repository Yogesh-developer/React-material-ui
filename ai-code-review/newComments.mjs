function textSimilarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const common = a.split(/\s+/).filter((word) => b.includes(word));
  return (2 * common.length) / (a.split(/\s+/).length + b.split(/\s+/).length);
}

export function removeDuplicateComment(allComments, existingComments) {
  return allComments.filter((newComment) => {
    return !existingComments.some((existing) => {
      const sameFile = existing.path === newComment.path;
      const closeLine =
        Math.abs(
          (existing.original_position || existing.position) -
            newComment.position
        ) <= 2;

      const similarity =
        textSimilarity(existing.body || "", newComment.body || "") >= 0.6;

      return sameFile && closeLine && similarity;
    });
  });
}
