-- Clinical AI Evidence Registry warehouse views.
-- These statements are portable ANSI-style SQL intended for review and adaptation.

CREATE TABLE clinical_ai_model_evidence (
  model_name VARCHAR(160) PRIMARY KEY,
  domain VARCHAR(80) NOT NULL,
  intended_use VARCHAR(400) NOT NULL,
  validation_cohorts INTEGER NOT NULL,
  minimum_cohorts INTEGER NOT NULL,
  external_validation_sites INTEGER NOT NULL,
  safety_events INTEGER NOT NULL,
  unresolved_bias_findings INTEGER NOT NULL,
  missing_document_count INTEGER NOT NULL,
  owner VARCHAR(120) NOT NULL,
  next_action VARCHAR(500) NOT NULL
);

CREATE VIEW clinical_ai_release_posture AS
SELECT
  model_name,
  domain,
  owner,
  CASE
    WHEN validation_cohorts < minimum_cohorts
      OR safety_events > 2
      OR unresolved_bias_findings > 1
      OR missing_document_count > 1
      THEN 'hold'
    WHEN safety_events > 0
      OR unresolved_bias_findings > 0
      OR missing_document_count = 1
      THEN 'watch'
    ELSE 'release-ready'
  END AS release_posture,
  (minimum_cohorts - validation_cohorts) AS cohort_gap,
  safety_events,
  unresolved_bias_findings,
  missing_document_count,
  next_action
FROM clinical_ai_model_evidence;

CREATE VIEW clinical_ai_board_summary AS
SELECT
  release_posture,
  COUNT(*) AS models,
  SUM(CASE WHEN cohort_gap > 0 THEN 1 ELSE 0 END) AS models_with_cohort_gaps,
  SUM(safety_events) AS safety_events,
  SUM(unresolved_bias_findings) AS unresolved_bias_findings,
  SUM(missing_document_count) AS missing_evidence_items
FROM clinical_ai_release_posture
GROUP BY release_posture;
