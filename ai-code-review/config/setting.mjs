export function getSettings(contextLines = null) {
  return {
    config: {
      patch_extension_skip_types: [".md", ".txt"],
      allow_dynamic_context: true,
      max_extra_lines_before_dynamic_context: 8,
      patch_extra_lines_before: 3,
      patch_extra_lines_after: 1,
    },
    max_hunks: 20,
    max_patch_bytes: 250000,
    max_line_length: 1000,
    min_line_length: 3,
    max_lines: 5000,
    context_lines: contextLines !== null ? contextLines : 10,
  };
}
