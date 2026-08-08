---
type: replication_experiment
title: HiPoNet melanoma replication
summary: The closest recoverable released procedure reached 67.27% against a reported 90.90%, on a platform arm that cannot yet settle why.
artifact:
  repository: https://github.com/jmchilton/hiponet-melanoma-replication
  revision: 9089997af15db5befe59dff29bb8b2cf8cc47269
  protocol: docs/protocol.md
  evidence_manifest: results/reference/manifest.json
arc:
  - replicate
  - harden
  - extend
status: running
replication_outcome: inconclusive
redistribution: mixed
tags:
  - method/simplicial-learning
  - method/topological-deep-learning
  - application/single-cell
  - modality/high-dim-tabular
---

# HiPoNet melanoma replication

## What was tested

[[hiponet]] predicts patient-level labels from high-dimensional cellular point clouds using
multi-view simplicial complexes. The claim under test is its melanoma result: 90.90% patient-level
classification accuracy on the Yale melanoma cohort.

The cohort was reconstructed from the exact Mendeley Data v1 URLs, verified by byte size and
SHA-256 before use, and written as 54 ordered patient point clouds without splitting or
subsampling.

## What came out

The closest recoverable released procedure reached **67.27%** mean best-test accuracy against the
reported 90.90%. A controlled intervention using the paper's wavelet formulation reached 69.09%
mean accuracy and 61.39% balanced accuracy.

**The outcome is recorded as inconclusive rather than as a failure to reproduce, and the
distinction is not politeness.** The completed arm ran on Apple MPS and is labeled a portability
arm; the locked Linux/CUDA target that would separate a platform effect from a procedural one has
not run. A number produced on the wrong platform cannot convict the method. What can be said is
narrower and still substantive: the closest released procedure did not recover the headline in the
environment that completed.

The hardening arm found something independent of that. The released procedure **selects its best
epoch on test patients.** Under a corrected evaluation that reserves test patients until after
selection, the best transparent arm is a cell-count diagnostic at 56.10% consensus balanced
accuracy, with a 95% bootstrap interval of 44.18–68.02% — an interval containing chance.

The extension arm asked whether explicit topological summaries predict response at all:
H0/H1 summaries reached 49.72% and persistence images 45.93% consensus balanced accuracy. No arm
robustly clears chance.

That last result is easy to over-read. It does not establish that no biological signal exists. It
establishes that the recovered cohort, under prespecified transparent representations and a
leakage-safe protocol, does not support a robust patient-level signal. Those are different claims,
and the study keeps its tracks separate precisely so they are not mixed.

## An upstream hazard this corpus has hit before

Building boundary matrices from a simplex tree can silently drop isolated vertices — invisible on
connected inputs, fatal on bipartite constructions. It is recorded under
[[simplicial-learning]] and is worth checking in any higher-order pipeline of this shape.

## Redistribution

Mixed, and structurally so. The core — data retrieval, cohort reconstruction, checked contracts,
transparent baselines, metrics, and evidence verification — is MIT. The faithful and hardened
neural runners derive from upstream HiPoNet and remain under Yale's non-commercial license, so they
live in a physically separate package that importing the core does not pull in. That separation is
the reason the MIT half is usable at all. Raw data, prepared arrays, run trees, and checkpoints are
deliberately not in version control.

## What would make this complete

Two things, in order: the locked Linux/CUDA arm, which is execution-ready at 25 folds and would
settle whether the accuracy gap is platform or procedure; and then a biopixi fixture re-running the
pinned repository here. The non-commercial license ceiling on the HiPoNet-derived component
constrains what such a fixture could distribute, which is the same ceiling recorded in the
[[hiponet]] note.

## Related

[[hiponet]] reviews the paper and software. [[simplicial-learning]] covers the technique;
[[topological-deep-learning]] the broader practice. [[topometry-cell-cycle]] is the other study
here where run-to-run variation turned out to be part of the finding.
