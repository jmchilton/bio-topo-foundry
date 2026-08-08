---
type: environment
title: ann-backends
summary: hnswlib and pynndescent together, pinning the approximate-nearest-neighbour backends that make kNN graphs reproducible.
portability_grade: L3
tags:
  - application/single-cell
  - modality/high-dim-tabular
---

# ann-backends

Every method in the single-cell vertical starts by building a kNN graph, and an approximate
backend makes that step non-deterministic in ways that propagate into every downstream
embedding. Pinning both hnswlib and pynndescent is what closes a reproducibility gap in the
TopoMetry workflows rather than leaving the backend to whatever happens to be installed.

Two conda-forge packages in one fixture, locked green. Pinning a pair of alternatives for a
single pipeline slot is deliberate — it is also why this grades L3 rather than the L4 either
package would score alone.
