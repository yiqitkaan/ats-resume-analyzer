import { buildResumePreprocessedData } from "../src/lib/buildResumePreprocessedData";
import { buildJobDescriptionPreprocessedData } from "../src/lib/buildJobDescriptionPreprocessedData";

const resumeOriginalText =
  "Worked on React Native apps and Selenium test automation in CI/CD pipelines.";
const resumePreparedText =
  "Worked on React Native apps and Selenium test automation in CI/CD pipelines.";

const jobDescriptionOriginalText =
  "Looking for a QA Engineer with React Native, Selenium WebDriver, and CI/CD experience.";
const jobDescriptionPreparedText =
  "Looking for a QA Engineer with React Native, Selenium WebDriver, and CI/CD experience.";

const resumeData = buildResumePreprocessedData(
  resumeOriginalText,
  resumePreparedText,
);
const jobDescriptionData = buildJobDescriptionPreprocessedData(
  jobDescriptionOriginalText,
  jobDescriptionPreparedText,
);

console.log("=== RESUME PREPROCESSED DATA ===");
console.log(JSON.stringify(resumeData, null, 2));

console.log("\n=== JOB DESCRIPTION PREPROCESSED DATA ===");
console.log(JSON.stringify(jobDescriptionData, null, 2));
