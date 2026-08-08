---
type: recipe
title: kmapper
summary: KeplerMapper's implementation of the Mapper algorithm, packaged here because a pure-Python library on PyPI is on no conda channel.
gap: absent
build:
  status: unverified
upstreaming: eligible
tags:
  - method/mapper
  - modality/point-cloud
---

# kmapper

KeplerMapper is the corpus's Mapper implementation: cover the image of a lens function, cluster
within each cover element, take the nerve. It answers a different question from persistence —
an inspectable graph you can colour by a covariate, rather than a barcode — which is why
[[kmapper-environment]] exists as a fixture in its own right. See [[mapper]] for the method.

The library is pure Python and MIT, on PyPI and on no conda channel, which is the entire reason
this recipe exists and the entire reason that fixture grades L1. Publishing it would lift the
fixture to L3 or L4 with no technical work in between.

**This one has never been built.** The recipe was generated with `rattler-build generate-recipe pypi
kmapper` and nothing since has recorded a build. The fixture does carry a solved lock, which is
suggestive, but a lock is not a build log and this note will not claim it is.
