---
type: environment
title: dssp
summary: DSSP, providing the mkdssp binary for secondary-structure assignment and solvent accessibility from a structure.
portability_grade: L4
tags:
  - application/structure-qa
  - modality/molecular-structure
---

# dssp

DSSP supplies `mkdssp`, which assigns secondary structure and computes solvent accessibility
from atomic coordinates. It is an enabling dependency for the interface featurizers here:
[[open-topoqa-featurizer-environment]]'s conventional node features include DSSP-derived
terms, and its tests run against a real `mkdssp` rather than a stub.

One Bioconda package, locked green, and therefore an automatic BioContainer.
