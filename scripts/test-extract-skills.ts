import { skillDictionary } from "../src/data/skills/skills";
import {
  extractSkillsFromText,
  type ExtractedSkill,
} from "../src/lib/extractSkillsFromText";
import { tokenizeForMatching } from "../src/lib/tokenizeForMatching";
import type { PreprocessedTextData } from "../src/types/preprocessedText";

const sampleText =
  "Built React Native screens with React hooks, automated API testing with Selenium WebDriver, and set up CI/CD using GitHub Actions. Also worked with PostgreSQL and AWS Lambda.";

const tokenized = tokenizeForMatching(sampleText);

const preprocessed: PreprocessedTextData = {
  originalText: sampleText,
  preparedText: sampleText,
  tokens: tokenized.tokens,
  phrases: tokenized.phrases,
};

const extracted = extractSkillsFromText(preprocessed, skillDictionary);

function formatSkill(skill: ExtractedSkill): string {
  return `- ${skill.name} (${skill.category}) [${skill.id}]`;
}

console.log("=== EXTRACTED SKILLS ===");
if (extracted.length === 0) {
  console.log("No skills detected.");
} else {
  console.log(extracted.map(formatSkill).join("\n"));
}
