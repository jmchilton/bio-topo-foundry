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

Then assess what the paper would take downstream, and report it *beside* the note — a note may not
describe machinery that does not exist. A reasoned no is the common answer and a useful one.

- **Replication.** Which named claims, tables, or figures it would target; whether code, data,
  weights, splits, and seeds are actually obtainable; whether a matched non-topological baseline
  exists. Read `content/meta/replication-experiments.md` — the study lives in its own upstream
  repository and cannot be complete without an Environment that reran it. Say what the arms would
  be, or say why there are none.
- **Packaging.** Whether the software is already in conda-forge or bioconda; if not, whether a
  `recipes/<slug>/` recipe is warranted, under the *software's* licence rather than the article's.
  Then whether a biopixi Environment has anything to execute — a paper that released no code has no
  environment, and that is the answer, not a gap.
