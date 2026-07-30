# Ecosystem hardening — deliverables

Work upstreamed to strengthen the persistent-Laplacian TDA ecosystem rather than reimplement it in-repo.

- **petls-pytorch: trim over-declared runtime dep** — move `tadasets` to a `benchmark` extra so the install closure is solvable on conda-forge/Bioconda — https://github.com/Sylverity/petls-pytorch/pull/1
- **PETLS: request a license** — the reference impl ships with no license (all-rights-reserved by default); ask upstream to add one so it can be redistributed/repackaged — https://github.com/bdjones13/PETLS/issues/2
- **tadasets → conda-forge** — add the scikit-tda synthetic-dataset generator to conda-forge, closing the packaging gap that blocks the petls-pytorch closure — https://github.com/conda-forge/staged-recipes/pull/34367
- **float64 property-test branch (tracking)** — upstream independent double-precision invariant tests to petls-pytorch, after the deps PR lands — https://github.com/jmchilton/bio-topo-foundry/issues/6
