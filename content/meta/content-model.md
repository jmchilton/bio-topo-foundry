---
type: meta
title: Content Model
summary: How TDA knowledge is represented here as kinds, collections, frontmatter, tags, links, references, and companions.
record_kind: infrastructure
order: 2
status: revised
created: 2026-08-08
revised: 2026-08-08
revision: 5
tags:
  - meta
---

# Content Model

This record owns the representation of knowledge: what kinds of notes exist, what each is required
to carry, where they sit, and how they address each other. The code enforcing it belongs to
[[code-architecture]], the directories to [[repository-layout]], and the checks to
[[build-and-validation]]; what is described below is what the schemas, the collection table, and the
corpus tests currently require.

## Notes, kinds, and collections

Every note declares one literal `type`. That value selects one strict kind definition and is never
inferred from a path or a tag. `site/src/types/kinds.generated.json` is the exact current roster;
this record owns the relationships that make that roster meaningful rather than copying its list.

Most kinds describe the domain from one angle: a technique, an upstream implementation, a runnable
environment, a source, a Foundry-run study, or an in-repository build recipe. They remain distinct
because those subjects can truthfully support different metadata. A Mold is the action-oriented
kind: it says what to do and names typed references to the knowledge it needs. A `meta` record is the
opposite boundary, the one kind whose subject is the Foundry rather than the domain.

A **collection** is a location, not a kind: a base directory under `content/`, a pattern selecting
which files beneath it are notes, and the kind those notes are. The two are not one-to-one, and one
row already proves it — the `design` collection reads `content/meta/` and excludes `glossary.md` by
name. Each kind's locations are therefore derived from the collection table rather than declared
beside the kind.

Collection **order** in that table is content policy. The table is read in ascending wiki-link
precedence, so when two collections hold the same slug the later row takes the bare address. Five
slugs are shared between a package and the fixture built from it — `petls`, `petls-pytorch`,
`topometry`, `topodockq`, `hiponet` — and packages sort after environments because prose writing
`[[petls]]` almost always means the software. Design records sort first: a record about the
machinery never takes a bare slug from a note about the domain. Recipes sort next, for the same
reason one rung up — `petls`, `kmapper`, and `topometry` each name a package, a fixture, and a
build, and the build is the least likely of the three to be what prose means.

Every kind declares one of two shapes. A **flat** kind is one Markdown file. A **directory** kind is
a directory whose note is `index.md`, which lets the kind declare non-note companions beside it.
Each kind's schema, its `kind.md` rationale, and a minimal `example.md` sit together under
`site/src/types/<kind>/`; the generated manifest records the exact shape and locations of every kind
and is checked rather than hand-edited.

## Identity and addressing

A note's id is its collection-relative path with the extension removed, and for a directory kind
with the trailing `/index.md` removed as well. The collection key is also the route, so what a note
is addressed by and where it renders are one fact rather than two that can disagree.

Every note additionally carries the alias `<slug>-<kind>`, generated for all collections rather
than only the colliding ones. Which slugs collide is a fact about today's corpus: adding a `gudhi`
package would silently retarget `[[gudhi]]`, and the qualified address has to already exist for
that to be a non-event. Aliases never overwrite a primary address.

## Frontmatter envelope

Every kind is `.strict()`; an undeclared key is an error, and an undeclared key is also an
unvalidated one. YAML coerces silently — an unquoted date parses as a `Date` and a bare number as
an integer — so declaring a field is what puts a type on it.

The shared envelope is one field. Every note carries `tags` with at least one value registered in
`meta_tags.yml`; the schema asks the registry rather than matching a prefix. Everything else is
per-kind, and the omissions are deliberate: no kind carries dates or provenance this Foundry cannot
recover. `meta` is the single exception and states why in its own `kind.md` — a design record is
written in this repository, so its lifecycle comes from its own git history.

Beyond `tags`, the recurring requirements are a `title` (a `mold` carries `name` instead) and a
`summary` bounded at 20–160 characters, widened to 200 for `environment`. Kind-specific fields are
documented by each `kind.md` and enumerated by the generated manifest, not restated here.

Several constraints are cross-field rather than per-field, and are expressed as kind refinements:

- a `method` note must carry the `method/` tag it declares itself the anchor of;
- a `paper` may only claim the `verbatim-quotes-summary` posture when its source license resolves
  to a `verbatim-ok` policy row and the note carries the notice and license file that row obliges,
  so posture follows the license rather than the author;
- a `replication_experiment` must include a `replicate` stage, list its arc stages in order, and —
  once `status: complete` — name both the environment that re-ran it here and its outcome;
- a `meta` record cannot be revised before it was created, and cannot claim `status: revised` at
  `revision: 1`.

## Licensing as a typed field

`package` and `paper` both carry a license as a discriminated union on `status`: either `declared`
with a curated SPDX id or a `LicenseRef-<slug>`, or `missing`. An absent license is a fact worth
recording, so it is a declared value rather than an omitted field, and it resolves deny-by-default
through the shared policy table.

## Tags and facets

`meta_tags.yml` declares a closed vocabulary grouped into four facets. Three describe the subject
of a note — `method` (the technique), `application` (the bioinformatics problem), `modality` (the
input data object) — and the fourth, `meta`, marks a note as being about the Foundry itself. What a
note _is_ is carried by `type`, so no facet describes artifact type or maturation stage.

Membership is declared, never parsed from the `/` prefix; `meta` is a bare member and is the case
that proves it. Every value carries a one-line gloss and there is no free-form escape hatch. The
corpus tests assert the registry and the corpus agree in both directions: an unregistered tag fails,
and so does a registered tag no note carries, because that is a browse axis rendering an empty page.

The registry **format** is shared across Foundry instances; this **vocabulary** is ours, seeded
corpus-first. `meta` is the one term carried verbatim from the other two instances rather than
coined here.

## Links

Notes link with `[[Target]]`, resolved exactly after slug normalization with no prefix fallback — a
link either resolves or does not, and never lands on an arbitrary near-match. Grammar, slugging, and
the Markdown transform come from `@galaxy-foundry/wiki-links`; the link map over this corpus comes
from `@galaxy-foundry/content-reader` bound to the collection table above, so rendering and
validation read one map and cannot drift apart.

Body links are checked, not merely rendered: every `[[Target]]` written in a typed note is resolved
in the test suite, so a link naming nothing fails validation. A backticked token names the syntax
and creates no link, which means it is also invisible to the check — write `` `[[Target]]` `` only
when the literal token is the subject.

## Typed references

A `mold` may carry `references`, the manifest casting consumes. Each entry declares
a `kind`, a `ref`, and four behavior fields — `used_at`, `load`, `mode`, `evidence` — plus optional
`purpose`, `trigger`, and `verification`. Two of those are conditionally required: an `on-demand`
reference must state its trigger, and a `hypothesis`-grade reference must state how it would be
verified.

The behavior vocabularies are inherited from `@galaxy-foundry/reference-contract`. The reference
**kinds** are this instance's, declared in `reference_contract.yml`, which holds exactly one today:
`environment`. Cast modes are narrowed to `verbatim`, because a mode is a commitment to implemented
machinery rather than a label for intended behavior. Both narrowings are asserted against the
corpus: the contract declares exactly the kinds and modes the current Molds actually use.

A reference kind also declares whether its target is a wiki link or a path. The assembled schema
enforces that shape, and the corpus test resolves every Mold reference through the same alias-aware
content index used by rendering and casting. An unresolved typed reference therefore fails before
it can become plain text on the site or a missing source during casting.

## Companions

A directory-shaped kind declares which non-note siblings its directory may hold, once on the kind
rather than repeatedly on each note. Each declaration carries a requirement level and a
disposition: `foundry-only` never leaves, `cast-input` is read by a caster but does not appear in
output, `bundled` is copied in.

An `environment` declares `pixi.toml` as required and `pixi.lock` as recommended, both `bundled`. A
`mold` declares `eval.md` and `scenarios.md` as recommended and `foundry-only`. Companion presence
is **measured** from the directory at build time rather than asserted in frontmatter, which is why
`environment` has no `locked` field: a fixture cannot render a lockfile it does not have.

## Deliberate non-notes

`content/meta/glossary.md` is hand-curated, alphabetical, rendered by its own route, and excluded
from the `design` collection by name — in the routing table, so the corpus walk and the link map
honour the exclusion too. Sharing a directory is a filing decision, not a type declaration.

`content/environments/README.md` is the other, and is not excluded by name: it sits at the
collection base, where the `*/index.md` pattern cannot reach it.

Files outside `content/` are not notes and are not typed. One kind nonetheless has its subject
there: a `recipe` note is `content/recipes/<slug>.md`, and the build it describes stays at
`recipes/<slug>/`. The files cannot move, because a dozen fixture manifests reach them as
`../../../recipes/<slug>` path dependencies; and they cannot be companions, because a companion
describes a note's own directory and would report every recipe as missing. A round-trip corpus test
enforces the pairing instead — no recipe without a note, no note without a recipe — which is what
the companion declaration would have bought. The working drafts at the repository root have no such
note and are claimed by no kind at all. [[repository-layout]] owns what each of those locations
implies.

Update this record when a kind, collection row, frontmatter contract, tag rule, link rule, reference
relationship, or companion declaration changes.
