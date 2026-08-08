---
type: package
title: open-topoqa-featurizer
summary: The MIT clean-room TopoQA interface featurizer, written from the paper because the published implementation carries no license.
repository: https://github.com/jmchilton/open-topoqa-featurizer
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-featurizer

This library turns a candidate protein complex into the graph a structure-quality model scores. For
every residue at the interface it emits 172 node features — 32 conventional ones and 140
element-specific persistent-homology summaries — and 11 features for every inter-chain contact. It
stops there. It does not rank, score, or judge anything; [[open-topoqa-scorer]] does that, and the
two are separate packages because the featurizer is useful without the model and was finished first.

## Why it was written

Not because the software was unavailable. [[topoqa]]'s implementation is public and runnable, and it
declares no license at all, which under default copyright means all rights reserved. It cannot be
redistributed, repackaged, vendored, or built on, and no amount of packaging effort changes that.
The only way to get a redistributable version was to write one.

So this one was reproduced from the paper — its Methods, its supplement, and its published feature
specification. The upstream code was never read, cloned, or decompiled. The mathematics of
persistent homology is not copyrightable and an independent implementation of a published method is
ours to release, which is why this is MIT and the thing it replaces is not.

That single fact is what makes the rest of the vertical possible: a fixture that can be graded, a
recipe that can go to a public channel, and a [[score-docking-poses]] procedure a reader can
actually run.

## What clean-room costs here

There is no bit-exact oracle, and there cannot be one. Writing from the specification means the
output is correct against the paper rather than identical to some other program, so agreement is
established against the spec and against structural invariants — barcodes on analytically known
point clouds, feature-block widths, and a real `mkdssp` end-to-end run on a two-chain interface
structure.

The contrast with [[open-topodockq-featurizer]] is the useful one. That sibling had a working oracle
to compare against and is validated bit-exact; this one had none. Both are clean-room, and their
evidence ceilings are nowhere near each other. "Clean-room" describes how a thing was written, not
how strongly it is known to be right, and these two packages exist partly to keep that distinction
visible.

Divergence from the released TopoQA checkpoint is therefore the expected outcome rather than a
defect. It is also unavoidable in one specific way: the released code builds the all-atom edge
histogram from `(x, y, y)` instead of `(x, y, z)`, and this featurizer does not inherit that,
because it was never copied from. [[topoqa-interface-quality]] measured how much of the paper's
reported margin rests on the defect.

## Where the paper is silent

A specification written for human readers leaves gaps that code cannot leave, and each one was
decided and written down rather than guessed silently. The alpha filtration is GUDHI's squared
circumradius, rescaled onto a diameter distance so a single lifetime cut applies consistently to
both the Vietoris–Rips H0 bars and the alpha H1 bars, matching the sibling featurizer. Standard
deviations are population standard deviations.

These are consistency choices, not accuracy claims. Because the scorer is retrained rather than
reused, the scale is something the model learns around, so none of them is load-bearing for
quality — which is exactly why they were chosen for cross-featurizer agreement instead.

## Running it

Secondary structure and relative solvent accessibility both come from DSSP, which is
paper-faithful and means the `mkdssp` binary from [[dssp-environment]] is required for one step of
one function. That step accepts a precomputed map instead, which is the seam that lets the graph
assembly and most of its tests run with no binary present. Everything else is numpy and GUDHI.

## In this corpus

[[open-topoqa-featurizer-recipe]] builds it and [[open-topoqa-featurizer-environment]] pins a
runtime around it; both are authority for versions and dependencies, which this note deliberately
does not restate. The technique is [[persistent-homology]], the subject it replaces is [[topoqa]],
and the model that consumes its graphs is [[open-topoqa-scorer]].
