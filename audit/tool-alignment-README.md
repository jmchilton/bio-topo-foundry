# The tool-alignment audit, and what it says about `audit-base`

S2 of the Skill Integrity Audit, run over this Foundry's environment notes. A note asserts things
about a runtime — which platform its lock solves, which channel its package comes from, how many
packages it installs, what version it pins — and the manifest and lock committed beside it are the
authority on all four. This checks one against the other.

Nothing here solves, fetches, or executes. A `pixi.lock` is the record of a solve that already
happened, so every verdict is reproducible offline and identical on every machine. That is the same
property the citation audit buys with a committed evidence cache, obtained here for free.

## Why it exists in this repository and not upstream

`@galaxy-foundry/audit-citations` is S1 and is an explicitly experimental extraction. The shared
substrate's admission test is deliberate about what comes next:

> `audit-citations` is the first such exception. Its citation-specific types are not evidence that
> S2 tool checks or S3 threshold checks share a base schema. Any `audit-base` or `audit-schemas`
> package must still pass the normal admission test **after another checker exists**.

This is that other checker. It is written to make the extraction argument decidable rather than to
pre-empt it: everything that turned out to be shared lives in `site/src/lib/audit/base/`, and
everything that knows what pixi is lives in `site/src/lib/audit/tool-alignment/`.

The checker itself is **not** an upstreaming candidate and is not expected to become one. The
`environment` kind is declared locally in `reference_contract.yml`; a fixture built from a pixi
manifest is this Foundry's runtime story, not a Foundry Pattern concept. A second instance would
have to independently arrive at pixi before that changed.

## What converged, and how strongly

| Module | Relationship to `audit-citations` | Evidence |
| --- | --- | --- |
| `base/digest.ts` | byte-identical copy | `sha256` matches `packages/audit-citations/src/digest.ts` exactly |
| `base/files.ts` | byte-identical copy | `sha256` matches `packages/audit-citations/src/files.ts` exactly |
| `base/claims.ts` | same shapes, re-typed | span-with-digest, three-state evidence, severity split, digest-bound adjudication, corpus digest |

The two copied files are the strongest evidence available, because the admission test says so:
"Byte-identical copied files are strong evidence. Similar names, parallel folder structures, or a
belief that projects _should_ converge are not." Neither file was edited to fit; they were copied
and used.

`base/claims.ts` is weaker evidence and should be read as such. The shapes converged — a span that
carries the digest of the text it covers, a state field that keeps `unavailable` out of the verdict,
a severity that separates drift from a dispute about identity, an adjudication that retires itself
when the text changes — but the types were rewritten rather than copied, because the citation
versions name citations. Whether that is one contract or two similar ones is the question extraction
has to answer, and this file is the exhibit.

## Where the citation lifecycle did not fit

Three divergences, each a real difference rather than an omission:

**There is no evidence-acquisition phase.** The citation audit fetches from registries, caches
normalized evidence, and replays offline; `unavailable` exists because a provider can be
unreachable. Here the evidence is committed in the repository already. `unavailable` still exists
and still means "not checked", but it is reached by a fixture having no lock, not by a network
failure. An `audit-base` that assumed a provider/cache phase would be assuming a citation detail.

**Extraction is the whole risk, and it is checker-specific.** A DOI has a grammar. A claim that a
fixture installs one Bioconda package does not. Every pre-filter in `tool-alignment/extract.ts` is
prose-shaped and none of it generalizes — which suggests `audit-base` should own the lifecycle and
the identity/adjudication machinery and stay entirely out of extraction.

**The verdict vocabularies do not align, and forcing them would lose information.** Citations are
`resolved`/`resolved-mismatched`/`unresolved`/`unavailable`; claims here are
`exists`/`absent`/`wrong-value`/`unpinned`/`unavailable`. Only `unavailable` is common. `unpinned`
has no citation analogue at all: it marks a claim that cannot be falsified because the fixture
declares less than the note discusses, and it must never score as a failure or the audit would
punish fixtures for being modest. A shared `Verdict` union would either be a lowest common
denominator or an untagged mixture.

## Precision before findings

The first draft of the grammar flagged seven claims. Four were extractor defects:

- `unblocks` contains `lock`, so a sentence about unblocking a package was read as a claim about a
  lockfile;
- a sentence carrying two platforms ("Verified green on osx-arm64 … with a solved linux-64 lock")
  had both attributed to whichever was matched first;
- "why two **fixtures** pin a package of the same name" was counted as two packages;
- contrastive and negated channel prose ("the Bioconda CLI here, the conda-forge library there";
  "it is **not** a single Bioconda package") was read as an assertion, inverting the note's meaning.

All four are now regression tests in `site/tests/tool-alignment.test.ts`. This ordering is the
point rather than an anecdote: ScientistOne's own audit found only two to four of twelve flagged
provenance failures genuine, the rest extraction artifacts, and an audit whose false-positive rate
exceeds its finding rate is worse than no audit because every false positive is an accusation.

The pre-filters cost recall, and the report says so. Twenty-five recognized tokens are declined,
each recorded with its reason. One is a known false negative: a channel claim in a sentence that
also names a second channel is dropped even when the first is a true, checkable assertion
(`ripser-py`). Precision is worth more than recall for a check that gates a build, but the trade
is recorded rather than hidden.

## Running it

```
pnpm audit:tools     # regenerate audit/tool-alignment.json and .md
pnpm test            # includes the gate
```

The gate fails when a claim is contradicted by the runtime it names, when a flagged finding carries
no reviewed decision, or when the committed report no longer replays from the committed corpus.
`unpinned` and `unavailable` never fail.
