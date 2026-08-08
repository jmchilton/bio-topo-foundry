---
type: recipe
title: open-topoqa-featurizer
summary: The clean-room interface featurizer written from the TopoQA paper, packaged as the open replacement for an unlicensed upstream.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-featurizer

This recipe packages our own code, and the reason it exists is licensing rather than availability.
TopoQA's released implementation is unlicensed, so it cannot be redistributed or repackaged at all;
this featurizer was reproduced from the paper's Methods — never read, cloned, or decompiled — and
released MIT. The mathematics of persistent homology is not copyrightable, and an independent
implementation of it is ours to publish. See [[open-topoqa-featurizer-environment]] and
[[topoqa]].

Because it was written from the specification rather than the code, it does not inherit the
released code's `(x, y, y)` coordinate defect, which [[topoqa-interface-quality]] found roughly a
third of the paper's HAF2 ranking-loss margin depends on. There is no bit-exact oracle to check
against, and that is correct rather than a limitation.

Every runtime dependency is on a public channel — numpy, gudhi, biopython, and `dssp` for the
`mkdssp` binary the featurizer shells out to for eight-state secondary structure and relative SASA
— so the consuming fixture stages only this one path recipe. Pure Python, MIT, noarch: publishing
it reaches L3 or L4 with nothing in the way.

Verified green with a solved linux-64 lock.
