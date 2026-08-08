---
type: environment
title: ripser-cpp
summary: The Ripser C++ command-line tool for fast Vietoris-Rips persistent homology, installed as a single Bioconda package.
portability_grade: L4
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# ripser-cpp

Ripser is the reference fast implementation of Vietoris-Rips persistent homology, and this
fixture installs the C++ command-line build rather than a Python binding. It is the cleanest
point on the ladder in this corpus: one Bioconda package, no recipe, no glue, and therefore an
automatic BioContainer.

The name collides with `ripser-py` deliberately. Both pin a package literally called `ripser`,
but from different channels — the Bioconda C++ CLI here, the conda-forge Python library there.
The channel is part of the mulled identity, so these are genuinely two environments rather than
one environment recorded twice.
