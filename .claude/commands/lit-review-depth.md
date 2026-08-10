---
description: Find papers the corpus already depends on but has never reviewed
argument-hint: [topic, tag, or seed paper — empty means sweep the whole corpus]
---

Work outward from what the corpus cites. For breadth into new territory, use `/lit-review-breadth`.

Scope: $ARGUMENTS

1. Rank external works by how often `content/` links them and how few Paper notes review them. A work
   the corpus cites repeatedly and never reviews is the strongest candidate there is.
2. Then look for load-bearing gaps citation counts miss: a Method note with no paper, a replication
   experiment whose paper has no note, a comparative claim whose baseline is unreviewed.
3. Check open issues before reporting — this corpus already has issues proposing Paper notes, and a
   duplicate is worse than a comment on the existing one.
4. Report a ranked shortlist. Per candidate: citation, link, licence, why it belongs, and which
   existing note connects to it.

Write nothing. The output is the shortlist; ingesting is `/ingest-paper`.
