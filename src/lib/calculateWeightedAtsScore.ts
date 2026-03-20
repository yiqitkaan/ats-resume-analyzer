const WEIGHTS = {
  skillMatch: 50,
  keywordCoverage: 15,
  experienceAlignment: 15,
  structure: 10,
  achievement: 10,
} as const;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function calculateWeightedAtsScore(params: {
  skillMatchScore: number;
  keywordCoverageScore: number;
  experienceAlignmentScore: number;
  structureScore: number;
  achievementScore: number;
}): {
  finalScore: number;
  weights: {
    skillMatch: number;
    keywordCoverage: number;
    experienceAlignment: number;
    structure: number;
    achievement: number;
  };
  reasoning: string;
} {
  const weightedSum =
    params.skillMatchScore * (WEIGHTS.skillMatch / 100) +
    params.keywordCoverageScore * (WEIGHTS.keywordCoverage / 100) +
    params.experienceAlignmentScore * (WEIGHTS.experienceAlignment / 100) +
    params.structureScore * (WEIGHTS.structure / 100) +
    params.achievementScore * (WEIGHTS.achievement / 100);

  const finalScore = clampScore(Math.round(weightedSum));

  return {
    finalScore,
    weights: { ...WEIGHTS },
    reasoning:
      "Final ATS score is calculated as a weighted combination of skill match, keyword coverage, experience alignment, structure, and achievement signals.",
  };
}
