---
type: package
title: open-topoqa-scorer
summary: The MIT clean-room ProteinGAT interface-quality scorer, retrained from the paper rather than reusing an unlicensed checkpoint.
repository: https://github.com/jmchilton/open-topoqa-scorer
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-scorer

This is the model half of the open structure-QA path: a graph attention network that reads the
interface graphs [[open-topoqa-featurizer]] emits and predicts a DockQ-like interface-quality score
between zero and one. Ranking candidate structures for one target is what it is for, and it is a
ranking aid rather than a statement that any candidate is biologically correct.

## Why it was written

The same reason as the featurizer, one step further along. [[topoqa]] ships inference code and a
pretrained checkpoint under no license, so neither could be redistributed. But a checkpoint has a
second problem the featurizer did not: even if it were licensed, it was trained against the
featurizer that builds edge coordinates as `(x, y, y)`, so it is fitted to inputs a correct
featurizer does not produce. Reusing those weights was neither permitted nor coherent, which is why
the weights here are a retrain on a reassembled MAF2 and Dockground corpus rather than a port.

Divergence from the released checkpoint is consequently the correct outcome and not a shortfall. The
comparison is recorded in [[topoqa]]: measured against a corrected `(x, y, z)` upstream, the retrain
matches or beats every correlation and reaches ranking-loss parity on HAF2. [[topoqa-interface-quality]]
holds the upstream-side evidence that comparison rests on.

## What the paper pins, and what is ours

The architecture is the paper's and is followed exactly: additive edge-conditioned multi-head
attention over the source node, the target node, and the edge embedding; edges updated at every
layer from the two updated endpoints and the previous edge; the updated edges mean-pooled and
reduced to half the node width, concatenated with the pooled nodes, passed through three stacked
linear layers and a sigmoid; mean-squared error against DockQ.

Everything else is ours, and the distinction is not a hedge. Neither the main text nor the
supplementary tables state a value for the number of layers, attention heads, embedding widths,
dropout, optimizer, learning rate, epochs, or batch size — the supplement's tables are results and
ablations, not hyperparameters. Those defaults are chosen from common practice and tuned on
validation. They are never claimed as reproductions, and a reader comparing this model to the
published one should treat capacity as an uncontrolled difference.

One departure is deliberate rather than forced. Mean-squared error alone lets the model collapse a
decoy set onto its target mean: absolute fit looks reasonable while within-target ordering
approaches random, which is the one thing a selection model must not do. An optional within-target
pairwise hinge penalizes mis-ordering two decoys of the same target and can be added to the loss.
It is off by default, so the default training objective stays the paper's.

## What it is worth against the alternatives

Two results in the repository's benchmark record are worth carrying into any decision to use it.
Against a trained non-topological competitor and against training-free AlphaFold-confidence
baselines, run on identical decoys under one metric implementation, the model's advantage appears
clearly in rank correlation and top-N success — and largely disappears in top-1 ranking loss, where
mean interface pLDDT is about as good. Reporting only the metric that favors the method would
misrepresent it.

The second is that the residual gap to upstream localizes to a couple of targets whose single
top-ranked decoy is mis-selected, and survived a capacity, dropout, epoch-budget, and
checkpoint-selection sweep unchanged. That points at an unspecified upstream training detail rather
than at a reproducible component, and it is the honest boundary of what a paper-only reproduction
reaches.

## A packaging gap worth knowing about

The distributed package carries the model, the data adapter, the training loop, and the metrics.
It does not carry weights: the trained checkpoints live in the repository, outside the wheel's
package directory. Anything installing this from a channel gets machinery that must be trained or
pointed at a checkpoint obtained separately, which is not what a reader arriving from the recipe
would assume.

## In this corpus

[[open-topoqa-scorer-recipe]] builds it and [[open-topoqa-scorer-environment]] stages it together
with the featurizer, since that dependency is on no public channel yet; both are authority for
versions and dependencies. [[score-docking-poses]] is the procedure that puts the pair to work. The
technique is [[topological-deep-learning]] and the subject it replaces is [[topoqa]].
