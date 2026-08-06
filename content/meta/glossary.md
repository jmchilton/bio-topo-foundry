# Glossary — TDA Bioinformatics Foundry

> Hand-curated and alphabetical. This is one reader-facing glossary with provenance recorded per
> entry: *[pattern]* is inherited from the stack-independent Foundry Pattern; *[Astro stack]* is
> inherited from the shared Astro implementation; *[TDA]* is owned by this instance; and
> *[TDA; aligned with SGF]* is an instance convention shared with the Statistical Genomics Foundry,
> not universal substrate. Inherited definitions retain their upstream meaning; TDA status notes are
> kept separate from them. If two TDA documents disagree about a term, **this file wins**.

This is instance #3 in the Foundry-pattern lineage (Galaxy Workflow Foundry #1, Statistical
Genomics Foundry #2). Alignment with SGF means using the same words for genuinely shared
instance conventions while leaving its domain vocabulary — Family A/B, Referee, Gate, bipolar
corpus, and Rubric — there.

---

**biopixi** *[TDA]* — the sibling specification and grader for reproducible, lightweight
**Environments**. It scores a `pixi.toml` on the L0–L4 **Portability grade** ladder. The current
environment fixtures and recipes live in this repository; biopixi itself is not Foundry substrate.

**Cast** *[pattern]* — *(verb)* produce a self-contained artifact from a Mold via the casting
process. *(noun)* one casting result for a (Mold, target) pair.

**Casting** *[pattern]* — the deterministic compilation step that turns a Mold into a skill
artifact. It resolves typed references, places their contents according to kind and target,
renders the artifact, and emits provenance. The integration boundary is that artifacts come out
scoped, isolated, and frozen, with no links back.

TDA status: no caster or cast tree exists yet. The first real **Mold** will determine which
reference kinds and target hooks this instance needs.

**Collection** *[Astro stack]* — a *location*: a base directory plus the pattern selecting which
files under it are notes, and the kind those notes are. Collections and kinds are deliberately
not one-to-one — one directory can hold two kinds, and two collections can resolve to the same
kind — so a kind's **locations** are derived from the collection table rather than declared beside
the kind.

TDA status: no Astro collection table exists yet. Existing directories are corpus locations, not
proof that their proposed note kinds have been implemented.

**Companion** *[Astro stack]* — a non-note file in a directory-shaped note's directory, declared
once by the **kind** rather than repeatedly by each note. Only directory-shaped kinds have
companions; a sibling that is itself a note is never a companion; and a companion describes
**layout** only. A file a note actually depends on is a **Reference** instead.

Each companion declaration carries a requirement level (`required`, `recommended`, or `optional`)
and a disposition: `foundry-only` never leaves, `cast-input` is read by the caster but does not
appear in output, and `bundled` is copied in. This layout declaration is distinct from any
per-note membership field that chooses what a particular note carries into a cast.

**Environment** *[TDA]* — a composite, actionable unit: a reproducible, lightweight,
agent-runnable biopixi fixture (a graded `pixi.toml`) that assembles one or more **Packages** and
their dependencies into something executable. It carries a **Portability grade**. Contrast
**Package**, which describes upstream software rather than one runnable configuration.

**Foundry** *[TDA]* — this concrete instance: the standalone, navigable TDA bioinformatics
**Knowledge Base** from which future casting will read. Its working name is the **Topological Data
Analysis Bioinformatics Foundry**. Use **Foundry Pattern** for the stack-independent design pattern,
not for this repository.

**Kind** *[Astro stack]* — the `type:` discriminator a note declares, together with the one schema
that validates it. The kind decides what metadata is required, what casting may assume, and what
the site can render, so it is what makes a corpus machine-readable rather than a pile of Markdown.
Beyond its frontmatter schema a kind declares its **Shape**, its **Companions**, and its `layer` —
`substrate` if the pattern supplied the kind, `instance` if the domain added it.

Not to be confused with a **reference kind**, which classifies a dependency a Mold declares. One
word names two closed vocabularies; a page using both must say which one it means.

TDA status: the proposed note-kind inventory is **Manuscript**, **Proof**, **Mold**, **Package**,
**Environment**, **Recipe**, **Tool**, **Workflow**, **Training**, **Method**, and **Paper**. None
is implemented as a schema yet, so the list remains provisional until real notes exercise it.
Directories are locations, not kinds.

For the three authored-writeup candidates most likely to collide, ask whose scholarship the note
describes and what artifact is being hardened:

- original research we author for publication → **Manuscript**;
- our profile of one external software project → **Package**; and
- our review of one external paper or survey → **Paper**.

A review of someone else's work is never a Manuscript. A software project closely associated with
one paper is a Package when the software is the artifact we intend to harden, and a Paper when only
the result is being reviewed. TopoQA is therefore presently a Package; Han 2025 may become a
separate Paper note.

**Kind context** *[Astro stack]* — what a kind's schema is allowed to draw on when it is built:
the base frontmatter envelope plus whatever registries the instance hands it. This is the seam
between instances. Foundries agree on what a kind is and can disagree entirely on what a kind may
draw from, which is why the shared contract is generic over the context and each instance binds
it once.

TDA status: the base envelope and injected registries are unresolved. They must be derived from the
first implemented notes rather than copied from SGF.

**Kind manifest** *[Astro stack]* — the generated, machine-readable record of every kind an
instance defines: its title, layer, summary, shape, companions, locations, documentation, and
required fields, the last derived from the same schema that validates notes. It crosses the
instance boundary so the pattern site can compare concrete implementations; its format is a
shared, versioned package rather than instance-owned JSON.

TDA status: no manifest exists until the first kind schema and collection are real.

**Knowledge Base (KB)** *[pattern]* — the inspectable, human-readable source of truth at the
center of every instance. Authored to be *read and learned by a human*, not merely stored for an
agent to retrieve. The KB is the source; a skill is the package.

This repository is the TDA instance's KB even before its reading surface and caster exist.

**License-aware summary** *[TDA; aligned with SGF]* — a **Source note** whose license resolves to
`verbatim-ok`, permitting short, marked, load-bearing quotations subject to the license's
obligations. Its `derived` value is `license-aware-summary`. The label records that upstream
expression is carried; it is not a claim that attribution or other obligations have been satisfied.

**License-policy table** *[TDA; aligned with SGF]* — the shared SPDX-id → redistribution-policy
table: `{ name, policy, license_file, copyleft, obligations }`, with unknown or missing identifiers
resolving deny-by-default. It answers what a license permits and whether a note's `derived` posture
carries upstream expression; it does not decide whether a TDA note is coherent with its declared
license.

TDA status: the table will be installed from `@galaxy-foundry/license-policy`, not vendored, when
the validator is stood up. The instance-owned coherence rule has not been defined yet.

**Load policy / progressive disclosure** *[pattern]* — show the right knowledge at the right time:
Pipelines disclose the journey, Molds the action, and references the dependency surface. It is both
an authoring principle and a runtime contract, keeping the KB foregrounded for a human reader
rather than flattened for retrieval.

TDA adaptation: manuscripts and methods disclose concepts; Molds disclose actions; references
disclose dependencies. No composition layer is assumed until real sequential work requires one.

**Manuscript** *[TDA]* — an original TDA or topological deep learning research paper we author for
publication: new scholarship of our own. None exists yet. The repository's current whitepapers
review others' work and therefore belong under **Package** or **Paper**, not Manuscript.

**Maturation arc** *[TDA]* — the instance's proposed spine: *frontier → hardening → delivery*.
Frontier research (**Manuscript**, **Proof**, **Mold**) connects to the **Package** it concerns,
hardening produces a graded **Environment**, and Galaxy delivery produces **Tools**, **Workflows**,
and **Training**. It is a loose atlas rather than a gate: notes may exist at any stage.

**Method** *[TDA]* — a reference note defining a TDA or topological deep learning technique, such
as persistent homology, persistent Laplacian, Mapper, topological deep learning, or simplicial
learning. It is connective tissue across the corpus: research notes link to the method they advance
and software/delivery notes link to the method they implement. Technique definitions live in Method
notes, not in this glossary.

**Mold** *[pattern]* — the unit of the KB: an abstract, typed *reference manifest* describing one
action. Its frontmatter declares the references it depends on (other KB pages, schemas, CLI manual
pages, prompts, examples); its body is a procedural skeleton tying them together. Molds are
abstract source artifacts, independent of any agent runtime.

TDA status: no Mold note exists yet. `score-docking-poses` is a planning candidate, not an
implemented Mold.

**Note** *[Astro stack]* — the unit of the corpus: one authored entry that declares its kind in
frontmatter and validates against that kind's schema. A **Mold** is one kind of note; a paper
summary, pattern, or tutorial may be others. A note is either a flat file or a directory whose
`index.md` is the note, and which of the two is a property of its **Kind**, never of the individual
note.

TDA status: the existing Markdown files are authored corpus records but do not become typed notes
until schemas and collections validate them.

**Own-words summary** *[TDA; aligned with SGF]* — a **Source note** expressed entirely in new
prose, with only short functional strings — parameter names, error text, numeric thresholds, or
equation forms — retained verbatim as facts. Its `derived` value is `own-words-summary`; the
license-policy row does not govern redistribution of this Foundry-authored expression.

**Package** *[TDA]* — an upstream TDA or topological deep learning software project, together with
this KB's profile of it. It records the code and its facts — repository, language, license,
upstream health, and implemented **Methods** — rather than a runnable configuration. It is the
subject of hardening; contrast **Environment**.

**Paper** *[TDA]* — this instance's proposed **Source note** kind for an upstream paper or survey:
our summary/review that links to the source rather than copying it wholesale. It is distinct from
**Package**, which profiles software, and **Manuscript**, which is original research authored by
this project. Book or tutorial kinds should be added only if the corpus requires them.

**Pipeline** *[TDA]* — a runnable, end-to-end bioinformatics analysis that places the genuinely
topological step in the real upstream and downstream context a user needs. The TDA node is authored
deeply; surrounding stages are adopted from existing tools and packages but must still run. A
Pipeline may later be delivered as a **Workflow**, but the two terms are not synonyms.

**Portability grade (L0–L4)** *[TDA]* — biopixi's reproducibility and portability score for an
**Environment**, from L0 out-of-profile through L4 single-package auto-container. It grades the
environment; it is not the Foundry's scientific acceptance check.

**Proof** *[TDA]* — a mathematical result — a theorem with its proof — grounding a TDA or
topological deep learning **Method**. It means mathematics, not a proof-of-concept demonstration.

**Provenance** *[pattern]* — a record (`_provenance.json`) emitted beside every cast artifact:
which Mold revision, which target, which references resolved, and which checks ran. It is the
durable, universal non-commodity asset present in every instance; the answer to which specific
claim is real and where it came from.

TDA status: provenance requirements are inherited, but no cast currently exists to emit a record.

**Recipe** *[TDA]* — a planned note kind for a `rattler-build` or conda recipe that reproducibly
builds a **Package** into a channel artifact when it is not already available. A thin catalog note
may point to the real files under `recipes/<slug>/`; it must not duplicate them. Recipe notes are
not cast merely because they appear in the KB.

**Reference** *[pattern]* — a typed dependency a Mold declares. The *kind* discriminator controls
how casting treats it, so resolving references is per-kind dispatch, not “follow every link the
same way.” Common kinds include `pattern`, `schema`, `cli-command`, `prompt`, `example`, and
`eval`; what each kind's dispatch does is the instance's to declare, not the pattern's to fix.

TDA status: no `reference_contract.yml` exists and no TDA reference-kind vocabulary has been
registered. The first real Mold's dependencies should determine it.

**Shape** *[Astro stack]* — whether a kind's notes are flat files (`file`) or directories holding
an `index.md` (`directory`). Shape is declared by the kind and required of every kind; it is not
inferred separately for each note.

**Skill artifact** *[pattern]* — the compiled output of casting: self-contained, scoped to one
action, frozen against the source revision, with no links back and no runtime dependency on the KB.
`SKILL.md` (or any skill file) is therefore a compile target, never the authoring surface.

TDA usage: prefer “skill artifact” over bare “Skill” when the source/output distinction
matters. Skills are built Molds, not an authored note kind.

**Source note** *[TDA; aligned with SGF]* — a regenerable reading note for one external source,
kept separate from this project's framing and graded by recoverability rather than coverage. It
links to and reviews the source rather than reproducing it, and its **Summary posture** is driven by
the source's license.

TDA specialization: the current source-note candidate is **Paper**. Unlike SGF's directory-shaped
research notes, the current TDA paper records are flat files; that difference should remain until a
real companion requirement justifies changing their shape.

**Summary posture** *[TDA; aligned with SGF]* — whether a **Source note** is an own-words summary
or a license-aware summary. It is determined by the source's license through the **License-policy
table**, not by source type, and is recorded in the note's `derived` field.

**Tag and facet** *[Astro stack]* — the controlled browse vocabulary: every note carries at least
one tag, every tag belongs to a declared facet, and every facet is a closed enum whose members each
carry a one-line gloss. Tags are how a corpus is browsed, as distinct from how it is typed.

TDA status: the proposed facets are `method`, `application`, and `modality`. No `meta_tags.yml`
exists yet, so those values remain a design proposal rather than an installed registry.

**Target** *[pattern]* — the format a cast produces (for example, an Anthropic Agent Skill, a
generic skill format, or a baked-in web bundle). One Mold may cast to several targets; the KB stays
the source of truth.

TDA status: no target is implemented or selected yet.

**Tool** *[TDA]* — a Galaxy tool wrapper exposing a **Package** as a runnable step in Galaxy. It
is a proposed TDA instance kind, not a note kind inherited from the Foundry Pattern or SGF.

**Training** *[TDA]* — a Galaxy Training Network article teaching a TDA analysis through delivered
**Tools** and **Workflows**. It is a proposed TDA instance kind, not shared substrate.

**Wiki link** *[TDA; aligned with SGF]* — `[[Target]]`: the shared authoring syntax for addressing
a note from typed frontmatter or body prose. Rendering and validation must use one resolver and
one instance-owned link map so cross-file referential integrity cannot drift.

TDA status: the syntax is adopted, but no resolver or link map is installed yet.

**Workflow** *[TDA]* — a Galaxy workflow or TDA pipeline chaining **Tools** into a bioinformatics
analysis. It is a proposed Galaxy-delivery kind owned by this instance, not the Galaxy Workflow
Foundry's **Pipeline** extension catalogued by the Foundry Pattern.
