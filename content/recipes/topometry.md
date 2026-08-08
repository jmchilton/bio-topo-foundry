---
type: recipe
title: topometry
summary: TopoMetry 1.1.0, built because conda-forge stops at a release that predates the API the eLife paper is written against.
gap: stale
build:
  status: verified
  platforms:
    - osx-arm64
upstreaming: eligible
tags:
  - method/spectral-geometry
  - application/single-cell
  - modality/high-dim-tabular
---

# topometry

This is the only recipe here that exists despite the package being on a channel. conda-forge
carries exactly one TopoMetry build, `0.2.1.1`, which predates the `topo.sc.fit_adata` and
`topo.sc.preprocess` API that the eLife version of record (13:RP100361) describes. So there are two
fixtures: [[topometry-environment]] keeps the stale channel build, and [[topometry-1.1-environment]]
runs this one, which is what [[topometry-cell-cycle]] actually replicates against.

It builds from the **PyPI sdist rather than a GitHub archive**, and that is a correctness choice.
Upstream's committed `setup.cfg` still says `1.0.2` while `topo/version.py` says `1.1.0` — the
version bump was applied at publish time and never committed — so a git build would produce a
package that reports the wrong version to anyone pinning a commit for reproducibility. The sdist's
`topo/` tree is byte-identical to `master@f2653fa`, verified by diff, and carries the correct
version string. The recipe asserts that version three ways in its tests rather than trusting it.

The recipe also declares eight runtime dependencies upstream omits — scanpy, anndata, hnswlib,
pacmap, scikit-misc, leidenalg, python-igraph, and adjusttext — every one of which the paper-facing
single-cell workflow needs. `topo.sc.preprocess` defaults to the `seurat_v3` HVG flavour, which
wants scikit-misc's loess. That is the packaging gap the [[topometry]] profile flags, fixed at the
recipe layer rather than worked around downstream, with an upstream dependency PR prepared.

Bumping the conda-forge feedstock to 1.1.0 is the real fix: it would lift the fixture to L3 and
retire the two-environment split entirely.
