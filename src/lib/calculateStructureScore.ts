const SECTION_CANDIDATES = [
  "WORK EXPERIENCE",
  "EDUCATION",
  "EDUCATION AND TRAINING",
  "SKILLS",
  "LANGUAGE SKILLS",
  "HONOURS AND AWARDS",
  "EXAMINATIONS",
  "PROJECTS",
  "CERTIFICATIONS",
] as const;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function getSectionScore(sectionCount: number): number {
  return Math.min(sectionCount * 12, 48);
}

function getBulletScore(bulletCount: number): number {
  if (bulletCount >= 6) {
    return 25;
  }

  if (bulletCount >= 3) {
    return 18;
  }

  if (bulletCount >= 1) {
    return 10;
  }

  return 0;
}

function getLengthScore(textLength: number): number {
  if (textLength >= 2500) {
    return 25;
  }

  if (textLength >= 1500) {
    return 20;
  }

  if (textLength >= 800) {
    return 14;
  }

  if (textLength >= 400) {
    return 8;
  }

  if (textLength >= 200) {
    return 4;
  }

  if (textLength >= 120) {
    return 2;
  }

  if (textLength >= 80) {
    return 1;
  }

  return 0;
}

function buildReasoning(params: {
  detectedSectionsCount: number;
  bulletCount: number;
  textLength: number;
}): string {
  const { detectedSectionsCount, bulletCount, textLength } = params;

  if (detectedSectionsCount >= 3 && bulletCount >= 3) {
    return "Resume includes multiple recognizable sections and bullet-based descriptions.";
  }

  if (detectedSectionsCount >= 2 || bulletCount >= 1 || textLength >= 400) {
    return "Resume has some visible structure but could be improved with clearer sections or more bullet-based formatting.";
  }

  return "Resume has limited visible structure and few ATS-friendly formatting signals.";
}

export function calculateStructureScore(params: {
  resumeText: string;
}): {
  score: number;
  detectedSections: string[];
  bulletCount: number;
  reasoning: string;
} {
  const lines = params.resumeText.split(/\r?\n/);

  const headingLikeLines = lines
    .map((line) => line.trim().replace(/[:\s]+$/g, "").toUpperCase())
    .filter((line) => line.length > 0 && line.length <= 60);

  const detectedSections = SECTION_CANDIDATES.filter((section) =>
    headingLikeLines.includes(section),
  );

  const bulletCount = lines.reduce((count, line) => {
    const trimmed = line.trim();
    return /^[•*-]\s+/.test(trimmed) ? count + 1 : count;
  }, 0);

  const sectionScore = getSectionScore(detectedSections.length);
  const bulletScore = getBulletScore(bulletCount);
  const lengthScore = getLengthScore(params.resumeText.trim().length);

  const rawScore = sectionScore + bulletScore + lengthScore;
  const score = clampScore(rawScore);

  const reasoning = buildReasoning({
    detectedSectionsCount: detectedSections.length,
    bulletCount,
    textLength: params.resumeText.trim().length,
  });

  return {
    score,
    detectedSections: [...detectedSections],
    bulletCount,
    reasoning,
  };
}
