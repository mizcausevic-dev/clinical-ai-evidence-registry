library(jsonlite)

args <- commandArgs(trailingOnly = TRUE)
input_path <- ifelse(length(args) > 0, args[1], "fixtures/clinical-ai-evidence.json")
payload <- fromJSON(input_path)

models <- payload$models
models$cohort_gap <- pmax(0, models$minimumCohorts - models$validationCohorts)
models$release_blocker <- models$cohort_gap > 0 | models$safetyEvents > 2 | models$unresolvedBiasFindings > 1

summary <- data.frame(
  registry = payload$registry,
  models_tracked = nrow(models),
  total_cohort_gap = sum(models$cohort_gap),
  release_blockers = sum(models$release_blocker),
  external_sites_median = median(models$externalValidationSites)
)

writeLines(toJSON(summary, pretty = TRUE, auto_unbox = TRUE))
