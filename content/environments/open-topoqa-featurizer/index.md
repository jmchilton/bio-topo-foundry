---
type: environment
title: open-topoqa-featurizer
summary: The MIT clean-room TopoQA interface featurizer, reproduced from the paper because the upstream code carries no license.
portability_grade: L1
tags:
  - method/persistent-homology
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-featurizer

This is the sibling clean-room to [[open-topodockq-featurizer-environment]], and the contrast
between them is the point. TopoQA's upstream code is unlicensed, so it **was never read**: this
featurizer is reproduced from the paper alone (Han 2025, bbaf083). It emits the 172-dimensional
node features — 32 conventional plus 140 element-specific persistent homology — and 11-dimensional
edge features.

Because it was built from the specification rather than the code, it fixes the released code's
`(x, y, y)` coordinate defect by construction rather than by patch. It also means there is **no
bit-exact oracle** here, unlike the TopoDockQ featurizer. Divergence from the upstream
checkpoint is the correct outcome, not a bug, so validation is against the paper spec and
structural invariants instead: 19 tests including a real `mkdssp` end-to-end run.

Every runtime dependency is on public channels — numpy, gudhi, biopython, and Bioconda's
[[dssp-environment]] for `mkdssp` — so the fixture stages just one path recipe. Verified green
with a solved linux-64 lock; publishing the recipe reaches L3 or L4.
