---
type: mold
name: score-docking-poses
summary: Rank candidate protein-complex structures by predicted DockQ-like interface quality.
tags:
  - method/persistent-homology
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
references:
  - kind: environment
    ref: open-topoqa-scorer-environment
    used_at: runtime
    load: upfront
    mode: verbatim
    evidence: corpus-observed
    purpose: Supplies the runnable featurizer and scorer together with their solved package closure.
---

# Score docking poses

Rank candidate structures for one protein-complex target using the open TopoQA reproduction. The
result is a relative quality-assessment ranking, not a measurement of binding affinity or proof
that any candidate is biologically correct.

## Inputs

- Candidate complex structures for one target, in a format accepted by the scorer.
- The number of top-ranked structures to retain.

## Procedure

1. Validate that every candidate represents the same target and has the chains and atoms required
   by the featurizer.
2. Load [[open-topoqa-scorer-environment]], which carries the featurizer and scorer in one locked
   runtime.
3. Generate interface features for each candidate. Keep per-candidate failures in the result rather
   than silently shrinking the set.
4. Score every successfully featurized candidate, sort scores descending, and assign stable ranks.
5. Return the complete score table and the requested top-ranked structures.

## Outputs

- A table containing the input identifier, predicted DockQ-like score, rank, and any failure.
- The selected top-ranked structures, without modifying their coordinates.

## Guardrails

Compare scores only among candidates for the same target. Describe the output as a model prediction,
not measured DockQ, experimental validation, or a general certificate of structural correctness.
