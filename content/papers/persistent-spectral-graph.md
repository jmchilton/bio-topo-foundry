---
type: paper
title: Persistent Spectral Graph
summary: "The founding persistent-Laplacian paper: harmonic spectra recover persistent homology exactly, and non-harmonic spectra carry the geometry it discards."
citation: Rui Wang, Duc Duy Nguyen, and Guo-Wei Wei, "Persistent spectral graph," International Journal for Numerical Methods in Biomedical Engineering 36(9), e3376 (2020); preprint arXiv:1912.04135v2.
source_url: https://arxiv.org/abs/1912.04135
source_license:
  status: declared
  id: LicenseRef-arXiv-nonexclusive-distrib-1.0
derived: own-words-summary
tags:
  - method/persistent-laplacian
  - method/persistent-homology
  - application/molecular-sciences
  - modality/point-cloud
  - modality/molecular-structure
---

# White Paper: Persistent Spectral Graph

## A white paper synthesis of Wang, Nguyen and Wei (2019/2020)

**Primary source:** Rui Wang, Duc Duy Nguyen, and Guo-Wei Wei, "Persistent spectral graph." Preprint submitted to arXiv 9 December 2019, revised 11 December 2019 as v2. [arXiv:1912.04135](https://arxiv.org/abs/1912.04135) | [arXiv DOI](https://doi.org/10.48550/arXiv.1912.04135) | [journal version](https://doi.org/10.1002/cnm.3376), *International Journal for Numerical Methods in Biomedical Engineering* 36(9), e3376 (2020).

**Access and reuse:** the arXiv record for this submission declares the [arXiv perpetual non-exclusive distribution license 1.0](http://arxiv.org/licenses/nonexclusive-distrib/1.0/). That grant runs from the authors to arXiv; it gives a third party no redistribution right of its own. This note is therefore an own-words summary that cites and links the source, and carries no quoted prose. The *IJNMBE* version of record is a separately licensed item and was not the version read here; section, figure, and table numbers below are the preprint's.

**Why this note exists.** Four notes in this corpus cite this paper as the origin of the method they use, and none summarizes it: [[topodockq]], and both survey notes. [[petls]] and [[petls-pytorch]] are implementations of the object this paper defines, and HERMES — the software PETLS was written to replace — is the authors' own implementation of it. This is the paper under the `method/persistent-laplacian` tag.

## Executive summary

Persistent homology reduces a filtration to the appearance and disappearance of topological features. That reduction is its strength: barcodes are stable, compact, and coordinate-free. It is also a deliberate discard, because two point clouds with identical barcodes can differ in every way a chemist would call shape.

Wang, Nguyen and Wei's contribution is to define an object that keeps both. For a filtration of oriented simplicial complexes they construct a family of **p-persistent q-combinatorial Laplacian matrices**, one per filtration step and persistence offset, and observe that the matrix splits cleanly into two halves of information:

- The **harmonic spectrum** — the zero eigenvalues — recovers persistent homology *exactly*. The number of zero eigenvalues of the p-persistent q-combinatorial Laplacian equals the p-persistent q-th Betti number. No topological information is lost relative to persistent homology, and none is added.
- The **non-harmonic spectrum** — the positive eigenvalues — is new. It is not derivable from the barcode, it varies continuously with geometry where Betti numbers jump discretely, and it is what the paper's two applications actually use.

The framing is worth stating precisely, because it is what makes the method attractive and also what makes it easy to oversell: this is not a better topological invariant. It is a strictly larger object that *contains* a topological invariant. The claim is that the extra coordinates are useful, and that claim is empirical, not mathematical.

The paper supports it with two proof-of-principle studies. On a set of eight small fullerenes it predicts ground-state heat of formation energy from eigenvalue summary statistics alone — no Betti numbers at all — reaching a Pearson correlation of 0.986. On one protein it predicts residue B-factors from the pseudo-inverse of the 0-Laplacian, reaching 0.925. Both are honest as demonstrations and thin as evidence: eight molecules with a linear model fit and scored on the same eight points, and one protein with weights fit to that protein's own experimental values.

One structural observation deserves prominence because the paper does not draw attention to it. Every application figure and every reported number uses the persistence offset **p = 0**. The applications vary the filtration radius and diagonalize the ordinary q-combinatorial Laplacian at each radius; they never exercise the persistent construction that the theory sections spend twenty pages developing. The persistence machinery is defined, illustrated on toy complexes, and then set aside. That does not make the theory wrong — the p = 0 case is a genuine special case of it, and the harmonic-recovery result is what licenses reading the zero-eigenvalue counts as Betti numbers — but a reader deciding whether to adopt the method should know that its headline results do not depend on the part that is novel relative to spectral graph theory.

## Scope and motivation

The paper's opening argument is a two-sided complaint. Traditional topology and homology are independent of metric and coordinates and therefore retain little geometric information, which limits their practical reach on data. Traditional graph theory, conversely, is geometric but single-scale: one adjacency matrix describes one threshold, and the choice of threshold is arbitrary.

Persistent homology solved the second problem for topology by introducing a filtration parameter and tracking features across it. The authors' own earlier work — multiscale flexibility rigidity index (mFRI), multiscale weighted colored graphs (MWCG), generalized GNM and ANM — solved it for graphs by constructing families of graphs at different characteristic length scales. Persistent spectral theory is presented as the merger: a filtration that induces a family of Laplacians rather than a family of homology groups, so that one construction yields both the topological persistence and the geometric detail.

The lineage on the graph side matters for reading the protein application. The Gaussian network model (GNM) and anisotropic network model (ANM) represent a protein's Cα atoms as an elastic mass-and-spring network and read flexibility off a graph Laplacian. The B-factor experiment in Section 3.2 is recognizably a multiscale GNM: the same pseudo-inverse-diagonal estimator, computed across a family of radii instead of at one cutoff.

## The construction

### From graph Laplacian to q-combinatorial Laplacian

The paper builds up in three steps, and the first is standard. For a simple graph, the Laplacian is degree minus adjacency, it is positive semi-definite, and the multiplicity of its zero eigenvalue is the number of connected components. That last fact is the seed of everything after it: a spectral quantity is already counting a topological invariant, namely the zeroth Betti number.

The generalization replaces the graph with an oriented simplicial complex and vertices with q-simplices. Two q-simplices are *lower adjacent* if they share a (q−1)-face and *upper adjacent* if they are both faces of a common (q+1)-simplex. With boundary operators ∂_q taking q-chains to (q−1)-chains and their adjoints ∂_q\*, the q-combinatorial Laplacian is

> Δ_q := ∂_{q+1} ∂\*_{q+1} + ∂\*_q ∂_q

with matrix representation 𝓛_q = 𝓑_{q+1}𝓑_{q+1}^T + 𝓑_q^T𝓑_q, splitting into an upper Laplacian 𝓛_q^U and a lower Laplacian 𝓛_q^L. For q = 0 the lower term vanishes and this is exactly the graph Laplacian, which is the sense in which the whole framework is a generalization rather than an analogy. The spectrum is independent of the orientation chosen for the simplices, so the object is well defined on the complex rather than on a presentation of it.

The topological content generalizes with it: the multiplicity of the zero eigenvalue of 𝓛_q is the q-th Betti number, so the harmonic part of the spectrum already encodes the number of q-dimensional holes. This is the discrete counterpart of the de Rham–Hodge statement that the harmonic part of the Hodge Laplacian spectrum corresponds to topological cycles, and the paper leans on that analogy explicitly.

### Making it persistent

The third step is the novel one. Given a filtration ∅ = K_0 ⊆ K_1 ⊆ ⋯ ⊆ K_m = K, one cannot simply take the Laplacian of each K_t and call the family persistent — that gives a sequence of unrelated matrices with no notion of a feature surviving from one to the next.

The fix is to restrict the domain. Let ℂ_q^{t+p} be the subset of q-chains of K_{t+p} whose boundary already lies in the (q−1)-chains of the *earlier* complex K_t, and let ð_q^{t+p} be the boundary operator restricted to that subset. The p-persistent q-combinatorial Laplacian is then

> Δ_q^{t+p} := ð_{q+1}^{t+p} (ð_{q+1}^{t+p})\* + ∂\*_q ∂_q

with matrix 𝓛_q^{t+p} = 𝓑_{q+1}^{t+p}(𝓑_{q+1}^{t+p})^T + (𝓑_q^t)^T𝓑_q^t. The asymmetry is the point: the "up" half looks forward into K_{t+p} but only along chains that remain anchored to K_t, while the "down" half stays entirely in K_t. The result is a square matrix whose dimension is the number of q-simplices in K_t — the *earlier* complex — so the family is indexed by a starting scale t and a persistence offset p, and 𝓛_q^{t+0} is the ordinary Laplacian of K_t.

The matrix is symmetric and positive semi-definite, so its spectrum is real and non-negative, and the central result follows by rank-nullity:

> β_q^{t+p} = dim(𝓛_q^{t+p}) − rank(𝓛_q^{t+p}) = nullity(𝓛_q^{t+p}) = the number of zero eigenvalues.

This counts the q-cycles of K_t still alive in K_{t+p}, which is the definition of the persistent Betti number. The recovery of persistent homology is therefore exact and definitional rather than approximate — a point worth being precise about, since "recovers persistent homology" is the kind of claim that is often weaker than it sounds. Here it is not.

The paper works this through case by case on a five-point filtration and on benzene, tabulating boundary matrices, Laplacians, nullities and full spectra at each step. For benzene, the smallest non-zero eigenvalue of 𝓛_0 jumps ten times across the radius filtration, once for each distinct interatomic distance, and the C–C and C–H bond lengths can be read straight off the zero-eigenvalue plot. These worked examples are the paper's most useful teaching material and are where a reimplementer should start.

### What the non-harmonic spectrum is used for

Having established that the zero eigenvalues are the barcode, the authors turn to the rest. They do not propose a canonical summary. Instead they define, for a spectral statistic Λ^α evaluated at each filtration step, an area-under-the-curve feature

> A_α = −Σ_i Λ_i^α δr

with δr the radius grid spacing, and instantiate α over six choices: sum, mean, maximum, standard deviation, variance, and the smallest non-zero eigenvalue λ̃_2. This is a pragmatic featurization rather than a principled one, and the paper is straightforward about that — the six statistics are tried, and the best is reported alongside the others.

## Fullerenes: structure, then stability

### Structure

Fullerenes are a deliberate choice of test system: one atom type, no chemical heterogeneity, and a range of highly symmetric cage geometries, so every change in the spectrum has an interpretable cause. The paper analyzes C20 (a dodecahedral cage, 20 atoms, 30 bonds, all of one length) and C60 (12 pentagons and 20 hexagons, with distinct 6:6 and 6:5 bonds), under a radius filtration on the carbon coordinates.

The readout is legible throughout. C20's zeroth Betti number drops to 1 at r = 0.72 Å, locating its single bond length near 1.44 Å; C60's drops in two stages, at 0.68 Å and 0.72 Å, resolving its two bond types near 1.36 Å and 1.44 Å and confirming 30 "double" bonds. Ring structure appears in β_1 — 11 independent 1-cycles for C20, 31 for C60 — and cavity structure in β_2, where C60 shows 21 voids between 1.12 Å and 1.40 Å (20 hexagonal cavities plus one central void), decaying to the single central void that survives until the cage fills in at 3.03 Å. The smallest non-zero eigenvalue of 𝓛_0 changes five times for C20, counting its five distinct interatomic distances.

None of this is beyond persistent homology except the eigenvalue-jump count, and the paper says so. It is a demonstration that the construction is correct and interpretable before it is asked to predict anything.

### Stability

The prediction task is ground-state heat of formation energy for the series C20 through C60, using structural data from CCL.NET and quantum-chemical reference energies from the literature. The model is the area-under-the-curve feature A_α computed from 𝓛_0^{r+0} spectra with δr = 0.01 Å, fed to linear least squares. Deliberately, **no Betti numbers are used** — the point being made is that the non-harmonic part alone carries enough signal.

Correlations across the six statistics, on eight fullerenes:

| Statistic α | Sum | Avg | Max | Std | Var | Sec (λ̃₂) |
| --- | --- | --- | --- | --- | --- | --- |
| Pearson correlation | 0.942 | 0.985 | 0.986 | 0.969 | 0.977 | 0.981 |

The best is `Max` at 0.986; even the worst is 0.942. Per-molecule, with α = Max (eV/atom):

| | C20 | C24 | C26 | C30 | C32 | C36 | C50 | C60 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reference | 1.180 | 1.050 | 0.989 | 0.850 | 0.781 | 0.706 | 0.509 | 0.401 |
| Predicted | 1.138 | 1.050 | 0.964 | 0.821 | 0.857 | 0.766 | 0.474 | 0.391 |

How much this establishes needs care. The correlation is computed on the same eight points the linear model was fit to, so it measures fit rather than generalization; with eight points and a smooth monotone target in fullerene size, a high correlation is a low bar. The authors themselves flag the C36 discrepancy and attribute it to a possible mismatch between their structural data and the reference calculation's ground state, and they note that limited availability of ground-state structures prevented analysis of the full fullerene family. Read as a proof of principle that non-harmonic spectra track a physical quantity, it succeeds. Read as a benchmark, it is eight points.

## Protein B-factors

The second application is chosen precisely because persistent homology has no natural model for it: B-factors are per-residue continuous quantities, and a barcode is not indexed by residue. The non-harmonic spectrum, with its eigenvectors, is.

The method is a multiscale generalization of GNM. For protein 2Y7L in a coarse-grained Cα representation (N = 319 residues), each atom is grown into a ball of radius r, giving a family of 0-Laplacians 𝓛_0^{r+0}. From the non-harmonic spectrum and eigenvectors, the Moore–Penrose pseudo-inverse is assembled by summing (1/λ_k) u_k u_k^T over the non-zero modes only — which is exactly why the harmonic part must be identified correctly, since including a zero eigenvalue would be a division by zero. The per-residue prediction at radius r is the corresponding diagonal entry of that pseudo-inverse, and the final estimate is a linear combination across radii,

> B_i^PST = Σ_{r=2}^{12} w_r B_i^r + w_0,

over 11 matrices at radii 2 through 12 Å with unit spacing, with w_r and w_0 fit by linear regression against experimental B-factors, and feature scaling applied to put the per-radius terms on a comparable scale. The reported Pearson correlation with experiment is 0.925, and the predicted and experimental curves track closely across the sequence.

The limitations are more serious here than in the fullerene case. This is a single protein. The weights are fit against that same protein's experimental B-factors with no held-out residues, proteins, or cross-validation, so 0.925 describes how well an 11-parameter linear model fits 319 targets, not how well the method predicts an unseen structure. And although the paper names GNM, ANM, FRI and MWCG as the established B-factor predictors this work builds on, it reports no head-to-head numbers against any of them on this protein — so the natural question of whether the multiscale spectral information beats a single-cutoff GNM is raised by the framing and left unanswered. The experiment demonstrates that the pseudo-inverse construction works and is expressive. It does not establish an improvement.

## What this paper does and does not settle

**Settled.** The persistent combinatorial Laplacian is a well-defined object on a filtration; its spectrum is real, non-negative and orientation-independent; and its zero eigenvalues reproduce persistent Betti numbers exactly. Anyone can therefore use it as a strict superset of persistent homology without worrying about losing topological information. That is a clean result and it is the reason the construction propagated.

**Demonstrated, at proof-of-principle scale.** That the non-harmonic spectrum carries physically meaningful signal, on two molecular tasks with small or single-system evidence and in-sample scoring.

**Not addressed.** Stability. Persistent homology's practical credibility rests on stability theorems bounding barcode change by input perturbation; this paper proves no analogue for the non-harmonic spectra, and eigenvalues of a matrix whose dimension changes along the filtration are not obviously well behaved. The paper's own framing — that persistent Laplacians were followed by theoretical analysis, stability results, and algorithms — is a later-literature framing, and the stability work is elsewhere. A reader adopting the method on the strength of this paper alone should know that the guarantee they are used to having does not come with it.

**Also not addressed.** Computational cost. The paper reports no complexity analysis and no timings, and the systems studied are small — 60 atoms and 319 residues. Diagonalizing a family of matrices whose dimension is the simplex count, once per filtration step, is the obvious bottleneck, and it is the problem HERMES and later PETLS were built to attack. The absence is unsurprising in a theory paper but means the practical envelope has to be read off the software rather than off this work.

**Deferred by design.** Element-specific persistent spectral theory and protein–ligand binding affinity prediction are announced in the conclusion as forthcoming. That subsequent line — conditioning the complex on atom identity before taking spectra — is what turned the method into a competitive descriptor for drug discovery, and it is the direct ancestor of the featurizers in [[topodockq]] and related structure-scoring models.

## Reading this alongside the corpus

For anyone working with the tools here, the useful mapping is:

- **[[petls]]** and **[[petls-pytorch]]** implement the object defined in Section 2.3, generalized well past this paper — arbitrary filtered boundary matrices, alpha and directed-flag complexes, cellular sheaves — and with the Schur-complement algorithm from Mémoli, Wan and Wang rather than a direct construction. This paper is what they compute; it is not how they compute it.
- **HERMES** is the authors' own implementation and the direct software expression of this paper. The PETLS benchmarks that report several-hundred-fold speedups over HERMES are measuring engineering, on the construction defined here.
- **[[topodockq]]** descends from the element-specific line the conclusion announces, not from the fullerene and B-factor applications.
- The two survey notes both cite this work as the first practical persistent combinatorial Laplacian formulation, and both then move immediately to the applications that came after it. This note is the gap between those citations and the thing cited.

The one-sentence version, for a reader deciding whether to use the method: the persistent Laplacian gives you everything persistent homology gives you, provably, plus a continuous geometric signal that persistent homology throws away — and the cost is a spectral computation per filtration step and a stability guarantee you will have to go elsewhere to find.

## References

1. Wang, R., Nguyen, D. D., and Wei, G.-W. "Persistent spectral graph." *International Journal for Numerical Methods in Biomedical Engineering* 36(9), e3376 (2020). [DOI](https://doi.org/10.1002/cnm.3376). Preprint: [arXiv:1912.04135](https://arxiv.org/abs/1912.04135).
2. Wang, R., Zhao, R., Ribando-Gros, E., Chen, J., Tong, Y., and Wei, G.-W. "HERMES: Persistent spectral graph software." *Foundations of Data Science* 3(1), 67-97 (2021). [DOI](https://doi.org/10.3934/fods.2021004).
3. Memoli, F., Wan, Z., and Wang, Y. "Persistent Laplacians: Properties, Algorithms and Implications." *SIAM Journal on Mathematics of Data Science* 4(2), 858-884 (2022). [DOI](https://doi.org/10.1137/21M1435471).
4. Jones, B. and Wei, G.-W. "PETLS: PErsistent Topological Laplacian Software." [arXiv:2508.11560](https://arxiv.org/abs/2508.11560).
5. Bahar, I., Atilgan, A. R., and Erman, B. "Direct evaluation of thermal fluctuations in proteins using a single-parameter harmonic potential." *Folding and Design* 2(3), 173-181 (1997). [DOI](https://doi.org/10.1016/S1359-0278%2897%2900024-2).
6. Atilgan, A. R., Durell, S. R., Jernigan, R. L., Demirel, M. C., Keskin, O., and Bahar, I. "Anisotropy of fluctuation dynamics of proteins with an elastic network model." *Biophysical Journal* 80(1), 505-515 (2001). [DOI](https://doi.org/10.1016/S0006-3495%2801%2976033-X).
7. Bramer, D. and Wei, G.-W. "Blind prediction of protein B-factor and flexibility." *The Journal of Chemical Physics* 149(13), 134107 (2018). [DOI](https://doi.org/10.1063/1.5048469).
8. Wei, X. and Wei, G.-W. "Persistent topological Laplacians - a survey." *Mathematics* 13(2), 278 (2025). [DOI](https://doi.org/10.3390/math13020278).
