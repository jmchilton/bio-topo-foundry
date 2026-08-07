---
type: paper
title: TDA and TDL Beyond Persistent Homology
summary: Su and colleagues' map of the topological methods that extend past persistent homology, and what each one recovers.
citation: Zhe Su, Xiang Liu, Layal Bou Hamdan, Vasileios Maroulas, Jie Wu, Gunnar Carlsson, and Guo-Wei Wei, "Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review," arXiv:2507.19504v1 (2025).
source_url: https://arxiv.org/abs/2507.19504
source_license:
  status: declared
  id: LicenseRef-arXiv-nonexclusive-distrib-1.0
derived: own-words-summary
tags:
  - method/persistent-homology
  - method/persistent-laplacian
  - method/topological-deep-learning
---

# White Paper: TDA and TDL Beyond Persistent Homology

## A white paper synthesis of Su et al. (2025)

**Primary source:** Zhe Su, Xiang Liu, Layal Bou Hamdan, Vasileios Maroulas, Jie Wu, Gunnar Carlsson, and Guo-Wei Wei, “Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review,” arXiv:2507.19504v1, submitted 12 July 2025. [arXiv](https://arxiv.org/abs/2507.19504) | [arXiv DOI](https://doi.org/10.48550/arXiv.2507.19504) | [later journal version](https://doi.org/10.1007/s10462-025-11462-w)

A later peer-reviewed version appeared in *Artificial Intelligence Review*, volume 59, article 58 (2026), published online 21 December 2025.

**Access and reuse:** arXiv's metadata record for this submission declares the [arXiv.org perpetual non-exclusive distribution license 1.0](http://arxiv.org/licenses/nonexclusive-distrib/1.0/). That grant lets arXiv distribute the preprint; it does not give third parties a redistribution right. This note is therefore an own-words summary that cites and links the source rather than carrying its prose. The later *Artificial Intelligence Review* version is a separately licensed item and was not the version reviewed here.

This document distinguishes the review’s claims from the present synthesis. Phrases such as “the survey reports” and explicit section or page references describe the authors’ account. “Practical interpretation,” “recommendation,” and “assessment” identify conclusions drawn here from the survey’s taxonomy, examples, and stated limitations.

## Executive summary

Persistent homology remains the best-known engine of topological data analysis (TDA): it follows the births and deaths of connected components, loops, cavities, and higher-dimensional holes as a scale parameter changes. Its compact invariants are robust and often useful in machine learning. But this strength is also a constraint. A persistence barcode says when homology changes; it does not, by itself, describe shape changes that preserve homology, localize a feature, represent labels and direction naturally, impose physical boundary conditions, or quantify the entanglement of curves in three-dimensional space.

Su and colleagues organize the rapidly growing response to those constraints into three mathematical lineages:

1. **Algebraic-topology extensions for discrete data.** Persistent Laplacians and Dirac operators add spectra to homological information; sheaves incorporate local attributes and consistency relations; path, directed-flag, hypergraph, and hyperdigraph constructions respect direction or higher-order relations; Mayer and interaction topology alter the algebra to reveal cross-dimensional or localized interactions.
2. **Differential-topology methods for manifold data.** Persistent de Rham cohomology and persistent Hodge Laplacians treat surfaces, volumes, images, and vector fields as discretizations of continuous manifolds. Boundary conditions become part of the model, and Hodge decomposition separates vector fields into physically meaningful components.
3. **Geometric-topology methods for embedded curves.** Multiscale Gauss linking integrals, localized or persistent Jones polynomials, persistent Khovanov homology, and Khovanov spectral operators describe local and global entanglement in knots, links, tangles, polymers, DNA, and protein backbones, including open curves for which classical knot invariants are often unavailable.

The review’s most actionable message is that “beyond persistent homology” does not mean replacing persistent homology with a single successor. It means matching the mathematical representation to the data-generating structure. Point clouds, directed networks, hypergraphs, manifolds with boundary, vector fields, sequences, and embedded curves should not automatically be flattened into the same Vietoris-Rips pipeline.

The second practical message is that the representation-to-learning interface is as important as the topology. Barcodes, spectra, segmentation matrices, and Hodge components have different statistical and computational properties. A credible TDL study therefore needs an explicit chain from data model, through filtration and invariant, to vectorization and predictive evaluation.

Finally, the survey is a broad technical map, not a systematic evidence review. It collects many successful applications, especially in biomolecular modeling, but does not provide a meta-analysis, uniform benchmarks, or a head-to-head comparison across method families. Its strongest contribution is conceptual coverage and method-selection guidance; claims of application superiority still need independent, task-specific validation.

## Scope and motivation

The paper’s scope is deliberately wider than persistent-homology featurization surveys. After a concise foundation in simplicial homology and filtration, Sections 2-4 review alternative constructions rooted in algebraic, differential, and geometric topology. Section 5 connects input data types to mathematical models, output representations, software, and machine-learning featurizations. Section 6 identifies open directions.

The motivating limitations of standard persistent homology are summarized in the introduction and revisited in Section 6 (pp. 6-9 and 58-60):

- **Topological equivalence can hide geometric change.** Two states in a filtration can have the same Betti numbers and barcode behavior while differing substantially in geometry.
- **Global summaries can hide location and interaction.** Standard homology records that a class exists, not necessarily where it is supported or how labeled subsystems interact.
- **A simplicial-complex model can erase data semantics.** Direction, repeated relations, incomplete higher-order relations, labels, weights, and non-geometric attributes may be awkward or misleading when forced into an ordinary complex.
- **Point-cloud machinery is not native to every object.** Smooth surfaces and volumes have differential structure and boundary conditions; curves in 3-space have entanglement structure; sequences have order and dynamics.
- **Computation and learning impose additional constraints.** Large complexes are expensive, while variable-cardinality topological outputs must be made comparable across samples.

The survey also sets boundaries. It is a high-level review rather than a formula-heavy monograph. It does not attempt a full treatment of geometric deep learning, Ricci-curvature learning, differential-geometry learning, commutative-algebraic learning, or the large literature on topological neural-network architectures. Thus, “TDL” here mainly concerns extracting and vectorizing topology-aware representations for learning, with selected references to end-to-end topological models.

## Conceptual foundations

### From counts to operators

Persistent homology begins with a filtration: a nested family of spaces, commonly simplicial complexes constructed from point clouds. Homology classes appear and disappear across the family. Their lifetimes become intervals in a barcode or points in a persistence diagram.

Spectral extensions retain this foundation but attach an operator to the chain or cochain spaces. For a combinatorial Laplacian, the kernel is isomorphic to homology: the number of zero eigenvalues recovers the relevant Betti number. Nonzero eigenvalues supply additional information about connectivity and combinatorial or geometric variation. The persistent version applies this construction to pairs of spaces in a filtration. The paper’s central distinction is therefore:

- **harmonic spectrum (zero eigenvalues):** the persistent topological information already associated with homology;
- **non-harmonic spectrum (positive eigenvalues):** additional scale-dependent structural information.

This distinction recurs for combinatorial, sheaf, Mayer, Hodge, and Khovanov Laplacians. Dirac operators couple adjacent dimensions through a first-order operator whose square is related to Laplacians. The survey presents Dirac formulations as more sensitive to local structure and well suited to proposed quantum algorithms, while also cautioning that realistic fault-tolerant quantum hardware is not expected in the near term (Section 2.3, pp. 22-25).

### Discrete complexes versus continuous manifolds

The review carefully separates combinatorial Laplacians on complexes from Hodge Laplacians on differential manifolds (Sections 3.1-3.3). Both have kernels connected to topology, but their positive spectra do not mean exactly the same thing. Combinatorial spectra reflect the chosen discrete structure. Hodge spectra also encode smooth geometric information such as metric and curvature.

For manifolds with boundary, normal and tangential boundary conditions are mathematically consequential. They yield relative and absolute de Rham cohomology and finite-dimensional harmonic spaces. A topology-preserving five-component Hodge decomposition further separates exact, coexact, normal-harmonic, tangential-harmonic, and residual harmonic contributions. In vector-calculus terms, these decompositions isolate curl-free, divergence-free, and harmonic dynamics with additional boundary-aware refinement.

### Global invariants versus localized entanglement

Classical knot invariants are global and usually defined for closed curves. Real polymers and biomolecules may be open, locally entangled, or only partly knot-like. The geometric-topology methods in Section 4 introduce segmentation and spatial scale. The output is no longer simply “which knot?” but a multiscale map of which curve segments link or entangle, and at what range.

## Taxonomy of methods beyond persistent homology

| Method family | Best-matched structure | What it adds | Typical output | Maturity indicated by the survey |
|---|---|---|---|---|
| Persistent combinatorial Laplacians | Point clouds and simplicial filtrations | Positive spectra describing structural evolution while zero modes recover persistent Betti numbers | Eigenvalues/eigenvectors across scale | Established theory, stability results, algorithms, and packages |
| Path, directed-flag, hypergraph, and hyperdigraph Laplacians | Directed networks and higher-order or incomplete relations | Directionality and non-simplicial interactions | Persistent spectra | Active research with several domain applications |
| Persistent Dirac operators | Complexes across dimensions | First-order coupling and local sensitivity; a route to quantum algorithms | Signed/shifted spectra and Betti estimates | Theoretically active; quantum deployment remains prospective |
| Persistent sheaf theory and sheaf Laplacians | Labeled or weighted local data | Local-to-global consistency and non-geometric attributes | Cohomology and sheaf spectra | Promising, especially where labels matter; less standardized tooling |
| Persistent Mayer topology | Cross-dimensional simplex relations | Generalized boundary law \(d^N=0\), additional grading, richer spectra | Graded barcodes and Mayer spectra | Recent; molecular demonstrations and emerging learning uses |
| Persistent interaction topology | Interacting components or atom types | Explicit localized interactions between spaces or subsystems | Interaction homology and spectra | Recent, with stability and finite-point algorithms reported |
| Persistent de Rham cohomology and Hodge Laplacians | Smooth surfaces, volumes, images, density fields | Differential structure, metric information, and boundary conditions | Persistent harmonic fields and Hodge spectra | Solid mathematical basis; implementation choices remain consequential |
| Hodge decomposition | Vector fields and flows | Mechanistic separation of gradient, curl, and harmonic dynamics | Three- or five-channel fields/images | Implemented on meshes and grids; used in RNA velocity and imaging |
| Multiscale Gauss linking integral | Open or closed curves in 3-space | Local-to-global linking and entanglement | Scale-indexed segmentation matrices | Computationally practical with reported biomolecular benchmarks |
| Localized/persistent Jones polynomials | Segmented collections of curves | Polynomial-weighted local and global entanglement | Characteristic matrices or weighted barcodes | New, with stability analysis and protein applications |
| Persistent Khovanov homology; Khovanov Laplacian/Dirac | Knots, links, and tangles | Bigraded evolution and spectral refinement of knot invariants | Graded barcodes and spectra | Mathematically rich but computational tooling is an open priority |

This table is a synthesis of Sections 2-4, not a ranking. The families can be combined, and a more expressive method is not automatically a better predictive model. Expressiveness adds parameters, computational cost, and opportunities for leakage or overfitting.

## Representative algorithms and applications

### Spectral topology for biomolecules and networks

The survey attributes the first practical persistent combinatorial Laplacian formulation to Wang, Nguyen, and Wei’s persistent spectral graph work, followed by theoretical analysis, stability results, and algorithms. It reports applications to protein thermal stability, protein-ligand and protein-protein binding, SARS-CoV-2 variant forecasting, and protein engineering (Sections 2.2.2-2.2.3). These examples illustrate a common design: construct chemically informed complexes or distances, calculate spectra over filtration scales, then summarize eigenvalues for a conventional learner.

The important methodological point is not the application headline but the representational gain. If two molecular states preserve homology while bonds, pockets, or interaction geometry shift, nonzero spectral modes can vary when a barcode does not. Path and directed-flag variants extend the same principle to asymmetric relations; hypergraph variants avoid inferring every pairwise relation from a higher-order event.

### Local attributes, Mayer relations, and interaction topology

Persistent sheaf Laplacians attach vector spaces and restriction maps to cells, allowing labels or measurements to participate in local-to-global consistency. The survey frames ordinary persistent combinatorial Laplacians as a special case in which points effectively carry the same quantity (Section 2.4.1).

Persistent Mayer homology and Laplacians generalize the usual chain condition from \(d^2=0\) to \(d^N=0\). The added grading can encode relationships between simplices separated by more than one dimension. The review reports molecular-structure applications and multichannel features for protein-ligand affinity prediction.

Interaction topology explicitly models how constituent spaces or types influence one another. Its reported use on interactions among atom types is conceptually aligned with “interactive distances,” which suppress within-component distances to emphasize protein-ligand contacts (Sections 2.4.3 and 5.1.2). Both are reminders that the choice of metric or algebra determines which scientific interaction becomes visible.

### Manifold and vector-field analysis

For smooth or image-like data, the survey contrasts two implementations. A **Lagrangian** formulation repeatedly meshes evolving manifolds. It preserves a geometric interpretation but can be sensitive to mesh quality, numerically inconsistent across remeshing, and costly. An **Eulerian** formulation places level-set domains in a fixed Cartesian grid. This avoids repeated tessellation, keeps operators and features comparable across samples, and is better suited to batch machine learning (Section 3.3, pp. 33-35). The paper reports proof-of-principle protein-ligand affinity prediction using the Eulerian persistent Hodge Laplacian.

Hodge decomposition is used differently: it separates a measured vector field into dynamical components. The cited applications include single-cell RNA velocity, where gene-expression-derived flows are decomposed, and manifold topological deep learning for medical images. These are not simply alternative barcode encodings; they create interpretable channels tied to divergence, curl, harmonic structure, and boundaries.

### Knot data analysis

The multiscale Gauss linking integral (mGLI) segments curves, computes pairwise linking integrals between segments, and applies distance-range weights. The resulting matrices describe local entanglement at short scales and approach global linking information at sufficiently broad scales. The survey reports applications to protein flexibility and protein-ligand binding, along with computation in minutes on a personal computer for the studied feature-generation tasks (Section 4.1). Segmentation length and distance ranges are therefore scientific hyperparameters, not incidental preprocessing choices.

Localized Jones methods produce either matrices of Jones-polynomial values over neighborhoods or polynomial-weighted persistence summaries. Persistent Khovanov homology instead orders crossing resolutions to build a filtration of link diagrams. The review cites analysis of a SARS-CoV-2 frameshifting pseudoknot and notes that evolutionary information can be nontrivial even for an unknot or unknotted link. Khovanov Laplacians and Dirac operators then add non-harmonic spectral information to the bigraded homology.

## Evidence and evaluation patterns

The survey’s evidence is predominantly **constructive and example-driven**:

- mathematical correspondences show that operator kernels recover homology or cohomology;
- stability results are cited for several persistence, Laplacian, interaction, and localized-polynomial constructions;
- algorithms are demonstrated on synthetic shapes, molecules, networks, images, or curves;
- extracted features are fed to standard machine-learning models and evaluated on task-specific benchmarks.

The evidence base is uneven across families. Persistent homology has mature software and a large application record. Persistent Laplacians have multiple implementations, theory, and growing benchmark use. Manifold and knot-based approaches are newer and often supported by a smaller number of papers from overlapping author groups. Table 1 (p. 53) makes the tooling imbalance visible: numerous packages support simplicial or cubical persistent homology, whereas HERMES and PersistLap cover persistent Laplacians and a small set of specialized tools cover Hodge decomposition.

The review does not state a systematic search protocol, inclusion criteria, risk-of-bias analysis, or standardized effect sizes. It also does not reproduce comparable timing, memory, uncertainty, or accuracy statistics across all families. Consequently, application successes should be read as evidence of feasibility and potential, not as proof that a method family is universally superior.

A strong evaluation design, inferred from the review’s method pipeline, should include:

1. a non-topological baseline and a standard persistent-homology baseline;
2. ablations for metric, complex, filtration, topology dimension, spectrum truncation, and vectorization;
3. splits that prevent homologous molecules, related sequences, patients, or time-adjacent samples from leaking across train and test sets;
4. uncertainty intervals and repeated splits, not only a best score;
5. runtime and memory reporting through feature construction and learning;
6. robustness tests for sampling density, coordinate noise, meshing/grid resolution, segmentation, and boundary choices;
7. external validation when the scientific claim concerns prospective prediction or domain transfer.

## Limitations and open problems

The authors explicitly call for better local-topology methods, TDA designed natively for sequences, persistent index theory on compact manifolds, low-dimensional-topology methods for embedded curves, persistent Floer approaches, and robust algorithms for persistent Khovanov homology and Laplacians (Section 6).

Several cross-cutting limitations emerge from the survey:

- **Model selection remains under-theorized.** There is no automatic rule for choosing a complex, metric, sheaf, boundary condition, curve segmentation, scale grid, or polynomial evaluation.
- **Vectorization can discard the information gained by richer topology.** Reducing a spectrum or segmentation matrix to a few global statistics may erase localization or interactions.
- **Comparability is fragile.** Remeshing, variable complexes, eigenvalue ordering, repeated eigenvalues, and noncanonical image parameters can make sample-to-sample features inconsistent.
- **Scalability is method-specific.** Large complexes, full eigendecompositions, multiparameter modules, and Khovanov computations can be prohibitive. Quantum speedups are not a near-term operational remedy.
- **Interpretability is conditional.** A zero eigenvalue has a clear homological interpretation; an arbitrary learned function of many positive eigenvalues may not. “Topology-enhanced” does not by itself guarantee an interpretable model.
- **Software is fragmented.** Table 1 documents broad persistent-homology support but sparse coverage for newer operators. Reproducible benchmarks and interoperable representations lag theory.
- **The application literature is concentrated.** Many biomolecular demonstrations are compelling, but independent replications and broader domain benchmarks are needed.

## Practical recommendations

### Choose the data model before the invariant

Use ordinary simplicial persistent homology as a strong default for unlabeled point clouds when holes across scale are the scientific target. Move beyond it for a specific reason:

- use persistent Laplacians when same-topology shape evolution matters;
- use path or directed-flag tools for asymmetric networks;
- use hypergraph or super-hypergraph tools when a group relation does not imply all pairwise relations;
- use sheaves or enriched cohomology when labels and local compatibility matter;
- use interaction topology or interaction-specific metrics when cross-subsystem effects are the target;
- use de Rham-Hodge methods for continuous domains, images, density fields, and boundary-aware physics;
- use Hodge decomposition for measured vector fields;
- use mGLI or localized knot invariants for embedded open or closed curves.

### Treat scientific priors as auditable parameters

Element-specific complexes, interactive distances, kernel distances, level-set functions, boundary conditions, sequence embeddings, and curve segmentations can substantially determine results. Record them in the model specification, tune them only within training data, and test sensitivity.

### Preserve a hierarchy of representations

Start with the least destructive form that downstream tools can handle. Retain barcodes or diagrams alongside images, full or truncated spectra alongside summary statistics, and segment-level matrices alongside pooled features. This supports ablation, interpretation, and later reuse.

### Match tooling to production needs

For prototyping standard persistence, the survey lists mature packages including GUDHI, Ripser, Dionysus, giotto-tda, PHAT, DIPHA, and R-TDA. For persistent Laplacians it lists HERMES and PersistLap; for Hodge decomposition it lists HHD, 5ComponentHD, and 3DHodgeDecom (Table 1, p. 53). Package presence does not establish maintenance status or suitability: verify current documentation, licensing, tests, sparse-matrix support, and reproducible environments before adoption.

### Stage adoption

A sensible program is to reproduce a persistent-homology baseline, add one structure-matched extension, validate on a small interpretable dataset, then scale. Avoid combining multiple new topologies, custom distances, and deep architectures in the first experiment; otherwise the source of any gain will be unclear.

## Conclusion

The survey reframes TDA as a family of structure-aware mathematical pipelines rather than a synonym for persistent homology. Its unifying idea is that homology supplies only the harmonic core. Spectra can reveal geometry and combinatorics; sheaves can carry local attributes; differential forms and boundary conditions can respect manifolds and fields; knot-based constructions can quantify entanglement; and alternative chain theories can expose relationships hidden by ordinary simplicial models.

For interdisciplinary practice, the decisive question is not “Which topological method is most advanced?” but “What structure in the data must survive representation?” Persistent homology remains an excellent baseline. Going beyond it is justified when the scientific object contains direction, higher-order relations, labels, smooth geometry, boundaries, dynamics, or entanglement that the baseline necessarily suppresses. The opportunity is substantial, but the survey also shows a field in transition: mathematical creativity is outpacing common benchmarks, software consolidation, and independent validation.

## Source note and selected references

The source PDF was reviewed in full, including the article’s contents, mathematical definitions, application discussions, concluding research agenda, and software capability table. The arXiv artifact is version 1 and contains 86 PDF pages; its main text ends on p. 60, followed by references. It contains no numbered figures. Table 1 on p. 53 is the principal visual taxonomy and was checked directly against the rendered page.

1. Su, Z., Liu, X., Bou Hamdan, L., Maroulas, V., Wu, J., Carlsson, G., and Wei, G.-W. “Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review.” [arXiv:2507.19504](https://arxiv.org/abs/2507.19504); later version: [DOI 10.1007/s10462-025-11462-w](https://doi.org/10.1007/s10462-025-11462-w).
2. Mémoli, F., Wan, Z., and Wang, Y. “Persistent Laplacians: Properties, Algorithms and Implications.” *SIAM Journal on Mathematics of Data Science* 4(2), 858-884 (2022). [DOI 10.1137/21M1435471](https://doi.org/10.1137/21M1435471).
3. Chen, J., Zhao, R., Tong, Y., and Wei, G.-W. “Evolutionary de Rham-Hodge Method.” *Discrete and Continuous Dynamical Systems - B* 26(7), 3785-3821 (2021). [DOI 10.3934/dcdsb.2020257](https://doi.org/10.3934/dcdsb.2020257).
4. Su, Z., Tong, Y., and Wei, G.-W. “Persistent de Rham-Hodge Laplacians in Eulerian Representation for Manifold Topological Learning.” *AIMS Mathematics* 9(10), 27438-27470 (2024). [DOI 10.3934/math.20241333](https://doi.org/10.3934/math.20241333); [arXiv:2408.00220](https://arxiv.org/abs/2408.00220).
5. Shen, L., Liu, J., and Wei, G.-W. “Persistent Mayer Homology and Persistent Mayer Laplacian.” *Foundations of Data Science* 6(4), 584-612 (2024). [DOI 10.3934/fods.2024032](https://doi.org/10.3934/fods.2024032); [arXiv:2312.01268](https://arxiv.org/abs/2312.01268).
6. Liu, J., Chen, D., and Wei, G.-W. “Persistent Interaction Topology in Data Analysis.” [arXiv:2404.11799](https://arxiv.org/abs/2404.11799) (2024).
7. Shen, L., Feng, H., Li, F., Lei, F., Wu, J., and Wei, G.-W. “Knot Data Analysis Using Multiscale Gauss Link Integral.” *Proceedings of the National Academy of Sciences* 121(42), e2408431121 (2024). [DOI 10.1073/pnas.2408431121](https://doi.org/10.1073/pnas.2408431121); [arXiv:2311.12834](https://arxiv.org/abs/2311.12834).
8. Liu, X., Su, Z., Shi, Y., Tong, Y., Wang, G., and Wei, G.-W. “Manifold Topological Deep Learning for Biomedical Data.” [arXiv:2503.00175](https://arxiv.org/abs/2503.00175) (2025).
