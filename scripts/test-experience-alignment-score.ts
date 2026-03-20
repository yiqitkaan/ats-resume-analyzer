import { calculateExperienceAlignmentScore } from "../src/lib/calculateExperienceAlignmentScore";

const cases = [
  {
    label: "JD junior / Resume junior",
    jobDescriptionText:
      "We are hiring a junior QA engineer with 2+ years of experience.",
    resumeText:
      "Junior software test engineer with 2 years of QA and automation experience.",
  },
  {
    label: "JD senior / Resume junior",
    jobDescriptionText:
      "Looking for a senior backend developer with 5+ years of experience.",
    resumeText:
      "Junior developer with 2 years of Node.js and API development work.",
  },
  {
    label: "JD intern / Resume intern",
    jobDescriptionText:
      "Internship role for an intern software tester, 1+ year is a plus.",
    resumeText:
      "Software testing intern with internship project experience in manual testing.",
  },
  {
    label: "JD no level / Resume has level",
    jobDescriptionText:
      "Build APIs, write tests, and collaborate with product and design teams.",
    resumeText:
      "Senior test automation engineer with 6 years of experience in QA.",
  },
  {
    label: "JD has level / Resume unclear",
    jobDescriptionText:
      "Mid-level frontend engineer expected, around 3+ years experience.",
    resumeText:
      "Worked on frontend features, bug fixing, and UI improvements across projects.",
  },
  {
    label: "Both unclear",
    jobDescriptionText:
      "Contribute to product quality and collaborate with cross-functional teams.",
    resumeText:
      "Built internal tools, supported releases, and collaborated with the QA team.",
  },
];

for (const testCase of cases) {
  const result = calculateExperienceAlignmentScore({
    resumeText: testCase.resumeText,
    jobDescriptionText: testCase.jobDescriptionText,
  });

  console.log(`\n=== ${testCase.label} ===`);
  console.log("score:", result.score);
  console.log("detectedJobLevel:", result.detectedJobLevel);
  console.log("detectedResumeLevel:", result.detectedResumeLevel);
  console.log("reasoning:", result.reasoning);
}
