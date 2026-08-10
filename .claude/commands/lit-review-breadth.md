---
description: Find recent papers in territory the corpus does not cover yet
argument-hint: [time window, default last 3 months]
---

Find work unconnected to anything the corpus cites. For following its own citations, use
`/lit-review-depth`.

Window: $ARGUMENTS

1. Start from where the corpus is *thin*, not from what it cites. Count notes per registered tag —
   the smallest counts are the real gaps, and territory with no tag at all is a bigger one.
2. Sweep. The workhorse is the arXiv API with a date window:
   `https://export.arxiv.org/api/query?search_query=abs:"..." AND submittedDate:[YYYYMMDDHHMM TO
   YYYYMMDDHHMM]&sortBy=submittedDate&sortOrder=descending&max_results=60`
3. **Give journals their own pass.** An arXiv-first sweep is where this goes wrong — the best two
   finds last time were in *Briefings in Bioinformatics* and *Cell Reports Methods*, and both
   surfaced by luck. Search the venues directly.
4. Report a ranked shortlist. Per candidate, beyond citation and link:
   - **Licence, with the CC variant.** `-NC` and `-SA` are not `CC BY`; they change what `derived`
     can be, and a variant not yet in the corpus is a policy decision, not a note decision.
   - **Whether it implies a tag the registry lacks** — that is a deliberate change, not a detail.
   - **Whether it has a matched non-topological baseline.** Most do not; they compare topological
     descriptors to each other. That is a reason to ingest one as a critique target, not a reason to
     drop it — say which you mean.
5. State the sweep's limits: which fields, which venues, which phrases. A sweep that sounds
   exhaustive and was not is worse than one that admits its edges.

Write nothing. The output is the shortlist; ingesting is `/ingest-paper`.
