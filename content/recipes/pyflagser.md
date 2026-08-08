---
type: recipe
title: pyflagser
summary: Persistent homology of directed flag complexes, built from git over a vendored C++ engine because no conda channel carries it.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
---

# pyflagser

pyflagser is the corpus's route into **directed** complexes, where edge orientation carries
information a symmetric Rips filtration throws away — which matters wherever the underlying biology
is a directed network rather than a distance. No conda package exists, so
[[pyflagser-environment]] stages this build and grades L1 for it.

Like [[giotto-ph-recipe]], it builds from git rather than an sdist because the flagser C++ engine is
a submodule, so `git` and network access are build-time requirements. AGPL-3.0 is redistributable,
so publishing lifts the fixture to L3 once the network dependency is resolved.

Verified green under `rattler-build` on linux-64.
