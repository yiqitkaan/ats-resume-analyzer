const ACTION_WORDS = [
  "improved",
  "increased",
  "reduced",
  "achieved",
  "optimized",
  "strengthened",
  "ranked",
  "completed",
  "contributed",
  "delivered",
  "led",
  "implemented",
  "enhanced",
  "accelerated",
  "streamlined",
] as const;

const NUMERIC_PATTERNS = [
  /\b\d+(?:\.\d+)?\s?%/g, // 30%
  /\btop\s+\d+(?:\.\d+)?%?\b/g, // top 1%
  /\b\d+(?:,\d{3})*(?:\.\d+)?\s+out\s+of\s+\d+(?:,\d{3})*(?:\.\d+)?\b/g, // 87 out of 100
  /\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:million|billion|thousand|k|m)\b/g, // 3.2 million
  /\b\d+(?:,\d{3})*(?:\.\d+)?\s+(?:test\s+cases?|bugs?|issues?|projects?|features?|users?|clients?|releases?)\b/g, // 24 test cases
] as const;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function detectNumericSignals(text: string): string[] {
  const signals = new Set<string>();

  for (const pattern of NUMERIC_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      if (match[0]) {
        signals.add(match[0].trim());
      }
    }
  }

  return [...signals];
}

function detectActionSignals(lowercaseText: string): string[] {
  const signals = new Set<string>();

  for (const actionWord of ACTION_WORDS) {
    const pattern = new RegExp(`\\b${actionWord}\\b`, "g");
    if (pattern.test(lowercaseText)) {
      signals.add(actionWord);
    }
  }

  return [...signals];
}

function buildReasoning(numericSignalCount: number, actionSignalCount: number): string {
  if (numericSignalCount >= 2 && actionSignalCount >= 3) {
    return "Resume includes several measurable results and achievement-oriented action verbs.";
  }

  if (numericSignalCount >= 1 || actionSignalCount >= 2) {
    return "Resume includes some action-oriented language but limited measurable impact.";
  }

  return "Resume shows mostly generic duty descriptions with few measurable achievement signals.";
}

export function calculateAchievementScore(params: {
  resumeText: string;
}): {
  score: number;
  detectedAchievementSignals: string[];
  numericSignalCount: number;
  actionSignalCount: number;
  reasoning: string;
} {
  const normalizedText = params.resumeText.replace(/\s+/g, " ").trim();
  const lowercaseText = normalizedText.toLowerCase();

  const numericSignals = detectNumericSignals(lowercaseText);
  const actionSignals = detectActionSignals(lowercaseText);

  const numericSignalCount = numericSignals.length;
  const actionSignalCount = actionSignals.length;

  const numericScore = Math.min(numericSignalCount * 20, 65);
  const actionScore = Math.min(actionSignalCount * 10, 35);
  const score = clampScore(Math.round(numericScore + actionScore));

  const reasoning = buildReasoning(numericSignalCount, actionSignalCount);

  return {
    score,
    detectedAchievementSignals: [...numericSignals, ...actionSignals],
    numericSignalCount,
    actionSignalCount,
    reasoning,
  };
}
