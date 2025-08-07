export function getSettings(contextLines = null) {
  return {
    config: {
      patch_extension_skip_types: [".md", ".txt", ".json", ".yaml", ".yml"],
      allow_dynamic_context: true,
      max_extra_lines_before_dynamic_context: 8,
      patch_extra_lines_before: 3,
      patch_extra_lines_after: 1,
    },
  };
}
