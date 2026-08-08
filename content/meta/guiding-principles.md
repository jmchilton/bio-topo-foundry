---
type: meta
title: Guiding Principles
summary: The design pressure behind runnability, licensing as a fact, replication before extension, fixing upstream, and corpus-first restraint.
record_kind: foundation
order: 2
status: draft
created: 2026-08-08
revised: 2026-08-08
revision: 1
tags:
  - meta
---

# Guiding Principles

[[positioning]] says what this Foundry is and what it refuses to be. These are the pressures behind
that shape — each one written because something in this corpus made it necessary, not because it
sounded like a good idea. Where a principle costs something, the cost is named.

## Source Authority Beats Local Copies

Knowledge stays healthy near the project that owns it. A method belongs to its paper, a package's
behaviour belongs to the package, a build's contents belong to its `recipe.yaml`, and an
environment's contents belong to its `pixi.toml`. This Foundry connects, explains, grades, and
tests; it does not compete to be the canonical home for any of it.

The rule bites hardest where an authority is *executable*. A recipe note that carried a version
number would be a second place to update it, and the one that got missed would be the note — so a
recipe note carries only the three things `recipe.yaml` cannot state: what channel gap it closes,
whether anyone has actually built it, and what stands between it and publication. The same reasoning
is why an environment's companion files are measured from disk rather than declared in frontmatter.

## Runnable Beats Described

A writeup of a tool is not knowledge about the tool until something can run it. This is why
`package` and `environment` are separate kinds rather than one kind with a field: a package is the
abstract subject — code to understand, licence to check, upstream to watch — and an environment is a
graded, locked, executable fixture. Collapsing them would let a corpus of thorough descriptions
report full coverage of software nobody had ever installed.

The cost is real: most packages here have an environment, and building each one surfaced problems
that reading never would — unsolvable dependency closures, absent channels, a build that needs
`cmake <4`, a package name already taken by an unrelated project. That is the principle working, not
the principle being expensive.

## A Licence Is a Fact About a Note

Not a footnote, not something to sort out at publication time. `package` and `paper` carry the
licence as a discriminated union where `missing` is a *declared value* rather than an omitted field,
because "this software has no licence" is one of the most consequential facts a note can carry, and
an omitted field is indistinguishable from an unchecked one. Resolution is deny-by-default through
the shared policy table.

An article licence is not a software licence. Every flagship tool in this corpus is described by an
openly licensed paper, and most of their repositories grant nothing; treating the two as one grant
is the specific mistake this typing exists to make impossible to write down.

Where a state would otherwise be an author's opinion, it is tied to evidence. A recipe's
`upstreaming: blocked` means the licence forecloses publication, and a test ties it to the recipe's
own `about.license` — so it cannot be claimed as a scheduling excuse or waived by optimism.

## Replicate Before You Extend

Every replication experiment must contain a `replicate` stage; an extend-only study is a different
thing and does not belong to this kind. The pressure is direct: re-running published work in this
corpus is what found a released scorer feeding `(x, y, y)` where it meant `(x, y, z)`, and a
manifold toolkit whose seeded layouts do not reproduce. Neither was visible from reading the paper,
the code, or the released numbers. Both were only visible from running it and comparing.

A replication is not complete until a named biopixi environment has produced the recorded evidence,
and the schema enforces that rather than trusting an author's memory. The current corpus is
honestly incomplete under that rule, which is the correct outcome — the alternative is a
`status: complete` that means someone believed it worked.

## Fix Upstream, at the Layer That Owns the Defect

When re-execution finds a defect, the fix goes where the defect lives: a pull request to the
package, an issue with a reproducer, a licence request, a channel recipe. A downstream workaround
buried in a fixture repairs one run and leaves the next person to rediscover the same bug — and it
quietly makes this Foundry the owner of a patch it never wanted to maintain.

This has a cost, and it is patience. Upstream may not merge, may not answer, may not have a licence
to give. So the discipline is to prepare the contribution properly, record what was found and what
was sent, and treat an unmerged fix as an open obligation rather than a solved problem. Where
upstream is unlicensed and therefore unfixable by anyone downstream, the remaining honest move is
reimplementation from the published description — never from the code or the bytecode, because
methods are not copyrightable and code is.

## Be Honest About What Topology Buys

A Foundry organised around a family of techniques is precisely the place where those techniques will
be over-credited, so the correction is structural rather than attitudinal. Both surveys in this
corpus independently flag the same gap in the field: topological methods reported without a matched
non-topological baseline under the same split. Our own replication found a substantial share of one
published margin was an artifact of a coordinate bug.

So a comparative claim needs a matched baseline, an identical split, and a stated metric, or it is
not made. Preservation and consistency scores measure agreement with a model, not biological truth,
and are described as such.

## Corpus-First, Not Invention-First

Abstractions appear after content demands them, not before. The tag vocabulary was seeded from the
notes that existed; the reference contract declares exactly the reference kinds and cast modes the
current Molds actually use, checked in both directions. Kinds that the design draft anticipated —
`manuscript`, `proof`, `tool`, `workflow`, `training` — do not exist, because declaring an empty
kind creates a schema nobody has tested against a real note and a browse surface that renders
nothing.

The same restraint applies to prose. A comprehensive-looking note that no contact with a real tool
forced into existence is indistinguishable, to a reader, from an earned one.

## Progressive Disclosure Over Context Flooding

A reader and an agent should meet the right depth at the right time. A Mold discloses the action and
names typed references to what it needs; a reference declares whether it loads up front or on
demand; the site links rather than inlines. The corpus keeps the rich graph so that a condensed
artifact can be produced from it without the graph being the artifact.

## Deferred Machinery Stays Named as Deferred

No caster exists. No `casts/` directory exists. Cast modes are narrowed to the one mode this
instance could actually honour, because a mode is a commitment to machinery and a manifest that
validates but cannot be cast is worse than one that fails. Records say *would cast* and never imply
an artifact is available.

The reason is a reader's failure mode: someone acts on a present-tense sentence, goes looking for
the output, finds nothing, and cannot tell whether the record was aspirational or their checkout is
broken. Ambition belongs in a sentence that says it is ambition.

## How the Principles Connect

Runnability is what makes a description checkable, and checking is what turns a licence from a
footnote into a gate on what can be delivered at all. Running published work is what exposes
defects; fixing them upstream is what keeps the corpus from silently forking the ecosystem it
depends on. Honesty about what topology buys is the same discipline pointed at ourselves, and
corpus-first restraint is that discipline applied before the writing rather than after.

The resulting division of labour:

- Upstream papers own the mathematics and the claims.
- Upstream packages own their behaviour, their versions, and their licences.
- This Foundry owns synthesis, grading, packaging where a channel gap exists, and the evidence from
  re-running the work.
- A biopixi environment owns whether something runs, and a licence policy owns whether it may ship.

## See Also

- [[positioning]] — what this Foundry is and refuses to be, and the measurements behind it.
- [[architecture]] — the system map and the routes to the records that own each part.
- [[replication-experiments]] — the working practice behind *replicate before you extend*.
