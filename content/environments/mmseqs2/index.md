---
type: environment
title: mmseqs2
summary: MMseqs2, for fast sequence clustering — the tool that makes leakage-safe benchmark splits practical.
portability_grade: L4
tags:
  - application/structure-qa
  - modality/sequence
---

# mmseqs2

MMseqs2 clusters sequences fast enough to be run over a whole benchmark. That is why it is in
this corpus: honest evaluation of a structure-QA model requires splits held out by sequence
similarity rather than at random, and an unclustered split quietly inflates every number
downstream of it.

One Bioconda package, locked green, and therefore an automatic BioContainer.
