---
type: method
title: Spectral Geometry
summary: Recover a dataset's latent geometry from the spectrum of an operator built on its neighbourhood graph, rather than assuming a shape in advance.
facet_tag: method/spectral-geometry
tags:
  - method/spectral-geometry
  - application/single-cell
  - modality/high-dim-tabular
  - modality/point-cloud
---

# Spectral Geometry

## The idea

Build a neighbourhood graph on your data, form an operator on it — a Laplacian, a diffusion
operator — and read the geometry off its eigenvectors. The low eigenvectors give coordinates that
respect local structure, and the eigenvalues say how much structure each coordinate carries.

The mathematical basis is that the Laplace–Beltrami operator on a manifold determines a great deal
of its geometry, and that a graph Laplacian on samples drawn from a manifold converges to it. So
the spectrum of a matrix you can compute approximates the geometry of a manifold you cannot
observe. Laplacian eigenmaps and diffusion maps are the classical instances; diffusion maps add a
time parameter that controls how far structure is propagated before it is read.

This is a different lineage from persistent homology, and the difference is the point.
[[persistent-homology]] is topological — it counts holes and is deliberately blind to how far apart
things are. Spectral geometry is metric: it is about distances, densities, and the diffusion
between points, and it produces coordinates rather than invariants.

## Why single-cell work runs on it

Single-cell expression data is the case that made these methods routine. Cells sit in thousands of
dimensions, the biologically meaningful variation is low-dimensional, and the structure is
frequently continuous — a differentiation trajectory is a path, not a cluster.

Spectral methods suit that shape. They do not assume clusters, they represent continuity natively,
and their coordinates are ordered by how much structure each explains. Nearly every step of a
standard workflow is spectral underneath: the neighbourhood graph, the diffusion-based denoising,
the embedding.

## The problem nobody solved by picking a default

Every spectral pipeline embeds a chain of choices: which distance metric, how many neighbours, which
kernel, which normalization of the Laplacian, how many eigenvectors, and how to lay the result out
in two dimensions for viewing. Each choice changes the answer, and the field's usual practice is to
adopt one chain as a default and stop asking.

That is the practice [[topometry]] was built to attack, and it is why the fixture exists here. Its
argument is that the right response to an unresolvable choice is to *evaluate* it rather than fix
it — construct many latent geometries from the same data, and score how well each preserves the
original structure, rather than defending one pipeline. The evaluation is the contribution; the
individual operators mostly predate it.

The corollary is worth stating plainly for anyone reading a single-cell embedding: a
two-dimensional layout is the end of a long chain of decisions, and the visual impression it gives
of "how many populations there are" is not a finding. Distances between clusters in a UMAP plot are
not distances.

## What to watch

- **Neighbourhood size is the dominant knob.** Too small fragments a continuous trajectory into
  spurious clusters; too large merges genuinely distinct populations. It deserves a sensitivity
  check, not a default.
- **Density confounds geometry.** A densely sampled region and a genuinely tight region look alike
  to a plain nearest-neighbour graph. Diffusion-based normalizations exist specifically to separate
  the two, and the choice of whether to apply them is a modelling decision about your data.
- **Layout is not embedding.** The spectral coordinates and the 2-D picture drawn from them are
  different objects with different reliability, and conclusions should be drawn from the former.

## What implements it here

- **[[topometry]]** — the systematic approach: many latent geometries built and evaluated against
  each other rather than one pipeline asserted.
- Fixtures: [[topometry-environment]], [[topometry-1.1-environment]] (a pinned earlier line), and
  [[phate-environment]] for the diffusion-potential embedding used widely in trajectory work.

## Related

[[persistent-laplacian]] shares the spectral machinery but asks a topological question with it. The
two are easy to confuse from the names and are not the same practice: one recovers coordinates for
a dataset, the other summarizes shape across a filtration.
