import { readFileSync } from "node:fs";

const html = readFileSync("site/index.html", "utf8");
const required = [
  "Clinical AI Evidence Registry",
  "Clinical AI evidence stays visible",
  "Sepsis early-warning model",
  "Radiology triage assistant",
  "Primary recommendation"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`Missing smoke marker: ${marker}`);
  }
}

console.log("smoke ok");
