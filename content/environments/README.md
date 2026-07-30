# TDA environment fixtures

One pixi environment per topological-data-analysis tool, chosen so the set spans biopixi's
L0–L4 ladder with real packages. Each `pixi.toml` is a standalone manifest — `pixi install`
works with biopixi nowhere in sight. Metadata verified against anaconda.org / PyPI / CRAN on
2026-07-29; re-verify before trusting the grade.

Expected grade is the *anticipated* `biopixi grade` result, not a declared one — the grader
derives it from the manifest, lockfile, and public metadata.

| Environment | Package(s) | Source | Expected grade |
|---|---|---|---|
| `ripser-cpp` | ripser 1.0.1 (C++ CLI) | Bioconda | **L4** — single Bioconda pkg, auto BioContainer |
| `ripser-py` | ripser 0.6.14 (ripser.py) | conda-forge | **L3** |
| `gudhi` | gudhi 3.13.0 | conda-forge | **L3** |
| `persim` | persim 0.3.8 | conda-forge | **L3** |
| `dionysus` | dionysus 2.2.3 | conda-forge | **L3** |
| `topometry` | topometry 0.2.1.1 (single-cell) | conda-forge | **L3** |
| `kmapper` | KeplerMapper 2.1.0 | recipe (pure-python) | **L1** |
| `scikit-tda` | scikit-tda 1.1.1 (meta) | recipe (pure-python) | **L1** (`tadasets` recipe now in `recipes/tadasets`) |
| `giotto-ph` | giotto-ph 0.2.4 | recipe (compiled, **verified building on linux-64**) | **L1** |
| `pyflagser` | pyflagser 0.4.7 | recipe (compiled, **verified building on linux-64**) | **L1** |
| `petls` | PETLS 1.0.1 | recipe (compiled, **verified building on linux-64**) | **L1** |
| `petls-pytorch` | petls-pytorch 1.0.2 (Apache-2.0 PETLS reimpl) | recipe (pure-python, **verified green** + linux-64 lock) | **L1** (Bioconda-eligible → L3/L4 on publish) |
| `r-tdastats` | TDAstats 0.4.2 (R) | recipe (CRAN, compiled, **verified building on linux-64**) | **L1** |
| `r-tda` | TDA 1.9.4 (R) | recipe (CRAN, compiled) | **L1** |
| `giotto-tda` | giotto-tda 0.6.2 | PyPI (`[pypi-dependencies]`) | **L0** — out of profile |
| `hiponet` | HiPoNet `@45a9d08` (`pointcloudnet`, single-cell) | git clone + PyPI closure (**locked green** linux-64) | **L0** — Yale non-commercial, not a packageable lib |
| `topodockq` | TopoDockQ scorer `@5696f82` (struct QA) | git clone + conda/PyPI per `environment.yaml` (**locked green** linux-64) | **L0** — MIT but Py3.8 `.pyc` core, nothing to build |
| `biopython` | Biopython 1.87 | conda-forge (**locked green**) | **L3** |
| `dssp` | dssp 4.6.1 (provides `mkdssp`) | Bioconda (**locked green**) | **L4** — single Bioconda pkg |
| `mmseqs2` | MMseqs2 18.8cc5c | Bioconda (**locked green**) | **L4** — single Bioconda pkg |
| `dockq` | DockQ 2.1.3 | Bioconda (**locked green**) | **L4** — single Bioconda pkg |
| `scanpy` | scanpy 1.12.3 + anndata 0.13.2 | conda-forge (**locked green**) | **L3** |
| `phat` | phat 1.5.0a (PHAT C++ reduction backend) | recipe (compiled pybind11, **verified green** linux-64) | **L1** (LGPL-3.0 → L3 on publish) |
| `scvi` | scvi-tools 1.5.0.post1 (deep generative embedding) | conda-forge (**locked green**) | **L3** |
| `phate` | phate 2.0.0 (diffusion embedding) | Bioconda (**locked green**) | **L4** — single Bioconda pkg |
| `ann-backends` | hnswlib 0.8.0 + pynndescent 0.5.13 (ANN kNN) | conda-forge (**locked green**) | **L3** |
| `batch-integration` | harmonypy 2.0.0 + scanorama 1.7.4 (batch integration) | Bioconda (**locked green**) | **L3** — two Bioconda pkgs |
| `pydowker` | pyDowker → pyrivet → rivet-console (2-param persistence) | recipe ×3 (**verified green** linux-64) + lock | **L1** (GPL/BSD/MIT → L3 on publish) |

## Notes

- **Name collision, deliberate:** `ripser-cpp` and `ripser-py` both pin a package literally named
  `ripser` but from different channels (Bioconda C++ CLI 1.0.1 vs conda-forge Python lib 0.6.14).
  The channel prefix is part of the mulled identity, so these are genuinely different environments.
- **`giotto-tda` is the L0 fixture:** wheel-only on PyPI (no sdist, no conda pkg). Adding a recipe
  under `recipes/giotto-tda` and switching to a path dependency would promote it to L1.
- **`hiponet` / `topodockq` are clone-and-run L0 fixtures:** each reproduces a *dependency closure*
  (locked green on linux-64), but the tool code is **run from its pinned git clone**, not installed —
  neither is a packageable artifact. `hiponet` has no `[build-system]` (pyproject `name=pointcloudnet`,
  flat scripts); `topodockq`'s core is Py3.8 `.pyc` bytecode with no source. So **no recipe** is possible
  for either today — for technical reasons, *not* licensing (`hiponet` is capped at L0/L1 by its
  non-commercial license regardless; `topodockq` is MIT and could reach L3 if upstream ships source).
- **Compiled recipes:** `petls`, `giotto-ph`, and `pyflagser` are all **verified building green on
  linux-64** (rattler-build in a linux/amd64 container: compile + link + package + tests pass).
  `petls` is linux-64-only (an upstream `std::chrono::_V2` libstdc++-ism won't compile under
  macOS/libc++). `giotto-ph` and `pyflagser` both use a git source rather than a tarball because
  they vendor their C++ engines as git submodules that setup.py force-fetches (pybind11/junction/turf
  for giotto-ph; luetge/flagser for pyflagser); both also need `make` and a force-included `<cstdint>`
  (GCC 13+ dropped transitive includes), giotto-ph additionally needs `cmake <4` (the junction
  submodule's cmake_minimum_required predates 3.5), and pyflagser needs its `pkg_resources.extern`
  version import repointed at standalone `packaging`.
- **`scikit-tda` transitive gap — now closed:** its run closure includes `tadasets`, absent from conda,
  so `recipes/tadasets` (pure-python, MIT, **verified green**) now provides it. The same recipe satisfies
  `petls-pytorch`'s declared `tadasets` dep, so both environments resolve entirely from conda channels + the
  in-repo recipes.
- **`pydowker` is a 3-recipe chain built from source:** the whole 2-parameter-persistence stack —
  `pyDowker` (Dowker complexes) → `pyrivet` (pure-Python API) → `rivet-console` (RIVET's Qt-free C++
  engine). It retires a former "hollow green": `import pyDowker` used to pass while the tool couldn't run,
  because `rivet_console` was on no package index. Compiling RIVET's console (GPL-3.0, header-only Boost,
  cmake `<4`, `-j2` to dodge template-heavy OOM) supplies it. The conda package is named `rivet-console`,
  not `rivet` — the latter is an unrelated conda-forge project. Chain verified green (rivet compiles +
  `rivet_console --help`; pyrivet + pyDowker install, real `DowkerComplex` import + `pip check` clean).
- **Single-cell companions (`scvi`, `phate`, `ann-backends`, `batch-integration`):** the supporting
  stack around TopoMetry's single-cell vertical — learned embedding (scVI), diffusion embedding (PHATE),
  reproducible kNN backends (hnswlib + pynndescent), and batch integration (harmonypy + scanorama). All
  conda-only, locked green. Two of them pin **paired alternatives for one pipeline slot** into a single
  env (`ann-backends`, `batch-integration`); that's why `batch-integration` grades L3 rather than the L4
  each of harmonypy/scanorama would score alone.
- **`petls-pytorch` is the open PETLS engine:** Apache-2.0 pure-Python reimplementation of PETLS (persistent
  Laplacians). Unlike the unlicensed, compiled, linux-only `petls` (permanently L1), its noarch recipe is
  redistributable and staged-recipes-eligible → promotes to L3/L4 once on conda-forge/Bioconda. Recipe +
  linux-64 lock verified green; see `../../persistent-laplacian-implementation-review.md`.
