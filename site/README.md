# Foundry content site

This is the typed reader and validation surface for the Foundry's current corpus. It renders the
glossary, controlled tag browsing, and the Package, Paper, and Environment collections.

The three current kinds keep distinct subjects:

- a Package profiles upstream software and records its implementation and software-license facts;
- a Paper reviews an external scholarly source and records its source-license and summary posture;
- an Environment describes one runnable biopixi fixture, with manifest and lockfile state measured
  from its declared companions; and
- every note carries at least one registered facet tag.

## Checks

From this directory:

```sh
pnpm validate
```

The schema is assembled once with `@galaxy-foundry/kind-schema` and consumed by both Astro and the
standalone corpus test. The shell, content frame, tag chips, license badge, tag-registry parser,
license-policy table, collection-backed content reader, and wiki-link grammar come from their focused
`@galaxy-foundry/*` packages.

`pnpm kinds` writes `src/types/kinds.generated.json` from the live kind definitions, collection
table, `kind.md`, and `example.md`. The manifest is committed for cross-instance consumers;
`pnpm check:kinds` and `pnpm validate` fail when it is stale.

## Shared content-reader boundary

`src/lib/content-reader.ts` is a thin instance binding. It gives
`@galaxy-foundry/content-reader` this foundry's collection table, content path, and route mapping.
The package then owns filesystem enumeration,
note IDs, link-map construction, remark links, and raw-Markdown link resolution. Shared
`ContentNote` and `TagChips` components own the invariant reading frame and tag markup.

All collection detail pages run through `src/pages/[collection]/[...slug].astro`. The common frame,
tag links, and navigation live once; collection-specific metadata stays in explicit branches.

## Shared tag-browse boundary

`src/lib/tags.ts` decides which local notes appear on the tag surface and supplies their labels,
summaries, and routes. `@galaxy-foundry/tag-registry` groups those local usage counts by the facet
that declared each tag and supplies facet labels and tag glosses. The pages remain local; the facet
membership, order, empty-facet rule, and absence of an invented catch-all bucket do not.

Astro collection exports and schema assembly remain explicit here on purpose. Keeping the
collection entries spelled out preserves Astro's discriminated content types as more TDA kinds are
added. Kind fields, registries, metadata furniture, route policy, identity, theme, and prose styling
remain local because they express this foundry's domain model and policy.
