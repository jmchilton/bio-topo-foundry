# The tool-alignment audit, and what it says about `audit-base`

This Foundry's S2 of the Skill Integrity Audit, and it is worth being exact about what it audits. A
note asserts things about a runtime — which platform its lock solves, which channel its package
comes from, how many packages it installs, what version it pins — and the manifest and lock
committed beside it are the authority on all four. This checks one against the other.

So it is an **environment runtime-claim audit**, and the report calls itself that. The S2 lineage is
real — an Environment note is what a cast ships as a skill's tool documentation, companions and all
— but nothing here checks whether a generated skill invokes its tool correctly, and a name implying
otherwise would claim a check that does not exist.

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
| `base/claims.ts` | same shapes, re-typed | span-with-digest and its two refinements, three-state evidence, severity split, digest-bound adjudication, corpus digest, referential integrity |

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

The span is now the same field set as the citation one, including `sourceText` and both refinements
(`endLine` not preceding `startLine`, and the digest verified against the text it covers). The first
draft omitted `sourceText`, which meant the digest was carried but never checked — the divergence
was an oversight rather than a decision, and finding it is the reason to write the comparison down
instead of asserting convergence. What remains genuinely different is below.

## Where the citation lifecycle did not fit

Four divergences, each a real difference rather than an omission:

**A reviewed decision is not allowed to mean "it holds".** The citation adjudication classifies;
here classification alone was made to change a verdict, and the first draft mapped both
false-positive classes onto `exists`. That is wrong in two different ways. An extractor false
positive means there was never a claim, so it leaves the denominator entirely rather than passing —
otherwise the instrument could improve its own score by misreading more prose. A checker false
positive means the checker got a real claim wrong, which is a statement with no content until the
reviewer supplies the verdict it should have had, so `assertedVerdict` is required for that class
and forbidden for the others. Whether `audit-base` should own this rule or only the shapes it
operates on is an open question for extraction.

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

A fifth arrived later and is the most instructive, because it came from prose the checker's author
did not write. A note repaired on `main` explains its own fix — "a channel pin and a re-lock **would**
move this fixture to L4" — and `pin` satisfied the resolve-verb test, so a sentence written to say
the fixture does *not* take that channel was read as claiming it does. The grammar now declines any
sentence carrying a modal or conditional, for every claim kind rather than only channels: a sentence
about a runtime that does not exist describes that runtime, not this one.

That shape is not rare, and it is worst exactly where the audit is succeeding. Repair advice is the
natural thing to write beside a finding, so the better this checker works, the more counterfactual
prose the corpus will contain for it to misread.

All five are now regression tests in `site/tests/tool-alignment.test.ts`. This ordering is the
point rather than an anecdote: ScientistOne's own audit found only two to four of twelve flagged
provenance failures genuine, the rest extraction artifacts, and an audit whose false-positive rate
exceeds its finding rate is worse than no audit because every false positive is an accusation.

The pre-filters cost recall, and the report says so: it counts every recognized token it declined,
each with its reason. That count is deliberately not restated here, because a hand-copied number
drifts from the generated one and this file already carried a stale one.

Read it for what it is. It counts tokens the grammar **recognized** and refused to promote — the
known false negatives, such as a channel claim dropped because its sentence names a second channel
(`ripser-py`), even though the first is a true and checkable assertion. It is not a coverage
measure and cannot become one: a claim written in a shape the grammar does not know produces no
token at all, so nothing counts it and no number in the report would reveal it. What the report can
honestly say is how often the grammar saw something and declined; what nobody can say from these
artifacts is how much of the corpus the grammar never saw.

## Running it

```
pnpm audit:tools     # regenerate audit/tool-alignment.json and .md
pnpm test            # includes the gate
```

The gate fails when a claim is contradicted by the runtime it names, when a flagged finding carries
no reviewed decision, when the committed report no longer replays from the committed corpus, when
the committed run does not satisfy its own wire schema, or when a reviewed decision names a claim id
this corpus does not carry. `unpinned` and `unavailable` never fail.

It also fails when the lock reader meets an artifact shape it cannot decode, or a lock that solved
more than one platform, rather than skipping the entry or flattening the name. Both are the same
rule: a gap in the reader must not become a finding about a note. A skipped entry removes a package
from the evidence, and a claim about a package the evidence lacks reads as a claim the runtime
contradicts — so a parser gap does not weaken the audit, it makes it accuse a correct note. Turning
the skip into a failure immediately surfaced 162 PyPI packages in `hiponet` and 64 in `topodockq`
that the reader had been silently discarding. A flattened name would fail the same way from the
other side, answering a claim about one platform with another platform's pin.

## Known limits

- **Channel claims are answered per-fixture, not per-package.** A claim naming a channel holds when
  any of the fixture's channel dependencies resolves from it. Every channel claim in this corpus is
  about a fixture whose dependencies all resolve from one channel, so the distinction has not
  mattered yet; a mixed-channel fixture would need the extractor to keep the claim's subject and
  quantifier, which it currently discards.
- **No fixture is checked on more than one platform.** The reader keys packages by name, first
  occurrence wins, which is right only while one name means one artifact. Every `pixi.toml` here
  solves `linux-64` alone, so that holds today; a lock that solved several is refused rather than
  flattened, because answering a claim about one platform with another platform's pin would report
  a correct note as `wrong-value`. Keying the evidence by platform is deliberately deferred: there
  is no multi-platform fixture to design it against, and a version claim in one would need to name a
  platform before it could be checked at all, which no sentence in this corpus does.
- **Only note prose is read.** A runtime claim written in a `pixi.toml` header comment is invisible
  to the grammar, and the corpus has carried a wrong one there while the note beside it was right.
