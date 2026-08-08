# Citation-integrity audit

Every scholarly identifier cited in this knowledge base is resolved against public metadata
providers and compared against the bibliography text around it. The question this answers is narrow
and worth stating exactly: **does this citation identify the work its own text describes?** It does
not ask whether that work supports the claim it is cited for.

The mechanics belong to [`@galaxy-foundry/audit-citations`](https://github.com/jmchilton/foundry-lib/tree/main/packages/audit-citations)
— extraction grammar, provider normalization, comparison, adjudication, and report rendering. This
repository owns only what the package refuses to own: which files are in the corpus, which citation
hosts are trusted, and what an acceptable corpus looks like.

## Files

| File | |
|---|---|
| `../audit-citations.config.json` | Corpus definition: source globs, artifact kinds, trusted citation hosts, request budget |
| `provider-evidence.json` | Normalized provider answers, one per distinct query. The offline replay reads only this |
| `citation-audit.json` | The machine-readable run: candidates, findings, coverage, digests |
| `citation-audit.md` | The same run, rendered. Carries no timestamp or revision, so it diffs cleanly |
| `adjudications.json` | Manual review of flagged findings, bound to both candidate ID and source digest |
| `uncited-reference-entries.json` | Bibliography entries that are deliberately not scholarly citations |

## Running it

```sh
cd site
pnpm audit:citations           # offline replay from committed evidence; rewrites the run and report
pnpm audit:citations:refresh   # the same, but re-queries every provider first
pnpm audit:citations:scan      # extraction only, to build/citation-scan.json
```

`pnpm validate` runs `tests/citation-audit.test.ts`, which replays the audit offline and fails when:

- a citation has no committed evidence (`unavailable`) — this is what a new citation added without a
  refresh looks like, and the case where a silent pass would be worst;
- a citation resolves to a different work, or does not resolve, without a review decision;
- a numbered bibliography entry produced no candidate and is not listed in
  `uncited-reference-entries.json`; or
- the committed run and report no longer match a replay of the committed evidence.

The audit itself is offline and deterministic. Live re-resolution runs weekly in
[`citation-audit.yml`](../.github/workflows/citation-audit.yml), which opens a pull request only
when the rendered report changes — a refresh restamps every record's `observedAt`, so the evidence
file alone cannot say whether anything moved.

## What the audit has caught

Two DOIs in the corpus pointed at unrelated papers, in both cases by a small digit error that no
amount of reading the sentence would reveal:

| Cited as | Wrong DOI resolved to | Corrected to |
|---|---|---|
| Wang et al., "HERMES: Persistent spectral graph software" | `10.3934/fods.2021004` → "Markov chain simulation for multilevel Monte Carlo" | `10.3934/fods.2021006` |
| Wei and Wei, "Persistent topological Laplacians — a survey" | `10.3390/math13020278` → "Prioritization of Preventive Measures: A Multi-Criteria Approach to Risk Mitigation in Road Infrastructure Projects" | `10.3390/math13020208` (the article number was also wrong: 278, not 208) |

Both were first found in [`content/packages/petls.md`](../content/packages/petls.md) and repaired
there, and both had already been copied into
[`content/papers/persistent-spectral-graph.md`](../content/papers/persistent-spectral-graph.md)
before the audit ran again. A wrong identifier propagates by citation reuse, which is the argument
for checking it on every build rather than once.

## Standing exemptions

Three findings are adjudicated in `adjudications.json` rather than repaired, because the notes are
right and the tooling is not yet:

- **Two percent-encoded DOIs.** `10.1016/S1359-0278(97)00024-2` and `10.1016/S0006-3495(01)76033-X`
  are written percent-encoded in Markdown links, because an unescaped `)` would close the link. The
  extractor's DOI grammar stops at the `%`. Both were verified by hand against Crossref.
- **One author-notation mismatch.** A `topometry` entry names authors in Vancouver form
  (`Domingos AI`); Crossref stores given-name form (`Ana I Domingos`). Same people; the comparator
  does not yet reduce a trailing initials blob to a given name.

Both are upstream gaps in `@galaxy-foundry/audit-citations`, not corpus defects. The adjudications
are bound to the exact source text, so editing any of these lines retires the exemption and returns
the finding to review.

`uncited-reference-entries.json` is a different kind of exemption: source repositories, package
distributions, project documentation, and a funding record are cited by URL because they have no
DOI. They are enumerated so that coverage means something — an entry the extractor cannot read is a
build failure, not a silent gap. Narrative lines under a source-note heading are exempt by shape,
since the extractor only ever treats numbered entries as bibliography.

## Known limits

- Free-form `Author (Year)` prose is counted as a diagnostic and never becomes a candidate. Two such
  patterns exist in the corpus today.
- Notes under `content/methods/`, `content/molds/`, `content/replication-experiments/`, and
  `content/meta/` are in the configured corpus but contribute no candidates: they cite by
  `[[wiki-link]]` into the paper and package notes that hold the identifiers. Their citation
  integrity is therefore transitive, and nothing checks the transitive step yet.
- Resolution is identity-checking only. A real paper cited for something it does not say passes.
