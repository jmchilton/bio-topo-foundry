---
type: meta
title: Build and Validation
summary: The commands, generators, and gates that turn authored source into a checked, rendered site — and what is deliberately not checked yet.
record_kind: infrastructure
order: 4
status: revised
created: 2026-08-08
revised: 2026-08-12
revision: 6
tags:
  - meta
---

# Build and Validation

This record owns the transformations that exist today: what runs, in what order, and what each stage
would catch. Component ownership belongs to [[code-architecture]], placement to
[[repository-layout]], and the frontmatter contract being enforced to [[content-model]].

## Current flow

```text
edit content, registries, or kind definitions
                    │
                    ▼
        kind manifest freshness check
                    │
                    ▼
      corpus, contract, and built-output tests
                    │
                    ▼
           committed cast drift check
                    │
                    ▼
              Astro typecheck
                    │
                    ▼
           production static build
```

Every command runs from `site/`. The recipes under `recipes/` are built by pixi and rattler-build
outside this flow.

## Commands

| Command                        | What it does                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `pnpm validate`                | The gate. Runs the five stages above in order.                                               |
| `pnpm test`                    | Vitest once, without the manifest check or the Astro stages.                                 |
| `pnpm typecheck`               | `astro check` over components, pages, and TypeScript.                                        |
| `pnpm build`                   | Forced production build into `dist/`, including the Pagefind index.                          |
| `pnpm kinds`                   | Rewrites `src/types/kinds.generated.json` from the live definitions.                         |
| `pnpm check:kinds`             | Fails when that file is byte-stale.                                                          |
| `pnpm cast <mold>`             | Rebuilds one Mold's bundle for the default target; add `--check` to inspect only.            |
| `pnpm casts`                   | Rebuilds every already-committed bundle.                                                     |
| `pnpm check:casts`             | Re-derives every already-committed bundle and fails on errors or byte drift.                 |
| `pnpm audit:citations`         | Replays citation resolution offline from committed evidence and rewrites the run and report. |
| `pnpm audit:citations:refresh` | Re-queries live providers before producing the run and report.                               |
| `pnpm audit:citations:scan`    | Extracts citation candidates without resolving them.                                         |
| `pnpm audit:tools`             | Checks each Environment note's runtime claims against its own manifest and lock.             |
| `pnpm dev`                     | The local reader. Not a check.                                                               |

One thing about `pnpm validate` is worth knowing before it surprises someone: the built-output test
runs a production build of its own inside Vitest, so the site is built twice — once to be read by
assertions, once as the final stage. The duplication is the price of the built-output layer running
under the same runner as everything else.

## What the checks are looking for

Validation is layered, and the layers catch different classes of mistake.

**Schema.** Every routed note is parsed against the exact assembled schema Astro consumes, so the
tests and the build cannot disagree about what is valid. Strictness makes an undeclared key a
failure, and each kind's `example.md` is parsed against its own schema so the documentation cannot
rot into something that would not validate.

**Drift, in both directions.** A one-way check is half a check. The corpus may not carry a tag the
registry does not declare, _and_ the registry may not declare a tag no note carries — an unused
value is a browse axis that renders an empty page. The reference contract is held the same way: it
declares exactly the reference kinds and cast modes the current Molds actually use.

**Cross-table agreement.** `DETAIL_ROUTES` and the collection table are compared in both directions,
so a new collection cannot ship without a label or keep a label after it goes. The kind manifest is
compared byte-for-byte against what the definitions currently produce.

**Links.** Every `[[Target]]` written in the body of a typed note is resolved through the same map
the renderer uses, so a link naming nothing fails validation rather than waiting to be noticed. Note
aliases are checked to land on their own notes, which turns silent address shadowing into a failure.
Each typed Mold reference is also shape-checked against its reference kind and resolved through the
same alias-aware content index the caster consumes.

**Cast reproducibility.** The cast integration test checks the boundary itself: the site and caster
share aliases and frontmatter; target-required outputs and resolved references exist; Kind-bundled
companions appear in provenance; foundry-only companions do not; and generated documents obey the
target's frontmatter, title, and forbidden-path constraints. `pnpm check:casts` then runs the actual
cast engine in check mode, so changes to source, policy, hooks, or generated bytes fail until the
bundle is regenerated and reviewed.

**Cast publication.** The publishing test reads both runtime manifests and both repository
marketplaces, proves they share one plugin identity and one `casts/claude/skills/` tree, and rejects
a skill directory without `SKILL.md` or with frontmatter outside the portable `name`/`description`
core. It then exercises the same target-driven inventory the site uses and requires every
provenance reference it surfaces to exist in the bundle.

**Redistribution terms.** `tests/license-files.test.ts` audits the vendored `LICENSES/` directory
against every note's `license_file`, in both directions. The schema can require that field and
cannot open it, so until this ran, a note claiming to carry upstream wording could name a license
copy that was never there and pass every other layer. It also asserts the corpus and the directory
are non-empty, because an audit finds nothing wrong with a repository holding nothing.

**Citation identity.** `tests/citation-audit.test.ts` extracts scholarly identifiers and replays
their resolution from committed provider evidence, without network access. It fails on missing
evidence, an unresolved or mismatched work without adjudication, an unaccounted bibliography entry,
or a committed run and report that no longer match the replay. This proves that a citation names the
work its own text describes; it does not prove that the work supports the surrounding claim.

A source note splits that text in two: `citation` describes the work and `source_ids` carries the
identifiers, so read line by line neither half can check the other. The `noteFrontmatter` block in
`audit-citations.config.json` names both, and the frontmatter then resolves as one citation — which
is also what makes a note's DOI and its arXiv id checkable against each other. The replay assembles
its extraction options separately from the CLI, so a new config field reaches one and not the other;
the run-matches-replay assertion is what catches that.

**Runtime claims.** `tests/tool-alignment.test.ts` reads the assertions a fixture makes about its
own runtime — the platform its lock solved, how many packages it declares, the channel they resolve
from, the version each is pinned at — and checks each against the `pixi.toml` and `pixi.lock`
committed beside it. The lock is the record of a solve that already happened, so no stage of this
fetches, solves, or executes anything.

Two artifacts carry those assertions and one grammar reads both: the Environment note, and the
header comment of the manifest itself. Only whole-line comments are read there — the tables below
them are the authority the claims are checked against, not prose that could be wrong on its own.

Three properties are deliberate. A claim the runtime cannot falsify is never a failure: `unpinned`
and `unavailable` are reported apart from `absent` and `wrong-value`, because a fixture that
declares less is not a fixture caught lying. Evidence the reader cannot decode is not a failure
either — an unreadable lock entry stops the audit rather than dropping a package, since a claim
about a package the evidence lacks would otherwise read as a claim the runtime contradicts. A lock
that solved more than one platform stops it for the mirror reason: the reader keys packages by name
alone, so it would answer a claim about one platform with another platform's pin.

And a reviewed decision cannot make a finding hold. A claim struck as an extractor defect is
withdrawn from the denominator rather than counted as passing, or the instrument could improve its
own rate by misreading more prose; a claim where the checker itself erred moves only to the verdict
the reviewer names in its place. The machine verdict is kept beside the reviewed one in both cases.

**Built output.** The last layer reads the emitted HTML and CSS, because the defects that matter most
here exist only after compilation and every earlier stage reports success. It checks that every
routed note has a page and every infrastructure route was emitted; that the shared shell, its style
contract, and the self-hosted type system survived Tailwind's scan; that the deployment base is on
internal links; that Pagefind indexed every page; that every linked tag route was built; and that
the typed facts a note declares actually reached the page.

That layer exists because a green build proves nothing about any of it. The convergence work behind
these packages found green builds with missing links, missing pages, unstyled shells, incomplete
search indexes, wrong deployment bases, and a cast inventory that rendered empty after Astro moved
the filesystem reader into a prerender chunk.

## Generated artifacts

`pnpm kinds` derives `src/types/kinds.generated.json` from the kind definitions, their `kind.md` and
`example.md`, and the collection table. It is committed because its audience is cross-instance
consumers; the Zod definitions and the `kind.md` files remain authoritative, and the JSON is never
hand-edited. `pnpm check:kinds` is the drift guard and runs first in `validate`, so a stale manifest
fails before anything slower does.

`pnpm audit:citations` produces `audit/citation-audit.json` and `audit/citation-audit.md` from the
configured corpus, committed provider evidence, and adjudications. The citation-audit test is their
offline drift guard. `audit/provider-evidence.json` changes only through a live refresh; the rendered
report deliberately carries no observation timestamp, so the scheduled workflow can distinguish a
substantive provider or verdict change from timestamp-only churn.

`pnpm audit:tools` produces `audit/tool-alignment.json` and `audit/tool-alignment.md` from the
Environment corpus and `audit/tool-alignment-adjudications.json`. The tool-alignment test is their
drift guard, and it replays from committed files only. Both JSON documents are parsed against strict
schemas rather than asserted into shape, because the replay that gates the build reads them back as
input from outside the process however they were produced. An adjudication binds to the digest of
the source text it reviewed, so editing a claim retires the decision that cleared it; a decision
naming a claim id the corpus does not carry, or naming one twice, fails instead of retiring, since
that is a reviewer believing they cleared something.

`pnpm cast <mold>` produces a target bundle under `casts/` from the Mold, its typed references, the
content index, Kind companion declarations, the reference contract, and target policy. The generated
document, packaged references, and `_provenance.json` are committed. `pnpm check:casts` is their
drift guard; timestamps that record only the check run are excluded from the provenance comparison.

## Continuous integration and deployment

`.github/workflows/ci.yml` runs `pnpm validate` from `site/` on every pull request and every push to
`main`, on Node 24 with a frozen lockfile. It is the same command a contributor runs locally, which
is the point — there is no CI-only check to discover after review.

`.github/workflows/deploy.yml` independently builds and publishes to GitHub Pages on the same push
to `main`. It does not wait for `ci.yml`; the deploy workflow's own install, build, and publish path
is its only gate, so a commit whose non-build validation fails may still deploy.

`.github/workflows/citation-audit.yml` re-resolves every citation against live providers each week
and on manual dispatch. It opens or updates a pull request only when the timestamp-free rendered
report changes. Pull-request and push validation remain deterministic because they replay the
committed evidence offline.

## The casting boundary

Casting is implemented for the committed target and the `verbatim` mode. `@galaxy-foundry/cast`
owns command parsing, contract loading, reference and companion assembly, target placement,
provenance, reconciliation, and the multi-Mold sweep. This instance supplies its content-index
projection, Kind layouts, reference vocabulary, target declaration, and TDA-specific document
sections. That line is deliberate: filesystem walking, wiki-link aliases, and bundle mechanics do
not fork here, while domain language and domain contracts do not move upstream.

The first committed bundle casts `score-docking-poses` as a Claude skill and carries the
`open-topoqa-scorer` Environment note with its manifest and lockfile. Evaluation and scenario files
stay Foundry-side because the Mold Kind declares them `foundry-only`.

## Known gaps

- The cast sweep checks bundles that are already committed; it does not require every new Mold to
  have an artifact for every target. Casting remains an explicit publication decision.
- A backticked `[[Target]]` is invisible to the link check by construction, since the rewriter and
  the checker both walk text nodes. Closing that mechanically would fail every correct mention of
  the syntax, so the rule carries it instead.
- Nothing checks that a recipe under `recipes/` still builds, or that a fixture's `pixi.lock`
  resolves today. Environment companions are measured for presence, not for freshness.
- A package a fixture takes from an in-repo recipe cannot appear in its lock, so a claim about that
  package's version is reported unfalsifiable rather than checked. The recipe is the authority and
  the tool-alignment audit does not read `recipes/`.
- Tool alignment is tuned for precision over recall, so a claim the grammar declines is a claim
  nobody checked. The report counts the tokens it recognized and declined, which is not a coverage
  measure and cannot be made into one: a claim written in a shape the grammar does not know produces
  no token, so nothing counts it and no figure in the report would reveal it. Declining is not the
  safe direction either: two pre-filters between them hid the one claim this corpus carried that its
  own lock contradicted, which is what a pass rate over declined prose is worth.
- A channel claim is answered by the package it names, where it names one — a manifest pin spec, or
  prose binding a channel by preposition to packages beside it. Prose that names no package is
  answered per fixture instead: it holds when any of the fixture's dependencies resolves from that
  channel. The subject is kept; the quantifier is not, so a list binds as a claim about its last
  member and the rest goes unread — "the CLI", "both" and "all of them" are three different claims.
  No fixture here resolves from more than one channel, so the two questions agree today.
- No fixture's runtime is checked on more than one platform. Every `pixi.toml` here solves
  `linux-64` alone, and a lock that solved several is refused rather than read, so what a
  multi-platform claim would even have to name is an open question rather than a checked one.
- A portability grade is checked for internal consistency, never against a registry. `L4` now
  requires a `publication_candidate` in the `CONFIRMED` state, carrying the digest and timestamp of
  an observation, so the gate can tell a graded claim from an ungrounded one — but the observation
  itself is a committed record of a past `biopixi verify`, and nothing offline can tell a stale one
  from a current one.
- Citation resolution checks identity only: a real paper cited for a claim it does not support
  passes. Design records are outside the audited corpus, and nothing checks the transitive step from
  a domain note's wiki link to the scholarly identifier held by the linked source note.
- An identifier written in body prose with no work named beside it resolves and can report no
  mismatch, because there is nothing to compare a provider's answer against. Those are counted apart
  from verified ones under **Verification** in the report and are not a gate failure.

## The expected gate

For any change to content, registries, kinds, or the site:

```sh
cd site
pnpm validate
```

Run `pnpm kinds` first only when a kind definition, its documentation, or the collection table
changed, then commit the regenerated manifest and let `validate` confirm it.

When a change adds or edits a scholarly citation, run `pnpm audit:citations:refresh` with network
access first, commit the refreshed evidence, run, and report, then let `validate` replay them
offline.

Update this record when a command, generator, validation layer, build stage, CI job, or
implemented-versus-deferred boundary changes.
