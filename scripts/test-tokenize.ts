import { readFileSync } from "node:fs";
import { tokenizeForMatching } from "../src/lib/tokenizeForMatching";

const inputPath = "scripts/sample-tokenize-input.txt";
const inputText = readFileSync(inputPath, "utf-8");

const { tokens, phrases } = tokenizeForMatching(inputText);

console.log("=== TOKENS ===");
console.log(tokens.join("\n"));

console.log("\n=== PHRASES ===");
console.log(phrases.join("\n"));
