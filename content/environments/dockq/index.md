---
type: environment
title: dockq
summary: DockQ, the reference interface-quality metric that the topological scorers in this corpus are trained and judged against.
portability_grade: L4
tags:
  - application/structure-qa
  - modality/molecular-structure
---

# dockq

DockQ computes the reference-based interface-quality score for a predicted complex against its
native structure. It is the ground truth the topological scorers here regress onto and the
yardstick their ranking losses are measured with, which makes it load-bearing for evaluation
rather than for prediction.

One Bioconda package, locked green, and therefore an automatic BioContainer.
