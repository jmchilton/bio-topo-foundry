---
type: recipe
title: giotto-ph
summary: The parallel Ripser-derived persistence backend, built from git because it vendors its C++ engine as submodules an sdist cannot carry.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# giotto-ph

giotto-ph is the fast parallel path to Vietoris–Rips persistence, and it is on no conda channel, so
[[giotto-ph-environment]] stages this build and grades L1 because of it. AGPL-3.0 is redistributable,
so publishing the recipe would lift that fixture to L3.

The build reaches for git rather than a released archive because the C++ engine lives in
submodules, and an sdist does not carry them. That means `git` and a network connection at build
time, which is the same shape as [[pyflagser-recipe]] and [[rivet-recipe]] and the thing to resolve
before a channel that builds offline will take any of them. `cmake <4` is pinned for the usual
reason — the vendored sources declare a `cmake_minimum_required` that CMake 4 rejects outright.

Verified green under `rattler-build` on linux-64.
