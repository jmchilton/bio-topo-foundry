---
type: environment
title: scvelo
summary: scVelo for RNA velocity, the velocity half of the cell-cycle replication, run downstream of the learned geometry.
portability_grade: L3
tags:
  - application/single-cell
  - modality/high-dim-tabular
---

# scvelo

scVelo estimates RNA velocity. Its role in the cell-cycle replication is specific and worth
stating precisely: the paper computes neighbours and moments **on the TopoMetry spectral
scaffold rather than on PCA**, then overlays the velocity field on that learned geometry. So
velocity estimation stays downstream of geometry learning, and swapping the two would not
reproduce the analysis.

conda-forge, locked green. Bioconda's scvelo is stuck at 0.2.5, so there is no automatic
BioContainer and the fixture grades L3 rather than L4.

**Data caveat.** `scvelo.datasets.pancreas()` downloads from the *mutable* master branch of
`theislab/scvelo_notebooks`, a repository with no license file. The data can be fetched and
analysed locally, but it is not redistributable and must not be baked into a container or a
test fixture.
