import type { ExtractedSkill } from "../src/lib/extractSkillsFromText";
import { matchSkills } from "../src/lib/matchSkills";

const resumeSkills: ExtractedSkill[] = [
  { id: "react", name: "React", category: "frontend" },
  { id: "typescript", name: "TypeScript", category: "programming" },
  { id: "github-actions", name: "GitHub Actions", category: "devops" },
  { id: "postgresql", name: "PostgreSQL", category: "database" },
  { id: "react", name: "React", category: "frontend" },
];

const jdSkills: ExtractedSkill[] = [
  { id: "react", name: "React", category: "frontend" },
  { id: "typescript", name: "TypeScript", category: "programming" },
  { id: "aws-lambda", name: "AWS Lambda", category: "cloud" },
  { id: "selenium-webdriver", name: "Selenium WebDriver", category: "qa" },
  { id: "typescript", name: "TypeScript", category: "programming" },
];

const result = matchSkills(resumeSkills, jdSkills);

function printSection(title: string, skills: ExtractedSkill[]): void {
  console.log(title);

  if (skills.length === 0) {
    console.log("(none)");
    return;
  }

  for (const skill of skills) {
    console.log(`- ${skill.name} (${skill.category}) [${skill.id}]`);
  }
}

printSection("=== MATCHED ===", result.matchedSkills);
console.log();
printSection("=== MISSING ===", result.missingSkills);
console.log();
printSection("=== EXTRA ===", result.extraSkills);
