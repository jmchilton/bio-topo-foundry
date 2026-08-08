---
type: method
title: Simplicial Learning
summary: Learn on the complex itself — message passing over simplices and their Hodge structure rather than over graph edges.
facet_tag: method/simplicial-learning
tags:
  - method/simplicial-learning
  - method/topological-deep-learning
  - modality/graph
---

# Simplicial Learning

## What it changes

A graph neural network passes messages along edges, so its atomic unit of relationship is a pair.
That is a real modelling assumption, and it is often wrong: a three-way interaction has to be
encoded as three pairwise ones, and the network cannot recover the difference between "these three
interact together" and "these three interact in pairs."

Simplicial learning makes the higher-order relationship a first-class object. Signals live on
simplices of every dimension — vertices, edges, triangles — and messages flow through the boundary
operators that relate them. The Hodge Laplacian supplies the structure: it decomposes a signal on
edges into a gradient part, a curl part, and a harmonic part, and the harmonic part corresponds to
the complex's actual holes.

This is what separates it from the rest of [[topological-deep-learning]]. Elsewhere in that family,
topology is computed first and handed to a conventional model as features. Here the topology is the
domain the model runs on, and the architecture — not the preprocessing — is the topological claim.

## When the extra structure earns its cost

The case for it is strongest when the data genuinely carries higher-order relations rather than
having them inferred:

- Flows and currents on edges, where the gradient/curl/harmonic split is meaningful directly.
- Systems where triple-and-higher interaction is the physical reality rather than a modelling
  convenience — co-expression among gene sets, multi-body contacts, coauthorship.
- Settings where cycle structure is the signal, since the harmonic component isolates it.

The case is weakest when the complex is manufactured from pairwise data by a rule you chose. If
triangles are added wherever three nodes are mutually adjacent, the higher-order structure is a
deterministic function of the graph, and a graph network with enough capacity can in principle learn
the same thing. The construction of the complex, not the architecture, is doing the work — and it
deserves the scrutiny.

## What to be skeptical about

**Evidence is thinner than for the feature-based branch.** Simplicial and higher-order architectures
are considerably newer than persistent-homology-as-features, and the benchmark record is shorter and
less adversarial. Comparisons against a well-tuned graph network on the same complex, rather than
against a weaker graph baseline, are what to look for and are not always present.

**Cost scales with dimension.** The number of *k*-simplices grows quickly, and both memory and time
follow. A complex truncated at dimension 2 is the usual practical compromise, which limits how much
of the promised higher-order structure is actually used.

**Orientation is a real implementation hazard.** Simplices must be oriented for boundary operators
to be defined, results must not depend on the choice, and the bookkeeping is easy to get subtly
wrong. This corpus has direct experience of an adjacent failure: an upstream implementation building
boundary matrices from a simplex tree silently dropped isolated vertices, which is invisible on
connected inputs and breaks bipartite constructions entirely.

## What implements it here

- **[[hiponet]]** — higher-order networks over simplicial structure. Note the packaging caveat
  recorded in its notes: it runs from a pinned git clone because there is nothing installable to
  build, and it carries a licensing ceiling on top of that.
- Fixture: [[hiponet-environment]].

The thinness of this list is itself informative — one project against eleven for
[[persistent-homology]]. This is the least settled area in the corpus.

## Related

[[topological-deep-learning]] is the parent practice and the place to start.
[[persistent-laplacian]] shares the Hodge-theoretic machinery but uses it to summarize a filtration
rather than to define a network's domain.
