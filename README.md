# TDA Bioinformatics Foundry

The Topological Data Analysis Bioinformatics Foundry — a knowledge base connecting topological data
analysis research and software to reproducible bioinformatics environments, Galaxy tools, workflows,
and training.

Site: <https://jmchilton.github.io/bio-topo-foundry/>

## Built on the Foundry Pattern

This repository is one instance of the
[**Foundry Pattern**](https://github.com/galaxyproject/foundry-pattern) — the stack-independent
design pattern behind a knowledge base that compiles itself into frozen, provenance-carrying agent
artifacts. Its case, in a line: *agent skills should be a packaging format, not a source format*. A
skill is a compile target cast from an inspectable corpus, and the corpus rather than the skill is
the source of record.

The substrate is shared with the pattern's other instances — the knowledge base, Mold → Cast →
provenance, and the human-readable reading surface. What varies is what a domain extends it with.
This is the third instance, and it adds three things this domain forced into existence: replication
as a first-class evidence-bearing kind, licensing typed on the note with deny-by-default resolution,
and a packaging kind for the builds no channel supplies.
[Architecture](https://jmchilton.github.io/bio-topo-foundry/design/architecture/) tells the
inherited-versus-added story in full.

Read the pattern: <https://galaxyproject.github.io/foundry-pattern/>

## Why

Topological data analysis has a large and growing bioinformatics literature, and a link list of the
software implementing it is easy to produce and nearly useless. What is hard to find out is whether
any of it installs, whether it may be redistributed, and whether its published numbers hold up.

Those three questions are the ones this repository answers as data rather than as prose.

**Installing is a measurement.** A writeup of a tool is not knowledge about the tool until something
can run it, so every method worth keeping becomes a pixi environment graded on the biopixi L0–L4
portability ladder, and a conda recipe where the public channels carry nothing recent enough.
Building them surfaced unsolvable dependency closures, absent channels, a build needing `cmake <4`,
and a package name already taken by something unrelated — none of which reading would have found.

**An article licence is not a software licence.** They are separate grants, and which one a tool has
decides whether it can be redistributed at all. The flagship TDA tools here are overwhelmingly
described by openly licensed papers and shipped as software that grants nothing. So a licence is a
typed field on a note where `missing` is a declared value rather than an omitted one, and where a
method is sound but its implementation is unredistributable, the remaining move is to reimplement it
from the published description.

**Re-running published work finds things reading does not.** Replication here has already turned up
a released scorer feeding `(x, y, y)` where it meant `(x, y, z)`, and a manifold toolkit whose
seeded layouts do not reproduce. Neither was visible from the paper, the code, or the released
numbers.

Being organised around a family of techniques is also the surest way to over-credit them, so the
correction is structural: a comparative claim needs a matched non-topological baseline under the
same split and a stated metric, or it is not made here.

## What's here

The domain spine is **frontier → hardening → delivery**, and it is an atlas rather than a gate — a
note may sit anywhere along it, and most sit early.

- **Frontier** — what the field has published: [methods](https://jmchilton.github.io/bio-topo-foundry/methods/),
  [papers](https://jmchilton.github.io/bio-topo-foundry/papers/), the
  [packages](https://jmchilton.github.io/bio-topo-foundry/packages/) implementing them, and
  [replication experiments](https://jmchilton.github.io/bio-topo-foundry/replication-experiments/)
  that re-run a paper's reported numbers rather than merely executing its code.
- **Hardening** — what it takes to run that work: graded
  [environments](https://jmchilton.github.io/bio-topo-foundry/environments/) and the
  [recipes](https://jmchilton.github.io/bio-topo-foundry/recipes/) that build what no channel ships.
- **Delivery** — what someone else uses without knowing any of this happened:
  [Molds](https://jmchilton.github.io/bio-topo-foundry/molds/), which state an analysis procedure and
  declare typed references to the knowledge it needs, then cast into self-contained agent artifacts.

The site is the inventory; this file deliberately holds no list of notes. How the corpus is
represented — kinds, frontmatter, links, references — is owned by the
[design records](https://jmchilton.github.io/bio-topo-foundry/design/), which are themselves typed
notes and therefore checked.

## Read it locally

```sh
cd site
pnpm install
pnpm dev
```

That is the reader, not a check. Changing anything here has its own gate, described in
[`AGENTS.md`](AGENTS.md).

## Status

Real today: a corpus of method, paper, package, and recipe notes; pixi environments graded by
biopixi; rattler-build recipes for packages conda does not carry; three replication experiments;
one Mold, casting to one target; and a validation gate that includes citation identity checked
against committed provider evidence.

Deliberately absent, and named rather than described: no Galaxy tool or workflow kinds, no training
material, no original scholarship of our own, and no second cast target. Delivery is the least built
of the three ends, which is worth saying plainly — a Foundry that stops after packaging is a
distribution channel.

The replication corpus is honestly incomplete under its own rule, which requires a named environment
to have produced the recorded evidence before a study may call itself complete.

## Licensing

This repository is MIT licensed; see [`LICENSE`](LICENSE).

That grant covers this repository's own contents. The `license` field on a package, paper, or recipe
note is typed data *about upstream* — a recorded fact concerning someone else's software or article,
never a grant made by this repository. Where a note records `missing`, it means that upstream
software grants nothing, and nothing here changes that.

## Related work and design

[Positioning](https://jmchilton.github.io/bio-topo-foundry/design/positioning/) covers the nearest
neighbours — scikit-tda, TopoX, the Topology ToolKit, TopoPilot, Bioconda — and what this Foundry
refuses to be. [Architecture](https://jmchilton.github.io/bio-topo-foundry/design/architecture/) is
the door to the rest of the design records.

Working in the repository: [`AGENTS.md`](AGENTS.md).
