import { describe, expect, it } from "vitest";
import fixture from "../fixtures/clinical-ai-evidence.json" with { type: "json" };
import { buildRegistry, scoreModel, type RegistryInput } from "../src/index.js";

describe("clinical AI evidence registry", () => {
  it("prioritizes the riskiest model", () => {
    const registry = buildRegistry(fixture as RegistryInput);
    expect(registry.findings[0].name).toBe("Sepsis early-warning model");
    expect(registry.modelsOnHold).toBe(2);
    expect(registry.missingEvidenceItems).toBeGreaterThan(3);
  });

  it("penalizes unresolved evidence gaps", () => {
    const base = (fixture as RegistryInput).models[2];
    const clean = scoreModel(base);
    const degraded = scoreModel({
      ...base,
      minimumCohorts: 8,
      safetyEvents: 3,
      unresolvedBiasFindings: 2,
      missingDocuments: ["subgroup calibration", "rollback criteria"]
    });
    expect(degraded.releaseRiskScore).toBeGreaterThan(clean.releaseRiskScore);
    expect(degraded.posture).toBe("hold");
  });
});
