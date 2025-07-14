import parseDiff from "parse-diff";
import { getChangedFileVersions } from "./getGitPullRequestChanges.mjs";
import { extractChangedFunctionsFromFile } from "./astChangedFile.mjs";
import { reviewWithOllama } from "./reviewWithAi.mjs";
import { jsonParser } from "./parseJson.mjs";
import { getDiffPosition } from "./getGitCommentLineNumber.mjs";
import { postInlineReview } from "./postGitComments.mjs";
import { fetchExistingComments } from "./getPreviousGitComments.mjs";
import { removeDuplicateComment } from "./newComments.mjs";
import { getJiraDetails } from "./getJiraDescription.mjs";

(async () => {
  try {
    const diffText = await getChangedFileVersions();
    const jiraContext = await getJiraDetails("CRM-3");
    const allComments = [];

    for (const diffFile of diffText) {
      const { file, patch, newCode } = diffFile;
      const astChanges = extractChangedFunctionsFromFile(patch, newCode, file);
      const aiComments = [];

      for (const astChange of astChanges) {
        const suggestion = await reviewWithOllama({
          patch,
          ast_changes: astChange,
          jiraContext,
          file,
        });

        const parsed = jsonParser(suggestion);
        if (!parsed?.comments || !Array.isArray(parsed.comments)) continue;

        aiComments.push(...parsed.comments);
      }

      const fullDiff = `diff --git a/${file} b/${file}\n--- a/${file}\n+++ b/${file}\n${patch}`;
      const parsedDiff = parseDiff(fullDiff);

      const normalizePath = (p) => p?.replace(/^([ab]\/)/, "");
      const fileDiff = parsedDiff.find(
        (d) => normalizePath(d.to) === normalizePath(file)
      );

      if (!fileDiff) {
        console.warn(`⚠️ Diff not found for ${file}`);
        continue;
      }

      for (const comment of aiComments) {
        const { line, summary, suggestion } = comment;
        const position = getDiffPosition(fileDiff, line);

        if (typeof position !== "number") {
          console.warn(
            `⚠️ Could not map line ${line} to diff position in ${file}`
          );
          continue;
        }

        const formattedSuggestion = suggestion.includes("```js")
          ? suggestion
          : `\`\`\`js\n${suggestion.trim()}\n\`\`\``;

        allComments.push({
          path: file,
          position,
          body: `### 🔍 ${summary}\n\n${formattedSuggestion}`,
        });
      }
    }

    const existingComments = await fetchExistingComments();
    const finalComments = removeDuplicateComment(allComments, existingComments);

    await postInlineReview(finalComments);
  } catch (err) {
    console.error("💥 Review failed:", err);
    process.exit(1);
  }
})();
