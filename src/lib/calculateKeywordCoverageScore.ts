import { tokenizeForMatching } from "./tokenizeForMatching";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "with",
  "for",
  "from",
  "by",
  "is",
  "are",
  "be",
  "this",
  "that",
  "as",
  "at",
  "it",
  "we",
  "you",
  "your",
  "our",
]);

const DOMAIN_NOISE_WORDS = new Set([
  "qa",
  "looking",
  "seeking",
  "strong",
  "skills",
  "required",
  "requirements",
  "knowledge",
  "plus",
  "preferred",
  "experience",
  "engineer",
  "team",
  "job",
  "role",
  "position",
  "candidate",
  "responsible",
  "responsibilities",
  "ability",
  "abilities",
  "qualification",
  "qualifications",
  "minimum",
  "must",
  "should",
]);

function isNumericToken(token: string): boolean {
  return /^\d+$/.test(token);
}

export function calculateKeywordCoverageScore(params: {
  resumeText: string;
  jobDescriptionText: string;
}): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  consideredKeywords: string[];
} {
  const resumeTokens = tokenizeForMatching(params.resumeText).tokens;
  const jdTokens = tokenizeForMatching(params.jobDescriptionText).tokens;

  const resumeTokenSet = new Set(resumeTokens);

  const seenKeywords = new Set<string>();
  const consideredKeywords: string[] = [];

  for (const token of jdTokens) {
    if (token.length < 3) {
      continue;
    }

    if (STOPWORDS.has(token) || DOMAIN_NOISE_WORDS.has(token)) {
      continue;
    }

    if (isNumericToken(token)) {
      continue;
    }

    if (seenKeywords.has(token)) {
      continue;
    }

    seenKeywords.add(token);
    consideredKeywords.push(token);
  }

  const matchedKeywords = consideredKeywords.filter((keyword) =>
    resumeTokenSet.has(keyword),
  );
  const missingKeywords = consideredKeywords.filter(
    (keyword) => !resumeTokenSet.has(keyword),
  );

  if (consideredKeywords.length === 0) {
    return {
      score: 0,
      matchedKeywords,
      missingKeywords,
      consideredKeywords,
    };
  }

  const rawScore = (matchedKeywords.length / consideredKeywords.length) * 100;
  const roundedScore = Math.round(rawScore);
  const score = Math.min(100, Math.max(0, roundedScore));

  return {
    score,
    matchedKeywords,
    missingKeywords,
    consideredKeywords,
  };
}
