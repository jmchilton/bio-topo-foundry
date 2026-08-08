---
type: environment
title: ripser-py
summary: The ripser.py Python bindings over the Ripser engine, for computing persistence diagrams inside a Python workflow.
portability_grade: L3
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# ripser-py

`ripser.py` wraps the same underlying engine as [[ripser-cpp]] in a Python API that returns
persistence diagrams as arrays, which is what a scripted analysis usually wants. It resolves
entirely from conda-forge, so it needs no in-repo recipe, but it is not a single Bioconda
package and so does not pick up an automatic container.

See [[ripser-cpp]] for why two fixtures pin a package of the same name.
