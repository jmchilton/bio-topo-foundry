---
type: meta
title: Build and Validation
summary: The commands, generators, and gates that turn authored source into a checked, rendered site — and what is deliberately not checked yet.
record_kind: infrastructure
order: 4
status: revised
created: 2026-08-08
revised: 2026-08-08
revision: 2
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
              Astro typecheck
                    │
                    ▼
           production static build
```

Every command runs from `site/`. There is no casting step in this flow, and no repository-root
toolchain: the recipes under `recipes/` are built by pixi and rattler-build outside it.

## Commands

| Command | What it does |
|---|---|
| `pnpm validate` | The gate. Runs the four stages above in order. |
| `pnpm test` | Vitest once, without the manifest check or the Astro stages. |
| `pnpm typecheck` | `astro check` over components, pages, and TypeScript. |
| `pnpm build` | Forced production build into `dist/`, including the Pagefind index. |
| `pnpm kinds` | Rewrites `src/types/kinds.generated.json` from the live definitions. |
| `pnpm check:kinds` | Fails when that file is byte-stale. |
| `pnpm audit:citations` | Replays citation resolution offline from committed evidence and rewrites the run and report. |
| `pnpm audit:citations:refresh` | Re-queries live providers before producing the run and report. |
| `pnpm audit:citations:scan` | Extracts citation candidates without resolving them. |
| `pnpm dev` | The local reader. Not a check. |

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
registry does not declare, *and* the registry may not declare a tag no note carries — an unused
value is a browse axis that renders an empty page. The reference contract is held the same way: it
declares exactly the reference kinds and cast modes the current Molds actually use.

**Cross-table agreement.** `DETAIL_ROUTES` and the collection table are compared in both directions,
so a new collection cannot ship without a label or keep a label after it goes. The kind manifest is
compared byte-for-byte against what the definitions currently produce.

**Links.** Every `[[Target]]` written in the body of a typed note is resolved through the same map
the renderer uses, so a link naming nothing fails validation rather than waiting to be noticed. Note
aliases are checked to land on their own notes, which turns silent address shadowing into a failure.

**Citation identity.** `tests/citation-audit.test.ts` extracts scholarly identifiers and replays
their resolution from committed provider evidence, without network access. It fails on missing
evidence, an unresolved or mismatched work without adjudication, an unaccounted bibliography entry,
or a committed run and report that no longer match the replay. This proves that a citation names the
work its own bibliography text describes; it does not prove that the work supports the surrounding
claim.

**Built output.** The last layer reads the emitted HTML and CSS, because the defects that matter most
here exist only after compilation and every earlier stage reports success. It checks that every
routed note has a page and every infrastructure route was emitted; that the shared shell, its style
contract, and the self-hosted type system survived Tailwind's scan; that the deployment base is on
internal links; that Pagefind indexed every page; that every linked tag route was built; and that
the typed facts a note declares actually reached the page.

That layer exists because a green build proves nothing about any of it. The convergence work behind
these packages found green builds with missing links, missing pages, unstyled shells, incomplete
search indexes, and wrong deployment bases.

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

Casting is designed and not implemented. What exists is the source side: Molds carry typed reference
manifests, and the reference contract narrows cast modes to `verbatim` because a mode is a
commitment to machinery. What does not exist is any machinery — no caster command, no `casts/`
directory, no artifact.

Until it does, prose says *would cast* and never implies an artifact is available. A reader who acts
on a present-tense sentence, goes looking for the output, and finds nothing cannot tell whether the
record was aspirational or the checkout is broken.

## Known gaps

- A typed reference's `ref` target is not resolved by any check. Its vocabulary is validated and its
  target is not, so a manifest may point at nothing and pass. The body-link check covers prose only;
  [[content-model]] states the same gap from the contract side.
- A backticked `[[Target]]` is invisible to the link check by construction, since the rewriter and
  the checker both walk text nodes. Closing that mechanically would fail every correct mention of
  the syntax, so the rule carries it instead.
- Nothing checks that a recipe under `recipes/` still builds, or that a fixture's `pixi.lock`
  resolves today. Environment companions are measured for presence, not for freshness.
- Citation resolution checks identity only: a real paper cited for a claim it does not support
  passes. Design records are outside the audited corpus, and nothing checks the transitive step from
  a domain note's wiki link to the scholarly identifier held by the linked source note.

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
