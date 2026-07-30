# Glossary — TDA Bioinformatics Foundry

> Hand-curated, alphabetical. **Inherits** the Foundry-pattern *framework* terms (Kind, Mold, Cast,
> Provenance, Wiki link, Source note, …); **drops** the statistical-genomics *domain* terms
> (Family A/B, Referee, Gate, Bipolar corpus, Rubric, …); **adds** this instance's TDA + delivery
> terms (Manuscript, Package, Environment, Method, Tool, Workflow, Training). If two docs disagree
> on a term, **this file wins**. Working draft — a few entries are marked *provisional* pending the
> open questions in `foundry-design-draft.md`.

Instance #3 in the Foundry-pattern lineage (Galaxy Workflow Foundry #1, Statistical Genomics
Foundry #2). We aim to be the *rigorous reference build* and back-port vocabulary to SGF over time.

---

**biopixi** — the sibling spec + grader we built to give agents reproducible, lightweight
**Environments**: it scores a `pixi.toml` on the L0–L4 **Portability grade** ladder. Where the
environment fixtures/recipes currently live.

**Cast** *(verb)* — produce a self-contained **Skill** from a **Mold**. *(noun)* — one casting
result for a (Mold, **Target**) pair. **Casting** is the deterministic per-kind assembly over a
Mold's **References**.

**Environment** — a *composite, actionable* unit: a reproducible, lightweight, agent-runnable
**biopixi** fixture (a graded `pixi.toml`) that assembles one or more **Packages** and their
dependencies into something you can actually execute. Carries a **Portability grade**. Contrast
**Package**, which is abstract.

**Foundry** — the standalone, navigable knowledge base from which casting reads. This instance's
working name is the **Topological Data Analysis Bioinformatics Foundry**. The substrate term for the
source-of-truth artifact is **Knowledge Base**.

**Kind** — the `type:` discriminator every note declares exactly once; one Kind → one schema.
Nothing infers a kind from a directory or a tag. Our Kinds: **Manuscript**, **Proof**, **Mold**,
**Package**, **Environment**, **Recipe**, **Tool**, **Workflow**, **Training**, **Method**, **Paper**.

**Which Kind for an authored writeup?** (the three that get confused) — ask *whose scholarship*,
then *about what*:
- original research **we** author for publication → **Manuscript** *(none exist yet; aspirational)*.
- our writeup **profiling one external software tool** → **Package** (`content/packages/`).
- our review of one external **paper or survey** → **Paper** (`content/papers/`).
A doc that reviews *others'* work is **never** a Manuscript — that alone is what mis-filed the
whitepapers before. Edge case: a tool that *is* essentially one paper can read either way — resolve
by *whose artifact we'd harden*: **Package** if it's software we'd package, **Paper** if we're only
citing the result. (TopoQA / Han 2025 resolved to **Package** — it's the tool `yubingapril/TopoQA`;
Han 2025 remains a latent `paper` behind it.) Directory ≠ Kind: `content/packages/` and
`content/papers/` are *locations*, and the note's declared `type:` still governs.

**Knowledge Base (KB)** — the inspectable, human-readable source of truth at the center of the
instance, authored to be *read and learned by a human*, not merely stored for retrieval. The KB is
the source; a **Skill** is the package. This instance colloquially calls it the **Foundry**.

**License-policy table** — the shared SPDX-id → redistribution-policy table (installed from
`@galaxy-foundry/license-policy`) deciding what may be redistributed and how. Answers what a license
*permits*, never whether a note is *coherent* with its license.

**Manuscript** — an original TDA/TDL research paper *we* author for publication (new scholarship of
our own). Aspirational — none exist yet. The repo's rough whitepapers are *not* manuscripts: they
review others' work, filing under **Package** (tool profiles) or **Paper** (surveys). Distinct from
a **Package** writeup (our profile of someone else's tool) and from a **Source note** (Paper).

**Maturation arc** — the foundry's spine: *frontier → hardening → delivery*. Frontier research
(**Manuscript**, **Proof**, **Mold**) → the **Package** it concerns → **hardening** into a graded
**Environment** (with the **Method** that links them) → **Galaxy delivery** (**Tool**, **Workflow**,
**Training**). Replaces stat-genomics' *analyze → referee → revise*. A **looser atlas, not a
gate**: notes may live at any stage; maturation is the aspiration, nothing is blocked.

**Method** *(a.k.a. Method page)* — a reference note defining a TDA/TDL technique (persistent
homology, persistent Laplacian, Mapper, topological deep learning, simplicial learning). The
connective tissue wiki-linked across the corpus: a **Manuscript**/**Proof** links to the method it
advances; a **Package**/**Tool** links to the method it implements. Analog of the parent's *pattern*
kind. Technique *definitions* live here, not in this glossary. A first-class Kind of its own.

**Mold** — a framework Kind: an abstract, structured template (a typed reference manifest +
a procedural body skeleton) for a TDA analysis type. **Cast** into one or more **Skills**.

**Package** — a piece of upstream TDA/TDL **software** (a library or tool project — GUDHI, Ripser,
PETLS, giotto-*) that we want to *understand and wrap*, **together with its KB writeup**. Names the
code and its facts (repo, language, license, upstream health, the **Methods** it implements), not a
runnable configuration. A tool whitepaper *is* a package note (`content/packages/`); env-fixture
packages may start as thin stubs and grow a writeup. The subject of hardening, not itself actionable
— contrast **Environment**.

**Paper** — our **Source note** Kind: a **review entity** for an upstream paper — our
summary/review that **links to** the source, *not a wholesale copy of it*. Kept lean deliberately —
for most sources we link + review rather than reproduce, to preserve context and avoid licensing /
access problems; **Summary posture** (own-words vs license-aware), set by the source's license,
governs how much verbatim is kept. Distinct from **Package** (which profiles one *software tool*,
not a paper/survey) and from **Manuscript** (our own original research).
(`book`/`tutorial` variants may be added if the corpus needs them.)

**Portability grade (L0–L4)** — **biopixi**'s reproducibility/portability ladder score for an
**Environment** (L0 out-of-profile … L4 single-package auto-container). A field on the environment,
not the foundry's teeth.

**Progressive disclosure** — show the right knowledge at the right time: manuscripts and methods
disclose the concepts, molds the action, references the dependency surface. Both an authoring
principle and a runtime contract.

**Proof** — a *mathematical* result — a theorem with its proof — grounding a TDA/TDL **Method**.
Math, **not** a proof-of-concept demo.

**Provenance** — every derived artifact records what produced it (source hash, model, prompt
version, resolved-ref hashes, timestamp). Never lightened.

**Recipe** — a *planned* Kind: a `rattler-build`/conda recipe that reproducibly builds a **Package**
into a channel artifact when it isn't already in conda. A thin **stub** lives at
`content/recipes/<slug>/index.md`; the actual recipe files stay in the repo-root `recipes/<slug>/`
and are linked/rendered from there, not duplicated. *Borderline:* **never cast** — a catalog +
display entry only, outside the casting pipeline. Backs an **Environment**.

**Reference** *(a.k.a. reference kind)* — a typed dependency a **Mold** declares; the *kind*
discriminator controls casting behavior. The vocabulary is half framework, half ours
(`reference_contract.yml`).

**Skill** *(a.k.a. skill artifact)* — the compiled output of **Casting** a **Mold**: a
self-contained, frozen, agent-executable procedure for a TDA analysis type. *"Skills are built
molds."* Not an authored Kind — you author the **Mold**; the skill is its cast output.

**Source note** — a regenerable reading note of an external source that **links to and reviews** the
source rather than reproducing it (licensing / access), kept separate from our framing; its
**Summary posture** is license-driven. Our source-note Kind is **Paper**.

**Summary posture** — whether a **Source note** is *own-words* or *license-aware*, determined by the
source's license via the **License-policy table** and recorded in the note's `derived:` field.

**Tag registry / facet** — the closed-vocabulary `meta_tags.yml`: every `tags:` value is a
*declared* member of a **facet** (ours: `method`, `application`, `modality`), each carrying a
one-line gloss. No free-form escape hatch. The *format* is shared across instances; the *vocabulary*
is ours.

**Target** *(cast target)* — an output format **Casting** can produce for a **Skill** (e.g. Claude
skill, generic, web).

**Tool** — a Galaxy tool wrapper exposing a **Package** as a runnable step in Galaxy. A Galaxy-native
object, defined as our own instance-local Kind (not inherited from the parent Foundry).

**Training** — a Galaxy Training Network (GTN) article teaching a TDA analysis, targeting the
delivered **Tools**/**Workflows**. A Galaxy-native object, defined as our own instance-local Kind.

**Wiki link** — `[[Target]]`. First-class in typed frontmatter fields and body prose; resolved by a
single shared resolver with cross-file referential integrity.

**Workflow** — a Galaxy workflow / TDA pipeline chaining **Tools** into a bio analysis (gxformat2).
A Galaxy-native object, defined as our own instance-local Kind.
