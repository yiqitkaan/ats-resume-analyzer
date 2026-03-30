import { tokenizeForMatching } from "./tokenizeForMatching";
import type { PreprocessedTextData } from "../types/preprocessedText";
import { normalizeJobDescription } from "./normalizeJobDescription";

export function buildJobDescriptionPreprocessedData(
  originalText: string,
  preparedText: string,
): PreprocessedTextData {
  const safeOriginalText = String(originalText ?? "");
  const safePreparedInput = String(preparedText ?? "");
  const safePreparedText = normalizeJobDescription(safePreparedInput);

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
