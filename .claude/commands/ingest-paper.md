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
   policy row; it is not a choice. A `verbatim-ok` row *permits* `verbatim-quotes-summary` without
   requiring it — take it when quoting exactly is load-bearing, which usually means the note
   criticizes the source's own wording and a paraphrase would ask the reader to trust the
   paraphrase. Carrying obliges `attribution` and a `license_file` naming a copy in `LICENSES/`.
   Vendor that copy if it is absent, byte-for-byte from upstream; never edit one already there.
4. Connect it: `[[wiki-links]]` bare in prose to the notes that cite or implement it, and tags that
   `meta_tags.yml` already declares. Adding a tag value is a separate deliberate change.
5. Gate: `git add` the note first — the audited corpus is `trackedOnly`, so an untracked file is
   skipped silently and the run reports clean. Then `pnpm audit:citations:refresh` (network) and
   `pnpm validate`, both from `site/`. Commit the refreshed evidence.
