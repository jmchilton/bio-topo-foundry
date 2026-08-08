---
type: recipe
title: scikit-tda
summary: The meta-package that pulls the Python TDA stack together behind one install, built here because the channels carry the parts but not the whole.
gap: absent
build:
  status: unverified
upstreaming: eligible
tags:
  - method/persistent-homology
  - method/mapper
  - modality/point-cloud
---

# scikit-tda

scikit-tda implements nothing. It exists so that one install brings the interoperating Python TDA
components together, which makes it the fixture to reach for when the question is whether the
ecosystem coheres rather than whether one engine is fast. See [[scikit-tda-environment]].

Its run closure is on conda channels with one exception, `tadasets`, which
[[tadasets-recipe]] supplies and has a staged-recipes pull request open for. Once that lands, the
only thing still holding [[scikit-tda-environment]] at L1 is this recipe.

**This one has never been built.** Nothing here records a `rattler-build` run, and the environment
has no solved lock either, so the recipe is a generated starting point — modelled on
`rattler-build generate-recipe pypi scikit-tda` — rather than a verified one. It is pure Python and
MIT, so there is no reason to expect trouble; there is also no evidence there is none. Building it
is the cheap next step, and it should happen before the tadasets PR makes this the last blocker.
