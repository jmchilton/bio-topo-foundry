---
type: environment
title: petls
summary: Upstream PETLS, the compiled persistent-topological-Laplacian library, kept as a local oracle rather than a shippable dependency.
portability_grade: L1
tags:
  - method/persistent-laplacian
---

# petls

PETLS is the reference implementation for persistent topological Laplacians across a wide range
of complexes, and this fixture builds it from an in-repo recipe. See [[petls]] for the software
profile.

Its grade will not improve. PETLS declares no software license anywhere — no license file, no
`pyproject.toml` field, an empty `setup.py` value — so under default copyright it is all rights
reserved and cannot be redistributed to conda-forge or Bioconda no matter how good the recipe
is. The fixture is therefore a **local oracle**: something to run and compare against, not
something to ship. [[petls-pytorch]] is the shippable substitute.

The recipe is verified building green on linux-64 and is linux-64 only: an upstream
`std::chrono::_V2` libstdc++-ism does not compile under macOS libc++.
