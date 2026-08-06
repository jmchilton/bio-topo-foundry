# Ecosystem hardening — deliverables

Work upstreamed to strengthen the persistent-Laplacian TDA ecosystem rather than reimplement it in-repo.

- **petls-pytorch: trim over-declared runtime dep — merged and released** — moved `tadasets` to a
  `benchmark` extra so the runtime install closure is solvable on conda-forge/Bioconda. Our
  [PR #1](https://github.com/Sylverity/petls-pytorch/pull/1) merged on 2026-08-05 as `2590668d`; the
  change shipped in [v1.1.0](https://github.com/Sylverity/petls-pytorch/releases/tag/v1.1.0) and remains
  in the current [v1.1.1](https://github.com/Sylverity/petls-pytorch/releases/tag/v1.1.1). **Status:
  complete.**
- **PETLS: request a license** — the reference impl ships with no license (all-rights-reserved by default); ask upstream to add one so it can be redistributed/repackaged — https://github.com/bdjones13/PETLS/issues/2
- **tadasets → conda-forge** — add the scikit-tda synthetic-dataset generator to conda-forge, closing the packaging gap that blocks the petls-pytorch closure — https://github.com/conda-forge/staged-recipes/pull/34367
- **petls-pytorch: float64 property validation — retain internally, no standalone PR** —
  [`test/float64-property-validation`](https://github.com/jmchilton/petls-pytorch/tree/test/float64-property-validation)
  contains independent mathematical-oracle coverage for boundary composition, symmetry/PSD, diagonal
  Laplacian reconstruction, persistent nullity, and the full nontrivial Mémoli–Wan–Wang Schur spectrum.
  Re-evaluated against upstream `main@f8b99d0` on 2026-08-06: its `_config.py` documentation change is
  obsolete because v1.1 replaced the two global dense/sparse dtype knobs with one object-local `dtype=`
  parameter. After adapting the tests to that API in a temporary review clone, all 13 cases pass and
  expose no current production defect. A 237-line test-only PR would be noisy. **TODO:** retain the suite
  as internal validation for [bio-topo-foundry#6](https://github.com/jmchilton/bio-topo-foundry/issues/6)
  and fold only a focused reproducer into a future substantive fix if it catches a regression.
- **petls-pytorch: isolated-simplex indexing — independently fixed upstream, no PR** — the original
  [`fix/simplex-tree-isolated-vertices`](https://github.com/jmchilton/petls-pytorch/tree/fix/simplex-tree-isolated-vertices)
  found that incidence-derived index sets dropped a vertex participating in no edge, mismatching
  `boundaries[0]` and `filtrations[0]`. Before we opened a PR, upstream's `e68cd06` weighted-alpha
  refactor independently changed extraction to index every simplex directly; it shipped in v1.1.0 and
  current upstream tests cover isolated-vertex complexes. Rebasing our branch therefore leaves only one
  additional mixed edge-plus-isolated-vertex regression test. Per the no-test-only-PR decision, nothing
  was pushed and no PR is planned; retain the old fork branch only as provenance.
- **TopoMetry: merge the 1.1.0 version bump to `master`** — `setup.cfg` in `master` still declares
  `1.0.2` while `topo/version.py` declares `1.1.0`, so anyone installing from git (i.e. anyone pinning a
  commit for reproducibility) gets a distribution that reports the wrong version. The PyPI sdist is
  correct, so the bump was applied at publish time and never committed. **The one-line fix already exists
  on `integration-dev`** (`version = 1.1.0`, commit `b1c502e`, checked 2026-08-05). Ask for a *cherry-pick
  to `master`*, not a branch merge: `integration-dev` is a multi-omic-integration feature branch (WNN,
  ATAC LSI, CCA reference mapping, +971 lines in `single_cell.py`), so merging it is a large ask that has
  nothing to do with the version string. **Contribution prepared:** the upstream patch was cherry-picked
  as the single commit `635bcb84` on
  [`fix/version-bump`](https://github.com/jmchilton/topometry/tree/fix/version-bump) and is included in
  `all-fixes`. **TODO:** open the minimal upstream PR and explicitly request the same cherry-pick rather
  than merging `integration-dev`.
- **TopoMetry: make layout `random_state` deterministic end to end** — the strongest finding from the P8
  replication. Three refits from the same matrix with identical params and `random_state=0` give spectral
  scaffolds that agree to a pairwise-distance correlation of **1.0000** (deterministic), but MAP layouts
  that agree only
  to ~0.9 — enough to swing a cell-cycle loop statistic from 0.532 to 0.918. This makes any layout-level
  figure in the eLife paper unreproducible even by its authors, and is the case for measuring on scaffolds
  rather than layouts. **Root-caused to five upstream defects**, each with a verified single-commit fix
  off `master@f2653faf`: (1) both `LE` in `_spectral.py` *and the default ARPACK path in*
  `eigen.py:eigendecompose` call `eigsh` with no `v0`, so a fixed seed never controls the starting
  residual ([`fix/seed-arpack-start`](https://github.com/jmchilton/topometry/tree/fix/seed-arpack-start),
  `02b19c8d`); (2) `eigen.py:spectral_layout` calls `LE` with misaligned positional arguments, putting
  `eigen_tol` in `drop_first`, restoring the real tolerance to 0, and dropping `random_state`
  ([`fix/spectral-layout-args`](https://github.com/jmchilton/topometry/tree/fix/spectral-layout-args),
  `98bd9dce`); (3) MAP's `numba.prange` SGD shares one RNG state and races on `head_embedding`, so seeded
  layouts must use the serial kernel
  ([`fix/map-parallel-seed-gating`](https://github.com/jmchilton/topometry/tree/fix/map-parallel-seed-gating),
  `d8b8e2fb`); (4) `Projector` does not forward a seed to UMAP or PaCMAP
  ([`fix/projector-estimator-seed`](https://github.com/jmchilton/topometry/tree/fix/projector-estimator-seed),
  `0ca5d0f8`) — PaCMAP requires a drawn plain `int`, UMAP accepts the normalized RNG, and **TriMAP exposes
  no seed parameter**, so it cannot be fixed through this adapter; (5) `_parse_random_state` overwrites
  the user's integer with a stateful RNG, so refits continue the old stream, while `.project()` inherits
  a cache-history-dependent position because a refit draws less randomness than the first fit (position
  398 vs 598)
  ([`fix/random-state-reuse`](https://github.com/jmchilton/topometry/tree/fix/random-state-reuse),
  `faecb741`). The refit fix resets both `.fit()` and `.project()` and now also handles the first call
  with `random_state=None` (the original identity check skipped initialization because `None is None`).
  Review found and fixed **two integration regressions before upstreaming**: eager normalization erased
  the distinction between an omitted seed and a supplied seed, making unseeded MAP/UMAP serial; and the
  PaCMAP integer seed was drawn before method dispatch, advancing every projection method's RNG even when
  the caller supplied an override. `Projector` now retains its public seed parameter, uses a local
  normalized generator, forwards seeds only when explicitly supplied, and draws the PaCMAP integer only
  inside the PaCMAP branch when needed. Synthetic reproducer + drafted issue live in the replication repo
  (`scripts/05_seed_root_cause.py`, `docs/upstream/topometry-random-state.md`). **Contribution prepared:**
  [`test/seed-determinism`](https://github.com/jmchilton/topometry/tree/test/seed-determinism)
  (`54884e78`) now contains 15 regression cases; the original six are 6/6 red on upstream `master`, all
  15 are green on [`all-fixes`](https://github.com/jmchilton/topometry/tree/all-fixes) (`4588a4fd`), and
  all 25 pre-existing tests remain green (tracker updated 2026-08-06). **TODO:** open an upstream issue
  linking the reproducer; decide whether upstream prefers five focused PRs or one aggregate PR; disclose
  TriMAP's remaining limitation;
  and request that the determinism tests run in CI. No upstream PR is open yet.
- **TopoMetry: declare the single-cell runtime deps** — `install_requires` lists only numpy/scipy/
  scikit-learn/matplotlib/pandas/numba/setuptools, but the paper-facing workflow needs scanpy, anndata,
  hnswlib, pacmap, leidenalg/python-igraph, adjusttext, and scikit-misc (`topo.sc.preprocess` defaults to
  the `seurat_v3` HVG flavour). `adjustText` does not break a genuinely bare install because `topo`
  imports `single_cell` only when Scanpy is importable, but it *does* break the import for the intended
  Scanpy-equipped audience and is therefore still declared as a hard dependency. The remaining workflow
  stack is declared in a `single-cell` extra. **Contribution prepared:** single commit `9de7a4a3` on
  [`fix/declare-single-cell-deps`](https://github.com/jmchilton/topometry/tree/fix/declare-single-cell-deps),
  included in `all-fixes`. **TODO:** open the dependency PR and ask upstream to confirm whether
  `adjustText` should remain hard-required or move into the extra behind a narrower import guard.
- **TopoMetry → conda-forge feedstock update** — the channel carries exactly one build, `0.2.1.1`, which
  predates the `topo.sc.fit_adata` API the eLife version of record describes. Bumping the feedstock to
  1.1.0 promotes `content/environments/topometry-1.1` from L1 to L3 and retires the two-env split — to draft
- **scVelo: default velocity mode is broken under NumPy ≥ 2** — `leastsq_generalized`'s no-offset branch
  (`optimization.py`) assigns a length-1 array into a scalar slot; NumPy 1.x unwrapped it silently, NumPy 2
  raises. `fit_offset` defaults to `False`, so this is the exact path `scv.tl.velocity(mode="stochastic")`
  takes — scVelo's *default* mode. Unfixed on `theislab/scvelo` master as of 2026-08-05. One-line fix
  (take element 0), identity on the mathematics. Blocks any modern-stack reproduction of a published
  scVelo analysis, incl. bio-topo-foundry#11 — to draft
- **scVelo: `filter_and_normalize` silently lost its HVG/log1p contract** — 0.3.4 stripped it to
  `filter_genes` + `normalize_per_cell` and dropped `filter_genes_dispersion`/`log1p` from `scv.pp`
  entirely, so the `scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=2000)` call in
  every scVelo tutorial now raises `TypeError`. Either restore the kwarg or update the docs; as it stands
  "scVelo with default parameters" is not a stable specification across versions — to draft
- **scvelo_notebooks: request a licence** — `theislab/scvelo_notebooks` hosts the processed datasets
  `scvelo.datasets.*` downloads (including the pancreas object behind bio-topo-foundry#11) with no licence
  file, so they are all-rights-reserved by default and cannot be redistributed as workflow test fixtures.
  A licence, or a Figshare/Zenodo deposit like the one `bonemarrow` already uses, would unblock it. The
  accessor also points at the mutable `master` branch, so it is not reproducible as written — to draft
- **TopoQA: report (x,y,y) edge-coordinate defect** — an independent reproduction of the released code + checkpoint found the all-atom edge-distance point cloud uses `(x, y, y)` instead of `(x, y, z)`; correcting only inference shifts published top-1 ranking loss (HAF2-12 0.110→0.147, DBM55-AF2 0.069→0.077), so the numbers depend on it — flagged to the authors for clarification/retrained-checkpoint — https://github.com/yubingapril/TopoQA/issues/1
