---
type: environment
title: kmapper
summary: KeplerMapper, a Python implementation of the Mapper algorithm for building nerve-graph summaries of a point cloud.
portability_grade: L1
tags:
  - method/mapper
  - modality/point-cloud
---

# kmapper

KeplerMapper implements Mapper: cover the image of a lens function, cluster within each cover
element, and build the nerve of the result. It answers a different question from persistence —
Mapper produces an inspectable graph you can colour by a covariate, rather than a barcode.

The library is pure Python but has no conda package, so this fixture stages an in-repo recipe
and grades L1.
