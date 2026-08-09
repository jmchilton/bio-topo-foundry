---
name: score-docking-poses
description: "Rank candidate protein-complex structures by predicted DockQ-like interface quality."
---

# score-docking-poses

Follow the procedure below using the packaged runtime material. Treat its scientific limits as part of the procedure, not optional context.

## When To Use

- Rank candidate protein-complex structures by predicted DockQ-like interface quality.

## Load Upfront

- `references/environments/open-topoqa-scorer.md`: Environment carried verbatim. Supplies the runnable featurizer and scorer together with their solved package closure.
- `references/environments/pixi.lock`: Environment carried verbatim. Sibling of `references/environments/open-topoqa-scorer.md`; read it where that note directs.
- `references/environments/pixi.toml`: Environment carried verbatim. Sibling of `references/environments/open-topoqa-scorer.md`; read it where that note directs.

## Load On Demand

- None declared.

## Procedure

Rank candidate structures for one protein-complex target using the open TopoQA reproduction. The
result is a relative quality-assessment ranking, not a measurement of binding affinity or proof
that any candidate is biologically correct.

### Inputs

- Candidate complex structures for one target, in a format accepted by the scorer.
- The number of top-ranked structures to retain.

### Procedure

1. Validate that every candidate represents the same target and has the chains and atoms required
   by the featurizer.
2. Load open-topoqa-scorer-environment, which carries the featurizer and scorer in one locked
   runtime.
3. Generate interface features for each candidate. Keep per-candidate failures in the result rather
   than silently shrinking the set.
4. Score every successfully featurized candidate, sort scores descending, and assign stable ranks.
5. Return the complete score table and the requested top-ranked structures.

### Outputs

- A table containing the input identifier, predicted DockQ-like score, rank, and any failure.
- The selected top-ranked structures, without modifying their coordinates.

### Guardrails

Compare scores only among candidates for the same target. Describe the output as a model prediction,
not measured DockQ, experimental validation, or a general certificate of structural correctness.

## Runtime Notes

- Use only this bundle and user-supplied inputs at runtime; do not read from the Foundry source tree.
- Treat a packaged Environment manifest and lockfile as the runtime authority rather than reconstructing the dependency set from prose.
