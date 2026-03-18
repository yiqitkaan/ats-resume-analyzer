export function cleanResumeText(text: string): string {
  return text
    .replace(/^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gim, "")
    .replace(/\t/g, " ")
    .replace(/[\uE000-\uF8FF]/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
