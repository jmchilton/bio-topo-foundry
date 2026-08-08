---
type: environment
title: persim
summary: persim, the scikit-tda component for comparing and vectorizing persistence diagrams once they have been computed.
portability_grade: L3
tags:
  - method/persistent-homology
---

# persim

persim sits downstream of every engine that produces a diagram. It supplies the distances and
vectorizations — bottleneck and Wasserstein, persistence images, landscapes — that turn a
variable-length diagram into something a statistical or machine-learning model can consume.

Keeping it as its own fixture separates the *computation* of persistence from its
*representation*, which are different decisions with different failure modes.
