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
  fetchFileContent,
} from "./fetchPRFiles.mjs";
import { buildFullContextDiff } from "./buildFullContextDiff.mjs";
import { getSettings } from "./config/setting.mjs";
import { getLLMReview } from "./reviewWithAi.mjs";
import { buildReviewPrompt } from "./prReviewPrompt.mjs";
import { parseYamlComments } from "./parseAIFeedback.mjs";
import { removeDuplicateComments } from "./commentFilter.mjs";
import {
  parseImports,
  findUsedFunctions,
  isFunctionInDiff,
  getFunctionDefinition,
} from "./contextParser.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../.env") });

const { REPO_OWNER, REPO_NAME, PR_NUMBER } = process.env;

function deduplicateImports(imports) {
  const seen = new Set();
  return imports.filter((imp) => {
    if (seen.has(imp.path)) return false;
    seen.add(imp.path);
    return true;
  });
}

function isLikelyUserFunction(name) {
  if (!name) return false;

  const stdlibIgnore = [
    "console",
    "print",
    "printf",
    "println",
    "main",
    "toString",
    "equals",
    "hashCode",
    "window",
    "document",
    "JSON",
    "Math",
  ];

  return !stdlibIgnore.includes(name);
}

export async function getCrossFileContext(
  file,
  newFileCode,
  changedLines,
  diffContent,
  owner,
  repo,
  ref
) {
  let context = "";

  const rawImports = parseImports(newFileCode, file.filename);
  const uniqueImports = deduplicateImports(rawImports);

  const usedFunctions = findUsedFunctions(changedLines);

  const functionsToFetch = usedFunctions.filter(
    (func) => !isFunctionInDiff(func, diffContent) && isLikelyUserFunction(func)
  );

  const extensionsToTry = [
    "",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".hpp",
    ".cs",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".swift",
    ".kt",
    ".dart",
    ".scala",
    ".hs",
    ".lua",
    ".pl",
    ".r",
    "/index.js",
    "/index.ts",
    "/__init__.py",
  ];

  for (const imp of uniqueImports) {
    for (const ext of extensionsToTry) {
      const fullPath = imp.path + ext;
      const importedContent = await fetchFileContent(
        owner,
        repo,
        ref,
        fullPath
      );
      if (!importedContent) continue;

      for (const func of functionsToFetch) {
        const def = getFunctionDefinition(func, importedContent);
        if (def) {
          context += `\n// Context from ${fullPath} - ${func}\n`;
          context += def + "\n";
        }
      }

      break; // Stop after first valid extension match
    }
  }

  return context;
}

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

    // Get changed lines for context analysis
    const changedLines = file.patch
      .split("\n")
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .map((line) => line.substring(1));

    // Get cross-file context
    const crossFileContext = await getCrossFileContext(
      file,
      newFileCode,
      changedLines,
      file.patch,
      owner,
      repo,
      prData.head.ref
    );
    console.log(
      "buildReviewPrompt",
      buildReviewPrompt(extendedPatch, crossFileContext)
    );
    // const review = await getLLMReview(
    //   buildReviewPrompt(extendedPatch, crossFileContext)
    // );

    // const comments = parseYamlComments(review);
    // const commentLocations = getInlineCommentLocations(extendedPatch, comments);
    // const existingComments = await fetchExistingComments(
    //   REPO_OWNER,
    //   REPO_NAME,
    //   PR_NUMBER
    // );

    // const finalComments = removeDuplicateComments(
    //   commentLocations,
    //   existingComments,
    //   file.filename
    // );

    // const commit_id = await getLatestCommitSha(
    //   REPO_OWNER,
    //   REPO_NAME,
    //   PR_NUMBER
    // );

    // const res = await createReviewWithComments({
    //   owner: REPO_OWNER,
    //   repo: REPO_NAME,
    //   pull_number: PR_NUMBER,
    //   comments: finalComments,
    //   commit_id,
    //   file_path: file.filename,
    // });
    // console.log(res);
  }
}

(async () => {
  await reviewPullRequest({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    pull_number: PR_NUMBER,
  });
})();
