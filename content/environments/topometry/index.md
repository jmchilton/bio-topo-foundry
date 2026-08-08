---
type: environment
title: topometry
summary: "TopoMetry 0.2.1.1 from conda-forge: a packaging fixture pinning the only build on the channel, four years behind the paper."
portability_grade: L3
tags:
  - method/spectral-geometry
  - application/single-cell
  - modality/high-dim-tabular
---

# topometry

This fixture pins the single TopoMetry build that exists on conda-forge, 0.2.1.1. It resolves
cleanly from the channel with no recipe, which is why it grades L3.

Read it as a **packaging fixture, not a replication substrate**. 0.2.1.1 predates the
`topo.sc.fit_adata` and `topo.sc.preprocess` API that the published single-cell workflow is
written against, so it cannot run the analysis the paper describes. [[topometry-1.1]] stages
the release that can.

Keeping both fixtures records the gap instead of hiding it. Updating the conda-forge feedstock
would collapse them into one L3 environment, which is the outcome to want.
