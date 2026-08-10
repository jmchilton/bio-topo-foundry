---
type: package
title: tadasets
summary: Synthetic point clouds whose homology is known in advance — the shapes a TDA implementation is checked against.
repository: https://github.com/scikit-tda/tadasets
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# tadasets

tadasets generates the shapes the field tests against: a torus, a *d*-sphere at arbitrary dimension,
a swiss roll, an infinity sign, eyeglasses. Each generator takes a noise level and can embed its
output in a higher ambient dimension. It is a few hundred lines over numpy, and it is the smallest
package profiled in this corpus by a wide margin.

Its importance is out of proportion to its size, because these are the point clouds whose answer you
already know. A torus has one component, two independent loops, and one void. A *d*-sphere has one
component and one *d*-dimensional feature and nothing between. Run a persistence implementation on
them and the barcode either shows that or it does not, and if it does not you have found a bug
rather than a discovery. Noise and ambient dimension are the knobs that turn a sanity check into an
actual test — a barcode that is right at zero noise in three dimensions and wrong at moderate noise
in twenty tells you something specific about the implementation.

For a foundry whose work is largely verification, that is a load-bearing dependency and not a
convenience. It is also why the two clean-room featurizers written here — where no bit-exact oracle
against the original implementation was available — lean on ground-truth geometry for the parts of
correctness that can be checked absolutely.

## In this corpus

tadasets is the only package here with no fixture of its own; it is a dependency, and the notes
about it are about closing that dependency. It has no conda package at all, which blocked two
closures at once — the [[scikit-tda]] bundle needed it transitively, and [[petls-pytorch]] declared
it as a runtime dependency until our upstream contribution demoted it to a benchmark extra.
[[tadasets-recipe]] supplies it, verified green, and is the one recipe in this corpus with a pull
request open against a public channel; when that lands, this package stops being a gap.
