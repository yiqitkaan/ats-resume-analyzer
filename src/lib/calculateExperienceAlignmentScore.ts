type SimplifiedLevel = "intern" | "junior" | "mid" | "senior";

const LEVEL_ORDER: SimplifiedLevel[] = ["intern", "junior", "mid", "senior"];

const EXPLICIT_LEVEL_PATTERNS: Array<{
  level: SimplifiedLevel;
  pattern: RegExp;
}> = [
  { level: "intern", pattern: /\bintern(ship)?\b/ },
  { level: "junior", pattern: /\bjunior\b|\bentry\s*level\b/ },
  { level: "mid", pattern: /\bmid(?:\s|-)?level\b|\bintermediate\b/ },
  { level: "senior", pattern: /\bsenior\b|\blead\b|\bprincipal\b/ },
];

function getLevelIndex(level: SimplifiedLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

function getYearsFromText(text: string): number | null {
  const yearPattern = /(\d+)\s*(?:\+|plus)?\s*(?:years?|yrs?)/g;
  const years: number[] = [];

  for (const match of text.matchAll(yearPattern)) {
    const parsed = Number.parseInt(match[1], 10);
    if (!Number.isNaN(parsed)) {
      years.push(parsed);
    }
  }

  if (years.length === 0) {
    return null;
  }

  return Math.max(...years);
}

function mapYearsToLevel(years: number): SimplifiedLevel {
  if (years <= 1) {
    return "intern";
  }

  if (years === 2) {
    return "junior";
  }

  if (years <= 4) {
    return "mid";
  }

  return "senior";
}

function detectLevel(text: string): SimplifiedLevel | null {
  const normalized = text.toLowerCase();

  let explicitLevel: SimplifiedLevel | null = null;
  for (const { level, pattern } of EXPLICIT_LEVEL_PATTERNS) {
    if (!pattern.test(normalized)) {
      continue;
    }

    if (
      !explicitLevel ||
      getLevelIndex(level) > getLevelIndex(explicitLevel)
    ) {
      explicitLevel = level;
    }
  }

  const years = getYearsFromText(normalized);
  const yearsLevel = years !== null ? mapYearsToLevel(years) : null;

  if (explicitLevel && yearsLevel) {
    return getLevelIndex(explicitLevel) >= getLevelIndex(yearsLevel)
      ? explicitLevel
      : yearsLevel;
  }

  return explicitLevel ?? yearsLevel;
}

function getLevelLabel(level: SimplifiedLevel): string {
  if (level === "intern") {
    return "intern";
  }

  if (level === "junior") {
    return "junior";
  }

  if (level === "mid") {
    return "mid";
  }

  return "senior";
}

export function calculateExperienceAlignmentScore(params: {
  resumeText: string;
  jobDescriptionText: string;
}): {
  score: number;
  detectedResumeLevel: string | null;
  detectedJobLevel: string | null;
  reasoning: string;
} {
  const detectedJobLevel = detectLevel(params.jobDescriptionText);
  const detectedResumeLevel = detectLevel(params.resumeText);

  if (!detectedJobLevel && !detectedResumeLevel) {
    return {
      score: 100,
      detectedResumeLevel: null,
      detectedJobLevel: null,
      reasoning:
        "No explicit experience requirement found in the job description or resume.",
    };
  }

  if (!detectedJobLevel) {
    return {
      score: 100,
      detectedResumeLevel,
      detectedJobLevel: null,
      reasoning: "No explicit experience requirement found in the job description.",
    };
  }

  if (!detectedResumeLevel) {
    return {
      score: 50,
      detectedResumeLevel: null,
      detectedJobLevel,
      reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level, but the resume does not provide clear experience-level signals.`,
    };
  }

  const jobIndex = getLevelIndex(detectedJobLevel);
  const resumeIndex = getLevelIndex(detectedResumeLevel);
  const difference = resumeIndex - jobIndex;

  if (difference === 0) {
    return {
      score: 95,
      detectedResumeLevel,
      detectedJobLevel,
      reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level and the resume also indicates ${getLevelLabel(detectedResumeLevel)}-level experience.`,
    };
  }

  if (difference > 0) {
    if (difference === 1) {
      return {
        score: 90,
        detectedResumeLevel,
        detectedJobLevel,
        reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level and the resume appears slightly more senior (${getLevelLabel(detectedResumeLevel)}).`,
      };
    }

    return {
      score: 80,
      detectedResumeLevel,
      detectedJobLevel,
      reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level and the resume appears significantly more senior (${getLevelLabel(detectedResumeLevel)}).`,
    };
  }

  if (difference === -1) {
    return {
      score: 65,
      detectedResumeLevel,
      detectedJobLevel,
      reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level but the resume appears one level lower (${getLevelLabel(detectedResumeLevel)}).`,
    };
  }

  return {
    score: 35,
    detectedResumeLevel,
    detectedJobLevel,
    reasoning: `Job description expects ${getLevelLabel(detectedJobLevel)} level but the resume appears much lower (${getLevelLabel(detectedResumeLevel)}).`,
  };
}
