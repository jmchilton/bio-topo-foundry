---
type: mold
name: score-candidate-structures
summary: Rank candidate structures with a reproducible topological quality-assessment environment.
tags:
  - application/structure-qa
references:
  - kind: environment
    ref: example-tda-fixture-environment
    used_at: runtime
    load: upfront
    mode: verbatim
    evidence: corpus-observed
    purpose: Supplies the runnable scorer and its exact package closure.
---

# Score candidate structures

Validate the input set, run every candidate through the declared environment, and return a ranked
table with failures kept visible.
