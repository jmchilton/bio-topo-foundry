---
type: recipe
title: r-tda
summary: The established general-purpose R package for the field, packaged from CRAN with a compiled dependency set that is still a best guess.
gap: absent
build:
  status: unverified
upstreaming: eligible
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# r-tda

`TDA` is the general-purpose R package for the field, and it carries statistical machinery the
Python stack tends not to — confidence bands, bootstrap inference on diagrams. It matters here
because a great deal of bioinformatics is written in R, and a Python-only corpus would quietly
exclude it. See [[r-tda-environment]].

It is on CRAN and on no conda channel — not conda-forge, not bioconda, not the `r` channel — so
this recipe is what makes the fixture installable at all.

**This one has never been built, and unlike the others that is not merely an oversight.** The
package is `NeedsCompilation: yes`, linking against BH, Rcpp, and RcppEigen with gmp and `make` as
system dependencies, and the host dependency set here was modelled on the r-designit recipe plus
CRAN metadata rather than derived from a real build. The recipe says so itself. A `rattler-build`
run is the only thing that will confirm it, and it is more likely to find something than the
pure-Python entries are. [[r-tdastats-recipe]], the compiled R sibling, does build green, which is
mild evidence the general shape is right.
