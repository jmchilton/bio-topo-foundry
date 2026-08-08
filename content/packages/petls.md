---
type: package
title: PETLS
summary: A C++ library with Python bindings for building persistent topological Laplacians and computing their matrices and spectra.
repository: https://github.com/bdjones13/PETLS
languages:
  - C++
  - Python
software_license:
  status: missing
tags:
  - method/persistent-laplacian
  - application/molecular-sciences
  - modality/point-cloud
  - modality/graph
---

# White Paper: PETLS

## Packaged persistent topological Laplacians across complexes

> **⚠️ Licensing warning — not freely reusable.** PETLS declares **no software license** anywhere: no `LICENSE` file in the repository, no license field in `pyproject.toml` or `setup.py`, and no license in the PyPI metadata (checked July 2026). Under default copyright this is **all rights reserved** — public availability and `pip install petls` do **not** grant permission to redistribute, modify, or repackage it (e.g. for conda-forge/Bioconda). A license has been requested upstream at [bdjones13/PETLS#2](https://github.com/bdjones13/PETLS/issues/2). Treat PETLS as look-but-don't-redistribute until the authors clarify. See "Access, licensing, and funding" below for specifics.

**Primary source:** Benjamin Jones and Guo-Wei Wei, "PETLS: PErsistent Topological Laplacian Software," arXiv:2508.11560. The preprint was submitted August 15, 2025 and revised March 3, 2026. [arXiv record](https://arxiv.org/abs/2508.11560) | [Paper DOI](https://doi.org/10.48550/arXiv.2508.11560)

**Access, licensing, and funding:** The paper is open access under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). That article license does not license the software. As inspected on July 28, 2026, the PETLS repository and Python package do not declare an overall software license: there is no root license file, `pyproject.toml` has no license field, and the legacy `setup.py` contains an empty license value. Public source availability should therefore not be treated as legal permission to reuse, modify, or redistribute PETLS without clarification from the authors. The work acknowledges support from NIH grant R35GM148196, NSF grant DMS-2052983, and the Michigan State University Research Foundation. The NIH award is an NIGMS MIRA led by Guo-Wei Wei for mathematics and artificial intelligence in biosciences and drug discovery. [NIH RePORTER](https://reporter.nih.gov/search/DSvtOjSUDkGqTPYpit3gCg/project-details/10551576)

## Executive summary

PETLS is a C++ library with Python bindings for constructing persistent topological Laplacians and computing their matrices, eigenvalues, and eigenvectors. It packages a research area that previously depended on specialized implementations, particularly HERMES and individual MATLAB scripts, into a common interface. Its main software abstraction accepts filtered boundary matrices and filtration values. Convenience paths then adapt point clouds, distance matrices, directed graphs, GUDHI simplex trees, and cellular sheaves to that representation.

This generality is the project's strongest contribution. PETLS has native interfaces for arbitrary filtered boundary matrices, Vietoris-Rips complexes, alpha complexes, directed flag complexes, and rank-one cellular sheaves. A Dowker complex can be constructed externally with `pyDowker` and passed through a GUDHI simplex tree. Path complexes, hyperdigraph complexes, and other non-simplicial constructions are possible when a user supplies compatible boundary matrices. Calling this the "whole Laplacian zoo" is directionally fair, but the routes differ: some complexes have dedicated constructors, others require an adapter, and the sheaf implementation is limited to one-dimensional real stalks.

The mathematical value of a persistent Laplacian is twofold. The multiplicity of its zero eigenvalue recovers the corresponding persistent Betti number, while its nonzero spectrum can encode geometric and structural variation absent from persistent homology. PETLS exposes the up-, down-, and full persistent Laplacian, full or partial spectra, eigenvectors, filtration-pair batches, timing profiles, and spectrum summaries. It also makes matrix-construction and eigensolver strategies replaceable, especially in C++.

The authors report major computational gains. In a Rips-complex benchmark on 30 points sampled from a sphere, the fastest tested PETLS configuration took 4.332 seconds for the requested family of matrices and spectra, compared with 68.289 seconds for a MATLAB implementation and 1,359.303 seconds for HERMES. The corresponding ratios were 15.76-fold and 313.78-fold. A top-dimensional "flipped" computation reduced one directed-flag eigenvalue workload from 13.1 to 3.5 seconds and more than halved the combined matrix-and-spectrum time. These are meaningful engineering results, although they come from author-run synthetic or computational benchmarks, not independent reproduction or a biological prediction task.

PETLS is genuinely packaged. `pip install petls` resolves to version 1.0.1 on PyPI, released August 18, 2025. Trusted publishing connects the release artifacts to GitHub commit `5b6564e9`, and binary wheels exist for CPython 3.10 through 3.13 on manylinux x86-64. That achievement should be qualified by platform. There are no PyPI wheels for macOS, Windows, Linux ARM, or Apple Silicon; those systems fall back to a large source build with C++, CMake, CGAL, Boost, GUDHI, and related requirements. An open May 2026 issue reports that this source installation fails on Apple Silicon because the code uses a non-portable internal `std::chrono::_V2` namespace.

The project is therefore best understood as a strong research-software successor to earlier persistent-Laplacian implementations, not yet a universally installable or production-supported package. It provides a broad and efficient computational substrate. It does not by itself select biologically meaningful filtrations, explain nonzero eigenvalues, prevent combinatorial explosion, or validate a downstream model.

## Problem and scope

Persistent homology follows topological features while a scale parameter changes. It records when connected components, loops, and cavities appear and disappear, usually as a barcode or persistence diagram. This is powerful but deliberately compressed: many geometrically different objects can have the same Betti numbers or persistence intervals.

A combinatorial Hodge Laplacian adds spectral structure to a complex. For boundary maps

\[
B_k:C_k\rightarrow C_{k-1},
\]

the ordinary \(k\)-Laplacian is

\[
L_k = B_k^\top B_k + B_{k+1}B_{k+1}^\top.
\]

The first term is the down-Laplacian and couples \(k\)-simplices through shared faces. The second is the up-Laplacian and couples them through shared cofaces. Hodge theory identifies the kernel with homology:

\[
\ker L_k \cong H_k.
\]

The zero spectrum therefore carries topological counts, while positive eigenvalues and eigenvectors carry information about connectivity, geometry, diffusion, and variation within the same homology class.

Persistence introduces two filtration values. For nested complexes \(K_a\subseteq K_b\), PETLS constructs an operator on the \(k\)-chains present at \(a\), while allowing \((k+1)\)-chains available by \(b\) to fill cycles. In simplified notation,

\[
L_k^{a,b} =
B_{k+1}^{a,b}(B_{k+1}^{a,b})^\top +
(B_k^a)^\top B_k^a.
\]

The persistent boundary \(B_{k+1}^{a,b}\) is not generally obtained by merely deleting columns from \(B_{k+1}^b\). Only chains whose boundary lies entirely in \(C_k(K_a)\) are admissible, and a basis for that subspace may be a linear combination of later simplices. Computing this restriction is the central matrix problem.

PETLS is a numerical engine for that problem. It is not:

- a persistent-homology replacement for every task;
- a topology-learning neural network;
- a point-cloud embedding or visualization method;
- a molecular featurizer with a trained predictor;
- an automatic filtration or scale-selection procedure;
- a biological interpretation system.

The user still decides which complex, filtration, dimensions, \((a,b)\) pairs, eigensolver, spectral summaries, and downstream statistical model are scientifically justified.

## Software architecture

### One boundary-matrix core

The `Complex` class is the unifying abstraction. A user supplies ordered boundary matrices \(\{B_1,\ldots,B_N\}\) and one filtration value per cell in each dimension. PETLS stores the full filtered boundaries sparsely and forms earlier filtration levels as submatrices. Standard simplicial boundaries contain only -1, 0, and 1, permitting compact integer storage until floating-point linear algebra is required.

The default up-Laplacian uses the Schur-complement algorithm described by Memoli, Wan, and Wang. If the later up-Laplacian is partitioned as

\[
\begin{pmatrix}
A & B\\
C & D
\end{pmatrix},
\]

with the earlier \(k\)-chains first, the persistent up-Laplacian is represented through

\[
A-BD^\dagger C.
\]

PETLS uses sparse and self-adjoint storage where possible and solves the relevant positive-semidefinite system through a robust LDL decomposition. The paper reports using single precision because it approximately halves time in the authors' experiments with negligible observed spectral change. That empirical choice should be validated for ill-conditioned or high-precision applications.

The Python API exposes `get_up`, `get_down`, `get_L`, `spectra`, `eigenpairs`, filtration enumeration, file output, timing, and summary helpers. It offers C++ Eigen solvers, Spectra, SciPy dense and sparse wrappers, and user-supplied Python eigensolver callables. Up-Laplacian replacement is more flexible in C++; the public Python wrapper currently recognizes only the Schur option.

### Supported construction paths

| Data or structure | PETLS path | Important qualification |
|---|---|---|
| Filtered cell or chain complex | `Complex(boundaries, filtrations)` | Most general route; user is responsible for valid boundary identities and filtration compatibility |
| GUDHI simplicial filtration | `Complex(simplex_tree=...)` | Converts a GUDHI `SimplexTree` to filtered boundary matrices |
| Point cloud or distance matrix | `Rips(...)` | Modified Ripser path using real coefficients; simplex growth still requires dimension and distance limits |
| Euclidean point cloud | `Alpha(...)` | Uses GUDHI/CGAL; practical mainly in low ambient dimension and adds source-build dependencies |
| Weighted directed graph | `dFlag(...)` | Uses modified Flagser and a project-specific `.flag` input path |
| Dowker relation | External `pyDowker` to GUDHI tree to `Complex` | Demonstrated in a notebook, not a dedicated packaged `Dowker` class |
| Cellular sheaf | `sheaf_simplex_tree` plus `PersistentSheafLaplacian` | User writes restriction maps; current implementation restricts stalks to copies of \(\mathbb{R}\) |
| Path, hyperdigraph, or other complex | Supply boundary matrices | Capability follows from the generic core; no equally polished constructor is provided |

This distinction matters for adoption. PETLS unifies the computation after a filtered boundary representation exists. It does not provide equally complete data ingestion, validation, or domain documentation for every complex family.

## Computational contributions

### Matrix construction versus eigensolution

Earlier persistent-Laplacian software was often limited by constructing the matrix. PETLS's sparse Schur-complement implementation shifts the dominant cost in many examples to the spectrum itself. This is progress, but it reveals a hard numerical fact: the most scientifically interesting eigenvalues can be the most difficult to compute.

Persistent Laplacians are positive semidefinite and can contain many zeros because nullity equals a persistent Betti number. Iterative algorithms seeking the smallest-magnitude eigenvalues can struggle around this high-multiplicity null space. In the paper's experiments, standard sparse-solver rules of thumb were unreliable. The fastest algorithm depended on whether the target was the full spectrum, largest eigenvalues, or smallest eigenvalues and on the complex and filtration interval. The authors recommend testing candidate solvers on an early representative subset before scaling.

This also affects how benchmark ratios should be read. The Rips benchmark compares the same underlying filtration family, but not every software configuration requests exactly the same spectral workload. HERMES asks MATLAB `eigs` for as many as 100 smallest eigenvalues, the MATLAB reference computes the full spectrum, and some PETLS/Spectra configurations request only ten. The fastest standard PETLS C++ result still materially outperforms the comparators, but individual ratios combine matrix implementation, eigensolver choice, language, and requested spectral subset.

### Reported Rips benchmark

The principal comparison samples 30 points from the unit sphere, constructs a Rips filtration through dimension 3, and evaluates \(L_d^{a,a+0.2}\) for \(d=0,1,2\) and \(a=0.0,0.2,\ldots,2.0\). The final filtration contains 435 edges and 4,060 triangles. Results are averaged over 100 point samples on one CPU core.

| Configuration | Total author-reported time (s) | Relative to HERMES |
|---|---:|---:|
| HERMES | 1,359.303 | 1.00x |
| MATLAB implementation | 68.289 | 19.91x |
| PETLS C++ with Spectra | 8.268 | 164.41x |
| PETLS with LAPACK | 7.349 | 184.96x |
| PETLS Python with Spectra | 5.231 | 259.86x |
| PETLS Python | 5.074 | 267.90x |
| PETLS C++ | 4.332 | 313.78x |

The result supports PETLS as a faster implementation for this workload. It does not establish the same ratio for large sparse complexes, all filtration-pair schedules, parallel hardware, or end-to-end machine-learning pipelines.

### Top-dimensional flip

For a top-dimensional boundary \(B_N\), the nonzero eigenvalues of \(B_NB_N^\top\) and \(B_N^\top B_N\) agree. PETLS can compute the smaller matrix and add the correct number of zeros. On a directed flag complex derived from the 1A99 protein-ligand structure, with 209 vertices, 1,466 edges, and 2,361 directed triangles, this reduced the reported dimension-2 eigensolution from 13.1 to 3.5 seconds, a 73 percent reduction. Combined dimensions 1 and 2 gained more than a twofold speedup.

This optimization is exact for the spectrum apart from numerical error, but its benefit depends on matrix shape. It is largest when the number of top-dimensional cells greatly exceeds the number one dimension below.

### Reduction through persistent homology

The paper also proposes removing the known harmonic subspace before solving for the positive spectrum. If a matrix \(N\) spans \(\ker L_k^{a,b}\), an orthogonal complement can reduce the eigensystem from dimension \(d\) to \(d-\beta_k^{a,b}\). The transformed problem is positive definite, avoiding a repeated zero eigenspace.

Conceptually, this isolates the information PETLS adds beyond persistent homology. Practically, it requires representative cycles over real or rational coefficients, which mainstream Python and C++ persistent-homology libraries do not readily supply in the needed form. The paper reports only modest initial speed benefit and treats the method as a research direction. It should not be presented as a mature automatic acceleration.

### Filtration-pair selection remains quadratic

If a filtration has \(m\) distinct values, there are \(m(m+1)/2\) valid \((a,b)\) pairs per dimension. A complex with unique filtration values for every simplex can therefore make exhaustive spectral analysis infeasible even when one matrix is fast. PETLS supports fixed offsets, successive pairs, explicit request lists, and all-pairs computation, but it cannot remove the experimental-design problem.

The paper suggests representing selected pairs as a triangular image whose entries contain a spectral statistic such as the least positive eigenvalue. This could feed a conventional model or convolutional network. That proposal is illustrative rather than a validated featurization benchmark.

## Software packaging and maintenance assessment

The following observations describe the public project on July 28, 2026.

The GitHub repository is public, unarchived, and points to commit `5b6564e9e05af9d24928313b92a014696247bdd7`, dated August 17, 2025. It contains seven commits, all by one contributor and all between August 9 and August 17, 2025. The repository had 13 stars, one fork, one open issue, and no open pull requests. The paper was revised in March 2026, but no corresponding source-code commit appears on the default branch.

The strongest release-engineering feature is PyPI provenance. PETLS 1.0.1 provides a source distribution and manylinux 2.28 x86-64 wheels for CPython 3.10, 3.11, 3.12, and 3.13. GitHub Actions uses `cibuildwheel`, PyPI trusted publishing, and Sigstore-backed attestations tied to the source commit. For users on a matching Linux platform, this is a real one-command binary installation rather than an aspirational packaging claim.

Material limitations include:

- no macOS, Windows, Linux ARM, or Apple Silicon wheel;
- a source build that requires a modern C++ toolchain and, for alpha complexes, CGAL and Boost;
- an unresolved Apple Silicon build failure caused by non-portable standard-library internals;
- no declared PETLS software license;
- release automation triggered manually or on publication rather than tests on every push;
- the wheel workflow runs only `tests/core`, omitting variant tests for Rips, alpha, sheaf, and directed flag paths;
- only 15 conventionally named Python test functions across the repository, while directed-flag test files are commented out and Dowker evaluation is notebook-based;
- documentation labeled 1.0.0 while PyPI is 1.0.1;
- a broken getting-started example containing `fsiltrations` instead of `filtrations`;
- inconsistent legacy metadata: `setup.py` says version 0.0.10 and Python 3.7+, while `pyproject.toml` controls version 1.0.1 and requires Python 3.10+;
- no benchmark environment lock, container, or machine-readable result manifest.

The Python sources passed syntax compilation in this review. The native extension and numerical tests were not run because the review host was Apple Silicon, for which no wheel exists, and the source-build issue remains open. The authors' CI and benchmark results were not independently reproduced.

These findings support the phrase "genuinely packaged successor" if it means a versioned, attested PyPI package with a documented API and Linux binaries. They do not support "portable production package" or "actively maintained" without qualification. The repository has seen no source update since release, and its only current installation issue had no response at inspection time.

## Evidence quality and limitations

The PETLS paper is a substantial 46-page preprint with mathematical definitions, implementation details, algorithmic analysis, several timing studies, and appendices explaining each supported complex. Its reproducibility assets are stronger than those of many mathematical software papers: code, tests, examples, docs, tagged source, wheels, release provenance, and benchmark notebooks are public.

The evidence boundary is equally important:

- **Preprint status:** no peer-reviewed PETLS software article or journal version was located.
- **Author-run timing:** benchmarks were not reproduced independently and do not report confidence intervals beyond averages over repeated random samples.
- **Mixed workloads:** some software configurations compute full spectra and others partial spectra, complicating direct speed ratios.
- **Limited hardware characterization:** headline comparisons use one CPU core; portability across architectures, libraries, compilers, memory regimes, and GPUs is unknown.
- **No predictive validation:** the paper demonstrates computation, not better accuracy on a biomedical or machine-learning endpoint.
- **Interpretability remains open:** zero eigenvalues have a precise homological meaning, but no general theory maps each positive eigenvalue to a specific geometric or biological mechanism.
- **Combinatorial growth remains:** faster matrix algebra does not stop Rips or directed-flag simplex counts from exploding.
- **Parameter multiplicity:** complex type, filtration, dimension, \((a,b)\) schedule, coefficient field, eigensolver, spectrum subset, and summary statistic all create researcher degrees of freedom.
- **Numerical precision:** the default's single-precision choices need problem-specific stability checks.
- **License uncertainty:** article openness, NIH support, and public source do not substitute for a software license.

NIH support gives the project a credible biomedical motivation, particularly for drug discovery and molecular representation, but it is not evidence of NIH validation, endorsement, regulatory fitness, or clinical readiness.

## Practical adoption guidance

A defensible PETLS evaluation should proceed in stages:

1. **Resolve licensing first.** Ask the authors to add or identify the governing software license before redistributing PETLS, embedding it in another package, or using modified code.
2. **Pin the artifact.** Record PETLS 1.0.1 and commit `5b6564e9`. Preserve the PyPI hash or provenance attestation.
3. **Prefer a supported wheel.** Use CPython 3.10-3.13 on manylinux x86-64 when possible. For other platforms, treat source compilation as an engineering task and document compiler, CMake, Boost, CGAL, GUDHI, Eigen, and system-library versions.
4. **Run more than the release tests.** Execute both `tests/core` and applicable variant tests. Add regression cases for the chosen complex, dimensions, filtration pairs, and spectra.
5. **Validate topology on small examples.** Check \(B_kB_{k+1}=0\), matrix symmetry, positive semidefiniteness, and equality between nullity and an independently computed persistent Betti number.
6. **Bound the complex before building it.** Set maximum dimension and filtration threshold, record simplex counts, and fail early on memory estimates.
7. **Benchmark eigensolvers on representative matrices.** Compare full self-adjoint solvers and partial sparse solvers. Verify residuals and convergence rather than trusting defaults.
8. **Use the flipped top-dimensional path where applicable.** Confirm nonzero spectral parity on a small case before relying on its scale advantage.
9. **Design the filtration-pair schedule prospectively.** Fixed-offset, adjacent-pair, and coarse all-pairs grids answer different questions. Avoid choosing a grid after seeing downstream test performance.
10. **Separate topology from prediction.** Compare persistent homology alone, non-persistent Laplacians, PETLS spectral features, and matched non-topological descriptors under the same splits and tuning budget.
11. **Quantify stability.** Perturb points, weights, filtration values, solver tolerances, and floating-point precision. Report whether selected spectral features and conclusions persist.
12. **Interpret with domain evidence.** In molecular applications, associate spectral changes with known contacts, chemistry, mutations, or prospective experiments. Do not infer mechanism from an eigenvalue shift alone.

## Conclusion

PETLS is an important consolidation of persistent topological Laplacian computation. It turns a fragmented collection of algorithms and complex-specific implementations into one C++/Python framework, exposes a useful general boundary-matrix interface, and offers dedicated paths for several central complex families. The authors' benchmarks show that careful sparse construction and solver selection can move persistent-Laplacian analysis from minutes to seconds on representative workloads.

Its most defensible distinction is packaging plus breadth. PETLS 1.0.1 is available from PyPI with attested Linux wheels, unlike many research prototypes that stop at source code. Its architecture makes it a plausible successor to HERMES for researchers who need more complex types, arbitrary dimensions, and replaceable numerical components.

The package is not yet turnkey across platforms, fully licensed, comprehensively tested, or independently benchmarked. Dowker support is mediated through another library, cellular sheaves are rank-one, and source installation is problematic outside the supported Linux wheel matrix. More fundamentally, PETLS solves the computation of chosen persistent Laplacians; it does not solve the scientific choice or interpretation of those operators.

A strong next release would add an explicit software license, macOS/ARM and Windows wheels, push-triggered CI over all variants, repaired and versioned documentation, a locked benchmark environment, and numerical parity tests across solver paths. A strong next study would benchmark predictive value and stability on independently held-out biomedical data. With those additions, PETLS could become not only the best-packaged broad persistent-Laplacian engine, but a dependable foundation for reproducible applied TDA.

## Source note and selected verified references

This white paper distinguishes author-reported mathematical and timing results from repository observations made on July 28, 2026. The complete 46-page arXiv v2 PDF was extracted, rendered, and visually inspected, including all theory, benchmark figures and tables, discussion, complex appendices, and references. The repository, release workflow, package metadata, source, tests, examples, documentation, issue tracker, PyPI provenance, and NIH award record were inspected. Native numerical benchmarks were not rerun.

1. Jones B, Wei G-W. "PETLS: PErsistent Topological Laplacian Software." arXiv:2508.11560, v2, March 3, 2026. [arXiv](https://arxiv.org/abs/2508.11560)
2. PETLS source repository. [GitHub](https://github.com/bdjones13/PETLS)
3. PETLS 1.0.1 package distribution. [PyPI](https://pypi.org/project/petls/)
4. PETLS documentation. [Project documentation](https://www.benjones-math.com/software/PETLS/)
5. Memoli F, Wan Z, Wang Y. "Persistent Laplacians: Properties, Algorithms and Implications." *SIAM Journal on Mathematics of Data Science* 4(2):858-884 (2022). [DOI](https://doi.org/10.1137/21M1435471)
6. Wang R et al. "HERMES: Persistent spectral graph software." *Foundations of Data Science* 3(1):67-97 (2021). [DOI](https://doi.org/10.3934/fods.2021004)
7. Wei X, Wei G-W. "Persistent sheaf Laplacians." *Foundations of Data Science* 7(2):446-463 (2025). [DOI](https://doi.org/10.3934/fods.2024020)
8. Wei X, Wei G-W. "Persistent topological Laplacians - a survey." *Mathematics* 13(2):278 (2025). [DOI](https://doi.org/10.3390/math13020278)
9. NIH RePORTER. R35GM148196, "Discovery-Driven Mathematics and Artificial Intelligence for Biosciences and Drug Discovery." [Award record](https://reporter.nih.gov/search/DSvtOjSUDkGqTPYpit3gCg/project-details/10551576)
