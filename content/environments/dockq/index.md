---
type: environment
title: dockq
summary: DockQ, the reference interface-quality metric that the topological scorers in this corpus are trained and judged against.
portability_grade: L3
publication_candidate:
  state: UNREGISTERED
  uri: quay.io/biocontainers/dockq:2.1.3--py312hbf570ad_1
  observed_at: "2026-08-12T23:30:56.980Z"
tags:
  - application/structure-qa
  - modality/molecular-structure
---

# dockq

DockQ computes the reference-based interface-quality score for a predicted complex against its
native structure. It is the ground truth the topological scorers here regress onto and the
yardstick their ranking losses are measured with, which makes it load-bearing for evaluation
rather than for prediction.

DockQ is on both conda-forge and Bioconda, and the manifest lists conda-forge first, so the lock
takes that build and no container follows from it — L3. Bioconda's build of the same version does
have one, so a channel pin and a re-lock would move this fixture to L4.
