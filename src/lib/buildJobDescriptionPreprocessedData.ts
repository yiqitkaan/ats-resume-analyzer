import { tokenizeForMatching } from "./tokenizeForMatching";
import type { PreprocessedTextData } from "../types/preprocessedText";

export function buildJobDescriptionPreprocessedData(
  originalText: string,
  preparedText: string,
): PreprocessedTextData {
  const safeOriginalText = String(originalText ?? "");
  const safePreparedInput = String(preparedText ?? "");

  let safePreparedText = "";
  try {
    safePreparedText = safePreparedInput
      .replace(/[()\[\]{}\/.,:–—\-+]/g, " ")
      .replace(/[-–—/.,:+()[\]{}]{2,}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    safePreparedText = safePreparedInput.replace(/\s+/g, " ").trim();
  }

  try {
    const { tokens, phrases } = tokenizeForMatching(safePreparedText);

    return {
      originalText: safeOriginalText,
      preparedText: safePreparedText,
      tokens,
      phrases,
    };
  } catch {
    const tokens = safePreparedText
      .toLowerCase()
      .split(" ")
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    const phrases: string[] = [];
    for (let index = 0; index < tokens.length - 1; index += 1) {
      phrases.push(`${tokens[index]} ${tokens[index + 1]}`);
    }

    return {
      originalText: safeOriginalText,
      preparedText: safePreparedText,
      tokens,
      phrases,
    };
  }
}
