---
type: package
title: pyflagser
summary: Python bindings over the flagser engine, for persistence on directed flag complexes where edge orientation carries the signal.
repository: https://github.com/giotto-ai/pyflagser
languages:
  - Python
  - C++
software_license:
  status: declared
  id: AGPL-3.0-or-later
tags:
  - method/persistent-homology
  - modality/graph
---

# pyflagser

Almost everything else in this corpus starts from a distance, and a distance is symmetric. That is
usually harmless and occasionally fatal: in a connectome, a gene regulatory network, or any signed
flow, the fact that A drives B and B does not drive A is the biology, and a Vietoris–Rips complex
discards it in the first step.

The directed flag complex keeps it. Given a directed graph, a *k*-simplex is a set of *k*+1 vertices
whose edges are all present and all consistent with a single ordering of them — a directed clique
with an unambiguous source and sink. Reciprocal edges and cycles do not produce simplices the way an
undirected clique would, so the complex genuinely responds to orientation rather than symmetrizing
and hoping. pyflagser computes the homology of that complex, along with cell counts and Euler
characteristics, over a filtration built from edge or vertex weights.

The motivation is not hypothetical. This construction came out of neuroscience, where the directed
graph is a wiring diagram and the question is whether its higher-order structure differs from what a
random graph with the same statistics would give.

## Two licenses stacked

pyflagser is a wrapper. The engine underneath is `luetge/flagser`, written by Daniel Lütgehetmann,
and flagser is itself built on Ripser — the repository ships a copy of Bauer's program modified only
to support flagser's features. So the second of this family's two compute engines also descends from
[[ripser-cpp]], by a different route than [[giotto-ph]] took.

The licenses do not descend together. **flagser is MIT** (with an added clause about modifications
released without written agreement); **pyflagser, the wrapper, is AGPL-3.0**. The stricter license
is the giotto-side contribution, not the engine's.

That is worth stating because it is the mirror image of [[gudhi]]'s situation, and reading either
one from its top-level license alone gets it wrong. GUDHI is permissive code that behaves as
copyleft because of what it depends on; pyflagser is copyleft code wrapping a permissive engine.
Anyone who needs the directed flag complex without the AGPL has a real option — the engine is MIT
and usable directly — and anyone who takes the Python API takes the AGPL.

## In this corpus

[[pyflagser-environment]] stages [[pyflagser-recipe]], verified green on linux-64 and capping the
fixture at L1. It shares [[giotto-ph]]'s build problem for the same reason — the C++ engine is a
submodule, so the build needs git and the network — plus the force-included `<cstdint>` and a
version import repointed from `pkg_resources.extern` to the standalone `packaging` distribution.
[[giotto-tda]] declares it as a dependency and discusses the AGPL's network clause. The technique is
[[persistent-homology]], applied to a complex the usual Rips route cannot build.
