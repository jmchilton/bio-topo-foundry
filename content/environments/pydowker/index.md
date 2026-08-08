---
type: environment
title: pydowker
summary: "The full two-parameter persistence stack: pyDowker over pyrivet over the RIVET console engine, built as a three-recipe chain."
portability_grade: L1
tags:
  - method/multiparameter-persistence
  - method/persistent-homology
  - modality/point-cloud
---

# pydowker

This fixture is the corpus's route into multiparameter persistence, where a filtration varies
along more than one parameter at once — density and scale together, say, rather than scale
alone. It stages the whole chain from source: `pyDowker` for Dowker complexes, `pyrivet` as the
pure-Python API, and `rivet-console`, RIVET's Qt-free C++ engine.

It exists in this form because of a failure worth recording. An earlier version was a hollow
green: `import pyDowker` succeeded while the tool could not actually run, because
`rivet_console` was on no package index at all and nothing in the check noticed its absence.
Compiling RIVET's console supplies it, and the chain is now verified green end to end — RIVET
compiles and `rivet_console --help` answers, pyrivet and pyDowker install, a real
`DowkerComplex` imports, and `pip check` is clean.

Two build details are load-bearing. RIVET needs header-only Boost, `cmake <4`, and `-j2` to
avoid running out of memory on its template-heavy translation units. The conda package is named
`rivet-console`, not `rivet` — the latter is an unrelated conda-forge project. GPL-3.0 for
RIVET with BSD and MIT above it are all redistributable, so publishing the chain would reach
L3; the L1 grade reflects only that the recipes live here.
