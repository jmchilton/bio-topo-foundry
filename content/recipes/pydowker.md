---
type: recipe
title: pydowker
summary: Dowker complexes from arbitrary relations, and the leaf of a three-recipe chain that was a hollow green until the engine underneath it existed.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/multiparameter-persistence
  - modality/point-cloud
---

# pydowker

pyDowker builds Dowker complexes from a relation rather than a metric — which is what lets a
filtration run over a rectangular incidence matrix, not just a square distance one — and computes
persistence through GUDHI in one parameter and RIVET in two.

This recipe is where a **hollow green** got caught. An earlier version passed its own test:
`import pyDowker` succeeded, because upstream's `__init__.py` is empty. The real module,
`pyDowker.DowkerComplex`, does `from pyrivet import rivet`, and pyrivet execs a binary that was on
no package index anywhere. Nothing in the check noticed. [[pyrivet-recipe]] and [[rivet-recipe]] now
supply the rest of the chain, and [[pydowker-environment]] verifies it end to end — RIVET compiles,
`rivet_console --help` answers, and a real `DowkerComplex` imports. The test here imports the
module that actually needs the engine, not the empty package.

Upstream is MIT and pure Python with a bare `[project]` table: no `[build-system]` and no declared
dependencies at all, so both the PEP 517 backend and every runtime dependency are supplied by this
recipe. The source is a GitHub archive of `master@7f043c3` (2024-09-19), there being no tags or PyPI
release, and two stray committed build artefacts are excluded from the wheel.

The directory is `pydowker` while upstream is `pyDowker`, deliberately: a recipe directory is named
after the conda package it builds, and conda package names are lowercase. The import name keeps
upstream's casing, which was never ours to choose.
