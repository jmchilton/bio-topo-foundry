---
type: meta
title: Guiding Principles
summary: How the Foundry pattern's principles land on topology in bioinformatics — what is inherited, what is specialised, and what this domain added.
record_kind: foundation
order: 2
status: revised
created: 2026-08-08
revised: 2026-08-11
revision: 3
tags:
  - meta
---

# Guiding Principles

The [pattern's guiding principles](https://galaxyproject.github.io/foundry-pattern/pattern/guiding-principles/)
are domain-free, and every instance inherits all of them. This record is how they land on
topological data analysis in bioinformatics. Some are specialised until they say something the
pattern could not; some are restated because this domain adds nothing to them, and leaving them
unwritten would read as rejection rather than agreement. Four are additions: *fix upstream at the
layer that owns the defect*, *replicate before you extend*, *be honest about what topology buys*,
and *deferred machinery stays named as deferred*. Each exists because something in this corpus made
it necessary.

The grouping below is the pattern's, and so is the shape of each entry: what it commits to, why it
matters, and what it requires. Where a principle costs something, the cost is named.

## Keep knowledge grounded

### Source Authority Beats Local Copies

Knowledge stays healthy near the project that owns it. A method belongs to its paper, a package's
behaviour belongs to the package, a build's contents belong to its `recipe.yaml`, and an
environment's contents belong to its `pixi.toml`. This Foundry connects, explains, grades, and
tests; it does not compete to be the canonical home for any of it.

**Why it matters.** A local copy is the thing that goes stale, and a reader cannot tell a stale copy
from a current one. Refusing local derivatives outright would leave the corpus unable to say
anything; treating them as canonical makes the drift invisible.

**Requires:** notes cite and link rather than restate, and where exact content has to travel it
travels as a file copied verbatim with its hash recorded, not as prose about the file.

### Fix Upstream, at the Layer That Owns the Defect

*An addition.* When re-execution finds a defect, the fix goes where the defect lives: a pull request
to the package, an issue with a reproducer, a licence request, a channel recipe.

**Why it matters.** A downstream workaround buried in a fixture repairs one run and leaves the next
person to rediscover the same bug — and it quietly makes this Foundry the owner of a patch it never
wanted to maintain. The pattern says upstream owns the facts; this says the corresponding thing
about repairs, which only becomes a live question once you are running the software rather than
reading it.

**Requires:** patience, which is the cost. Upstream may not merge, may not answer, may not have a
licence to give. So the discipline is to prepare the contribution properly, record what was found
and what was sent, and treat an unmerged fix as an open obligation rather than a solved problem.
Where upstream is unlicensed and therefore unfixable by anyone downstream, the remaining honest move
is reimplementation from the published description — never from the code or the bytecode, because
methods are not copyrightable and code is.

### A Licence Is a Fact About a Note

Not a footnote, not something to sort out at publication time. `package` and `paper` carry the
licence as a discriminated union where `missing` is a *declared value* rather than an omitted field,
because "this software has no licence" is one of the most consequential facts a note can carry, and
an omitted field is indistinguishable from an unchecked one.

**Why it matters.** An article licence is not a software licence. Every flagship tool in this corpus
is described by an openly licensed paper, and most of their repositories grant nothing; treating the
two as one grant is the specific mistake this typing exists to make impossible to write down. The
pattern states the principle for content crossing into a Foundry; here the content that crosses is
software, and the trap is a grant that looks present because the adjacent paper has one.

**Requires:** deny-by-default resolution through the shared policy table, and evidence wherever a
state would otherwise be an author's opinion. A recipe's `upstreaming: blocked` means the licence
forecloses publication, and a test ties it to the recipe's own `about.license` — so it cannot be
claimed as a scheduling excuse or waived by optimism.

### Corpus-First, Not Invention-First

Abstractions appear after content demands them, not before. The tag vocabulary was seeded from the
notes that existed; the reference contract declares exactly the reference kinds the current Molds
use, and narrows cast modes to implemented and exercised capacity.

**Why it matters.** A comprehensive-looking note that no contact with a real tool forced into
existence is indistinguishable, to a reader, from an earned one. The same is true of a schema:
declaring an empty kind creates a contract nobody has tested against a real note and a browse
surface that renders nothing.

**Requires:** that anticipated kinds stay undeclared until a note needs them — `manuscript`, `proof`,
`tool`, `workflow`, and `training` were all named by the design draft and none of them exist. The
restraint applies to prose on the same terms.

## Make knowledge trustworthy and actionable

### Reproducibility At Every Layer

A maintainer should be able to recover how any derived artifact was produced and what it depended
on. That covers the knowledge pipeline, not only the science it describes.

**Why it matters.** Without lineage, a changed artifact is merely different, and nobody can tell
which source, assumption, or check accounts for the difference. This domain has two kinds of derived
artifact and both need it: a cast bundle, and a replication result that is supposed to stand as
evidence about somebody else's paper.

**Requires:** a cast that records the Mold it came from by content hash and commit, and each
resolved reference by source and destination hash; a replication experiment that pins its executable
repository by full commit id and names the environment that ran it; and generated catalogs that
regenerate deterministically and are drift-checked rather than trusted. [[build-and-validation]] owns
which of those run and when.

### Deterministic Tools Do Deterministic Work

Models interpret, synthesise, and translate. Parsing, schema validation, licence resolution, hashing,
and copying go to tools that answer the same way every time — and nothing is trusted because the
thing that produced it says so.

**Why it matters.** A prose caveat is advisory: a model can repeat one accurately and still violate
it in the same breath. A deterministic instrument is cheaper, auditable, and able to stop the build.

**Requires:** that the mechanical half actually be mechanical — strict schemas that fail rather than
warn, a licence policy table rather than an author's judgement in prose, generated artifacts checked
against their sources. The half that is not mechanical is the interesting one here: no validator can
answer whether a topological method works. That question is handed to re-execution, which the next
two principles are about.

### Runnable Beats Described

The pattern asks that knowledge be actionable rather than passive. In this domain that means
something specific: a writeup of a tool is not knowledge about the tool until something can run it.
This is why `package` and `environment` are separate kinds rather than one kind with a field. A
package is abstract — code to read, a licence to check, an upstream to watch. An environment is
composite and actionable: a `pixi.toml` assembling packages and their dependencies into one
configuration that installs and runs.

**Why it matters.** Keeping them separate is what stops a corpus of thorough descriptions from
reporting full coverage of software nobody has installed. The cost is real: most packages here have
an environment, and building each one surfaced problems that reading never would — unsolvable
dependency closures, absent channels, a build that needs `cmake <4`, a package name already taken by
an unrelated project. That is the principle working, not the principle being expensive.

**Requires:** that neither kind be a field on the other, because they do not correspond one to one in
either direction — [[ann-backends-environment]] pins two libraries together, and a package can appear
in several fixtures. On the agent side it requires the same separation the pattern names: a Mold
declares what one action needs, and a cast packages that declared surface without becoming the new
source of truth.

### Replicate Before You Extend

*An addition.* Every replication experiment must contain a `replicate` stage; an extend-only study is
a different thing and does not belong to this kind.

**Why it matters.** Re-running published work in this corpus is what found a released scorer feeding
`(x, y, y)` where it meant `(x, y, z)`, and a manifold toolkit whose seeded layouts do not reproduce.
Neither was visible from reading the paper, the code, or the released numbers. Both were only visible
from running it and comparing. Extending a result you have not reproduced builds on a number nobody
has checked.

**Requires:** that a replication is not complete until a named biopixi environment has produced the
recorded evidence, enforced by the schema rather than trusted to an author's memory. The current
corpus is honestly incomplete under that rule, which is the correct outcome — the alternative is a
`status: complete` that means someone believed it worked.

### Be Honest About What Topology Buys

*An addition.* A comparative claim needs a matched non-topological baseline, an identical split, and
a stated metric, or it is not made.

**Why it matters.** A Foundry organised around a family of techniques is precisely the place where
those techniques will be over-credited, so the correction has to be structural rather than
attitudinal. Both surveys in this corpus independently flag the same gap in the field: topological
methods reported without a matched non-topological baseline under the same split. Our own replication
found a substantial share of one published margin was an artifact of a coordinate bug.

**Requires:** that agreement with a model not be reported as agreement with biology. Preservation and
consistency scores measure the former, and are described as such.

## Make knowledge legible and durable

### The Knowledge Base Documents Itself

The Foundry documents not only topology in bioinformatics, but how its own knowledge is named,
organised, validated, and transformed. That documentation lives inside the inspectable corpus rather
than in maintainer memory or scattered implementation comments.

**Why it matters.** A system can execute correctly today and still be impossible to change
responsibly tomorrow. If a contributor has to reconstruct the design from code and commit history,
the hard-won knowledge has only moved from one hidden container into another.

**Requires:** an authoritative vocabulary in `content/meta/glossary.md`; focused design records with
explicit ownership, so a change routes to exactly one of them; documentation beside each kind rather
than a central catalogue of kinds; and generated inventories wherever a hand-written one would go
stale — which is why these records name no roster of kinds, notes, or files. [[architecture]] is the
map that makes the routing findable.

### Deferred Machinery Stays Named as Deferred

*An addition, and the sharpest edge of self-documentation.* Cast modes are narrowed to the one mode
this instance can actually honour, because a mode is a commitment to machinery and a manifest that
validates but cannot be cast is worse than one that fails.

**Why it matters.** The failure mode is a reader's: someone acts on a present-tense sentence, goes
looking for the output, finds nothing, and cannot tell whether the record was aspirational or their
checkout is broken. Ambition belongs in a sentence that says it is ambition.

**Requires:** that a record may state a contract for machinery that does not exist, but must not
describe it as running. Narrowing is what made the first cast cheap: until the caster landed these
records said *would cast* and named no artifact, and when it landed there was exactly one mode to
implement. [[build-and-validation]] owns which target and which mode are real. A package workspace
and the Galaxy delivery kinds are still absent, and are named that way rather than described.

### Progressive Disclosure Over Context Flooding

A reader and an agent should meet the right depth at the right time. A Mold discloses the action and
names typed references to what it needs; a reference declares whether it loads up front or on
demand; the site links rather than inlines.

**Why it matters.** Flattening every reference, schema, and rationale into one artifact spends
attention before any of it is useful, and it destroys the property that made the corpus worth having
— the graph. Minimalism is not the goal; deliberate disclosure is.

**Requires:** keeping the rich graph in the source so that a condensed artifact can be produced from
it, without the graph itself becoming the artifact.

### Portable Artifacts Over Platform Fashion

Core knowledge stays independent of any agent runtime, editor, model vendor, or orchestration
framework. A new platform is a new target, not a rewrite of the corpus.

**Why it matters.** Agent platforms will change faster than the knowledge they consume. Persistent
homology will outlive every skill format currently competing to carry it, and binding the source to
today's packaging would give decades-old mathematics the lifetime of a file layout.

**Requires:** that target-specific vocabulary live in the target's own declaration and nowhere else.
The Claude target is where `SKILL.md` and the frontmatter a Claude skill needs are named; no Mold and
no reference mentions any of it. It also requires that a bundle not reach back — the target forbids
runtime paths into `content/`, so a cast artifact cannot quietly depend on the corpus being checked
out beside it. [[build-and-validation]] owns the casting boundary.

## One Reinforcing System

Runnability is what makes a description checkable, and checking is what turns a licence from a
footnote into a gate on what can be delivered at all. Running published work is what exposes defects;
fixing them upstream is what keeps the corpus from silently forking the ecosystem it depends on.
Honesty about what topology buys is the same discipline pointed at ourselves, and corpus-first
restraint is that discipline applied before the writing rather than after.

The pattern's spine is *actionable knowledge, not passive notes*. Here it lands as **Runnable Beats
Described**, and it is load-bearing for the same reason: a corpus about software that nobody can
install is a bibliography. **Replicate Before You Extend** is what keeps it from being a bibliography
of things that merely install.

The resulting division of labour:

- Upstream papers own the mathematics and the claims.
- Upstream packages own their behaviour, their versions, and their licences.
- This Foundry owns synthesis, grading, packaging where a channel gap exists, and the evidence from
  re-running the work.
- A biopixi environment owns whether something runs, and a licence policy owns whether it may ship.

## See Also

- [The pattern's guiding principles](https://galaxyproject.github.io/foundry-pattern/pattern/guiding-principles/)
  — the domain-free statements these specialise, restate, and extend.
- [[positioning]] — what this Foundry is, what it refuses to be, and its nearest neighbours.
- [[architecture]] — the system map and the routes to the records that own each part.
- [[replication-experiments]] — the working practice behind *replicate before you extend*.
