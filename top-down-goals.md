# Top-down goals — environments to build, pipelines & trainings to aim for

> Draft, 2026-07-30. The bottom-up corpus (14 environments, 7 whitepapers) gives us parts; this
> doc sets **direction**. Synthesized from a review of all 7 whitepapers (esp. the two `tda-tdl-*`
> surveys). Maps onto the delivery-pole Kinds: environment/package/recipe → `pipeline` (`workflow`)
> → `training`. Nothing here is committed work — it's the north star.

Grounding: **[surveys]** = the two TDA/TDL surveys · **[struct]** = petls/topodockq/topoqa ·
**[sc]** = hiponet/topometry. Caveats (license/bugs) are load-bearing for feasibility — kept inline.

> **Progress update, 2026-08-04 — the cleanroom epic (#1) is DONE and closed.** Every structure-QA
> tool that was 🚫-blocked is now ✅-open + foundry **L1**: **petls-pytorch** (adopted, #2),
> **open-topodockq-featurizer** (#3, bit-exact vs the `.pyc`), **open-topoqa-featurizer** (#4), and
> **open-topoqa-scorer** (#5, retrained, **at parity** with a correctly-implemented TopoQA). Both
> struct verticals (TopoDockQ P2, TopoQA P1) now run end-to-end with **no unlicensed code in the
> path**. The released TopoQA `(x,y,y)` defect was reported upstream
> ([yubingapril/TopoQA#1](https://github.com/yubingapril/TopoQA/issues/1)). **What this unlocks is
> the top half of the delivery pole: the `pipeline` and `training` Kinds below (§2–§3) are now
> buildable on open tools** — see the "Actionable next" callout at the end of §1.

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
  missing topology-vs-baseline comparison. P6 ([#12](https://github.com/jmchilton/bio-topo-foundry/issues/12))
  now answers both the attribution question (in-featurizer block ablation) *and* the practical one (a
  competitive leaderboard vs DProQ/DProQA/pLDDT). Leans only on ✅ tools we already have + open glue;
  least licensing-encumbered of all.
- **★ Structure QA — NOW FULLY UNBLOCKED (2026-08-04).** The persistent-Laplacian engine is ✅ open:
  **petls-pytorch** (Apache-2.0, an independent PyTorch reimplementation of PETLS) has a green in-repo
  conda recipe + biopixi env (`content/environments/petls-pytorch/`), adopted in place of unlicensed
  **petls**. The two formerly-gated pieces are now ✅ open clean-room L1s too: **TopoQA** →
  `open-topoqa-featurizer` (#4) + `open-topoqa-scorer` (#5, retrained, at parity), and **TopoDockQ**'s
  `.pyc` featurizer → `open-topodockq-featurizer` (#3, bit-exact). All reimplemented **from the papers**
  (never reading upstream code/bytecode), so the whole structure-QA vertical is buildable on redistributable
  tools. **This is no longer the gated vertical — it's the readiest one for pipeline/training delivery.**

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
  featurizer was 🚫 unlicensed. **The featurizer gap is now closed:** `open-topodockq-featurizer` (#3,
  MIT clean-room, bit-exact vs the `.pyc`, L1) feeds the MIT scorer → full open vertical, no bytecode in
  path. Upstream fixture env `content/environments/topodockq/` stays **L0** (opaque bytecode scorer),
  locked green (Py3.8.18 + gudhi 3.8 + torch 2.4.1).
- [x] ✅ **TopoQA** — interface QA for protein complexes. **[struct]** Upstream (`yubingapril/TopoQA`)
  still has **no software license**, so instead of packaging it we **reimplemented from the paper**:
  `open-topoqa-featurizer` (#4, MIT, L1) + `open-topoqa-scorer` (#5, MIT, retrained, L1, at parity with a
  correctly-implemented TopoQA). The released `(x,y,y)` coordinate defect is fixed by construction and was
  reported upstream ([yubingapril/TopoQA#1](https://github.com/yubingapril/TopoQA/issues/1)). No longer
  blocked — this vertical is open end-to-end.

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
- ✅ **TopoQA** — upstream is still unlicensed, but **no longer blocks us**: reimplemented from the paper
  as `open-topoqa-featurizer` (#4) + `open-topoqa-scorer` (#5), MIT + L1. Upstream license ask is moot for
  our purposes; the `(x,y,y)` defect was reported ([yubingapril/TopoQA#1](https://github.com/yubingapril/TopoQA/issues/1)).
- ✅ **TopoDockQ-Feature** — the unlicensed `.pyc` featurizer is superseded by `open-topodockq-featurizer`
  (#3, MIT clean-room, bit-exact). Feeds the already-MIT TopoDockQ scorer.
- ⚠️ **HiPoNet** — licensed but **non-commercial** → build as a research fixture, but **not**
  conda-forge/Bioconda eligible and not for commercial Galaxy deployment. *(Still the one true caveat.)*

**Consequence for sequencing (revised 2026-08-04):** all three verticals are now open. The
**structure-QA** vertical went from "gated" to **fully open + L1-packaged** (cleanroom epic #1 done), so it
joins **single-cell** and the **benchmark-harness** as ready-to-deliver. HiPoNet's non-commercial license
is the *only* remaining hard caveat, and it touches just the single-cell neural arm.

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
- **TopoQA → DONE (#4/#5, 2026-08-04).** Featurizer (7 element channels, 8 Å, VR H0 + alpha H1 → 140
  stats + edge histogram) reimplemented on our PH stack (#4). Scorer retrained from the paper spec (#5).
  **Correction to an earlier assumption:** the paper specifies only the *architecture* + MSE loss — it
  pins **none** of the GAT capacity/training hyperparameters (heads, hidden width, layers, dropout, lr,
  epochs; grep-confirmed across the full text). The "2 layers / 8 heads / hidden 32 / dropout 0.25 / 200
  epochs" figures were **not** from the paper; those are our tunable choices. Retraining used a reassembled
  MAF2 + Dockground decoy+DockQ corpus (leak-free MMseqs2 split). An independent reproduction confirmed the
  result: correct-coordinate scorer is **at parity** with a correctly-implemented TopoQA (matches/beats all
  correlations, HAF2 ranking-loss parity), and ~⅓ of the paper's HAF2 margin depends on the released
  `(x,y,y)` defect. The `(x,y,y)` fix is by construction.

**Bottom line (2026-08-04):** persistent-Laplacian engine solved by **adoption** (petls-pytorch); TopoQA
solved by **reimplement-plus-retrain** (#4 featurizer + #5 scorer, both L1, at parity); TopoDockQ featurizer
solved by **bit-exact cleanroom** (#3). The cleanroom epic is complete — the packages exist, so the next
deliverables are the **pipelines (§2) and trainings (§3)** built on them.

---

### Actionable next — from packages to user-facing delivery (2026-08-04)

The environment/package tier is now deep enough that the **`pipeline` and `training` Kinds are the
bottleneck, not the tools.** Concrete next units of work, ranked by readiness × leverage:

1. **P1 as a real Galaxy workflow — TopoQA interface QA (highest, most direct).** Both halves are
   packaged: `open-topoqa-featurizer` (#4) + `open-topoqa-scorer` (#5). Work = wrap two Galaxy tools
   (`featurize`: PDB decoys → interface graphs; `score`: graphs → DockQ-like value + ranking) and chain
   them into a `.ga` workflow (PDB set → per-decoy score → ranked table). User-facing structure-QA
   pipeline, entirely on redistributable code. *Delivers: pipeline P1.*
2. **S2 GTN training — "Ranking AlphaFold decoys: build an interface-QA scorer."** The whole #5
   replication arc is already a worked example: corpus assembly, leak-free MMseqs2 split, train, top-1
   ranking-loss / CAPRI eval, and the honesty points (pooled-vs-per-target, the `(x,y,y)` lesson). Work =
   turn `results/phase_e_debrief.md` + the scripts into a GTN tutorial. *Delivers: training S2 (+ S1 as the
   featurization prequel).*
3. **P6 benchmark harness — two-part, filed as [#12](https://github.com/jmchilton/bio-topo-foundry/issues/12).**
   Rescoped into attribution + competitiveness after finding the baseline is already *inside* our
   featurizer (node = 32 conventional + 140 topological, contiguous blocks). **P6a (attribution):** slice
   the blocks — full/conventional-only/topological-only, same graph/GNN/split/protocol → Δ = topology's
   marginal contribution (no baseline built). **P6b (competitiveness):** leaderboard of our correct-`(x,y,z)`
   model vs published DProQ/DProQA/GNN-DOVE **+ mean-interface-pLDDT** (confirmed on the AF-Multimer decoys),
   same sets + metric — the practical "useful step?" question + honest post-`(x,y,y)`-fix standing. Eval
   spine (`evaluate.py`, `metrics.py`, benchmark) reused as-is. *Delivers: pipeline P6 (+ training F6 on rigor).*
4. **P2 TopoDockQ pipeline — peptide-docking confidence.** `open-topodockq-featurizer` (#3) + the MIT
   scorer + `petls-pytorch`, all L1. Work = wrap featurize→score end-to-end as a workflow. *Delivers:
   pipeline P2 (+ training S3).*
5. **Single-cell track in parallel (already open).** P7 / C3 (cohort-scale patient point clouds →
   classifier) lean only on TopoMetry + Scanpy + ripser/giotto-ph/persim — no cleanroom was ever needed.
   Ready whenever the structure track has bandwidth. *Delivers: pipeline P7, trainings C1–C4.*

**Recommended first step:** (1) — it converts the two brand-new L1 packages into the first genuinely
user-facing Galaxy pipeline, and (2) rides on it as the matching curriculum.

---

## 2. Aspirational pipelines (`workflow` Kind)

Each maps to already-packaged tools; ★-new-env notes what would elevate it. Realistic to build in Galaxy.

Each pipeline also carries delivery-provenance metadata so literature hardening stays visibly distinct
from Foundry invention:

- **Arc** — `replicate` reproduces a named published workflow or result; `harden` makes it reliable,
  reproducible, and deliverable without changing its scientific intent; `extend` adds a Foundry-authored
  comparison, composition, or hypothesis. An arc may pass through more than one stage.
- **Source** — the specific reviewed package/paper, or the survey lineage when a primary artifact still
  needs to be selected.
- **Foundry delta** — the work that is ours rather than a claim about what the source already delivered.

### Structure / molecular
- **P1 · Reference-free interface QA for AlphaFold complexes** (TopoQA-style, on our stack). *Q:* which
  decoy has the most native-like interface when there's no native? PDB decoys → interface residues
  (Cα<10 Å) → 7 element-selection local point clouds → H0/H1 barcodes (**gudhi/ripser/giotto-ph**) →
  140 summary features (**persim/giotto-tda**) + DSSP/SASA → regress to DockQ → rank. ★ DockQ, DSSP, Biopython. **[struct]**
  **Arc:** replicate → harden. **Source:** TopoQA (Han et al. 2025). **Foundry delta:** open replacement
  components plus tested Galaxy wrapping and collection-level ranking.
- **P2 · Persistent-Laplacian peptide-docking confidence** (TopoDockQ-style — flagship **petls** use).
  *Q:* predict p-DockQ without a reference. Interface → 9 bipartite element-channel Rips + Alpha →
  **petls** Laplacian eigenvalue stats + Betti-0 bins → MLP → select pose. ★ pyDowker. **[struct]**
  **Arc:** replicate → harden. **Source:** TopoDockQ. **Foundry delta:** replace the opaque featurizer and
  unlicensed Laplacian dependency with open components, then deliver and test the end-to-end workflow.
- **P3 · Element-specific PH protein-ligand binding affinity** (PDBbind). Pocket → per-element channel
  persistence (**ripser/gudhi**) → vectorize (**persim/scikit-tda**) → GBT/MLP → pKd, vs PH-only baseline. **[surveys][struct]**
  **Arc:** replicate → harden. **Source:** the ESPH/TopologyNet lineage reviewed by Wee and Jiang; a
  representative primary artifact and benchmark remain to be selected. **Foundry delta:** pin that
  reference, make its data and split contract explicit, and deliver an open Galaxy implementation.
- **P4 · Persistent-Laplacian mutation impact (ΔΔG / interface disruption).** WT vs mutant → local
  complexes → **petls** spectra (harmonic=Betti, non-harmonic=shape) → paired feature deltas → predict
  stability change + flag interface-breaking mutations. **[surveys][struct]**
  **Arc:** replicate → harden. **Source:** persistent-spectral mutation and protein-engineering studies
  reviewed by Wee and Jiang; the primary implementation target remains to be selected. **Foundry delta:**
  a reproducible paired WT/mutant feature contract, open engine, leakage-safe evaluation, and Galaxy delivery.
- **P5 · Non-canonical peptide design triage** (ResidueX-style). Scaffold → RDKit ncAA conformers →
  graft → **petls/gudhi** TDA rescore → OpenMM/OpenFF minimize → ranked design hypotheses. ★ RDKit/OpenMM/OpenFF/AmberTools. **[struct]**
  **Arc:** replicate → harden. **Source:** the published ResidueX workflow accompanying TopoDockQ.
  **Foundry delta:** package the molecular-design stack, reproduce the released examples, and expose the
  modular generate → score → minimize path in Galaxy.
- **P6 · ★ TDA benchmark harness — attribution + competitiveness** (the defensible one; [#12](https://github.com/jmchilton/bio-topo-foundry/issues/12)).
  **P6a attribution:** in-featurizer block ablation (full / conventional-32 / topological-140), same
  graph/GNN/split/metric → Δ = what the PH block buys. **P6b competitiveness:** leaderboard vs standard
  practice — published DProQ/DProQA/GNN-DOVE + mean-interface-pLDDT on the AF-Multimer decoys, same sets +
  ranking-loss metric — answers "useful step?" and re-places the topological approach once the `(x,y,y)`
  defect is corrected. Deferred arms: run-DProQ-ourselves, `petls` persistent-Laplacian features. ★ MMseqs2. **[struct]**
  **Arc:** extend. **Source:** an evaluation gap identified across the TopoQA and TopoDockQ reviews.
  **Foundry delta:** the shared split/model/metric contract; attribution ablation *and* a corrected-coordinate competitive leaderboard.

### Single-cell / spatial
- **P7 · ★ Cohort-scale patient classification from cellular point clouds.** *Q:* does a patient's cell-
  population topology predict outcome? Per-sample point clouds → per-sample persistence
  (**ripser/giotto-ph**) → persistence images (**persim**) → sample-level classifier (**giotto-tda**),
  patient-level splits. The interpretable non-neural baseline HiPoNet asks reproducers to build; add
  HiPoNet as the neural arm. ★ HiPoNet, Scanpy. **[sc]**
  **Arc:** replicate → harden → extend. **Source:** HiPoNet's published cohort-classification tasks.
  **Foundry delta:** first reproduce and repair the HiPoNet workflow, then add transparent PH and matched
  geometric/compositional baselines under the same patient-level evaluation contract.
- **P8 · Differentiation & cell-cycle loop topology.** scRNA → Scanpy → **topometry** scaffold → H1 on
  scaffold (**ripser/giotto-ph**) to detect the cyclic program → overlay velocity/pseudotime → report
  loop persistence + branch points. ★ Scanpy, PHATE. **[sc]**
  **Arc:** replicate → extend. **Source:** TopoMetry's published developmental/cell-cycle case study.
  **Foundry delta:** turn the visually observed loop into an explicit H1 measurement with perturbation,
  donor, and parameter-stability checks.
- **P9 · Spatial-proteomics microenvironment topology** (CODEX/MIBI). Cell table (x,y+markers) → spatial
  proximity + marker-similarity views → per-sample PH (**ripser/giotto-ph**, **pyflagser** if directed)
  → outcome classifier. ★ HiPoNet (multi-view neural benchmark). **[sc]**
  **Arc:** replicate → harden → extend. **Source:** HiPoNet's published CODEX/MIBI spatial tasks.
  **Foundry delta:** repair and reproduce the released spatial workflow, then compare it with transparent
  PH and directed-topology representations under identical cohort splits.
- **P10 · Manifold-aware subpopulation resolution + overclustering guard.** scRNA → **topometry** refined
  graph → Leiden → markers → stability across k/donors; **kmapper** to check clusters sit on genuine
  branches. ★ Scanpy, Harmony. **[sc]**
  **Arc:** replicate → extend. **Source:** TopoMetry's fine-subpopulation analyses. **Foundry delta:** add
  donor/parameter stability and an independent Mapper-based guard against interpreting resolution alone
  as biological validity.

### Cross-cutting
- **P11 · Mapper landscape/decoy visualization.** TDA features (structure decoys *or* single-cell) →
  **kmapper/topometry** graph colored by quality/phenotype → derive filters / read transitions. **[struct][sc]**
  **Arc:** extend. **Source:** earlier molecular Mapper applications plus the reviewed Mapper/TopoMetry
  capabilities. **Foundry delta:** a reusable cross-domain workflow and interpretation contract rather
  than a reproduction of one reported benchmark.
- **P12 · RNA-velocity flow decomposition** (Hodge). Velocity field → gradient/rotational/harmonic split
  → interpret directed differentiation flow. New bio capability. ★ Hodge-decomposition env. **[surveys]**
  **Arc:** replicate → harden. **Source:** the RNA-velocity Hodge-decomposition lineage reviewed by Su et
  al.; a primary implementation target still needs to be selected. **Foundry delta:** trace and reproduce
  that primary method, package an open implementation, and expose its boundary conditions and outputs in Galaxy.

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
2. **TopoQA** / **TopoDockQ-Feature** — upstream stays unlicensed / `.pyc`-only, but we no longer depend on
   either: use the MIT cleanroom reimplementations (`open-topoqa-{featurizer,scorer}` #4/#5,
   `open-topodockq-featurizer` #3). Treat the *upstream* artifacts as reference/oracle only.
3. **HiPoNet** — non-commercial Yale license; pin commit `45a9d08`; package the core, not the benchmark scripts.
4. **Wei-group / Hodge tools** (KDA, HHD) may be MATLAB — confirm language before estimating effort.
5. Teach + encode the surveys' honesty points: matched-baseline ablation (P6), leakage-safe splits (F6),
   and "preservation scores are model-consistency, not biological ground truth" (TopoMetry).
