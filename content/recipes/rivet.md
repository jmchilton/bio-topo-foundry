---
type: recipe
title: rivet
summary: RIVET's Qt-free console engine for two-parameter persistence, compiled from a pinned master commit and deliberately published under a different package name.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/multiparameter-persistence
  - modality/point-cloud
---

# rivet

This recipe builds `rivet_console` and nothing else. RIVET ships a Qt5 GUI viewer alongside the
computation engine, and nothing in this corpus drives the GUI — [[pyrivet-recipe]] shells out to the
console binary, and [[pydowker-recipe]] sits above that. Dropping Qt removes the heaviest build
dependency for a capability no one here uses.

**The conda package is named `rivet-console`, not `rivet`**, and the directory it lives in is the
odd one out for it. conda-forge already carries an unrelated project called `rivet` — a
high-energy-physics analysis toolkit at 3.x and 4.x — which under strict channel priority would
shadow this one entirely. The installed binary is still `rivet_console`, which is what pyrivet
executes, so the rename costs nothing downstream.

Three build details were each a failure first. Upstream's `CMakeLists.txt` sets `CMAKE_CXX_FLAGS`
with the existing value unquoted, which is harmless on a bare Ubuntu box where the variable is
empty and fatal under conda activation, where it is a space-separated string CMake then parses as a
list; the recipe re-quotes the line with `sed`. `cmake <4` is pinned because RIVET and both of its
ExternalProject sub-builds declare `cmake_minimum_required(VERSION 3.1)`. And the build runs at
`-j2`, because the arrangement translation units compile at `-ftemplate-depth=1024` and peak near
2 GB each — a full fan-out OOM-kills the compiler on a memory-limited runner.

There are no upstream tags, so the source is a GitHub archive of `master@32ce9e8` (2023-08-08).
GPL-3.0-or-later is redistributable copyleft, so publication is open; the `git` and network access
the ExternalProject clones need is what to resolve first.
