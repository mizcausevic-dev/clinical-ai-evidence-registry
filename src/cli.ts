import { readFileSync } from "node:fs";
import { buildRegistry, type RegistryInput } from "./index.js";

const inputPath = process.argv[2] ?? "fixtures/clinical-ai-evidence.json";
const input = JSON.parse(readFileSync(inputPath, "utf8")) as RegistryInput;
console.log(JSON.stringify(buildRegistry(input), null, 2));
