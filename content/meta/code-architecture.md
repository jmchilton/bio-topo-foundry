---
type: meta
title: Code Architecture
summary: The Astro and TypeScript implementation as it stands — components, dependency seams, entry points, and deliberate absences.
record_kind: infrastructure
order: 1
status: revised
created: 2026-08-08
revised: 2026-08-17
revision: 7
tags:
  - meta
---

# Code Architecture

This record answers what implementation exists today, what each part owns, and which direction its
dependencies flow. Note semantics belong to [[content-model]], physical placement to
[[repository-layout]], and what runs to [[build-and-validation]].

## Current stack

<figure class="architecture-map">
  <div
    class="architecture-scroll"
    tabindex="0"
    role="region"
    aria-label="Scrollable code architecture dependency map"
  >
    <svg
      class="architecture-diagram"
      viewBox="0 0 1040 700"
      role="img"
      aria-labelledby="architecture-title architecture-description"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="architecture-title">Bio Topo Foundry code architecture</title>
      <desc id="architecture-description">
        The Astro reader, casting commands, and build-time verification paths all use instance
        composition, which depends on local kind definitions, local vocabularies, and shared
        foundry-lib packages. Every box is a link to the relevant source or documentation.
      </desc>
      <defs>
        <pattern id="architecture-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" class="architecture-grid-line" />
        </pattern>
        <marker
          id="architecture-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" class="architecture-arrow-head" />
        </marker>
        <marker
          id="architecture-arrow-audit"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" class="architecture-arrow-head-audit" />
        </marker>
      </defs>
      <rect width="1040" height="700" rx="28" class="architecture-canvas" />
      <rect width="1040" height="700" rx="28" fill="url(#architecture-grid)" />
      <text x="60" y="38" class="architecture-tier-label">CONSUMERS</text>
      <a
        href="https://github.com/jmchilton/bio-topo-foundry/tree/main/site/src"
        aria-label="Browse the Astro reader source on GitHub"
      >
        <g class="architecture-card architecture-card-reader">
          <rect x="60" y="58" width="430" height="126" rx="18" class="architecture-node" />
          <circle cx="92" cy="90" r="8" class="architecture-status-dot" />
          <text x="112" y="96" class="architecture-node-label">RUNTIME READER</text>
          <text x="88" y="132" class="architecture-node-title">Astro application</text>
          <text x="88" y="158" class="architecture-node-detail">pages · layouts · domain components</text>
          <text x="456" y="151" class="architecture-link-glyph" aria-hidden="true">↗</text>
        </g>
      </a>
      <a
        href="https://github.com/jmchilton/bio-topo-foundry/tree/main/site/tests"
        aria-label="Browse the build-time verification source on GitHub"
      >
        <g class="architecture-card architecture-card-audit">
          <rect x="550" y="58" width="430" height="126" rx="18" class="architecture-node" />
          <circle cx="582" cy="90" r="8" class="architecture-status-dot" />
          <text x="602" y="96" class="architecture-node-label">BUILD-TIME PRODUCTION + VERIFICATION</text>
          <text x="578" y="132" class="architecture-node-title">Artifacts and checks</text>
          <text x="578" y="158" class="architecture-node-detail">casts · tests · manifests · citation audit</text>
          <text x="946" y="151" class="architecture-link-glyph" aria-hidden="true">↗</text>
        </g>
      </a>
      <path
        d="M 275 184 V 236 H 520 V 272"
        class="architecture-connector"
        marker-end="url(#architecture-arrow)"
      />
      <path
        d="M 765 184 V 236 H 520 V 272"
        class="architecture-connector architecture-connector-audit"
        marker-end="url(#architecture-arrow-audit)"
      />
      <g class="architecture-composition">
        <rect x="60" y="272" width="920" height="204" rx="24" class="architecture-composition-shell" />
        <text x="88" y="307" class="architecture-tier-label">INSTANCE COMPOSITION</text>
        <text x="950" y="307" text-anchor="end" class="architecture-owner-label">owned here</text>
        <a
          href="https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/frontmatter-schema.ts"
          aria-label="Open the frontmatter schema composition source on GitHub"
        >
          <g class="architecture-card">
            <rect x="88" y="330" width="270" height="116" rx="16" class="architecture-node" />
            <text x="112" y="362" class="architecture-node-label">01 · CONTRACTS</text>
            <text x="112" y="396" class="architecture-node-title architecture-node-title-small">Schema + collections</text>
            <text x="112" y="423" class="architecture-node-detail">frontmatter-schema.ts</text>
            <text x="328" y="421" class="architecture-link-glyph" aria-hidden="true">↗</text>
          </g>
        </a>
        <a
          href="https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/registries.ts"
          aria-label="Open the instance registry source on GitHub"
        >
          <g class="architecture-card">
            <rect x="385" y="330" width="270" height="116" rx="16" class="architecture-node" />
            <text x="409" y="362" class="architecture-node-label">02 · INSTANCE DATA</text>
            <text x="409" y="396" class="architecture-node-title architecture-node-title-small">Registries</text>
            <text x="409" y="423" class="architecture-node-detail">vocabulary + policy adapters</text>
            <text x="625" y="421" class="architecture-link-glyph" aria-hidden="true">↗</text>
          </g>
        </a>
        <a
          href="https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/content-reader.ts"
          aria-label="Open the content-reader adapter source on GitHub"
        >
          <g class="architecture-card">
            <rect x="682" y="330" width="270" height="116" rx="16" class="architecture-node" />
            <text x="706" y="362" class="architecture-node-label">03 · ADAPTERS</text>
            <text x="706" y="396" class="architecture-node-title architecture-node-title-small">Reader + caster</text>
            <text x="706" y="423" class="architecture-node-detail">links · routes · cast binding</text>
            <text x="922" y="421" class="architecture-link-glyph" aria-hidden="true">↗</text>
          </g>
        </a>
      </g>
      <path d="M 520 476 V 512 H 207 V 550" class="architecture-connector" marker-end="url(#architecture-arrow)" />
      <path d="M 520 476 V 550" class="architecture-connector" marker-end="url(#architecture-arrow)" />
      <path d="M 520 512 H 833 V 550" class="architecture-connector" marker-end="url(#architecture-arrow)" />
      <text x="60" y="536" class="architecture-tier-label">DEPENDENCIES</text>
      <a
        href="https://github.com/jmchilton/bio-topo-foundry/tree/main/site/src/types"
        aria-label="Browse the local kind definitions on GitHub"
      >
        <g class="architecture-card architecture-card-dependency">
          <rect x="60" y="550" width="294" height="112" rx="18" class="architecture-node" />
          <text x="86" y="583" class="architecture-node-label">LOCAL CONTRACTS</text>
          <text x="86" y="618" class="architecture-node-title architecture-node-title-small">Kind definitions</text>
          <text x="86" y="644" class="architecture-node-detail">site/src/types/</text>
          <text x="324" y="639" class="architecture-link-glyph" aria-hidden="true">↗</text>
        </g>
      </a>
      <a
        href="https://github.com/jmchilton/bio-topo-foundry/tree/main"
        aria-label="Browse the local Foundry vocabularies on GitHub"
      >
        <g class="architecture-card architecture-card-dependency">
          <rect x="373" y="550" width="294" height="112" rx="18" class="architecture-node" />
          <text x="399" y="583" class="architecture-node-label">LOCAL VOCABULARIES</text>
          <text x="399" y="618" class="architecture-node-title architecture-node-title-small">Instance policy</text>
          <text x="399" y="644" class="architecture-node-detail">tags · references</text>
          <text x="637" y="639" class="architecture-link-glyph" aria-hidden="true">↗</text>
        </g>
      </a>
      <a
        href="https://github.com/jmchilton/foundry-lib/blob/main/docs/concepts/shared-substrate.md"
        aria-label="Read the foundry-lib shared substrate documentation on GitHub"
      >
        <g class="architecture-card architecture-card-substrate">
          <rect x="686" y="550" width="294" height="112" rx="18" class="architecture-node" />
          <text x="712" y="583" class="architecture-node-label">SHARED SUBSTRATE</text>
          <text x="712" y="618" class="architecture-node-title architecture-node-title-small">@galaxy-foundry/*</text>
          <text x="712" y="644" class="architecture-node-detail">explicit inputs · no path discovery</text>
          <text x="950" y="639" class="architecture-link-glyph" aria-hidden="true">↗</text>
        </g>
      </a>
    </svg>
  </div>
  <figcaption>
    Solid lines follow runtime dependencies; the dashed line is the verification path. Arrows point
    toward the code or contract depended upon, and every box opens its source or design note.
  </figcaption>
</figure>

Dependencies run one way. Shared packages take explicit inputs; they never discover this
repository's paths, vocabulary, or acceptance rules. The instance never reimplements a mechanism a
package owns.

There is one application, `site/`, and no local package workspace or standalone build CLI. The
casting commands also live under `site/` because they consume the same TypeScript kinds and content
binding; their generated artifacts live at the repository root under `casts/`.

## Kind definitions

[`site/src/types/`](https://github.com/jmchilton/bio-topo-foundry/tree/main/site/src/types) owns the
note kinds. Each kind is a directory holding three files: `schema.ts` (the strict Zod contract,
shape, and companion declarations), `kind.md` (why each required field is required), and
`example.md` (a minimal note parsed against its own schema by the tests, so the documentation stays
executable).

`types/context.ts` builds the `KindContext` a kind receives: the base envelope, the license-id
primitive, the typed-reference entry, and — for the kinds that need to interrogate rather than
merely validate — the tag registry and license policy themselves. Method and Application notes
have to ask which facet declared a proposed anchor; a Paper note has to ask what a license row
permits. `types/index.ts` is the single enumeration of concrete kinds, exported both as a keyed
`DEFINITIONS` map and an ordered `KINDS` array.

[`@galaxy-foundry/kind-schema`](https://github.com/jmchilton/foundry-lib/tree/main/packages/kind-schema)
supplies the definition, assembly, and companion mechanics. It ships no domain kinds. The
directory-per-kind layout is a cross-instance contract implemented independently in all three
Foundries, not a local preference. The library's
[package-boundary rationale](https://github.com/jmchilton/foundry-lib/blob/main/docs/architecture/package-boundaries.md)
explains why the reusable mechanism stops short of owning those kinds.

The Paper kind is the one exception to a kind being wholly local, and it is a deliberate one. Its
source-facing frontmatter — bibliographic identity, license posture, and read coverage — is the
shared contract from
[`@galaxy-foundry/source-note`](https://github.com/jmchilton/foundry-lib/tree/main/packages/source-note),
spread into the kind and refined by that package's coherence rules. Describing someone else's work
is the same problem in every Foundry; what stays local is which kinds are source notes, and
everything that describes the note rather than its source.

## Contract composition

[`site/src/lib/frontmatter-schema.ts`](https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/frontmatter-schema.ts)
is the composition point. It assembles each kind against the live registries, exposes them as
`NOTE_KINDS`, states the content root once as `CONTENT_DIR` with a `contentPath` helper, and declares
`COLLECTIONS` — the one mapping from content location to kind, glob, and schema.

`COLLECTIONS` is also the route table and the wiki-link precedence order, and both facts are
content decisions rather than formatting ones; [[content-model]] owns why the rows sit in the order
they do. No page, test, or resolver may carry a second collection list.

`site/src/content.config.ts` is a thin Astro adapter over that table. Its collections are spelled
out one at a time rather than mapped, because a `.map` collapses every row to the widest common
type and Astro stops discriminating the frontmatter shapes.

## Registries and shared substrate

[`site/src/lib/registries.ts`](https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/registries.ts)
joins the instance-owned halves of the shared contracts into the one object every kind context is
built from:

- `meta-tags.ts` loads `meta_tags.yml` through
  [`@galaxy-foundry/tag-registry`](https://github.com/jmchilton/foundry-lib/tree/main/packages/tag-registry);
- `reference-contract.ts` loads both the reference vocabulary and its cast declarations through
  [`@galaxy-foundry/cast`](https://github.com/jmchilton/foundry-lib/tree/main/packages/cast), which
  composes the shared
  [`@galaxy-foundry/reference-contract`](https://github.com/jmchilton/foundry-lib/tree/main/packages/reference-contract)
  terms and narrows cast modes to this instance's supported set;
- [`@galaxy-foundry/license-policy`](https://github.com/jmchilton/foundry-lib/tree/main/packages/license-policy)
  supplies the redistribution table as bundled data, with no local file to keep in step.

Both loaders resolve their file relative to the site working directory and cache it. The adapters
supply paths and concrete vocabularies; they do not re-export or reimplement a package API.

## Content and link access

[`site/src/lib/content-reader.ts`](https://github.com/jmchilton/bio-topo-foundry/blob/main/site/src/lib/content-reader.ts)
binds
[`@galaxy-foundry/content-reader`](https://github.com/jmchilton/foundry-lib/tree/main/packages/content-reader)
to the collection table, a route mapping, and this corpus's alias rule. Its exported factory accepts
a content-path resolver: Astro supplies its content-relative frame, while casting supplies a
repository-root frame. Both therefore get filesystem enumeration, note ids, frontmatter, aliases,
and link targets from the same reader rather than maintaining parallel corpus walks. Its
[boundary design](https://github.com/jmchilton/foundry-lib/blob/main/docs/architecture/content-reader-boundary.md)
shows why Astro types stay on the application side of that seam.

`remark-wiki-links.ts` adapts that resolver with
[`@galaxy-foundry/wiki-links`](https://github.com/jmchilton/foundry-lib/tree/main/packages/wiki-links)
for `astro.config.mjs`. This is the one module reachable from the Astro config, and the constraint
it carries is easy to trip: config loads outside Astro's module graph, so nothing reachable from it
may import `astro:content`. Here the content reader is filesystem-based and imports no Astro
runtime, which is what keeps the constraint satisfied without a second module split.

`render-vault-doc.ts` is the corresponding path for a loose document — currently only the glossary.
It resolves links through the same reader, renders with `marked`, and adds the bold-term anchors the
glossary's own page links into.

`companions.ts` measures a directory-shaped note's siblings against its kind's declarations rather
than trusting frontmatter, which is why `environment` has no `locked` field.

## Presentation registries

`tags.ts`, `design-records.ts`, and `detail-routes.ts` are presentation registries over already
validated content: they decide which notes appear on a surface and what to label them. `tags.ts`
also projects an optional `facet_tag` into the guide that leads a tag page; the page takes its guide
label from the declaring kind, so Method and Application anchors share one mechanism. They do not
define note membership, and each is held to the collection table by a test — `DETAIL_ROUTES` in
both directions, the tag surface by the registry-drift check.

`motifs.ts` is domain furniture with no content dependency at all: a stable hash from a note's
metadata to repeatable point-cloud and barcode geometry, so a note's marginalia is derived rather
than authored and never changes between builds.

## Reading application

`site/src/pages/` owns routes. Every collection detail page runs through one route,
`[collection]/[...slug].astro`, with collection-specific metadata in explicit branches; the common
frame, breadcrumb, and tag links live once. Per-collection index pages, the glossary, the tag
surface, the design index, and the home page are the remaining routes.

The reading shell — document skeleton, header, navigation, theme toggle, search, footer — is not
here. It comes from
[`@galaxy-foundry/site-kit`](https://github.com/jmchilton/foundry-lib/tree/main/packages/site-kit),
and `site/src/layouts/Base.astro` is only the composition point: it hands the package a
`SiteIdentity` and the base URL and receives the markup. The
[site-kit runtime note](https://github.com/jmchilton/foundry-lib/blob/main/docs/architecture/site-kit-runtime.md)
documents the server-rendered shell and its small progressive-enhancement boundary.
What stays local is that identity, the palette and type system in `src/styles/global.css` (custom
properties the kit names but does not ship), and the domain components in `src/components/`. That
stylesheet also has to point Tailwind at the package, because source detection does not look inside
`node_modules`, and the built-output test is what checks it did.

Shipping no stylesheet has two further consequences, and both fail without an error. Element
defaults here belong in `@layer base`, because unlayered CSS outranks every layer whatever its
specificity: a bare `a { color }` outside one repaints the header and footer the kit colours with
utilities, and the style-contract check still passes, since the utility is emitted and merely
outranked. The shell's behaviour at narrow widths is local for the same reason — `navVisible` is one
number measured against a wide bar, and no count fits a phone, so the wrapping rule is this
stylesheet's to write. Built-output tests hold both.

`site/src/pages/gallery/` is the visual acceptance surface for that boundary. It imports every case
from `@galaxy-foundry/site-kit/specimens` and renders the shared components through this instance's
theme; package-declared `isolated` and `document` surfaces receive generated standalone routes.
Local specimen groups place the filtration hero, persistence divider, point-cloud fingerprint,
topology breadcrumb, and every declared reference kind beside the shared cases without moving
their domain vocabulary into the package. Built-output tests require complete shared and local
coverage, every standalone route, the gallery's design-index link, and the intended search policy.

`src/pages/usage/` is the publication surface for committed casts. `lib/casts.ts` discovers targets
from their `_target.yml` declarations, resolves bundle placement through `@galaxy-foundry/cast`,
and exposes the same inventory to the usage index, per-skill static routes, and the source Mold's
cast panel. `lib/repo-root.ts` anchors that filesystem read on Astro's configured project root, so
prerender bundling cannot silently turn a populated cast tree into an empty page.

The Astro application is a pure reader. It validates and renders source but does not mutate notes
or cast artifacts. The only client-side code is progressive enhancement — the homepage filtration
control — and there is no UI framework. Mutation is confined to explicit build-time commands.

## Generation, citation audit, and casting

`site/scripts/generate-kind-manifest.ts` derives `src/types/kinds.generated.json` from the live kind
definitions, their `kind.md` and `example.md`, and the collection table, through
[`@galaxy-foundry/kind-manifest`](https://github.com/jmchilton/foundry-lib/tree/main/packages/kind-manifest).
It imports the same contracts validation does rather than building a parallel model, and it has a
`--check` mode. [[build-and-validation]] owns when it runs; the library's
[manifest-provenance note](https://github.com/jmchilton/foundry-lib/blob/main/docs/architecture/manifest-provenance.md)
describes the trust boundary.

The citation audit is a second build-time path, not part of the reader stack above.
[`@galaxy-foundry/audit-citations`](https://github.com/jmchilton/foundry-lib/tree/main/packages/audit-citations)
owns extraction, provider normalization, comparison, adjudication, and report rendering.
`audit-citations.config.json` supplies this instance's corpus and provider policy;
`site/src/lib/citation-audit.ts` binds the package to committed evidence and exposes the offline
replay used by `site/tests/citation-audit.test.ts`. Live provider access stays in the scheduled
workflow. [[repository-layout]] owns the committed files and [[build-and-validation]] the commands
and gates. See the shared
[citation-audit architecture](https://github.com/jmchilton/foundry-lib/blob/main/docs/architecture/audit-citations.md)
for the separation between evidence acquisition, replay, and adjudication.

The tool-alignment audit is a second checker on that same path, and it is local. Its evidence is
already in the repository — each fixture's prose is checked against the `pixi.toml` and `pixi.lock`
committed beside it — so there is no provider layer, no refresh, and nothing to acquire.
`site/src/lib/audit/tool-alignment/` holds the parts that know about pixi: manifest and lock
parsing, the claim grammar, comparison, and report rendering. `site/src/lib/audit/base/` holds the
parts that know about neither pixi nor citations — span digests, corpus identity, evidence states,
severities, and the digest-bound adjudication shape.

Two artifacts feed that grammar: the Environment note, and the manifest's own header comment. They
differ only in how a file becomes prose, so `extract.ts` exposes an entry point per artifact over
one shared scan rather than a grammar per file — two grammars would drift apart exactly as the two
files do. The artifact a claim came from travels with it in `span.artifactKind`, which is also the
first exercise that field has had: a discriminator with one value is a field nothing has tested.

That split is the point of the directory boundary rather than a tidiness preference. `base/digest.ts`
and `base/files.ts` are byte-identical to their counterparts inside `@galaxy-foundry/audit-citations`,
and `base/claims.ts` is the vocabulary a second checker forced into the open. foundry-lib's
shared-substrate test admits an extraction once a second consumer exists, which is what this is.

How much of that extraction is a move and how much is a rewrite is not settled, and the boundary is
laid out to make the question answerable rather than to presume the answer. The two copied files
move as they are. `base/claims.ts` converged on shapes but was typed independently, and the
lifecycle rules around it — what a reviewed decision may do to a verdict, which decisions must fail
rather than retire — are newer than either checker. `audit/tool-alignment-README.md` keeps the
comparison and the open questions; it is the exhibit an extraction would argue from.

Casting is the other build-time path. `cast-corpus.ts` projects the shared content index into the
two maps the cast engine consumes. `cast-spec.ts` composes that corpus with the Kind definitions,
reference contract, target-independent hooks, and supported modes. The local scripts are thin
terminal adapters over `@galaxy-foundry/cast`: one casts a named Mold, and one checks or rewrites
the committed set. The target file under `casts/claude/` owns bundle placement and runtime-path
constraints; the Environment Kind owns which companions are bundled. TDA code contributes the
domain prose around those shared mechanics, not a second caster.

Publication adds no second cast. The `claude` target is a portable Agent Skills tree, with one thin
plugin manifest for Claude Code and one for Codex inside the target directory, plus each runtime's
repository marketplace manifest at the repository root. Both runtime adapters point at
`casts/claude/skills/`; `tests/cast-publishing.test.ts` checks their identity, placement, and
portable `name`/`description` frontmatter.

## Deliberate absences

- **No package workspace.** One application, so contracts live beside it. Extracting them becomes
  worthwhile when a second consumer needs them without depending on the Astro project.
- **No server or database.** The output is a static site with a static search index.

A record must not describe machinery as running before it runs. A reader who finds a present-tense
sentence about a command and then cannot find the command has no way to tell whether the record is
aspirational or the checkout is broken.

## Code orientation

| Concern                                | Primary location                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| note kinds, context, enumeration       | `site/src/types/`                                                               |
| schema and collection composition      | `site/src/lib/frontmatter-schema.ts`                                            |
| Astro collection wiring                | `site/src/content.config.ts`                                                    |
| instance registries                    | `site/src/lib/registries.ts` and its loaders                                    |
| file discovery, ids, link map          | `site/src/lib/content-reader.ts`                                                |
| Markdown link adapters                 | `site/src/lib/remark-wiki-links.ts`, `render-vault-doc.ts`                      |
| companion measurement                  | `site/src/lib/companions.ts`                                                    |
| presentation registries                | `site/src/lib/tags.ts`, `design-records.ts`, `detail-routes.ts`                 |
| shell composition and identity         | `site/src/layouts/Base.astro`, `site/src/lib/site-identity.ts`                  |
| shared and local visual acceptance     | `site/src/pages/gallery/`, `site/src/lib/gallery.ts`                            |
| domain furniture                       | `site/src/components/`, `site/src/lib/motifs.ts`                                |
| routes                                 | `site/src/pages/`                                                               |
| committed-cast discovery and usage UI  | `site/src/lib/casts.ts`, `site/src/pages/usage/`, `site/src/components/CastArtifacts.astro` |
| corpus and contract tests              | `site/tests/`                                                                   |
| kind-manifest generator                | `site/scripts/`                                                                 |
| cast composition and commands          | `site/src/lib/cast-*.ts`, `site/scripts/cast.ts`, `site/scripts/check-casts.ts` |
| cast target and committed bundles      | `casts/`                                                                        |
| runtime plugin and marketplace adapters | `casts/claude/.{claude,codex}-plugin/`, `.claude-plugin/`, `.agents/plugins/`   |
| citation-audit binding and test        | `site/src/lib/citation-audit.ts`, `site/tests/citation-audit.test.ts`           |
| citation policy and committed evidence | `audit-citations.config.json`, `audit/`                                         |
| checker vocabulary shared by both      | `site/src/lib/audit/base/`                                                      |
| pixi claim grammar and comparison      | `site/src/lib/audit/tool-alignment/`                                            |
| tool-alignment binding and test        | `site/src/lib/tool-alignment-audit.ts`, `site/tests/tool-alignment.test.ts`     |

Update this record when a component, dependency seam, entry point, or deliberate absence changes.
