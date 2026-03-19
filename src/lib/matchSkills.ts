import type { ExtractedSkill } from "./extractSkillsFromText";

function buildSkillMap(skills: ExtractedSkill[]): Map<string, ExtractedSkill> {
  const map = new Map<string, ExtractedSkill>();

  for (const skill of skills) {
    if (!map.has(skill.id)) {
      map.set(skill.id, skill);
    }
  }

  return map;
}

export function matchSkills(
  resumeSkills: ExtractedSkill[],
  jdSkills: ExtractedSkill[],
): {
  matchedSkills: ExtractedSkill[];
  missingSkills: ExtractedSkill[];
  extraSkills: ExtractedSkill[];
} {
  const resumeMap = buildSkillMap(resumeSkills);
  const jdMap = buildSkillMap(jdSkills);

  const matchedSkills: ExtractedSkill[] = [];
  const missingSkills: ExtractedSkill[] = [];
  const extraSkills: ExtractedSkill[] = [];

  for (const [id, jdSkill] of jdMap) {
    if (resumeMap.has(id)) {
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  }

  for (const [id, resumeSkill] of resumeMap) {
    if (!jdMap.has(id)) {
      extraSkills.push(resumeSkill);
    }
  }

  return {
    matchedSkills,
    missingSkills,
    extraSkills,
  };
}
