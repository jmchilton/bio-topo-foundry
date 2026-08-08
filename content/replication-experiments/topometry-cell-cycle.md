---
type: replication_experiment
title: TopoMetry cell-cycle replication
summary: The pancreas result reproduces directionally, but TopoMetry's 2-D layouts ignore their seed — so no single-run layout number should be quoted.
artifact:
  repository: https://github.com/jmchilton/topometry-cell-cycle-replication
  revision: 06f5873c5b5a89b60aa350eb31a2fbf6f373186f
  protocol: docs/pinning.md
  evidence_manifest: results/manifest.json
arc:
  - replicate
  - harden
status: blocked
replication_outcome: partially_reproduced
redistribution: restricted
tags:
  - method/spectral-geometry
  - method/persistent-homology
  - application/single-cell
  - modality/high-dim-tabular
---

# TopoMetry cell-cycle replication

## What was tested

[[topometry]] builds geometry-aware spectral scaffolds for single-cell data. The claim under test
is its developing-mouse-pancreas result: that TopoMetry's representations arrange cycling ductal
cells in cell-cycle-phase order more faithfully than conventional linear embeddings.

This is reproduction, not reimplementation. TopoMetry is MIT and the surrounding stack is BSD, so
the published code was read, installed, and run as released. The dataset is 3,696 cells and the
whole analysis runs in minutes.

## What came out

**The headline finding is about reproducibility, not geometry.** TopoMetry's spectral scaffolds are
deterministic — three refits under identical parameters agree to a pairwise-distance correlation of
1.0000. Its 2-D layouts are not, despite `random_state=0`: the loop statistic on `TopoMAP` ranges
0.532 to 0.918 across identical runs.

Since the paper's pancreas claim is a claim about a layout, **no single-run layout number should be
quoted without that spread — the paper's included.** A reported value could sit anywhere in that
band, and a comparison between two methods can be smaller than the noise in one of them.

Within that limit the published observation reproduces directionally. Cycling ductal cells are
arranged in phase order far more strongly in TopoMetry layouts (|ρ| = 0.897) than in linear PCA
(0.620), and the single-time spectral scaffold beats PCA on all three of the paper's own
preservation metrics.

Two sub-claims did not reproduce here. The multiscale scaffold ties PCA rather than beating it, and
TopoMetry's 2-D layouts score below `pca_umap` on the preservation metrics. And TopoMetry is not
shown to beat the conventional PCA → UMAP pipeline at the phase-ordering task itself: that gap
(0.897 against 0.836) is smaller than the run-to-run variation above. These are single-dataset
results measured against distributional published claims, which is a real limit on how far they
generalize.

The non-determinism was root-caused rather than merely observed — an unseeded ARPACK start, a
dropped seed with misaligned positional arguments in `spectral_layout`, a numba `prange` race in
the MAP optimiser, and the seed never reaching PaCMAP/UMAP/TriMAP. Each fix is verified, and an
upstream report is drafted but unsent.

## Packaging findings

Hardening surfaced several upstream facts that affect anyone installing this stack: a git install
reports version 1.0.2 for code identifying itself as 1.1.0 (the version bump was never committed,
while the PyPI 1.1.0 sdist is correct); `install_requires` omits eight packages the paper-facing
workflow needs, one of which is an unconditional import, so a bare install fails at `import topo`;
conda-forge carries only 0.2.1.1, predating the published API; and scVelo 0.3.4's default velocity
mode cannot run under NumPy ≥ 2. The fixtures [[topometry-environment]], [[topometry-1.1-environment]],
[[scvelo-environment]] and [[scanpy-environment]] exist because of these.

## Redistribution

Restricted, and this is what blocks the study. The pancreas object is served from a GitHub
repository with no license file, making it all-rights-reserved by default. It may be downloaded and
analysed locally; it may not be vendored, subsampled and committed, containerized, or shipped as a
test fixture. The tracked figures and numerical reports were produced from it, so the repository's
MIT code license does not extend to them and their status is explicitly unresolved.

An earlier assumption that a CC BY 4.0 Figshare fixture was available holds for some scVelo
datasets but not this one.

## What would make this complete

A redistributable fixture, which needs one of three things: an upstream license, regeneration from
GEO GSE132188, or a synthetic ground-truth fixture. This is why the status here is `blocked` rather
than `running` — the missing piece is a licensing resolution, not queued work.

The persistent-homology extension that would measure the cell-cycle loop quantitatively rather than
by layout inspection has not started, and its dependencies are deliberately kept outside the
replication environment so that a Foundry extension can never be mistaken for replication evidence.

## Related

[[topometry]] reviews the software. [[spectral-geometry]] covers the technique; the unstarted
extension would use [[persistent-homology]]. [[hiponet-melanoma]] is the other study here where the
released procedure's evaluation protocol turned out to be part of the finding.
