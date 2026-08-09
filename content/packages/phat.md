---
type: package
title: PHAT
summary: The persistent-homology matrix-reduction backend — you bring the boundary matrix, it reduces it, and it lets you choose how.
repository: https://bitbucket.org/phat-code/phat
languages:
  - C++
  - Python
software_license:
  status: declared
  id: LGPL-3.0-or-later
tags:
  - method/persistent-homology
---

# PHAT

PHAT is a layer below every other library profiled here. It does not build complexes, does not read
structures, and does not produce a barcode from a point cloud. It takes a boundary matrix and
reduces it, and it exposes the choices that step involves rather than making them for you: standard,
twist, chunk, and spectral-sequence reduction algorithms over several column representations, with
optional parallelism.

That is a narrow interface and a deliberate one. Reduction is where persistence computation actually
spends its time, and the algorithm and data structure that win depend on the shape of the matrix —
which is a property of the problem, not of the library. Most tools pick for you. This one is for
when the pick is the thing you are studying, or when you have a complex from somewhere else entirely
and want persistence out of it without adopting a framework.

Practically, that makes it a capability the corpus holds rather than a tool it runs. Nothing here
uses PHAT as a step in a pipeline today; it is present because a foundry that only carries
entry-point tools cannot answer questions about the layer underneath them.

## Licensing

LGPL-3.0-or-later, which is redistributable copyleft with the isolate-and-notice obligations rather
than a blocker. Nothing prevents this from reaching a public channel — the recipe simply has not
been submitted.

## In this corpus

[[phat-environment]] stages [[phat-recipe]], which compiles the C++ with pybind11 and is verified
green; that in-repo build is the only reason the fixture sits at L1 rather than L3. The technique is
[[persistent-homology]], which lists it as a building block rather than an entry point.
