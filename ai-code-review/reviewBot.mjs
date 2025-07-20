import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import {
  fetchPRFiles,
  fetchPullRequest,
  fetchRawFile,
  getInlineCommentLocations,
  getLatestCommitSha,
  createReviewWithComments,
  fetchExistingComments,
} from "./fetchPRFiles.mjs";
import { buildFullContextDiff } from "./buildFullContextDiff.mjs";
import { getSettings } from "./config/setting.mjs";
import { getLLMReview } from "./reviewWithAi.mjs";
import { buildReviewPrompt } from "./prReviewPrompt.mjs";
import { parseYamlComments } from "./parseAIFeedback.mjs";
import { removeDuplicateComments } from "./commentFilter.mjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

const { REPO_OWNER, REPO_NAME, PR_NUMBER } = process.env;

async function reviewPullRequest({ owner, repo, pull_number }) {
  const files = await fetchPRFiles(owner, repo, pull_number);
  const prData = await fetchPullRequest(owner, repo, pull_number);

  for (const file of files) {
    if (!file.patch || file.status === "removed") continue;

    const isNewFile = file.patch.startsWith("@@ -1,0");
    const rawCode = isNewFile
      ? ""
      : await fetchRawFile(owner, repo, prData.base.ref, file.filename);
    const newFileCode = await fetchRawFile(
      owner,
      repo,
      prData.head.ref,
      file.filename
    );

    const settings = getSettings();
    const extendedPatch = buildFullContextDiff(
      rawCode,
      file.patch,
      settings.config.patch_extra_lines_before,
      settings.config.patch_extra_lines_after,
      file.filename,
      newFileCode
    );

    const review = await getLLMReview(buildReviewPrompt(extendedPatch));

    const comments = parseYamlComments(review);
    const commentLocations = getInlineCommentLocations(extendedPatch, comments);
    const existingComments = await fetchExistingComments(
      REPO_OWNER,
      REPO_NAME,
      PR_NUMBER
    );

    const finalComment = removeDuplicateComments(
      commentLocations,
      existingComments,
      file.filename
    );

    const commit_id = await getLatestCommitSha(
      REPO_OWNER,
      REPO_NAME,
      PR_NUMBER
    );

    const res = await createReviewWithComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: PR_NUMBER,
      comments: finalComment,
      commit_id,
      file_path: file.filename,
    });
    console.log(res);
  }
}

(async () => {
  await reviewPullRequest({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: PR_NUMBER,
  });
})();
