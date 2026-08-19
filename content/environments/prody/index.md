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
a Gaussian network model consumes no training data, fits nothing but one positive scale and offset
per protein, and per-protein Pearson correlation is invariant to both — so it cannot leak, and any
learned descriptor should be asked to beat it under the same data and split.

It is an enabling dependency of the same shape as [[biopython-environment]] and
[[dssp-environment]] rather than a topological method.

conda-forge, locked green. Bioconda has no `prody` at all, so no container follows and the fixture
grades L3. conda-forge builds 2.6.1 for linux-64 and osx-64 only, and has never built `prody` for
osx-arm64 at any version, so an arm64 macOS reader cannot install this fixture natively whatever
the platform set says.

`calcModes` defaults to twenty modes; squared-fluctuation B-factor prediction needs the whole
spectrum, so a caller must ask for it.
