# Resource → Kind map

> What we've actually assembled so far, mapped onto the anticipated Foundry KB **Kinds**
> (see `foundry-design-draft.md` §2, `content/meta/glossary.md`). Draft, 2026-08-06.
> "Assembled" = a real file in the repo. "Latent" = implied by assembled resources but not yet
> its own note. "Empty" = no resources yet.

## At a glance

| Kind | Assembled now | Count | State |
|---|---|---|---|
| `environment` | `content/environments/*/pixi.toml` | **33** | assembled (25 locked, 8 lock-pending) |
| `manuscript` | — (original papers **we** author) | **0** | empty — aspirational; the whitepapers are reviews, not manuscripts |
| `package` | tool whitepapers `content/packages/*.md` (petls, topometry, hiponet, topodockq, topoqa; petls-pytorch stub) + one lib behind each env/recipe | **6 writeups (1 stub) + ~13 latent** | 5 rough drafts + petls-pytorch stub; env-fixture packages still latent stubs |
| `paper` (source note) | source notes `content/papers/*.md`: Su 2025, Wee & Jiang 2025, Wang/Nguyen/Wei 2020 | **3 + ~5 latent** | review entities that link to source, not copies |
| `method` | landing notes `content/methods/*.md`, one per `method/` facet value | **7** | assembled — every facet value now has its note |
| `replication_experiment` | notes `content/replication-experiments/*.md` pinning the standalone TopoQA, HiPoNet, and TopoMetry repositories | **3** | assembled — biopixi-backed reruns remain before any is complete |
| `proof` | — | 0 | empty |
| `mold` / `skill` | `content/molds/*/index.md` (score-docking-poses) | **1** | first vertical assembled; nothing cast yet |
| `tool` (Galaxy) | — | 0 | empty |
| `workflow` | — | 0 | empty |
| `training` | — | 0 | empty |
| `recipe` *(planned)* | `recipes/*` (+ stub `content/recipes/<slug>/index.md`) | **17** | backing assembled; stub Kind planned. Never cast — catalog/display only |

Non-corpus meta already in place: `content/meta/glossary.md`, `content/environments/README.md`
(fixtures index), `foundry-design-draft.md`, this file.

---

## `environment` — the 33 biopixi fixtures

Grade = anticipated biopixi L0–L4 (from `content/environments/README.md`). Recipe = has a custom
build in `recipes/`. Lock = `pixi.lock` present (solved/verified). WP = has a whitepaper.

| Environment | Grade | Recipe | Lock | WP | Upstream package (→ `package` Kind) |
|---|---|---|---|---|---|
| ripser-cpp | L4 | — | ✓ | — | Ripser (C++ CLI) |
| ripser-py | L3 | — | ✓ | — | ripser.py |
| gudhi | L3 | — | ✓ | — | GUDHI |
| persim | L3 | — | ✓ | — | persim |
| dionysus | L3 | — | ✓ | — | Dionysus |
| topometry | L3 | — | ✓ | **✓** | TopoMetry 0.2.1.1 (conda-forge fixture — predates the paper's API) |
| topometry-1.1 | L1 | ✓ | ✓ | **✓** | TopoMetry 1.1.0 (the eLife VOR release; recipe verified green) |
| kmapper | L1 | ✓ | ✓ | — | KeplerMapper |
| scikit-tda | L1 | ✓ | — | — | scikit-tda (meta) |
| giotto-ph | L1 | ✓ | — | — | giotto-ph |
| pyflagser | L1 | ✓ | — | — | pyflagser |
| petls | L1 | ✓ | — | **✓** | PETLS (upstream, unlicensed — local oracle only) |
| petls-pytorch | L1 | ✓ | **✓** | **✓** | petls-pytorch (open PETLS reimpl, Apache-2.0 → Bioconda-ready) |
| r-tdastats | L1 | ✓ | — | — | TDAstats (R) |
| r-tda | L1 | ✓ | — | — | TDA (R) |
| giotto-tda | L0 | — | — | — | giotto-tda |
| hiponet | L0 | — | ✓ | **✓** | HiPoNet (Yale non-commercial → L0 ceiling; `pointcloudnet`, not a packageable lib) |
| topodockq | L0 | — | ✓ | **✓** | TopoDockQ scorer (MIT; Py3.8 `.pyc` core → nothing to build; L3-eligible later) |
| open-topodockq-featurizer | L1 | ✓✓ | ✓ | — | open TopoDockQ featurizer (MIT clean-room, bit-exact vs the `.pyc`) |
| open-topoqa-featurizer | L1 | ✓ | ✓ | — | open TopoQA featurizer (MIT clean-room from the paper) |
| open-topoqa-scorer | L1 | ✓✓ | ✓ | — | open TopoQA ProteinGAT scorer (MIT clean-room retrain) |
| biopython | L3 | — | ✓ | — | Biopython (structure I/O — enabling dep) |
| scanpy | L3 | — | ✓ | — | Scanpy + AnnData (single-cell — enabling dep) |
| dssp | L4 | — | ✓ | — | DSSP / mkdssp (SASA + secondary structure — enabling dep) |
| mmseqs2 | L4 | — | ✓ | — | MMseqs2 (sequence clustering, leakage-safe splits — enabling dep) |
| dockq | L4 | — | ✓ | — | DockQ (reference interface-QA metric — enabling dep) |
| phat | L1 | ✓ | — | — | PHAT (C++ reduction backend, LGPL — Tier-2 capability, recipe verified green) |
| scvi | L3 | — | ✓ | — | scvi-tools (deep generative single-cell embedding — companion) |
| phate | L4 | — | ✓ | — | PHATE (diffusion embedding, Krishnaswamy lab — companion) |
| scvelo | L3 | — | ✓ | — | scVelo (RNA velocity; the velocity half of P8 — companion) |
| ann-backends | L3 | — | ✓ | — | hnswlib + pynndescent (ANN kNN backends — companion; fixes TopoMetry repro gap) |
| batch-integration | L3 | — | ✓ | — | harmonypy + scanorama (batch integration — companion) |
| pydowker | L1 | ✓✓✓ | ✓ | — | pyDowker → pyrivet → rivet-console chain (2-param persistence; 3 in-repo recipes, verified green) |

Each row is also one latent **`package`** (the abstract upstream software) — package↔environment is
~1:1 today but stays a distinct Kind: package is *abstract* (code to understand + wrap), environment
is *composite + actionable*.

---

## The 7 whitepapers — split across `package` and `paper`

None are `manuscript`s — that Kind is reserved for original papers *we* author, and all 7 review
*others'* work. The split is by **subject**: a writeup that profiles one **software tool** is that
package's KB entry (→ `package`); a review of an external **survey/paper** is a source note (→ `paper`).

### → `package` (the tool's KB writeup)

| Whitepaper | Subject | Env? | Seeds / links |
|---|---|---|---|
| `content/packages/petls.md` | PETLS (persistent topological Laplacians) | **✓** env+recipe | `method` persistent-laplacian · `paper` (primary) |
| `content/packages/topometry.md` | TopoMetry (spectral scaffolds, single-cell) | **✓** env | `method` spectral-geometry · `paper` (primary) |
| `content/packages/hiponet.md` | HiPoNet (multi-view simplicial learning) | — | `method` simplicial-learning · `paper` (primary) |
| `content/packages/topodockq.md` | TopoDockQ (topological docking confidence) | — | `method` persistent-homology · `paper` (primary) |
| `content/packages/topoqa.md` | TopoQA (protein-complex interface QA) | — | `method` persistent-homology · `paper` (primary, Han 2025) |

### → `paper` (a source note — "synthesis of [one external work]")

*A `paper` note is a **review that links to** its upstream source — not a wholesale copy. For most
sources we link + review to preserve context and avoid licensing / access problems; **Summary
posture** governs how much verbatim is kept.*

| Whitepaper | External source | Seeds |
|---|---|---|
| `content/papers/tda-tdl-beyond-persistent-homology.md` | Su et al. (2025), survey | `method` beyond-persistent-homology |
| `content/papers/tda-tdl-molecular-sciences.md` | Wee & Jiang (2025), survey | `method` molecular-sciences |

**topoqa → `package` (resolved):** TopoQA is a software tool (`yubingapril/TopoQA`), so its whitepaper
is a tool profile like the other 4 — filed under `content/packages/`. The primary source (Han 2025)
becomes a *latent* `paper` behind it. The earlier `paper` filing came from the now-discarded
"our framing vs faithful summary" stance test.

**Coverage cross-cut:**
- **Complete verticals** (package writeup + environment): **petls**, **topometry**, **petls-pytorch**
  (writeup is a stub, env+recipe green), **hiponet** and **topodockq** (L0 envs locked green; writeups
  exist).
- **Open engine, adopted:** **petls-pytorch** — Apache-2.0 reimpl of PETLS; env+recipe
  built + green, stub writeup at `content/packages/petls-pytorch.md` (it's the *shippable* substitute
  for the blocked upstream petls). **Built from our fork `jmchilton/petls-pytorch @ v2`** (three fixes over
  1.0.2; the load-bearing one lets isolated vertices survive simplex-tree boundary extraction, unblocking
  the bipartite interface complexes for bio-topo-foundry#3). The **tadasets** in-repo recipe
  (`recipes/tadasets/`) now backs only `scikit-tda`'s transitive gap — the fork demoted tadasets from a
  petls-pytorch runtime dep to a benchmark extra.
- **Package writeups** awaiting an environment: **topoqa** → candidate future `environment` build
  (hiponet + topodockq now have L0 envs).
- **P8 replication in flight:** `topometry-1.1` + `scvelo` + `scanpy` + `ripser-py` back the
  developing-pancreas cell-cycle replication (bio-topo-foundry#11). Analysis code lives in its own
  repo, `topometry-cell-cycle-replication`, following the `open-topoqa-*` precedent. It is a latent
  `replication_experiment`, not a `workflow`; a later Galaxy workflow is one delivery it may inform.
- **Environments without a whitepaper** (27 of 33): the workhorse TDA libs (ripser, gudhi, dionysus,
  persim, giotto-*, pyflagser, kmapper, scikit-tda, r-tda, r-tdastats, phat, pydowker) + the enabling deps
  (biopython, scanpy, dssp, mmseqs2, dockq) + the single-cell companions (scvi, phate, ann-backends,
  batch-integration) — packaged, not written up (enabling deps + companions are infra, not TDA methods).

---

## Latent kinds (implied, not yet assembled)

- **`package`** — **6 already assembled** as tool writeups (`content/packages/`: petls, topometry,
  hiponet, topodockq, topoqa + a petls-pytorch stub); **~13 still latent** — one per remaining
  upstream lib in the env table, whose first content is the repo/license/language/method facts already
  implicit in each `pixi.toml` + recipe.
- **`paper`** — **2 already assembled** as the "synthesis of X" survey whitepapers (Su 2025; Wee &
  Jiang 2025). **~5 still latent** — the primary tool papers behind
  petls/topometry/hiponet/topodockq/topoqa (Han 2025), embedded in those package writeups, to extract. Each is a review
  that links out, not a copy.
- **`method`** (~6) — persistent-homology · persistent-laplacian · topological-deep-learning ·
  simplicial-learning · spectral-geometry · beyond-persistent-homology. Exactly the `method` tag
  facet; each becomes a wiki-link hub.
- **`replication_experiment`** — three executable repositories exist, but no
  `content/replication-experiments/*.md` KB notes pin and interpret them yet:

  | Repository | Replication target | Arc represented | KB state |
  |---|---|---|---|
  | [`topoqa-interface-quality-replication`](https://github.com/jmchilton/topoqa-interface-quality-replication) | TopoQA interface-quality prediction | replicate → harden | latent note; biopixi rerun required |
  | [`hiponet-melanoma-replication`](https://github.com/jmchilton/hiponet-melanoma-replication) | HiPoNet melanoma cohort classification | replicate → harden → extend | latent note; biopixi rerun required |
  | [`topometry-cell-cycle-replication`](https://github.com/jmchilton/topometry-cell-cycle-replication) | TopoMetry cell-cycle and velocity analysis | replicate → harden | latent note; biopixi rerun required |

  The repository is the executable artifact; the future note records a pinned revision, protocol,
  evidence manifest, arm-level outcomes, deviations, redistribution constraints, and corresponding
  biopixi environment. No biopixi-backed rerun is currently recorded for these repositories, so none
  should be considered complete yet. See `content/meta/replication-experiments.md`.

## Empty kinds (no resources yet)

`proof` · `mold`/`skill` · `tool` (Galaxy) · `workflow` · `training` — the delivery-pole and
formal-math frontier, all still ahead.

---

## Open placement questions

1. ~~`recipe` home~~ — **resolved: its own (planned) `recipe` Kind. Stub at
   `content/recipes/<slug>/index.md` links/renders the real files in repo-root `recipes/<slug>/`;
   never cast (catalog/display only).**
2. **`content/environments/` vs `recipes/` split** — two top-level homes for closely-related
   packaging artifacts. Keep split, or co-locate per-tool (`content/packages/<tool>/{env,recipe}`)?
3. ~~`topoqa` classification~~ — **resolved: `package`** (TopoQA is a software tool; its whitepaper is
   a tool profile). Han 2025 becomes a latent `paper` behind it.
4. **`manuscript` reserved for our own original papers** — the 7 whitepapers are reviews of others'
   work → `package` (4 tool profiles) or `paper` (3 surveys/reviews); `manuscript` is empty for now.
5. ~~Standalone replication repository placement~~ — **resolved: keep executable experiments in
   their own repositories and assemble `content/replication-experiments/<slug>.md` notes here. The
   note pins and interprets repository evidence; the repository is not a `workflow`.**
