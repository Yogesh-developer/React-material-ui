import stringSimilarity from "string-similarity";

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").toLowerCase().trim();
}

function splitBodyAndSuggestion(commentBody = "") {
  const codeBlockMatch = commentBody.match(/```(?:diff)?\n([\s\S]*?)```/i);

  const suggestion = codeBlockMatch?.[1]?.trim() || null;
  const body = suggestion
    ? commentBody.slice(0, codeBlockMatch.index).trim()
    : commentBody.trim();

  return {
    body,
    suggestion,
  };
}

function extractExistingBodiesByLocation(existingComments = []) {
  const map = new Map();

  for (const comment of existingComments) {
    const path = comment.path;
    const line = comment.original_line ?? comment.line ?? comment.position;
    const { body, suggestion } = splitBodyAndSuggestion(comment.body);
    const normBody = normalizeText(body);
    const normSuggestion = normalizeText(suggestion || "");

    if (!path || !line || !normBody) continue;

    const key = `${path}:${line}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({ body: normBody, suggestion: normSuggestion });
  }

  return map;
}

export function removeDuplicateComments(
  newComments = [],
  existingComments = [],
  filePath,
  similarityThreshold = 0.3
) {
  const existingByLocation = extractExistingBodiesByLocation(existingComments);

  return newComments.filter((comment) => {
    const path = filePath;
    const line = comment.line ?? comment.position;
    const normBody = normalizeText(comment.body);
    const normSuggestion = normalizeText(comment.suggestion);
    if (!path || !line || !normBody) return true;

    const key = `${path}:${line}`;
    const existingEntries = existingByLocation.get(key) || [];

    for (const {
      body: existBody,
      suggestion: existSuggestion,
    } of existingEntries) {
      const bodySimilarity = stringSimilarity.compareTwoStrings(
        normBody,
        existBody
      );
      const suggestionSimilarity = stringSimilarity.compareTwoStrings(
        normSuggestion,
        existSuggestion
      );

      if (
        bodySimilarity >= similarityThreshold ||
        suggestionSimilarity >= similarityThreshold
      ) {
        return false;
      }
    }

    return true;
  });
}
