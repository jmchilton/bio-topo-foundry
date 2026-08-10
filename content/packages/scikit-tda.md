---
type: package
title: scikit-tda
summary: The umbrella package for the Python TDA stack — it implements nothing, and asserts that its members work together.
repository: https://github.com/scikit-tda/scikit-tda
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - method/mapper
  - modality/point-cloud
---

# scikit-tda

scikit-tda is a bundle. Installing it brings in [[ripser-py]], [[persim]], [[kmapper]] and
[[tadasets]] together, on the premise that someone arriving at topological data analysis without a
topology background should not have to work out which four packages they need before they can run
anything. Started by Nathaniel Saul and Christopher Tralie in 2019, it names the organization that
maintains all of them.

The design is worth stating plainly because it is the useful thing about it: each member stands
alone. The bundle wraps independent libraries rather than vendoring them, so nothing here forces an
all-or-nothing adoption, and a project that wants only diagram distances installs only persim.

## What a metapackage does and does not promise

A bundle's implicit claim is compatibility — that these versions of these packages work together.
scikit-tda's dependency list carries essentially no upper bounds, so the claim is weaker than the
packaging suggests: it asserts *these are the members*, and leaves *these versions cohere* to the
solver and to whatever happens to be current the day you install. That is normal for umbrella
packages and it is not a defect, but it means the bundle is a convenience rather than a tested
configuration, and a foundry that wants the latter has to pin the members itself.

The bundle also lags its members. It is a thin repository with far fewer commits than any package
inside it, which is what you would expect and is worth knowing before reading its release date as a
signal about the health of the stack.

## The install that does not install

The one thing scikit-tda exists to do — bring the stack in with a single install — is the thing it
cannot do from conda channels alone, because [[tadasets]] is on no channel. Every other member
resolves; the smallest and least consequential one does not, and the umbrella inherits the gap.

That inversion is why the corpus put its packaging effort where it did. Submitting tadasets to
conda-forge is a smaller piece of work than anything else in this family and it unblocks the whole
bundle.

## In this corpus

[[scikit-tda-environment]] is the fixture to reach for when the question is whether the ecosystem
coheres rather than whether one engine is fast. It sits at L1 behind [[scikit-tda-recipe]] — which
is the one recipe here that has never been built, so its status is *plausible* rather than
*verified* — and behind [[tadasets-recipe]], which has a pull request open. The techniques are
[[persistent-homology]] and Mapper.
