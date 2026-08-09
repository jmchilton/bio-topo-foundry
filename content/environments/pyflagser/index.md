---
type: environment
title: pyflagser
summary: pyflagser, for persistent homology of directed flag complexes, built from an in-repo recipe over a vendored C++ engine.
portability_grade: L1
tags:
  - method/persistent-homology
---

# pyflagser

pyflagser computes persistence for directed flag complexes, which matters when edge direction
carries meaning and an undirected Rips complex would discard it — directed networks and
connectomes being the usual motivation.

No conda package exists, so this fixture stages an in-repo recipe, capping it at L1. The recipe
is verified building green on linux-64. Like [[giotto-ph-recipe]] it builds from git rather than a
tarball because the C++ engine (luetge/flagser) arrives as a submodule, and it needs `make`, a
force-included `<cstdint>`, and its `pkg_resources.extern` version import repointed at the
standalone `packaging` distribution.
