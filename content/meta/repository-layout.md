---
type: meta
title: Repository Layout
summary: Where authored knowledge, implementation code, generated metadata, and build recipes belong, and what each location implies.
record_kind: infrastructure
order: 3
status: revised
created: 2026-08-08
revised: 2026-08-08
revision: 4
tags:
  - meta
---

# Repository Layout

This record owns physical placement. It answers where a file belongs and what lifecycle that
location implies. Note semantics belong to [[content-model]], implementation dependencies to
[[code-architecture]], and processing to [[build-and-validation]].

## Current top-level map

```text
topological-data-analysis-bioinformatics-foundry/
├── content/                authored knowledge
├── recipes/<slug>/         rattler-build recipes for packages not yet in conda
├── site/                   Astro app, contracts, tests, and local adapters
├── casts/<target>/         target policy and committed generated bundles
├── audit/                  committed citation evidence, verdicts, and reports
├── .github/workflows/      validation, Pages deployment, and live citation refresh
├── audit-citations.config.json  citation corpus and provider policy
├── meta_tags.yml           instance tag vocabulary
├── reference_contract.yml  instance reference kinds
└── *.md                    working planning drafts — not records, not notes
```

There is no `packages/` or standalone fixture tree. Add one only when implemented machinery gives
it an owner and a lifecycle: an empty directory with a plausible name reads as machinery to
everyone who did not create it.

Two things are missing rather than absent by design, and are recorded here so they stay visible:
this repository has no root `LICENSE` and no root `README.md`. The corpus takes licensing seriously
enough to type it per note, and the repository holding it does not yet declare its own.

## `content/`: knowledge source

```text
content/
├── meta/                          design records; glossary.md is a non-note
├── environments/<slug>/           index.md + pixi.toml/pixi.lock companions; README.md at base
├── molds/<slug>/                  index.md, with eval.md and scenarios.md recommended
├── methods/*.md
├── packages/*.md
├── papers/*.md
├── recipes/*.md                   one note per directory under the root `recipes/`
└── replication-experiments/*.md
```

Every Markdown file under a collection's glob is a typed note that must validate. The two exceptions
are named, not incidental: `content/meta/glossary.md` is excluded by the routing table and rendered
by its own page, and `content/environments/README.md` sits at the collection base where the
`*/index.md` pattern cannot reach it. Both hold no inventory — the notes carry the detail and the
site generates the list, because a hand-maintained second copy had already drifted from the tree
before it was retired.

A directory-shaped note owns its directory: the `index.md` is the note and its declared companions
are the files beside it. Nothing else belongs there.

## `recipes/`: build inputs, not content

Each recipe directory holds a `recipe.yaml`. Most also carry a local `pixi.toml` that exercises the
build; `topometry` is the exception, exercised by
`content/environments/topometry-1.1/pixi.toml` as the path dependency that fixture exists to test.
These build packages that conda does not yet carry, and several are the reason a fixture in
`content/environments/` can be graded at all.

They are not notes. Each is described by one, at `content/recipes/<slug>.md`, which links out to
these files rather than copying them — the manifest stays the authority on the name, the version,
the licence, and every dependency. The files stay here because a dozen fixture manifests reach them
as `../../../recipes/<slug>` path dependencies, which is also why the note is flat and declares no
companions: a companion describes a note's own directory. [[content-model]] owns that reasoning; a
round-trip test enforces the pairing in both directions.

## `site/`: the engineering surface

```text
site/
├── src/types/          one directory per note kind, plus the shared context
├── src/lib/            composition, registries, link adapters, presentation registries
├── src/pages/          routes
├── src/components/     domain furniture
├── src/layouts/        where the installed shell meets this site's identity
├── src/styles/         palette, type system, and the Tailwind source directive
├── tests/              corpus, contract, and built-output checks
├── scripts/            kind-manifest and cast command adapters
└── package.json        the toolchain and its commands
```

The site directory holds both the application and the content contract. That is intentional while
there is one TypeScript toolchain. The caster imports only filesystem-based modules from that tree,
not Astro runtime APIs. Extracting an instance package becomes worthwhile when another application
needs those contracts without depending on the Astro project.

## `casts/`: target policy and reproducible bundles

Each target directory owns a `_target.yml` declaring where bundles land, what its document is
called, where each reference kind is placed, and which runtime paths are forbidden. A bundle is
named for its source Mold and carries the generated document, packaged runtime references, and the
provenance record that connects every destination byte to its source.

The bundles are generated and committed. `pnpm cast <mold>` writes one, `pnpm casts` rewrites the
committed set, and `pnpm check:casts` re-derives that set without writing. Source notes and Kind
companion declarations remain authoritative: for example, an Environment's `pixi.toml` and present
`pixi.lock` are bundled because the Environment Kind says so, while a Mold's evaluation and scenario
companions stay in the Foundry because their disposition is `foundry-only`.

## `audit/`: committed citation evidence

The citation audit is reproducible offline because its provider answers are committed under
`audit/` beside the machine-readable run, rendered report, adjudications, and reviewed exclusions.
`audit-citations.config.json` stays at the root as the instance policy: which files belong to the
corpus, which scholarly hosts are trusted, and how live requests are bounded.

`@galaxy-foundry/audit-citations` owns extraction, provider normalization, comparison, and report
formats. This repository owns the configuration and acceptance decisions. The generated run and
report are checked by `site/tests/citation-audit.test.ts`; provider evidence is refreshed by the
scheduled workflow and reviewed through a pull request when its rendered verdict changes.

## Working drafts at the root

The Markdown files at the repository root — the vocabulary design draft, the top-down goals, the
resource map, the ecosystem-hardening list, the mold plans, and the two implementation reviews — are
working documents. They are dated, provisional, argue with themselves, and are not typed notes or
design records.

Their lifecycle is to be consumed. When a draft's conclusions land in a record or a note, the draft
loses that section; when nothing is left, the file goes. Keeping them at the root rather than under
`content/` is what makes that visible: nothing there validates, renders, or is linkable, so a claim
cannot quietly acquire the authority of a note by sitting in a directory that grants it.

## Generated and ignored material

`site/src/types/kinds.generated.json` is generated from the kind definitions and committed, because
its audience is cross-instance consumers who should not have to run this repository's toolchain.
The machine-readable citation run and its Markdown report are likewise generated and committed so
the offline gate and reviewers see the same verdict. Cast bundles are committed for the same reason:
the runtime consumer should not need the Foundry toolchain, while provenance and the cast drift gate
make their derivation reviewable. Every committed generated artifact has a check. If output cannot
be regenerated and checked, it is authored source and must not be labelled generated.

Uncommitted: `site/node_modules/`, `site/dist/`, `site/.astro/`, the pnpm store, and the `.pixi/`
and `output/` trees that pixi and rattler-build produce beside a recipe. Build output is derived, so
it is never source.

## Root contracts

`meta_tags.yml`, `reference_contract.yml`, and `audit-citations.config.json` are repository-wide
contracts rather than notes. They sit at the root because they are read from outside the site as
well as inside it, and because they are edited deliberately — adding a vocabulary value, changing
how a reference casts, or changing the audited corpus is a policy change with a corpus consequence,
not a free-form slug.

## Placement rules

- Put domain knowledge under `content/`, and give it a kind only when it should validate and render
  as an independent note.
- Put note contracts, routes, tests, and generators under `site/` while the site is their only
  consumer.
- Keep a file that is authority for something — a `pixi.toml`, a `recipe.yaml` — where it is
  executable, and link to it rather than restating its contents in prose.
- Put a target's policy and generated bundles together under `casts/<target>/`; keep their source
  knowledge under `content/`.
- Keep the provisional at the root, where it cannot be mistaken for the authored corpus.
- Do not create a placeholder top-level directory before a real artifact needs one.
- Add a new top-level owner only with code, an entry point, and a drift story.

Update this record when a top-level owner appears, a file class changes lifecycle, or a placement
rule changes.
