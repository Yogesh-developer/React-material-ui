import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { createAppAuth } from "@octokit/auth-app";

const MyOctokit = Octokit.plugin(restEndpointMethods, paginateRest);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

const { GITHUB_TOKEN, GITHUB_APP_ID, GITHUB_INSTALLATION_ID, APP_PRIVATE_KEY } =
  process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const octokitBot = new MyOctokit({
  authStrategy: createAppAuth,
  auth: {
    appId: GITHUB_APP_ID,
    privateKey: APP_PRIVATE_KEY,
    installationId: GITHUB_INSTALLATION_ID,
  },
});

export async function fetchPRFiles(owner, repo, pull_number) {
  const response = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  const filesToReview = response.data.filter(
    (file) => file.status !== "removed"
  );

  return filesToReview;
}

export async function fetchPullRequest(owner, repo, pull_number) {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  return response.data;
}

export async function fetchRawFile(owner, repo, ref, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });

    if (!data || !data.content) {
      console.warn(
        `[fetchRawFileOctokit] No content returned for ${path} at ${ref}`
      );
      return "";
    }

    const decoded = Buffer.from(data.content, data.encoding).toString("utf8");
    return decoded;
  } catch (error) {
    // console.warn(
    //   `[fetchRawFileOctokit] Failed to fetch ${path} at ${ref}: ${error.message}`
    // );
    return "";
  }
}

export function getInlineCommentLocations(patch, comments) {
  const lines = patch.split("\n");
  const results = [];

  let newLineNum = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const hunkHeader = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunkHeader) {
      newLineNum = parseInt(hunkHeader[1], 10);
      i++;
      while (i < lines.length && !lines[i].startsWith("@@")) {
        const content = lines[i];

        if (content.startsWith("+") && !content.startsWith("+++")) {
          const addedLine = content.slice(1);

          comments.forEach((comment) => {
            if (
              addedLine.trim() === comment.match.trim() &&
              !results.find((r) => r.match === comment.match)
            ) {
              results.push({
                match: comment.match,
                body: comment.body,
                suggestion: comment.suggestion,
                line: newLineNum,
              });
            }
          });

          newLineNum++;
        } else if (!content.startsWith("-")) {
          newLineNum++;
        }

        i++;
      }
    } else {
      i++;
    }
  }

  return results;
}

export async function getLatestCommitSha(owner, repo, pull_number) {
  const pr = await octokit.rest.pulls.get({ owner, repo, pull_number });
  return pr.data.head.sha;
}

export async function createReviewWithComments({
  owner,
  repo,
  pull_number,
  comments,
  commit_id,
  file_path,
}) {
  const formattedComments = comments
    .filter((c) => c.body && (!c.suggestion || c.suggestion.trim() !== ""))
    .map((comment) => {
      const suggestionBlock = comment.suggestion
        ? `\n\nSuggestion:\n\`\`\`diff\n${comment.suggestion}\n\`\`\``
        : "";

      return {
        path: file_path,
        line: comment.line,
        side: "RIGHT",
        body: `${comment.body}${suggestionBlock}`,
      };
    });

  if (!formattedComments.length) {
    return "No valid comments to post.";
  }

  const res = await octokitBot.rest.pulls.createReview({
    owner,
    repo,
    pull_number,
    commit_id,
    event: "COMMENT",
    comments: formattedComments,
  });

  return `✅ Review posted`;
}

export async function fetchExistingComments(owner, repo, pull_number) {
  try {
    const response = await octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number,
      per_page: 100,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch PR comments:", error.message);
    throw error;
  }
}

// Add this function to fetch file content
export async function fetchFileContent(owner, repo, ref, path) {
  return fetchRawFile(owner, repo, ref, path);
}
