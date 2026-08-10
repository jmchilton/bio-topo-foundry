---
type: package
title: RIVET
summary: The reference tool for two-parameter persistence — it answers by letting you interrogate the module, because there is no barcode to hand you.
repository: https://github.com/rivetTDA/rivet
languages:
  - C++
software_license:
  status: declared
  id: GPL-3.0-or-later
tags:
  - method/multiparameter-persistence
  - modality/point-cloud
---

# RIVET

RIVET is the answer to a question [[multiparameter-persistence]] cannot answer the usual way. In one
parameter a persistence module decomposes into intervals, so there is a barcode, so there is
something to compute and vectorize and train on. In two parameters no such decomposition exists —
that is a theorem, not a missing algorithm — so there is nothing complete to print.

RIVET's response is to make the module *interrogable* instead of summarizing it. It computes the
invariants that do exist and survive: the Hilbert function, the bigraded Betti numbers, and the
barcodes of one-dimensional slices through the two-parameter plane. Then it precomputes enough
structure that a slice can be moved interactively and its barcode redrawn immediately, which turns
"which of the infinitely many slices matters" from a question you must answer in advance into one
you explore.

That is a genuinely different posture from every other tool profiled here, and it explains the
shape of the software. Michael Lesnick and Matthew Wright founded the project in 2013 and Wright
wrote the initial code; a decade of contributors since have worked on the GUI, on parallelism, and
on the presentation-minimization machinery that makes the interactivity affordable.

## The consequence for a pipeline

An interactive visualizer is a hard thing to put in an automated workflow, and the honest reading is
that this is the method's nature rather than the tool's shortcoming. Anything that hands a
multiparameter module to a model has chosen a lossy summary, and RIVET's design declines to make
that choice for you.

What it does offer is `rivet_console`: the same computation, no Qt, driven from the command line
and consumed by [[pyrivet]]. That is the seam through which the method reaches a script at all, and
it is why the corpus builds the console and leaves the viewer alone.

## Two things to know before packaging it

**The name is taken.** conda-forge already carries an unrelated project called `rivet` — a
high-energy-physics analysis toolkit — which under strict channel priority would shadow this one
entirely. [[rivet-recipe]] builds the package as `rivet-console` for that reason. This is the second
name collision in the corpus after [[ripser-cpp]] and [[ripser-py]], and unlike that one it is not
even between two things in the same field.

**There are no releases.** No upstream tags, so anything packaging RIVET is pinning a commit and
saying so. Research-grade infrastructure, exactly as the method note describes it.

GPL-3.0-or-later, which is redistributable copyleft with the isolate-and-notice obligations rather
than a blocker.

## In this corpus

[[rivet-recipe]] compiles the console from a pinned master commit, verified green on linux-64, and
sits at the bottom of the three-recipe chain that [[pydowker-environment]] stages. The build needed
three separate fixes and a memory-limited parallelism cap; the recipe note has them. The technique
is [[multiparameter-persistence]].
