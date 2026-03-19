import type { SkillDefinition } from "../data/skills/types";
import type { PreprocessedTextData } from "../types/preprocessedText";
import { tokenizeForMatching } from "./tokenizeForMatching";

export type Skill = SkillDefinition;

export type ExtractedSkill = {
  id: string;
  name: string;
  category: Skill["category"];
};

function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim().replace(/\s+/g, " ");
}

function getCandidateTerms(skill: Skill): string[] {
  const terms = [skill.name, ...(skill.synonyms ?? [])];
  return terms.map((term) => term.trim()).filter((term) => term.length > 0);
}

export function extractSkillsFromText(
  preprocessed: PreprocessedTextData,
  skills: Skill[],
): ExtractedSkill[] {
  const phraseSet = new Set(preprocessed.phrases.map(normalizeUnit));
  const tokenSet = new Set(preprocessed.tokens.map(normalizeUnit));

  const extracted: ExtractedSkill[] = [];
  const extractedIds = new Set<string>();

  // 1) Phrase-first matching (multi-word terms)
  for (const skill of skills) {
    if (extractedIds.has(skill.id)) {
      continue;
    }

    const terms = getCandidateTerms(skill);

    for (const term of terms) {
      const termTokens = tokenizeForMatching(term).tokens;
      if (termTokens.length < 2) {
        continue;
      }

      const normalizedPhrase = normalizeUnit(termTokens.join(" "));
      if (!phraseSet.has(normalizedPhrase)) {
        continue;
      }

      extracted.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
      });
      extractedIds.add(skill.id);
      break;
    }
  }

  // 2) Single-token matching
  for (const skill of skills) {
    if (extractedIds.has(skill.id)) {
      continue;
    }

    const terms = getCandidateTerms(skill);

    for (const term of terms) {
      const termTokens = tokenizeForMatching(term).tokens;
      if (termTokens.length !== 1) {
        continue;
      }

      const normalizedToken = normalizeUnit(termTokens[0]);
      if (!tokenSet.has(normalizedToken)) {
        continue;
      }

      extracted.push({
        id: skill.id,
        name: skill.name,
        category: skill.category,
      });
      extractedIds.add(skill.id);
      break;
    }
  }

  return extracted;
}
