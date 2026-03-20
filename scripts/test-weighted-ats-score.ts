import { calculateWeightedAtsScore } from "../src/lib/calculateWeightedAtsScore";

const testCases = [
  {
    label: "Strong across all categories",
    input: {
      skillMatchScore: 92,
      keywordCoverageScore: 88,
      experienceAlignmentScore: 90,
      structureScore: 85,
      achievementScore: 87,
    },
  },
  {
    label: "Mixed performance",
    input: {
      skillMatchScore: 68,
      keywordCoverageScore: 54,
      experienceAlignmentScore: 72,
      structureScore: 45,
      achievementScore: 40,
    },
  },
  {
    label: "Weak across most categories",
    input: {
      skillMatchScore: 25,
      keywordCoverageScore: 20,
      experienceAlignmentScore: 30,
      structureScore: 15,
      achievementScore: 10,
    },
  },
];

for (const testCase of testCases) {
  const result = calculateWeightedAtsScore(testCase.input);

  console.log(`\n=== ${testCase.label} ===`);
  console.log("input:", testCase.input);
  console.log("finalScore:", result.finalScore);
  console.log("weights:", result.weights);
  console.log("reasoning:", result.reasoning);
}
