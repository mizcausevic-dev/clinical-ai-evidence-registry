import { readFileSync } from "node:fs";
import { buildRegistry, type RegistryInput } from "../src/index.js";

const input = JSON.parse(readFileSync("fixtures/clinical-ai-evidence.json", "utf8")) as RegistryInput;
const registry = buildRegistry(input);

console.log(`registry=${registry.registry}`);
console.log(`averageRisk=${registry.averageReleaseRisk}`);
console.log(`modelsOnHold=${registry.modelsOnHold}`);
console.log(`recommendation=${registry.primaryRecommendation}`);
