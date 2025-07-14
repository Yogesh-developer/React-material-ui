import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory
config({ path: path.resolve(__dirname, "../.env") });

const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME, PR_NUMBER } = process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function fetchExistingComments() {
  try {
    const response = await octokit.pulls.listReviewComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: Number(PR_NUMBER),
      per_page: 100,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch PR comments:", error.message);
    throw error;
  }
}
