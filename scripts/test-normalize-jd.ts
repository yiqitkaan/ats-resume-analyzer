import { readFileSync } from "node:fs";
import { normalizeJobDescription } from "../src/lib/normalizeJobDescription";

const samplePath = "scripts/sample-jd.txt";
const originalText = readFileSync(samplePath, "utf-8");
const normalizedText = normalizeJobDescription(originalText);

console.log("=== ORIGINAL JD ===");
console.log(originalText);
console.log("\n=== NORMALIZED JD ===");
console.log(normalizedText);
