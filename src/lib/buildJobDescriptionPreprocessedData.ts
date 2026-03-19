import { tokenizeForMatching } from "./tokenizeForMatching";
import type { PreprocessedTextData } from "../types/preprocessedText";

export function buildJobDescriptionPreprocessedData(
  originalText: string,
  preparedText: string,
): PreprocessedTextData {
  const { tokens, phrases } = tokenizeForMatching(preparedText);

  return {
    originalText,
    preparedText,
    tokens,
    phrases,
  };
}
