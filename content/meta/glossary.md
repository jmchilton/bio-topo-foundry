# Glossary — TDA Bioinformatics Foundry

**biopixi** — the specification and grader for reproducible, lightweight **Environments**. It
scores a `pixi.toml` on the L0–L4 **Portability grade** ladder.

**Cast** — *(verb)* produce a self-contained artifact from a Mold via the casting process.
*(noun)* one casting result for a (Mold, target) pair.

**Casting** — the deterministic compilation step that turns a Mold into a skill artifact. It
resolves typed references, places their contents according to kind and target, renders the
artifact, and emits provenance. Artifacts come out scoped, isolated, and frozen, with no links
back.

**Collection** — a *location*: a base directory plus the pattern selecting which files under it
are notes, and the kind those notes are. Collections and kinds are not one-to-one, so a kind's
locations are derived from the collection table rather than declared beside the kind.

**Companion** — a non-note file in a directory-shaped note's directory, declared once by the
**Kind** rather than repeatedly by each note. Only directory-shaped kinds have companions; a
sibling that is itself a note is never a companion; and a companion describes layout only. A file
a note depends on is a **Reference** instead.

Each companion declaration carries a requirement level (`required`, `recommended`, or `optional`)
and a disposition: `foundry-only` never leaves, `cast-input` is read by the caster but does not
appear in output, and `bundled` is copied in. This is distinct from a per-note field selecting what
one note carries into a cast.

**Environment** — a reproducible, lightweight, agent-runnable biopixi fixture that assembles one
or more **Packages** and their dependencies into an executable configuration. It carries a
**Portability grade**. Contrast **Package**, which describes upstream software rather than one
runnable configuration.

**Foundry** — the standalone, navigable TDA bioinformatics **Knowledge Base** from which casting
reads. Its name is the **Topological Data Analysis Bioinformatics Foundry**. Use **Foundry Pattern**
for the stack-independent design pattern, not for this repository.

**Kind** — the `type:` discriminator a note declares, together with the one schema that validates
it. The kind decides what metadata is required, what casting may assume, and what the site can
render. It also declares the note's **Shape**, **Companions**, and `layer`.

Not to be confused with a **reference kind**, which classifies a dependency a Mold declares. One
word names two closed vocabularies; a page using both must say which one it means.

For the three authored-writeup kinds most likely to collide, ask whose scholarship the note
describes and what artifact is being hardened:

- original research we author for publication → **Manuscript**;
- our profile of one external software project → **Package**; and
- our review of one external paper or survey → **Paper**.

A review of someone else's work is never a Manuscript. A software project closely associated with
one paper is a Package when the software is the artifact we intend to harden, and a Paper when only
the result is being reviewed.

A **Replication experiment** answers a different question: what did we run and observe when testing
the external claim? It is our evidence-bearing study note, not the external **Paper**, the software
**Package**, the reusable **Workflow**, or an original **Manuscript**.

**Kind context** — what a kind's schema may draw on when it is built: the base frontmatter
envelope plus whatever registries the Foundry hands it. Foundries agree on what a kind is and may
disagree on what a kind draws from, so the shared contract is generic over the context and each
instance binds it once.

**Kind manifest** — the generated, machine-readable record of every kind a Foundry defines: its
title, layer, summary, shape, companions, locations, documentation, and required fields. Required
fields are derived from the same schema that validates notes. The manifest format is shared and
versioned because it crosses repository boundaries.

**Knowledge Base (KB)** — the inspectable, human-readable source of truth at the center of every
Foundry. It is authored to be read and learned by a human, not merely stored for an agent to
retrieve. The KB is the source; a skill is the package.

**License-aware summary** — a **Source note** whose license resolves to `verbatim-ok`, permitting
short, marked, load-bearing quotations subject to the license's obligations. Its `derived` value is
`license-aware-summary`. The label records that upstream expression is carried; it does not assert
that attribution or other obligations have been satisfied.

**License-policy table** — the shared SPDX-id → redistribution-policy table:
`{ name, policy, license_file, copyleft, obligations }`, with unknown or missing identifiers
resolving deny-by-default. It answers what a license permits and whether a note's `derived` posture
carries upstream expression. It does not decide whether a TDA note is coherent with its declared
license.

**Load policy / progressive disclosure** — show the right knowledge at the right time.
Manuscripts and methods disclose concepts, Molds disclose actions, and references disclose
dependencies. It is both an authoring principle and a runtime contract.

**Manuscript** — a TDA note kind for original TDA or topological deep learning research we author
for publication. It is distinct from a **Package** profile and a **Paper** reviewing external work.

**Maturation arc** — *frontier → hardening → delivery*. Frontier research (**Manuscript**,
**Proof**, **Mold**) connects to the **Package** it concerns; hardening produces a graded
**Environment**; and Galaxy delivery produces **Tools**, **Workflows**, and **Training**. It is an
atlas, not a gate: knowledge may enter at any stage. **Replication experiments** cross-cut the arc
by testing source claims and recording evidence through `replicate`, `harden`, and optionally
`extend` arms before a reusable delivery necessarily exists.

**Method** — a TDA note kind defining a TDA or topological deep learning technique, such as
persistent homology, persistent Laplacian, Mapper, topological deep learning, or simplicial
learning. Research notes link to the method they advance; software and delivery notes link to the
method they implement.

**Mold** — the unit of the KB: an abstract, typed reference manifest describing one action. Its
frontmatter declares the references it depends on; its body is a procedural skeleton tying them
together. Molds are source artifacts independent of any agent runtime.

**Note** — one authored corpus entry that declares its kind in frontmatter and validates against
that kind's schema. A note is either a flat file or a directory whose `index.md` is the note. Shape
is a property of the **Kind**, never of an individual note.

**Own-words summary** — a **Source note** expressed entirely in new prose, with only short
functional strings — parameter names, error text, numeric thresholds, or equation forms —
retained verbatim as facts. Its `derived` value is `own-words-summary`; the license-policy row does
not govern redistribution of this Foundry-authored expression.

**Package** — a TDA note kind for an upstream TDA or topological deep learning software project,
together with this KB's profile of it. It records the code and its facts — repository, language,
license, upstream health, and implemented **Methods** — rather than a runnable configuration. It
is the subject of hardening; contrast **Environment**.

**Paper** — the TDA **Source note** kind for an upstream paper or survey: our summary and review
that links to the source rather than copying it wholesale. It is distinct from **Package**, which
profiles software, and **Manuscript**, which is original research authored by this project.

**Pipeline** — a runnable, end-to-end bioinformatics analysis that places the genuinely
topological step in the upstream and downstream context a user needs. The TDA node is authored
deeply; surrounding stages are adopted from existing tools and packages but must still run. A
Pipeline can be delivered as a **Workflow**, but the terms are not synonyms.

**Portability grade (L0–L4)** — biopixi's reproducibility and portability score for an
**Environment**, from L0 out-of-profile through L4 single-package auto-container. It grades the
environment; it is not the Foundry's scientific acceptance check.

**Proof** — a TDA note kind for a mathematical result — a theorem with its proof — grounding a
TDA or topological deep learning **Method**. It means mathematics, not a proof-of-concept
demonstration.

**Provenance** — a record (`_provenance.json`) emitted beside every cast artifact: which Mold
revision, which target, which references resolved, and which checks ran. It identifies which
specific artifact is real and where it came from.

**Recipe** — a TDA note kind for a `rattler-build` or conda recipe that reproducibly builds a
**Package** into a channel artifact. A thin catalog note points to the real files under
`recipes/<slug>/`; it does not duplicate them. Recipe notes are not cast merely because they appear
in the KB.

**Replication experiment** — a TDA note kind for a bounded study this project ran to test claims
from an external **Paper** or **Package** under a pinned protocol. Its standalone repository is the
executable artifact; its Foundry note pins a revision and records claims, arms, deviations,
evidence, outcomes, provenance, redistribution constraints, and the corresponding biopixi
**Environment** used to run it. It must contain a `replicate` arm and may continue through `harden`
and `extend`; an extend-only study is not a replication experiment. It may inform a **Workflow** or
**Manuscript**, but is neither.

**Reference** — a typed dependency a Mold declares. Its reference-kind discriminator controls how
casting treats it, so resolving references is per-kind dispatch rather than “follow every link the
same way.” What each reference kind does is for the Foundry to declare.

**Shape** — whether a kind's notes are flat files (`file`) or directories holding an `index.md`
(`directory`). Shape is declared by the kind and required of every kind; it is not inferred for
individual notes.

**Skill artifact** — the compiled output of casting: self-contained, scoped to one action, frozen
against the source revision, with no links back and no runtime dependency on the KB. `SKILL.md` (or
any skill file) is a compile target, never the authoring surface. Skills are built Molds, not an
authored note kind.

**Source note** — a regenerable reading note for one external source, kept separate from this
project's framing and graded by recoverability rather than coverage. It links to and reviews the
source rather than reproducing it, and its **Summary posture** is driven by the source's license.

**Summary posture** — whether a **Source note** is an own-words summary or a license-aware
summary. It is determined by the source's license through the **License-policy table**, not by
source type, and is recorded in the note's `derived` field.

**Tag and facet** — the controlled browse vocabulary: every note carries at least one tag, every
tag belongs to a declared facet, and every facet is a closed enum whose members each carry a
one-line gloss. TDA facets are `method`, `application`, and `modality`.

**Target** — the format a cast produces, such as an Anthropic Agent Skill, a generic skill format,
or a baked-in web bundle. One Mold may cast to several targets; the KB stays the source of truth.

**Tool** — a TDA note kind for a Galaxy tool wrapper exposing a **Package** as a runnable step in
Galaxy.

**Training** — a TDA note kind for a Galaxy Training Network article teaching an analysis through
delivered **Tools** and **Workflows**.

**Wiki link** — `[[Target]]`, the authoring syntax for addressing a note from typed frontmatter or
body prose. Rendering and validation use one resolver and one link map so cross-file referential
integrity cannot drift.

**Workflow** — a TDA note kind for a Galaxy workflow chaining **Tools** into a bioinformatics
analysis. It is the Galaxy-native delivery form of a **Pipeline**.
