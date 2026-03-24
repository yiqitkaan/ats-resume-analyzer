type ScoreBreakdown = {
  skillMatchScore: number;
  keywordCoverageScore: number;
  experienceAlignmentScore: number;
  structureScore: number;
  achievementScore: number;
};

type ScoreDetails = {
  experienceAlignment: {
    detectedResumeLevel: string | null;
    detectedJobLevel: string | null;
    reasoning: string;
  };
  structure: {
    detectedSections: string[];
    bulletCount: number;
    reasoning: string;
  };
  achievement: {
    numericSignalCount: number;
    actionSignalCount: number;
    reasoning: string;
  };
};

type SkillLike = {
  id: string;
  name: string;
  category: string;
};

function formatSkillExamples(skills: SkillLike[], limit = 3): string {
  const names = skills.slice(0, limit).map((skill) => skill.name);
  if (names.length === 0) {
    return "";
  }

  if (skills.length > limit) {
    return `${names.join(", ")} (+${skills.length - limit} more)`;
  }

  return names.join(", ");
}

function pickMainReason(params: {
  scoreBreakdown: ScoreBreakdown;
  missingSkillsCount: number;
  scoreDetails: ScoreDetails;
}): string {
  const { scoreBreakdown, missingSkillsCount, scoreDetails } = params;

  if (missingSkillsCount > 0 && scoreBreakdown.skillMatchScore < 70) {
    return "the current skill overlap with the job requirements is limited";
  }

  if (scoreBreakdown.keywordCoverageScore < 60) {
    return "the resume wording only partially reflects the job description language";
  }

  if (scoreBreakdown.experienceAlignmentScore < 70) {
    return scoreDetails.experienceAlignment.reasoning;
  }

  if (scoreBreakdown.structureScore >= 70 && scoreBreakdown.achievementScore >= 70) {
    return "the resume structure and achievement signals are consistently strong";
  }

  return "there is a balanced mix of matches and improvement areas across the scoring dimensions";
}

function buildOverallSummary(params: {
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  missingSkillsCount: number;
  scoreDetails: ScoreDetails;
}): string {
  const mainReason = pickMainReason({
    scoreBreakdown: params.scoreBreakdown,
    missingSkillsCount: params.missingSkillsCount,
    scoreDetails: params.scoreDetails,
  });

  if (params.finalScore >= 80) {
    return `Overall alignment is strong (${params.finalScore}/100), and ${mainReason}.`;
  }

  if (params.finalScore >= 60) {
    return `Overall alignment is good but not complete (${params.finalScore}/100), and ${mainReason}.`;
  }

  if (params.finalScore >= 40) {
    return `Overall alignment is partial (${params.finalScore}/100), and ${mainReason}.`;
  }

  return `Overall alignment is currently limited (${params.finalScore}/100), and ${mainReason}.`;
}

function ensureMinItems(
  list: string[],
  minItems: number,
  fallbackPool: string[],
  usedAcrossLists: Set<string>,
): string[] {
  const result = [...list];

  for (const fallback of fallbackPool) {
    if (result.length >= minItems) {
      break;
    }

    if (usedAcrossLists.has(fallback)) {
      continue;
    }

    usedAcrossLists.add(fallback);
    result.push(fallback);
  }

  return result;
}

export function buildDetailedExplanation(params: {
  finalScore: number;
  scoreBreakdown: {
    skillMatchScore: number;
    keywordCoverageScore: number;
    experienceAlignmentScore: number;
    structureScore: number;
    achievementScore: number;
  };
  scoreDetails: {
    experienceAlignment: {
      detectedResumeLevel: string | null;
      detectedJobLevel: string | null;
      reasoning: string;
    };
    structure: {
      detectedSections: string[];
      bulletCount: number;
      reasoning: string;
    };
    achievement: {
      numericSignalCount: number;
      actionSignalCount: number;
      reasoning: string;
    };
  };
  matchedSkills: Array<{ id: string; name: string; category: string }>;
  missingSkills: Array<{ id: string; name: string; category: string }>;
  extraSkills: Array<{ id: string; name: string; category: string }>;
}): {
  overallSummary: string;
  strengths: string[];
  mainGaps: string[];
  suggestedImprovements: string[];
} {
  const { finalScore, scoreBreakdown, scoreDetails, matchedSkills, missingSkills, extraSkills } =
    params;

  const overallSummary = buildOverallSummary({
    finalScore,
    scoreBreakdown,
    missingSkillsCount: missingSkills.length,
    scoreDetails,
  });

  const usedAcrossLists = new Set<string>();

  const strengthCandidates: string[] = [];
  if (scoreBreakdown.skillMatchScore >= 70) {
    strengthCandidates.push("Skill match score indicates strong alignment with the target role requirements.");
  }
  if (matchedSkills.length > 0) {
    strengthCandidates.push(
      `Matched skills include ${formatSkillExamples(matchedSkills)}, showing direct relevance to the role.`,
    );
  }
  if (scoreBreakdown.experienceAlignmentScore >= 80) {
    strengthCandidates.push(scoreDetails.experienceAlignment.reasoning);
  }
  if (scoreBreakdown.structureScore >= 70) {
    strengthCandidates.push(
      `Resume structure is clear with recognizable sections (${scoreDetails.structure.detectedSections.length}) and ${scoreDetails.structure.bulletCount} bullet points.`,
    );
  }
  if (scoreBreakdown.achievementScore >= 70) {
    strengthCandidates.push(
      `Achievement signals are solid, including ${scoreDetails.achievement.numericSignalCount} measurable items and ${scoreDetails.achievement.actionSignalCount} action-oriented indicators.`,
    );
  }
  if (scoreBreakdown.keywordCoverageScore >= 70) {
    strengthCandidates.push("Keyword coverage is strong enough to support ATS relevance for this job description.");
  }
  if (extraSkills.length > 0) {
    strengthCandidates.push(
      `Additional skills such as ${formatSkillExamples(extraSkills)} may provide useful breadth beyond core requirements.`,
    );
  }

  let strengths = strengthCandidates
    .filter((item) => {
      if (usedAcrossLists.has(item)) {
        return false;
      }
      usedAcrossLists.add(item);
      return true;
    })
    .slice(0, 5);

  strengths = ensureMinItems(
    strengths,
    2,
    [
      "Some role-relevant signals are present, but overall alignment is still limited.",
      "The resume contains a few relevant elements that can be strengthened further.",
    ],
    usedAcrossLists,
  ).slice(0, 5);

  const gapCandidates: string[] = [];
  if (missingSkills.length > 0) {
    if (scoreBreakdown.skillMatchScore >= 70) {
      gapCandidates.push(
        `A small remaining gap includes ${formatSkillExamples(missingSkills)}, which could further improve alignment.`,
      );
    } else {
      gapCandidates.push(
        `Missing priority skills include ${formatSkillExamples(missingSkills)}, which lowers direct role fit.`,
      );
    }
  }
  if (scoreBreakdown.skillMatchScore < 70) {
    gapCandidates.push("Overall skill overlap with the job requirements is still below the desired level.");
  }
  if (scoreBreakdown.keywordCoverageScore < 60) {
    gapCandidates.push("Keyword alignment is limited, reducing ATS keyword coverage against the job description.");
  }
  if (scoreBreakdown.experienceAlignmentScore < 70) {
    gapCandidates.push(scoreDetails.experienceAlignment.reasoning);
  }
  if (scoreBreakdown.structureScore < 60) {
    gapCandidates.push(scoreDetails.structure.reasoning);
  }
  if (scoreBreakdown.achievementScore < 60) {
    gapCandidates.push(scoreDetails.achievement.reasoning);
  }

  let mainGaps = gapCandidates
    .filter((item) => {
      if (usedAcrossLists.has(item)) {
        return false;
      }
      usedAcrossLists.add(item);
      return true;
    })
    .slice(0, 5);

  mainGaps = ensureMinItems(
    mainGaps,
    2,
    [
      "A few targeted improvements are still needed to maximize alignment with this role.",
      "The current profile is promising but not yet fully optimized for ATS matching.",
    ],
    usedAcrossLists,
  ).slice(0, 5);

  const improvementCandidates: string[] = [];
  if (missingSkills.length > 0 || scoreBreakdown.skillMatchScore < 70) {
    improvementCandidates.push(
      `Add missing skills only where you have real experience, especially ${formatSkillExamples(
        missingSkills,
      ) || "the most requested role-specific tools"}.`,
    );
  }
  if (scoreBreakdown.keywordCoverageScore < 70) {
    improvementCandidates.push(
      "Align wording with the job description by naturally reusing key requirement terms in work and project bullets.",
    );
  }
  if (scoreBreakdown.experienceAlignmentScore < 70) {
    improvementCandidates.push(
      "Clarify experience level with explicit scope, ownership, and years in the most relevant projects.",
    );
  }
  if (scoreBreakdown.structureScore < 70) {
    improvementCandidates.push(
      "Improve section clarity and bullet formatting so work experience, skills, and projects are easier for ATS parsing.",
    );
  }
  if (scoreBreakdown.achievementScore < 70) {
    improvementCandidates.push(
      "Add measurable outcomes (percentages, counts, impact metrics) to convert duty statements into achievement-focused bullets.",
    );
  }

  if (improvementCandidates.length === 0) {
    const lowestDimension = [
      { key: "skill", value: scoreBreakdown.skillMatchScore },
      { key: "keyword", value: scoreBreakdown.keywordCoverageScore },
      { key: "experience", value: scoreBreakdown.experienceAlignmentScore },
      { key: "structure", value: scoreBreakdown.structureScore },
      { key: "achievement", value: scoreBreakdown.achievementScore },
    ].sort((a, b) => a.value - b.value)[0]?.key;

    if (lowestDimension === "keyword") {
      improvementCandidates.push(
        "Keep refining keyword alignment by mirroring high-priority requirement terms in recent role bullets.",
      );
    } else if (lowestDimension === "experience") {
      improvementCandidates.push(
        "Strengthen experience framing with clearer level indicators and project ownership scope.",
      );
    } else if (lowestDimension === "structure") {
      improvementCandidates.push(
        "Further tighten section headings and bullet consistency to preserve ATS readability.",
      );
    } else if (lowestDimension === "achievement") {
      improvementCandidates.push(
        "Include one or two additional quantified outcomes to strengthen achievement evidence.",
      );
    } else {
      improvementCandidates.push(
        "Prioritize the most role-critical skills in project and work bullets to raise direct fit.",
      );
    }
  }

  let suggestedImprovements = improvementCandidates
    .filter((item) => {
      if (usedAcrossLists.has(item)) {
        return false;
      }
      usedAcrossLists.add(item);
      return true;
    })
    .slice(0, 5);

  suggestedImprovements = ensureMinItems(
    suggestedImprovements,
    2,
    [
      "Keep the resume tailored per role and update the top section with the most relevant technologies.",
      "Re-check every bullet for action + impact + context to improve ATS and recruiter readability.",
    ],
    usedAcrossLists,
  ).slice(0, 5);

  return {
    overallSummary,
    strengths,
    mainGaps,
    suggestedImprovements,
  };
}
