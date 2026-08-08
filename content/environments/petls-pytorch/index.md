---
type: environment
title: petls-pytorch
summary: The Apache-2.0 pure-Python reimplementation of PETLS, and the redistributable persistent-Laplacian engine this corpus actually ships.
portability_grade: L1
tags:
  - method/persistent-laplacian
---

# petls-pytorch

petls-pytorch is the open engine that unblocks everything [[petls]] cannot: same method family,
Apache-2.0, pure Python, and therefore a noarch recipe that is eligible for staged-recipes.
Publishing it promotes this fixture to L3 or L4; the L1 grade reflects only that the recipe is
still in-repo. See [[petls-pytorch]] for the software profile.

The fixture builds from our fork `jmchilton/petls-pytorch @ v2` rather than the PyPI 1.0.2
sdist. v2 carries three fixes over upstream, and one of them is load-bearing for this corpus:
simplex-tree boundary extraction now indexes every simplex, so isolated vertices no longer
crash `Complex(simplex_tree=)` and `Rips(distances=)`. That crash blocked the bipartite
interface complexes the TopoDockQ featurizer needs, where an atom with no cross-interface
neighbour inside the cutoff is routine rather than exotic. The fork also demoted `tadasets`
from a runtime dependency to a benchmark extra. Upstream pull requests are pending.

Recipe and linux-64 lock are verified green.
