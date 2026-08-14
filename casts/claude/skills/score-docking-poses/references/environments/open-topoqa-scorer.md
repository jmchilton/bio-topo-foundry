---
type: environment
title: open-topoqa-scorer
summary: The MIT clean-room ProteinGAT scorer that closes the open TopoQA vertical, with weights retrained rather than reused.
portability_grade: L1
tags:
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-scorer

This fixture completes the open structure-QA path: the ProteinGAT scorer that consumes
[[open-topoqa-featurizer-environment]]'s graphs and predicts a DockQ-like interface-quality
score. See [[topoqa]] for the upstream profile and the replication evidence.

The architecture is reproduced from the paper (Han 2025, Eqs 3-9). The paper pins no training
or capacity hyperparameters, so the weights are **our retrain** on a reassembled MAF2 and
Dockground corpus rather than the released checkpoint. As with the featurizer there is no
bit-exact oracle, and divergence is correct: an independent reproduction confirmed the released
code carries an `(x, y, y)` coordinate defect that roughly a third of the paper's HAF2
ranking-loss margin depends on. Measured against a corrected `(x, y, z)` TopoQA, the retrain is
at parity — it matches or beats every correlation and reaches HAF2 ranking-loss parity.

The environment stages **two** in-repo path recipes, the scorer and the featurizer it consumes,
since the latter is on no public channel yet, and it drags a full pytorch and
pytorch_geometric closure. The linux-64 lock solves cleanly (pytorch 2.13.0 cpu-mkl,
pytorch_geometric 2.8.0.post1, gudhi 3.13.0, dssp 4.6.1, biopython 1.87) and the noarch wheel builds
and imports.
