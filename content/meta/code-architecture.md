---
type: meta
title: Code Architecture
summary: The Astro and TypeScript implementation as it stands — components, dependency seams, entry points, and deliberate absences.
record_kind: infrastructure
order: 1
status: revised
created: 2026-08-08
revised: 2026-08-08
revision: 3
tags:
  - meta
---

# Code Architecture

This record answers what implementation exists today, what each part owns, and which direction its
dependencies flow. Note semantics belong to [[content-model]], physical placement to
[[repository-layout]], and what runs to [[build-and-validation]].

## Current stack

```text
Astro pages, layouts, and domain components
                    │
                    ▼
    instance registries and render adapters
                    │
                    ▼
        frontmatter-schema composition
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
kind definitions  instance      installed
and context       vocabularies  @galaxy-foundry/*
```

Dependencies run one way. Shared packages take explicit inputs; they never discover this
repository's paths, vocabulary, or acceptance rules. The instance never reimplements a mechanism a
package owns.

There is one application, `site/`. There is no package workspace, no build CLI, no caster, and no
cast tree. Those are absences, not implied layers.

## Kind definitions

`site/src/types/` owns the note kinds. Each kind is a directory holding three files: `schema.ts`
(the strict Zod contract, shape, and companion declarations), `kind.md` (why each required field is
required), and `example.md` (a minimal note parsed against its own schema by the tests, so the
documentation stays executable).

`types/context.ts` builds the `KindContext` a kind receives: the base envelope, the license-id
primitive, the typed-reference entry, and — for the two kinds that need to interrogate rather than
merely validate — the tag registry and license policy themselves. A Method note has to ask which
facet declared a tag; a Paper note has to ask what a license row permits. `types/index.ts` is the
single enumeration of concrete kinds, exported both as a keyed `DEFINITIONS` map and an ordered
`KINDS` array.

`@galaxy-foundry/kind-schema` supplies the definition, assembly, and companion mechanics. It ships
no domain kinds. The directory-per-kind layout is a cross-instance contract implemented
independently in all three Foundries, not a local preference.

## Contract composition

`site/src/lib/frontmatter-schema.ts` is the composition point. It assembles each kind against the
live registries, exposes them as `NOTE_KINDS`, states the content root once as `CONTENT_DIR` with a
`contentPath` helper, and declares `COLLECTIONS` — the one mapping from content location to kind,
glob, and schema.

`COLLECTIONS` is also the route table and the wiki-link precedence order, and both facts are
content decisions rather than formatting ones; [[content-model]] owns why the rows sit in the order
they do. No page, test, or resolver may carry a second collection list.

`site/src/content.config.ts` is a thin Astro adapter over that table. Its collections are spelled
out one at a time rather than mapped, because a `.map` collapses every row to the widest common
type and Astro stops discriminating the frontmatter shapes.

## Registries and shared substrate

`site/src/lib/registries.ts` joins the instance-owned halves of the shared contracts into the one
object every kind context is built from:

- `meta-tags.ts` loads `meta_tags.yml` through `@galaxy-foundry/tag-registry`;
- `reference-contract.ts` loads `reference_contract.yml` through
  `@galaxy-foundry/reference-contract` and narrows cast modes to this instance's supported set;
- `@galaxy-foundry/license-policy` supplies the redistribution table as bundled data, with no local
  file to keep in step.

Both loaders resolve their file relative to the site working directory and cache it. The adapters
supply paths and concrete vocabularies; they do not re-export or reimplement a package API.

## Content and link access

`site/src/lib/content-reader.ts` binds `@galaxy-foundry/content-reader` to the collection table, the
content path, a route mapping, and this corpus's alias rule. The package then owns filesystem
enumeration, note ids, link-map construction, remark traversal, and raw-Markdown resolution — so
rendering and validation read one map and cannot drift apart.

`remark-wiki-links.ts` adapts that resolver for `astro.config.mjs`. This is the one module reachable
from the Astro config, and the constraint it carries is easy to trip: config loads outside Astro's
module graph, so nothing reachable from it may import `astro:content`. Here the content reader is
filesystem-based and imports no Astro runtime, which is what keeps the constraint satisfied without
a second module split.

`render-vault-doc.ts` is the corresponding path for a loose document — currently only the glossary.
It resolves links through the same reader, renders with `marked`, and adds the bold-term anchors the
glossary's own page links into.

`companions.ts` measures a directory-shaped note's siblings against its kind's declarations rather
than trusting frontmatter, which is why `environment` has no `locked` field.

## Presentation registries

`tags.ts`, `design-records.ts`, and `detail-routes.ts` are presentation registries over already
validated content: they decide which notes appear on a surface and what to label them. They do not
define note membership, and each is held to the collection table by a test — `DETAIL_ROUTES` in both
directions, the tag surface by the registry-drift check.

`motifs.ts` is domain furniture with no content dependency at all: a stable hash from a note's
metadata to repeatable point-cloud and barcode geometry, so a note's marginalia is derived rather
than authored and never changes between builds.

## Reading application

`site/src/pages/` owns routes. Every collection detail page runs through one route,
`[collection]/[...slug].astro`, with collection-specific metadata in explicit branches; the common
frame, breadcrumb, and tag links live once. Per-collection index pages, the glossary, the tag
surface, the design index, and the home page are the remaining routes.

The reading shell — document skeleton, header, navigation, theme toggle, search, footer — is not
here. It comes from `@galaxy-foundry/site-kit`, and `site/src/layouts/Base.astro` is only the
composition point: it hands the package a `SiteIdentity` and the base URL and receives the markup.
What stays local is that identity, the palette and type system in `src/styles/global.css` (custom
properties the kit names but does not ship), and the domain components in `src/components/`. That
stylesheet also has to point Tailwind at the package, because source detection does not look inside
`node_modules`, and the built-output test is what checks it did.

`site/src/pages/gallery/` is the visual acceptance surface for that boundary. It imports every case
from `@galaxy-foundry/site-kit/specimens` and renders the shared components through this instance's
theme; package-declared `isolated` and `document` surfaces receive generated standalone routes.
Local specimen groups place the filtration hero, persistence divider, point-cloud fingerprint,
topology breadcrumb, and every declared reference kind beside the shared cases without moving
their domain vocabulary into the package. Built-output tests require complete shared and local
coverage, every standalone route, the gallery's design-index link, and the intended search policy.

The site is a pure reader. It validates and renders source; it does not mutate content, author
notes, or cast artifacts. The only client-side code is progressive enhancement — the homepage
filtration control — and there is no UI framework.

## Generation and citation audit

`site/scripts/generate-kind-manifest.ts` derives `src/types/kinds.generated.json` from the live kind
definitions, their `kind.md` and `example.md`, and the collection table, through
`@galaxy-foundry/kind-manifest`. It imports the same contracts validation does rather than building
a parallel model, and it has a `--check` mode. [[build-and-validation]] owns when it runs.

The citation audit is a second build-time path, not part of the reader stack above.
`@galaxy-foundry/audit-citations` owns extraction, provider normalization, comparison,
adjudication, and report rendering. `audit-citations.config.json` supplies this instance's corpus
and provider policy; `site/src/lib/citation-audit.ts` binds the package to committed evidence and
exposes the offline replay used by `site/tests/citation-audit.test.ts`. Live provider access stays in
the scheduled workflow. [[repository-layout]] owns the committed files and
[[build-and-validation]] the commands and gates.

## Deliberate absences

- **No caster.** `@galaxy-foundry/cast` is not installed, there is no `casts/` tree, and no command
  turns a Mold into an artifact. Cast modes are narrowed to what this instance can honor.
- **No package workspace.** One application, so contracts live beside it. Extracting them becomes
  worthwhile when a second consumer needs them without depending on the Astro project.
- **No server or database.** The output is a static site with a static search index.

A record must not describe machinery as running before it runs. A reader who finds a present-tense
sentence about a command and then cannot find the command has no way to tell whether the record is
aspirational or the checkout is broken.

## Code orientation

| Concern | Primary location |
|---|---|
| note kinds, context, enumeration | `site/src/types/` |
| schema and collection composition | `site/src/lib/frontmatter-schema.ts` |
| Astro collection wiring | `site/src/content.config.ts` |
| instance registries | `site/src/lib/registries.ts` and its loaders |
| file discovery, ids, link map | `site/src/lib/content-reader.ts` |
| Markdown link adapters | `site/src/lib/remark-wiki-links.ts`, `render-vault-doc.ts` |
| companion measurement | `site/src/lib/companions.ts` |
| presentation registries | `site/src/lib/tags.ts`, `design-records.ts`, `detail-routes.ts` |
| shell composition and identity | `site/src/layouts/Base.astro`, `site/src/lib/site-identity.ts` |
| shared and local visual acceptance | `site/src/pages/gallery/`, `site/src/lib/gallery.ts` |
| domain furniture | `site/src/components/`, `site/src/lib/motifs.ts` |
| routes | `site/src/pages/` |
| corpus and contract tests | `site/tests/` |
| kind-manifest generator | `site/scripts/` |
| citation-audit binding and test | `site/src/lib/citation-audit.ts`, `site/tests/citation-audit.test.ts` |
| citation policy and committed evidence | `audit-citations.config.json`, `audit/` |

Update this record when a component, dependency seam, entry point, or deliberate absence changes.
