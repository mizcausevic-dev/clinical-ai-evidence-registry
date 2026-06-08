import express from "express";
import { readFileSync } from "node:fs";
import { buildRegistry, type RegistryInput } from "./index.js";

const pct = (value: number): string => `${Math.round(value)}%`;

export function renderPage(input: RegistryInput): string {
  const registry = buildRegistry(input);
  const cards = registry.findings
    .map(
      (model) => `
      <article class="model ${model.posture}">
        <span>${model.posture}</span>
        <h3>${model.name}</h3>
        <p>${model.boardNarrative}</p>
        <dl>
          <div><dt>Risk</dt><dd>${model.releaseRiskScore}</dd></div>
          <div><dt>Evidence</dt><dd>${pct(model.evidenceCompleteness)}</dd></div>
          <div><dt>Sites</dt><dd>${model.externalValidationSites}</dd></div>
        </dl>
        <strong>${model.nextAction}</strong>
      </article>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Clinical AI Evidence Registry</title>
  <meta name="description" content="Clinical AI evidence registry for validation cohorts, safety events, bias findings, release posture, and board-ready AI governance." />
  <style>
    :root { --bg:#050812; --panel:#0d1727; --text:#f4f1ea; --muted:#a8b3c7; --cyan:#25d7ef; --mint:#5ff0b6; --rose:#ff6b87; --line:rgba(98,238,219,.22); }
    * { box-sizing:border-box; }
    body { margin:0; font-family:"Segoe UI",sans-serif; color:var(--text); background:radial-gradient(circle at 80% 5%, rgba(255,107,135,.16), transparent 34rem), radial-gradient(circle at 10% 15%, rgba(37,215,239,.12), transparent 30rem), var(--bg); }
    main { width:min(1180px, calc(100% - 40px)); margin:0 auto; padding:56px 0; }
    .hero { border:1px solid var(--line); border-radius:28px; padding:clamp(28px,5vw,64px); background:linear-gradient(135deg, rgba(13,23,39,.96), rgba(8,11,24,.92)); }
    .eyebrow { color:var(--mint); font-family:Consolas,monospace; font-size:.78rem; letter-spacing:.18em; text-transform:uppercase; }
    h1 { max-width:1000px; margin:18px 0; font-size:clamp(3rem,8vw,7rem); line-height:.9; letter-spacing:-.075em; }
    .lede { max-width:760px; color:var(--muted); font-size:1.25rem; line-height:1.7; }
    .metrics, .grid { display:grid; gap:16px; }
    .metrics { grid-template-columns:repeat(4,1fr); margin-top:34px; }
    .metric, .model { background:rgba(13,23,39,.9); border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:22px; }
    .metric small, dt { color:var(--muted); text-transform:uppercase; letter-spacing:.12em; font-size:.75rem; }
    .metric b { display:block; margin-top:10px; font-size:2rem; }
    .grid { grid-template-columns:repeat(2,1fr); margin-top:22px; }
    .model { min-height:260px; }
    .model span { color:var(--cyan); font-family:Consolas,monospace; text-transform:uppercase; letter-spacing:.14em; font-size:.76rem; }
    .model.hold { border-color:rgba(255,107,135,.42); }
    .model.watch { border-color:rgba(255,209,102,.38); }
    h3 { font-size:1.65rem; margin:14px 0 10px; }
    p { color:var(--muted); line-height:1.6; }
    dl { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:20px 0; }
    dd { margin:5px 0 0; font-size:1.25rem; font-weight:800; }
    .proof-pack { display: grid; grid-template-columns: 1.05fr 1fr 1fr; gap: 16px; margin-top: 22px; }
    .proof-card {
      background: linear-gradient(180deg, rgba(18,28,46,.94), rgba(10,16,28,.92));
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 20px;
      padding: 22px;
      box-shadow: 0 16px 42px rgba(0,0,0,.18);
    }
    .proof-card small { display: block; color: var(--cyan); font-family: "Consolas", monospace; text-transform: uppercase; letter-spacing: .14em; font-size: .72rem; margin-bottom: 10px; }
    .proof-card h2 { font-size: 1.35rem; margin: 0 0 10px; letter-spacing: -.03em; }
    .proof-card p { margin: 0; color: var(--muted); line-height: 1.62; }
    .proof-card ul { margin: 0; padding-left: 18px; color: var(--muted); line-height: 1.75; }
    .proof-card li::marker { color: var(--cyan); }
    footer { margin-top:34px; color:var(--muted); font-family:Consolas,monospace; }
    @media (max-width:820px) { .metrics,.grid,dl { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">HealthTech and Pharma / Python + R + SQL</div>
      <h1>Clinical AI evidence stays visible before release risk reaches the board.</h1>
      <p class="lede">Clinical AI Evidence Registry turns model cards, cohort validation, safety events, bias findings, and missing evidence into one release-readiness ledger.</p>
      <div class="metrics">
        <div class="metric"><small>Average risk</small><b>${registry.averageReleaseRisk}</b></div>
        <div class="metric"><small>Models on hold</small><b>${registry.modelsOnHold}</b></div>
        <div class="metric"><small>Missing evidence</small><b>${registry.missingEvidenceItems}</b></div>
        <div class="metric"><small>Models tracked</small><b>${registry.findings.length}</b></div>
      </div>
    </section>
    <section class="grid">${cards}</section>
    <section class="proof-pack" aria-label="Evidence and board pack">
      <article class="proof-card">
        <small>Evidence matrix</small>
        <h2>What leaders can inspect</h2>
        <p>Each lane keeps the source signal, owner, risk posture, and next decision in the same public proof surface instead of hiding the work in screenshots.</p>
      </article>
      <article class="proof-card">
        <small>Board pack builder</small>
        <h2>How the packet gets used</h2>
        <ul><li>Translate technical telemetry into decision language.</li><li>Separate watch, contain, and escalation posture.</li><li>Keep remediation evidence attached to accountable owners.</li></ul>
      </article>
      <article class="proof-card">
        <small>Public-demo boundary</small>
        <h2>What is intentionally synthetic</h2>
        <p>Demo fixtures are synthetic and credential-free; the pattern is reusable for real diligence packets without exposing customer or regulated data.</p>
      </article>
    </section>
    <footer>Primary recommendation: ${registry.primaryRecommendation}</footer>
  </main>
</body>
</html>`;
}

export function createApp() {
  const app = express();
  const input = JSON.parse(readFileSync("fixtures/clinical-ai-evidence.json", "utf8")) as RegistryInput;
  app.get("/", (_req, res) => res.type("html").send(renderPage(input)));
  app.get("/api/registry", (_req, res) => res.json(buildRegistry(input)));
  return app;
}

if (process.argv[1]?.endsWith("app.js")) {
  createApp().listen(4173, () => console.log("clinical-ai-evidence-registry listening on http://localhost:4173"));
}
