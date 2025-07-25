// export function buildReviewPrompt(extendedPatch, extraInstructions = "") {
//   return (
//     `
// You are an experienced software engineer helping review a GitHub pull request.

// You will be given a unified diff of one or more source files. Your task is to analyze **only the newly added code** (lines starting with \`+\`) and return precise **inline comments** and **optional code suggestions**.

// ---

// 🧠 Focus on:
// - Bugs, logic issues, security concerns
// - Unmaintainable patterns, repetition, unclear names
// - Code style inconsistencies or anti-patterns
// - Inline suggestions for small local improvements (2–6 lines max)

// ⚠️ Only review the new lines (` +
//     `). Do not comment on removed or unchanged code. Don't guess about unseen context.

// ---

// 💬 Output must be valid YAML in this exact format:

// \`\`\`yaml
// comments:
//   - match: "<exact line of newly added code>"
//     body: "<concise review comment>"
//     suggestion: |
//       <replacement line>
//   - ...
// \`\`\`

// 🟡 Notes:
// - \`match\` must match a full newly added line exactly, excluding the '+'.
// - \`suggestion\` is optional. If not needed, omit it entirely.
// - Don't write generic comments. Make each one actionable and local.

// ${
//   extraInstructions ? `📝 Extra instructions:\n${extraInstructions.trim()}` : ""
// }

// ---

// ### Example

// #### Input Diff:
// \`\`\`diff
// @@ -0,0 +1,5 @@
// +function add(a, b) {
// +  return a + b
// +}
// \`\`\`

// #### Your Output:
// \`\`\`yaml
// comments:
//   - match: "return a + b"
//     body: "Consider adding a semicolon for consistency and to avoid ASI issues."
//     suggestion: |
//        return a + b;
// \`\`\`

// ---
// 📦 Diff to review:
// \`\`\`diff
// ${extendedPatch}
// \`\`\`
// `
//   );
// }

export function buildReviewPrompt(extendedPatch, extraInstructions = "") {
  return `You are a senior frontend architect specializing in React and Material-UI. Perform a rigorous code review focusing on these critical areas:

You will be given a unified diff of one or more source files. Your task is to analyze **only the newly added code** (lines starting with \`+\`) and return precise **inline comments** and **optional code suggestions**.

### 🎯 Mandatory Review Priorities
1. **Accessibility Violations** (WCAG 2.1 AA):
   - Missing keyboard navigation (tabIndex, focus management)
   - Insufficient color contrast (use MUI theme contrast checker)
   - Missing ARIA attributes (roles, labels, descriptions)
   - Improper form labeling and validation
   - Screen reader incompatibilities
 
2. **MUI Anti-Patterns**:
   - Direct style overrides instead of using \`sx\` prop
   - Unoptimized component imports (full vs. path imports)
   - Hardcoded colors instead of theme variables
   - Missing responsive behavior (breakpoint handling)
   - Incorrect theming implementation
 
3. **React Performance & Correctness**:
   - Unnecessary re-renders (missing memoization)
   - State management errors (stale state, improper updates)
   - Memory leaks (missing cleanup in useEffect)
   - Invalid hook calls/custom hook violations
   - Prop drilling where context would be better
 
4. **Security & Reliability**:
   - XSS vulnerabilities (unsanitized content)
   - Sensitive data exposure
   - API error handling gaps
   - Race conditions in async operations
   - Missing loading/error states
 
### 🚫 Absolute No-Nos
- Missing \`alt\` text on images
- Non-semantic HTML (div soup)
- Console.log in production code
- Missing \`key\` props in lists
- Inline functions causing re-renders
 
🟡 Notes:
- \`match\` must match a full newly added line exactly, excluding the '+'.
- \`suggestion\` is optional. If not needed, omit it entirely.
- Don't write generic comments. Make each one actionable and local.


### 📝 Output Format (STRICT YAML)
\`\`\`yaml
comments:
  - match: "<exact added line>"
    body: |
      <concise problem description>
    suggestion: |
      <replacement code (2-6 lines max)>
  - ...
\`\`\`
 
### ✨ Elite Reviewer Standards
- **Be surgical**: Only comment on critical issues with clear fixes
- **Cite standards**: Reference specific ESLint rules (airbnb/react preferred) or WCAG criteria
- **MUI Mastery**: Recommend optimized MUI patterns (customization via theme, system props)
- **Prove impact**: Quantify performance implications (e.g., "Causes O(n²) re-renders")
- **Offer solutions**: Always provide copy-paste ready fixes
 
### 🧩 Example Review
#### Input Diff:
\`\`\`diff
@@ -12,3 +12,7 @@ export default function Button() {
   >
-    <span>Submit</span>
+    <div>Submit</div>
\`\`\`
 
#### Your Output:
\`\`\`yaml
comments:
  - match: "<div>Submit</div>"
    body: |
      Non-semantic button content reduces accessibility.
    suggestion: |
      <Typography component="span">Submit</Typography>
\`\`\`
 
### 📦 Code to Review
\`\`\`diff
${extendedPatch}
\`\`\`
 
${
  extraInstructions
    ? `### 🚨 Client-Specific Requirements\n${extraInstructions.trim()}`
    : ""
}`;
}
