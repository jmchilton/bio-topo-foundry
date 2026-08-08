---
type: package
title: TopoDockQ
summary: A persistent-Laplacian scorer predicting DockQ interface quality to rank and filter peptide-protein docking poses.
repository: https://github.com/XDaiNYU/TopoDockQ
languages:
  - Python
software_license:
  status: declared
  id: MIT
tags:
  - method/persistent-homology
  - method/persistent-laplacian
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# White Paper: TopoDockQ

## Topological confidence scoring and non-canonical peptide modeling

**Primary source:** Xuhang Dai, Rui Wang, and Yingkai Zhang, "Topological deep learning for enhancing peptide-protein complex prediction," *Communications Chemistry* 8, 347 (2025), published 12 November 2025. [Journal article](https://doi.org/10.1038/s42004-025-01727-4) | [PMC full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC12612092/) | [Supporting Information](https://static-content.springer.com/esm/art%3A10.1038%2Fs42004-025-01727-4/MediaObjects/42004_2025_1727_MOESM2_ESM.pdf)

**Access and license:** The version of record is open access under the [Creative Commons Attribution 4.0 International license](https://creativecommons.org/licenses/by/4.0/). The article may be shared and adapted with attribution, a license link, and an indication of changes. The associated Zenodo dataset is also marked CC BY 4.0. The TopoDockQ and ResidueX GitHub repositories use the MIT license; the separate TopoDockQ-Feature repository does not display a license.

## Executive summary

TopoDockQ addresses a narrow but consequential problem in peptide-protein modeling: after a structure predictor generates several candidate complexes, which candidate should be trusted? AlphaFold2-Multimer (AF2-M) and AlphaFold3 (AF3) can produce good peptide docking poses, but their built-in confidence scores can rank incorrect interfaces highly. Dai, Wang, and Zhang train a model to predict the reference-based DockQ interface-quality score directly from a candidate structure. Their predicted value, p-DockQ, is then used to rank candidates and reject low-confidence predictions.

The distinctive representation is a persistent combinatorial Laplacian (PCL) description of the peptide-protein interface. Carbon, nitrogen, and oxygen atoms within a 10 angstrom interface cutoff become element-specific point clouds. Alpha and Rips complexes encode multiscale organization; barcode statistics, Betti-0 counts, and Laplacian eigenvalue statistics yield 2,646 features. A four-hidden-layer multilayer perceptron maps these features to p-DockQ.

The paper reports that, across five evaluation datasets filtered by a protein-peptide sequence-similarity criterion, p-DockQ reduced false-positive rate by at least 42% relative to AlphaFold confidence and increased precision by at least 6.7 percentage points. The trade-off is important: recall declined on all five filtered sets, substantially on two of them, and F1 decreased on three. TopoDockQ is therefore best understood as a more conservative selector, not an across-the-board improvement in every classification metric.

The second contribution, ResidueX, extends the workflow to peptides containing non-canonical amino acids (ncAAs). It starts from a canonical peptide scaffold, creates ncAA conformers from a SMILES string, grafts side chains while retaining the peptide backbone, ranks conformers with p-DockQ, and minimizes the selected complex using Open Force Field and OpenMM. In the paper's filtered set, 27 of 33 selected ncAA peptide conformers had all-heavy-atom peptide RMSD within 3 angstrom of the crystal structure, but only 16 of 33 met that threshold for the ncAA side chain itself.

The work is a credible proof of concept with unusually substantial public artifacts: model code, tutorials, pretrained weights, interface structures, features, and generated complexes. It is not yet a general validation of topological scoring for peptide therapeutics. The benchmarks are retrospective, some filtered sets are small, ncAA scoring is out of training distribution, cyclic peptides were not evaluated, and no experimental binding or prospective design study was performed. There is also no ablation showing that the PCL representation beats comparably sized non-topological geometric or contact features.

## Scientific problem and scope

Peptide-protein docking combines two difficult tasks. A peptide is flexible, and the receptor can also reorganize on binding; global docking must search possible binding sites as well as conformations. Even when a modern predictor samples a near-native pose, model selection can fail if its confidence metric rewards an incorrect interface. A high false-positive rate is costly because a selected pose may drive molecular simulation, mutational design, synthesis, or experimental screening.

TopoDockQ does not perform docking and does not repair a candidate structure. It is a post-prediction quality estimator. It takes a modeled peptide-protein complex, represents its interface, and predicts the DockQ score that would have been obtained if a native reference structure were available. At deployment time the native structure is, by definition, absent; the learned p-DockQ is used as a proxy.

The paper places this selector inside two workflows:

1. Rank AF2-M or AF3 candidate complexes and select the top model.
2. Use a high-p-DockQ natural-amino-acid complex as the scaffold for ResidueX, generate ncAA alternatives, rank them again, and minimize the selected structure.

This scope matters. A high p-DockQ supports a claim about modeled interface similarity, not binding affinity, biochemical activity, selectivity, solubility, permeability, toxicity, or therapeutic success.

## Conceptual foundations

### DockQ as the learning target

DockQ combines three reference-dependent measures:

- \(F_{\mathrm{nat}}\), the fraction of native interface contacts recovered;
- LRMSD, the ligand or peptide backbone RMSD after receptor superposition;
- iRMSD, the RMSD over interface residues.

Each RMSD is transformed by \(1/(1 + (RMSD/d)^2)\), using scale factors of 8.5 angstrom for LRMSD and 1.5 angstrom for iRMSD, and the two transformed terms are averaged with \(F_{\mathrm{nat}}\). The score ranges from 0 for a wrong pose to 1 for a native-like interface. The paper uses the standard quality intervals: below 0.23 is incorrect, 0.23-0.49 acceptable, 0.49-0.8 medium, and above 0.8 high quality (Methods and Fig. 5).

This target is better suited to interface assessment than peptide RMSD alone. Figure 5 illustrates why: an AF2-M model of PDB 1OU8 has peptide backbone RMSD of 3.8 angstrom but DockQ of 0.835 because its iRMSD is 1 angstrom and it recovers all native contacts. DockQ preserves this interface information in a continuous target.

The article classifies an observed DockQ above 0.8 as truly high quality. For p-DockQ and AlphaFold confidence, it uses 0.82 as the positive-prediction threshold because that value maximized F1 in the reported threshold analysis (Supplementary Fig. 4). This common numeric threshold does not make the two scores intrinsically calibrated to each other.

### Persistent combinatorial Laplacians

A filtration is a nested sequence of simplicial complexes built as a distance threshold grows. Ordinary persistent homology tracks when components, loops, and cavities appear and disappear. A combinatorial Laplacian is constructed from boundary matrices connecting simplices of adjacent dimensions. For a persistent Laplacian \(L_q^{t,p}\), the multiplicity of zero eigenvalues recovers the persistent Betti number: the number of \(q\)-dimensional holes present at filtration step \(t\) that persist to \(t+p\). Nonzero eigenvalues add geometric or shape-sensitive information that a Betti count alone does not preserve.

TopoDockQ uses this spectral-topological machinery as engineered input features rather than learning directly on a simplicial complex. The scientific hypothesis is that a correct interface has characteristic multiscale connectivity and shape across chemically differentiated atom pairs, and that these patterns can predict reference-based interface quality.

## The TopoDockQ pipeline

Figure 1 and the Methods specify the following path from structure to score.

### 1. Define the interface

The workflow extracts protein and peptide residues with a heavy atom within 10 angstrom of the other chain. The public tools expect protein chain A and peptide chain B. Only C, N, and O coordinates are retained. Hydrogen, sulfur, phosphorus, metals, cofactors, water, charges, residue identity, and explicit bond chemistry are not represented directly.

### 2. Build element-specific complexes

The three elements on the protein side and the same three on the peptide side form nine ordered channels: CC, CN, CO, NC, NN, NO, OC, ON, and OO.

For Rips complexes, the construction is bipartite: within-protein and within-peptide distances are effectively set to infinity, so simplices encode cross-interface contacts. For Alpha complexes, the corresponding protein and peptide atom sets are pooled into a complete geometric construction. Varying distance creates nested families in each channel.

### 3. Generate 2,646 features

The article reports three blocks:

| Feature block | Construction | Count |
|---|---|---:|
| Eigenvalue statistics | Six summaries of nonzero spectra plus Betti-0 information over 9 Rips channels and 33 thresholds from 2 to 10 angstrom in 0.25 angstrom steps | 2,079 |
| Betti-0 counts in bins | Component-death counts in 21 filtration bins for 9 Rips channels | 189 |
| Barcode statistics | Summaries of Rips \(H_0\) and Alpha \(H_1/H_2\) barcodes over 9 channels | 378 |
| **Total** | Concatenated one-dimensional representation | **2,646** |

The repository documentation describes a raw 2,754-column feature output and removal of constant or invalid columns to reach the 2,646 inputs used by the model. Reported feature generation averages about three seconds per interface with eight CPU cores and 12 GB RAM.

### 4. Predict p-DockQ

The neural network has four hidden layers of 2,048 units, ReLU activation, batch normalization, Xavier weight initialization, and dropout set to zero in the released configuration. Features are standardized using training-set statistics. Training uses Adam, learning rate 0.0005, batch size 512, and the checkpoint with lowest validation RMSE. The article reports about two hours on an NVIDIA A100.

The released PyTorch model has a linear output rather than a sigmoid. Thus, although DockQ labels lie between 0 and 1, the architecture does not mathematically constrain p-DockQ to that interval. Any production implementation should define how to handle out-of-range predictions.

## ResidueX: from canonical scaffold to ncAA complex

ResidueX is modular and may accept an experimental or computational peptide scaffold. In the paper's integrated workflow (Fig. 4):

1. TopoDockQ selects a high-confidence peptide-protein scaffold.
2. RDKit generates up to 200 conformers of a user-specified ncAA from SMILES, with methyl caps.
3. Each ncAA side chain is aligned and grafted while preserving peptide backbone atoms N, CA, and C=O.
4. TopoDockQ scores the resulting interface conformers; the highest p-DockQ conformer is retained, and candidates below 0.82 may be filtered.
5. The selected complex is minimized with OpenMM. The ncAA uses OpenFF Sage with AM1-BCC charges, while canonical residues use Amber ff14SB.

This is a conformer-generation and local-refinement strategy. Natural residues act as placeholders during initial AlphaFold prediction, so the starting backbone may not accommodate a bulky ncAA. Minimization cannot guarantee correction of a systematically wrong backbone or binding mode.

## Datasets and evaluation design

SinglePPD was curated from the 2022 BioLiP release. It includes X-ray structures at resolution <=2.5 angstrom with one protein and one natural, linear, non-covalently bound peptide. PDB IDs were split into 1,837 training, 193 validation, and 191 test complexes, with no PDB ID overlap. AF2-M generated 50 candidate models per complex. AF3, used for evaluation rather than training because of the authors' stated usage restrictions, generated five models per case.

External and stress-test sets include:

- Latest: 89 complexes deposited from 1 January 2023 through 1 May 2024.
- PFPD: 27 nonredundant peptide-protein complexes used to compare docking methods.
- LEADSPEP: 43 selected single-protein, single-peptide cases from a 53-complex benchmark.
- ncAA-1: 150 linear complexes containing exactly one ncAA.
- PFPD_42: 42 redundant complexes used to examine DockQ against RMSD and contacts.

For the central evaluation, the authors retain cases whose product of protein and peptide sequence similarities to the closest training pair is <=0.70. This yields 118 SinglePPD-Test, 75 Latest, 20 PFPD, 33 LEADSPEP, and 138 ncAA-1 complexes. A stricter SinglePPD-Test_LowSimilarity set contains 80 cases with a similarity product below 0.30.

For each target, models are ranked by either AlphaFold confidence or p-DockQ, and only the top-ranked model is classified. This is a model-selection evaluation, not a per-model calibration study. The sequence-product filter reduces obvious overlap, but it can still retain a complex when one partner is highly similar to training and the other is dissimilar.

## Main reported results

All claims in this section are the authors' reported benchmark results, not independent replication.

### Structure generation

On PFPD, the authors report a success rate of 81% for AF3 and 67% for AF2-M when success means that at least one generated model has peptide backbone RMSD <=3 angstrom. Supplementary Figure 1 reports 48% for PIPER-FlexPepDock, 25% for pepATTRACT, 22% for HADDOCK, and 7% for NeuralPLexer under the study's comparison. Sampling budgets differ - 50 AF2-M models and five AF3 models per target - and several comparator results were taken from prior work, so this is contextual rather than a controlled compute-matched leaderboard.

### Conservative top-1 selection

Across the five 70%-filtered datasets, the article summarizes a relative FPR reduction of at least 42% and a precision increase of at least 6.7 percentage points. Values visible in Figure 2 include:

| Dataset | FPR, AF confidence -> p-DockQ | Precision, AF confidence -> p-DockQ |
|---|---:|---:|
| LEADSPEP_70% | 0.33 -> 0.00 | 0.87 -> 1.00 |
| PFPD_70% | 0.50 -> 0.29 | 0.75 -> 0.80 |
| ncAA-1_70% | 0.19 -> 0.06 | 0.64 -> 0.77 |
| SinglePPD-Test_70% | baseline bar not visible; p-DockQ 0.15 | 0.67 -> 0.84 |
| Latest_70% | 0.29 -> 0.14 | 0.59 -> 0.65 |

Supplementary Figure 5 makes the precision-recall trade-off explicit. Recall changes from 0.83 to 0.71 on LEADSPEP, 0.64 to 0.62 on PFPD, 0.64 to 0.45 on ncAA-1, 0.83 to 0.81 on SinglePPD-Test, and 0.77 to 0.54 on Latest. F1 improves only on PFPD (0.69 to 0.70) and SinglePPD-Test (0.74 to 0.83); it declines on the other three.

On the stricter 80-case low-similarity test, Supplementary Figure 6 reports FPR 0.33 -> 0.14, precision 0.65 -> 0.82, recall 0.80 -> 0.73, and F1 0.72 -> 0.77. This is useful evidence that the effect is not limited to the least stringent similarity filter, although it remains an internal derivative of SinglePPD.

For AF3-generated ncAA-1 complexes on the full set, the article reports FPR 0.44 -> 0.07 and precision 0.54 -> 0.85. Of 41 AF3 scaffolds selected from ncAA-1, 85% had observed DockQ above 0.8.

### ncAA conformers

Before p-DockQ filtering, 31 of 41 selected ResidueX conformers had whole-peptide all-heavy-atom RMSD <=3 angstrom; after filtering, 27 of 33 did so (75.61% and 81.82%, respectively). Side-chain accuracy was weaker: 21 of 41 unfiltered and 16 of 33 filtered ncAA side chains were within 3 angstrom (51.22% and 48.48%). This distinction prevents the strong global peptide result from being misread as precise ncAA rotamer placement.

## Evidence quality, limitations, and open questions

The study has several strengths. It is peer reviewed; separates PDB IDs across training, validation, and test; evaluates multiple curated datasets; adds a post-2023 set; reports both full and sequence-filtered analyses; includes a stricter low-similarity stress test; and releases substantial code and data. It also reports precision, recall, FPR, and F1 rather than only a favorable headline metric.

Important limitations remain:

- **Retrospective ground truth:** DockQ requires a known native structure. The model learns structural agreement with crystallography, not experimental binding or prospective design success.
- **Precision-recall trade-off:** lower FPR comes partly from conservative rejection. Whether this is desirable depends on the cost of false positives versus missed good poses.
- **Limited statistical characterization:** filtered benchmark sizes range from 20 to 138 complexes. The paper gives point estimates but no confidence intervals, target-level bootstrap analysis, or statistical tests.
- **Threshold calibration:** the article says 0.82 maximized F1 "throughout the evaluation," but does not clearly establish that this cutoff was fixed on a wholly separate calibration set.
- **Residual relatedness:** the product-of-similarities rule permits one highly similar partner when the other is dissimilar. Structure-, family-, or receptor-cluster-held-out tests would be stronger.
- **No representation ablation:** the study does not compare PCL features with matched contact maps, distance histograms, physicochemical descriptors, or geometric neural networks. The results support the full pipeline, not a causal claim that topology is the source of the gain.
- **Domain limits:** training uses natural, linear peptides. ncAA scoring is out of distribution, and cyclic peptides are explicitly unevaluated.
- **Missing molecular context:** water, ions, cofactors, protonation, pH, and explicit sulfur-containing interactions can alter interface geometry. The paper assumes pH 7.4 for ncAA modeling.
- **No prospective experiment:** there is no blinded challenge, synthesized peptide, affinity measurement, or downstream biological validation.

Two documentation anomalies deserve correction. First, the main Methods, repository scripts, and the highlighted bar in Supplementary Figure 11 indicate batch size 512, but that figure's caption says 256. Second, Figure 2A does not visibly show the AF-confidence FPR bar for SinglePPD-Test_70%, even though the prose claims FPR reduction on all five sets. These appear to be reporting inconsistencies rather than evidence against the method, but they impede exact reconstruction.

An architectural detail also warrants attention: the released MLP's final layer is linear, so the statement that a bounded DockQ target "naturally constrains the output range" is not literally true for predictions. Calibration, clipping policy, and performance of out-of-range cases are open questions.

## Practical and reproducibility guidance

A sensible reproduction should proceed in increasing order of cost:

1. **Pin artifacts.** Record the article version, Git commit hashes, model checksum, feature-column list, and Zenodo file checksums. The inspected TopoDockQ commit was `5696f82e148fc4a2eb07962d5bbc333d06d76a74`.
2. **Reproduce inference on supplied features first.** Download `processed_data.zip` (about 662 MB) and `trained_model.zip` (about 67 MB), then run the released tutorial before attempting feature generation or retraining. The inference code reconstructs the scaler from training features; the checkpoint alone is insufficient.
3. **Match preprocessing exactly.** Extract a 10 angstrom interface, use protein chain A and peptide chain B, retain the expected C/N/O channels, preserve feature order, and reduce the raw 2,754 columns to the released 2,646 valid columns.
4. **Use the declared runtime.** TopoDockQ specifies Python 3.8.18, GUDHI 3.8.0, scikit-learn 1.3.0, NumPy <=1.24.3, and PyTorch >=2.0. The feature generator is distributed primarily as CPython 3.8 bytecode, which makes the exact interpreter material.
5. **Validate numerical equivalence.** Compare generated `.npy` features against the supplied examples before trusting a new platform. Check p-DockQ for supplied cases, then reproduce RMSE/Pearson correlation and target-level selection metrics.
6. **Evaluate locally relevant splits.** For a real program, hold out receptor families, peptide scaffolds, modification classes, and chronological data. Report calibration, uncertainty, and top-k enrichment, not only a single threshold.
7. **Treat ResidueX structures as hypotheses.** Inspect steric clashes, protonation, water-mediated contacts, and cofactor/metal context. Use molecular dynamics or experimental structure determination where local ncAA placement is decisive.

The public record is substantial: the Zenodo deposit contains 19 files totaling about 31.5 GB, including generated AF2-M/AF3 models, interfaces, processed features, pretrained weights, and pre-/post-minimization ncAA conformers, with file checksums. The main TopoDockQ and ResidueX repositories include MIT licenses, examples, tutorials, and environment files. Reproducibility is weakened by the absence of automated tests or continuous integration, broad rather than fully locked dependency constraints, no separately serialized scaler, and distribution of core feature-generation routines as `.pyc` bytecode without corresponding source. The unlicensed TopoDockQ-Feature repository also creates reuse ambiguity despite public access.

## Conclusion

TopoDockQ is a focused application of spectral topological descriptors to an important operational bottleneck: selecting peptide-protein complex models without a native reference. Its strongest result is not that topology solves docking, but that a learned interface representation can shift selection toward higher precision and fewer false positives across several retrospective datasets. The cost is lower recall, and the value of that trade depends on the downstream decision.

ResidueX broadens the system from model assessment to non-canonical peptide hypothesis generation. Its whole-peptide results are encouraging, while the weaker side-chain results correctly signal that interface-level confidence is not atom-level certainty. Together, the tools form a useful research pipeline for prioritization and scaffold exploration, provided users preserve exact preprocessing, validate on domain-relevant splits, and treat outputs as computational candidates rather than experimentally established designs.

The next decisive evidence would be an independently reproduced benchmark with family- and time-held-out targets, calibrated uncertainty, matched non-topological baselines, and a prospective ncAA design campaign. Such work would show whether TopoDockQ's reduced false-positive rate translates into fewer failed experiments and better peptide discovery decisions.

## Source note and selected verified references

This white paper is an independent synthesis. Article-reported claims are identified as such; limitations, reproducibility observations, and deployment guidance are this white paper's assessment. The complete 13-page version-of-record PDF and 10-page Supporting Information were read, rendered, and visually inspected, including Figures 1-5, Tables 1-3, Supplementary Figures 1-11, and Supplementary Tables 1-2. Public repositories and Zenodo metadata were inspected on 28 July 2026. No model was retrained and the reported benchmark results were not independently recomputed.

1. Dai, X., Wang, R., and Zhang, Y. "Topological deep learning for enhancing peptide-protein complex prediction." *Communications Chemistry* 8, 347 (2025). [DOI](https://doi.org/10.1038/s42004-025-01727-4)
2. Basu, S. and Wallner, B. "DockQ: A Quality Measure for Protein-Protein Docking Models." *PLoS ONE* 11, e0161879 (2016). [DOI](https://doi.org/10.1371/journal.pone.0161879)
3. Wang, R., Nguyen, D. D., and Wei, G.-W. "Persistent spectral graph." *International Journal for Numerical Methods in Biomedical Engineering* 36, e3376 (2020). [DOI](https://doi.org/10.1002/cnm.3376)
4. Wang, R. et al. "HERMES: Persistent spectral graph software." *Foundations of Data Science* 3, 67-97 (2021). [DOI](https://doi.org/10.3934/fods.2021006)
5. Alam, N. et al. "High-resolution global peptide-protein docking using fragments-based PIPER-FlexPepDock." *PLoS Computational Biology* 13, e1005905 (2017). [DOI](https://doi.org/10.1371/journal.pcbi.1005905)
6. Eastman, P. et al. "OpenMM 7: Rapid development of high performance algorithms for molecular dynamics." *PLoS Computational Biology* 13, e1005659 (2017). [DOI](https://doi.org/10.1371/journal.pcbi.1005659)
7. Boothroyd, S. et al. "Development and benchmarking of Open Force Field 2.0.0: the Sage small molecule force field." *Journal of Chemical Theory and Computation* 19, 3251-3275 (2023). [DOI](https://doi.org/10.1021/acs.jctc.3c00039)

**Reproducibility resources:** [TopoDockQ code](https://github.com/XDaiNYU/TopoDockQ) | [PCL feature generator](https://github.com/wangru25/TopoDockQ-Feature) | [ResidueX](https://github.com/XDaiNYU/ResidueX) | [Zenodo data record](https://zenodo.org/records/15469415)
