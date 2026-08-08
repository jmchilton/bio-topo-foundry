---
type: method
title: Mapper
summary: Compress a dataset into a graph by covering the range of a chosen filter function and clustering within each piece.
facet_tag: method/mapper
tags:
  - method/mapper
  - modality/point-cloud
  - modality/high-dim-tabular
---

# Mapper

## The construction

Mapper turns a point cloud into a small graph in three steps:

1. **Filter.** Choose a function on the data — density, a principal component, a disease score,
   anything real-valued — and evaluate it at every point.
2. **Cover.** Split the filter's range into overlapping intervals.
3. **Cluster and connect.** Cluster the points in each interval separately. Every cluster becomes a
   node; two nodes are joined when they share a point, which they can because the intervals
   overlap.

The result is a graph small enough to look at, in which shape is legible: a loop in the graph means
a loop in the data, and a flare means a subpopulation that separates along the filter.

Its appeal is that it is a *visualization* that survives high dimension. The output is meant to be
looked at, which is unusual in this corpus and accounts for much of Mapper's uptake outside
mathematics.

## Its relationship to persistent homology

Mapper is the nerve of a pullback cover, so it is a topological summary in the same family as
[[persistent-homology]] — but it behaves very differently in practice, and the difference is not
subtle.

Persistent homology takes no parameters beyond the complex and returns a stable, comparable
invariant. Mapper takes a filter, an interval count, an overlap fraction, and a clustering
algorithm with its own parameters — and the output graph changes substantially with all of them.
There is no stability theorem doing for Mapper what the stability theorem does for barcodes.

That is the honest headline: **Mapper is exploratory.** It is very good at suggesting structure and
poor at establishing it. A Mapper graph is a hypothesis-generating picture, and treating one as a
result is the characteristic misuse.

## Using it responsibly

- **The filter is the model.** Everything Mapper shows is structure relative to the filter you
  chose. Choosing it after seeing which choice gives a satisfying picture is circular, and it is
  the most common failure.
- **Vary the parameters and show it.** A feature that survives a range of interval counts and
  overlaps is worth attention; one that appears at a single setting is not. Reporting one graph
  from one parameter set, without saying what else was tried, hides the only diagnostic available.
- **Confirm findings by other means.** The appropriate output of a Mapper analysis is a
  subpopulation or a relationship to go and test, not a conclusion.

Used this way it earns its place, particularly early in an analysis when you do not yet know what
question to ask. Used as evidence, it will eventually embarrass you.

## What implements it here

- **[[kmapper-environment]]** — KeplerMapper, the standard Python implementation, with interactive
  HTML output.
- **[[giotto-tda-environment]]** — Mapper alongside persistence, in a scikit-learn-shaped API, so
  the parameter sweep above can be run as an ordinary grid search.
- **[[scikit-tda-environment]]** — bundles KeplerMapper with ripser.py and persim.

## Related

[[persistent-homology]] is the stable, non-visual counterpart, and the right tool once you know
what you are measuring. [[spectral-geometry]] is the other route from high-dimensional data to a
low-dimensional picture; it produces coordinates rather than a graph, and is metric rather than
topological.
