# Working in this Foundry

This file is operational only: what to read before editing, what to run before claiming done, and
the rules that are easy to break by instinct. It holds no design rationale and no inventory. The
design records under `content/meta/` own those, they are typed notes, and they are checked — this
file is not. When the two disagree, the records win and this file is the bug.

## Read first

`content/meta/glossary.md`, in full, at session start. The vocabulary here is domain-specific and
partly overloaded — Mold, Cast, Kind, Collection, Companion, Reference, Environment vs Package,
portability grade — and "Kind" alone names two closed vocabularies. It is short. Read it before
reasoning about anything else.

Then `content/meta/architecture.md`, which is the router to the rest.

## Load the record that owns your change

| You are about to | Read |
| --- | --- |
| Add or edit a note, kind, tag, link, reference, or companion | `content/meta/content-model.md` |
| Decide where a file goes, or add a top-level directory | `content/meta/repository-layout.md` |
| Touch site code, a registry, an adapter, or a shared package seam | `content/meta/code-architecture.md` |
| Change a command, generator, check, gate, or CI workflow | `content/meta/build-and-validation.md` |
| Add or grade a replication experiment | `content/meta/replication-experiments.md` |

Each record ends with an "Update this record when…" line. That line is the contract: a change in its
territory updates it in the same commit.

## The gate

```sh
cd site
pnpm validate
```

This is the same command CI runs; there is no CI-only check to discover after review. Two
preconditions, both conditional:

- Changed a kind definition, its documentation, or the collection table? Run `pnpm kinds` first and
  commit the regenerated manifest — the freshness check runs before anything slower.
- Added or edited a scholarly citation? Run `pnpm audit:citations:refresh` with network access,
  commit the refreshed evidence, run, and report; validation then replays them offline.

`content/meta/build-and-validation.md` owns the full command table and what each layer catches.
Do not reproduce it here.

## Invariants

- **Frontmatter is contract, and every kind is `.strict()`.** An undeclared key is an error and also
  an unvalidated one. Add the field to `site/src/types/<kind>/schema.ts` before writing it anywhere.
- **Tags are checked in both directions.** A note may not carry a tag `meta_tags.yml` does not
  declare, and the registry may not declare a tag no note carries. The same holds for the reference
  kinds in `reference_contract.yml`.
- **Write `[[Target]]` bare in prose.** Backticks mean *this is the syntax*, not *this is a link*;
  the rewriter and the link checker both walk text nodes, so a backticked link silently resolves to
  nothing and no check will tell you. Every note also carries the alias `<slug>-<kind>` — use it when
  a bare slug is ambiguous.
- **A licence is a value, never an omission.** `missing` means the upstream software grants nothing
  and is a fact the note asserts. Resolution is deny-by-default through the shared policy table, and
  a recipe claiming `upstreaming: blocked` is tied by test to its own `about.license`.
- **Do not hand-edit generated files.** `site/src/types/kinds.generated.json`, everything under
  `casts/`, and `audit/citation-audit.{json,md}` are produced and drift-checked. Change the source
  and regenerate. `audit/provider-evidence.json` changes only through a live refresh.
- **Link the authority, do not restate it.** A `recipe.yaml` and a `pixi.toml` remain the truth about
  names, versions, and dependencies. A note that copies them has created a second copy to keep
  correct, and it will not stay correct.
- **No placeholder directories.** A new top-level owner needs code, an entry point, and a drift
  story before it needs a name.

## Root Markdown is not source

`top-down-goals.md`, `foundry-design-draft.md`, `resource-map.md`, `ecosystem-hardening.md`,
`initial-mold-plans.md`, `persistent-laplacian-implementation-review.md`, and
`topodockq-featurizer-spike.md` are working drafts. They are dated, provisional, argue with
themselves, and are not typed notes. Nothing there validates, renders, or is linkable.

So do not cite them as authority, do not implement from them unasked, and do not treat a plan they
describe as a decision that was made. Their lifecycle is to be consumed: when a draft's conclusions
land in a record or a note, the draft loses that section.

`README.md`, `AGENTS.md`, `CLAUDE.md`, and `LICENSE` are the exception — permanent root files, and
the only Markdown at the root that is neither a draft nor a note.

## Don't

- **Don't weaken a schema to accept a note that will not validate.** Reshape the note, or extend the
  kind deliberately with tests.
- **Don't delete a test, drop an assertion, or edit fixture data to get to green.** Fix the
  implementation, or stop and ask.
- **Don't declare a kind, tag, or cast mode before a real note needs it.** An empty kind is an
  untested schema plus a browse surface that renders nothing.
- **Don't work around an upstream defect downstream.** The fix goes to the layer that owns it — a
  pull request, an issue with a reproducer, a licence request, a channel recipe. A patch buried in a
  fixture repairs one run and quietly makes this repository the owner of it.
- **Don't call a replication complete without environment-produced evidence**, or make a comparative
  claim without a matched non-topological baseline, an identical split, and a stated metric.
- **Don't write a present-tense sentence about machinery that does not exist.** Deferred stays named
  as deferred; a reader who goes looking for the output cannot tell ambition from a broken checkout.

## Outside the gate

`pnpm validate` does not touch `recipes/`. Nothing checks that a recipe still builds or that a
fixture's `pixi.lock` still resolves — environment companions are measured for presence, not
freshness. Building a recipe or an environment is a deliberate manual step with pixi and
rattler-build, from the directory that owns it, and the `.pixi/` and `output/` trees it leaves
behind are ignored build output rather than source.
