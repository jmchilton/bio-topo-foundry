---
type: package
title: Ripser
summary: The lean C++ engine that made Vietoris-Rips persistence fast enough to stop being the bottleneck, in about a thousand lines.
repository: https://github.com/Ripser/ripser
languages:
  - C++
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# Ripser

Ripser computes Vietoris–Rips persistence barcodes and nothing else. That narrowness is the design:
Ulrich Bauer's implementation is roughly a thousand lines in a single file, and it is the reference
for how fast this particular computation can be made to go. Where a general library gives you many
complexes at reasonable speed, Ripser gives you one at a speed that changed what people attempted.

The techniques behind that are the interesting part rather than the line count. It works in
cohomology instead of homology, applies the clearing optimization to skip columns whose reduction
is already determined, computes the coboundary matrix implicitly rather than storing it, and prunes
via the emergent-pairs shortcut. The effect is that memory, not time, is usually what stops a Rips
computation now — and that a great deal of downstream work, including [[giotto-ph]] and the R
wrapper in [[r-tdastats]], is Ripser-derived rather than independently written.

## The name collision

`ripser` is the conda package name of two different projects, and anyone writing a manifest hits
this. Bioconda ships this C++ command-line tool as `ripser`; conda-forge ships [[ripser-py]], a
distinct Python project from the scikit-tda organization, also as `ripser`. Different upstreams,
different authors, different version series — the pin alone does not disambiguate them, the channel
does.

They are related, which is what makes the collision plausible rather than absurd: [[ripser-py]]
carries this engine's C++ code as its core and says so. But a note profiling software profiles one
repository, and these are two.

## What it is not

Not a library with an API you call — the fixture here installs a command-line binary that reads a
distance matrix or point cloud and writes barcodes. Not a general TDA toolkit: no alpha complexes,
no Mapper, no vectorization. When Rips is not what you want, [[gudhi]] is the honest answer.

## In this corpus

[[ripser-cpp-environment]] is the cleanest point on the portability ladder in the whole corpus —
one Bioconda package, no recipe, no glue, and therefore an automatic container. The technique is
[[persistent-homology]], whose cost section leans on this implementation directly.
