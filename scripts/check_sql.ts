import { readFileSync } from "node:fs";

const sql = readFileSync("sql/evidence_views.sql", "utf8");
const required = [
  "CREATE TABLE clinical_ai_model_evidence",
  "CREATE VIEW clinical_ai_release_posture",
  "CREATE VIEW clinical_ai_board_summary",
  "GROUP BY release_posture"
];

for (const marker of required) {
  if (!sql.includes(marker)) {
    throw new Error(`Missing SQL marker: ${marker}`);
  }
}

if (!/CASE\s+WHEN[\s\S]+THEN 'hold'/i.test(sql)) {
  throw new Error("SQL release posture CASE expression is missing hold branch.");
}

console.log("sql ok");
