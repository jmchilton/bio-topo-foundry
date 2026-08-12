---
type: paper
title: Weighted Hodge Laplacians
summary: Su, Tong and Wei swap the filtration for a weight function, and finally give the B-factor claim the 346-protein blind evaluation it always needed.
citation: Zhe Su, Yiying Tong, and Guo-Wei Wei, "Weighted Hodge Laplacians on Manifolds with Boundary," arXiv:2608.00244v1 (2026).
source_url: https://arxiv.org/abs/2608.00244
source_ids:
  status: declared
  arxiv: "2608.00244"
version: v1
access_date: "2026-08-12"
source_read: full-text
source_license:
  status: declared
  id: LicenseRef-arXiv-nonexclusive-distrib-1.0
derived: own-words-summary
tags:
  - method/spectral-geometry
  - application/molecular-sciences
  - modality/molecular-structure
---

# White Paper: Weighted Hodge Laplacians

## A white paper synthesis of Su, Tong and Wei (2026)

**Primary source:** Zhe Su, Yiying Tong, and Guo-Wei Wei, "Weighted Hodge Laplacians on Manifolds with Boundary." Submitted to arXiv 31 July 2026 as v1. [arXiv:2608.00244](https://arxiv.org/abs/2608.00244) | [arXiv DOI](https://doi.org/10.48550/arXiv.2608.00244). MSC 58A14, 55N31; posted to math.DG.

**Access and reuse:** the arXiv record declares the [arXiv perpetual non-exclusive distribution license 1.0](http://arxiv.org/licenses/nonexclusive-distrib/1.0/), a grant from the authors to arXiv that confers no redistribution right on a third party. This note is therefore an own-words summary carrying no quoted prose. Equation and section numbers below are v1's. No journal version exists at the access date.

**Why this note exists.** [[persistent-spectral-graph]] is the founding paper of the topological-Laplacian line, and this corpus's note on it ends with a specific complaint: its protein B-factor experiment is one protein, with an eleven-parameter linear model fit against that same protein's experimental values and scored on them, and no head-to-head number against the elastic-network models it says it improves on. This paper is the same senior authors, on the same task, six years later. The narrow question worth answering is whether the evidence caught up with the machinery.

It did. That is the finding, and the rest of this note is what it cost and what still is not shown.

## Executive summary

The construction is a one-line change with a large consequence. Take the Hodge Laplacian on a compact Riemannian manifold with boundary, pick a smooth weight function *f*, and replace the codifferential δ with

> δ_f := e^f δ e^{−f}

leaving the exterior derivative *d* alone. The weighted Hodge Laplacian is then Δ_f = dδ_f + δ_f d, and it is the *drifting* Hodge Laplacian already known from Bakry–Émery geometry; the paper's contribution on the theory side is to carry it onto manifolds *with boundary* under normal and tangential boundary conditions, and to give it a discretization that runs.

Because *d* is untouched, the de Rham complex and its cohomology are exactly what they were. The kernels of the weighted Laplacians are the weighted harmonic spaces, those are isomorphic to the relative and absolute de Rham cohomology, and their dimensions are the ordinary Betti numbers. Every bit of the weight lands in the non-harmonic spectrum.

That is the same harmonic/non-harmonic split [[persistent-laplacian]] describes, arrived at from the opposite direction. In the persistent construction the second axis is a filtration parameter, and varying it is what generates a family of operators. Here there is no filtration at all. The manifold is fixed and the *weight* varies, and a weight can be chosen to emphasize a region — which is the whole point, because a filtration cannot.

The application makes the difference concrete. A B-factor is a per-atom number, and a persistent barcode is not indexed by atoms; the founding paper's answer was eigenvectors of the Laplacian, which are. This paper's answer is one Laplacian *per atom* on a shared protein manifold, differing only in a weight function centred on that atom. Every atom gets its own spectrum of the same operator on the same domain, which is a cleaner way to get locality than either.

The evaluation is the part that has changed. Where the founding paper had one protein, this has 346, with three published baselines, protein-level ten-fold cross-validation, and identical protocol claimed. Its topological and geometric features alone reach a protein-level Pearson correlation of 0.480 against a best prior of 0.456; adding twelve non-topological structural features reaches 0.524. Those are real numbers on a real benchmark, and the comparison to the 2020 paper's single in-sample protein is not close.

What has *not* changed is the reporting. The paper gives one averaged correlation per cell, with no standard deviation, no seeds, and no significance test — while the strongest baseline in the table reports its own protein-level figure as 0.456 ± 0.161 over a hundred runs. And the number of eigenvalues *k* is chosen by sweeping it and keeping whichever value scored best on the same cross-validation the result is reported from. A reader wanting to know whether 0.480 beats 0.456 cannot answer it from this paper.

## The construction

### What the weight does, and what it provably cannot do

The weighted measure dμ_f = e^{−f}dμ makes (M, g, dμ_f) a Bakry–Émery manifold, and induces a generalized inner product (ω, η)_f = ∫_M ⟨ω, η⟩_g e^{−f} dμ (Eq. 16), which reduces to a scalar multiple of the standard Hodge L² product when *f* is constant. With respect to that product δ_f is adjoint to *d* — on closed manifolds directly, and on manifolds with boundary once restricted to the *f*-modified normal forms and the tangential forms.

The asymmetry between *d* and δ_f is the load-bearing part. Multiplying a form by a scalar function changes neither closedness nor the homogeneous boundary conditions, so the de Rham complex, the relative cohomology, and the Betti numbers are untouched by any choice of *f*. Under normal boundary conditions ker Δ^k_{n,f} = ℋ^k_{n,f} ≅ H^k_dR(M, ∂M); under tangential conditions ker Δ^k_{t,f} = ℋ^k_{t,f} ≅ H^k_dR(M); the weighted Hodge star gives ℋ^k_{n,f} ≅ ℋ^{m−k}_{t,−f}.

State the consequence plainly, because it governs how the experiment should be read: **the harmonic spectrum cannot see the weight.** Choosing *f* to spotlight one atom changes the non-zero eigenvalues and nothing else. The paper says as much — the kernels are of the same dimension for every atom, determined by the manifold's topology.

Two smaller notes on the theory. First, these identifications are stated as following by adapting the classical Hodge-theoretic arguments to the weighted setting; the paper contains seven Remarks and no numbered theorem, and the corresponding de Rham–Hodge theory for the drifting Laplacian on non-compact manifolds is Bueler's, already in the literature. This is a formulation paper, not a proof paper, and it does not claim otherwise. Second, the weighted Hodge decomposition it derives is a four-component orthogonal splitting; the five-component Hodge–Morrey–Friedrichs analogue is named as open.

### The road not taken

The paper is explicit that modifying only δ is a choice. The alternative is the Witten Laplacian, which modifies *d* and δ together and — as the conclusion observes — keeps every standard result with respect to the *unmodified* L² product, so no inner product has to be redefined at all. Having spent the paper redefining one, the authors close by pointing at the version that would not have required it, and leave it to future work. A reader deciding which weighted Laplacian to build on should read that paragraph before this one.

## Computing it

The discretization is discrete exterior calculus on a regular Cartesian grid, in the Eulerian representation inherited from the authors' own persistent de Rham–Hodge work: the manifold is a sublevel set of a level-set function on a fixed grid, so vertices, edges, faces and cells never move and every operator is a fixed sparse matrix. Boundary conditions are imposed by projection matrices P_k that include or exclude whole *k*-cells — the normal support being the primal cells with at least one vertex inside M. The Hodge star carries the geometry: each diagonal entry replaces the primal cell's full volume with the volume of its intersection with M, dual volumes unchanged, with a 10^{−5}-scale perturbation of the level-set values to keep cells off the boundary exactly.

Then comes the simplification that the experiments actually run on. On a regular grid the discrete Hodge star is nearly a rescaled identity, so replacing it with the identity yields the *boundary-induced graph* (BIG) Laplacian, which has the same rank deficiencies and therefore the same cohomology, and whose spectrum converges to the Hodge Laplacian's up to scaling. The weighted version keeps the weighted star as the inverse exponential weight matrix and drops only the metric one:

> L^B_{k,f} = D_k^T W_{k+1}^{−1} D_k + (W_k)^{−1} D_{k−1} W_{k−1} D_{k−1}^T (W_k)^{−1}  (Eq. 36)

This is worth reading carefully, because it is the paper's introduction in tension with its experiments. The introduction's case for Hodge over combinatorial Laplacians is that Hodge Laplacians encode the Riemannian metric and therefore the intrinsic geometry, which combinatorial Laplacians on point clouds do not. The BIG simplification discards precisely the metric term, keeping the weight. The justification offered — that the star is nearly a rescaled identity — is stated for the regular grid, and the entries where it is least true are the boundary-clipped ones from §4.2, which is to say the entire subject of a paper about manifolds *with boundary*. The paper reports no spectral comparison between the two operators on these manifolds, so how much is given up is not established here either way.

Section 4.3 does not analyse the discrete spectra afresh; it observes that the weight only changes diagonal entries of the discrete stars and refers the reader to the unweighted treatment. The upshot is that this paper contains no numerical validation of its own discretization — no convergence study, no verification that computed Betti numbers match known ones, no timings, and not one worked example. Its entire numerical content is Figure 1, a schematic, and Table 1.

Set that beside [[persistent-spectral-graph]], which tabulates boundary matrices, nullities and full spectra step by step for a five-point filtration and for benzene, and reads C60's two bond lengths off the β₀ plot. Those worked examples are why that paper is reimplementable. This one is not, from the paper alone.

## The protein flexibility experiment

**Getting a manifold out of a point cloud.** Protein coordinates are a point cloud and the framework needs a manifold, so each protein's Cα atoms are pushed through a flexibility–rigidity-index density, ρ(x, τ) = −Σ_i exp(−(‖x − x_i‖/τr)²) with r = 1.7 Å the Cα van der Waals radius, and M is the sublevel set {ρ ≤ c} with τ = 1, c = −0.1 for every protein — values chosen to give smooth manifolds with stable topology.

**Getting locality out of a weight.** For the atom at x̄, the weight is a distance-weighted sum of the same Gaussians over neighbours within an 11 Å cutoff, each neighbour damped by exp(−‖x_j − x̄‖²/2η²), with τ = 5 and η = 4. (The symbol τ carries a different value in the weight than in the manifold density — a notation collision worth knowing about before reimplementing.) One manifold per protein, one weight and therefore one Laplacian per atom.

**Features.** Only the weighted BIG Laplacian L^B_{3,f} under normal boundary conditions is computed, for efficiency, on a grid of length 1; its spectrum plays the role the 0-Laplacian plays in the combinatorial setting. Each atom gets β₀ plus the first *k* non-zero eigenvalues, so *k* + 1 features. The consensus model adds twelve more: R-value, resolution and heavy-atom count from the PDB file, and nine local ones from STRIDE — three packing densities, residue type, occupancy, secondary structure, φ and ψ, and solvent-accessible area.

**Protocol.** 346 proteins, from the 364-protein Opron benchmark less the exclusions in the mDGL paper's list, restricted to Cα atoms, more than 74,000 of them. Ten-fold cross-validation in two flavours: protein-level, where every atom of a protein stays in one fold, and atom-level, where atoms are pooled across proteins first. Gradient boosting from scikit-learn 1.4.2, 1,000 estimators, depth 7, learning rate 0.002, subsample 0.8; Pearson correlation as the metric; eigenvalues computed in MATLAB.

**Results (Table 1).**

| | mDGL | PSL | CAL | WHL | WHL consensus |
| --- | --- | --- | --- | --- | --- |
| Protein-level | 0.407 | 0.452 | 0.456 | **0.480** | **0.524** |
| Atom-level | 0.859 | 0.840 | 0.855 | 0.842 | **0.862** |

*k* is swept in increments of ten and the best kept: 120 for WHL and 90 for the consensus model at protein level, 150 and 70 at atom level.

## Does this fix the founding paper's evidence problem?

**Yes, in protocol — decisively.** Every element the [[persistent-spectral-graph]] note named as missing is present. One protein has become 346. Weights fit against the test protein's own B-factors have become a model trained on disjoint folds of proteins it has not seen. A method named as prior art but never benchmarked against has become three published models with numbers in the table. This is a different quality of evidence, and the paper deserves the credit.

**No, in reporting — and the gap is large enough to matter.** Four things stand between the table and the claim it is asked to support.

*The margins are unquantified, and the baselines quantify theirs.* CAL's own paper reports its protein-level figure as 0.456 ± 0.161 across a hundred runs — ten folds under ten seeds — on 348 proteins. This paper reports single averages with no dispersion, no seeds, and no test. A fold-to-fold standard deviation is not a standard error and does not by itself sink a 0.024 or 0.068 margin; the problem is that only one side of the comparison published enough to check.

*The best k is chosen against the number being reported.* Sweeping *k* and keeping the value that scored best on the reporting cross-validation is selection on the evaluation metric, with no nested or held-out selection. That the optimum lands at four different values across four settings — 120, 90, 150, 70 — is what selection on a noisy score looks like.

*"The same dataset" is approximate.* The numbers are transcribed from three papers rather than recomputed. CAL's cited figures match its own consensus gradient-boosting row exactly, so the CAL column is a consensus model — which makes the honest comparison WHL consensus 0.524 against CAL 0.456, and makes WHL-alone at 0.480 beating a consensus baseline the more interesting result. But CAL ran on 348 proteins to this paper's 346, and the paper does not say which of its baselines' numbers include their own consensus features. Transcription also inherits whatever has happened to the source since: the PSL paper carries a correction published in June 2025, more than a year before this submission, which this paper does not cite. Its text is paywalled at this note's access date, so whether it touches the figure in this table is unresolved here rather than settled either way.

*Only one row is blind.* Pooling atoms across proteins before splitting puts a protein's own residues on both sides of the fold boundary. Both rows are described as blind prediction; only the protein-level one is blind to the protein. The distance between 0.86 and 0.48 is a fair measure of how much of the atom-level number is that leakage, and the paper's willingness to print both is to its credit — but the atom-level row is not evidence about unseen structures, and its margin over mDGL is 0.003.

## What this paper settles, and what it does not

**Settled.** The weighted de Rham–Hodge framework is well posed on manifolds with boundary under both boundary conditions; the kernels are the weighted harmonic spaces and remain isomorphic to de Rham cohomology; the weighted BIG Laplacian preserves the rank deficiency and therefore the cohomology. A weight function is a legitimate second axis for a Hodge Laplacian, and unlike a filtration it can be aimed.

**Demonstrated.** That per-atom weighted spectra carry enough local signal to beat three published B-factor models on a shared benchmark, as reported.

**Not addressed — the ablation that would isolate the contribution.** There is no baseline separating the Laplacian from the weight. The weight function is itself a distance-damped Gaussian density over an 11 Å neighbourhood, which is to say an FRI-style local packing descriptor, and packing density is a known B-factor predictor in its own right — three of the consensus model's twelve extra features are exactly that. Nobody reports what summary statistics of *f* alone would score. Note that the obvious control, an unweighted Laplacian, is not available: without an atom-specific weight every atom in a protein receives an identical spectrum, so the weight is not an improvement over the unweighted case, it is what makes the task possible at all. That makes the *other* control the one that matters, and it is absent.

**Not addressed — the topological half earns little here.** By the paper's own theorem the kernel dimension is fixed by the manifold, so β₀ is one integer per protein, identical for all of that protein's atoms. Of *k* + 1 features it is the only topological one, it carries no within-protein signal, and it is constant across every atom in an atom-level fold. Everything that distinguishes one residue from another is non-harmonic. This is the same shape as the observation that the founding paper's headline results all sit at persistence offset *p* = 0: the topological machinery is developed, is correct, and is not what produces the numbers. Here it is guaranteed by the theory rather than merely true of the experiments.

**Not addressed — cost, and reproducibility.** No timings, no complexity discussion, and one Laplacian per atom across 74,000 atoms is not obviously cheap. The eigenvalue computation is MATLAB and no implementation is released; the linked repository is the mDGL data. There is nothing here to package.

**Not addressed — weights versus persistence.** The direct predecessor is the same three authors' persistent de Rham–Hodge Laplacian in the same Eulerian representation. This paper replaces that filtration with a weight and never compares the two on the same task, so which axis buys more on protein flexibility is open. Given that the group's persistent-Laplacian line is what produced the SARS-CoV-2 variant prediction the introduction leads with, the omission is conspicuous.

## Reading this alongside the corpus

- **[[persistent-spectral-graph]]** is the note to read first and the one this answers. Same senior author, same B-factor task, and the evidence complaint that note ends on is the one this paper resolves.
- **[[persistent-laplacian]]** describes the harmonic/non-harmonic split as a property of a filtration. This is the same split without a filtration, and it is a useful corrective: the split comes from the Hodge structure, not from persistence.
- **[[spectral-geometry]]** notes that its lineage is metric where persistent homology is topological, and that the two are easy to confuse. This paper sits across the seam deliberately — a spectral operator whose kernel is exactly topology and whose remaining spectrum is exactly geometry — which is why it carries that facet rather than the persistent-Laplacian one. It is not a persistent Laplacian and should not be filed as one.
- **[[tda-tdl-beyond-persistent-homology]]** is the review by this paper's first author, and its Hodge-Laplacian section is the map this work adds a region to.
- **[[petls]]** and [[petls-pytorch]] compute persistent Laplacians on simplicial complexes and cannot compute this. The object here is a differential operator discretized on a Cartesian grid, not a boundary-matrix construction, and no software in this corpus implements it.

The one-sentence version for a reader deciding whether to follow this line: the weighting is a genuinely better fit than a filtration when the target is per-entity and the domain is a manifold, and the 346-protein evaluation is the one the founding paper should have had — but the margins are reported to one decimal place of confidence less than the baselines they beat, and nothing yet separates what the Laplacian contributes from what its weight function already knew.

## References

1. Su, Z., Tong, Y., and Wei, G.-W. "Weighted Hodge Laplacians on Manifolds with Boundary." [arXiv:2608.00244](https://arxiv.org/abs/2608.00244) (2026).
2. Su, Z., Tong, Y., and Wei, G.-W. "Persistent de Rham-Hodge Laplacians in Eulerian representation for manifold topological learning." *AIMS Mathematics* 9(10), 27438 (2024). [DOI](https://doi.org/10.3934/math.20241333).
3. Ribando-Gros, E., Wang, R., Chen, J., Tong, Y., and Wei, G.-W. "Combinatorial and Hodge Laplacians: Similarities and Differences." *SIAM Review* 66(3), 575-601 (2024). [DOI](https://doi.org/10.1137/22M1482299).
4. Bueler, E. "The heat kernel weighted Hodge Laplacian on noncompact manifolds." *Transactions of the American Mathematical Society* 351(2), 683-713 (1999). [DOI](https://doi.org/10.1090/S0002-9947-99-02021-8).
5. Feng, H., Zhao, J. Y., and Wei, G.-W. "Multiscale differential geometry learning for protein flexibility analysis." *Journal of Computational Chemistry* 46(7), e70073 (2025). [DOI](https://doi.org/10.1002/jcc.70073).
6. Hayes, N., Wei, X., Feng, H., Merkurjev, E., and Wei, G.-W. "Persistent sheaf Laplacian analysis of protein flexibility." *The Journal of Physical Chemistry B* 129(17), 4169-4178 (2025). [DOI](https://doi.org/10.1021/acs.jpcb.5c01287).
7. Hayes, N., Wei, X., Feng, H., Merkurjev, E., and Wei, G.-W. "Correction to 'Persistent Sheaf Laplacian Analysis of Protein Flexibility'." *The Journal of Physical Chemistry B* 129(24), 6112-6113 (2025). [DOI](https://doi.org/10.1021/acs.jpcb.5c03679).
8. Zhang, H. and Feng, H. "Commutative algebra learning for protein flexibility analysis." [arXiv:2607.00879](https://arxiv.org/abs/2607.00879) (2026).
9. Opron, K., Xia, K., and Wei, G.-W. "Fast and anisotropic flexibility-rigidity index for protein flexibility and fluctuation analysis." *The Journal of Chemical Physics* 140(23), 234105 (2014). [DOI](https://doi.org/10.1063/1.4882258).
10. Wang, R., Nguyen, D. D., and Wei, G.-W. "Persistent spectral graph." *International Journal for Numerical Methods in Biomedical Engineering* 36(9), e3376 (2020). [DOI](https://doi.org/10.1002/cnm.3376).
