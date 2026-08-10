---
description: Add a Paper note reviewing one external paper
argument-hint: <arXiv id, DOI, or URL>
---

Write one Paper note for: $ARGUMENTS

1. Read `site/src/types/paper/{kind.md,schema.ts}` and an existing note in `content/papers/`. The
   schema is `.strict()`; the frontmatter is the contract.
2. Read the actual paper, not its abstract. The note reviews it — what it establishes, what it only
   demonstrates, what it leaves open — and links to it rather than reproducing it.
3. Record the *article's* licence, separately from any software's, and get the CC variant exactly
   right — `-NC` and `-SA` are not `CC BY`. Undeclared is `missing`. `derived` follows the licence's
   policy row; it is not a choice.
4. Connect it: `[[wiki-links]]` bare in prose to the notes that cite or implement it, and tags that
   `meta_tags.yml` already declares. Adding a tag value is a separate deliberate change.
5. Gate: `pnpm audit:citations:refresh` (network) then `pnpm validate`, both from `site/`. Commit the
   refreshed evidence.
