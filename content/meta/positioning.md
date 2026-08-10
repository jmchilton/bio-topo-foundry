---
type: meta
title: Positioning
summary: A knowledge base connecting TDA research and software to reproducible bioinformatics environments, Galaxy tools, workflows, and training.
record_kind: foundation
order: 1
status: revised
created: 2026-08-08
revised: 2026-08-09
revision: 3
tags:
  - meta
---

# Positioning

A knowledge base connecting topological data analysis research and software to reproducible
bioinformatics environments, Galaxy tools, workflows, and training.

Three kinds of work sit behind that sentence — understanding what the field has published, making it
installable, and turning it into something a person or an agent can use. [[guiding-principles]]
turns them into design pressure; [[architecture]] turns them into a map.

## Frontier

We read the literature and write it down in a form that stays navigable: method notes for the
techniques, paper notes for the surveys and foundational results, package notes for the software
that implements them. The organising question is which mathematics actually earns its place against
which biological problem — persistent homology and Mapper are decades old and public, so what is
genuinely unsettled is where they beat the ordinary alternative and where they only look like they
do. We also re-run published work: [[replication-experiments]] recreate a paper's reported numbers
rather than merely executing its code, and doing that here has already found defects that survived
peer review — see [[topoqa-interface-quality]] and [[topometry-cell-cycle]]. Original scholarship of
our own belongs at this end too, and does not exist yet.

## Hardening

Reading a tool is not running it, so every method worth keeping has to become an install. That means
conda recipes where the public channels carry nothing, or nothing recent enough for the API the
paper describes; pixi environments graded by biopixi on the L0–L4 portability ladder, so that
"it runs" is a measured claim rather than an assertion; and licensing handled as a fact recorded on
the note. Licensing is the part people underestimate. The flagship TDA tools in bioinformatics are
overwhelmingly described by openly licensed articles and shipped as software that grants nothing —
an article licence and a software licence are separate grants, and which one a tool has decides
whether it can be redistributed at all. Where a method is sound and its implementation is
unredistributable, the remaining move is to reimplement it from the published description.

## Delivery

The far end is what someone else uses without knowing any of this happened: Galaxy tools and
workflows, training material, and agent-runnable analysis procedures — Molds that state what to do
and declare typed references to the knowledge that doing it would need. This is the least built of
the three. One Mold exists, [[score-docking-poses]], and it casts to a Claude skill; there are no
Galaxy kinds, no wrappers, and no training material yet. Naming the gap is deliberate: a Foundry
that stops after packaging is a distribution channel.

Nothing enforces progression along that arc. A note may sit anywhere on it, most sit early, and no
kind requires a downstream kind to exist — the maturity of a note is visible from its own typed
fields, which is a more honest answer than a gate nothing could pass on day one.

## Related efforts

Surveyed from public sources rather than checked tool by tool, so read this as orientation and not
as the verified prior-art comparison the sibling Foundries carry.

- **scikit-tda** — the nearest curated hub, and an active one: a home for Python TDA libraries aimed
  at non-topologists. It curates and documents. It does not package for conda, grade environments,
  or re-run published results — this Foundry carries [[scikit-tda-recipe]] precisely because
  conda-forge does not.
- **TopoX and the ICML Topological Deep Learning Challenges** — the closest thing to replication as
  a community output, with participants contributing open implementations of published topological
  neural networks. Scoped to topological deep learning and to implementing methods, rather than to
  reproducing a paper's numbers or delivering into a bioinformatics platform.
- **The Topology ToolKit** — a mature TDA library delivered inside a visualization application. It
  is the delivery model this Foundry wants, hosted somewhere else.
- **TopoPilot** — an agentic framework that drives TDA and visualization workflows over MCP, with a
  verifier checking the plan before it runs. The nearest thing to the agent half of delivery, but it
  automates a tool rather than curating what an agent should know about the field.
- **`awesome-tda`-style link lists** — broad coverage, no facts attached: no licence status, no
  build evidence, no environment.
- **Bioconda and conda-forge** — substrate rather than comparison. TDA coverage is partial, which is
  the reason recipes exist here at all.

Nothing found combines the four things this Foundry is trying to hold together: a bioinformatics
focus, licence status as typed data, graded executable environments, and evidence from re-running
the work.

## What this is not

- **Not a TDA textbook.** A method note makes the corpus navigable and says which packages implement
  what. The papers teach the mathematics and are linked.
- **Not a mirror of upstream documentation.** A `recipe.yaml` and a `pixi.toml` stay the authority on
  names, versions, and dependencies; no note restates them.
- **Not an advocate for topology.** A comparative claim needs a matched non-topological baseline
  under the same split and a stated metric, or it is not made here. A Foundry built around a
  technique is exactly where that discipline would otherwise slip.
