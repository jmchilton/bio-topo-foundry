---
type: environment
title: prody
summary: ProDy, supplying the elastic network models whose training-free normal-mode analysis anchors per-residue flexibility prediction.
portability_grade: L3
tags:
  - application/molecular-sciences
  - modality/molecular-structure
---

# prody

ProDy builds Gaussian and anisotropic network models from a structure and computes normal modes
from them. For [[protein-flexibility]] that makes it the reference line rather than a competitor:
a Gaussian network model consumes no training data, fits nothing but one scale and offset per
protein, and per-protein Pearson correlation is invariant to both — so it cannot leak, and any
learned descriptor should be asked to beat it under the same data and split.

It is an enabling dependency of the same shape as [[biopython-environment]] and [[dssp-environment]]
rather than a topological method, so it carries no method tag.

conda-forge, locked green, MIT. Bioconda has no `prody` at all, so no container follows and the
fixture grades L3. conda-forge also has no osx-arm64 build, only linux-64, osx-64, and win-64,
which is why the platform set is not widened here and why runs happen in a linux-64 container.

`calcModes` defaults to twenty modes; squared-fluctuation B-factor prediction needs the whole
spectrum, so a caller must ask for it. The manifest pins the version and nothing here restates it.
