---
type: environment
title: dssp
summary: DSSP, providing the mkdssp binary for secondary-structure assignment and solvent accessibility from a structure.
portability_grade: L3
publication_candidate:
  state: UNREGISTERED
  uri: quay.io/biocontainers/dssp:4.6.1--np2py314h8ac4624_1
  observed_at: "2026-08-12T23:30:56.980Z"
tags:
  - application/structure-qa
  - modality/molecular-structure
---

# dssp

DSSP supplies `mkdssp`, which assigns secondary structure and computes solvent accessibility
from atomic coordinates. It is an enabling dependency for the interface featurizers here:
[[open-topoqa-featurizer-environment]]'s conventional node features include DSSP-derived
terms, and its tests run against a real `mkdssp` rather than a stub.

conda-forge, locked green. Bioconda has no `dssp` at all, so no container follows and the fixture
grades L3.
