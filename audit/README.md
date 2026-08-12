# Citation-integrity audit

Every scholarly identifier cited in this knowledge base is resolved against public metadata
providers and compared against the text that describes it. The question this answers is narrow
and worth stating exactly: **does this citation identify the work its own text describes?** It does
not ask whether that work supports the claim it is cited for.

The mechanics belong to [`@galaxy-foundry/audit-citations`](https://github.com/jmchilton/foundry-lib/tree/main/packages/audit-citations)
— extraction grammar, provider normalization, comparison, adjudication, and report rendering. This
repository owns only what the package refuses to own: which files are in the corpus, which citation
hosts are trusted, which note fields carry a source's identity, and what an acceptable corpus looks
like.

## Files

| File | |
|---|---|
| `../audit-citations.config.json` | Corpus definition: source globs, artifact kinds, trusted citation hosts, note frontmatter contract, request budget |
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

That last one is load-bearing beyond staleness. The report is written by the CLI and the replay is
assembled in `site/src/lib/citation-audit.ts`, so the two build their extraction options from the
same config by separate paths. Adding `noteFrontmatter` to the config wired the CLI and not the
replay, and this is the check that said so.

The audit itself is offline and deterministic. Live re-resolution runs weekly in
[`citation-audit.yml`](../.github/workflows/citation-audit.yml), which opens a pull request only
when the rendered report changes — a refresh restamps every record's `observedAt`, so the evidence
file alone cannot say whether anything moved.

## How a source note is read

A source note records the work it summarizes in fields, not sentences: `citation` carries the
bibliographic record, `source_ids` carries the identifiers. Read line by line those two halves never
meet, and until this change they did not. The `citation` line named a work; the `source_ids.doi`
line a few lines below it named an identifier and described nothing, so the only thing checked was
that the identifier resolved. **A wrong journal DOI in a note's own frontmatter would have passed**
— the exact error class this audit exists to catch, and the one it has caught twice elsewhere.

`noteFrontmatter` in the config closes that. It declares which field describes the work and which
fields carry identifiers, and the whole frontmatter block becomes one citation:

```json
"noteFrontmatter": {
  "descriptionField": "citation",
  "identifierFields": ["doi", "arxiv", "pmid", "pmcid"]
}
```

Every identifier in the block is then attributed to the one work the block describes, which buys a
check that did not exist before: a note carrying both a DOI and an arXiv id now has to have them
name the same paper. `content/papers/tdl-docking-benchmark-review.md` is verified through Crossref
and Europe PMC at once for the same reason.

Because the fields are declared, the four identifier keys must stay bare identifiers. A `doi:` field
holding a `https://doi.org/…` URL, or an `arxiv:` field holding an unquoted number YAML would read
as a float, is a schema matter — the `source_ids` contract enforces it, and this audit depends on it.

### Resolved is not verified

The report's headline counts resolutions, and a resolution answers a weaker question than it looks
like it answers. An identifier with no description near it resolves and can report no mismatch,
because there is nothing to compare the provider's answer against. It is unfalsifiable, not correct.

The **Verification** section of `citation-audit.md` states that split, and the identifiers still
counted only as dereferenced are listed there by line. They are body prose — a package note pointing
at a paper mid-sentence — and each becomes checkable by naming the work beside the identifier. This
is reported rather than gated: a body-prose identifier is a weaker citation, not a defect.

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

It has also caught two defects in its own tooling. Both reported correct notes as findings, which is
the expensive direction: a reviewer spends attention on a citation that was right, and the exemption
they write to silence it outlives the bug.

| Reported as | Actually |
|---|---|
| `10.1016/S1359-0278(97)00024-2` and `10.1016/S0006-3495(01)76033-X` unresolved | Percent-encoded in the Markdown link, because an unescaped `)` would close it. The DOI grammar stopped at the `%` and queried a truncated identifier no agency registers |
| A `topometry` entry's authors mostly absent from the record | Vancouver notation (`Domingos AI`) against Crossref's given-name form (`Ana I Domingos`). The same three people; the unpunctuated initials run read as one meaningless token |

Both were fixed upstream in `@galaxy-foundry/audit-citations` 0.1.2 rather than adjudicated here, so
`adjudications.json` is now empty. Three exemptions retired; the notes were never wrong.

The third tooling defect ran the other way, and nothing in the report could have surfaced it. Every
frontmatter identifier was counted in a `resolved` headline it could not have failed, so the number
grew more reassuring as the corpus grew. It was found by reading a note beside its own report and
asking what a wrong DOI there would have done. `noteFrontmatter` in 0.2.0 is the fix, and the
`verifiable` split is the instrument that would now say it out loud.

## Standing exemptions

`uncited-reference-entries.json` is the one remaining exemption: source repositories, package
distributions, project documentation, and a funding record are cited by URL because they have no
DOI. They are enumerated so that coverage means something — an entry the extractor cannot read is a
build failure, not a silent gap. Narrative lines under a source-note heading are exempt by shape,
since the extractor only ever treats numbered entries as bibliography.

## Known limits

- Free-form `Author (Year)` prose is counted as a diagnostic and never becomes a candidate. The
  extractor diagnostics at the foot of `citation-audit.md` carry the current count.
- An identifier written in body prose with no work named beside it is dereferenced, not verified.
  Those are listed under **Verification** in the report rather than gated, on the argument that a
  weaker citation is not a defect. Only frontmatter is joined to a description automatically.
- Notes under `content/methods/`, `content/molds/`, and `content/replication-experiments/` are in
  the corpus but contribute no candidates: they carry no `citation` frontmatter and cite by
  `[[wiki-link]]` into the paper and package notes that hold the identifiers. Their citation
  integrity is therefore transitive, and nothing checks the transitive step yet.
- `content/meta/` is out of the corpus. Design records describe this repository rather than the
  literature, and one of them carries a `## Typed references` section about the Mold reference
  contract. The heading vocabulary is matched as a substring and cannot be anchored through
  configuration, so those fourteen prose lines would be counted as unread bibliography and would
  make the report churn whenever an unrelated design record is edited.
- Resolution is identity-checking only. A real paper cited for something it does not say passes.
