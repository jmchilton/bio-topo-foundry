# Persistent combinatorial Laplacians: literature and implementation review

**Date:** 2026-07-30  
**Scope:** Feasibility review for [bio-topo-foundry issue #2](https://github.com/jmchilton/bio-topo-foundry/issues/2)  
**Bottom line:** Do not start a new implementation yet. An Apache-2.0 Python package,
[`petls-pytorch`](https://github.com/Sylverity/petls-pytorch), now provides the core
operation and nearly all of the proposed API surface. It is callable today with
`Complex`, `Rips`, and `Alpha`. It is also very new, dense-matrix-oriented, lightly
adopted, and not demonstrably compliant with issue #2's stricter **paper-only** clean-room
rule. The next piece of work should be a bounded adoption/validation spike, not a fresh
package.

## Executive answer

The ecosystem-gap premise in issue #2 was true before June 2026 but is no longer strictly
true:

- [`petls-pytorch` 1.0.2](https://pypi.org/project/petls-pytorch/) was released on
  2026-06-29. It is a pure-Python/PyTorch package under Apache-2.0 with a universal wheel,
  a GUDHI-backed Rips constructor, a GUDHI-backed alpha constructor, a generic filtered
  boundary-matrix core, the Mémoli-Wan-Wang Schur complement, spectra/eigenpairs, directed
  flag complexes, rank-one sheaves, and the top-dimensional flip optimization.
- The direct calls are already present:

  ```python
  from petls_pytorch import Alpha, Complex, Rips

  rips = Rips(points=points, max_dim=1, threshold=max_distance)
  L01 = rips.get_L(dim=0, a=scale_a, b=scale_b)
  eigenvalues = rips.spectra(dim=0, a=scale_a, b=scale_b)

  # For alpha H1, retain triangles: max_dim must be at least 2.
  alpha = Alpha(points=points, max_dim=2)
  L11 = alpha.get_L(dim=1, a=scale_a, b=scale_b)
  ```

- No similarly direct persistent-Laplacian call was found in GUDHI, giotto-tda, Ripser,
  TopoNetX, SciPy, or PyTorch itself. TopoNetX supplies the **ordinary** Hodge Laplacian,
  while GUDHI supplies filtered complexes and simplex boundaries. Those remain good
  building blocks for an independent implementation, but they do not eliminate the
  persistent restriction/Schur-complement work.
- The older reusable alternatives are materially weaker:
  HERMES is MIT but is a C++/MATLAB command-line research program; the ICML 2023
  `PersistLap` code has the desired Python functions but no declared license; PETLS is the
  broadest reference implementation but still has no software license.

The recommendation is therefore:

1. **Evaluate `petls-pytorch` as an external Apache-2.0 dependency.**
2. **Do not copy or fork it into an MIT-only package without preserving Apache-2.0 and its
   `NOTICE`.**
3. **Resolve whether issue #2's paper-only clean-room requirement applies to dependencies.**
   If it does, `petls-pytorch` is not a clean fit; use it only as a black-box oracle and
   implement the small MIT/SciPy core in a separately isolated clean-room effort.

## Mathematical lineage

### Ordinary combinatorial Hodge Laplacian

For boundary matrices \(B_k:C_k\rightarrow C_{k-1}\), the unweighted combinatorial
Laplacian is

\[
L_k=B_k^\top B_k+B_{k+1}B_{k+1}^\top.
\]

Its kernel is isomorphic to \(H_k\), so nullity recovers the \(k\)-th Betti number. This is
the stable, well-supported part of the proposed work. TopoNetX exposes
[`SimplicialComplex.hodge_laplacian_matrix`](https://pyt-team.github.io/toponetx/api/generated/toponetx.SimplicialComplex.html)
and the associated incidence, up-, and down-Laplacian matrices.

### Persistent spectral graph and persistent Laplacian

[Wang, Nguyen, and Wei (2020)](https://doi.org/10.1002/cnm.3376) introduced the practical
persistent spectral graph construction. It adds nonzero spectral information to the
harmonic spectrum that recovers persistent homology. Their software successor,
[HERMES](https://doi.org/10.3934/fods.2021006), implements alpha and Vietoris-Rips
filtrations and dimensions 0 through 2.

For \(K_a\subseteq K_b\), the persistent operator acts on \(C_k(K_a)\) but may use
\((k+1)\)-chains from \(K_b\) whose boundary lies in \(C_k(K_a)\):

\[
L_k^{a,b}
=
B_{k+1}^{a,b}(B_{k+1}^{a,b})^\top
+
(B_k^a)^\top B_k^a.
\]

The important point is that \(B_{k+1}^{a,b}\) is not generally a column slice of the later
boundary matrix. A linear combination of later \((k+1)\)-simplices may cancel all later
\(k\)-faces and leave a boundary supported at \(a\).

[Mémoli, Wan, and Wang (2022)](https://doi.org/10.1137/21M1435471) established the
nullity/persistent-Betti correspondence and derived the generalized Schur-complement
construction. If the later up-Laplacian is partitioned with the \(k\)-simplices present at
\(a\) first,

\[
L_{k,\mathrm{up}}^b =
\begin{pmatrix}
A & B \\
C & D
\end{pmatrix},
\qquad
L_{k,\mathrm{up}}^{a,b}=A-BD^\dagger C.
\]

That identity reduces the central algebraic problem to matrix assembly, a Moore-Penrose
solve, and numerical safeguards around a positive-semidefinite \(D\).

### Evidence for usefulness

The strongest general data-science evaluation is
[Davies, Wan, and Sánchez-García (ICML 2023)](https://proceedings.mlr.press/v202/davies23c.html).
It extends persistent Laplacians to cubical complexes and reports that persistent-Laplacian
features outperform persistent homology on its MNIST and MoleculeNet tasks. This is useful
evidence that the positive spectrum can add signal, but it is not a universal result and
does not resolve complex, filtration, scale-pair, or solver selection.

The broad packaging reference is
[Jones and Wei's PETLS paper](https://arxiv.org/abs/2508.11560). PETLS unifies generic
filtered boundary matrices, Rips, alpha, directed flag, Dowker-through-GUDHI, and
rank-one sheaf paths. It is the appropriate numerical oracle for small fixtures, but
[`bdjones13/PETLS`](https://github.com/bdjones13/PETLS) still has no detected software
license. It should not be copied, modified, redistributed, or made a required distributable
dependency without upstream licensing.

## Software landscape

| Candidate | License | Direct persistent-Laplacian call? | Scope | Assessment |
|---|---|---:|---|---|
| [`petls-pytorch` 1.0.2](https://pypi.org/project/petls-pytorch/) | Apache-2.0 | **Yes** | Generic boundaries, Rips, alpha, directed flag, rank-one sheaf; matrices and spectra | Best adoption candidate; very new and dense-oriented |
| [`PETLS` 1.0.1](https://pypi.org/project/petls/) | None detected | **Yes** | Broad C++/Python reference implementation | Black-box oracle only until licensed |
| [`HERMES`](https://github.com/wangru25/HERMES) | [MIT](https://github.com/wangru25/HERMES/blob/main/LICENSE) | Yes, executable | Alpha/Rips; dimensions 0-2; fixed persistence offset | Useful independent oracle; not a Python library call; MATLAB/CGAL build |
| [ICML 2023 code / “PersistLap”](https://github.com/tomogwen/persistentlaplaciandatascience) | None detected | Yes, functions in `src/perslap.py` | Simplicial and cubical pair computation and vectorization | Scientifically relevant, but not reusable as open-source code without a license |
| [`persistent_sheaf_Laplacians`](https://github.com/weixiaoqimath/persistent_sheaf_Laplacians) | None detected | Specialized | Persistent cellular sheaves | Later-scope reference, not a reusable core |
| [TopoNetX](https://github.com/pyt-team/TopoNetX) | MIT | **No** | Ordinary incidence/Hodge/up/down Laplacians; GUDHI conversion | Strong building block or independent baseline |
| [GUDHI](https://github.com/GUDHI/gudhi-devel) | MIT overall; dependency/module details vary | **No** | Rips/alpha/simplex trees, filtration, simplex boundaries, PH | Preferred complex-construction and PH-validation layer |
| SciPy / NumPy | BSD | **No** | Sparse matrices, solvers, pseudoinverse, eigensolvers | Preferred numerical layer for a small CPU-first independent core |

No evidence was found that giotto-tda, Ripser, Dionysus, or scikit-tda exposes a persistent
combinatorial Laplacian. They compute persistence or vectorize persistence outputs, not
the two-parameter Hodge operator.

## Detailed assessment of `petls-pytorch`

### What it covers

At pinned commit
[`163142b`](https://github.com/Sylverity/petls-pytorch/tree/163142b278cfcd5e87e2d801beedf767bd3a6059),
the package covers more than issue #2's initial scope:

- generic `Complex(boundaries, filtrations)`;
- GUDHI-backed `Rips` and `Alpha`;
- `get_up`, `get_down`, and `get_L`;
- single, batched, successive, and all-pairs spectra;
- eigenvalues and eigenvectors;
- directed flag complexes;
- rank-one persistent sheaf Laplacians;
- top-dimensional flipped spectra;
- storage, summaries, timing, and plotting;
- CPU and CUDA devices.

The PyPI artifacts are a 38.7 kB universal pure-Python wheel and a source distribution.
Both were published through PyPI trusted publishing with provenance tied to the tagged
GitHub commit. This is much more portable than PETLS's native-extension distribution.

### Independent audit performed for this review

The repository was cloned at the 1.0.2 tag without inspecting PETLS's source.

- The default non-PETLS suite completed with **48 passed, 21 skipped** on CPython 3.13.
  The skips matter: tests requiring the original PETLS package are not run by the default
  GitHub Actions workflow.
- A hand-built filled-triangle fixture gave ordinary \(H_1\) nullity 1 before the face
  appeared and persistent nullity 0 after it appeared.
- A central-restriction fixture was constructed from a square cycle at \(a\), followed at
  \(b\) by a diagonal and two triangles. The two triangle boundaries cancel the new
  diagonal, so their sum fills the old square. The implementation produced a rank-one
  persistent up-Laplacian and changed \(L_1^{a,b}\) nullity from 1 to 0 as required.
- Direct Rips and alpha constructor smoke tests produced symmetric spectra with the
  expected connected-component nullities.
- The package's standard CPU benchmark completed **78/78** cases with no skips on the
  audit host: 2.49 s aggregate trial time, 2.86 s complex construction, and a largest
  matrix of 2399 by 2399. This did not compare against PETLS and is not a scaling study.

CUDA, Windows, and full PETLS parity were not independently run.

### Material limitations

1. **Very low maturity.** The repository was created on 2026-06-25, has one contributor,
   zero stars, zero forks, no downstream evidence, and no accompanying peer-reviewed
   software paper. All three releases occurred within five days.
2. **Reference coverage is opt-in.** The README reports 65 PETLS parity tests, but the
   default CI does not install PETLS. Entire alpha, Rips, and directed-flag parity modules
   are skipped unless a developer manually supplies it.
3. **Dense persistent matrices.** Boundary storage begins sparse, but the Gram matrices,
   Schur blocks, persistent Laplacian, and default eigensolve are dense. Even the SciPy
   “sparse” eigensolver is called only after the dense Laplacian has been assembled.
   Memory is therefore \(O(n_k^2)\), with full spectra roughly \(O(n_k^3)\). CUDA speeds
   dense eigendecomposition; it does not remove this scaling limit.
4. **Default single precision.** Dense and sparse tensors default to `float32`, with
   advertised parity tolerances of `atol=1e-4`, `rtol=1e-3`. Validation should exercise
   `float64`, near-singular Schur blocks, and nullity thresholds explicitly.
5. **Pseudoinverse path.** The code first tries a Cholesky solve and falls back to
   `torch.linalg.pinv` for singular semidefinite blocks. This is mathematically sensible
   but makes tolerance and conditioning policy part of the public scientific contract.
6. **Heavy dependency for CPU-only use.** PyTorch is required even when SciPy/NumPy would
   suffice. This may be acceptable for TopoDockQ-style ML pipelines but is a packaging and
   environment cost for a small TDA utility.
7. **Constructor semantics need tests.** Rips builds one simplex dimension above the
   requested Laplacian dimension. Alpha treats `max_dim` as the retained simplex
   dimension, so alpha \(H_1\) needs `max_dim >= 2` to retain the triangles that kill
   cycles.
8. **No stable sparse API.** The best long-term scientific engine may still need a
   SciPy/Eigen sparse Schur-complement implementation even if this package is adopted for
   initial correctness and GPU workflows.

### Clean-room/provenance caveat

The package says it was independently implemented from the PETLS paper, public API, and
documentation and contains no PETLS source code. That claim supports ordinary dependency
adoption, but it does not meet issue #2's stricter process on its face:

- [`tests/conftest.py`](https://github.com/Sylverity/petls-pytorch/blob/163142b278cfcd5e87e2d801beedf767bd3a6059/tests/conftest.py)
  labels two fixtures as exact boundary matrices and filtrations from a PETLS test source
  file;
- the test suite imports PETLS directly for reference parity;
- comments throughout the implementation describe matching particular C++ behavior.

This is not evidence that implementation source was copied, and tiny numeric fixtures may
not be protectable expression. It is, however, evidence that the author was not isolated
from PETLS's source tree in the paper-only sense specified by issue #2.

This creates two distinct questions:

- **Can Foundry depend on an Apache-2.0 package?** Normally yes, provided its license and
  notices are preserved and its transitive dependencies are reviewed.
- **Can it be represented as the paper-only clean-room deliverable requested by issue
  #2?** Not without relaxing that provenance requirement or obtaining a clearer provenance
  record.

This review is technical, not legal advice. If the distinction is load-bearing, record a
project-level licensing decision before adoption.

## Existing-library fallback if strict clean-room isolation is retained

If `petls-pytorch` is rejected on provenance, a new core still should not start from zero.
The narrowest independent stack is:

1. **GUDHI** for Rips/alpha construction, filtration order, simplex enumeration, and
   persistent-Betti validation.
2. **TopoNetX** optionally for ordinary incidence and Hodge-Laplacian cross-checks.
3. **SciPy sparse matrices** for \(B_k\), slicing, Gram products, and partial spectra.
4. **NumPy/SciPy dense fallback** for small generalized Schur complements.
5. **PETLS and HERMES only as executed black-box numerical oracles**, never as source
   material.

The original implementation surface can then remain small:

- canonical filtered boundary representation and validation;
- \(L_k^a\);
- block extraction for \(L_{k,\mathrm{up}}^b\);
- \(A-BD^\dagger C\);
- stable symmetric eigensolver dispatch;
- Rips and alpha adapters;
- tests derived only from published examples and independently designed complexes.

The work should be assigned to a person or isolated agent that has not inspected PETLS or
`petls-pytorch` implementation source.

## Recommended decision and next experiment

**Recommendation: change issue #2 from “implement a package” to “qualify
`petls-pytorch`, then implement only demonstrated gaps.”**

A one- to two-day qualification spike should produce:

1. a pinned environment for `petls-pytorch==1.0.2`;
2. a license inventory including Apache `NOTICE`, PyTorch, GUDHI, and the alpha/CGAL path;
3. independent paper-derived algebraic fixtures, including a true boundary-cancellation
   Schur case;
4. property tests:
   \(B_kB_{k+1}=0\), symmetry, positive semidefiniteness,
   \(L_k^{a,a}=L_k(K_a)\), orientation-invariant spectra, and
   nullity \(=\beta_k^{a,b}\);
5. black-box numerical diffs against PETLS and, where possible, HERMES;
6. float32/float64 conditioning and nullity-threshold experiments;
7. a TopoDockQ-sized workload measuring construction time, dense-memory peak, and partial
   spectrum time;
8. an explicit go/no-go decision:
   depend upstream, contribute fixes upstream, maintain an Apache-compatible fork, or
   commission the isolated MIT/SciPy core.

### Acceptance gate for direct adoption

Adopt `petls-pytorch` for the first Foundry pipeline if all of the following hold:

- Apache-2.0 and the provenance history are acceptable to the project;
- independent persistent-Betti/nullity tests pass in float64;
- the TopoDockQ feature workload fits memory with an adequate margin;
- alpha \(H_1\) and Rips \(H_0\) reproduce the intended filtration conventions;
- outputs match the local PETLS oracle within a documented tolerance;
- the package can be installed reproducibly on the target Galaxy/Bioconda platform.

If those gates pass, issue #2's core implementation is already available and Foundry should
spend effort on validation, sparse scaling, packaging, and scientific integration rather
than duplicating it.

## Selected primary sources

1. Wang R, Nguyen DD, Wei G-W. “Persistent spectral graph.”
   *International Journal for Numerical Methods in Biomedical Engineering* 36, e3376
   (2020). [DOI](https://doi.org/10.1002/cnm.3376)
2. Wang R et al. “HERMES: Persistent spectral graph software.”
   *Foundations of Data Science* 3, 67-97 (2021).
   [DOI](https://doi.org/10.3934/fods.2021006) |
   [software](https://github.com/wangru25/HERMES)
3. Mémoli F, Wan Z, Wang Y. “Persistent Laplacians: Properties, Algorithms and
   Implications.” *SIAM Journal on Mathematics of Data Science* 4, 858-884 (2022).
   [DOI](https://doi.org/10.1137/21M1435471)
4. Davies T, Wan Z, Sánchez-García RJ. “The Persistent Laplacian for Data Science:
   Evaluating Higher-Order Persistent Spectral Representations of Data.” ICML 2023.
   [paper](https://proceedings.mlr.press/v202/davies23c.html) |
   [code](https://github.com/tomogwen/persistentlaplaciandatascience)
5. Jones B, Wei G-W. “PETLS: PErsistent Topological Laplacian Software.”
   arXiv:2508.11560 (revised 2026).
   [paper](https://arxiv.org/abs/2508.11560) |
   [documentation](https://www.benjones-math.com/software/PETLS/) |
   [source](https://github.com/bdjones13/PETLS)
6. Marston SK. `petls-pytorch` 1.0.2 (2026).
   [PyPI and provenance](https://pypi.org/project/petls-pytorch/) |
   [source](https://github.com/Sylverity/petls-pytorch)
