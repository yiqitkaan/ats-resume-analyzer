import { buildDetailedExplanation } from "../src/lib/buildDetailedExplanation";

const cases = [
  {
    label: "Strong alignment",
    input: {
      finalScore: 86,
      scoreBreakdown: {
        skillMatchScore: 84,
        keywordCoverageScore: 78,
        experienceAlignmentScore: 90,
        structureScore: 80,
        achievementScore: 76,
      },
      scoreDetails: {
        experienceAlignment: {
          detectedResumeLevel: "senior",
          detectedJobLevel: "senior",
          reasoning:
            "Job description expects senior level and the resume also indicates senior-level experience.",
        },
        structure: {
          detectedSections: ["WORK EXPERIENCE", "SKILLS", "PROJECTS", "EDUCATION"],
          bulletCount: 18,
          reasoning:
            "Resume includes multiple recognizable sections and bullet-based descriptions.",
        },
        achievement: {
          numericSignalCount: 4,
          actionSignalCount: 6,
          reasoning:
            "Resume includes several measurable results and achievement-oriented action verbs.",
        },
      },
      matchedSkills: [
        { id: "selenium-webdriver", name: "Selenium WebDriver", category: "qa" },
        { id: "api-testing", name: "API Testing", category: "qa" },
        { id: "typescript", name: "TypeScript", category: "programming" },
        { id: "github-actions", name: "GitHub Actions", category: "devops" },
      ],
      missingSkills: [
        { id: "aws-lambda", name: "AWS Lambda", category: "cloud" },
      ],
      extraSkills: [
        { id: "playwright", name: "Playwright", category: "qa" },
        { id: "postman", name: "Postman", category: "qa" },
      ],
    },
  },
  {
    label: "Mixed / moderate alignment",
    input: {
      finalScore: 64,
      scoreBreakdown: {
        skillMatchScore: 60,
        keywordCoverageScore: 52,
        experienceAlignmentScore: 68,
        structureScore: 66,
        achievementScore: 48,
      },
      scoreDetails: {
        experienceAlignment: {
          detectedResumeLevel: "junior",
          detectedJobLevel: "mid",
          reasoning:
            "Job description expects mid level but the resume appears one level lower (junior).",
        },
        structure: {
          detectedSections: ["WORK EXPERIENCE", "SKILLS"],
          bulletCount: 8,
          reasoning:
            "Resume has some visible structure but could be improved with clearer sections or more bullet-based formatting.",
        },
        achievement: {
          numericSignalCount: 1,
          actionSignalCount: 2,
          reasoning:
            "Resume includes some action-oriented language but limited measurable impact.",
        },
      },
      matchedSkills: [
        { id: "javascript", name: "JavaScript", category: "programming" },
        { id: "react", name: "React", category: "frontend" },
      ],
      missingSkills: [
        { id: "docker", name: "Docker", category: "devops" },
        { id: "kubernetes", name: "Kubernetes", category: "devops" },
        { id: "aws", name: "Amazon Web Services", category: "cloud" },
      ],
      extraSkills: [{ id: "cypress", name: "Cypress", category: "qa" }],
    },
  },
  {
    label: "Weak alignment",
    input: {
      finalScore: 31,
      scoreBreakdown: {
        skillMatchScore: 22,
        keywordCoverageScore: 20,
        experienceAlignmentScore: 40,
        structureScore: 35,
        achievementScore: 22,
      },
      scoreDetails: {
        experienceAlignment: {
          detectedResumeLevel: "intern",
          detectedJobLevel: "senior",
          reasoning:
            "Job description expects senior level but the resume appears much lower (intern).",
        },
        structure: {
          detectedSections: [],
          bulletCount: 1,
          reasoning:
            "Resume has limited visible structure and few ATS-friendly formatting signals.",
        },
        achievement: {
          numericSignalCount: 0,
          actionSignalCount: 1,
          reasoning:
            "Resume shows mostly generic duty descriptions with few measurable achievement signals.",
        },
      },
      matchedSkills: [{ id: "html5", name: "HTML5", category: "frontend" }],
      missingSkills: [
        { id: "node-js", name: "Node.js", category: "backend" },
        { id: "postgresql", name: "PostgreSQL", category: "database" },
        { id: "docker", name: "Docker", category: "devops" },
        { id: "api-testing", name: "API Testing", category: "qa" },
      ],
      extraSkills: [],
    },
  },
];

for (const testCase of cases) {
  const result = buildDetailedExplanation(testCase.input);

  console.log(`\n=== ${testCase.label} ===`);
  console.log("overallSummary:", result.overallSummary);
  console.log("strengths:", result.strengths);
  console.log("mainGaps:", result.mainGaps);
  console.log("suggestedImprovements:", result.suggestedImprovements);
}
