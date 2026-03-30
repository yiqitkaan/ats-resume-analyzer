export function normalizeJobDescription(text: string): string {
  const safeInput = String(text ?? "");

  try {
    const unicodeNormalized = safeInput.normalize("NFKC");

    return unicodeNormalized
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/[\uD800-\uDFFF]/g, " ")
      .replace(/[()\[\]{}\/.,:–—\-+]/g, " ")
      .replace(/[-–—/.,:+()[\]{}]{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return safeInput.replace(/\s+/g, " ").trim();
  }
}
