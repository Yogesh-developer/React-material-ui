import { Octokit } from "@octokit/rest";
import simpleGit from "simple-git";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

const {
  GITHUB_TOKEN,
  REPO_OWNER,
  REPO_NAME,
  PR_NUMBER,
  BASE_REF = "main",
} = process.env;

const git = simpleGit();
const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getChangedFileVersions() {
  if (!REPO_OWNER || !REPO_NAME || !PR_NUMBER) {
    throw new Error("❌ Missing GitHub env vars");
  }

  const { data: files } = await octokit.pulls.listFiles({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: Number(PR_NUMBER),
  });

  const results = [];

  for (const file of files) {
    const { filename, status, patch } = file;

    if (status === "removed" || !patch) {
      console.warn(`⚠️ Skipping removed or empty file: ${filename}`);
      continue;
    }

    let oldCode = null;
    let newCode = null;

    // Get old code from BASE_REF (e.g., main)
    try {
      if (status !== "added") {
        oldCode = await git.show([`${BASE_REF}:${filename}`]);
      }
    } catch {
      console.warn(
        `⚠️ Could not read old version of ${filename} from ${BASE_REF}`
      );
    }

    // Get new code from working directory first
    try {
      newCode = await fs.readFile(filename, "utf8");
    } catch {
      // Fallback: try to get from HEAD
      try {
        newCode = await git.show([`HEAD:${filename}`]);
      } catch {
        console.warn(`❌ Could not read ${filename} from local or HEAD`);
        continue; // skip this file if we can't read new code
      }
    }

    results.push({
      file: filename,
      patch,
      oldCode,
      newCode,
      status,
    });
  }

  return results;
}
