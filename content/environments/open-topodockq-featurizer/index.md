---
type: environment
title: open-topodockq-featurizer
summary: The MIT clean-room reimplementation of TopoDockQ's interface featurizer, bit-exact against the bytecode it replaces.
portability_grade: L1
tags:
  - method/persistent-laplacian
  - application/structure-qa
  - modality/molecular-structure
---

# open-topodockq-featurizer

This fixture stages the open replacement for the one piece of TopoDockQ that could not be run
from source: its persistent-combinatorial-Laplacian interface featurizer. The reimplementation
is MIT and clean-room, and it is validated as **bit-exact against the original `.pyc`** on 400
real complexes plus adversarial probes — an unusually strong form of evidence, available here
only because a working oracle existed to compare against.

That is what makes [[topodockq-environment]]'s bytecode gap closed rather than merely
documented: the open scorer's feature inputs no longer require any bytecode.

The environment stages two in-repo path recipes, its own and [[petls-pytorch-environment]]'s
engine, which is what holds it at L1. Both are pure-Python noarch and Bioconda-eligible, so
publishing them promotes this fixture to L3 or L4. Verified green with a solved linux-64 lock.
