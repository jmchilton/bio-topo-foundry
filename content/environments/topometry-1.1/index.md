---
type: environment
title: topometry-1.1
summary: TopoMetry 1.1.0, the release the eLife version of record describes, staged from an in-repo recipe that fixes two upstream defects.
portability_grade: L1
tags:
  - method/spectral-geometry
  - application/single-cell
  - modality/high-dim-tabular
---

# topometry-1.1

This is the TopoMetry fixture to run the published single-cell workflow against: 1.1.0, the
release the eLife version of record (13:RP100361, 2026-07-03) actually describes, rather than
the stale channel build in [[topometry-environment]]. See [[topometry]] for the software profile.

The recipe corrects two upstream defects rather than working around them downstream. First, it
builds from the **PyPI sdist** and not a GitHub archive, because upstream's committed
`setup.cfg` still says `1.0.2` while `topo/version.py` says `1.1.0` — a git build would report
the wrong version, whereas the sdist reports correctly and its `topo/` tree is byte-identical
to `master@f2653fa`. Second, `install_requires` omits scanpy, anndata, hnswlib, pacmap,
scikit-misc, leidenalg, python-igraph, and adjusttext, every one of which the paper-facing
workflow needs, so the recipe declares them.

Verified green on osx-arm64 — build, `pip check`, and asserts on the runtime version, the
distribution version, and the presence of `fit_adata` and `preprocess` — with a solved linux-64
lock. Updating the feedstock would lift this fixture to L3.
