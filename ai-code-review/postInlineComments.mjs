import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

const MyOctokit = Octokit.plugin(restEndpointMethods, paginateRest);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
config({ path: path.resolve(__dirname, "../.env") });

const {
  GITHUB_APP_ID,
  GITHUB_INSTALLATION_ID,
  REPO_OWNER,
  REPO_NAME,
  PR_NUMBER,
  APP_PRIVATE_KEY,
} = process.env;

// ✅ Initialize Octokit using GitHub App authentication
const octokit = new MyOctokit({
  authStrategy: createAppAuth,
  auth: {
    appId: GITHUB_APP_ID,
    privateKey: APP_PRIVATE_KEY,
    installationId: GITHUB_INSTALLATION_ID,
  },
});

// ✅ Post inline review comments
export async function postInlineReview(comments) {
  const validComments = comments.filter(
    (c) => c.path && typeof c.position === "number" && c.body
  );

  if (validComments.length === 0) {
    console.warn("⚠️ No valid inline comments to post. Skipping.");
    return;
  }

  try {
    const res = await octokit.rest.pulls.createReview({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: Number(PR_NUMBER),
      event: "COMMENT",
      comments: validComments,
    });

    console.log("✅ Inline comments posted via GitHub App.");
  } catch (err) {
    console.error(
      "❌ Failed to post inline comments via GitHub App:",
      err.message
    );
    console.error("More details:", err.response?.data || err);
    throw err;
  }
}
