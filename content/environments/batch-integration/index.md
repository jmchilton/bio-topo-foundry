---
type: environment
title: batch-integration
summary: harmonypy and scanorama together, supplying the batch-integration step ahead of geometry learning on multi-sample cohorts.
portability_grade: L3
tags:
  - application/single-cell
  - modality/high-dim-tabular
---

# batch-integration

Batch effects between samples will dominate a learned geometry if they are not removed first,
so this fixture supplies the integration step for cohort-scale single-cell work. harmonypy and
scanorama take different approaches, and pinning both keeps the choice open and comparable.

Two Bioconda packages, locked green. As with [[ann-backends-environment]], pairing alternatives
for one pipeline slot is what holds the fixture at L3 rather than L4.
