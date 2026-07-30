# White Paper: TDA and TDL in Molecular Sciences

## A white paper synthesis of Wee and Jiang (2025)

**Primary source:** JunJie Wee and Jian Jiang, "A review of topological data analysis and topological deep learning in molecular sciences," arXiv:2509.16877v1, submitted 21 September 2025. [arXiv](https://arxiv.org/abs/2509.16877) | [arXiv DOI](https://doi.org/10.48550/arXiv.2509.16877) | [later journal version](https://doi.org/10.1021/acs.jcim.5c02266)

## Executive summary

Wee and Jiang survey a distinctive arc in molecular topological data analysis (TDA): topology moved from a descriptive language for pockets, cavities, and folding pathways to a source of quantitative molecular fingerprints, and then into machine-learning systems for protein engineering, molecular interaction prediction, drug discovery, materials, genomics, and single-cell analysis. Their central claim is not merely that persistent homology is useful. It is that molecular science has repeatedly exposed the limits of plain persistent homology and, in response, stimulated a family of richer representations: element- and atom-specific persistence, multilevel and electrostatic persistence, persistent Laplacians, sheaf and path constructions, directed and higher-order complexes, and topological deep learning (TDL).

The survey's most important practical lesson is representational. Molecular data are multiscale and heterogeneous: atom identity, charge, directionality, spatial scale, locality, and many-body organization all matter. A topology-only summary can be robust and compact, but it may erase precisely the chemical information a predictive task needs. Successful molecular TDA therefore tends to be *conditioned topology*: the filtration, atom subsets, weights, complexes, or spectra are chosen to preserve a relevant physical or biological distinction, and the resulting descriptors are combined with statistical or deep learning.

The protein and drug lineage is the survey's backbone. Early alpha-complex and MAPPER studies described binding geometry and folding. Molecular topological fingerprints then encoded connected components, loops, and cavities across scale for protein structure, flexibility, folding, and classification. Element-specific persistent homology (ESPH) partitioned atoms by chemical type, making topological summaries sensitive to hydrophobic, hydrophilic, and hydrogen-bond-related interactions. TopologyNet and related TDL models vectorized these descriptors for neural networks. Persistent spectral methods subsequently added non-harmonic shape information to the harmonic information that recovers persistent Betti numbers. The same pattern now extends to mutation effects, protein-protein and protein-ligand binding, viral evolution, protein fitness landscapes, virtual screening, solubility, and toxicity.

The evidence base is promising but heterogeneous. The survey reports benchmark gains, competition performance, screening results, and several prospective viral-variant forecasts. These are not directly comparable forms of evidence. The paper is a broad narrative review, not a systematic review or meta-analysis: it gives no search protocol, inclusion criteria, standardized risk-of-bias assessment, or cross-study normalization of data splits and metrics. Its "state-of-the-art" statements should therefore be read as reports of results in cited studies, not as an independent comparative verdict.

For new projects, TDA should be treated as a hypothesis-bearing representation layer rather than a universal replacement for geometry, physics, sequence models, or experiments. The strongest studies will state what molecular information a filtration retains, use family-, scaffold-, or time-aware evaluation splits, ablate the topological contribution from auxiliary features, quantify uncertainty, and validate prioritized candidates experimentally.

## Scope and motivation

Molecular science spans structures and interactions at several scales: electrons and atoms, functional groups and residues, binding interfaces and domains, whole macromolecules, assemblies, cells, and populations. Its data may be point clouds, sequences, graphs, fields, trajectories, images, or networks. These systems create three recurring problems:

1. **Dimensionality:** atomistic coordinates and omics profiles are large, while labeled experimental data are often limited.
2. **Multiscale organization:** a feature can be irrelevant at one scale and decisive at another; local contacts coexist with global folds and cavities.
3. **Heterogeneous interaction physics:** atom type, charge, direction, solvent environment, and many-body effects are not captured by distance alone.

TDA addresses the first two problems by tracking structural features over a filtration rather than at a single threshold. Stable features can serve as compact descriptors; short-lived features may represent fine structure or noise, depending on the task. The third problem motivates most of the domain-specific extensions reviewed by Wee and Jiang.

The survey covers four major application blocks: macromolecules and their interactions (Section 3, pp. 7-10); drug discovery (Section 4, pp. 11-13); materials science (Section 5, pp. 14-15); and sequence, single-cell, and genetic-network applications (Section 6, pp. 16-17). Its emphasis is methodological breadth and examples of impact. It does not attempt an exhaustive comparison of every molecular descriptor or geometric deep-learning approach.

## Conceptual foundations

### From a molecular object to a filtration

A molecular structure can be represented as atoms or residues in space, possibly restricted to a binding site or divided by element type. A filtration builds a nested family of complexes by varying a scale or other control parameter. Persistent homology records when topological features appear and disappear:

- \(H_0\) tracks connected components, often reflecting the progressive formation of contacts or clusters.
- \(H_1\) tracks loops, rings, and tunnels.
- \(H_2\) tracks voids and enclosed cavities in three-dimensional representations.

The resulting birth-death information is expressed as barcodes or persistence diagrams and can be vectorized as images, landscapes, summary statistics, or learned embeddings. The choice of point set, metric, complex, filtration, and vectorization is part of the scientific model, not a neutral preprocessing detail.

### Persistent homology's value and its blind spots

According to the survey, persistent homology offers robust multiscale abstraction and interpretable structural features, but plain formulations have important limitations (Introduction, pp. 2-3):

- global invariants do not automatically localize a feature to a residue or binding contact;
- unlabeled point clouds treat chemically different atoms alike;
- topology can ignore non-topological shape variation;
- standard complexes may not represent directionality or higher-order interactions naturally;
- abstraction can discard useful information when the original data are already simple.

The survey frames later methods as targeted answers to these blind spots. ESPH retains chemical categories. Multilevel persistence separates interaction scales. Electrostatic and weighted constructions add physical attributes. Persistent Laplacians retain the harmonic information associated with topology while using non-harmonic spectra to describe shape. Sheaves support heterogeneous local data; path and directed-flag constructions accommodate directed relations; hypergraph and hyperdigraph variants target higher-order interactions.

### What "topological deep learning" means here

In this survey, TDL is used broadly for systems in which topological representations are integrated with neural networks or other advanced learning architectures. TopologyNet, introduced by Cang and Wei in 2017, is the canonical example: ESPH features are organized as multichannel inputs to convolutional and multitask networks. This usage is somewhat broader than definitions of TDL that reserve the term for neural message passing directly on topological domains. Readers comparing literatures should therefore inspect the actual architecture rather than rely on the label alone.

## The protein and drug lineage

The survey supports a four-stage lineage. Dates below describe representative milestones rather than exclusive periods.

### 1. Descriptive topology: pockets and pathways (1998-2009)

Alpha complexes were used to measure protein pockets and cavities and relate binding-site geometry to ligand design. MAPPER was applied to RNA hairpin folding and biomolecular folding pathways. These studies treated topology primarily as an exploratory description of conformational organization (Section 2.1, p. 4).

### 2. Quantitative molecular fingerprints (2014-2016)

Xia and Wei's molecular topological fingerprints (MTFs) used persistent homology for protein characterization, flexibility, folding, and stability. The survey reports that a 2015 MTF-SVM study distinguished drug-bound from unbound influenza A M2 channels with 96% accuracy, classified relaxed and taut hemoglobin forms at about 80%, classified broad protein-domain types at 85%, and achieved average accuracies of 82% and 73% on two collections of protein-superfamily tasks (Section 2.2, p. 5). These values are historical results reported by the survey; they should not be compared across tasks as though they arose from a common benchmark.

In parallel, alpha-filtration features were related to experimental protein compressibility, and multidimensional or multiresolution persistence was used for folding trajectories, flexibility, cryo-EM denoising, and large biomolecular data. The key conceptual transition was from seeing topology to using it as a quantitative predictor.

### 3. Chemistry-aware persistence and TDL (2017-2020)

ESPH partitions a molecular point cloud into chemically meaningful atom subsets before computing persistence. Carbon-only and carbon-pair channels can emphasize hydrophobic organization; nitrogen and oxygen channels can highlight polar or hydrogen-bond-related patterns. Multilevel persistence focuses filtrations on interaction scales, and electrostatic persistence introduces partial-charge information. These choices reduce geometric complexity without pretending that all atoms or contacts are equivalent (Section 2.3, pp. 6-7).

TopologyNet then coupled ESPH with convolutional and multitask neural networks for protein-ligand binding affinity and mutation-induced stability changes. TopNetTree extended the pattern to protein-protein binding-affinity changes by combining topological features, a convolutional network, and gradient-boosted trees. This stage established the now-common molecular-TDL template:

> chemically conditioned structure -> multiscale topological descriptor -> vectorization or tensorization -> supervised learner

### 4. Spectral, localized, directed, and hybrid models (2020-2025)

Persistent spectral graph theory and persistent Laplacians extend the representation beyond counts of persistent topological features. Their harmonic zero eigenvalues recover persistent Betti information, while nonzero spectra encode aspects of geometric shape. This is useful for problems such as flexibility or mutation effects where two structures can share topology but differ functionally in shape.

The survey then follows a rapid expansion: weighted and atom-specific persistence for flexibility; persistent sheaf Laplacians for localized heterogeneous information; persistent Hom and Tor constructions; path, directed-flag, hypergraph, and hyperdigraph Laplacians; interaction homology; and persistent de Rham-Hodge methods for manifold data. Hybrid models also add protein-language-model embeddings, transformer features, and AlphaFold-derived structures. Persistent spectral theory-guided protein engineering, for example, combines spectral topological features with sequence embeddings over protein fitness landscapes.

### A task-oriented taxonomy

| Representation family | Information added or preserved | Representative molecular tasks | Principal caution |
|---|---|---|---|
| Plain persistent homology | Multiscale connectivity, loops, cavities | Folding, pockets, structure classification, materials morphology | Can lose chemistry, locality, direction, and shape |
| Element-/atom-specific persistence | Chemical identity and selected atom-atom channels | Mutation stability, binding affinity, solubility | Channel design can encode strong assumptions |
| Multilevel/electrostatic/weighted persistence | Interaction scale, charge, or other attributes | Protein-ligand scoring, molecular properties, aggregation | Results depend on weights, charge model, and filtration |
| Persistent Laplacian/spectral methods | Topology plus non-harmonic shape information | Flexibility, binding, protein engineering, materials | Higher computational and tuning burden; spectra still require interpretation |
| Sheaf/localized methods | Local heterogeneous data and consistency | B-factors, functional regions, multimodal complexes | Methodology and software are less mature |
| Path/directed/hypergraph methods | Direction and higher-order relations | Regulatory networks, polarized interactions, biological networks | Complex construction must match the domain mechanism |
| Knot/link and curve invariants | Entanglement of embedded curves | Protein and polymer entanglement | Computation can be difficult; useful only when curve topology is meaningful |
| TDL hybrids | Learned nonlinear combination with sequence, physics, or geometry | Binding, screening, toxicity, protein fitness | Predictive gain does not by itself establish topological causality |

## Representative applications

### Protein stability, flexibility, and engineering

The survey treats proteins as the clearest demonstration of topology-function modeling. Persistent features have been used to track folding and unfolding, relate cavities to compressibility, predict mutation-induced stability and solubility changes, and estimate crystallographic B-factors. Since B-factors are local while ordinary persistent homology is global, atom-specific, weighted, evolutionary, and sheaf-Laplacian approaches are presented as better matched to the target (Section 3.2, p. 8).

For protein engineering, the survey argues that topology complements sequence models and predicted structures. Persistent spectral features can describe how a mutation changes invariants and shape, while protein-language-model embeddings describe sequence context. The cited TopFit study evaluates this strategy across 34 deep-mutational-scanning benchmarks with 128,634 variants. This is a strong example of multimodal complementarity, not evidence that topology should replace sequence models.

### Molecular interactions

The interaction applications span mutation-induced changes in protein-protein binding, direct protein-protein affinity, peptide-protein complex quality, antibody-antigen interactions, and protein-ligand binding. The survey reports that TopoDockQ, a peptide-protein complex-quality model, reduced false positives by at least 42% and increased precision by 6.7% relative to AlphaFold2's built-in confidence score across the cited benchmarks (Section 3.3, p. 9). Persistent Laplacian decision trees and other hybrids add sequence embeddings to topological interface features.

The shared design principle is to construct topology around an *interaction interface* rather than the entire molecule indiscriminately. That focus is scientifically valuable, but it also makes reproducibility depend on definitions of the pocket, cutoff, atom pairs, and structure preparation.

### Drug discovery

The survey groups drug applications into target identification, virtual screening, binding-affinity prediction, repurposing, solubility, and toxicity (Section 4, pp. 11-13).

- **Target identification:** path-based persistent topology and topological perturbation analysis aim to identify important nodes or modules in biological networks.
- **Virtual screening and binding:** ESPH, persistent Laplacians, directed-flag complexes, Mayer homology, Hodge-Laplacian methods, knot descriptors, and topological transformers are used to score protein-ligand complexes. The survey highlights TDA-based entries in D3R Grand Challenges as externally organized evidence.
- **Repurposing and safety:** cited studies screen DrugBank for antiaddiction targets, antimicrobials, and hERG cardiotoxicity. One reported screen flagged 227 potential hERG blockers among 8,641 DrugBank compounds.
- **Developability:** element-specific and multitask models are applied to aqueous solubility and toxicity; a cited topological-fusion model reports a 2.4% improvement over its comparator on ClinTox.

These applications should be interpreted as ranking and hypothesis-generation systems. A virtual hit, predicted affinity, or nominated repurposing candidate is not a validated therapeutic until orthogonal computation, assay work, pharmacology, and safety studies support it.

### Viral evolution

The SARS-CoV-2 work is presented as a high-visibility case of topological AI. Models combine mutation-induced changes in RBD-ACE2 or antibody binding with surveillance data to estimate infectivity and immune escape. The survey emphasizes predictions of BA.2 and BA.4/BA.5 dominance before official recognition (Section 3.4, pp. 9-10). These cases are notable because they are temporal predictions rather than retrospective benchmark scores. Still, evaluation should separate the contribution of topological binding features from epidemiological prevalence, sampling biases, and other covariates.

### Materials and adjacent molecular data

The same representations are applied to crystals, metal-organic frameworks, perovskites, polymers, amorphous solids, nanoporous materials, and self-assembly. Persistent descriptors summarize pore structure, medium-range order, defects, or phase organization. The survey also covers topological sequence analysis, single-cell transcriptomics, RNA velocity, and gene networks. This breadth supports the claim that TDA is a reusable representational idea, but it also makes a single notion of "success" impossible: classification, regression, mechanistic description, candidate discovery, and visualization require different standards.

## Evidence and evaluation patterns

The survey's examples fall into five evidence classes:

1. **Retrospective benchmark prediction:** affinity, stability, solubility, toxicity, B-factor, and material-property models are compared on established datasets.
2. **Representation studies:** correlations between topological summaries and known physical properties test whether a descriptor captures meaningful structure.
3. **Externally organized challenges:** D3R results reduce, but do not eliminate, the flexibility of in-house benchmark design.
4. **Prospective or temporal prediction:** variant-dominance forecasts offer a stronger time ordering between prediction and outcome.
5. **Candidate prioritization:** virtual screens and material searches produce hypotheses for later validation.

These forms of evidence are complementary, not interchangeable. A small gain on a fixed benchmark can be useful but may be sensitive to split design, hyperparameter search, or related structures appearing across train and test sets. A prospective forecast is harder to dismiss but may blend multiple information sources. A screen that yields plausible candidates establishes triage value, not experimental efficacy.

For rigorous assessment, readers should look beyond the survey's recurring "outperformed state-of-the-art" phrasing and ask:

- Were splits random, scaffold-aware, protein-family-aware, mutation-position-aware, or temporal?
- Were baselines retrained under the same data and protocol?
- Was the topological component ablated from sequence, physics, and transformer features?
- Are uncertainty, calibration, confidence intervals, and repeated runs reported?
- Is there an external dataset or prospective test?
- Are preprocessing, filtration parameters, atom selections, and code available?

## Limitations and open problems

### Limitations acknowledged by the survey

The authors explicitly identify loss of locality, restriction of common methods to point clouds, failure to represent non-topological information, and information loss through oversimplification. They also call for better scaling to large and complex datasets, richer invariants, effective software for differential and geometric topology, localized topological perturbation analysis, and deeper integration with fast-moving AI systems (Introduction and Section 7, pp. 17-18).

### Limitations of the evidence synthesis

This whitepaper's assessment adds several cautions:

- **Narrative selection:** the arXiv manuscript cites 197 works but provides no database search, inclusion rules, study-quality rubric, or quantitative synthesis. The literature map is informative, not demonstrably exhaustive.
- **Lineage concentration:** much of the technical story follows a highly productive, coherent research lineage centered on Wei and collaborators. That makes the survey valuable as a map of that program, while increasing the need for independent replication and broader comparison.
- **Benchmark heterogeneity:** results come from different datasets, metrics, versions, splits, and baselines. Performance numbers should remain attached to their original studies.
- **Interpretability is conditional:** a barcode or element channel may be understandable, but a vectorized descriptor passed through a deep ensemble is not automatically causally interpretable. Attribution and perturbation tests are still needed.
- **Structure quality and leakage:** predicted structures, homologous proteins, repeated scaffolds, or near-duplicate complexes can inflate performance if splits are not designed around deployment.
- **Hyperparameter sensitivity:** filtration type, distance cutoff, atom partition, charge model, complex, homology dimension, and vectorization all affect the result. Robustness across reasonable choices is rarely summarized at survey level.
- **Experimental gap:** most drug and material examples remain computational prioritization. Wet-lab or synthesis validation is the decisive next layer.
- **Aspirational AI outlook:** the paper's final references to LLMs, foundation models, AGI, and model context protocols indicate possible interfaces, but they do not yet constitute a validated methodological roadmap.

## Practical recommendations

For researchers considering molecular TDA or TDL:

1. **Start with the scientific interaction.** Decide whether the target depends on global fold, local interface, chemical identity, charge, direction, or higher-order organization. Choose the topological construction to match that mechanism.
2. **Use plain persistent homology as a baseline.** Add element specificity, weights, spectra, sheaves, or directed complexes only when they preserve information relevant to the hypothesis.
3. **Document the representation completely.** Report structure source and preparation, atom/residue selection, units, metric, filtration, complex, coefficient field, homology dimensions, vectorization, and all cutoffs.
4. **Build deployment-realistic splits.** Use scaffold, protein-family, mutation-position, laboratory, or temporal separation as appropriate. Random splits alone are rarely sufficient for molecular generalization claims.
5. **Ablate every information source.** Compare topology-only, sequence-only, geometry/physics-only, and combined models. Test whether the topological layer adds value beyond model capacity.
6. **Quantify robustness and uncertainty.** Vary filtration and representation choices, report repeated runs and confidence intervals, and evaluate calibration as well as point accuracy.
7. **Preserve interpretability deliberately.** Map influential features back to atom pairs, residues, scales, loops, or cavities, and test them through perturbations or known mechanisms.
8. **Plan external validation before screening.** Define docking, simulation, assay, mutagenesis, synthesis, or prospective surveillance checks and make candidate-selection criteria auditable.
9. **Release reusable artifacts.** Share split identifiers, computed topological features, software versions, and full training configuration. Descriptor computation can otherwise become an untraceable source of variation.

## Conclusion

Wee and Jiang's survey shows that the durable contribution of TDA to molecular science is not a single invariant or model. It is a design pattern for turning complex multiscale structure into compact, learnable, and sometimes interpretable representations. The field's development is a sequence of corrections to excessive abstraction: add chemistry when atom identity matters, spectra when shape matters, locality when residues matter, direction when flows matter, and auxiliary sequence or physical features when topology is only one part of the signal.

The protein and drug lineage provides substantial evidence that this pattern can be useful, from molecular fingerprints and TopologyNet to persistent-Laplacian hybrids and protein-language-model combinations. The next phase should emphasize independent evaluation, realistic generalization, explicit ablation, open software, and experimental validation. Under those conditions, TDA is best understood not as a universal molecular descriptor, but as a disciplined way to encode structural hypotheses across scale.

## Source note

This synthesis is based on the original 30-page arXiv v1 PDF submitted on 21 September 2025 (the PDF title page displays 23 September 2025). The arXiv manuscript has no figures or tables; its taxonomy is expressed through section structure and prose. The full PDF, all 17 pages of main text, and all 13 pages of references were inspected, including rendered page images. The later peer-reviewed version was published online by the *Journal of Chemical Information and Modeling* on 14 November 2025 and in volume 65(23), pp. 12691-12706; it has revised pagination and an overview figure. Bibliographic links below use the journal DOI when verified and the canonical arXiv record for preprints.

## Selected references

1. Wee, J.; Jiang, J. "A review of topological data analysis and topological deep learning in molecular sciences." arXiv:2509.16877v1 (2025). [arXiv](https://arxiv.org/abs/2509.16877) | [journal DOI](https://doi.org/10.1021/acs.jcim.5c02266)
2. Xia, K.; Wei, G.-W. "Persistent homology analysis of protein structure, flexibility, and folding." *International Journal for Numerical Methods in Biomedical Engineering* 30, 814-844 (2014). [DOI](https://doi.org/10.1002/cnm.2655)
3. Cang, Z.; Wei, G.-W. "Analysis and prediction of protein folding energy changes upon mutation by element specific persistent homology." *Bioinformatics* 33, 3549-3557 (2017). [DOI](https://doi.org/10.1093/bioinformatics/btx460)
4. Cang, Z.; Wei, G.-W. "TopologyNet: Topology based deep convolutional and multi-task neural networks for biomolecular property predictions." *PLOS Computational Biology* 13, e1005690 (2017). [DOI](https://doi.org/10.1371/journal.pcbi.1005690)
5. Cang, Z.; Mu, L.; Wei, G.-W. "Representability of algebraic topology for biomolecules in machine learning based scoring and virtual screening." *PLOS Computational Biology* 14, e1005929 (2018). [DOI](https://doi.org/10.1371/journal.pcbi.1005929)
6. Cang, Z.; Wei, G.-W. "Integration of element specific persistent homology and machine learning for protein-ligand binding affinity prediction." *International Journal for Numerical Methods in Biomedical Engineering* 34, e2914 (2018). [DOI](https://doi.org/10.1002/cnm.2914)
7. Wang, M.; Cang, Z.; Wei, G.-W. "A topology-based network tree for the prediction of protein-protein binding affinity changes following mutation." *Nature Machine Intelligence* 2, 116-123 (2020). [DOI](https://doi.org/10.1038/s42256-020-0149-6)
8. Wang, R.; Nguyen, D. D.; Wei, G.-W. "Persistent spectral graph." *International Journal for Numerical Methods in Biomedical Engineering* 36, e3376 (2020). [DOI](https://doi.org/10.1002/cnm.3376)
9. Memoli, F.; Wan, Z.; Wang, Y. "Persistent Laplacians: Properties, Algorithms and Implications." *SIAM Journal on Mathematics of Data Science* 4, 858-884 (2022). [DOI](https://doi.org/10.1137/21M1435471)
10. Qiu, Y.; Wei, G.-W. "Persistent spectral theory-guided protein engineering." *Nature Computational Science* 3, 149-163 (2023). [DOI](https://doi.org/10.1038/s43588-022-00394-y)
11. Chen, J.; Wei, G.-W. "Omicron BA.2 (B.1.1.529.2): High Potential for Becoming the Next Dominant Variant." *The Journal of Physical Chemistry Letters* 13, 3840-3849 (2022). [DOI](https://doi.org/10.1021/acs.jpclett.2c00469)
12. Chen, J.; Qiu, Y.; Wang, R.; Wei, G.-W. "Persistent Laplacian projected Omicron BA.4 and BA.5 to become new dominating variants." *Computers in Biology and Medicine* 151, 106262 (2022). [DOI](https://doi.org/10.1016/j.compbiomed.2022.106262)
13. Su, Z.; Liu, X.; Bou Hamdan, L.; Maroulas, V.; Wu, J.; Carlsson, G.; Wei, G.-W. "Topological data analysis and topological deep learning beyond persistent homology - a review." arXiv:2507.19504 (2025). [arXiv](https://arxiv.org/abs/2507.19504)
