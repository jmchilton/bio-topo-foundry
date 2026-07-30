# White Paper: petls-pytorch

## An open, redistributable PyTorch engine for persistent topological Laplacians

> **📝 Stub.** Placeholder `package` note — skeleton + verified packaging/provenance facts only. The
> full analysis (architecture, numerics vs. the PETLS oracle, benchmarks, adoption guidance) is still
> to be written, mirroring the sibling [PETLS writeup](./petls.md). Expand section-by-section.

> **✅ Licensing — freely reusable (contrast PETLS).** petls-pytorch is **Apache-2.0** (repo `LICENSE`
> + `NOTICE`, PyPI metadata, `pyproject.toml` all agree, checked July 2026). It is a pure-Python
> `py3-none-any` noarch wheel, so it is **redistributable and Bioconda-eligible** — the property the
> unlicensed upstream [PETLS](./petls.md) lacks. This is why we **adopt** it as the shippable
> persistent-Laplacian engine instead of cleanrooming PETLS.

**Primary source:** the package itself — [Sylverity/petls-pytorch](https://github.com/Sylverity/petls-pytorch)
(PyPI `petls-pytorch` 1.0.2, released 2026-06-29; author Sumner K. Marston). It is an **independent
PyTorch reimplementation** of the PETLS persistent-Laplacian engine, not a wrapper; it does not ship
with its own paper. For the mathematics and the reference implementation it reimplements, see the
PETLS preprint (Jones & Wei, [arXiv:2508.11560](https://arxiv.org/abs/2508.11560)) and [petls.md](./petls.md).

**Relationship to the corpus:**
- **Method:** persistent (combinatorial / Hodge) Laplacian — the same engine as PETLS.
- **Reimplements / substitutes:** [PETLS](./petls.md) (upstream, unlicensed, Linux-x86-64 wheels only).
  petls-pytorch is the open drop-in; PETLS remains useful as a local numerical oracle.
- **Environment:** [`content/environments/petls-pytorch/`](../environments/petls-pytorch/pixi.toml) —
  L1 in-repo recipe, biopixi env locked + green (linux-64).
- **Recipe:** [`recipes/petls-pytorch/`](../../recipes/petls-pytorch/recipe.yaml) — noarch/Apache-2.0,
  builds green under rattler-build; a candidate conda-forge/Bioconda staged-recipe.
- **Provenance review:** [`persistent-laplacian-implementation-review.md`](../../persistent-laplacian-implementation-review.md).

## Executive summary

_Stub._ Independent PyTorch reimplementation of the PETLS engine: GUDHI-backed Vietoris–Rips and alpha
complexes, the Mémoli–Wan–Wang Schur-complement up-Laplacian, full/partial spectra and eigenvectors,
directed-flag complexes, rank-one cellular sheaves, and the top-dimensional "flip" optimization. Ships
as a portable pure-Python wheel; the `pyproject` describes it as "GPU-native … in PyTorch." Numerical
agreement with the PETLS reference and independent benchmarks are **to be validated and written up**.

## Problem and scope

_Stub._ Same problem PETLS addresses (persistent Laplacians as a spectral enrichment of persistent
homology). See [petls.md](./petls.md) for the mathematical background; this note should cover only what
differs in the PyTorch reimplementation.

## Software architecture

_Stub._ Two dtype knobs (`_DEFAULT_DTYPE` dense + `_DEFAULT_SPARSE_DTYPE` sparse; both default
`float32` — full double precision needs *both* set). `Complex` captures its dtype at construction;
`get_L` is `up + down`. Fill in the module map, complex constructors, and eigensolver paths.

## Packaging and dependencies

_Stub._ `requires-python >=3.10,<3.15`. Runtime: torch≥2.0, numpy, scipy, gudhi, pandas,
matplotlib. `tadasets` is **benchmark-only** (`benchmark/datasets.py`), which we upstreamed as a
`benchmark` extra ([Sylverity/petls-pytorch#1](https://github.com/Sylverity/petls-pytorch/pull/1)) so
the runtime closure solves on conda channels. Pure-Python noarch → one BioContainer once on Bioconda.

## Numerics vs. the PETLS oracle

_Stub._ Validate agreement of matrices / spectra / persistent Betti against a local PETLS run. A
double-precision property-test suite (boundary condition, symmetry, PSD, construction correctness vs.
an independent oracle, persistent nullity == Betti, full Schur spectrum) exists on a fork branch,
tracked for upstreaming in [bio-topo-foundry#6](https://github.com/jmchilton/bio-topo-foundry/issues/6).

## Practical adoption guidance

_Stub._ Set **both** dtype knobs to `float64` for crisp harmonic (zero) eigenvalues on small complexes.

## Conclusion

_Stub._ The open, portable, Bioconda-eligible persistent-Laplacian engine for the foundry's
structure-QA and molecular pipelines — the shippable substitute for the license-blocked PETLS.

## Source note and selected verified references

_Stub._ Repo [Sylverity/petls-pytorch](https://github.com/Sylverity/petls-pytorch) · PyPI 1.0.2
(2026-06-29) · Apache-2.0. PETLS math/reference: Jones & Wei, arXiv:2508.11560.
