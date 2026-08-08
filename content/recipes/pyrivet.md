---
type: recipe
title: pyrivet
summary: The pure-Python interface to RIVET — trivial to build, and useless without the console engine the sibling recipe supplies.
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

# pyrivet

pyrivet builds bifiltrations and then shells out to `rivet_console` for the actual two-parameter
Betti numbers and barcodes. That makes it the easiest build in this set and the clearest
illustration of why a green build is not a working package: pyrivet installs and imports perfectly
while computing nothing at all, unless [[rivet-recipe]] has put the engine on `PATH`.

It is on neither PyPI nor any conda channel and carries no git tags, so the source is a GitHub
archive of `master@7a07d19` (2024-08-29). `setuptools_scm` needs a version from somewhere and there
is no VCS in an archive, so the build feeds it `SETUPTOOLS_SCM_PRETEND_VERSION`.

BSD-3-Clause, pure Python, noarch — nothing blocks publication except that the engine it depends on
would have to go first.
