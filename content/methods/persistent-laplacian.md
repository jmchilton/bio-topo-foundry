---
type: method
title: Persistent Topological Laplacians
summary: A Laplacian family built along a filtration; its zero eigenvalues are persistent homology, and the rest are the geometry persistence throws away.
facet_tag: method/persistent-laplacian
tags:
  - method/persistent-laplacian
  - method/persistent-homology
  - application/molecular-sciences
  - modality/point-cloud
  - modality/graph
---

# Persistent Topological Laplacians

## The idea

Take the filtration that persistent homology uses, and at each step build a Laplacian instead of a
homology group. The resulting matrix splits cleanly in two:

- Its **zero eigenvalues** count exactly the persistent Betti numbers. This is not an approximation
  — it is rank–nullity — so the whole barcode is recoverable and nothing topological is lost.
- Its **non-zero eigenvalues** are new information, not derivable from the barcode at all.

That is the entire pitch, and it is unusually clean: a strict superset of persistent homology, at
the cost of a spectral computation per filtration step. Where a barcode jumps discretely as
features are born and die, the non-harmonic spectrum varies continuously with geometry, so it can
distinguish structures that persistent homology reports as identical.

The construction generalizes the graph Laplacian. Replace vertices with *q*-simplices and adjacency
with the two ways simplices can touch — sharing a face, or being faces of a common higher simplex —
and the ordinary graph Laplacian is the *q* = 0 case. Making it *persistent* requires the extra
step of restricting to chains whose boundaries stay anchored in the earlier complex, which is what
lets a spectrum at one scale say something about survival to a later one.

[[persistent-spectral-graph]] is the founding paper and the note to read for the actual definitions.

## When to reach for it

The honest trigger is: **when your target is continuous and per-entity, and a barcode is not.**

Protein B-factors are the canonical example. They are per-residue real numbers; a barcode is a
multiset of intervals with no residue index, so persistent homology has no natural model for the
task at all, while the Laplacian's eigenvectors do. The same reasoning applies to flexibility,
binding affinity changes on mutation, and anywhere two structures share topology but differ in the
shape that determines function.

The converse also holds. If your task is well served by a barcode, this adds cost and a much larger
feature space for information you were not using.

## What you should know before adopting it

Two caveats matter more than the literature's enthusiasm suggests.

**The stability guarantee does not come for free.** Persistent homology's practical credibility
rests on stability theorems bounding diagram change by input perturbation. The founding paper
proves no analogue for the non-harmonic spectra. Later work addresses this, but it is later work —
if you are relying on stability, verify it holds for the specific construction you are using rather
than inheriting the assumption from persistent homology.

**Featurization is unsettled.** There is no canonical summary of a non-harmonic spectrum. The
founding paper tries six statistics — sum, mean, max, standard deviation, variance, and the
smallest non-zero eigenvalue — and reports the best. Downstream work largely continues to pick by
benchmark. This is a real degree of freedom and a real overfitting risk on small datasets, and it
should be reported rather than tuned quietly.

A third point is worth knowing because it is easy to miss: the founding paper's own experiments all
use persistence offset *p* = 0. They vary the filtration radius and diagonalize the ordinary
Laplacian at each one, never exercising the persistent construction the theory develops. That does
not invalidate the framework, but a reader assuming the headline results demonstrate the persistent
machinery is assuming something the paper does not show.

## Cost

Diagonalizing a family of matrices whose dimension is the simplex count, once per filtration step,
is inherently heavier than computing a barcode over the same filtration. This is not a footnote —
it is why the software lineage exists. HERMES was the first implementation; [[petls]] was written
to replace it and reports speedups in the hundreds of times over it on the same construction, by
attacking the algorithm and the eigensolver rather than the definition.

If you are evaluating whether the method fits your budget, the answer depends far more on which
implementation you use than on the mathematics.

## What implements it here

- **[[petls]]** — the C++ library with Python bindings, and the most general: arbitrary filtered
  boundary matrices, Rips, alpha, directed flag complexes, and rank-one cellular sheaves. Note that
  it declares no license at all, which is why its fixture is capped at L1 and will stay there.
- **[[petls-pytorch]]** — the differentiable route, for putting Laplacian features inside a model
  that trains end to end.
- **[[topodockq]]** — a consumer rather than an implementation: persistent-Laplacian features
  feeding structure quality assessment, descended from the element-specific line rather than from
  the founding paper's own applications.
- Fixtures: [[petls-environment]], [[petls-pytorch-environment]],
  [[topodockq-environment]], [[open-topodockq-featurizer-environment]].

## Related

[[persistent-homology]] is what this contains. [[topological-deep-learning]] is where the spectra
usually end up — as features for a learned model rather than for a hand-picked statistic.
