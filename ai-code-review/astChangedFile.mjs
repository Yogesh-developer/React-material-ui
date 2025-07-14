import fs from "fs";
import * as babelParser from "@babel/parser";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;

/**
 * Step 1: Extract changed line ranges from Git diff
 */
function extractChangedLineBlocksFromPatch(patch) {
  const lines = patch.split("\n");
  const changedLines = [];

  let newLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("@@")) {
      const match = /@@ -\d+(,\d+)? \+(\d+)(,(\d+))? @@/.exec(line);
      if (match) {
        newLine = parseInt(match[2], 10);
      }
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("++")) {
      changedLines.push(newLine);
    }

    if (!line.startsWith("-")) {
      newLine++;
    }
  }

  return groupConsecutiveLines(changedLines);
}

function groupConsecutiveLines(lines) {
  const blocks = [];
  let current = [];

  for (let i = 0; i < lines.length; i++) {
    if (current.length === 0 || lines[i] === current[current.length - 1] + 1) {
      current.push(lines[i]);
    } else {
      blocks.push(current);
      current = [lines[i]];
    }
  }

  if (current.length) blocks.push(current);
  return blocks;
}

/**
 * Step 2: Parse code and find parent node for each changed block
 */
function findParentNodeForLines(ast, startLine, endLine) {
  let bestMatch = null;

  traverse(ast, {
    enter(path) {
      const { start, end } = path.node.loc || {};
      if (!start || !end) return;

      if (start.line <= startLine && end.line >= endLine) {
        if (!bestMatch) {
          bestMatch = path.node;
        } else {
          const prevRange = bestMatch.loc.end.line - bestMatch.loc.start.line;
          const newRange = end.line - start.line;
          if (newRange < prevRange) {
            bestMatch = path.node;
          }
        }
      }
    },
  });

  return bestMatch;
}

/**
 * Step 3: Extract changed blocks and their parent context
 */
export function extractChangedFunctionsFromFile(patch, newCode, filePath = "") {
  const lineBlocks = extractChangedLineBlocksFromPatch(patch);
  const ast = babelParser.parse(newCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
  const codeLines = newCode.split("\n");

  const blocks = lineBlocks.map((block) => {
    const startLine = block[0];
    const endLine = block[block.length - 1];

    // Add line numbers to changed code lines
    const changedCode = codeLines
      .slice(startLine - 1, endLine)
      .map((line, index) => `${startLine + index} | ${line}`)
      .join("\n");

    const parentNode = findParentNodeForLines(ast, startLine, endLine);
    const contextCode = parentNode
      ? newCode.slice(parentNode.start, parentNode.end)
      : "";

    return {
      file: filePath,
      lines: block,
      startLine,
      endLine,
      changedCode, // ✅ With line numbers
      contextCode,
    };
  });

  return blocks;
}
