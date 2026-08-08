---
type: recipe
title: open-topodockq-featurizer
summary: The open persistent-Laplacian featurizer that replaces TopoDockQ's bytecode-only one, built over our petls-pytorch fork.
gap: absent
build:
  status: verified
  platforms:
    - osx-arm64
upstreaming: eligible
tags:
  - method/persistent-laplacian
  - application/structure-qa
  - modality/molecular-structure
---

# open-topodockq-featurizer

TopoDockQ ships its scorer as open MIT source and its featurizer only as `.pyc` bytecode. This
recipe packages the replacement: an open implementation that emits the raw 2,754-element
channel-major vector the published scorer consumes, which is what turns that bytecode gap from
documented into closed. See [[open-topodockq-featurizer-environment]] and [[topodockq]].

It builds over [[petls-pytorch-recipe]]'s engine, and specifically over the fork, because the
bipartite interface complexes it constructs put isolated vertices into a simplex tree and the
stock 1.0.2 boundary extraction dropped them. That fix is why the fork exists.

Both this recipe and the engine beneath it are pure-Python noarch and Bioconda-eligible, so
publishing the pair promotes the fixture from L1 to L3 or L4. Verified green on osx-arm64 — build,
import, and `pip check` — which for a noarch package verifies the artefact regardless of platform;
the consuming environment's linux-64 lock, with the full torch closure, solves cleanly on top.
