# TDA Bioinformatics Foundry — vocabulary design draft

> **Status:** draft-for-reaction, rev 4 (2026-08-06). NOT setup. Assembles the three vocabularies
> the Foundry pattern makes you commit to up front — **Kinds**, **tags**, **glossary** — so we
> don't repeat the ad-hoc early moves we regret in the stat-genomics instance. No code, no config,
> no site. All provisional; open questions at the bottom.

Mirrors: `statistical-genomics-foundry/biopixi` (instance #2), parent `Galaxy Workflow Foundry`
(instance #1), spec `galaxyproject/foundry-pattern` (PR #11). This would be **instance #3**.

> **Consumed, 2026-08-08.** §0 (substrate/instance split, convergence direction) and §1 (identity
> and spine) have landed as design records and were removed from here:
> `content/meta/positioning.md` owns the purpose, the spine, and the no-gate decision;
> `content/meta/architecture.md` owns the substrate/instance split and the back-port direction;
> `content/meta/guiding-principles.md` owns corpus-first and the licensing posture. The resolved
> open questions went with them. What remains below is the Kind roster (including kinds that have
> not shipped), the seed tag table, and the glossary sketch.

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
| `recipe` | A rattler-build recipe that builds a `package` the public conda channels do not supply | 17 in `recipes/` | Note at `content/recipes/<slug>.md`; the real files stay at repo-root `recipes/<slug>/` (not duplicated). Fields: `gap`, `build`, `upstreaming`. **Never cast** — catalog/display only. See §2e. |
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

### 2e. `recipe` — the one file-shaped packaging kind

**As shipped** (`site/src/types/recipe/`), with one deviation from the sketch above: the note is
`content/recipes/<slug>.md`, a **file**, not `content/recipes/<slug>/index.md` with the recipe
files rendered beside it.

The sketch assumed a stub directory could point at repo-root `recipes/<slug>/`. It cannot, for two
reasons that only appear at implementation. Companions describe a note's **own** directory, so
declaring `recipe.yaml` as a companion of a directory that does not contain it describes a layout
that does not exist — `checkCompanions` would report every recipe as missing-required. And the
files cannot simply move under `content/`, because a dozen fixture manifests reach them as
`../../../recipes/<slug>` path dependencies, several with solved locks. Copying rather than moving
creates the second copy the whole design avoids.

So the note is file-shaped and the correspondence is checked in a test that walks it both ways: no
recipe without a note, no note without a recipe. That is what the companion declaration would have
bought, at the one place it can actually be enforced.

Fields are the three things `recipe.yaml` cannot state: `gap` (`absent` or `stale` — what the
channels fail to supply), `build` (a discriminated union, `verified` carrying the platforms it was
verified on, or `unverified`), and `upstreaming` (`blocked` / `eligible` / `submitted` /
`published`, with a required `submission` URL for the last two). Name, version, licence, source,
and dependencies are read from the recipe file and never restated.

`upstreaming: blocked` is licence-determined rather than chosen: a test ties it to the recipe's own
`about.license`, so a `LicenseRef-` id forces `blocked` and an SPDX id forbids it. One recipe,
`petls`, is blocked; three are `unverified`, which is the field's main return — "never actually
built" was previously recoverable only by reading seventeen files of comments.

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

Questions 1–9 and 11 are resolved and their answers have shipped — in the kind schemas, their
`kind.md` files, `meta_tags.yml`, and the design records named at the top of this file. Only one is
still open:

- **Substrate-12** — verify exact inherited glossary set vs the `@galaxy-foundry` framework.
