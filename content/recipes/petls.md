---
type: recipe
title: petls
summary: The reference persistent-topological-Laplacian library, built from source here and permanently stuck here, because upstream declares no licence at all.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: blocked
tags:
  - method/persistent-laplacian
---

# petls

This is the one recipe in the set that will never leave. PETLS declares no software licence
anywhere — no licence file, no `pyproject.toml` field, an empty `setup.py` value — so under default
copyright it is all rights reserved. conda-forge and Bioconda both require a bundled OSI licence,
and no amount of recipe quality substitutes for one. A licence has been
[requested upstream](https://github.com/bdjones13/PETLS/issues/2); until it lands, this build is a
local oracle rather than a shippable dependency, and [[petls-pytorch]] is the substitute that can
actually ship. See [[petls-environment]] for the fixture and [[petls]] for the software profile.

Getting it to build was not the hard part, but two constraints are permanent. It is **linux-64
only**: `petls.hpp` hardcodes `std::chrono::_V2::steady_clock`, a libstdc++ internal namespace that
does not exist under macOS libc++. And the alpha complex is switched off, because
`cpp/alpha.cmake` calls `include(${CGAL_USE_FILE})`, a mechanism CGAL removed at version 5 — the
upstream `-DPETLS_USE_ALPHA_COMPLEX=OFF` flag drops it along with the whole CGAL, GMP, MPFR, and
GUDHI-headers build requirement. Re-enabling alpha needs an upstream patch, not a recipe change.

The build also clones Eigen, pybind11, GUDHI, and Ripser through CMake `FetchContent` at configure
time, so it needs `git` and a network connection — which would itself be a problem at a channel
that builds offline, if the licence were not already the blocker.
