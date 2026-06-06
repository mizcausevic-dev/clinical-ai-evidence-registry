import argparse
import json
from pathlib import Path


def _clamp(value: float) -> float:
    return max(0.0, min(100.0, value))


def _score_model(model: dict) -> dict:
    cohort_gap = max(0, model["minimumCohorts"] - model["validationCohorts"])
    evidence = _clamp(
        100
        - cohort_gap * 10
        - len(model["missingDocuments"]) * 9
        - max(0, 2 - model["externalValidationSites"]) * 8
    )
    risk = round(_clamp(100 - evidence + model["safetyEvents"] * 8 + model["unresolvedBiasFindings"] * 12), 2)
    posture = "hold" if risk >= 55 else "watch" if risk >= 32 else "release-ready"
    return {
        **model,
        "evidenceCompleteness": round(evidence, 2),
        "releaseRiskScore": risk,
        "posture": posture,
    }


def build_pack(input_path: str | Path) -> dict:
    payload = json.loads(Path(input_path).read_text(encoding="utf-8"))
    findings = sorted((_score_model(model) for model in payload["models"]), key=lambda row: row["releaseRiskScore"], reverse=True)
    top = findings[0]
    return {
        "title": "Clinical AI Evidence Diligence Pack",
        "registry": payload["registry"],
        "asOf": payload["asOf"],
        "modelsOnHold": sum(1 for row in findings if row["posture"] == "hold"),
        "missingEvidenceItems": sum(len(row["missingDocuments"]) for row in findings),
        "primaryRecommendation": f"{top['name']}: {top['nextAction']}",
        "boardQuestions": [
            "Which models should not expand until evidence gaps close?",
            "Where are safety events or unresolved bias findings still open?",
            "Which owner is accountable for the release decision?",
        ],
        "findings": findings,
    }


def _markdown(pack: dict) -> str:
    lines = [
        f"# {pack['title']}",
        "",
        f"Registry: {pack['registry']}",
        f"Models on hold: {pack['modelsOnHold']}",
        f"Missing evidence items: {pack['missingEvidenceItems']}",
        f"Primary recommendation: {pack['primaryRecommendation']}",
        "",
        "## Board questions",
    ]
    lines.extend(f"- {question}" for question in pack["boardQuestions"])
    lines.append("")
    lines.append("## Findings")
    for row in pack["findings"]:
        lines.append(f"- {row['name']} | {row['posture']} | risk {row['releaseRiskScore']} | owner {row['owner']}")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    parser.add_argument("--format", choices=["json", "markdown"], default="json")
    args = parser.parse_args()
    pack = build_pack(args.input)
    print(_markdown(pack) if args.format == "markdown" else json.dumps(pack, indent=2))
