---
type: environment
title: giotto-tda
summary: giotto-tda, the scikit-learn-compatible TDA toolkit, and the corpus's deliberate out-of-profile L0 fixture.
portability_grade: L0
tags:
  - method/persistent-homology
  - method/mapper
  - modality/point-cloud
---

# giotto-tda

giotto-tda offers persistence, Mapper, and time-series topology behind a scikit-learn
transformer API, which makes it convenient inside an ordinary ML pipeline.

It is the corpus's intentional L0 fixture. giotto-tda is wheel-only on PyPI — no sdist and no
conda package — so the manifest reaches it through `[pypi-dependencies]` and falls out of the
biopixi profile entirely. This is a packaging fact, not a judgement about the library. Adding a
recipe under `recipes/giotto-tda` and switching to a path dependency would promote it to L1;
nothing about the software prevents that.
