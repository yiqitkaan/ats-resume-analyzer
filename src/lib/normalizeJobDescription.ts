export function normalizeJobDescription(text: string): string {
  return text
    .trim()
    .replace(/\t/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}
