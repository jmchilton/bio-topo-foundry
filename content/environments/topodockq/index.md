---
type: environment
title: topodockq
summary: The TopoDockQ scorer run from a pinned git clone; MIT-licensed but built around a Python 3.8 bytecode core with no source.
portability_grade: L0
tags:
  - method/persistent-laplacian
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# topodockq

This fixture reproduces TopoDockQ's dependency closure from its `environment.yaml` — locked
green on linux-64 — and runs the scorer from its pinned clone at `@5696f82`. See [[topodockq]]
for the software profile.

Like [[hiponet-environment]] it is a clone-and-run L0, but for a different reason, and this one
is not about licensing at all. TopoDockQ is MIT. Its core feature generator is distributed as
CPython 3.8 `.pyc` bytecode with no corresponding source, so there is nothing to compile and
the exact interpreter version becomes load-bearing. If upstream ever ships the source, this
fixture could reach L3 with no licensing obstacle.

The featurizer half of that bytecode gap is already closed independently by
[[open-topodockq-featurizer-environment]], so downstream work no longer has to run the
bytecode at all.
