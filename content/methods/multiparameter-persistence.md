---
type: method
title: Multiparameter Persistence
summary: Filter along two parameters at once — scale and density, say — when one axis cannot separate structure from noise.
facet_tag: method/multiparameter-persistence
tags:
  - method/multiparameter-persistence
  - method/persistent-homology
  - modality/point-cloud
---

# Multiparameter Persistence

## The problem with one parameter

[[persistent-homology]] sweeps a single filtration parameter, usually scale. That is enough until
the data has non-uniform density, at which point it stops working in a specific and common way.

Consider a circle sampled unevenly, with an outlier some distance away. Sweeping radius alone, the
outlier joins the main component at some scale; before that it is a separate component, and after
it the loop may already have filled in. There may be no single radius at which the true structure
is visible. Real data — single-cell measurements especially — is full of exactly this, and the
usual workaround is to denoise first and then run persistence, which is two steps whose interaction
nobody analyses.

Multiparameter persistence takes density as a second filtration axis. Sweep scale *and* a density
threshold together, and the outlier is excluded at every scale by the density axis while the loop
remains visible. The structure that was invisible along either axis alone becomes visible in the
plane.

## Why it is not the default

The mathematics does not cooperate. In one parameter, a persistence module decomposes uniquely into
intervals, which is why a barcode exists at all and why comparing two datasets is straightforward.
In two or more parameters **no such decomposition exists**. There is no complete discrete
invariant, no barcode, and no canonical thing to hand a machine learning model.

This is a theorem, not a gap awaiting the right algorithm. Everything practical in the area is a
response to it: computing incomplete invariants (fibered barcodes, rank invariants, Hilbert
functions), slicing the plane into one-parameter lines and studying the family of barcodes, or
interactive visualization that lets a human explore the module directly rather than summarizing it.

The consequence for a practitioner: the pipeline that works so well in one parameter — compute a
barcode, vectorize it, train — has no clean analogue here. Anything claiming otherwise has chosen a
lossy summary, and which information it drops is the question to ask.

## Cost

Substantially heavier than one-parameter persistence, in both computation and memory, and the
tooling is much less mature. This is research-grade infrastructure — capable, but not something to
drop into a pipeline expecting the robustness of a Rips computation.

## When it is worth it

When density variation is the thing defeating you, and you have exhausted the one-parameter
options. It is a genuine solution to a genuine problem, and it is the correct tool when that
problem is yours. It is not a general upgrade, and adopting it speculatively buys a large amount of
difficulty for structure you may not need.

## What implements it here

One fixture, and it is the most involved in the corpus:

- **[[pydowker-environment]]** — the full chain, staged from source as three in-repo recipes:
  `pyDowker` for Dowker complexes, `pyrivet` as the Python API, and `rivet-console`, RIVET's
  Qt-free C++ engine.

The fixture's history is worth knowing, because it is the honest version of "the tooling is
immature." An earlier version passed its check while being unable to compute anything: `import
pyDowker` succeeded, but the module shells out to `rivet_console`, which was on no package index at
all, and nothing noticed its absence. Compiling RIVET's console from source is what made the chain
actually runnable. If you adopt multiparameter persistence, budget for build work — that is the
representative experience, not an unlucky one.

## Related

[[persistent-homology]] is the one-parameter case and the thing to try first.
[[spectral-geometry]] addresses density-varying data by a completely different route, recovering
coordinates rather than summarizing shape, and is often the cheaper answer when a visualization is
what you actually want.
