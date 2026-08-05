# Ecosystem hardening — deliverables

Work upstreamed to strengthen the persistent-Laplacian TDA ecosystem rather than reimplement it in-repo.

- **petls-pytorch: trim over-declared runtime dep** — move `tadasets` to a `benchmark` extra so the install closure is solvable on conda-forge/Bioconda — https://github.com/Sylverity/petls-pytorch/pull/1
- **PETLS: request a license** — the reference impl ships with no license (all-rights-reserved by default); ask upstream to add one so it can be redistributed/repackaged — https://github.com/bdjones13/PETLS/issues/2
- **tadasets → conda-forge** — add the scikit-tda synthetic-dataset generator to conda-forge, closing the packaging gap that blocks the petls-pytorch closure — https://github.com/conda-forge/staged-recipes/pull/34367
- **float64 property-test branch (tracking)** — upstream independent double-precision invariant tests to petls-pytorch, after the deps PR lands — https://github.com/jmchilton/bio-topo-foundry/issues/6
- **TopoMetry: merge the 1.1.0 version bump to `master`** — `setup.cfg` in `master` still declares
  `1.0.2` while `topo/version.py` declares `1.1.0`, so anyone installing from git (i.e. anyone pinning a
  commit for reproducibility) gets a distribution that reports the wrong version. The PyPI sdist is
  correct, so the bump was applied at publish time and never committed. **The one-line fix already exists
  on `integration-dev`** (`version = 1.1.0`, commit `b1c502e`, checked 2026-08-05). Ask for a *cherry-pick
  to `master`*, not a branch merge: `integration-dev` is a multi-omic-integration feature branch (WNN,
  ATAC LSI, CCA reference mapping, +971 lines in `single_cell.py`), so merging it is a large ask that has
  nothing to do with the version string — to draft
- **TopoMetry: layouts ignore `random_state`** — the strongest finding from the P8 replication. Three
  refits from the same matrix with identical params and `random_state=0` give spectral scaffolds that
  agree to a pairwise-distance correlation of **1.0000** (deterministic), but MAP layouts that agree only
  to ~0.9 — enough to swing a cell-cycle loop statistic from 0.532 to 0.918. This makes any layout-level
  figure in the eLife paper unreproducible even by its authors, and is the case for measuring on scaffolds
  rather than layouts. **Root-caused to four independent defects**, each with a verified fix: (1)
  `_spectral.py:299` calls `eigsh` with no `v0`, and `LE`'s `random_state` only reaches the `lobpcg`
  branch gated on n ≥ 1e6; (2) `eigen.py:556` calls `LE` with misaligned positional args, so `eigen_tol`
  lands in `drop_first`, the real `eigen_tol` falls back to 0, and `random_state` is dropped; (3)
  `map.py:57` defaults `parallel=True`, compiling the MAP SGD epoch under `numba.prange` where threads
  share one `rng_state` and race on `head_embedding` — upstream UMAP passes `parallel=(random_state is
  None)` and TopoMetry inherited that docstring without the gating; (4) `projector.py` never passes the
  seed to `pacmap.PaCMAP`/`umap.UMAP`/`trimap.TRIMAP`. Holding the init constant and fixing the optimiser
  makes both MAP and PaCMAP bit-reproducible, so the four are exhaustive. Synthetic reproducer + drafted
  issue live in the replication repo (`scripts/05_seed_root_cause.py`,
  `docs/upstream/topometry-random-state.md`). A **fifth** defect turned up while patching: the seed does
  not survive a refit (`_parse_random_state` mutates `self.random_state` in place), and fixing that alone
  is insufficient because `.project()` inherits the generator position `.fit()` left behind — and `.fit()`
  draws less randomness on a refit that reuses cached intermediates (position 598 vs 398). Applicability
  re-checked 2026-08-05: `f2653fa` is still `master`'s tip, 1.1.0 still the latest PyPI release, and all
  the files are untouched on `integration-dev`, so every defect is live. No existing upstream issue covers
  it. **Fixes are written and pushed to https://github.com/jmchilton/topometry** — one branch per defect
  off `master`, `test/seed-determinism` adding six regression tests, and `all-fixes` merging everything;
  6/6 red on `master`, 6/6 green on `all-fixes`, 25 pre-existing tests green on both. Nothing sent
  upstream — to draft
- **TopoMetry: declare the single-cell runtime deps** — `install_requires` lists only numpy/scipy/
  scikit-learn/matplotlib/pandas/numba/setuptools, but the paper-facing workflow needs scanpy, anndata,
  hnswlib, pacmap, leidenalg/python-igraph, adjusttext, and scikit-misc (`topo.sc.preprocess` defaults to
  the `seurat_v3` HVG flavour). The white paper already flags this; a PR would close it — to draft
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
