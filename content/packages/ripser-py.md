---
type: package
title: ripser.py
summary: The scikit-tda Python interface over the Ripser engine, returning persistence diagrams as arrays a scripted analysis can use.
repository: https://github.com/scikit-tda/ripser.py
languages:
  - Python
  - C++
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# ripser.py

ripser.py puts a Python API over the Ripser engine: pass a point cloud or a distance matrix, get
persistence diagrams back as arrays. That is a smaller-sounding contribution than it is. A
command-line tool that writes barcodes to standard output is a subprocess call and a parser away
from anything else you want to do, and this removes both.

It is a separate project from [[ripser-cpp]], with its own maintainers under the scikit-tda
organization — Christopher Tralie and Nathaniel Saul — and its own release series. It carries
Bauer's C++ as its computational core and attributes it explicitly. Both are MIT, so the
arrangement is uncomplicated.

Beyond the binding it adds things a wrapper does not have to: greedy permutation subsampling for
approximate diagrams on point clouds too large to do exactly, sparse distance-matrix support, and a
scikit-learn-shaped transformer for pipeline use.

## The name collision

Both this and [[ripser-cpp]] install as a conda package literally called `ripser` — this one from
conda-forge, that one from Bioconda — and the version series are far enough apart that a pin looks
like it disambiguates when it only narrows. The channel is the actual identity. Anyone writing
`ripser` into a manifest should decide which project they mean before deciding which version.

## In this corpus

[[ripser-py-environment]] resolves entirely from conda-forge and needs no recipe, but a single
conda-forge package does not earn an automatic container the way a Bioconda one does, so it grades
below its sibling despite being the easier thing to use. [[scikit-tda]] bundles it. The technique is
[[persistent-homology]].
