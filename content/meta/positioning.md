---
type: meta
title: Positioning
summary: What this Foundry is, what it refuses to be, and the measured state of TDA bioinformatics tooling that makes it worth building.
record_kind: foundation
order: 1
status: draft
created: 2026-08-08
revised: 2026-08-08
revision: 1
tags:
  - meta
---

# Positioning

This record owns what the Foundry is, what it refuses to be, and why — written down once so the
boundary is not re-argued in every other record. [[guiding-principles]] turns it into design
pressure; [[architecture]] turns it into a map.

## The problem is not the mathematics

Persistent homology, persistent and combinatorial Laplacians, Hodge decomposition, and Mapper are
decades-old public mathematics, and the bioinformatics results built on them are real work by people
publishing openly at the frontier. What fails is the distance between a published topological result
and a second person running it.

That is measured here rather than asserted, and the measurements are in this corpus:

- **Redistribution.** Of the five flagship tools profiled here, one — [[topometry]] — could be
  redistributed as found. [[petls]] declares no software licence anywhere, which is all rights
  reserved by default. [[topoqa]] is the same. [[topodockq]]'s scorer is MIT, but its featurizer
  shipped as Python 3.8 `.pyc` bytecode from a repository with no licence. [[hiponet]] is licensed
  non-commercially. In every one of these the article is openly licensed and the software is not;
  they are separate grants, and the open article is what makes the confusion easy.
- **Availability.** Every recipe under `recipes/` exists because a public conda channel does not
  supply that package at all, or supplies a build too old for the API the paper describes.
- **Correctness under re-execution.** Re-running published work here has found defects that survived
  peer review. A released interface-quality scorer built its edge point cloud from `(x, y, y)` where
  it meant `(x, y, z)`, and part of the published margin depends on it. A manifold-learning toolkit
  produces layouts that are not reproducible even by its authors from a fixed seed, which makes
  layout-level figures unrepeatable. [[topoqa-interface-quality]] and [[topometry-cell-cycle]] carry
  that evidence; both defects were traced to a specific line and reported upstream.

Nobody's incentives currently close this gap. A methods paper is complete when the method is
published; a package is complete when it runs on the author's machine; a survey is complete when it
cites both. The work of making a topological method installable, licensed, reproducible, and checked
by someone who did not write it belongs to no one.

## What we are building

A knowledge base that carries a topological method from the literature to something another person
can run, and that records — in checkable frontmatter rather than prose — how far each one actually
got.

Two obligations are held together, and neither is sufficient alone:

- **Move the field.** Original scholarship, and analysis procedures an agent can execute. This half
  is aspirational today: there is no `manuscript` kind and no manuscripts, and the writeups in this
  corpus are reviews of other people's work. Naming it here rather than quietly dropping it is the
  point — a Foundry that only packages other people's tools is a distribution channel.
- **Harden the tooling.** Get TDA software into conda channels and into Galaxy, with reproducible
  environments, recipes, wrappers, workflows, and training behind it. This half is where the corpus
  actually is.

## The spine, and that it has no teeth

```text
  frontier research        software          hardening              delivery
  (paper, method,     →    (package)    →    (recipe,          →    (Galaxy tool,
   proof, manuscript)                         environment)           workflow, training)
```

A note may sit anywhere on this arc, and most sit early. The spine is an **atlas, not a gate**: no
note is refused because an earlier stage is missing, no kind requires a downstream kind to exist,
and nothing in the schema enforces progression. That was a deliberate choice against the
alternative, which would have been a rule like "a method is not delivered until it reaches a
runnable Galaxy tool." Such a rule would have been unsatisfiable on day one and would have made the
corpus dishonest rather than disciplined — the maturity of each note is visible from its own typed
fields, which is a better answer than a gate nothing can pass.

One collision is worth naming because both halves are load-bearing and both use the word *harden*.
The spine's **hardening** is about software: making a package installable and reproducible. The
`arc` a replication experiment declares — `replicate`, `harden`, `extend` — is about a *claim*:
making a published result reliable without changing its scientific intent. They are different axes
that happen to rhyme, and [[replication-experiments]] owns the second one. The `arc` enum is
checked; the spine is not.

## What we refuse to be

- **Not a TDA textbook.** A method note defines a technique well enough to make the corpus navigable
  and to say which packages implement it. It does not teach the mathematics; the papers do that
  better and are linked.
- **Not a mirror of upstream documentation.** A package note profiles software and links to it. A
  `recipe.yaml` and a `pixi.toml` stay the authority on names, versions, licences, and dependencies,
  and no note restates them.
- **Not a benchmark leaderboard.** Numbers here belong to a replication experiment with a pinned
  protocol, a named environment, and an evidence manifest, or they do not belong here.
- **Not an advocate for topology.** This is the refusal that costs something. Both surveys in this
  corpus flag the same weakness in the field — topological methods are often reported without a
  matched non-topological baseline under the same split — and our own replication found a
  substantial part of one published margin was an artifact of a coordinate bug. A Foundry built
  around a technique is exactly the place where that failure would go unnoticed, so it is written
  down as a refusal rather than left to good intentions.

## What is distinctly ours

These are properties of the machinery, not claims about quality, and each is checked:

- **Replication is a typed, evidence-bearing kind.** Neither sibling Foundry has one. A
  `replication_experiment` pins a standalone repository by full commit id, names the biopixi
  environment that re-ran it, and cannot be marked complete without one.
- **A licence is a typed field with deny-by-default resolution.** `missing` is a declared value
  rather than an omitted field, because an absent licence is a fact worth recording. A recipe's
  `upstreaming: blocked` is tied by test to the recipe's own `about.license`, so the state cannot be
  claimed or waived by an author.
- **Upstream fixes are an output, not a side effect.** When a replication finds a defect, the fix is
  made where the defect lives. That has produced merged upstream changes, filed licence requests,
  reported defects, and prepared branches — rather than downstream workarounds that would leave the
  next person to rediscover the same bug.
- **Cleanroom from the paper, never from the code.** Where a method was sound and its implementation
  unlicensed, it was reimplemented from the published description without reading the code or
  decompiling the bytecode. Methods are not copyrightable; code is. That is how three of the blocked
  tools above became redistributable.

## What this record does not yet contain

A verified prior-art comparison. The Statistical Genomics Foundry's positioning names its nearest
neighbours on each axis, having checked each system individually, with a repository-root receipts
file behind every claim. No equivalent survey has been done for this instance, so no such claim is
made here — the TDA-tooling and reproducibility-infrastructure landscape is unexamined, not empty.
Doing that work is what would let this record say where we sit rather than only what we do.
