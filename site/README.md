# Foundry content site

This is a deliberately narrow content and validation slice. It renders the glossary, a tag browse
surface, and each Package note explicitly admitted by the collection table after migration to typed
frontmatter.

The Package contract is corpus-first:

- package identity is `title`, `repository`, and one or more implementation `languages`;
- software licensing distinguishes an upstream declaration from an explicitly missing license;
- every note carries at least one registered facet tag; and
- environment, recipe, method relationships, and dated upstream-health observations remain in the
  body until their own typed notes or evidence contracts exist.

The other package writeups are intentionally outside the Astro collection. Add a filename to the
collection pattern only in the same change that adds valid frontmatter to that note.

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

## Shared tag-browse boundary

`src/lib/tags.ts` decides which local notes appear on the tag surface and supplies their labels,
summaries, and routes. `@galaxy-foundry/tag-registry` groups those local usage counts by the facet
that declared each tag and supplies facet labels and tag glosses. The pages remain local; the facet
membership, order, empty-facet rule, and absence of an invented catch-all bucket do not.

Astro collection exports and schema assembly remain explicit here on purpose. Keeping the
collection entries spelled out preserves Astro's discriminated content types as more TDA kinds are
added. Package fields, registries, package facts, route policy, identity, theme, and prose styling
also remain local because they express this foundry's domain model and policy.
