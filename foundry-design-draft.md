# TDA Bioinformatics Foundry — vocabulary design draft

> **Status:** draft-for-reaction, rev 4 (2026-08-06). NOT setup. Assembles the three vocabularies
> the Foundry pattern makes you commit to up front — **Kinds**, **tags**, **glossary** — so we
> don't repeat the ad-hoc early moves we regret in the stat-genomics instance. No code, no config,
> no site. All provisional; open questions at the bottom.

Mirrors: `statistical-genomics-foundry/biopixi` (instance #2), parent `Galaxy Workflow Foundry`
(instance #1), spec `galaxyproject/foundry-pattern` (PR #11). This would be **instance #3**.

---

## 0. The one principle behind all three vocabularies

Every vocabulary splits into two layers:

- **Substrate** — the shared *framework* only: Kind machinery, tag-registry *format*,
  license-policy, reference contract. Ships in `@galaxy-foundry/*`. **No shared Kind *definitions*
  exist in the packages yet, and that stays** — the framework is shared, the vocabulary is not.
- **Instance-specific** — ours, seeded **corpus-first** from what we actually have. Every Kind
  below is instance-local; nothing is blocked on upstreaming.

**Convergence direction:** this instance is the **rigorous reference build** — a more focused
corpus and a more disciplined architecture than SGF was stood up with. The intent is to converge
this and SGF over time by **back-porting from here to SGF**, not inheriting SGF's early ad-hoc
shape. Design each vocabulary as the one we'd want SGF to adopt.

Corpus we seed from = **7 whitepapers here** + **~14 biopixi env fixtures** (ripser, gudhi,
dionysus, persim, giotto-ph/-tda, pyflagser, petls, topometry, kmapper, scikit-tda, r-tda,
r-tdastats).

---

## 1. Identity & spine  **[ours]**

**Purpose:** build a corpus of TDA-in-bioinformatics research that simultaneously (a) **moves the
field** — cutting-edge research + agent-executable analysis skills — and (b) **hardens the
tooling** — gets TDA software into **Galaxy** and builds TDA **pipelines** for bio analyses.

**Spine = a maturation arc, not a referee gate.** Where stat-genomics is *analyze → referee →
revise*, this foundry is a **frontier → hardening → delivery** pipeline:

```
  frontier research     software        hardening              Galaxy delivery
  (manuscript,     →   (package)    →   (recipe, environment, →  (tool, workflow,
   proof, mold→skill)                    method)                  training/GTN)
```

Research earns its keep by advancing the field AND by maturing toward runnable Galaxy tooling. The
whitepapers are rough today; they're reviews of existing tools/literature (`package`/`paper`), and
the aspiration is to author our own original **manuscripts** on top of them.

`replication_experiment` cross-cuts this arc: it records the evidence from testing a source claim,
then optionally hardening or extending it, before a reusable Galaxy delivery necessarily exists.

Working name: **Topological Data Analysis Bioinformatics Foundry**.

> **Open Q1 (spine):** is "frontier → hardening → delivery" the right backbone, and is there an
> obligation with teeth (e.g. "a method isn't *delivered* until it reaches a runnable Galaxy
> tool/workflow"), or is this a looser atlas?

---

## 2. Kinds — the `type:` discriminator set  **[ours, on substrate machinery]**

`type:` is the sole discriminator (one Kind → one schema). Collections/directories are *locations*,
separate from Kinds. Roster spans both poles of the spine, so grouping matters.

### 2a. Research pole — *move the field*

| Kind | What it is | Seed | Notes |
|---|---|---|---|
| `manuscript` | A research paper **we** are authoring (original scholarship, for publication) | — none yet | Named to avoid colliding with `paper` (below). **Aspirational/empty:** the existing whitepapers are reviews of *others'* work, so none are manuscripts — they file under `package` (tool profiles) or `paper` (surveys). |
| `proof` | A **mathematical** result — theorem + proof — grounding a method | — none yet | Math, **not** proof-of-concept demos. Fields: statement, assumptions, proof, `grounds[]` (→ method). |
| `mold` | An authored template for a TDA analysis type; **casts into a skill** (framework Kind) | — none yet | "Skills are built molds" — `skill` is the cast *output* (substrate **Skill artifact**), not an authored Kind. |

### 2b. Delivery pole — *harden into Galaxy*

| Kind | What it is | Seed | Notes |
|---|---|---|---|
| `package` | A piece of TDA **software** (upstream library), with its KB writeup | 5 tool whitepapers (petls, topometry, hiponet, topodockq, topoqa) + ~14 env fixtures (GUDHI, Ripser, giotto-* …) | Was `project`. The upstream subject; `implements[]` → method. Fields: repo, language, license, upstream health. **The whitepaper *is* the package's KB entry;** env-fixture packages start as thin stubs and can grow a writeup. |
| `environment` | A reproducible lightweight **biopixi** env fixture — *composite and actionable* | ~14 biopixi recipes | `portability_grade` (L0–L4), `recipe_status`, `platforms`. **Kept separate from `package`:** package is *abstract* (code to understand + wrap), environment is *runnable*. |
| `recipe` *(planned)* | A rattler-build/conda recipe that builds a `package` when it's not in conda | 7 in `recipes/` | **Stub** at `content/recipes/<slug>/index.md` links/renders the real files in repo-root `recipes/<slug>/` (not duplicated). **Never cast** — catalog/display only (borderline Kind). |
| `tool` | A Galaxy tool wrapper exposing a package in Galaxy | — none yet | These 3 echo Galaxy-native objects the parent Foundry (#1) models — reference its shape, but define here (we back-port, not inherit). |
| `workflow` | A Galaxy workflow / TDA bio pipeline | — none yet | ″ (gxformat2) |
| `training` | A Galaxy Training Network (GTN) article | — none yet | ″ |

### 2c. Connective tissue

| Kind | What it is | Seed | Notes |
|---|---|---|---|
| `method` | A TDA/TDL technique as a concept, wiki-linked across the corpus | persistent-homology, persistent-Laplacian, Mapper, TDL, simplicial learning | The glue: a `manuscript`/`proof` → the `package`/`environment`/`tool` that realizes it. Analog of SGF `pattern`. |
| `paper` | A source note — reading note of an **external** paper (theirs) | Su 2025, Wee & Jiang 2025 (Han 2025 latent, behind the topoqa `package`) | Substrate-shaped source note (add `book`/`tutorial` only if the corpus needs them). |
| `replication_experiment` | A bounded study **we ran** to test claims from an external paper or package against a pinned protocol and evidence | TopoQA interface quality, HiPoNet melanoma, TopoMetry cell cycle | Evidence-bearing connective note. The executable experiment lives in a standalone repository; the KB note pins its revision and interprets its evidence. It must include a `replicate` arm, but may continue through `harden` and `extend`. |

Every note carries the shared **envelope** + **≥1 facet tag** (substrate `min(1)` rule).

### 2d. `replication_experiment` evidence contract

Best practices and repository-placement policy live in
`content/meta/replication-experiments.md`.

The note and repository are complementary artifacts. The standalone repository is the executable
experiment—code, environment, protocol, inputs or acquisition instructions, and result files. The
Foundry note is the durable KB entry: it identifies the claim under test, pins one repository
revision, indexes the evidence, records deviations and outcomes, and links the work to later
packages, methods, workflows, or manuscripts. A repository alone is not a note, and a planned
workflow is not replication evidence.

First-draft frontmatter shape:

```yaml
type: replication_experiment
replicates: ["[[Han 2025]]"]
evaluates: ["[[TopoQA]]"]
uses: ["[[Persistent homology]]", "[[open-topoqa-scorer]]"]
environment: "[[topoqa-interface-quality-replication]]"
artifact:
  repository: https://github.com/jmchilton/topoqa-interface-quality-replication
  revision: <full-commit-id>
  protocol: docs/protocol.md
  evidence_manifest: results/reference/manifest.json
arc: [replicate, harden]
status: complete
redistribution: mixed
arms:
  - id: released-checkpoint
    stage: replicate
    question: Does the released checkpoint reproduce the reported interface-quality result?
    status: complete
    replication_outcome: partially_reproduced
    evidence: results/reference/released-checkpoint.json
informs: ["[[Reference-free interface QA for AlphaFold complexes]]"]
```

Contract:

- `replicates[]` is required and names one or more external `paper` claims. `evaluates[]` may name
  the associated `package`; `uses[]` records material method, package, or environment dependencies.
- `environment` is required and names the corresponding biopixi `environment` used for the recorded
  run. The replication is not complete until this environment has produced the indexed evidence.
- `artifact` is required and pins the standalone repository by full revision, plus its protocol and
  evidence-manifest paths. Moving branch names are not sufficient evidence identifiers.
- `arc` is an ordered subset of the closed stages `replicate`, `harden`, and `extend`. It is planning
  and interpretation metadata, not a tag facet. Every `replication_experiment` contains at least one
  `replicate` arm; an extend-only study belongs in a future, broader `experiment` Kind.
- `status` and every `arms[].status` use `planned | running | complete | blocked | superseded`.
  `arms[].stage` uses the arc-stage enum. A completed replicate arm records
  `replication_outcome` as `reproduced | partially_reproduced | not_reproduced | inconclusive` and
  links its evidence; harden and extend arms answer their own stated questions without borrowing a
  replication outcome.
- `redistribution` uses `open | restricted | mixed | noassertion` and summarizes the redistributable
  experiment bundle, not merely the code license. Input data, weights, and upstream software must
  still be described separately in the licensing/provenance section.
- `informs[]` optionally points to the delivery or scholarship enabled by the experiment; it does
  not imply that a workflow or manuscript already exists.

The note body stays short: **Replication target**, **Outcome**, **Environment and rerun status**,
**Upstream writeup and evidence**, and **Next delivery**. Detailed protocol, deviations, results,
figures, provenance, and licensing analysis live in the pinned replication repository and are
linked rather than duplicated here.

**As shipped** (`site/src/types/replication_experiment/`), with three deviations from the sketch
above:

- `replicates[]`, `evaluates[]`, `uses[]`, and `informs[]` are body wiki-links rather than
  frontmatter. Body links are resolved at build time and fail when they dangle; a frontmatter
  string is never resolved. Moving them into prose makes them *more* checked. It is also what the
  corpus can currently satisfy — none of the three papers under test has its own `paper` note, each
  being reviewed inside its `package` note, so a required `replicates[]` would have been
  unsatisfiable on day one.
- `arms[]` is dropped. Every study has one arm per arc stage, so per-arm frontmatter would encode
  structure the corpus does not have. `arc` records which stages ran; the body says what each did.
- `environment` is optional in the schema and **required by `status: complete`**, rather than
  required outright. A study whose fixture does not exist yet is unfinished, not invalid — and this
  is what keeps all three current studies honestly incomplete.

`artifact.revision` is format-checked as a full 40-character commit id, which is the one field
where a plausible value silently voids the note.

---

## 3. Tags — facet registry (`meta_tags.yml`)  **[ours vocabulary, substrate format]**

Closed enums, membership **declared** (not prefix-parsed), every tag glossed, no free-form hatch.
Facets seeded from the 7 whitepapers. Artifact-type is carried by `type:` (the Kind), so no
`artifact` facet — the facets describe *subject*, not *what the note is*.

```
facets:
  method:        # the TDA/TDL technique
    method/persistent-homology       Persistence of homology across a filtration; diagrams/barcodes.
    method/persistent-laplacian      Spectra of persistent combinatorial Laplacians. (PETLS)
    method/topological-deep-learning Learning on higher-order/simplicial/sheaf structures (TDL).
    method/simplicial-learning       Multi-view / higher-order simplicial representation learning. (HiPoNet)
    method/mapper                    Mapper-style nerve/cover graphs of data.
    method/spectral-geometry         Geometry-aware spectral / diffusion scaffolds. (TopoMetry)
    method/beyond-persistent-homology Laplacians, sheaves, multiparameter — the "beyond-PH" frontier. (survey)

  application:    # the bioinformatics / molecular problem
    application/single-cell          Single-cell / cellular point-cloud analysis. (HiPoNet, TopoMetry)
    application/protein-structure-qa Protein model quality assessment / ranking. (TopoQA)
    application/molecular-docking    Docking confidence + (non-canonical) peptide modeling. (TopoDockQ)
    application/molecular-sciences   General molecular-science modeling. (PETLS, survey)
    application/drug-discovery       Screening / binding / property prediction.

  modality:       # the input data object
    modality/point-cloud             Point clouds / metric-space samples.
    modality/molecular-structure     3D biomolecular structures (proteins, complexes, ligands).
    modality/graph                   Graphs / networks / higher-order complexes.
    modality/high-dim-tabular        High-dimensional feature matrices (e.g. single-cell counts).
```

> **Open Q9 (facets):** confirm 3 facets (method/application/modality), singular naming, no drift
> to plurals, no `artifact` or maturation-stage facet (both are really the Kind).

---

## 4. Glossary  **[substrate framework inherited; SGF domain terms dropped; TDA terms added]**

`content/meta/glossary.md`, hand-curated, alphabetical, "this file wins on conflict."

**Inherit [substrate framework]:** Foundry · Knowledge Base (KB) · Kind · Cast / Casting · Skill
artifact · Provenance · Progressive disclosure · Wiki link · Tag registry / facet · License-policy
table · Summary posture · Source note. *(Verify exact set vs upstream — Open Q10.)*

**Drop (stat-genomics-only):** Family A/B · Referee · Gate · Bipolar corpus ·
Construct/Critique/Calibrate · Method validity · Self-certification · Assessment axis · Rubric.

**Add [ours] — first-draft defs:**

- **Manuscript** — an original research paper *we* are authoring for publication. Aspirational —
  none exist yet. Distinct from a **Source note** (external work we review) and from a **Package**
  writeup (our profile of someone else's tool); a manuscript is *new scholarship of our own*.
- **Proof** — a mathematical result (theorem + proof) grounding a TDA/TDL method. Math, not a demo.
- **Skill** — an agent-executable procedure for performing a TDA analysis type. *(Kind vs
  cast-output, Open Q5.)*
- **Package** — a piece of upstream TDA software (a library/tool project: GUDHI, Ripser, PETLS…),
  together with its KB writeup. The subject that gets hardened into an **Environment** and a Galaxy
  **Tool**. A tool whitepaper *is* a package note; env-fixture packages may start as thin stubs.
- **Environment (biopixi)** — a reproducible, lightweight, agent-usable environment fixture (a
  graded `pixi.toml`) for a **Package**. We built the biopixi spec to give agents reproducible
  environments.
- **Portability grade (L0–L4)** — biopixi's reproducibility/portability ladder score for an
  **Environment**. A **field**, not the foundry's teeth.
- **Tool** — a Galaxy tool wrapper exposing a **Package** in Galaxy.
- **Workflow** — a Galaxy workflow / TDA pipeline for a bio analysis.
- **Training** — a Galaxy Training Network (GTN) article teaching a TDA analysis.
- **Replication experiment** — a bounded, Foundry-run study that tests claims from an external
  paper or package under a pinned protocol. Its KB note records arms, evidence, outcomes,
  deviations, and redistribution constraints while linking to the executable standalone repository.
- **Method page** — reference note defining a TDA/TDL technique; wiki-linked from manuscripts,
  packages, tools, workflows. Domain *definitions* of techniques live here, NOT in this glossary.

---

## Open questions (concise)

1. ~~Spine teeth~~ — **resolved: looser atlas, no gate. Notes live at any stage.**
2. ~~`proof` meaning~~ — **resolved: mathematical theorem+proof.**
3. ~~`project` name~~ — **resolved: `package` (piece of software).**
4. ~~`paper` collision~~ — **resolved: `manuscript` = ours, `paper` = external source note.**
5. ~~`skill` Kind~~ — **resolved: skills are built molds; author `mold`, `skill` = cast output.**
6. ~~`package` vs `environment`~~ — **resolved: separate. Package abstract (code to understand+wrap); environment composite+actionable.**
7. ~~Galaxy objects~~ — **resolved: define our own here (not inheriting #1's shape).**
8. ~~`method` Kind~~ — **resolved: keep as its own first-class connective Kind.**
9. ~~Facets~~ — **resolved: keep method/application/modality (all three), singular, no artifact/maturation facet.**
10. **Substrate-12** — verify exact inherited glossary set vs the `@galaxy-foundry` framework.
11. ~~Replication evidence~~ — **resolved: add `replication_experiment` as a connective Kind. Its
    note pins and interprets a standalone executable repository; at least one replicate arm is
    required, with optional harden and extend arms.**
