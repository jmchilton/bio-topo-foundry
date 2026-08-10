---
type: package
title: pyrivet
summary: The Python interface to RIVET — it builds bifiltrations and shells out to the console engine, which is why it can install perfectly and compute nothing.
repository: https://github.com/rivetTDA/rivet-python
languages:
  - Python
software_license:
  status: declared
  id: BSD-3-Clause
tags:
  - method/multiparameter-persistence
  - modality/point-cloud
---

# pyrivet

pyrivet is how [[rivet]] reaches a script. It constructs bifiltrations, hands them to
`rivet_console` as input, parses what comes back, and gives Python objects for the module's
invariants and for the barcodes of slices through it. There is no computation here — every number it
returns was produced by a subprocess.

That is a perfectly reasonable architecture for wrapping a C++ engine with no library API, and it
carries one consequence worth stating plainly, because this corpus learned it the hard way.

## Installability and usability are different properties

pyrivet imports cleanly with no engine present. Nothing in a normal packaging check — build, import,
`pip check` — touches the subprocess, so all of them pass on an installation that cannot compute
anything at all. The corpus calls this a **hollow green**, and this package is where it was found:
an earlier [[pydowker-environment]] passed its check while `rivet_console` was on no package index
anywhere.

The lesson generalizes past this package. Any wrapper that reaches its engine through `PATH` rather
than through a linked library has a verification gap that import-based testing cannot see, and the
only check that closes it is one that executes the thing. The fixture now runs `rivet_console
--help` and imports the module that actually needs it.

## Packaging notes

It is on neither PyPI nor any conda channel, and it carries no git tags, so [[pyrivet-recipe]] pins
a commit and feeds `setuptools_scm` a pretend version — an archive has no VCS for it to read.

BSD-3-Clause and pure Python, so nothing about this package blocks publication. What blocks it is
the engine: publishing a wrapper whose dependency is unavailable would ship the hollow green to
everyone else.

## In this corpus

The middle link of the three-recipe chain — [[rivet-recipe]] below it, [[pydowker-recipe]] above —
that [[pydowker-environment]] stages, and the easiest build of the three. The technique is
[[multiparameter-persistence]].
