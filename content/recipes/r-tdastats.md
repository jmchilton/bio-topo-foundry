---
type: recipe
title: r-tdastats
summary: The Ripser-backed R persistence package, built from CRAN because no conda channel carries the R side of the field at all.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# r-tdastats

TDAstats wraps Ripser for R, so it is the fast persistence path for an R-based analysis in the way
[[ripser-py-environment]] is for Python. Together with [[r-tda-recipe]] it is why the corpus is not
Python-only. See [[r-tdastats-environment]].

Neither conda-forge, bioconda, nor the `r` channel carries it, which is the whole gap. GPL-3.0-only
is redistributable, so publication is open.

Verified green under `rattler-build` on linux-64 — it compiles the Rcpp sources and the library
loads. That makes it the worked example for the R packaging shape, and the reason
[[r-tda-recipe]]'s unverified compiled build is a matter of confirming rather than of inventing.
