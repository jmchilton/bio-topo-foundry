# Top-down goals — environments to build, pipelines & trainings to aim for

> Draft, 2026-07-30. The bottom-up corpus (14 environments, 7 whitepapers) gives us parts; this
> doc sets **direction**. Synthesized from a review of all 7 whitepapers (esp. the two `tda-tdl-*`
> surveys). Maps onto the delivery-pole Kinds: environment/package/recipe → `pipeline` (`workflow`)
> → `training`. Nothing here is committed work — it's the north star.

Grounding: **[surveys]** = the two TDA/TDL surveys · **[struct]** = petls/topodockq/topoqa ·
**[sc]** = hiponet/topometry. Caveats (license/bugs) are load-bearing for feasibility — kept inline.

---

## Build-status legend

**✅ open** — OSI license → buildable + conda-forge/Bioconda-eligible now.
**⚠️ restricted** — licensed but non-OSI / non-commercial → usable as a local research fixture, *not*
Bioconda-eligible, not for commercial deployment.
**🚫 blocked** — **no software license** → all-rights-reserved, not redistributable until upstream
adds one. Runnable locally if we already have it, but cannot be shipped/repackaged.

## 0. Three north-star verticals — reordered by how buildable they actually are

Full verticals (package → environment → workflow → training) where we already hold the
top (a tool writeup). **Licensing now dominates the ordering:**

- **★ Single-cell cohorts — the promising one.** ✅ Core **TopoMetry** is MIT and already packaged;
  the whole supporting stack (**Scanpy/AnnData/scVI/PHATE/Harmony**) is ✅ open + bioconda. Only
  **HiPoNet** is ⚠️ (non-commercial Yale license — research fixture only, not Bioconda), and it's
  cleanly reproducible (`uv.lock`, pin `45a9d08`). **Nothing here is hard-blocked.** (Pipeline P7, C-track.)
- **★ Methodological benchmark harness — fully open + most defensible.** Both QA surveys flag a
  missing topology-vs-matched-baseline ablation. P6 leans only on ✅ tools we already have
  (gudhi/ripser/giotto-*/r-tda) + open glue. Least licensing-encumbered of all.
- **★ Structure QA — partially unblocked; TopoQA still gated.** The persistent-Laplacian engine is now
  ✅ open: **petls-pytorch** (Apache-2.0, an independent PyTorch reimplementation of PETLS) has a green
  in-repo conda recipe + biopixi env (`content/environments/petls-pytorch/`), so we **adopt** it in place
  of unlicensed **petls** — no cleanroom needed (see `persistent-laplacian-implementation-review.md`).
  Still 🚫: **TopoQA** (no license — it *is* on GitHub at `yubingapril/TopoQA`, all-rights-reserved + a
  coordinate bug) and **TopoDockQ**'s `TopoDockQ-Feature` `.pyc` featurizer (its scorer is ✅ MIT). Those
  stay open-reimplementation targets (bio-topo-foundry #3–#5) on our PH tools + open glue.

---

## 1. Environment build TODO

Tiered by leverage. `[ ]` = to build. Each: what · why · caveat.

### Tier 1 — flagship tools (we already have the package writeup; close the vertical)

- [x] ⚠️ **HiPoNet** — cohort-scale multi-view simplicial learner; whole-point-cloud classification we
  have nothing else for. **[sc]** *Feasible:* Py3.11 + `uv.lock`, pin `45a9d08`, 75/76 math tests pass.
  *Restricted:* non-commercial **Yale license** → research fixture only, **not** Bioconda-eligible.
  **Env built:** `content/environments/hiponet/` — **L0**, locked green (linux-64). Not a packageable
  library (pyproject `name=pointcloudnet`, no `[build-system]`, flat scripts) → no recipe; run from the
  pinned clone. Deps mirror the all-PyPI `uv.lock` closure.
- [x] ⚠️/✅ **TopoDockQ** (scorer) — persistent-Laplacian peptide-docking confidence scorer. **[struct]**
  Repo is ✅ **MIT**, *but* its core ships as Py3.8 `.pyc` bytecode (no source) and the `TopoDockQ-Feature`
  featurizer is 🚫 unlicensed → scorer runs on *supplied* features. **Env built:**
  `content/environments/topodockq/` — **L0**, locked green (linux-64), mirrors upstream `environment.yaml`
  (Py3.8.18 + gudhi 3.8 + torch 2.4.1). No recipe (opaque bytecode, nothing to build); L3-eligible later.
- [ ] 🚫 **TopoQA** — interface QA for protein complexes. **[struct]** *Is* on GitHub
  (`yubingapril/TopoQA`) but has **no software license** (article is CC BY-NC; code all-rights-reserved)
  + a `(x,y,y)` vs `(x,y,z)` bug in `src/utils.py`. **Blocked** — request a license + report the bug
  upstream before any packaging.

### Tier 1 — enabling deps that unblock many pipelines (low effort, bioconda)

- [x] **Biopython** — PDB/mmCIF parsing + interface extraction; glue under every structure pipeline. **[struct]** → `content/environments/biopython/` **L3**, locked green (conda-forge 1.87).
- [x] **DockQ** — the reference interface-quality score; the *training label + eval metric* for both QA papers. No structure-QA pipeline is reproducible without it. **[struct]** → `content/environments/dockq/` **L4**, locked green (Bioconda 2.1.3).
- [x] **Scanpy + AnnData** — single-cell preprocessing + `.h5ad` container; explicit dep of both single-cell papers and the on-ramp for every single-cell pipeline. **[sc]** → `content/environments/scanpy/` **L3**, locked green (conda-forge scanpy 1.12.3 + anndata 0.13.2).
- [x] **DSSP (mkdssp)** — secondary structure + SASA; required for TopoQA's conventional node features. **[struct]** → `content/environments/dssp/` **L4**, locked green (Bioconda dssp 4.6.1, provides `mkdssp`).
- [x] **MMseqs2** — sequence clustering for leakage-safe test splits (both QA papers depend on it). **[struct]** → `content/environments/mmseqs2/` **L4**, locked green (Bioconda 18.8cc5c).

### Tier 2 — new TDA capability (methods our stack lacks)

*Feasibility triaged 2026-07-30 (conda + PyPI + repo/language sweep): **PHAT** and the full **pyDowker →
pyrivet → rivet_console** chain are now packaged from source (both verified green); the rest stay blocked
on unpackaged C++/MPI-from-source or MATLAB. The "unpackaged transitive dep" that blocked pyDowker was
RIVET's C++ console — now built as `recipes/rivet` (rivet-console).*

- [x] **PHAT** — fast C++ reduction backend (chunk / spectral-sequence / twist), header-only + pybind11.
  **[surveys]** → `content/environments/phat/` + `recipes/phat/` **L1**, **verified green** (linux-64
  container: compile + link + `import phat` + `pip check`). LGPL-3.0 → L3-eligible on publish.
- [ ] 🚫 **DIPHA** — distributed cubical PH for large images/density fields. **[surveys]** *Blocked:* C++/MPI
  CLI, source-only (not on conda or PyPI) → needs a from-source recipe; deferred.
- [ ] 🚫 **HERMES** — persistent spectral graphs; the legacy tool **petls** benchmarks against.
  **[surveys][struct]** *Blocked:* not locatable on any package index → source/MATLAB; deferred (petls /
  petls-pytorch already supersede its engine, so low marginal value).
- [ ] 🚫 **KDA / mGLI** (Knot Data Analysis) — multiscale Gauss-linking-integral entanglement features.
  **[surveys]** *Blocked:* not on conda/PyPI → almost certainly MATLAB; deferred.
- [ ] 🚫 **Hodge decomposition** (HHD / 5ComponentHD / 3DHodgeDecom) — gradient/rotational/harmonic flow.
  **[surveys]** *Blocked:* not on conda/PyPI → likely MATLAB; deferred.
- [x] **pyDowker** — Dowker-complex constructor + 2-parameter persistence (`nihell/pyDowker`, MIT). **[struct]**
  **Unblocked by packaging the chain from source** (2026-07-30): the old "hollow green" is retired.
  `DowkerComplex.py` → `from pyrivet import rivet` → `rivet_console`. We built all three as in-repo recipes:
  `recipes/rivet` (RIVET's **Qt-free** `rivet_console` engine, GPL-3.0, from source), `recipes/pyrivet`
  (pure-Python API, BSD), `recipes/pyDowker` (MIT). Env `content/environments/pydowker/` **L1**, locked;
  chain **verified green** in a linux/amd64 container (rivet compiles + `rivet_console --help`; pyrivet +
  pyDowker install, real `pyDowker.DowkerComplex` import pulls gudhi+pyrivet, `pip check` clean). All three
  licenses are redistributable → L3-eligible once upstreamed. *Key fixes:* pin `cmake <4`; re-quote RIVET's
  `CMAKE_CXX_FLAGS`; cap `-j2` (template-heavy units OOM); name the package `rivet-console` (plain `rivet`
  is a different conda-forge project); drop libboost's spurious runtime pin (header-only, conflicted with gudhi).

### Tier 2 — single-cell companions

*All four built + locked green 2026-07-30 (conda-only, linux-64). The two paired bullets each pin two
alternatives for one pipeline slot into a single env.*

- [x] **scVI / scvi-tools** — deep generative embedding; TopoMetry's learned-embedding baseline. **[sc]**
  → `content/environments/scvi/` **L3**, locked green (conda-forge scvi-tools 1.5.0.post1).
- [x] **PHATE** — diffusion embedding for trajectories (same lab as HiPoNet); TopoMetry runtime comparator. **[sc]**
  → `content/environments/phate/` **L4**, locked green (bioconda phate 2.0.0, single-pkg → auto BioContainer).
- [x] **hnswlib / pynndescent** — ANN backends; *pinning them fixes a documented TopoMetry repro gap* and unlocks ~1.3M-cell scale. **[sc]**
  → `content/environments/ann-backends/` **L3**, locked green (conda-forge hnswlib 0.8.0 + pynndescent 0.5.13).
- [x] **Harmony / Scanorama** — batch integration; prerequisite for honest multi-donor/cohort pipelines. **[sc]**
  → `content/environments/batch-integration/` **L3**, locked green (bioconda harmonypy 2.0.0 + scanorama 1.7.4; each L4 alone, L3 paired).

### Tier 3 — heavier / on-demand (hybrid ML refs, molecular design, comparators)

- [ ] **TopFit**, **TopologyNet / TopNetTree** — topology+PLM / ESPH+DL reference models (protein engineering, binding). **[surveys]** *Caveat:* need PLM weights / old DL stacks.
- [ ] **RDKit · OpenMM · OpenFF · AmberTools** — the ncAA/ligand design + minimization stack for ResidueX-style peptide design (Pipeline P5). **[struct]**
- [ ] **PyTorch Geometric** — GNN baselines HiPoNet reports against; package only if baseline parity is a goal. **[sc]**
- [ ] **Comparator scorers/docking** (DProQA, ComplexQA, PIPER-FlexPepDock, HADDOCK, NeuralPLexer, AlphaFold2-Multimer/AF3 or LocalColabFold) — decoy generators / head-to-head baselines; heavy, licensing-varied → **reference/benchmark only**, selective. **[struct]**

### 🚫 Blocked / gated — waiting on upstream (do not plan shippable work on these)

These are non-redistributable today; runnable locally at most. Each needs an **upstream license** to
move. Track the ask, don't build shippable deliverables on them.

- 🚫 **petls** (upstream) — no license anywhere (all-rights-reserved); Linux-x86-64 wheels only; can't be
  repackaged/shipped. License requested: `bdjones13/PETLS#2`. **But its engine is no longer a blocker:**
  ✅ **petls-pytorch** (Apache-2.0) is an open drop-in with a green in-repo recipe + env, so pipelines
  P2/P4/P5 and the Laplacian arm of P6 can **ship** against it (validating numerics vs the local petls oracle).
- 🚫 **TopoQA** — no software license + coordinate bug. Blocked until upstream licenses.
- 🚫 **TopoDockQ-Feature** — unlicensed `.pyc` featurizer. The MIT TopoDockQ scorer is fine; its
  feature generator is not.
- ⚠️ **HiPoNet** — licensed but **non-commercial** → build as a research fixture, but **not**
  conda-forge/Bioconda eligible and not for commercial Galaxy deployment.

**Consequence for sequencing:** the ✅-open **single-cell** and **benchmark-harness** goals still lead,
and the **structure-QA** vertical's Laplacian engine is now open too (petls-pytorch). What remains gated
there is TopoQA's scorer + TopoDockQ's featurizer — open-reimplementation targets, not upstream-packaging ones.

### Cleanroom path — unblock via the papers, not their code

Methods/math are **not copyrightable** (only code is), and the articles are openly licensed
(petls CC BY; TopoQA CC BY-**NC**). Reimplementing from the *papers* — without reading or decompiling
their code, especially the `.pyc` — yields ✅-licensed equivalents. (CC BY-NC restricts reuse of the
*article's* text/figures, not implementing its method.) *Patents are a separate axis, but foundational
TDA math — persistent homology, combinatorial/persistent Laplacians, Hodge theory — is decades-old
public mathematics → low risk; a quick check on any application-specific claim is prudent.*

- **petls → SUPERSEDED: adopt, don't cleanroom.** A from-scratch cleanroom was the original plan
  (bio-topo-foundry #2) — the math is deterministic and fully specified
  (`L_k^{a,b} = B_{k+1}^{a,b}(B_{k+1}^{a,b})ᵀ + (B_k^a)ᵀB_k^a`, up-Laplacian via the Mémoli–Wan–Wang Schur
  complement `A − BD†C`), so a reimpl would reproduce outputs exactly. **But an Apache-2.0 reimplementation
  already exists:** `petls-pytorch` (GUDHI-backed Rips/alpha, the Schur complement, spectra, directed-flag
  + rank-1 sheaf, the top-dim-flip speedup). We **harden that** instead — a green conda recipe + biopixi
  env are in repo (`recipes/petls-pytorch/`, `content/environments/petls-pytorch/`); **#2 is closed.** It
  still delivers the double leverage — unblocks **TopoDockQ**'s only gated piece (its featurizer; scorer
  already MIT → #3) and frees pipelines P2/P4/P5 + the Laplacian arm of P6. Remaining work is
  validation/sparse-scaling, not implementation — see `persistent-laplacian-implementation-review.md`.
- **TopoQA → amenable, but it's a *trained model*, not a computation.** Paper + supplement specify
  everything: featurizer (7 element channels, 8 Å, VR H0 + alpha H1 → 140 stats), edge histogram, and
  even the GAT hyperparameters (2 layers, 8 heads, hidden 32, dropout 0.25, Adam, MSE, 200 epochs). The
  **featurizer is trivial** on our PH stack. But a *working scorer* needs **retraining** on a reassembled
  decoy+DockQ set (named sources MAF2/EVcouplings/DeepHomo; no manifests released) → a bounded ML
  data-engineering effort, not just math. Bonus: a paper-faithful reimpl fixes the `(x,y,y)` bug by
  construction (won't match their checkpoint — fine, we retrain).

**Bottom line:** persistent-Laplacian engine = **solved by adoption** — harden Apache-2.0 petls-pytorch
into a conda recipe + env (done, green) rather than cleanroom. TopoQA = reimplement-plus-retrain (gated
on data assembly) → featurizer easy now, scorer a later project (#4/#5).

---

## 2. Aspirational pipelines (`workflow` Kind)

Each maps to already-packaged tools; ★-new-env notes what would elevate it. Realistic to build in Galaxy.

### Structure / molecular
- **P1 · Reference-free interface QA for AlphaFold complexes** (TopoQA-style, on our stack). *Q:* which
  decoy has the most native-like interface when there's no native? PDB decoys → interface residues
  (Cα<10 Å) → 7 element-selection local point clouds → H0/H1 barcodes (**gudhi/ripser/giotto-ph**) →
  140 summary features (**persim/giotto-tda**) + DSSP/SASA → regress to DockQ → rank. ★ DockQ, DSSP, Biopython. **[struct]**
- **P2 · Persistent-Laplacian peptide-docking confidence** (TopoDockQ-style — flagship **petls** use).
  *Q:* predict p-DockQ without a reference. Interface → 9 bipartite element-channel Rips + Alpha →
  **petls** Laplacian eigenvalue stats + Betti-0 bins → MLP → select pose. ★ pyDowker. **[struct]**
- **P3 · Element-specific PH protein-ligand binding affinity** (PDBbind). Pocket → per-element channel
  persistence (**ripser/gudhi**) → vectorize (**persim/scikit-tda**) → GBT/MLP → pKd, vs PH-only baseline. **[surveys][struct]**
- **P4 · Persistent-Laplacian mutation impact (ΔΔG / interface disruption).** WT vs mutant → local
  complexes → **petls** spectra (harmonic=Betti, non-harmonic=shape) → paired feature deltas → predict
  stability change + flag interface-breaking mutations. **[surveys][struct]**
- **P5 · Non-canonical peptide design triage** (ResidueX-style). Scaffold → RDKit ncAA conformers →
  graft → **petls/gudhi** TDA rescore → OpenMM/OpenFF minimize → ranked design hypotheses. ★ RDKit/OpenMM/OpenFF/AmberTools. **[struct]**
- **P6 · ★ TDA-vs-baseline benchmark harness** (the defensible one). Fixed decoy set + MMseqs2 split →
  three arms: PH-only (**gudhi/ripser**), Laplacian (**petls**), matched geometric baseline → same
  regressor/metrics → head-to-head ranking loss. Fills the ablation both QA papers admit is missing. ★ MMseqs2. **[struct]**

### Single-cell / spatial
- **P7 · ★ Cohort-scale patient classification from cellular point clouds.** *Q:* does a patient's cell-
  population topology predict outcome? Per-sample point clouds → per-sample persistence
  (**ripser/giotto-ph**) → persistence images (**persim**) → sample-level classifier (**giotto-tda**),
  patient-level splits. The interpretable non-neural baseline HiPoNet asks reproducers to build; add
  HiPoNet as the neural arm. ★ HiPoNet, Scanpy. **[sc]**
- **P8 · Differentiation & cell-cycle loop topology.** scRNA → Scanpy → **topometry** scaffold → H1 on
  scaffold (**ripser/giotto-ph**) to detect the cyclic program → overlay velocity/pseudotime → report
  loop persistence + branch points. ★ Scanpy, PHATE. **[sc]**
- **P9 · Spatial-proteomics microenvironment topology** (CODEX/MIBI). Cell table (x,y+markers) → spatial
  proximity + marker-similarity views → per-sample PH (**ripser/giotto-ph**, **pyflagser** if directed)
  → outcome classifier. ★ HiPoNet (multi-view neural benchmark). **[sc]**
- **P10 · Manifold-aware subpopulation resolution + overclustering guard.** scRNA → **topometry** refined
  graph → Leiden → markers → stability across k/donors; **kmapper** to check clusters sit on genuine
  branches. ★ Scanpy, Harmony. **[sc]**

### Cross-cutting
- **P11 · Mapper landscape/decoy visualization.** TDA features (structure decoys *or* single-cell) →
  **kmapper/topometry** graph colored by quality/phenotype → derive filters / read transitions. **[struct][sc]**
- **P12 · RNA-velocity flow decomposition** (Hodge). Velocity field → gradient/rotational/harmonic split
  → interpret directed differentiation flow. New bio capability. ★ Hodge-decomposition env. **[surveys]**

---

## 3. Aspirational trainings (`training` Kind — a GTN curriculum)

A layered path: shared **Foundations**, then two domain tracks. Each builds on the prior.

### Foundations
- **F1 · Reading a barcode: your first persistence diagram.** Compute + interpret H0/H1/H2 from a point
  cloud (protein *or* single-cell); Betti↔components/loops/voids. **ripser/gudhi**. No topology background needed.
- **F2 · From barcodes to features: vectorizing topology for ML.** Persistence images/landscapes/stats →
  sklearn model; why variable-cardinality diagrams must be made comparable. **persim/scikit-tda/giotto-tda**.
- **F3 · Beyond holes: persistent Laplacians & why shape matters.** Harmonic (Betti-recovering) vs
  non-harmonic spectra; a case where topology is equal but shape differs. **petls**.
- **F4 · Mapping shape: Mapper graphs.** Build/read a Mapper graph to expose states, branches, loops.
  **kmapper** (+ **topometry** lens).
- **F5 · Directed topology: higher-order structure in networks.** Why direction needs non-simplicial
  complexes; directed-flag persistence on a molecular/regulatory graph. **pyflagser**.
- **F6 · Rigor for topological ML.** Leakage-safe splits (scaffold/family/mutation/temporal), topology-
  vs-baseline ablation, uncertainty reporting. **r-tda/r-tdastats** + MMseqs2. *(The rigor both surveys hammer.)*

### Structure track (→ north-star ★ Structure QA)
- **S1 · Element-specific PH featurization** for binding/QA (7-channel selections, 140-feature summary). **gudhi + persim**.
- **S2 · Ranking AlphaFold decoys: build an interface-QA scorer** (TopoQA-style) — features → regress to
  DockQ → ranking loss / CAPRI hits; honest evaluation. **gudhi/ripser/giotto-tda** + DockQ/MMseqs2.
- **S3 · Topological confidence for peptide docking** (TopoDockQ-style) — bipartite channels → petls+PH →
  p-DockQ → precision/recall/FPR trade-offs. **petls**.

### Single-cell track (→ north-star ★ Single-cell cohorts)
- **C1 · Learning latent geometry with TopoMetry** — scaffolds, refined graph, geometry-preservation
  scoring vs PCA. **topometry**.
- **C2 · Detecting the cell cycle: H1 loops in a trajectory** — loop significance + velocity cross-check. **topometry/ripser**.
- **C3 · Cohort-scale TDA: patient point clouds → classifier** — per-sample persistence → images →
  classifier, patient-level splits. **ripser/giotto-ph/persim/giotto-tda**.
- **C4 · Comparing patients by shape** — bottleneck/Wasserstein distances between diagrams → cluster
  patients by topology alone. **ripser/giotto-ph/persim**.

---

## Cross-cutting caveats to carry into any build

1. **petls** — upstream is Linux-x86-64-wheel-only + **unlicensed** (keep as a local numerical oracle
   only); ship against the Apache-2.0 **petls-pytorch** reimplementation instead (in-repo recipe + env).
2. **TopoQA** — no license + coordinate bug; **TopoDockQ-Feature** — `.pyc`-only + unlicensed → both
   reference/benchmark, not redistributable, until upstream clarifies.
3. **HiPoNet** — non-commercial Yale license; pin commit `45a9d08`; package the core, not the benchmark scripts.
4. **Wei-group / Hodge tools** (KDA, HHD) may be MATLAB — confirm language before estimating effort.
5. Teach + encode the surveys' honesty points: matched-baseline ablation (P6), leakage-safe splits (F6),
   and "preservation scores are model-consistency, not biological ground truth" (TopoMetry).
