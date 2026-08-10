---
type: package
title: giotto-tda
summary: The scikit-learn-shaped TDA toolkit at the head of the Giotto family — and the corpus's clearest case of a license that constrains how software may be served.
repository: https://github.com/giotto-ai/giotto-tda
languages:
  - Python
  - C++
software_license:
  status: declared
  id: AGPL-3.0-or-later
tags:
  - method/persistent-homology
  - method/mapper
  - modality/point-cloud
---

# giotto-tda

giotto-tda's organizing idea is that topological features should arrive as scikit-learn transformers
and nothing else should have to change. Filtrations, persistence, diagram vectorizations, Mapper,
time-series embeddings, and cubical persistence for images are all `fit`/`transform` objects that
drop into a `Pipeline` beside a scaler and a classifier, with `GridSearchCV` able to tune the
topology alongside everything else.

That is a real contribution rather than sugar. It puts topological features under the same
cross-validation discipline as every other feature, which is the setting where inflated claims about
topological signal usually come apart.

It is also the head of a family rather than a single library. Persistence is computed by
[[giotto-ph]], directed complexes by [[pyflagser]], and both are declared dependencies. Profiling
the three separately is not a filing decision — they are three repositories with three licenses and
three build stories, and the interesting facts differ across them.

## Different governance from the other family here

The scikit-tda stack is an academic volunteer project under a permissive license. Giotto is not: it
comes from L2F SA together with EPFL's Laboratory for Topology and Neuroscience and HEIG-VD's REDS
institute, it is AGPL, and the README says plainly that a different distribution license can be
arranged by contacting L2F. That is a dual-licensing posture — company-backed, copyleft by default,
commercial terms on request — and it is a different thing to depend on than a volunteer MIT
library, in both directions. There is someone to ask, and there is a reason you might have to.

## Why the AGPL is the live question here

Every other copyleft library in this corpus asks about *distribution*: ship it, ship the notice and
the source. The AGPL adds one more term, and it is the term aimed squarely at what a Foundry does.
A user who interacts with a modified version **over a network** must be offered its source, whether
or not anything was ever distributed to them.

Running a stock giotto-tda behind a web-facing tool does not by itself trip that — the clause is
about modified versions — but the two things a Foundry routinely does are patch things and expose
them over a network. A local fix to make a build work, carried in a recipe and served through a
public tool, is exactly the case the clause was written for. The answer is not difficult; it is just
one that has to be given rather than assumed, and it is why the license row for the AGPL in this
Foundry's policy spells the network term out instead of treating it as GPL with a longer name.

None of this makes the library harder to redistribute than the GPL ones beside it. It makes the
obligation attach to an act — serving — that the others leave alone.

## In this corpus

[[giotto-tda-environment]] is the deliberate **L0** fixture, and the reason is packaging rather than
licensing: giotto-tda is wheel-only on PyPI, with no sdist and no conda package, so the manifest
reaches it through `[pypi-dependencies]` and falls out of the biopixi profile entirely. A second
resolver leaves nothing with a conda identity for a recipe or a mulled target string to name.
Adding a recipe and switching to a path dependency would promote it to L1, exactly as its sibling
[[giotto-ph]] already has. Nothing about the software prevents that; nobody has done it.

Keeping one fixture at L0 on purpose is what makes the grade mean something — a ladder whose bottom
rung is always empty is not measuring anything.
