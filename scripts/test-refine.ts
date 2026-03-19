import { readFileSync } from "node:fs";
import { cleanResumeText } from "../src/lib/cleanResumeText";
import { refineResumeText } from "../src/lib/refineResumeText";

const samplePath = "scripts/sample-resume.txt";
const rawText = readFileSync(samplePath, "utf-8");

const cleanedText = cleanResumeText(rawText);
const refinedText = refineResumeText(cleanedText);

console.log("=== CLEANED ===");
console.log(cleanedText);
console.log("\n=== REFINED ===");
console.log(refinedText);
