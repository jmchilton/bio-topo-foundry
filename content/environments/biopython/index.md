---
type: environment
title: biopython
summary: Biopython, the structure and sequence I/O layer most other fixtures in this corpus parse their inputs through.
portability_grade: L3
tags:
  - modality/molecular-structure
  - modality/sequence
---

# biopython

Biopython is an enabling dependency rather than a TDA method: it is how a PDB or mmCIF file
becomes coordinates that a filtration can be built over, and how sequence records are read.
Several structure-QA fixtures depend on it.

It resolves from conda-forge and is locked green.
