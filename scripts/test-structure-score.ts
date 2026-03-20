import { calculateStructureScore } from "../src/lib/calculateStructureScore";

const wellStructuredResume = `
WORK EXPERIENCE
Senior QA Engineer
• Built automation frameworks with Selenium and Playwright
• Improved regression execution reliability across releases
• Collaborated with developers and product teams

EDUCATION
BSc in Computer Engineering

SKILLS
• TypeScript
• API Testing
• CI/CD

PROJECTS
• ATS Resume Analyzer

CERTIFICATIONS
ISTQB Foundation Level
`;

const weaklyStructuredResume = `
I worked as software tester and developer for different projects.
Did api tests and some automation.
worked with teams on bug fixes and releases.
Also handled documentation and meetings.
`;

const shortMinimalResume = `
Software Engineer
Open to work.
`;

const cases = [
  { label: "Well-structured resume", resumeText: wellStructuredResume },
  { label: "Weakly structured resume", resumeText: weaklyStructuredResume },
  { label: "Short/minimal resume", resumeText: shortMinimalResume },
];

for (const testCase of cases) {
  const result = calculateStructureScore({ resumeText: testCase.resumeText });

  console.log(`\n=== ${testCase.label} ===`);
  console.log("score:", result.score);
  console.log("detectedSections:", result.detectedSections);
  console.log("bulletCount:", result.bulletCount);
  console.log("reasoning:", result.reasoning);
}
