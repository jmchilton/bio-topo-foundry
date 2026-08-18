---
type: application
title: Protein Flexibility
summary: Protein motion is measured through incompatible proxies; this guide separates their targets, protocols, and credible comparisons.
assessed: "2026-08-17"
tags:
  - application/molecular-sciences
  - modality/molecular-structure
---

# Protein Flexibility

Protein flexibility is the capacity of a folded structure to fluctuate locally and move collectively
across an ensemble of conformations. Those motions help determine binding, allostery, catalysis,
thermal stability, and which regions can accommodate a partner or perturbation. The computational
task is usually residue- or atom-level regression: given a sequence, one structure, or an ensemble,
predict a profile whose larger values identify the more mobile regions.

That description names a property, not a single observable. The literature routinely calls four
different targets "flexibility," and a correlation against one is not evidence of performance on
the others. This page was assessed on **17 August 2026**. Its enduring claim is the separation of
targets and protocols below; the named leading methods are a dated snapshot.

## Four proxies, four questions

### Molecular-dynamics RMSF

Root-mean-square fluctuation measures how far an atom or residue moves around its trajectory mean
after the trajectory has been aligned. It is the most direct of the common computational targets,
but it is conditional on the force field, solvent, temperature, simulation length, reference frame,
and whether the sampled trajectory actually crosses the motions of interest. Predicting RMSF means
approximating a particular simulation protocol, not recovering an experiment-free ground truth.

### NMR ensemble spread

Variation across deposited NMR conformers reports which coordinates are compatible with the
restraints and structure-generation procedure. It can reveal flexible regions, but ensemble spread
also reflects restraint density and modelling choices. Agreement with an NMR ensemble is therefore
a useful independent validation and still not the same target as MD RMSF.

### Cryo-EM heterogeneity and local resolution

Cryo-EM can expose multiple conformational states, while local-resolution maps identify regions the
reconstruction supports less sharply. Both can track motion, but both also absorb particle
alignment, occupancy, reconstruction, and signal-to-noise effects. Local resolution is not a
per-residue displacement measurement, and a method validated against a cryo-EM-derived fluctuation
profile should say exactly how that profile was produced.

### Crystallographic B-factors

An isotropic crystallographic B-factor is related to mean-square displacement by

> B = (8π²/3) RMSF²

only under the simple isotropic thermal-motion interpretation. A diffraction experiment averages
over time and over nominally equivalent molecules in a crystal; the refined atomic displacement
parameter also absorbs static disorder, crystal packing, occupancy, lattice and group motion,
resolution, and refinement choices such as TLS. The relationship is useful dimensional intuition,
not a conversion that makes B-factor and MD-RMSF leaderboards comparable. The crystallographic
literature itself treats B-factors as mixed displacement parameters rather than pure motion
measurements [1, 2].

## Why the old B-factor benchmark is easy to misread

The topology papers mostly inherit the Set-364 benchmark assembled for flexibility-rigidity index
work [3]. Later blind-prediction studies use 346 of those proteins after filtering. One dataset name
then hides two distinct protocols.

In the **per-protein fitting** protocol, a model's coefficients are fit separately to each target's
own experimental B-factors and scored on that same target. On the 364-protein superset, GNM reports
0.565, optimized FRI 0.673, and Persistent Sheaf Laplacian 0.682 [4, 5]. That last figure is itself
a worked example of what a transcribed number costs. The sheaf paper first published 0.751 and a
32% improvement over GNM; a June 2025 correction found that its averages had silently dropped part
of each data set, restated the superset as 0.682 and the improvement as 20%, and amended "improved
performance over all other compared methods" to "most" — because 0.682 no longer clears optimized
FRI's 0.673 by any margin worth the word. The correction leaves the blind-prediction results
unchanged [6]. These are all approximations of an observed profile once the profile has already been
shown to the model. They do not measure prediction for an unseen protein.

In the **blind** protocol, features are trained across proteins and evaluated on held-out proteins.
On the 346-protein split, mDGL reports 0.407, commutative algebra learning 0.456, and Weighted Hodge
Laplacian features 0.480; adding twelve structural and sequence features gives the latter paper's
consensus model 0.524 [7–9]. Those are not four like-for-like columns. As
[[weighted-hodge-laplacians]] records, the commutative-algebra figure quoted here matches that
paper's own consensus gradient-boosting row, so 0.456 already carries non-topological features and
the descriptor-only reading is 0.480 beating a consensus baseline rather than edging a comparable
one. A number from the first protocol cannot be placed above a number from the second either; the
roughly quarter-point gap between the protocols is primarily a change of question, not a sudden loss
of mathematical quality.

The aggregation can change the apparent result again. [[weighted-hodge-laplacians]] reports about
0.48 when Pearson correlation is computed within each held-out protein and averaged, but about
0.86 when residues are pooled and randomly split so that the same protein contributes atoms to
both training and test folds. The pooled score is useful for fitting residues within known
structures; it is not blind to protein identity.

Finally, a **consensus** row is not a pure-method row. Several papers append amino-acid identity,
secondary structure, packing-density, or sequence features to the descriptor under study. Published
comparison tables have copied those values without consistently labelling which columns contain
the extras. A defensible comparison must state target, split unit, aggregation, and feature set;
"B-factor prediction" alone states none of them.

This is also no longer the most informative default task for working protein-dynamics practice.
The current line represented by FastProtFlex trains against MD-derived RMSF and tests across MD,
NMR, and cryo-EM-derived data [10]. B-factor prediction remains a useful crystallographic benchmark,
especially when only a static structure is available, but its mixed target and mature shortcuts
make it a weak stand-in for protein dynamics as a whole.

## Dated reference points, not one leaderboard

| Proxy and protocol | Reference point at assessment | Reported evaluation |
| --- | --- | --- |
| Crystallographic B-factor, training-free | ProDy normal-mode analysis | Mean per-target PCC 0.31 on CAMEO65, 0.25 on CASP15, 0.43 on CAMEO82 [11, 12] |
| Crystallographic B-factor, learned | OPUS-BFactor-struct | Mean per-target PCC 0.61, 0.48, and 0.67 on the same three temporally newer sets [12] |
| MD-derived RMSF, coordinate-only | FastProtFlex graphlet-degree-vector model | Mean Spearman 0.792–0.794 across three ATLAS replicates; 0.817 on the full ATLAS benchmark [10] |
| Cryo-EM-derived RMSF validation | FastProtFlex | Mean correlation 0.690–0.706 across cutoffs on 321 usable proteins [10] |

These rows are intentionally grouped by target. OPUS-BFactor is the strongest B-factor model in its
reported comparison and uses ESM-2 plus a transformer-based sequence/pair architecture. FastProtFlex
is a much lighter linear model over 15 graphlet orbit counts and predicts normalized RMSF from
coordinates. Its reported 0.817 is not "better than" OPUS-BFactor's 0.67: the labels, datasets,
correlation statistic, and validation designs differ.

ProDy/GNM is the important practical anchor. It is training-free, available, interpretable, and
descends from a 1997 elastic-network model [11, 13]. A new descriptor should beat it under the same
data and split, or explain what additional capability justifies the complexity.

## Where topology sits

The topology-heavy protein-flexibility line has established that persistent, sheaf, commutative,
and weighted Laplacian spectra can encode local packing and reproduce B-factor profiles. It has not
established leadership on the current held-out benchmarks.

The founding [[persistent-spectral-graph]] result is one protein with eleven radius-specific
weights fit and scored on that protein. Later papers reach the 346-protein blind protocol, but their
pure topological or spectral descriptors remain in the same broad correlation band that
OPUS-BFactor reports for training-free ProDy on different datasets. That is a structural comparison,
not a head-to-head result: no paper here reruns ProDy, OPUS-BFactor, and the topological models on
one split.

The most revealing missing control is often simpler than another neural baseline. In
[[weighted-hodge-laplacians]], the atom-centred weight is itself a Gaussian local-packing descriptor;
the paper does not compare its spectra with summary statistics of that weight alone. In
FastProtFlex, local packing encoded by graphlet counts is already enough for strong RMSF results.
Until matched ablations separate topology from packing and matched benchmarks compare against
ProDy and current learned models, the honest position is: **topological constructions are plausible
feature generators, but there is no evidence here that topology currently wins protein-flexibility
prediction.** The experimental arc that follows this page should be read as a test of that claim,
not as an assumption that the claim is false or true.

## What a useful new result would report

A credible comparison would choose one target, freeze one protein-level split, and report the same
per-target metric for every method. It would include a training-free elastic-network baseline, a
strong non-topological learned baseline, and an ablation that preserves local distance or packing
information while removing the topological construction. For B-factors it would also stratify or
control for resolution and refinement effects. Without those choices, another correlation adds a
number to the literature without locating the method in it.

## References

1. Sun, Z. et al. "Utility of B-Factors in Protein Science: Interpreting Rigidity, Flexibility, and Internal Motion and Engineering Thermostability." *Chemical Reviews* 119, 1626–1665 (2019). [DOI](https://doi.org/10.1021/acs.chemrev.8b00290).
2. Urzhumtsev, A., Afonine, P. V., and Adams, P. D. "TLS from fundamentals to practice." *Crystallography Reviews* 19, 230–270 (2013). [DOI](https://doi.org/10.1080/0889311X.2013.835806).
3. Opron, K., Xia, K., and Wei, G.-W. "Fast and anisotropic flexibility-rigidity index for protein flexibility and fluctuation analysis." *The Journal of Chemical Physics* 140, 234105 (2014). [DOI](https://doi.org/10.1063/1.4882258).
4. Bramer, D. and Wei, G.-W. "Blind prediction of protein B-factor and flexibility." *The Journal of Chemical Physics* 149, 134107 (2018). [DOI](https://doi.org/10.1063/1.5048469).
5. Hayes, N. et al. "Persistent Sheaf Laplacian Analysis of Protein Flexibility." *The Journal of Physical Chemistry B* 129, 4169–4178 (2025). [DOI](https://doi.org/10.1021/acs.jpcb.5c01287).
6. Hayes, N. et al. "Correction to 'Persistent Sheaf Laplacian Analysis of Protein Flexibility'." *The Journal of Physical Chemistry B* 129, 6112–6113 (2025). [DOI](https://doi.org/10.1021/acs.jpcb.5c03679).
7. Feng, H., Zhao, J. Y., and Wei, G.-W. "Multiscale Differential Geometry Learning for Protein Flexibility Analysis." *Journal of Computational Chemistry* 46, e70073 (2025). [DOI](https://doi.org/10.1002/jcc.70073).
8. Zhang, H. and Feng, H. "Commutative algebra learning for protein flexibility analysis." [arXiv:2607.00879](https://arxiv.org/abs/2607.00879) (2026).
9. Su, Z., Tong, Y., and Wei, G.-W. "Weighted Hodge Laplacians on Manifolds with Boundary." [arXiv:2608.00244](https://arxiv.org/abs/2608.00244) (2026).
10. Pražnikar, J. "Fast prediction of protein flexibility." *Bioinformatics* 42, btag175 (2026). [DOI](https://doi.org/10.1093/bioinformatics/btag175).
11. Bakan, A. et al. "ProDy: Protein Dynamics Inferred from Theory and Experiments." *Bioinformatics* 27, 1575–1577 (2011). [DOI](https://doi.org/10.1093/bioinformatics/btr168).
12. Yang, Y. et al. "OPUS-BFactor: Predicting Protein B-Factor with Sequence and Structure Information." *Molecules* 30, 2570 (2025). [DOI](https://doi.org/10.3390/molecules30122570).
13. Bahar, I., Atilgan, A. R., and Erman, B. "Direct evaluation of thermal fluctuations in proteins using a single-parameter harmonic potential." *Folding and Design* 2, 173–181 (1997). [DOI](https://doi.org/10.1016/S1359-0278%2897%2900024-2).
