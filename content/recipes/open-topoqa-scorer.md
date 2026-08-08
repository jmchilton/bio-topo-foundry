---
type: recipe
title: open-topoqa-scorer
summary: The clean-room ProteinGAT retrain that scores what the sibling featurizer produces, packaged as the second half of an open TopoQA vertical.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# open-topoqa-scorer

The scoring half of the open TopoQA vertical, packaged for the same reason as
[[open-topoqa-featurizer-recipe]]: the upstream implementation is unlicensed, so the only
redistributable version is one written from the paper. The architecture came from the Methods
section — edge-conditioned multi-head attention updating both nodes and edges, half-width pooled
edges, a three-linear readout, sigmoid, MSE loss — and nothing else did. The paper specifies no
training or capacity hyperparameters at all, so heads, width, layers, dropout, learning rate, and
epochs are ours. See [[open-topoqa-scorer-environment]] and [[topoqa-interface-quality]].

The weights are a retrain on a reassembled MAF2 and Dockground corpus. There is no upstream
checkpoint to match, and divergence from the released one is the correct outcome rather than a
failure: measured against a corrected `(x, y, z)` TopoQA, the retrain matches or beats every
correlation and reaches HAF2 ranking-loss parity.

The recipe declares `pytorch` and `pytorch_geometric` explicitly because the ProteinGAT model
imports them directly rather than inheriting them. Its `open-topoqa-featurizer` run dependency is
on no public channel yet, so the consuming fixture stages both as sibling path recipes and drags a
full torch closure behind them. MIT and noarch, so both could go to a channel together.

Verified green with a solved linux-64 lock.
