---
type: meta
title: Architecture Map
summary: A short map of the Foundry's domain spine, what it inherits from the pattern, and the focused records that own each part.
record_kind: foundation
order: 3
status: draft
created: 2026-08-08
revised: 2026-08-09
revision: 2
tags:
  - meta
---

# Architecture Map

The Topological Data Analysis Bioinformatics Foundry is a human-navigable knowledge base for taking
topological methods in bioinformatics from the literature to something another person can run. Its
domain spine is **frontier → hardening → delivery**, and [[positioning]] explains why that spine is
an atlas rather than a gate. This page maps the system and points at the records that own its
details; it deliberately holds no inventory of kinds, notes, or files, because each of those is
answered better by the thing that has them.

## System map

```text
       published methods, tools, and claims
                        │
                        ▼
            authored knowledge under content/
      methods, packages, papers, environments, recipes
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    replication experiments      Molds
    (re-run it, record what      (what to do, and the typed
     actually happened)           references it would need)
            │                       │
            └───────────┬───────────┘
                        ▼
              validated, rendered, and cast
               into committed bundles
```

Two things sit at the centre of that diagram rather than at its end. A **replication experiment** is
the Foundry's own evidence: it pins a standalone executable repository by full commit id, names the
environment that re-ran it, and records outcomes and deviations. A **Mold** is the action unit: it
says what to do and declares typed references to the knowledge that doing it would need. Neither is
downstream of the other, and both read the same corpus.

## Corpus shape

The kinds fall into three groups, and the grouping is the architecture — the roster itself is in the
generated manifest and on the site.

- A **research pole** describes work at the frontier: the techniques, the external sources that
  introduce them, and eventually original scholarship of our own.
- A **delivery pole** describes what it takes to run that work: the upstream software, the recipe
  that builds it when no channel does, and the graded environment that assembles software into
  something that installs and runs.
- **Connective tissue** joins the two: a method note is the concept both poles refer to, and a
  replication experiment is the evidence that the delivery pole actually reproduces the research
  pole's claim.

[[content-model]] owns what each kind requires and how they address each other. What matters here is
that describing software and running it are different kinds, so a thorough description can never be
counted as a working install — [[guiding-principles]] holds that argument.

## What is inherited, what changes, what is added

Every vocabulary in this instance splits the same way. The **substrate** is the shared framework —
kind machinery, the tag-registry format, the licence-policy table, the reference contract, the
reading shell — and ships in the installed `@galaxy-foundry/*` packages. The **vocabulary** is ours:
no shared kind *definitions* exist in those packages, and that is deliberate. The framework is
shared; what a Foundry is about is not.

From the pattern this instance inherits the source-to-cast distinction, the provenance requirement,
typed references, progressive disclosure, strict content contracts, a declared tag vocabulary, and a
human-first reading site. It adapts the corpus from workflows and statistical methods to topological
software and the claims made with it, and it adapts the deterministic gate from schema validation
alone to schema validation plus re-execution evidence.

The instance-specific additions are three: replication as a first-class evidence-bearing kind,
licensing typed on the note with deny-by-default resolution, and a packaging kind for the builds
this repository has to supply itself. Each exists because this domain produced the problem, not
because the pattern suggested it.

**Convergence direction.** This is the third instance and the first stood up by reusing the earlier
two as examples. The intent is to converge by **back-porting from here**, not by inheriting the
first instance's early ad-hoc shape — so where a shared kind differs between instances, the
difference is recorded as a debt rather than silently reconciled. The `meta` kind's own
documentation carries the current example.

## Major boundaries

- **Domain design versus implementation.** What the Foundry is for, and what it refuses, live in
  [[positioning]] and [[guiding-principles]]. TypeScript and Astro mechanics live in
  [[code-architecture]].
- **Knowledge representation versus physical placement.** [[content-model]] defines kinds,
  addressing, tags, links, references, and companions. [[repository-layout]] defines where their
  files belong and what each location implies.
- **Authored versus generated.** Notes, registries, and recipes are authored. The kind manifest and
  the citation-audit run and report are generated and drift-checked. [[build-and-validation]] owns
  those flows.
- **Described versus executed.** A package note describes; an environment executes; a replication
  experiment records what happened when it did. The boundary is why a claim about behaviour is
  supposed to name evidence rather than a reading.
- **Present versus planned machinery.** The content contract, validator, generators, citation audit,
  caster, and site exist. A package workspace and Galaxy delivery kinds do not. A record may state a
  contract for deferred machinery; it must not describe it as running.

## Focused records

Foundation — why the Foundry is shaped this way:

- [[positioning]] — what it is, the three kinds of work behind it, and what it refuses to be.
- [[guiding-principles]] — the design pressure, and what each principle costs.
- [[replication-experiments]] — how a replication is conducted and which half of it lives outside
  this repository.

Infrastructure — what is implemented, where, and when:

- [[code-architecture]] — components, dependency seams, entry points, deliberate absences.
- [[content-model]] — kinds, frontmatter, tags, links, references, companions.
- [[repository-layout]] — the physical tree and lifecycle-based placement rules.
- [[build-and-validation]] — commands, generators, validation layers, CI, and known gaps.

## Records the sibling instances keep that are absent here

Named rather than overlooked, because a missing record reads as an oversight otherwise:

- **Molds and the Mold spec.** One Mold exists, [[score-docking-poses]]. One note is not enough to
  argue an authoring contract from, and its kind documentation carries the current shape. These
  become records when a second and third Mold show what actually recurs.
- **Casting.** Implemented, but narrowly: one target, one mode, one committed bundle.
  [[build-and-validation]] owns the boundary and [[repository-layout]] owns where bundles sit. A
  record earns its place when there is more than one target to arbitrate between.
- **Corpus.** The sibling instances have a record for how external sources are ingested without
  becoming a mirror. Here the same pressure is currently answered by the source-authority principle
  and by the citation audit, which checks that a citation names the work its own bibliography
  describes. A separate record is warranted when the ingestion posture is more than that.
- **A gate record.** The Statistical Genomics Foundry's referee loop is machinery around a rule with
  teeth. This instance deliberately has no such rule; the spine is descriptive, so there is no loop
  to document, and [[positioning]] states that choice rather than a record describing enforcement
  that does not exist.

## Architectural invariants

Independent of each other; each is something that must stay true, not a step in a sequence.

- The knowledge base is authored for people and remains the source of truth for any cast.
- A claim about behaviour is recoverable from evidence — a run, a manifest, a licence file — rather
  than from a reading or from model memory.
- Description and execution stay separately typed, so coverage of one is never reported as coverage
  of the other.
- Note kinds and registries are declared vocabularies, never inferred from a directory or a prefix.
- The site and the standalone validator consume the same assembled schemas and the same collection
  table.
- Redistribution is decided by a policy table from a declared licence, never by an author's
  judgement in prose.
- Deferred machinery stays named as deferred until code and a test make it real.

Update this map only when a top-level boundary, the domain spine, or a reading route changes.
Detailed changes belong to the focused record that owns them.
