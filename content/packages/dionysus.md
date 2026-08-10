---
type: package
title: Dionysus
summary: A persistence library kept for what the fast Rips engines do not do — vineyards, zigzag, and persistence over arbitrary fields.
repository: https://github.com/mrzv/dionysus
languages:
  - C++
  - Python
software_license:
  status: declared
  id: BSD-3-Clause
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# Dionysus

Dionysus 2 — Dmitriy Morozov's rewrite of the original — computes ordinary persistence competently,
but that is not why it is in this corpus. It is here for the capabilities that the Rips-focused
engines deliberately do not have.

**Vineyards** track how a persistence diagram moves as a filtration deforms, through adjacent
transpositions and linear homotopies, rather than recomputing the diagram at each step. That turns
persistence from a static summary into something you can follow along a parameter — a time course, a
trajectory, a titration. **Zigzag** persistence allows the maps between complexes to point in either
direction, which is what you need when a sequence of samples is not nested. **Omni-field**
persistence computes over all prime fields at once, which is the honest answer to whether a feature
you found is an artifact of working over ℤ/2. It also carries Hera for bottleneck and Wasserstein
distances between diagrams.

None of those is a speed claim. Reach for [[ripser-cpp]] when the question is how fast a Rips
barcode can be computed, and for this when the question is one the barcode alone cannot answer.

## In this corpus

[[dionysus-environment]] resolves from conda-forge with no recipe. The technique is
[[persistent-homology]], whose implementation guide names this as the vineyards-and-zigzag option.
