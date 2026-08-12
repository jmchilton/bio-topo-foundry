---
type: environment
title: ripser-cpp
summary: The Ripser C++ command-line tool for fast Vietoris-Rips persistent homology, installed as a single Bioconda package.
portability_grade: L4
publication_candidate:
  state: CONFIRMED
  uri: quay.io/biocontainers/ripser:1.0.1--h9f5acd7_4
  digest: sha256:316e4319f94d9fd2de02e39f2910efa27d05b9a6760dd40e548c09b3a3d7cfea
  observed_at: "2026-08-12T23:30:56.980Z"
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# ripser-cpp

Ripser is the reference fast implementation of Vietoris-Rips persistent homology, and this
fixture installs the C++ command-line build rather than a Python binding. It is the cleanest
point on the ladder in this corpus: one Bioconda package, no recipe, no glue, and a BioContainer
pulled to check it is there — the digest is in the frontmatter.

The name collides with `ripser-py` deliberately. Both pin a package literally called `ripser`,
but from different channels — the Bioconda C++ CLI here, the conda-forge Python library there.
The channel is part of the mulled identity, so these are genuinely two environments rather than
one environment recorded twice.
