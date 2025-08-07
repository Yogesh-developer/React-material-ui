// contextParser.mjs
import path from "path";

/**
 * Parses all import statements from the given file content and resolves them to possible paths.
 * Returns a **deduplicated** list of imports.
 */
// Language-specific import patterns
const LANGUAGE_IMPORT_PATTERNS = {
  // JavaScript/TypeScript
  ".js": [
    /import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*['"]([^'"]+)['"]/g,
  ],
  ".jsx": [
    /import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*['"]([^'"]+)['"]/g,
  ],
  ".ts": [
    /import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*['"]([^'"]+)['"]/g,
  ],
  ".tsx": [
    /import\s+(?:[\w*\s{},]+)\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*['"]([^'"]+)['"]/g,
  ],

  // Python
  ".py": [/from\s+([\w.]+)\s+import\s+[\w*, ]+/g, /import\s+([\w.]+)/g],

  // Java
  ".java": [/import\s+(?:static\s+)?([\w.]+);/g],

  // C/C++
  ".c": [/#include\s+[<"]([^>"]+)[>"]/g],
  ".cpp": [/#include\s+[<"]([^>"]+)[>"]/g],
  ".h": [/#include\s+[<"]([^>"]+)[>"]/g],
  ".hpp": [/#include\s+[<"]([^>"]+)[>"]/g],

  // C#
  ".cs": [/using\s+([\w.]+);/g],

  // Go
  ".go": [/import\s+\(?\s*["]([^"]+)["]/g, /import\s+\(?\s*[`]([^`]+)[`]/g],

  // Ruby
  ".rb": [
    /require\s+["']([^"']+)["']/g,
    /require_relative\s+["']([^"']+)["']/g,
    /autoload\s+:\w+,\s+["']([^"']+)["']/g,
  ],

  // PHP
  ".php": [
    /require(?:_once)?\s*\(?\s*["']([^"']+)["']\s*\)?;/g,
    /include(?:_once)?\s*\(?\s*["']([^"']+)["']\s*\)?;/g,
    /use\s+([\w\\]+)(?:\s+as\s+\w+)?;/g,
  ],

  // Rust
  ".rs": [/use\s+([\w:{}, ]+);/g, /(?:pub\s+)?mod\s+(\w+);/g],

  // Swift
  ".swift": [/import\s+([\w.]+)/g],

  // Kotlin
  ".kt": [/import\s+([\w.]+)/g],

  // Dart
  ".dart": [/import\s+['"]([^'"]+)['"];/g],

  // Scala
  ".scala": [/import\s+([\w.]+)/g],

  // Haskell
  ".hs": [/import\s+(?:qualified\s+)?([\w.]+)/g],

  // Lua
  ".lua": [/require\s*\(?["']([^"']+)["']\)?/g],

  // Perl
  ".pl": [/use\s+([\w:]+)/g, /require\s+["']([^"']+)["']/g],

  // R
  ".r": [/source\(["']([^"']+)["']\)/g, /library\(["']([^"']+)["']\)/g],
};

/**
 * Parses import statements based on file type
 */
export function parseImports(fileContent, filePath) {
  const seenImportPaths = new Set();
  const imports = [];

  const ext = path.extname(filePath).toLowerCase();
  const patterns = LANGUAGE_IMPORT_PATTERNS[ext] || [];

  if (patterns.length === 0) {
    // Try to detect language from shebang for script files
    if (!ext) {
      const shebangMatch = fileContent.match(/^#!\s*[\/\w]+\/(\w+)/);
      if (shebangMatch) {
        const lang = shebangMatch[1].toLowerCase();
        if (lang === "python" || lang === "python3") {
          patterns.push(...LANGUAGE_IMPORT_PATTERNS[".py"]);
        } else if (lang === "ruby") {
          patterns.push(...LANGUAGE_IMPORT_PATTERNS[".rb"]);
        } else if (lang === "node" || lang === "nodejs") {
          patterns.push(...LANGUAGE_IMPORT_PATTERNS[".js"]);
        } else if (lang === "perl") {
          patterns.push(...LANGUAGE_IMPORT_PATTERNS[".pl"]);
        }
      }
    }
    return [];
  }

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
      // Different patterns capture different groups
      const importPath = match[1] || match[2];
      if (!importPath) continue;

      // Skip node_modules and absolute paths
      if (
        importPath.includes("node_modules") ||
        importPath.startsWith("/") ||
        importPath.includes("://")
      ) {
        continue;
      }

      if (seenImportPaths.has(importPath)) continue;
      seenImportPaths.add(importPath);

      const dir = path.dirname(filePath);
      let resolvedPath = importPath;

      // Handle relative paths
      if (importPath.startsWith(".")) {
        resolvedPath = path.join(dir, importPath);
      }

      // Handle different file extensions
      if (!path.extname(resolvedPath)) {
        // Add language-specific default extensions
        const defaultExtensions = getDefaultExtensions(ext);
        for (const ext of defaultExtensions) {
          const testPath = resolvedPath + ext;
          imports.push({
            importPath,
            path: testPath,
          });
        }
      } else {
        imports.push({
          importPath,
          path: resolvedPath,
        });
      }
    }
  }

  return imports;
}

function getDefaultExtensions(fileExt) {
  switch (fileExt) {
    case ".js":
    case ".jsx":
    case ".ts":
    case ".tsx":
      return [".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.ts"];
    case ".py":
      return [".py"];
    case ".java":
      return [".java"];
    case ".c":
    case ".cpp":
    case ".h":
    case ".hpp":
      return [".c", ".cpp", ".h", ".hpp"];
    case ".cs":
      return [".cs"];
    case ".go":
      return [".go"];
    case ".rb":
      return [".rb"];
    case ".php":
      return [".php"];
    case ".rs":
      return [".rs"];
    case ".swift":
      return [".swift"];
    case ".kt":
      return [".kt"];
    case ".dart":
      return [".dart"];
    case ".scala":
      return [".scala"];
    case ".hs":
      return [".hs"];
    case ".lua":
      return [".lua"];
    case ".pl":
      return [".pl"];
    case ".r":
      return [".r"];
    default:
      return [];
  }
}

export function findUsedFunctions(changedLines) {
  const usedFunctions = new Set();

  // Language-agnostic patterns
  const patterns = [
    /\b(\w+)\s*\(/g, // Function calls
    /\.\s*(\w+)\s*\(/g, // Method calls
    /(\w+)\s*::\s*\w+\s*\(/g, // C++/Ruby scope resolution
    /new\s+(\w+)\s*\(/g, // Constructor calls
    /@(\w+)\s*\(/g, // Python decorators
    /func\s+(\w+)\s*\(/g, // Go function definitions
    /def\s+(\w+)\s*\(/g, // Python function definitions
  ];

  for (const line of changedLines) {
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        usedFunctions.add(match[1]);
      }
    }
  }

  return Array.from(usedFunctions);
}

// Update function definition detection
export function getFunctionDefinition(identifier, fileContent) {
  const lines = fileContent.split("\n");

  // Language-agnostic function patterns
  const patterns = [
    `(?:function|def|func|fn|method)\\s+${identifier}\\b`, // JS/Python/Go/Rust
    `(?:class|struct|interface)\\s+${identifier}\\b`, // OOP classes
    `(?:val|var|let|const)\\s+${identifier}\\s*[=:]`, // Variables
    `#define\\s+${identifier}\\b`, // C macros
    `\\[\\s*${identifier}\\s*\\]\\s*=\\s*function`, // JS object methods
  ];

  let inFunction = false;
  let braceCount = 0;
  let collected = [];

  for (const line of lines) {
    if (!inFunction) {
      // Check against all patterns
      for (const pattern of patterns) {
        const regex = new RegExp(pattern);
        if (regex.test(line)) {
          inFunction = true;
          break;
        }
      }
    }

    if (inFunction) {
      collected.push(line);

      // Track braces for function body (works for most C-like languages)
      for (const char of line) {
        if (char === "{") braceCount++;
        else if (char === "}") braceCount--;
      }

      // Also check for Python-style function endings
      const isPythonEnd =
        braceCount === 0 && line.trim() === "" && collected.length > 1;

      if ((braceCount === 0 && collected.length > 1) || isPythonEnd) {
        break;
      }
    }
  }

  if (collected.length === 0) return null;

  return collected.join("\n");
}

// Check if function is defined in the diff
export function isFunctionInDiff(functionName, diffContent) {
  // Look for function definitions in the diff
  const patterns = [
    new RegExp(`\\bfunction\\s+${functionName}\\s*\\(`),
    new RegExp(`\\bconst\\s+${functionName}\\s*=\\s*(function|\\()`, "i"),
    new RegExp(`\\blet\\s+${functionName}\\s*=\\s*(function|\\()`, "i"),
    new RegExp(`\\bvar\\s+${functionName}\\s*=\\s*(function|\\()`, "i"),
    new RegExp(`\\bclass\\s+${functionName}\\b`),
  ];

  return patterns.some((pattern) => pattern.test(diffContent));
}
