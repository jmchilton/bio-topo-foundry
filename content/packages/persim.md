---
type: package
title: persim
summary: The scikit-tda representation layer — distances between persistence diagrams, and the vectorizations that turn one into a fixed-length feature.
repository: https://github.com/scikit-tda/persim
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# persim

persim starts where every engine in this corpus stops. A persistence diagram is a multiset of
birth–death points with no fixed cardinality, and almost nothing downstream can consume that
directly: a distance matrix wants a metric, a neural network wants a fixed-length vector, a
statistical test wants a number. persim supplies both answers, and they are genuinely different
answers rather than two spellings of one.

## Two different things in one library

**Distances** put a metric on diagram space without leaving it. `bottleneck` and `wasserstein`
compute optimal matchings between two diagrams; `sliced_wasserstein` and `heat` are cheaper
kernel-flavoured surrogates that trade exactness for the ability to run on more than a handful of
pairs. This route keeps the stability guarantee that made persistence worth using — perturb the
input a little and the distance moves a little — and it is the honest choice when the question is
*how similar are these two structures*.

**Vectorizations** leave diagram space for ℝⁿ. `PersistenceImager` rasterizes a diagram into a
grid; `PersLandscapeExact` / `PersLandscapeApprox` / `PersistenceLandscaper` build landscape
functions and sample them. This is what makes persistence usable as features in an ordinary model,
and it is where the choices come back. Resolution, kernel bandwidth, and the weighting applied along
the persistence axis are all parameters, and they all change the feature. Persistent homology
declined to pick a scale; vectorizing it picks several other things instead, and the note that
matters is that those picks are yours to defend rather than the method's to justify.

The stability results carry over, but only with the qualifiers attached — landscapes are
well-behaved against bottleneck distance, and persistence images are stable against 1-Wasserstein
for weighting functions that vanish appropriately at the diagonal. A weighting chosen for
downstream accuracy is not automatically one of those.

## The outlier

`gromov_hausdorff` estimates a modified Gromov–Hausdorff distance **between graphs**, not between
diagrams. It is the one function here that does not take a diagram, and it is worth knowing about
because a library organized around one input type quietly containing a second is exactly the kind of
thing that gets missed when reading an API list quickly.

## In this corpus

[[persim-environment]] resolves entirely from conda-forge, so it needs no recipe and grades L3 —
one of the least troublesome fixtures here. [[gudhi]] also ships a representations layer covering
much of the same ground, and this corpus routes the question here anyway, on the argument that
computing persistence and representing it are separate decisions with separate failure modes and
should be separately swappable. [[scikit-tda]] bundles it. The technique is
[[persistent-homology]].
