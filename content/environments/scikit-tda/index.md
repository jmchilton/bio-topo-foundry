---
type: environment
title: scikit-tda
summary: The scikit-tda meta-package, pulling the Python TDA stack together behind one install.
portability_grade: L1
tags:
  - method/persistent-homology
  - method/mapper
  - modality/point-cloud
---

# scikit-tda

scikit-tda is a meta-package rather than an implementation: it exists so that one install
brings the interoperating Python TDA components together. It is the fixture to reach for when
the question is whether the ecosystem coheres, not whether one engine is fast.

Its run closure includes `tadasets`, which is on no conda channel. That gap is closed by the
in-repo `recipes/tadasets` build (pure Python, MIT, verified green), so the fixture now
resolves entirely from conda channels plus that recipe — which is also what holds it at L1.
