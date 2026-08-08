---
type: recipe
title: example-tda-package
summary: A small example showing the minimum metadata required for one in-repo build of a package the channels do not carry.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
---

# example-tda-package

The body says which gap the recipe closes, what was load-bearing about getting it to build, and
what stands between it and a public channel. The `recipe.yaml` beside it stays the authority on
the version, the licence, and every dependency, so no note restates a pin.
