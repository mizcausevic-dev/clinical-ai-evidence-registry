export interface ClinicalModelEvidence {
  name: string;
  domain: string;
  intendedUse: string;
  validationCohorts: number;
  minimumCohorts: number;
  externalValidationSites: number;
  safetyEvents: number;
  unresolvedBiasFindings: number;
  missingDocuments: string[];
  owner: string;
  nextAction: string;
}

export interface RegistryInput {
  asOf: string;
  registry: string;
  models: ClinicalModelEvidence[];
}

export interface ModelFinding extends ClinicalModelEvidence {
  evidenceCompleteness: number;
  releaseRiskScore: number;
  posture: "release-ready" | "watch" | "hold";
  boardNarrative: string;
}

export interface RegistrySummary {
  asOf: string;
  registry: string;
  averageReleaseRisk: number;
  modelsOnHold: number;
  missingEvidenceItems: number;
  primaryRecommendation: string;
  findings: ModelFinding[];
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));
const round = (value: number): number => Math.round(value * 100) / 100;

export function scoreModel(model: ClinicalModelEvidence): ModelFinding {
  const cohortGap = Math.max(0, model.minimumCohorts - model.validationCohorts);
  const evidenceCompleteness = clamp(
    100 -
      cohortGap * 10 -
      model.missingDocuments.length * 9 -
      Math.max(0, 2 - model.externalValidationSites) * 8
  );
  const releaseRiskScore = clamp(
    100 - evidenceCompleteness + model.safetyEvents * 8 + model.unresolvedBiasFindings * 12
  );
  const posture = releaseRiskScore >= 55 ? "hold" : releaseRiskScore >= 32 ? "watch" : "release-ready";
  const boardNarrative =
    posture === "hold"
      ? `${model.name} should not expand until missing evidence and safety/bias findings are resolved.`
      : posture === "watch"
        ? `${model.name} can remain in controlled release with visible owner review.`
        : `${model.name} has enough evidence to support monitored release.`;

  return {
    ...model,
    evidenceCompleteness: round(evidenceCompleteness),
    releaseRiskScore: round(releaseRiskScore),
    posture,
    boardNarrative
  };
}

export function buildRegistry(input: RegistryInput): RegistrySummary {
  if (!input.models.length) {
    throw new Error("At least one model evidence record is required.");
  }

  const findings = input.models
    .map(scoreModel)
    .sort((a, b) => b.releaseRiskScore - a.releaseRiskScore);
  const averageReleaseRisk = round(
    findings.reduce((sum, finding) => sum + finding.releaseRiskScore, 0) / findings.length
  );
  const modelsOnHold = findings.filter((finding) => finding.posture === "hold").length;
  const missingEvidenceItems = findings.reduce((sum, finding) => sum + finding.missingDocuments.length, 0);
  const top = findings[0];

  return {
    asOf: input.asOf,
    registry: input.registry,
    averageReleaseRisk,
    modelsOnHold,
    missingEvidenceItems,
    primaryRecommendation: `${top.name}: ${top.nextAction}`,
    findings
  };
}
