# White Paper: TopoMetry

## Geometry-aware spectral scaffolds for single-cell data

**Primary publication:** David Sidarta-Oliveira, Ana I. Domingos, and Licio A. Velloso, "TopoMetry systematically learns and evaluates the latent geometry of single-cell data," *eLife* 13:RP100361. The version of record was published July 3, 2026, DOI: [10.7554/eLife.100361.3](https://doi.org/10.7554/eLife.100361.3).

**Access and licensing:** The article is open access under CC BY 4.0. The software is available from [davisidarta/topometry](https://github.com/davisidarta/topometry) under the MIT License. This review uses the canonical project spelling, **TopoMetry**; "TopOMetry" is an older or informal capitalization.

**Publication chronology:** The manuscript was first posted as a preprint on June 4, 2024, entered eLife review in July 2024, appeared as a reviewed preprint in September 2024, was revised in May 2026, and became the version of record on July 3, 2026. The PDF footer retains the volume label "eLife 2024;13:RP100361," but the citable version reviewed here is the 2026 version of record. Calling it simply an "eLife 2024/25" paper obscures this version history.

## Executive summary

TopoMetry is an open-source Python toolkit for learning, comparing, and using graph-based representations of high-dimensional data, with a strong focus on single-cell transcriptomics. Its central premise is that a single conventional dimensionality-reduction result should not automatically be treated as the geometry of the data. Instead, TopoMetry builds a neighborhood graph in the observed feature space, approximates its Laplace-Beltrami operator, extracts spectral coordinates, rebuilds a graph in that learned spectral space, and evaluates how well candidate representations preserve the original diffusion geometry.

The method belongs to the lineage of Laplacian eigenmaps, diffusion maps, adaptive graph kernels, and manifold learning. It is not a persistent-homology package, despite the broader association between topology and topological data analysis. "Topology" here primarily means neighborhood connectivity and diffusion structure on a data manifold. The distinctive contribution is an integrated workflow that treats graph construction, spectral decomposition, latent-space refinement, visualization, clustering, and geometry-preservation diagnostics as parts of the same system.

The publication reports evaluations across 68 single-cell RNA sequencing datasets, together with case studies in development, immune-cell diversity, disease, and paired transcriptome/T-cell receptor data. In those experiments, the TopoMetry spectral scaffolds generally preserved the authors' reference diffusion operator better than PCA, scVI, or their associated two-dimensional layouts. The case studies suggest that this additional geometric resolution can expose continuous trajectories, cyclic programs, and fine cell subsets that conventional PCA-centered workflows may merge.

Those findings are promising but should not be interpreted as independent proof that every additional structure is biologically real. The "native geometry" used for scoring is itself an estimated graph-diffusion model derived from the same preprocessed expression data. Consequently, TopoMetry's preservation scores establish consistency with that modeling target, not ground-truth cell identity or developmental fate. Reviewers likewise asked for stronger ground-truth evaluation and a clearer batch-effect strategy. Some reported increases in cluster count could represent useful biological resolution, overclustering, or a mixture of both.

As of July 28, 2026, the repository shows recent development and a substantial, documented implementation. The public repository had 107 GitHub stars, 355 commits on its default branch, an MIT license, and a PyPI 1.1.0 release from March 2026. It offers scikit-learn-style estimators and Scanpy/AnnData integration. However, its release engineering is weaker than its research breadth: core algorithms have little automated test coverage, no repository CI workflow was visible, several optional runtime dependencies are not declared cleanly, documentation contains some stale API examples, and GitHub releases do not reflect current PyPI versions. TopoMetry can reasonably be described as an unusually capable and actively maintained single-cell spectral-geometry toolkit. The stronger claim that it is the single "strongest maintained" tool is not established without a systematic comparison of alternatives and maintenance criteria.

## The problem TopoMetry addresses

Single-cell gene-expression matrices contain thousands of features, nonlinear biological variation, technical noise, heterogeneous sampling density, and far fewer intrinsic degrees of freedom than ambient dimensions. Standard analysis commonly selects highly variable genes, normalizes counts, computes PCA, builds a k-nearest-neighbor graph in PCA space, and uses UMAP for visualization. This is computationally effective, but it commits early to a linear projection and often uses that projection as the substrate for every later decision.

TopoMetry separates three objects that are often conflated:

1. A **latent scaffold**, intended to represent the manifold's intrinsic geometry in more than two dimensions.
2. A **neighborhood operator**, which encodes local affinities or diffusion probabilities.
3. A **layout**, usually two-dimensional, intended for inspection rather than treated as the full analytical representation.

This separation matters because a visually attractive embedding may distort neighborhoods, and a representation with modest coordinate-wise variance may nevertheless preserve diffusion structure. Conversely, a graph can reproduce its own construction assumptions without recovering biologically meaningful variation. TopoMetry therefore provides both representations and explicit internal diagnostics, while leaving biological validation to marker genes, trajectories, perturbations, lineage information, or orthogonal assays.

The intended scope extends beyond scRNA-seq, because the low-level classes operate on general matrices and graphs. The strongest published evidence and highest-level convenience API, however, concern single-cell expression data. Claims about other molecular modalities should be treated as software capability rather than equivalently validated performance.

## Mathematical foundation

### From neighborhoods to a Laplace-Beltrami approximation

Let observations \(x_1,\ldots,x_n\) be samples from an unknown low-dimensional manifold embedded in a high-dimensional feature space. TopoMetry first builds a k-nearest-neighbor graph and assigns a nonnegative affinity \(W_{ij}\) to connected observations. The degree matrix is

\[
D_{ii} = \sum_j W_{ij}.
\]

Common graph Laplacians include

\[
L = D-W,\qquad
L_{\mathrm{sym}} = I-D^{-1/2}WD^{-1/2},\qquad
L_{\mathrm{rw}} = I-D^{-1}W.
\]

The row-stochastic diffusion operator is

\[
P=D^{-1}W.
\]

Under regularity, sampling, bandwidth, and asymptotic conditions, graph Laplacians converge toward a differential operator related to the manifold's Laplace-Beltrami operator \(\Delta_g\). This is the mathematical bridge between a discrete cell graph and continuous intrinsic geometry. It is an approximation, not a direct observation of the underlying manifold.

TopoMetry normally begins with standardized expression features and cosine or correlation neighborhoods. It can convert distances into affinities using local, variable bandwidths rather than one global scale. A local scale can be estimated from each point's neighbor distances, allowing a dense region and a sparse region to use different effective bandwidths. Density-normalized variants take a form such as

\[
W^{(\alpha)} = D^{-\alpha}WD^{-\alpha},
\]

followed by row normalization. Varying \(\alpha\) changes how strongly sampling density influences the operator. This is important in single-cell data because cell abundance reflects biology, sampling design, capture efficiency, and quality control, not only intrinsic geometry.

### Spectral scaffolds

If

\[
P\psi_\ell = \lambda_\ell\psi_\ell,
\]

then the nontrivial eigenvectors \(\psi_\ell\) provide smooth coordinates on the graph, and powers of eigenvalues encode diffusion time. Fixed-time diffusion coordinates have the form

\[
\Psi_t(x_i)=
\left[
\lambda_1^t\psi_1(i),\ldots,\lambda_r^t\psi_r(i)
\right],
\]

after excluding the trivial stationary component. Increasing \(t\) suppresses rapidly decaying components and emphasizes broader structure.

TopoMetry also implements a multiscale construction that analytically aggregates diffusion behavior over time. Its component weighting is proportional to

\[
\frac{\lambda_\ell}{1-\lambda_\ell},
\]

again excluding the stationary eigenvalue. The fixed-time scaffold offers a chosen diffusion scale; the multiscale scaffold reduces dependence on one time parameter. The current default workflow emphasizes these two spectral scaffolds. Earlier descriptions of TopoMetry as automatically scoring "dozens" of latent representations overstate the present default. The lower-level and legacy APIs expose many combinations of kernels, decompositions, and layouts, but the revised published workflow was deliberately streamlined.

The spectral rank \(r\) should be large enough to retain meaningful intrinsic directions without making decomposition unnecessarily expensive. TopoMetry supports intrinsic-dimension estimators including maximum likelihood and the Farahmand-Szepesvari-Audibert estimator. A local FSA expression is

\[
\widehat d(x)=\frac{\log 2}{\log\left(R_k(x)/R_{k/2}(x)\right)},
\]

where \(R_j(x)\) is the distance to the \(j\)-th neighbor. The implementation can use the distribution of local dimension estimates to size the eigensystem, subject to minimum and maximum bounds. This is a heuristic allocation mechanism, not a guarantee that the resulting eigenvectors correspond one-to-one with biological factors.

### A graph of the learned geometry

TopoMetry then builds another neighborhood graph in the spectral scaffold, typically using Euclidean distance. This second graph is conceptually important: the first operator estimates geometry from the observed feature space, while the second estimates neighborhoods after spectral denoising and geometric reparameterization. Downstream clustering, layouts, pseudotime, filtering, and imputation can use this refined operator.

The approach can be understood as learning the "geometry of the geometry." It can also amplify assumptions from the first stage. Highly variable gene selection, normalization, metric choice, k, kernel bandwidth, density correction, eigenrank, and batch composition all influence the reference operator and therefore the learned scaffold.

## Learning and scoring representations

TopoMetry compares a candidate representation with a reference diffusion operator derived from the high-dimensional input. The publication reports three principal preservation measures:

- **PF1:** an F1-style overlap score for top-k neighborhoods. It asks whether the candidate recovers the same local neighbor sets.
- **PJS:** one minus row-wise Jensen-Shannon divergence between transition distributions. It evaluates affinity weights, not only set membership.
- **SP:** spectral Procrustes agreement between diffusion coordinates, summarized across diffusion times. It evaluates broader operator geometry after orthogonal alignment.

These measures cover local adjacency, probabilistic transitions, and multiscale spectral structure. They are useful for model selection because two candidate representations can look similar in two dimensions while differing materially as analytical graphs.

Their interpretation requires discipline. A high score means that a candidate preserves the chosen reference operator. It does not directly mean that the candidate preserves a known lineage tree, perturbation response, cell type, or spatial domain. Moreover, TopoMetry is designed from the same graph-spectral family as the reference, so its advantage partly reflects alignment between objective and architecture. The scores are best used as internal geometric diagnostics alongside external biological evidence.

The publication occasionally refers to "four complementary metrics" while defining and displaying PF1, PJS, and SP. This appears to be a reporting inconsistency rather than a hidden fourth benchmark and should not be used to inflate the evidence base.

## API and analytical workflow

The package exposes scikit-learn-style classes including `TopOGraph`, `Kernel`, `EigenDecomposition`, `IntrinsicDim`, and `Projector`. These inherit familiar estimator and transformer conventions. For single-cell work, `topo.single_cell` provides higher-level AnnData workflows, including `fit_adata` and report-generation helpers. Results are placed into AnnData namespaces rather than requiring replacement of the primary `.X` matrix.

A representative workflow is:

| Stage | Main operation | Analytical output |
| --- | --- | --- |
| Preprocess | Normalize counts, select genes, scale features | Cell-by-feature matrix |
| Native graph | Approximate kNN search and adaptive affinity kernel | Reference neighborhood/diffusion operator |
| Dimension estimate | MLE or FSA intrinsic-dimension estimate | Suggested spectral rank |
| Spectral learning | Eigensolve fixed-time and multiscale operators | Latent scaffolds |
| Graph refinement | Rebuild neighbors in scaffold coordinates | Topological graph for downstream analysis |
| Projection | MAP, PaCMAP, UMAP, or related layout | Two-dimensional visualization |
| Evaluation | PF1, PJS, and spectral Procrustes scoring | Geometry-preservation diagnostics |
| Interpretation | Clustering, markers, pseudotime, RNA velocity, or paired modalities | Biological hypotheses |

The default configuration uses neighborhood sizes near 30, approximate nearest-neighbor search, a relatively generous eigensystem, and both fixed-time and multiscale scaffolds. These defaults are informed by the authors' benchmark, but they should not be treated as universally optimal. The supplement suggests relative robustness over approximately \(k=30\) to \(200\), with poorer agreement for very small neighborhoods.

Scanpy integration is a practical strength because it allows TopoMetry to enter an existing AnnData analysis without dictating every upstream or downstream choice. Batch-corrected representations from Harmony or Scanorama can in principle be supplied, and current development also contains CCA-based integration work. The peer-reviewed evaluation did not, however, establish a general batch-correction solution. Batch, donor, chemistry, and tissue composition should therefore be checked before interpreting new branches or clusters as biology.

## Published evaluation and reported results

### Broad benchmark

The authors assembled 68 human and mouse scRNA-seq datasets from the CellxGene Census release dated July 25, 2023. The datasets span tissues and biological contexts; collections above 100,000 cells were excluded from this benchmark for tractability. A separate mouse-organogenesis analysis demonstrates operation at roughly 1.3 million cells.

The benchmark compared PCA, PCA followed by UMAP, standalone UMAP on scaled expression, scVI and its UMAP layout, and TopoMetry fixed-time and multiscale scaffolds with associated layouts. The analysis used approximately 30 neighbors, approximate search, spectral rank 64 for standardized comparison, and diffusion times 1, 4, and 8 for scoring. scVI received raw counts through its own preprocessing, whereas other methods operated on the shared preprocessed expression matrices.

Across the reported datasets, the TopoMetry scaffolds generally achieved higher PF1, PJS, and spectral Procrustes agreement with the reference operator than PCA or scVI. TopoMetry-derived two-dimensional layouts also generally outperformed layouts based on PCA or scVI. Standalone UMAP was often intermediate. PaCMAP on the multiscale scaffold was a notable configuration that did not show a systematic advantage.

The paper reports that retained PCA components explained as little as 20 percent and averaged about 36 percent of variance under its default gene-selection setting. This supports concern that a compact linear basis can omit substantial variance, but unexplained variance is not synonymous with discarded biological signal. Noise, technical effects, and unmodeled biology all contribute.

The runtime supplement shows TopoMetry as somewhat slower than PCA-UMAP while scaling more favorably than PHATE and scVI in the displayed comparison. The result is encouraging but qualitative: hardware and operational details are not sufficient to treat it as a portable performance guarantee. Runtime will depend on neighbor backend, eigensolver, requested rank, graph density, memory, and optional layouts.

### Developmental and cyclic structure

In a murine pancreas example, TopoMetry recovered a closed cell-cycle loop embedded within developmental structure. RNA-velocity direction supported the interpretation, whereas the PCA-centered layout was more ambiguous. This is a good use case for diffusion geometry because both continuous differentiation and periodic programs are difficult to represent with a small linear projection.

In the Mouse Organogenesis Cell Atlas, the authors report that TopoMetry retained broad developmental trajectories while resolving roughly 380 clusters or subpopulations, compared with 56 in the original analysis, with substantial additional neuronal detail. This demonstrates sensitivity to fine graph structure. It does not prove that all 380 groups are distinct cell types. Stability across donors, marker coherence, spatial or lineage evidence, and replication are necessary to separate resolution from overclustering.

### Immune-cell diversity and paired modalities

In PBMC68k, TopoMetry produced close to 100 T-cell clusters rather than a few broad PCA-derived groups. The authors report more specific marker profiles and no obvious enrichment of Scrublet-predicted doublets. They also show related fine structure in lupus, dengue, and multiple-sclerosis PBMC datasets. These observations argue that some conventional pipelines merge immunological variation, but marker specificity alone is not functional validation.

The ECCITE-TCR vaccination/infection and TICA paired RNA/TCR analyses provide stronger orthogonal context because transcriptomic groups can be connected to clonotypes and clonal expansion. In TICA, one tissue-resident CD8 group was associated with a SARS-CoV-2-specific clonotype. Such agreement is biologically informative, but it remains retrospective analysis of existing measurements rather than prospective experimental confirmation of every inferred subgroup.

## Software and maintenance assessment

This section reports repository observations made on July 28, 2026, separately from claims in the publication.

The default `master` branch contained 355 commits and pointed to commit [`f2653faf`](https://github.com/davisidarta/topometry/commit/f2653faf97b26a6be3abc6f980be6a4b302e03a7), dated March 25, 2026. The repository's latest push was April 1, 2026, on an integration-development branch seven commits ahead of `master`. The GitHub API reported 107 stars, five forks, 12 open issues, no open pull requests, and a non-archived repository. The paper also records an exact Software Heritage snapshot, which is a strong archival practice.

PyPI version 1.1.0 was released March 26, 2026. Its source package matches the default branch's Python package aside from a repository image asset. The installed package metadata correctly reports 1.1.0, although the default branch's `setup.cfg` still says 1.0.2 while `topo/version.py` says 1.1.0. GitHub's only formal release is an obsolete 2021 prerelease, so PyPI, source metadata, and GitHub release history are not synchronized.

Positive engineering signals include:

- a permissive MIT license;
- a substantive Python implementation with scikit-learn conventions;
- high-level AnnData/Scanpy integration;
- approximate-neighbor support and scalable spectral design;
- extensive conceptual and API documentation;
- a current PyPI artifact and exact archived research snapshot;
- recent work on CCA integration and reference-query mapping.

Material readiness gaps include:

- only 25 visible test functions, concentrated on new CCA integration and mapping rather than the core kernels, eigensolvers, metrics, layouts, or AnnData workflow;
- no visible GitHub Actions, tox, or nox continuous-integration configuration;
- unpinned hard dependencies and incomplete declaration of optional packages such as Scanpy, hnswlib, PaCMAP, and `adjustText`;
- advertised Python support of 3.6 or newer despite syntax that requires at least Python 3.7 and a modern single-cell stack that may require later versions;
- stale examples in parts of the quick-start documentation and a citation page that still points to the preprint;
- open user reports concerning angular-distance bandwidth handling and dense conversion in an optional nearest-neighbor backend;
- a report-generation path that, by static inspection, appears to call its plotting routine twice.

Static syntax compilation of the source succeeded in this review environment, but an end-to-end installation and numerical reproduction were not performed. The environment lacked the scientific dependency stack, and no claim is made that repository tests or published benchmarks were rerun.

Taken together, the project is visibly maintained and research-usable, but not yet supported by the validation and release automation expected for an unqualified production-grade scientific platform. "Strongest maintained single-cell topology tool" should therefore be reframed as a hypothesis: TopoMetry is among the most feature-rich recently maintained Python toolkits specifically devoted to graph-spectral geometry in single-cell analysis.

## Evidence limits and risks

The peer-reviewed record is stronger than a software-only demonstration: it includes a broad dataset benchmark, multiple biological case studies, reviewer critiques, revisions, and open data/software access. The eLife assessment describes the method as important and theoretically grounded, with convincing evidence for intrinsic-dimension and cell-type applications. Reviewers also identified limits that remain relevant.

First, the benchmark's target is model-derived. All preservation metrics compare candidates with a native diffusion operator constructed from preprocessed expression. This is coherent for internal model selection but circular as a claim of biological truth. Independent targets such as known simulations, lineage tracing, perturbation response, spatial adjacency, flow cytometry, or prospective validation would strengthen the conclusion.

Second, the comparison set is selective. PCA, UMAP, and scVI are important baselines, but they do not cover all modern manifold, trajectory, graph-learning, multimodal, or batch-aware approaches. PHATE appears in runtime comparison rather than the main fidelity benchmark. The claim is therefore that TopoMetry performed well against the tested configurations, not against every plausible alternative.

Third, the paper displays distributions over many datasets but does not prominently provide uncertainty intervals or formal tests that fully account for dataset hierarchy and repeated subsets. Broad consistency is valuable, yet the exact magnitude and generality of improvement need independent replication.

Fourth, greater granularity is not automatically greater accuracy. A method sensitive to subtle geometry can reveal rare states, but it can also split continuous variation or technical effects into clusters. The same caution applies to inferred loops, branches, and pseudotime.

Finally, batch correction remains a consequential design choice. Density normalization addresses sampling density, not arbitrary donor, chemistry, or batch effects. Integration before TopoMetry may erase biology; integration after graph construction may leave confounding in the reference operator. This tradeoff must be tested for each study.

## Practical adoption guidance

For exploratory research, TopoMetry is best treated as an additional geometric lens rather than a replacement for the complete Scanpy workflow.

1. Preserve raw counts and a conventional analysis branch. Record filtering, normalization, highly variable genes, scaling, batch strategy, metric, k, kernel, spectral rank, diffusion time, random seed, package versions, and approximate-neighbor backend.
2. Run both fixed-time and multiscale scaffolds. Examine PF1, PJS, and spectral Procrustes scores, but do not choose a representation from one score alone.
3. Check stability over neighborhood size, gene selection, donor subsets, and random seeds. Structures that vanish under modest perturbations should not drive biological claims.
4. Separate analytical coordinates from visualization. Cluster and model trajectories on the scaffold or graph, not only on a two-dimensional layout.
5. Validate new populations with held-out donors, marker coherence, doublet and quality metrics, differential abundance, paired protein or receptor measurements, spatial context, or functional experiments.
6. Pin a known environment. Given incomplete dependency declarations, use an explicit lock file or container and test optional layout and neighbor backends before scaling.
7. For regulated or production settings, add local numerical regression tests, memory/runtime benchmarks, CI, and artifact provenance before operational use.

A useful deployment pattern is to use PCA/Scanpy as the baseline, TopoMetry as a sensitivity analysis, and agreement or disagreement between them as a scientific question. If TopoMetry reveals a new branch, cycle, or population, the next step is not simply to accept the finer result; it is to seek evidence that predicts which geometry is biologically credible.

## Conclusion

TopoMetry makes a substantive contribution by turning manifold geometry from a hidden preprocessing decision into an explicit, inspectable analytical object. Its adaptive graph kernels, Laplace-Beltrami approximation, fixed-time and multiscale spectral scaffolds, second-stage graph learning, and preservation metrics form a coherent system. The Scanpy-facing API makes that system accessible to single-cell practitioners, and the eLife study supplies broad evidence that conventional low-dimensional representations can lose diffusion structure.

The strongest interpretation is methodological: TopoMetry offers a rigorous way to learn and audit graph-spectral representations before clustering or visualization. The weaker interpretation is ontological: a better match to an estimated diffusion operator does not by itself prove more true cell types or lineages. Published biological examples are compelling hypotheses, not blanket validation.

The software is active, open, archived, and unusually broad, but its testing, dependency packaging, CI, and release synchronization lag behind its scientific ambition. It is appropriate for technically capable research groups willing to validate their environment and conclusions. With stronger automated verification, reproducible benchmark artifacts, batch-aware evaluation, and independent biological ground truth, TopoMetry could become a reference implementation for geometry-conscious single-cell analysis.

## Source note and selected verified references

This white paper distinguishes (1) statements reported by the authors, (2) repository observations made on July 28, 2026, and (3) independent synthesis and cautions. The publication PDF, its full figure-supplement PDF, article metadata, repository source, package metadata, documentation, tests, and development history were inspected. Numerical benchmarks were not independently rerun.

1. Sidarta-Oliveira D, Domingos AI, Velloso LA. TopoMetry systematically learns and evaluates the latent geometry of single-cell data. *eLife*. 2026;13:RP100361. [Version-specific DOI](https://doi.org/10.7554/eLife.100361.3).
2. TopoMetry source repository. [GitHub](https://github.com/davisidarta/topometry). Repository state cited above was inspected at commit `f2653faf97b26a6be3abc6f980be6a4b302e03a7`.
3. TopoMetry package distribution. [PyPI](https://pypi.org/project/topometry/).
4. TopoMetry documentation. [Read the Docs](https://topometry.readthedocs.io/en/latest/).
5. Belkin M, Niyogi P. Laplacian Eigenmaps for dimensionality reduction and data representation. *Neural Computation*. 2003;15:1373-1396. [DOI](https://doi.org/10.1162/089976603321780317).
6. Coifman RR, Lafon S. Diffusion maps. *Applied and Computational Harmonic Analysis*. 2006;21:5-30. [DOI](https://doi.org/10.1016/j.acha.2006.04.006).
7. Wolf FA, Angerer P, Theis FJ. SCANPY: large-scale single-cell gene expression data analysis. *Genome Biology*. 2018;19:15. [DOI](https://doi.org/10.1186/s13059-017-1382-0).
8. McInnes L, Healy J, Melville J. UMAP: Uniform Manifold Approximation and Projection for dimension reduction. [arXiv](https://arxiv.org/abs/1802.03426).
9. Moon KR et al. Visualizing structure and transitions in high-dimensional biological data. *Nature Biotechnology*. 2019;37:1482-1492. [DOI](https://doi.org/10.1038/s41587-019-0336-3).
