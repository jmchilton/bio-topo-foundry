---
type: recipe
title: petls-pytorch
summary: The GPU-native PyTorch persistent-Laplacian engine, built from our fork rather than the PyPI release because the corpus depends on three fixes.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-laplacian
---

# petls-pytorch

petls-pytorch is the shippable answer to what [[petls-recipe]] cannot be: an independent PyTorch
reimplementation of the same persistent-Laplacian engine, Apache-2.0, pure Python, and therefore
noarch and eligible for staged-recipes. Publishing it lifts [[petls-pytorch-environment]] from L1 to
L3 or L4; the L1 today reflects only that the build lives here.

It builds from **our fork at `v2`**, not the PyPI 1.0.2 sdist, and that choice is load-bearing
rather than incidental. The fork carries three changes over 1.0.2: simplex-tree boundary extraction
now indexes every simplex, so isolated vertices no longer break `Complex(simplex_tree=)`, which the
bipartite interface complexes in [[open-topodockq-featurizer-recipe]] require; `tadasets` moved from
a runtime dependency to a benchmark extra, which is what makes the install closure solvable at all;
and float64 property tests were added. The version stays 1.0.2 because upstream's is static, so the
build number is what distinguishes this package from a stock one.

The dependency demotion has since been [merged and released
upstream](https://github.com/Sylverity/petls-pytorch/pull/1); the isolated-vertex fix was
independently resolved by upstream's weighted-alpha refactor. What remains fork-only is the test
coverage. A future recipe that could point at an upstream release rather than a fork archive is the
right end state, and is what to check before opening the staged-recipes PR.
