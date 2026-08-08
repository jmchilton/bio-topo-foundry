---
type: environment
title: r-tda
summary: The R TDA package, covering persistent homology, density clustering, and statistical inference on diagrams from R.
portability_grade: L1
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# r-tda

`TDA` is the established general-purpose R package for the field, and it carries statistical
machinery — confidence bands, bootstrap inference on diagrams — that the Python stack tends not
to. It matters here because a great deal of bioinformatics analysis is written in R, and a
Python-only corpus would quietly exclude it.

The fixture stages an in-repo CRAN recipe with compiled code, holding it at L1.
