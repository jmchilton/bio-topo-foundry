---
type: method
title: Topological Deep Learning
summary: Learn the readout instead of hand-picking it — topological structure as input to a model, or as the domain the model operates on.
facet_tag: method/topological-deep-learning
tags:
  - method/topological-deep-learning
  - method/persistent-homology
  - application/molecular-sciences
  - application/structure-qa
  - modality/graph
---

# Topological Deep Learning

## Two things under one name

"Topological deep learning" covers two distinguishable practices, and papers rarely separate them.
The distinction is worth holding because they fail differently.

**Topology as features.** Compute a topological summary — a barcode, a persistence image, a
Laplacian spectrum — vectorize it, and feed it to a conventional model. The topology is a fixed
preprocessing step; the network never sees the complex. Most molecular work in this corpus is this
kind, and it is the older and better-validated of the two.

**Topology as domain.** Build the network to operate on the complex itself, with message passing
over simplices or cells rather than over graph edges. Here the topological structure is where
computation happens, not what is handed to it. [[simplicial-learning]] is this branch.

The first is an engineering choice about representation. The second is an architectural claim about
what a network should be. Conflating them makes the literature's evidence look stronger than it is,
because results from the well-trodden first practice get read as support for the second.

## Why it displaced hand-picked summaries

A barcode is not a vector, and everything downstream needs one. The bridge is a *vectorization* —
persistence images, landscapes, Betti curves, binned statistics — and every one of them embeds a
choice about which parts of the diagram matter. Choosing by benchmark is choosing a hyperparameter
on your test set.

Letting a model learn the readout is the natural response, and it is why the field moved. The cost
is that the guarantees do not survive the move: persistent homology's stability theorem bounds how
much the *diagram* moves, and says nothing about how much a learned function of it moves. Stability
is a property of the summary, not of the pipeline.

## The pattern that recurs

Across the applications in this corpus the successful shape is consistent, and it is worth stating
because it is easy to get backwards:

1. Restrict to the region that matters — a binding interface, a pocket, a neighbourhood — rather
   than computing over the whole structure.
2. Condition the complex on chemistry. Separate filtrations per element type or per interaction
   class, so the summary cannot average away the distinction the task depends on.
3. Summarize topologically.
4. Learn on the result, usually alongside non-topological features.

Step 2 is where most of the gain lives. Plain persistent homology on all atoms at once is
invariant to exactly the chemical differences that determine binding, and no amount of model
capacity downstream recovers information the representation destroyed. The surveys in this corpus
both make this their central methodological point: successful molecular TDA is *conditioned*
topology.

Step 4 is where most of the overclaiming lives. When a topological model beats a baseline, the
question is whether the topology contributed or the auxiliary features and the training setup did.
An ablation that removes the topological block is the cheapest honest answer, and it is frequently
absent.

## How to read results in this area

The benchmarks are heterogeneous and the reported numbers are often not comparable. Three habits
help:

- **Check the split.** Random splits on structural data leak, because homologous structures land on
  both sides. Family-, scaffold-, or time-aware splits are the meaningful ones.
- **Check whether correlations are pooled or per-target.** A single correlation computed across all
  targets at once can look strong while per-target ranking — the thing a user actually needs —
  is weak.
- **Check what the baseline is.** "Outperforms persistent homology" and "outperforms the current
  best structure predictor" are very different claims.

This corpus has direct experience of the third and second points: replicating a published
topological scorer reproduced its numbers while establishing that part of its reported margin came
from an implementation defect rather than from the method.

## What implements it here

- **[[topoqa]]** — graph attention over interface residues with topological node features, for
  protein complex interface quality assessment.
- **[[topodockq]]** — persistent-Laplacian features for peptide–protein complex assessment.
- **[[hiponet]]** — the domain branch: higher-order networks over simplicial structure.
- Fixtures: [[topodockq-environment]], [[hiponet-environment]],
  [[open-topoqa-scorer-environment]].

## Related

[[persistent-homology]] and [[persistent-laplacian]] are the usual feature sources.
[[simplicial-learning]] is the architectural branch. Both survey notes —
[[tda-tdl-molecular-sciences]] and [[tda-tdl-beyond-persistent-homology]] — are surveys of this
area specifically and are the right starting point for the literature.
