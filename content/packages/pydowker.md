---
type: package
title: pyDowker
summary: Persistence from a relation instead of a metric — a rectangular incidence matrix can be filtered where a distance matrix is required elsewhere.
repository: https://github.com/nihell/pyDowker
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/multiparameter-persistence
  - method/persistent-homology
  - modality/point-cloud
---

# pyDowker

The filtrations elsewhere in this corpus start from a square matrix — a distance, or a directed
adjacency — which is to say from things of one kind compared to each other. A great deal of
biological data is not that. Cells by genes, ligands by receptors, samples by taxa, residues across
an interface: relations between two different kinds of thing, whose honest description is a
rectangular incidence matrix.

The Dowker complex filters exactly that. Given a relation between two sets, it builds a simplicial
complex on one side whose simplices record shared relationships on the other; the classical result
is that doing it from either side gives the same homology, so the asymmetry of the input does not
produce an arbitrary choice in the output. pyDowker builds these from a numpy array with a
user-supplied relation, filters by sublevel sets of the entries, and computes persistence — through
[[gudhi]] in one parameter and through [[rivet]] in two.

The two-parameter route is the reason it sits in this family. A relation with two functions on it —
an interaction strength and a confidence, say — is a bifiltration without contrivance, which is a
better motivation for multiparameter persistence than the usual scale-and-density example.

## Read its maturity honestly

pyDowker is a research artefact accompanying work by Niklas Hellmer and Jan Spaliński. It is a
handful of commits, it says "under development" in its own README, and it has almost no users. That
is not a criticism — it is what a new construction looks like before anyone has hardened it — but it
sets the expectation correctly: this is a capability to evaluate, not a dependency to build a
service on.

Its packaging shows the same stage. The project declares no build backend and no runtime
dependencies at all, so [[pydowker-recipe]] supplies both. And `__init__.py` is empty, which is what
let an import-only check pass while the real module —
`pyDowker.DowkerComplex`, which reaches for [[pyrivet]] and the engine below it — could not load.

## In this corpus

The leaf of the three-recipe chain [[pydowker-environment]] stages, and the fixture is the corpus's
only route into [[multiparameter-persistence]]. The recipe directory is lowercase `pydowker` because
conda package names are; the import keeps upstream's `pyDowker`, which was never ours to choose.
