# Design Record

A Design Record keeps knowledge about the Foundry itself inside the corpus. Foundation records say
why it is shaped this way; infrastructure records describe what is implemented, where it lives,
and when it runs. It is the only kind here whose subject is the Foundry rather than topological data
analysis.

Required fields:

- `type: meta`
- `title`: the record's display name, which is also its address in prose and on a card
- `summary`: 20–160 characters, the card text on the design index
- `record_kind`: which shelf the record sits on, `foundation` or `infrastructure`
- `order`: reading order within that shelf
- `status`, `created`, `revised`, `revision`: the lifecycle envelope
- `tags`: at least one registered tag, in practice `meta`

Which records exist is the collection's answer, not this file's. The Foundry pattern
[names a core set](https://galaxyproject.github.io/foundry-pattern/pattern/design-records/) —
architecture, guiding principles, molds, mold-spec, casting, corpus, code-architecture,
content-model, build-and-validation, repository-layout — and a listing here would be a second,
staler copy of whatever `content/meta/` actually holds.

## The two shelves

`record_kind` is a voice contract before it is a sort key.

A **foundation** record answers *why*. It carries rationale, may argue, and names the design
pressure a choice responds to along with what that choice costs. A reader works through it.

An **infrastructure** record answers *what, where, and when*. It is developer-facing, present
tense, and contract-shaped: components and their dependencies, the frontmatter contract, the
commands and gates, the physical layout. It does not argue.

A record whose voice fights its shelf is usually two records. The split is also why the shelves
render as separate sections rather than one list with a boundary the reader has to infer.

## Why `order` is a field

Reading order within a shelf, and the one thing about a hand-written registry array that
frontmatter could not otherwise express. The sequence is pedagogical rather than chronological — a
reader wants the content model before the build gates — so neither `created` nor the title sorts it
correctly.

It is unique **within a shelf** only. The two shelves number independently, so `order` never sorts
them together, and the index selects a shelf before it sorts.

## Why this kind carries dates when nothing else here does

Every other kind in this instance declined a lifecycle rather than backfill values it could not
recover: an upstream package's health, a paper's reading date, and a fixture's provenance are all
facts this Foundry would have had to invent. A design record is different because it is written
*here*. Its `created`, `revised`, and `revision` come from its own git history, so they can be
populated truthfully, and that — not symmetry with the other instances — is the test they pass.

`revised` before `created`, and a `revised` status on a `revision: 1` record, are both checked. Both
are frontmatter errors that read as true forever.

## Shape, and where the files sit

A **flat file**, like `package`, `paper`, `method`, and `replication_experiment`. A design record
has nothing to put beside it, so a directory per record would be a container with one file in it
forever.

The records live in `content/meta/`, which the pattern fixes, and route at `/design/`, which it does
not. This is the first collection in this instance whose key and base differ, and the difference is
load-bearing: `meta` is the kind's name and the directory the pattern shares across instances,
`design` is what a reader is looking for in the navigation. Route policy is instance-owned; the
directory is not.

## The glossary is not one of these

`content/meta/glossary.md` shares the directory and is deliberately **not** a note of this kind. It
is hand-curated, alphabetical, and rendered by its own page, so the collection excludes it by name
in the routing table rather than in any one consumer — the corpus walk has to honour the exclusion
too. Sharing a directory is a filing decision, not a typing one.

## Substrate, and what is not yet converged

This kind is **substrate**: all three Foundry instances declare it, because every instance
accumulates a design record and every one faces the same question of where it lives. `meta`,
`foundation`/`infrastructure`, and `order` are identical across the three, and the `meta` tag is
carried verbatim rather than coined here.

Two differences are real and not yet resolved. The Galaxy Workflow Foundry puts `status` in its
base envelope, so its `meta` kind declares only `title`, `record_kind`, and `order`; the Statistical
Genomics Foundry and this instance declare the whole lifecycle on the kind, because neither base
envelope has one. And this instance is the only one that checks the lifecycle's internal
consistency. A substrate kind whose required fields differ per instance is not quite one kind, so
these are convergence debts rather than local preferences — the direction being back-porting from
here.
