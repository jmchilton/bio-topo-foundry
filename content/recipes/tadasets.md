---
type: recipe
title: tadasets
summary: The scikit-tda synthetic-dataset generator, and the only recipe here with a pull request open against a public channel.
gap: absent
build:
  status: verified
  platforms:
    - osx-arm64
upstreaming: submitted
submission: https://github.com/conda-forge/staged-recipes/pull/34367
tags:
  - modality/point-cloud
---

# tadasets

tadasets generates the synthetic point clouds the field tests against — tori, swiss rolls,
`dsphere`, the infinity sign — the shapes whose homology you already know, which is what makes them
useful for checking that an implementation returns the right barcode.

It is the smallest package in this set and it was blocking two closures at once, which is why it is
the one that got submitted. A missing tadasets kept the [[scikit-tda-recipe]] closure from resolving
from channels, and it was a declared runtime dependency of petls-pytorch until
[[petls-pytorch-recipe]]'s fork demoted it to a benchmark extra. That demotion is now merged
upstream, so this recipe backs only the scikit-tda gap.

The recipe is verified green on osx-arm64 — the sdist checksum matches, setuptools builds, the
import and `pip check` pass. It is a pure-Python universal wheel, so `noarch: python` makes the
artefact byte-identical on linux-64.

A pull request is open at [conda-forge/staged-recipes
#34367](https://github.com/conda-forge/staged-recipes/pull/34367). When it lands, this note stops
being a build and becomes history.
