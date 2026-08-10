---
type: method
title: Persistent Homology
summary: Track holes across every scale at once instead of picking one, and record where each appears and dies.
facet_tag: method/persistent-homology
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# Persistent Homology

Persistent homology is the technique the rest of this corpus assumes. It is the reason there are
eleven environment fixtures for what is, mathematically, one idea.

## The problem it solves

Give a computer a cloud of points and ask what shape it has, and the first question back is: at what
scale? Connect points within 1 Å and you get dust; within 10 Å and you get one blob. Somewhere
between is the structure you wanted, and there is no principled way to pick the threshold in
advance — any single choice is a guess you then have to defend.

Persistent homology declines the choice. It sweeps the threshold from zero upward, builds a nested
family of complexes — a **filtration** — and records, for every topological feature, the scale at
which it appears (its *birth*) and the scale at which it fills in (its *death*). The output is a
list of birth–death intervals, drawn as a **barcode** or a **persistence diagram**.

Features are counted by dimension. H₀ counts connected components, H₁ counts loops and tunnels, H₂
counts enclosed voids. A long bar means a feature that survives a wide range of scales; a short one
means a feature that appears and immediately fills in. The usual reading is that long bars are
structure and short bars are noise, which is a useful heuristic and not a theorem — in molecular
work short bars often carry real chemistry, and treating them as noise throws it away.

## Why it is trusted

Two properties do most of the work.

**Stability.** Perturb the input slightly and the diagram moves slightly — the change in the
diagram is bounded by the change in the input. This is the guarantee that makes persistent homology
usable on measured data, where coordinates carry error, and it is the reason it is the default
rather than one option among many. Methods that extend persistent homology are worth asking about
on exactly this point; several do not inherit it.

**Coordinate independence.** The construction needs only distances, not coordinates or a fixed
frame. A rotated protein has the same barcode. That invariance is genuine and is often exactly what
you want — and it is also the technique's central limitation, because a great deal of what a
chemist means by *shape* is invisible to it.

## What it discards

Two point clouds can have identical barcodes and differ in every respect that matters to a
prediction task. Persistent homology sees a hole; it does not see how round the hole is, how large
the atoms bounding it are, or what they are made of. Every method downstream of it in this corpus
exists to put something back:

- [[persistent-laplacian]] keeps the barcode exactly and adds a continuous spectral signal.
- Element-specific and multiscale variants build separate filtrations per atom type, so chemistry
  survives the summary.
- [[topological-deep-learning]] learns a task-specific readout instead of hand-picking statistics.

The framing that stays honest: persistent homology is a deliberate, well-understood discard. Its
extensions are attempts to discard less while keeping the stability that made it worth using.

## What it costs

The complex is the bottleneck, not the algebra. A Vietoris–Rips complex on *n* points has
potentially O(n^(k+2)) simplices at dimension *k*, so cost is driven by dimension and by point count
together, and H₂ on a few thousand points is a different proposition from H₁ on a few hundred.
Modern implementations are fast enough that this is often not the binding constraint —
[[ripser-cpp]] in particular reorganized the computation around cohomology and clearing — but the
scaling is real and it is why alpha complexes (which are linear-ish in low dimension) are preferred
for 3-D molecular structures where they apply.

## Choosing an implementation

Eleven fixtures here compute persistent homology, and they are not interchangeable:

- **[[gudhi-environment]]** — the broadest: Rips, alpha, witness, simplex trees, plus the
  representations layer. The default when you do not know yet what you need.
- **[[ripser-cpp-environment]]** and **[[ripser-py-environment]]** — Vietoris–Rips only, and the fastest thing available at
  it. The right answer when Rips is what you want.
- **[[giotto-ph-environment]]** — parallelized Rips, scikit-learn-shaped API.
- **[[phat-environment]]** — matrix reduction only; you bring the boundary matrix. A building
  block, not an entry point.
- **[[dionysus-environment]]** — includes vineyards and zigzag, which the others largely do not.
- **[[pyflagser-environment]]** — directed flag complexes, for asymmetric relations where
  Vietoris–Rips does not apply.
- **[[r-tda-environment]]** and **[[r-tdastats-environment]]** — the R-side equivalents.
- **[[persim-environment]]** — not a computation but a comparison layer: distances between
  diagrams, persistence images, landscapes.
- **[[scikit-tda-environment]]** — the umbrella bundling ripser.py, persim, kmapper and tadasets.

The practical order: pick the *complex* your data calls for first, then pick the library that
computes it well. Choosing the library first is how people end up running Rips on structures that
wanted an alpha complex.

## Reading further in this corpus

Both survey notes — [[tda-tdl-molecular-sciences]] and [[tda-tdl-beyond-persistent-homology]] —
open from persistent homology and spend their length on what came after it, which is a fair
description of the field. [[persistent-spectral-graph]] is the paper that made the first of those
extensions concrete, and it states the relationship precisely: its harmonic spectra recover the
persistent Betti numbers exactly, so nothing here is lost by moving to it.
