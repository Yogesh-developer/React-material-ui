import yaml from "yaml";

export function parseYamlComments(response) {
  const match = response.match(/```yaml\s*([\s\S]*?)```/i);
  if (!match) {
    console.warn("No YAML code block found in response.");
    return [];
  }

  const yamlContent = match[1].trim();

  let parsed;
  try {
    parsed = yaml.parse(yamlContent);
  } catch (e) {
    console.error("YAML parsing error:", e.message);
    return [];
  }

  const comments = parsed?.comments || [];

  // Optional: filter out entries with missing 'match' or 'body'
  return comments.filter(
    (comment) =>
      typeof comment.match === "string" &&
      typeof comment.body === "string" &&
      comment.match.trim() !== "" &&
      comment.body.trim() !== ""
  );
}
