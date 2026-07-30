# White Paper: HiPoNet

## Multi-view simplicial learning for cohort-scale cellular point clouds

**Primary source:** Siddharth Viswanath, Hiren Madhu, Dhananjay Bhaskar, Jake Kovalic, David R. Johnson, Christopher Tape, Ian Adelstein, Rex Ying, Michael Perlmutter, and Smita Krishnaswamy, "HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell data," *Advances in Neural Information Processing Systems 38* (NeurIPS 2025), Main Conference Track. [NeurIPS proceedings](https://proceedings.neurips.cc/paper_files/paper/2025/hash/b284aad9fb5c6d74b9535a30ece69e1c-Abstract-Conference.html) | [OpenReview](https://openreview.net/forum?id=UoKt9B1aY8) | [arXiv:2502.07746](https://arxiv.org/abs/2502.07746)

**Publication status, access, and license:** OpenReview records a NeurIPS 2025 poster published on 18 September 2025 and last modified on 29 October 2025; the official proceedings identify it as a Main Conference Track paper. Both OpenReview and arXiv mark the paper [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The official conference record does not list a proceedings DOI. `10.48550/arXiv.2502.07746` identifies the arXiv preprint, not the NeurIPS proceedings item. The software has different terms: the repository's Yale Copyright 2024 license permits non-commercial use, copying, modification, and distribution, requires distributed modifications and derivatives to be made available on GitHub, and requires a separate Yale license for commercial use.

## Executive summary

HiPoNet is a neural architecture for learning from a cohort of high-dimensional point clouds. In its motivating biomedical setting, each point cloud is one patient, biopsy, organoid culture, or experimental condition; each point is a cell; and each coordinate is a measured molecular feature. The model predicts a label or continuous target for the whole point cloud rather than classifying individual cells. This cohort-level framing is useful when the outcome of interest is treatment response, recurrence, or administered intervention.

Its main design has three parts. First, several learnable feature-weight vectors create multiple views of the same cells. Second, each view induces a Vietoris-Rips complex, potentially including edges, triangles, and higher-order simplices rather than only a nearest-neighbor graph. Third, diffusion wavelets on Hodge-Laplacian-derived operators generate multiscale scattering features. The features from all simplex orders and views are pooled, concatenated, and sent to a multilayer perceptron for classification or regression.

The multi-view idea is the most immediately practical contribution. A single distance over all markers assumes that every biological process should organize cells in the same geometry. HiPoNet instead learns several diagonal feature scalings, so one view may emphasize immune markers while another emphasizes tumor-state or treatment-related markers. The resulting weights are inspectable, although they indicate predictive association rather than causal mechanism.

The paper reports strong results on three categories of experiment. HiPoNet has the lowest mean-squared error among the listed models when predicting persistence features for melanoma and patient-derived-organoid point clouds. It has the highest reported classification accuracy on the melanoma cohort, 90.90 +/- 4.92 percent, and is second on the organoid cohort, 77.38 +/- 0.94 percent versus 79.90 +/- 16.15 for TopoGNN. On six spatial tasks, it reports the highest mean AUC-ROC in five; the exception is UPMC outcome, where KNN-GCN reports 0.668 and HiPoNet 0.665.

Two qualifications materially change how the work should be described. First, the empirical datasets are not scRNA-seq benchmarks. Melanoma is multiplexed ion beam imaging (MIBI), the organoid data are mass cytometry, and the spatial cohorts use CODEX multiplex spatial protein profiles. The architecture is motivated by and could be adapted to scRNA-seq, but the paper does not demonstrate that modality. The paper calls the CODEX experiments "spatial transcriptomics," yet its own data description says that 40 protein markers per cell are measured; "spatial proteomics" is the more precise description.

Second, "topology-preserving" is an architectural and evidentiary claim, not an explicit optimization constraint. HiPoNet does not minimize a persistence-diagram distance or a topological loss. The paper provides diffusion-based theoretical results, demonstrates prediction of persistence summaries from learned representations, and gives component ablations. Those are meaningful signals that the network retains topology-relevant information, but they do not guarantee preservation of all homology groups or of a particular persistence diagram through training.

The public software is an active research codebase rather than a packaged end-user tool. As inspected on 28 July 2026, `main` resolves to commit `45a9d08c49af0aa0a2e24b840d53e0512ad69032`, dated 27 March 2026. It has 182 commits, eight GitHub stars, no tags, and no releases. Its locked environment is reproducible enough for the mathematical unit tests: 75 tests passed and one was skipped locally. Adoption is nevertheless limited by stale README commands, no continuous integration, no released checkpoints, incomplete benchmark-data preparation instructions, and spatial code that appears out of sync with the current model API.

## Problem and scope

Most single-cell workflows build one graph from all selected features and then analyze cells within that graph. This is appropriate when there is one dominant geometry, but it can entangle overlapping processes. Cell cycle, differentiation, immune activation, and treatment response may each be visible through different feature subsets. A single neighborhood graph can make one process dominate or can average them into a geometry that is not optimal for any downstream task.

HiPoNet also moves from analyzing one cell atlas to learning across a collection of them. Its input is a set of point clouds \(\{X_i\}\), each with a sample-level label. The model asks whether the distribution and organization of cell states predict a cohort-level outcome.

The method is therefore not:

- a dimensionality-reduction visualization analogous to UMAP or PHATE;
- a clustering or cell-type annotation system;
- a differential-expression or causal-inference procedure;
- a spatial-domain segmentation model;
- a clinical decision system.

It is a supervised point-cloud representation learner for classification and regression, with additional scripts for learned embeddings. Its biological results concern retrospective sample-level prediction.

## Conceptual foundations

### Simplicial complexes and Hodge structure

A graph represents vertices and pairwise edges. A simplicial complex can also contain triangles, tetrahedra, and their faces. In HiPoNet, cells are 0-simplices, sufficiently close cell pairs form 1-simplices, mutually close triples can form 2-simplices, and so on. Boundary matrices \(B_k\) encode which \((k-1)\)-simplices are faces of each \(k\)-simplex. Lower and upper Hodge Laplacians,

\[
L_k^\ell = B_k^\top B_k,\qquad L_k^u = B_{k+1}B_{k+1}^\top,
\]

connect same-order simplices through shared faces and shared cofaces. Their sum is the \(k\)-Hodge Laplacian. This lets information diffuse not only between cells but also between edges, triangles, and other higher-order relations.

A filled triangle says that three cells are mutually close under a learned metric; it does not establish a three-cell biochemical interaction. Higher-order simplices are geometric summaries whose biological meaning requires separate validation.

### Learnable multi-view construction

For view \(v\), HiPoNet learns a feature vector \(\alpha^{(v)}\) and rescales each cell \(x_i\) elementwise:

\[
\widetilde{x}_i^{(v)}=\alpha^{(v)}\odot x_i.
\]

Pairwise distances in the reweighted space are converted through a Gaussian kernel, thresholded, and used to build a Vietoris-Rips complex. Repeating this for \(V\) weight vectors gives multiple task-adapted geometries. The paper's principal ablation uses one, two, and four views and reports its best results with four.

This is constrained metric learning: each view learns a diagonal scaling, not an arbitrary nonlinear metric. Different weight vectors are not guaranteed to discover distinct biological programs. The current repository includes optional orthogonality and sparsity regularization that should not be assumed to have been used in the published benchmarks.

### Diffusion wavelets and scattering

HiPoNet turns each Hodge Laplacian into normalized transition operators that approximate diffusion over simplices. Wavelets compare diffusion at different scales, functioning as band-pass filters: short scales emphasize local variation, while longer scales capture broader organization. Absolute-value nonlinearities and a second wavelet application create first- and second-order scattering coefficients. Pooling across simplices yields a fixed-length representation even when samples contain different numbers of cells.

Unlike repeated neighbor averaging, which can oversmooth features, multiscale wavelet differences retain variation at several diffusion ranges. HiPoNet reports Dirichlet energy of \(21.033 +/- 6.25\), above graph wavelet transform at 15.807 and Graph Transformer at \(3.811 +/- 0.80\). Higher energy indicates local variation, not necessarily better generalization.

### What "topology preservation" means here

The paper proves or motivates three narrower statements under stated assumptions:

1. heat diffusion remains within connected components and therefore respects 0-homology;
2. diffusion on a simplicial complex agrees with diffusion on an associated graph whose nodes are simplices;
3. under a manifold assumption, the 0th-order Laplacian can approximate geodesic distances, with related heat-kernel quantities reflecting dimension, volume, and total scalar curvature.

Empirically, the authors train representations to predict persistence features computed from persistence diagrams. HiPoNet obtains lower error than the listed KNN-GNN and 3D point-cloud baselines. This shows that its representation carries information useful for that prediction task. It does not show exact persistence preservation, and the theory focuses heavily on connectivity and diffusion geometry rather than a stability bound for the full learned, thresholded, multi-view pipeline.

## End-to-end pipeline

The publication describes the following workflow:

1. **Form a sample-level point cloud.** Assemble an \(n \times d\) matrix for one patient, biopsy, or culture, with cells as rows and measured markers as columns. Normalize features and retain the sample-level label.
2. **Learn several feature views.** Apply each \(\alpha^{(v)}\) to the marker dimensions.
3. **Construct one complex per view.** Compute Gaussian-kernel similarities, apply a scale threshold, and create a Vietoris-Rips complex up to maximum order \(K\).
4. **Lift features to higher orders.** Initialize vertex features with the reweighted measurements and propagate them through transposed boundary matrices to obtain edge and higher-simplex features.
5. **Diffuse at multiple scales.** Build normalized operators from the Hodge structure and compute first- and second-order simplicial scattering coefficients.
6. **Aggregate.** Pool within simplex orders, combine orders within each view, then concatenate or otherwise aggregate views.
7. **Predict.** Pass the resulting representation to an MLP and optimize for the sample-level classification or regression target.

There is a technical ambiguity worth resolving in any reimplementation. The paper defines a Gaussian quantity that decreases with Euclidean separation but states a Vietoris-Rips inclusion inequality in the direction normally used for a distance. The current code retains kernel weights above a threshold, which is consistent with treating the kernel as similarity. Reproducers should follow a pinned implementation and verify neighborhood counts rather than relying only on the printed inequality.

The thresholded topology also changes discretely. Gradients can update retained edge weights and feature scalings, but a Boolean inclusion decision has no ordinary derivative at the point where an edge enters or leaves the complex. The paper's "end-to-end differentiable" wording should therefore be understood with this discrete qualification unless a smooth filtration surrogate is supplied.

## Datasets, tasks, and modality boundaries

The main paper's Table 2 and Appendix G describe these cohorts:

| Cohort | Main-paper scale | Measurement | Point-cloud target |
|---|---:|---|---|
| Melanoma | 54 samples, about 61,000 cells | 29-marker MIBI | Immunotherapy response or recurrence grouping |
| Patient-derived organoids | 1,625 cultures, about 1.8 million cells | 44-protein mass cytometry | Administered treatment |
| DFCI | 54 biopsies, about 54,000 cells | 40-plex CODEX plus coordinates | Chemotherapy outcome |
| Charville | 196 biopsies, about 196,000 cells | 40-plex CODEX plus coordinates | Outcome and recurrence |
| UPMC | 308 biopsies, about 308,000 cells | 40-plex CODEX plus coordinates | Outcome and recurrence |

For the first two cohorts, learned views are created from molecular measurements. For the spatial experiments, one view uses two-dimensional cell coordinates to define proximity and a second uses marker similarity. The code can pass molecular measurements as node features on the coordinate-defined graph, then concatenate spatial-view and molecular-view representations.

The evidence should not be generalized to scRNA-seq without a new experiment. No reported benchmark uses transcript-count matrices with the sparsity, library-size effects, gene-selection choices, and much higher feature dimension characteristic of scRNA-seq. Similarly, CODEX measures proteins, not transcripts. The method may be applicable to both, but its published validation is on single-cell and spatial proteomic measurements.

The source contains internal count discrepancies. Appendix G gives 11,862 total melanoma cells, while the introduction and Table 2 give about 61,000. For organoids, the appendix gives 1,678 cultures and about 2 million cells, while Table 2 gives 1,625 and about 1.8 million. These differences should be resolved against a released benchmark manifest before attempting an exact replication.

## Main paper-reported results

All values below are author-reported means and standard deviations over five seeds; they were not independently recomputed for this white paper.

### Persistence-feature prediction

HiPoNet reports MSE of \(0.633 +/- 0.043\) on melanoma and \(0.4046 +/- 0.006\) on PDO. The best listed KNN-GNN values are \(0.734 +/- 0.031\) for KNN-SAGE on melanoma and \(1.0338 +/- 0.010\) for KNN-SAGE on PDO. The 3D-oriented point-cloud methods have much larger reported errors, including values near 28 for PointNet++ and PointTransformer. This experiment supports topology-relevant expressivity, but its unusually large baseline gaps make preprocessing, target scaling, and output dimensionality especially important to reproduce.

### Cohort classification

| Model comparison | Melanoma accuracy (%) | PDO accuracy (%) |
|---|---:|---:|
| HiPoNet | **90.90 +/- 4.92** | 77.38 +/- 0.94 |
| Strongest reported alternative | TopoGNN, 88.18 +/- 8.19 | **TopoGNN, 79.90 +/- 16.15** |

HiPoNet is best on melanoma and second on PDO. Its much smaller PDO standard deviation is operationally relevant, but the paper does not provide paired tests or confidence intervals to establish whether the mean difference from TopoGNN is statistically meaningful.

### Spatial classification

| Cohort and task | HiPoNet AUC-ROC | Strongest listed alternative |
|---|---:|---:|
| DFCI outcome | **0.916 +/- 0.030** | KNN-SAGE, 0.820 +/- 0.040 |
| Charville outcome | **0.681 +/- 0.012** | KNN-GAT, 0.675 +/- 0.051 |
| Charville recurrence | **0.681 +/- 0.010** | KNN-GCN, 0.642 +/- 0.056 |
| UPMC outcome | 0.665 +/- 0.010 | **KNN-GCN, 0.668 +/- 0.032** |
| UPMC recurrence | **0.6044 +/- 0.000** | KNN-GIN, 0.514 +/- 0.020 |
| Melanoma response | **0.732 +/- 0.010** | KNN-GCN, 0.606 +/- 0.130 |

This is five wins in six comparisons against the baselines present in Table 3. TopoGNN and several topology-oriented models from the non-spatial table are not included in this spatial comparison. Values near 0.60 on some tasks also show that the method is not uniformly close to clinical-grade discrimination.

### Ablations and higher-order evidence

Four views outperform two and one on both melanoma and PDO. Removing multi-view learning reduces accuracy from 90.90 to 27.27 on melanoma and from 77.38 to 59.80 on PDO. Removing structural construction gives 46.08 and 14.09; removing reweighting gives 56.36 and 48.30; and replacing wavelets with diffusion alone gives 70.90 and 41.53.

The higher-order result is mixed and informative. PDO performs best with \(K=1\), which is graph-equivalent. Charville outcome improves from AUC 0.550 at \(K=1\) to 0.598 at \(K=2\), while Charville recurrence is unchanged at 0.681 for \(K=1,2,3\). UPMC recurrence improves from 0.538 to 0.6044 at \(K=2\), then falls to 0.583 at \(K=3\). Thus the paper supports dataset-dependent benefit from triangles, not a general claim that higher-order complexes always improve performance. Table A2 and Table A8 also disagree about whether the UPMC outcome or recurrence task used \(K=2\), another detail that a benchmark manifest should settle.

## Software and reproducibility assessment

The repository has a meaningful research implementation. Core modules cover batched graph diffusion, graph and simplicial wavelet transforms, learnable feature views, Hodge Laplacians, threshold selection, attention pooling, MLP heads, data loaders, and classification, regression, spatial, and embedding entry points. A March 2026 update adds a metric-aware geometric Hodge Laplacian, Cayley-Menger simplex volumes, adaptive threshold experiments, sparsity controls, and tests. These post-publication additions are not evidence for the NeurIPS benchmark and should be evaluated as a separate software version.

`.python-version` specifies Python 3.11, `pyproject.toml` requires 3.11 or later, and `uv.lock` pins PyTorch 2.8, NumPy 2.3.2, Scanpy 1.11.4, scikit-learn 1.7.1, SciPy 1.16.1, and related packages. Scanpy is a dependency, but the repository does not expose a documented `AnnData` or Scanpy API.

The mathematical test surface is a strength. The 76 collected tests cover boundary identities, simplex counts, Hodge-Laplacian properties, Betti-number behavior, Cayley-Menger volumes, gradient flow, attention pooling, diffusion, and threshold selection. In a fresh locked environment, 75 passed and one skipped. No GitHub Actions or other CI configuration is present, so upstream commits are not automatically protected by this suite.

The end-to-end reproduction surface is weaker:

- the README says Python 3.7 or later, conflicting with the current Python 3.11 requirement;
- its example invokes `train_pointcloudnet.py`, a file that does not exist on `main`;
- the repository has no versioned releases, model checkpoints, or paper-result manifests;
- benchmark input files expected by the loaders are not distributed in the documented locations, and raw-to-input preparation is not described end to end;
- the spatial script references an undefined `args.K` and calls the current `HiPoNet` constructor without all required arguments;
- baseline modules import packages such as PyTorch Lightning that are not direct project dependencies in the locked environment;
- tests focus on mathematical components rather than the complete published training and evaluation workflows.

The paper itself says that the best test metric across 100 training epochs is recorded for each run. Using the test set for checkpoint or epoch selection leaks evaluation information and can inflate performance. A reproduction should introduce a validation split, select all hyperparameters and checkpoints without consulting test labels, and evaluate the test set once.

## Evidence quality, limitations, and open questions

The study has genuine strengths: an accepted NeurIPS proceedings record, a clearly motivated architecture, theory connected to diffusion and simplicial structure, several baseline families, five-seed summaries, component and sensitivity ablations, public code, and multiple cellular cohorts. It also reports a loss on one spatial task rather than claiming a clean sweep.

The following limitations define the current evidence boundary:

- **No scRNA-seq validation:** applicability to gene-count data is plausible but untested in the paper.
- **Spatial modality mislabeling:** the spatial evidence is multiplex protein imaging, not transcriptomics.
- **Test-set selection:** choosing the best epoch on test performance weakens all benchmark estimates.
- **Small cohort counts:** some tasks have only 54 patient-level samples. Thousands of cells do not create thousands of independent patients.
- **No external or chronological validation:** all results are retrospective on named cohorts, with no prospective clinical or experimental study.
- **Limited uncertainty analysis:** standard deviations over five runs are useful, but there are no patient-level bootstrap intervals, paired significance tests, or calibration analyses.
- **Topology claim is indirect:** there is no explicit persistence-preservation loss or theorem for the complete learned thresholded model.
- **Hyperparameter sensitivity:** performance changes sharply with the Vietoris-Rips threshold and Gaussian bandwidth. Tuning these on test data would further bias results.
- **Higher-order benefit is conditional:** several best configurations use \(K=1\), and \(K=3\) can reduce performance.
- **Scaling remains difficult:** the paper gives complexity \(O(N_0^2 + VJ^2\sum_k D_kN_k)\); pairwise construction is quadratic in cells, while simplex counts can grow combinatorially. Reported training is two to three hours per dataset on one 40 GB A100, with about 400 GPU hours for reported experiments and tuning.
- **Interpretability is associative:** learned marker weights can prioritize features, but correlated markers, preprocessing, and label leakage can all affect rankings. No perturbation experiment establishes that emphasized markers drive the outcome.
- **Documentation inconsistencies:** sample counts, task wording, simplex order, kernel-threshold notation, and the current spatial API require reconciliation.

Open questions include whether learned views are stable across resampling; whether they recover reproducible gene programs in true scRNA-seq; whether a topology-aware loss adds value beyond multi-view metric learning and scattering; how HiPoNet compares with matched modern set transformers under equal tuning; and whether its performance survives site-, patient-, and time-held-out validation.

## Practical reproduction and adoption guidance

A defensible evaluation should proceed in stages:

1. **Choose the target version.** Pin the NeurIPS algorithm and a specific Git commit. Do not silently mix the published combinatorial model with the March 2026 geometric-Laplacian extensions.
2. **Review license fit.** The paper is CC BY 4.0, but the code is non-commercial. Obtain a commercial license before commercial deployment.
3. **Create the locked environment and run tests.** Use Python 3.11 and `uv sync --frozen --dev`; record platform, CUDA, package, and commit versions. Expect 75 passes and one skip at the inspected commit before adding local changes.
4. **Build a benchmark manifest.** Record every patient or culture ID, outcome, modality, cell count, feature panel, preprocessing operation, and split. Resolve the paper's sample-count and \(K\)-selection discrepancies.
5. **Separate train, validation, and test.** Fit scalers, select genes or markers, choose thresholds, tune \(K\), and stop training using training and validation samples only. Split at the patient or culture level before cell-level processing.
6. **Start with \(K=1\).** Reproduce the graph-equivalent version first, then add triangles only where memory and validation performance justify them. Report simplex counts and wall time.
7. **Test the claimed value of topology.** Compare against an MLP or DeepSets model, a KNN-GNN, a set transformer, a multi-view graph-only version, and matched non-topological geometric summaries. Keep parameter counts and tuning budgets comparable.
8. **Validate modality-specific behavior.** For scRNA-seq, document normalization, highly variable gene selection, count transformation, batch correction, and gene-panel alignment. For spatial data, say explicitly whether features are transcripts, proteins, morphology, or coordinates.
9. **Quantify stability and calibration.** Bootstrap patients, repeat splits, measure view-weight agreement, report uncertainty and calibration, and test across sites or collection times.
10. **Use predictions for hypothesis generation.** Cohort outcomes and feature weights should support follow-up analysis, not direct treatment decisions, until prospectively validated.

## Conclusion

HiPoNet offers a compelling synthesis of multi-view metric learning, simplicial representation, and diffusion scattering for collections of cellular point clouds. Its best idea is to reject the assumption that one feature geometry must represent every biological process. Multiple learned views, combined with multiscale aggregation, produce strong retrospective results and inspectable feature weights.

The published evidence is narrower than a phrase such as "scRNA-seq and spatial transcriptomics network" suggests. The experiments use MIBI, mass cytometry, and CODEX protein measurements; higher-order simplices help some tasks but not others; and test-based epoch selection makes the headline numbers optimistic until independently reproduced. The public repository contains valuable and improving mathematical machinery, yet it remains a research implementation with reproducibility gaps and restrictive non-commercial terms.

The next decisive study would freeze a clean release, provide exact preprocessing and patient-level manifests, correct validation leakage, benchmark true scRNA-seq and spatial transcriptomics, and evaluate site- or time-held-out cohorts. If HiPoNet retains its advantage under those conditions, it would establish a strong case that multi-view simplicial learning captures useful biological organization beyond what a single graph can preserve.

## Source note and selected verified references

This white paper is an independent synthesis. Numerical results and theoretical claims attributed to the paper are author-reported; modality corrections, software observations, limitations, and deployment guidance are this white paper's assessment. The complete 30-page NeurIPS PDF was extracted, rendered, and visually inspected, including the 15-page paper, checklist, theoretical proofs, data appendix, ablations, computational-complexity analysis, and limitations. The public repository was inspected at commit `45a9d08c49af0aa0a2e24b840d53e0512ad69032` on 28 July 2026. Its locked tests were executed locally; benchmark models were not retrained and paper results were not independently recomputed.

1. Viswanath, S. et al. "HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell data." *Advances in Neural Information Processing Systems 38* (2025). [Proceedings](https://proceedings.neurips.cc/paper_files/paper/2025/hash/b284aad9fb5c6d74b9535a30ece69e1c-Abstract-Conference.html)
2. Viswanath, S. et al. "HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell Data." arXiv:2502.07746, submitted 11 February 2025, revised 26 May 2025. [arXiv](https://arxiv.org/abs/2502.07746)
3. Madhu, H., Gurugubelli, S., and Chepuri, S. P. "Unsupervised parameter-free simplicial representation learning with scattering transforms." *Proceedings of Machine Learning Research* 235, 34145-34160 (2024). [PMLR](https://proceedings.mlr.press/v235/madhu24a.html)
4. Ramos Zapatero, M. et al. "Trellis tree-based analysis reveals stromal regulation of patient-derived organoid drug responses." *Cell* 186, 5606-5619.e24 (2023). [DOI](https://doi.org/10.1016/j.cell.2023.11.005)
5. Wu, Z. et al. "Space-GM: geometric deep learning of disease-associated microenvironments from multiplex spatial protein profiles." bioRxiv (2022). [DOI](https://doi.org/10.1101/2022.05.12.491707)
6. Gao, F., Wolf, G., and Hirn, M. "Geometric scattering for graph data analysis." *Proceedings of Machine Learning Research* 97, 2122-2131 (2019). [PMLR](https://proceedings.mlr.press/v97/gao19e.html)

**Reproducibility resources:** [HiPoNet repository](https://github.com/KrishnaswamyLab/HiPoNet) | [OpenReview record](https://openreview.net/forum?id=UoKt9B1aY8) | [Official PDF](https://proceedings.neurips.cc/paper_files/paper/2025/file/b284aad9fb5c6d74b9535a30ece69e1c-Paper-Conference.pdf)
