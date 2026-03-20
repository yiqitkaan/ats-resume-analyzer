import { calculateKeywordCoverageScore } from "../src/lib/calculateKeywordCoverageScore";

const sampleResumeText = `
Senior Software Test Engineer with experience in test automation using selenium and playwright.
Built api testing suites, worked with typescript, node.js, and ci/cd pipelines.
Performed regression testing, integration testing, and collaborated in agile teams.
`;

const sampleJobDescriptionText = `
We are looking for a QA engineer with strong selenium, api testing, and typescript skills.
Experience with playwright, automation frameworks, agile collaboration, and reporting is required.
Knowledge of aws and 2024 compliance standards is a plus.
`;

const result = calculateKeywordCoverageScore({
  resumeText: sampleResumeText,
  jobDescriptionText: sampleJobDescriptionText,
});

console.log("=== KEYWORD COVERAGE SCORE ===");
console.log("score:", result.score);
console.log("consideredKeywords:", result.consideredKeywords);
console.log("matchedKeywords:", result.matchedKeywords);
console.log("missingKeywords:", result.missingKeywords);
