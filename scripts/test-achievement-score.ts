import { calculateAchievementScore } from "../src/lib/calculateAchievementScore";

const strongAchievementResume = `
Improved regression execution speed by 35% and reduced escaped defects by 42%.
Achieved top 1% QA performance rating in 2024.
Completed 120 test cases and optimized release checks across 3.2 million monthly user events.
Led cross-team test strategy and contributed to stable CI/CD releases.
`;

const actionOnlyResume = `
Improved automation workflows and contributed to team quality initiatives.
Implemented API testing checks and enhanced release readiness processes.
Worked closely with developers to optimize daily QA collaboration.
`;

const genericDutyResume = `
Responsible for testing software applications.
Worked on daily tasks and participated in meetings.
Handled documentation and routine support activities.
`;

const cases = [
  { label: "Strong measurable achievements", resumeText: strongAchievementResume },
  { label: "Action verbs, limited measurable evidence", resumeText: actionOnlyResume },
  { label: "Generic duty descriptions", resumeText: genericDutyResume },
];

for (const testCase of cases) {
  const result = calculateAchievementScore({ resumeText: testCase.resumeText });

  console.log(`\n=== ${testCase.label} ===`);
  console.log("score:", result.score);
  console.log("numericSignalCount:", result.numericSignalCount);
  console.log("actionSignalCount:", result.actionSignalCount);
  console.log("detectedAchievementSignals:", result.detectedAchievementSignals);
  console.log("reasoning:", result.reasoning);
}
