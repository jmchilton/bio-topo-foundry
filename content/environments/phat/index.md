---
type: environment
title: phat
summary: PHAT, the C++ persistent-homology matrix-reduction backend, exposed through pybind11 and built from an in-repo recipe.
portability_grade: L1
tags:
  - method/persistent-homology
---

# phat

PHAT is a reduction backend rather than a user-facing tool: it takes a boundary matrix and
reduces it, with several reduction algorithms and data structures to choose between. It belongs
in the corpus as a Tier-2 capability — the layer other tools sit on when they need control over
how reduction is performed.

The in-repo recipe compiles the C++ with pybind11 and is verified green on linux-64. PHAT is
LGPL-3.0, which is redistributable, so publishing the recipe would lift this fixture to L3; the
L1 grade reflects only that the build currently lives in this repository.
