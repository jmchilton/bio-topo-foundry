---
type: package
title: giotto-ph
summary: A parallel Vietoris–Rips persistence engine that gathers three separate lines of Ripser work into one implementation.
repository: https://github.com/giotto-ai/giotto-ph
languages:
  - C++
  - Python
software_license:
  status: declared
  id: AGPL-3.0-or-later
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# giotto-ph

giotto-ph computes Vietoris–Rips persistence and does essentially nothing else, which is the right
scope for a backend. What makes it worth a note of its own is where it came from: it is a
reimplementation of Morozov and Nigmetov's lock-free Ripser, carrying the apparent-pairs
optimization introduced in Ripser 1.2 and an improved version of GUDHI's edge-collapse
preprocessing.

Three lineages, one binary. [[ripser-cpp]] contributed the algorithmic core and the apparent-pairs
shortcut; a separate research line contributed the lock-free parallelization; [[gudhi]] contributed
the collapse. This is the sense in which the field's engines are not really independent — the
implementations profiled in this corpus fork and re-merge, and a benchmark comparing "Ripser versus
giotto-ph" is comparing two points on one line of descent rather than two designs.

## Where the speed comes from

Two distinct places, and they compose.

**Parallelism.** Apparent-pair detection and the coboundary matrix reduction are both distributed
across threads. That matters because Ripser's own design is what made this possible: the implicit
coboundary representation means threads are not contending over a shared explicit matrix, and the
lock-free structures (the vendored `junction` and `turf`) handle what contention remains.

**Edge collapse.** A preprocessing pass that removes edges the Rips filtration's persistence does
not depend on, shrinking the complex before any reduction happens. This is the one that changes what
is *feasible* rather than how fast the feasible thing runs: H₂ on a few thousand points is often the
difference between a job that finishes and one that does not, and collapse is usually how it
finishes.

It also supports distance-to-measure reweighted filtrations, which is the standard answer to Rips
persistence being fragile against outliers — a single stray point can create long spurious bars, and
reweighting by local density suppresses them.

## Building it is the hard part

The C++ engine arrives as git submodules — pybind11, junction, turf — and an sdist does not carry
submodules, so the build must reach for git and therefore for the network. That is the constraint
holding [[giotto-ph-recipe]] out of a public channel, since channels build offline; it is shared
with [[pyflagser-recipe]] and [[rivet-recipe]] and it is one problem rather than three. Vendoring
the submodules into a source archive would solve all of them.

Two smaller build facts, both symptoms of vendored code aging at a different rate than its host: the
sources need a force-included `<cstdint>` because GCC 13 dropped a transitive include they relied
on, and `cmake` has to be pinned below 4 because junction's `cmake_minimum_required` predates the
floor CMake 4 enforces.

## In this corpus

[[giotto-ph-environment]] stages [[giotto-ph-recipe]], verified green on linux-64, which is what
caps it at L1. AGPL-3.0 is redistributable copyleft, so licensing is not the blocker — publishing
the recipe would lift the fixture to L3 once the network dependency is resolved. The network clause
that comes with the AGPL is discussed under [[giotto-tda]], which heads this family and consumes
this engine for its persistence. The technique is [[persistent-homology]].
