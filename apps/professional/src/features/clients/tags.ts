export function parseTagsInput(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .slice(0, 20);
}

export function formatTagsInput(tags: string[]): string {
  return tags.join(', ');
}
