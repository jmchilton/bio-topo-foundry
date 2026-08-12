---
type: environment
title: mmseqs2
summary: MMseqs2, for fast sequence clustering — the tool that makes leakage-safe benchmark splits practical.
portability_grade: L4
publication_candidate:
  state: CONFIRMED
  uri: quay.io/biocontainers/mmseqs2:18.8cc5c--hd6d6fdc_0
  digest: sha256:3503bfe576d560e550df2872af86a1ad1bcc1c06cfb7caadd3e7a95649f5f0ef
  observed_at: "2026-08-12T23:30:56.980Z"
tags:
  - application/structure-qa
  - modality/sequence
---

# mmseqs2

MMseqs2 clusters sequences fast enough to be run over a whole benchmark. That is why it is in
this corpus: honest evaluation of a structure-QA model requires splits held out by sequence
similarity rather than at random, and an unclustered split quietly inflates every number
downstream of it.

One Bioconda package, locked green, and a BioContainer pulled to check it is there — the digest is
in the frontmatter.
