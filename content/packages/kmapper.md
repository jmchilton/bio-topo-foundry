---
type: package
title: KeplerMapper
summary: The scikit-tda implementation of Mapper — cover, cluster, take the nerve — producing an inspectable graph rather than a barcode.
repository: https://github.com/scikit-tda/kepler-mapper
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/mapper
  - modality/point-cloud
---

# KeplerMapper

KeplerMapper implements Mapper, the other topological summary. Choose a lens — a function from the
data to a low-dimensional space, often a projection, a density estimate, or the first components of
an embedding. Cover the image with overlapping intervals. Cluster the points falling in each cover
element with any scikit-learn clusterer. Build a graph whose nodes are those clusters and whose
edges join clusters that share a point. The result is a network you can lay out, colour by a
covariate, and look at.

That last clause is the point of the tool and the reason it sits apart from everything else profiled
here. A barcode is a summary you feed to something; a Mapper graph is a summary you show a
biologist. KeplerMapper leans into it — its primary output is a self-contained interactive HTML
page, and the API is arranged around producing one.

## What it does not inherit

Mapper is not stable in the sense [[persistent-homology]] means. The output depends on the lens, the
number of cover intervals, the overlap fraction, and the clustering algorithm and its parameters,
and a modest change to any of them can change the graph's connectivity — not just its layout.
There is no theorem here bounding the change in output by the change in input.

That does not make it unusable; it makes it a different kind of instrument. Mapper is for
generating hypotheses you then check by another route, and a Mapper graph presented as a result
without its parameter settings is not reproducible in any useful sense. The corpus keeps it as a
distinct method tag rather than filing it under persistence for exactly this reason.

The upstream project classifies itself as alpha and has for a long time. Read that as a statement
about the API's stability rather than about the algorithm, which is old and well understood.

## Three names for one thing

The repository is `kepler-mapper`, the import and conda package are `kmapper`, and the
documentation lives under `kepler-mapper.scikit-tda.org`. The note and the fixture here use the
package name, since that is what appears in a manifest.

## In this corpus

[[kmapper-environment]] stages [[kmapper-recipe]], which is the only thing holding it at L1 — the
library is pure Python with unremarkable dependencies, and its absence from conda is a packaging
gap rather than a technical one. [[scikit-tda]] bundles it. The technique is Mapper; the corpus
otherwise reaches for [[topometry]] when the question is a graph-shaped view of high-dimensional
biological data.
