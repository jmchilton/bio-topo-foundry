# The tool-alignment audit, and what it says about `audit-base`

This Foundry's S2 of the Skill Integrity Audit, and it is worth being exact about what it audits. A
fixture asserts things about a runtime — which platform its lock solves, which channel its package
comes from, how many packages it installs, what version it pins — and the manifest and lock
committed beside it are the authority on all four. This checks one against the other.

It reads those assertions from two files. The note is the document a reader is pointed at; the
`pixi.toml` header comment is what the person editing the manifest sees, and it sits two lines above
the tables it describes. Being two files is the whole reason the second one drifts, and for a while
only the first was read.

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

This is that other checker, and the extraction has since happened:
[`@galaxy-foundry/audit-base`](https://www.npmjs.com/package/@galaxy-foundry/audit-base) carries the
lifecycle, and `audit-citations` consumes it too — a base package only one checker used would have
been a third copy rather than an extraction.

Nothing local was redesigned to get there. Everything that turned out to be shared had been kept in
`site/src/lib/audit/base/`, physically separated from anything that knew what pixi was, so the move
was a deletion and an import. What stayed behind is in `tool-alignment/lifecycle.ts`: the
vocabularies the package refuses to own, and the two identity functions the two checkers compute
differently.

The checker itself is **not** an upstreaming candidate and is not expected to become one. The
`environment` kind is declared locally in `reference_contract.yml`; a fixture built from a pixi
manifest is this Foundry's runtime story, not a Foundry Pattern concept. A second instance would
have to independently arrive at pixi before that changed.

## What converged, and how strongly

| Shape | Relationship to `audit-citations` | Where it is now |
| --- | --- | --- |
| `digest.ts` | byte-identical copy, verified by `sha256` | `audit-base` |
| `files.ts` | byte-identical copy, verified by `sha256` | `audit-base` |
| span with digest, and both refinements | same shape, re-typed | `audit-base` |
| severity split, three classifications | same shape, re-typed | `audit-base` |
| adjudication, and its referential integrity | same shape, re-typed | `audit-base`, built against local verdicts |
| corpus record | same shape plus a local count | `audit-base` fields, `lifecycle.ts` count |
| evidence states, verdicts | one value in common | `lifecycle.ts` |
| claim id, corpus digest | same intent, different inputs | `lifecycle.ts` |

The two copied files were the strongest evidence available, because the admission test says so:
"Byte-identical copied files are strong evidence. Similar names, parallel folder structures, or a
belief that projects _should_ converge are not." Neither file was edited to fit; they were copied
and used.

The re-typed shapes were weaker evidence and were read as such while the question was open. They
converged — a span that carries the digest of the text it covers, a state field that keeps
`unavailable` out of the verdict, a severity that separates drift from a dispute about identity, an
adjudication that retires itself when the text changes — but the types were rewritten rather than
copied, because the citation versions name citations. Extraction had to answer whether that was one
contract or two similar ones, and the answer was one contract with the vocabulary taken out: the
shapes are shared and parameterized, the vocabularies are not.

The span is now the same field set as the citation one, including `sourceText` and both refinements
(`endLine` not preceding `startLine`, and the digest verified against the text it covers). The first
draft omitted `sourceText`, which meant the digest was carried but never checked — the divergence
was an oversight rather than a decision, and finding it is the reason to write the comparison down
instead of asserting convergence. What remains genuinely different is below.

## Where the citation lifecycle did not fit

Five divergences, each a real difference rather than an omission. All five survived extraction: the
package ships the mechanism and leaves each of these to the checker.

**A reviewed decision is not allowed to mean "it holds".** The citation adjudication classifies;
here classification alone was made to change a verdict, and the first draft mapped both
false-positive classes onto `exists`. That is wrong in two different ways. An extractor false
positive means there was never a claim, so it leaves the denominator entirely rather than passing —
otherwise the instrument could improve its own score by misreading more prose. A checker false
positive means the checker got a real claim wrong, which is a statement with no content until the
reviewer supplies the verdict it should have had, so `assertedVerdict` is required for that class
and forbidden for the others. `audit-base` owns this rule — the stricter of the two implementations
was adopted rather than averaged, and `audit-citations` now rejects an asserted verdict where it
could never mean anything.

**There is no evidence-acquisition phase.** The citation audit fetches from registries, caches
normalized evidence, and replays offline; `unavailable` exists because a provider can be
unreachable. Here the evidence is committed in the repository already. `unavailable` still exists
and still means "not checked", but it is reached by a fixture having no lock, not by a network
failure. An `audit-base` that assumed a provider/cache phase would be assuming a citation detail.

**Extraction is the whole risk, and it is checker-specific.** A DOI has a grammar. A claim that a
fixture installs one Bioconda package does not. Every pre-filter in `tool-alignment/extract.ts` is
prose-shaped and none of it generalizes — so `audit-base` owns the lifecycle and the
identity/adjudication machinery and stays entirely out of extraction. That is the boundary it
shipped with.

**A retired decision is benign here and fatal there.** A decision bound to text that has since
changed has done its job and steps aside, which is what digest-binding is for; the citation audit
instead refuses to build a run from a review file that no longer describes its corpus. Both are
defensible and neither is a shared policy, so `adjudicationProblems` reports the three problems and
ranks none of them. That split is what kept the extraction from having to invent a common posture,
which the admission test forbids.

**The verdict vocabularies do not align, and forcing them would lose information.** Citations are
`resolved`/`resolved-mismatched`/`unresolved`/`unavailable`; claims here are
`exists`/`absent`/`wrong-value`/`unpinned`/`unavailable`. Only `unavailable` is common. `unpinned`
has no citation analogue at all: it marks a claim that cannot be falsified because the fixture
declares less than the note discusses, and it must never score as a failure or the audit would
punish fixtures for being modest. A shared `Verdict` union would either be a lowest common
denominator or an untagged mixture, so `adjudicationSchema` takes the vocabulary as a parameter
instead. That bought something the local schema did not have: `assertedVerdict` was a non-empty
string, so a reviewer could have recorded `resolved` against a runtime claim and nothing would have
objected.

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

Reading a second artifact produced two more of the same family, and they are the reason to read real
prose rather than imagine it. Both are sentences with a subject — the error is that the subject is
not this fixture:

- **Another resolver.** `hiponet`'s header records what upstream pins in upstream's own lockfile:
  "uv.lock pins torch 2.8 / numpy 2.3.2 / scanpy 1.11.4". Every one of those is true, and none of
  them is about the `pixi.lock` beside it. Three false accusations from one sentence.
- **Another fixture.** A header explains itself by contrast with the sibling it is not: "WHY NOT
  `content/environments/topometry/`: that env pins conda-forge topometry 0.2.1.1". Read as this
  fixture's pin, it accuses a file for describing its neighbour accurately.

The grammar now declines a sentence naming a foreign lockfile or an environment directory other
than its own, and counts the refusal as `other-runtime`.

Two more went the other way, and they are the ones worth reading twice: a pre-filter that declines
too much is not the safe direction, it is a checker that reports a clean corpus it never read. Both
fired on one sentence in `open-topoqa-featurizer`'s header — "numpy/gudhi/biopython from conda-forge
and `dssp` (…) from bioconda — so they resolve from channels rather than sibling path recipes" —
and between them they hid the only claim in this corpus the lock actually contradicts:

- **Contrast read as condition.** `rather than` and `instead of` sat in the counterfactual list.
  They are contrast, not condition, and English uses them to say what a thing *is* at least as often
  as what it would otherwise be. A counterfactual needs a modal or a conditional; a contrast word on
  its own is not one.
- **Two claims read as a comparison.** A sentence naming two channels was refused whole, because
  the shape that defeated the first grammar was a comparison — "the Bioconda CLI here, the
  conda-forge library there". But a comparison names two channels for *one* package, and this names
  one channel for each of *two*. Each channel bound by a preposition now takes the packages named
  between it and the channel before it, which makes the sentence two subject-bearing claims and
  needs no window to tune.

What the sentence asserted was that `dssp` came from Bioconda. The `pixi.lock` beside it resolves
`dssp` from conda-forge, and `content/environments/dssp/` — the fixture that exists to package it —
says outright that Bioconda has no `dssp` at all. The note repeated it. Both are repaired, and both
are now checked rather than declined.

All nine are now regression tests in `site/tests/tool-alignment.test.ts`. This ordering is the
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

- **A channel claim without a subject is answered per-fixture.** Two shapes name their package and
  are answered by it: the manifest's pin spec, and prose that binds a channel with a preposition to
  packages it names. Prose that binds nothing does not — "it resolves from conda-forge" holds when
  *any* of the fixture's channel dependencies does, which is a weaker question and the wrong one in
  a mixed-channel fixture. No fixture here is mixed, so the two agree today.
- **A bound channel is read as a claim about the last package named, not about all of them.** The
  subject is now kept; the quantifier still is not. "numpy, gudhi and biopython from conda-forge"
  becomes one claim about `biopython`, and the other two stay unread rather than assumed — "the
  CLI", "both" and "all of them" are three different claims and no sentence here distinguishes them.
  This is the remaining half of #81, and it is why a declined token and an unread list member are
  counted nowhere: see the note on coverage above.
- **No fixture is checked on more than one platform.** The reader keys packages by name, first
  occurrence wins, which is right only while one name means one artifact. Every `pixi.toml` here
  solves `linux-64` alone, so that holds today; a lock that solved several is refused rather than
  flattened, because answering a claim about one platform with another platform's pin would report
  a correct note as `wrong-value`. Keying the evidence by platform is deliberately deferred: there
  is no multi-platform fixture to design it against, and a version claim in one would need to name a
  platform before it could be checked at all, which no sentence in this corpus does.
- **A path recipe's version is not checked against anything.** A package the fixture takes from an
  in-repo recipe cannot appear in the lock, so the claim is reported `unpinned` rather than scored.
  `recipes/<name>/recipe.yaml` is the authority and this audit does not read it, which leaves the
  `kmapper` and `topometry-1.1` version claims unfalsifiable rather than checked. Before the manifest
  headers were read this reported `absent`, which accused two correct files.
- **The two files are read, and nothing else is.** `recipes/` is not opened, so a header sentence
  about what a recipe builds, patches or requires is answered by nothing here. Those sentences
  decline; they do not fail. This is narrower than it first looked: a recipe's run dependencies do
  reach the fixture's own `pixi.lock`, so a claim about where they come from is answerable and is
  now answered — that was the `open-topoqa-featurizer` finding above, not a missing authority.
