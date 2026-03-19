const BULLET_LINE_REGEX = /^(?:[-*•●▪◦‣]|\d+[\).])\s+/;
const STRONG_PUNCTUATION_REGEX = /[.!?:]\s*$/;
const CONTINUATION_START_REGEX = /^["'(\[]?[a-z]/;
const YEAR_REGEX = /\b(?:19|20)\d{2}\b/;
const MONTH_REGEX =
  /\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/i;

function isBulletLine(line: string): boolean {
  return BULLET_LINE_REGEX.test(line);
}

function isUppercaseHeadingLike(line: string): boolean {
  if (line.length > 80) {
    return false;
  }

  const lettersOnly = line.replace(/[^A-Za-z\s&/-]/g, "").trim();
  if (!lettersOnly) {
    return false;
  }

  return /[A-Z]/.test(lettersOnly) && !/[a-z]/.test(lettersOnly);
}

function isLikelyDateLine(line: string): boolean {
  return YEAR_REGEX.test(line) && MONTH_REGEX.test(line);
}

function shouldMergeWithPrevious(previous: string, current: string): boolean {
  if (!previous || !current) {
    return false;
  }

  // Never merge when a new bullet item starts.
  if (isBulletLine(current)) {
    return false;
  }

  if (isUppercaseHeadingLike(previous) || isUppercaseHeadingLike(current)) {
    return false;
  }

  if (isLikelyDateLine(previous) || isLikelyDateLine(current)) {
    return false;
  }

  if (STRONG_PUNCTUATION_REGEX.test(previous)) {
    return false;
  }

  return CONTINUATION_START_REGEX.test(current);
}

export function refineResumeText(text: string): string {
  const lines = text.split("\n");
  const refinedLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      refinedLines.push("");
      continue;
    }

    if (refinedLines.length === 0) {
      refinedLines.push(line);
      continue;
    }

    const previous = refinedLines[refinedLines.length - 1];

    if (!previous || !shouldMergeWithPrevious(previous, line)) {
      refinedLines.push(line);
      continue;
    }

    const mergedLine = previous.endsWith("-")
      ? `${previous.slice(0, -1)}${line}`
      : `${previous} ${line}`;

    refinedLines[refinedLines.length - 1] = mergedLine
      .replace(/ {2,}/g, " ")
      .trim();
  }

  return refinedLines.join("\n").trim();
}
