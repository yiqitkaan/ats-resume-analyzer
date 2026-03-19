import type { SkillDefinition } from "../data/skills/types";
import type { ExtractedSkill } from "./extractSkillsFromText";

function dedupeById(skills: ExtractedSkill[]): ExtractedSkill[] {
  const seen = new Set<string>();
  const deduped: ExtractedSkill[] = [];

  for (const skill of skills) {
    if (seen.has(skill.id)) {
      continue;
    }

    seen.add(skill.id);
    deduped.push(skill);
  }

  return deduped;
}

export function refineSkillResults(
  skills: ExtractedSkill[],
  skillDictionary: SkillDefinition[],
): ExtractedSkill[] {
  const uniqueSkills = dedupeById(skills);
  const presentIds = new Set(uniqueSkills.map((skill) => skill.id));

  const dictionaryById = new Map(
    skillDictionary.map((skill) => [skill.id, skill]),
  );

  const parentIdsToRemove = new Set<string>();

  for (const skill of uniqueSkills) {
    const parentId = dictionaryById.get(skill.id)?.parentId;

    if (parentId && presentIds.has(parentId)) {
      parentIdsToRemove.add(parentId);
    }
  }

  return uniqueSkills.filter((skill) => !parentIdsToRemove.has(skill.id));
}
