export function calculateAtsScore(params: {
  matchedSkillsCount: number;
  totalJdSkillsCount: number;
}): number {
  const { matchedSkillsCount, totalJdSkillsCount } = params;

  if (totalJdSkillsCount <= 0) {
    return 0;
  }

  const rawScore = (matchedSkillsCount / totalJdSkillsCount) * 100;
  const roundedScore = Math.round(rawScore);

  return Math.min(100, Math.max(0, roundedScore));
}
