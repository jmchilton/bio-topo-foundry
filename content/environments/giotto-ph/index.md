---
type: environment
title: giotto-ph
summary: giotto-ph, a parallel Rips persistence backend, built from an in-repo recipe because it vendors its C++ engine as submodules.
portability_grade: L1
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# giotto-ph

giotto-ph is a parallelized Ripser-derived backend, useful when Rips persistence is the
bottleneck rather than an incidental step. It has no conda package, so this fixture stages an
in-repo recipe, which is what caps it at L1.

The recipe is verified building green on linux-64 under rattler-build. It builds from a git
source rather than a release tarball because `setup.py` force-fetches vendored C++ submodules
(pybind11, junction, turf) that a tarball does not carry. It additionally needs `make`, a
force-included `<cstdint>` — GCC 13 dropped the transitive include this code relied on — and
`cmake <4`, because the junction submodule's `cmake_minimum_required` predates 3.5.
