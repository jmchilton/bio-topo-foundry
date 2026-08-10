---
type: package
title: GUDHI
summary: The broadest general-purpose computational topology library, and the one whose effective license depends on which of its modules you use.
repository: https://github.com/GUDHI/gudhi-devel
languages:
  - C++
  - Python
software_license:
  status: declared
  id: LicenseRef-gudhi-mixed
tags:
  - method/persistent-homology
  - modality/point-cloud
---

# GUDHI

GUDHI is the widest general-purpose library in the field: simplex trees, Vietoris–Rips, alpha,
witness and cubical complexes, persistence in several forms, and a representations layer that turns
diagrams into vectors. A C++ core with a Python interface over it. Breadth is the point — it is
what you reach for before you know which complex your data wants.

Its role in this corpus is less as a tool than as a floor. Several fixtures depend on it rather
than reimplementing complex construction, and both clean-room featurizers written here —
[[open-topoqa-featurizer]] and [[open-topodockq-featurizer]] — build their filtrations with it. Very
little in the structure-QA path would exist without it.

## The license is not one license

This note carries `LicenseRef-gudhi-mixed` rather than an SPDX id, and the reason is worth stating
carefully because a reader skimming frontmatter will otherwise get it wrong.

GUDHI's own code is MIT. But many of its modules depend on third-party libraries that are not —
CGAL, Miniball, PyKeOps — and the project says so itself: its module list marks the affected
entries "MIT (GPL v3)", glossing that as *GUDHI code is MIT, but there is a dependency on GPL code,
so for practical purposes for a user it is as if this package was GPLv3*. The conda-forge build
declares the whole conjunction, MIT and BSD-3-Clause and MPL-2.0 and LGPL-3.0-or-later and
GPL-3.0-or-later, because that is what is actually inside the artifact.

So no single id is true. `MIT` would describe the source and misdescribe everything anyone installs;
any one copyleft id would misdescribe the parts that are permissive. A `LicenseRef` resolves
deny-by-default, which is the correct posture for a package whose terms depend on a choice the
consumer makes rather than on a field the publisher set.

That choice is not hypothetical here. Alpha complexes are a CGAL module, and alpha complexes are
what both featurizers use for their H1 and H2 bars. Our own code stays MIT and nothing about that
changes — but a locked environment or a container that ships GUDHI beside it is a distribution of
the whole, and carries the terms of what is inside. Engineering observation, not legal advice, and
the reason this note declines to simplify the field.

## What it is not

Not a machine-learning pipeline and not a scorer. The representations layer does vectorize
diagrams, but this corpus routes that question to [[persim]] instead, because separating the
computation of persistence from its representation keeps two different failure modes apart.

## In this corpus

[[gudhi-environment]] pins it straight from conda-forge with no recipe, which is why it is one of
the few L3 fixtures here. The technique is [[persistent-homology]]; [[persistent-homology]] itself
recommends it as the default when the right complex is not yet known.
