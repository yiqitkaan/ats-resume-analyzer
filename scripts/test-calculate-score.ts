import { calculateAtsScore } from "../src/lib/calculateAtsScore";

const testCases = [
  { matchedSkillsCount: 0, totalJdSkillsCount: 0 },
  { matchedSkillsCount: 0, totalJdSkillsCount: 5 },
  { matchedSkillsCount: 2, totalJdSkillsCount: 5 },
  { matchedSkillsCount: 3, totalJdSkillsCount: 4 },
  { matchedSkillsCount: 5, totalJdSkillsCount: 5 },
  { matchedSkillsCount: 7, totalJdSkillsCount: 5 },
];

console.log("=== ATS SCORE TESTS ===");
for (const testCase of testCases) {
  const score = calculateAtsScore(testCase);
  console.log(
    `matched=${testCase.matchedSkillsCount} total=${testCase.totalJdSkillsCount} => score=${score}`,
  );
}
