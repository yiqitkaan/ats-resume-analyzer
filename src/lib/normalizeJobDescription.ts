export function normalizeJobDescription(text: string): string {
  const safeInput = String(text ?? "");

  try {
    return safeInput
      .replace(/[()\[\]{}\/.,:–—\-+]/g, " ")
      .replace(/[-–—/.,:+()[\]{}]{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return safeInput.replace(/\s+/g, " ").trim();
  }
}
