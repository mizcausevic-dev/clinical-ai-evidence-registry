import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderPage } from "../src/app.js";
import type { RegistryInput } from "../src/index.js";

const input = JSON.parse(readFileSync("fixtures/clinical-ai-evidence.json", "utf8")) as RegistryInput;
mkdirSync("site", { recursive: true });
writeFileSync("site/index.html", renderPage(input));
writeFileSync("site/robots.txt", "User-agent: *\nAllow: /\n");
