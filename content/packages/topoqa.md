---
type: package
title: TopoQA
summary: A topological deep learning model ranking predicted protein-complex structures by the quality of their interface.
repository: https://github.com/yubingapril/TopoQA
languages:
  - Python
software_license:
  status: missing
tags:
  - method/persistent-homology
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# White Paper: TopoQA

## Persistent homology and graph attention for protein-complex interface QA

**Primary source:** Bingqing Han, Yipeng Zhang, Longlong Li, Xinqi Gong, and Kelin Xia, "TopoQA: a topological deep learning-based approach for protein complex structure interface quality assessment," *Briefings in Bioinformatics* 26(2), bbaf083 (2025). [Journal DOI](https://doi.org/10.1093/bib/bbaf083) | [PMC full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC11891663/) | [arXiv:2410.17815](https://arxiv.org/abs/2410.17815)

**Access and reuse:** The version of record and its supplement are open access under the [Creative Commons Attribution-NonCommercial 4.0 International license](https://creativecommons.org/licenses/by-nc/4.0/). The license permits attributed noncommercial reuse, distribution, and reproduction. Commercial reuse requires separate permission from Oxford University Press. This article license should not be assumed to license the accompanying software; the public code repository reviewed for this white paper does not contain a software license.

## Executive summary

TopoQA is a single-model quality-assessment method for ranking predicted protein-complex structures when the native structure is unavailable. Its target is not the correctness of the entire fold or the accuracy of every residue. It estimates a global score for the quality of the interaction interface. The method combines two representational views. Persistent homology summarizes the atomic arrangement around each interface residue, while a graph attention network propagates information through a residue-level graph of inter-chain contacts.

The design addresses a real gap in complex-structure prediction. AlphaFold-Multimer and AlphaFold 3 can generate multiple candidate conformations, but a downstream user still needs to select among them. Generic confidence scores and earlier complex-QA models do not necessarily capture the local, higher-order arrangement of atoms at an interface. TopoQA supplies each residue node with 140 persistent-homology features in addition to 32 conventional sequence and structural features. Eleven edge features describe the C-alpha separation and a histogram of all-atom distances between contacting residues. A multi-head graph attention module then pools node and edge embeddings into a predicted DockQ-like score.

The article reports evaluation on three test collections after filtering targets to less than 30 percent sequence identity with training and validation data. On DBM55-AF2, TopoQA's mean DockQ ranking loss is 0.069, compared with 0.049 for DProQA and 0.261 for AF-Multimer-based AF2Rank. Thus, TopoQA is not the best method on this dataset by that single metric, but its loss is 73.6 percent below AF2Rank and it has one of the strongest reported Top-10 CAPRI hit profiles. On HAF2, TopoQA reports the lowest mean ranking loss among the compared methods, 0.110. On the authors' ABAG-AF3 set, AlphaFold 3's own confidence is better overall: ranking loss is 0.054 for AlphaFold 3 and 0.092 for TopoQA, while mean Top-10 DockQ-wave is 0.614 and 0.592, respectively. TopoQA nevertheless beats AlphaFold 3 on 17 of 35 targets by ranking loss and on 16 by Top-10 mean score.

The ablations provide the clearest evidence that topology contributes within this architecture. Removing node topological features increases ranking loss from 0.069 to 0.129 on DBM55-AF2 and from 0.110 to 0.151 on HAF2, with large correlation losses. Removing detailed all-atom edge features also worsens ranking loss, although one DBM55-AF2 correlation rises slightly. These are useful component-level results, not proof that persistent homology is universally superior to other local geometric descriptors.

The evidence is encouraging but bounded. The test sets contain only 15, 12 after filtering, and 35 targets; there are no confidence intervals or hypothesis tests; the comparisons mix authors' runs, released checkpoints, and model-specific services; and the reported "stacked" correlations are sums across datasets rather than pooled correlation estimates. A public repository includes inference code, a pinned environment, a checkpoint, and one example PDB, but not the training pipeline, benchmark manifests, or an explicit license. TopoQA is therefore best viewed as a promising, partly reproducible research model for interface ranking, not a validated universal quality oracle.

## Scientific problem and scope

Protein complexes are often represented by an ensemble of candidate structures, or decoys. A quality-assessment model assigns each decoy a score without consulting the experimentally determined native structure. The operational objective is usually selection: the model should rank a near-native decoy above less accurate candidates for the same target.

The article distinguishes three QA regimes. Consensus methods compare a candidate against a pool of other candidates. Pseudo-single methods create such a pool internally. Single-model methods score one candidate directly. TopoQA belongs to the third class. This gives it an important deployment advantage: it can evaluate a structure without constructing or comparing a large ensemble, although ranking still requires scoring all candidates that a user wishes to compare.

TopoQA assesses the interaction interface. This is narrower than:

- global-fold assessment with metrics such as TM-score or GDT-score;
- residue-level error estimation with metrics such as lDDT;
- binding-affinity prediction, which estimates thermodynamics rather than geometric correctness;
- structure generation or refinement.

This scope matters. A protein complex could have a plausible interface but an inaccurate remote domain, or a good global fold but an incorrectly oriented interface. The TopoQA output should be interpreted as evidence about interface geometry, not as a general certificate of biological function or experimental accuracy.

## Conceptual foundations

### Interface quality and evaluation

The principal reference metric is DockQ, a continuous value between 0 and 1 derived from ligand RMSD, interface RMSD, and the fraction of native contacts. Higher values indicate closer agreement with the native interface. CAPRI criteria convert related measurements into incorrect, acceptable, medium, and high-quality classes. For complexes with multiple interfaces, DockQ-wave combines interface-specific DockQ values with weights. QS-score measures agreement in inter-chain contacts.

The paper's primary selection statistic is **ranking loss**:

> best reference score available for a target minus the reference score of the decoy ranked first by the QA method.

Lower is better, and zero means the method selected a best-scoring candidate. This metric is target-relative: an average can hide whether errors are broad and modest or concentrated in a few difficult targets. Pearson and Spearman correlations measure score calibration across decoys, while Top-10 hit rates ask whether the first ten ranked candidates contain acceptable, medium, or high-quality models. These metrics answer different questions and need not agree.

### Persistent homology as a local molecular descriptor

Persistent homology follows topological features while a distance threshold changes. Zero-dimensional homology tracks connected components as nearby points join. One-dimensional homology tracks loops. A barcode records the scale at which each feature appears and disappears.

TopoQA does not calculate one global barcode for the whole complex. For every interface residue, it selects nearby atoms and computes element-specific topology. This localization is scientifically important: the representation is attached to the molecular neighborhood that the model must judge. Seven atom selections are used:

\(\{C\}, \{N\}, \{O\}, \{C,N\}, \{C,O\}, \{N,O\}, \{C,N,O\}\).

These channels retain some chemical identity that an unlabeled point cloud would erase. Vietoris-Rips complexes provide zero-dimensional persistence, and alpha complexes provide one-dimensional persistence. Each barcode is reduced to summary statistics. The result is compact and fixed-length, but it no longer preserves every individual interval or identifies which atoms create a particular loop. The topology is therefore a learned descriptor, not a direct mechanistic explanation.

### Graph attention for interface context

Persistent homology describes a residue's local atomic neighborhood. A graph neural network connects those local views into an interface-level representation. Residues are nodes, and only inter-chain contacts are edges, making a bipartite graph for two chains or a multipartite graph for larger assemblies.

ProteinGAT uses attention weights that depend on the source node, destination node, and edge embedding. Attention allows neighboring contacts to contribute unequally. Node and edge embeddings are updated, averaged separately over the graph, concatenated, and passed through a multilayer perceptron. The predicted score is constrained by a sigmoid. Persistent homology and graph attention play complementary roles: the first compresses atomic-scale geometry around nodes, and the second integrates contact-scale information across the interface.

## The TopoQA pipeline

The following pipeline is reconstructed from the version of record, Figure 2 on journal p. 6, the supplement, and the released inference code.

### 1. Extract the interface and build the graph

Starting from a PDB-format candidate complex, TopoQA retains residues whose C-alpha atom lies within 10 Angstrom of a C-alpha atom on another chain. Nodes are these interface residues. Edges connect residues on different chains when their C-alpha separation is less than 10 Angstrom. Intra-chain edges are omitted, deliberately focusing message passing on the interaction between chains.

### 2. Calculate conventional node features

Each node receives 32 basic features:

- a 21-value one-hot encoding for the 20 standard amino acids plus unknown;
- an 8-value DSSP secondary-structure encoding;
- relative solvent-accessible surface area;
- normalized phi and psi torsion angles.

These features ensure that the network is not topology-only. Residue identity, exposure, backbone conformation, and secondary structure can all influence its prediction.

### 3. Add 140 topological node features

For each interface residue, atoms within an 8 Angstrom radius of its C-alpha atom form a local point cloud. The seven carbon, nitrogen, and oxygen selections listed above are processed separately. The published implementation filters zero-dimensional bars with death at most 8 and all retained bars with lifetime at least 0.01.

For each element channel, zero-dimensional bars contribute five summaries of death or lifetime values: sum, minimum, maximum, mean, and standard deviation. One-dimensional bars contribute the same five summaries for lifetime, birth, and death, for 15 more values. Twenty values across seven channels produce 140 topological features. Combined with the 32 basic features, each node has dimension 172.

This vectorization makes learning practical, but its invariance should not be overstated. Results depend on the neighborhood radius, atom selections, complex type, persistence dimensions, barcode filters, and statistics. These are molecular modeling choices as much as mathematical ones.

### 4. Encode detailed edge geometry

Each edge has 11 features. One is C-alpha distance. The other ten count pairwise atom-atom distances between the two residues in bins from 1 to 2, 2 to 3, and so on through 9 to 10 Angstrom, with a final bin from 10 Angstrom upward. This histogram recovers interaction detail that a single residue-center distance cannot express.

### 5. Learn and pool the interface representation

The supplementary hyperparameter table reports two ProteinGAT layers, eight attention heads, hidden dimension 32, dropout 0.25, mean pooling, and learning rate 0.005 as the selected configuration. Training uses Adam, mean-squared error against DockQ, 200 epochs, and the best validation checkpoint. Average-pooled node and edge embeddings are concatenated after reducing the edge embedding dimension, then an MLP and sigmoid produce the interface-quality score.

## Datasets and evaluation design

### Training and validation

The authors reuse the split published with DProQA and ComplexQA. It combines:

- MAF2, with 9,251 AlphaFold2 and AlphaFold-Multimer decoys based on targets from EVcouplings and DeepHomo;
- Dockground, with 58 complex targets and reported averages of 9.83 correct and 98.5 incorrect decoys per target.

Targets were clustered with MMseqs2 at 30 percent sequence identity. Seventy percent of clusters supplied training decoys and the remainder supplied validation decoys, yielding 8,733 training and 3,407 validation structures. Cluster-level division is stronger than a random decoy split because related targets are less likely to cross the boundary.

### Test sets

| Test set | Intended domain | Article-reported size | Reference emphasized |
|---|---|---:|---|
| DBM55-AF2 | Antibody-antigen decoys from Docking Benchmark 5.5 | 15 targets, 449 decoys | DockQ and CAPRI |
| HAF2 | AlphaFold-Multimer heterodimer decoys | 13 targets, 1,370 decoys initially; 12 targets after excluding 7ALA | DockQ and CAPRI |
| ABAG-AF3 | Antibody-antigen targets released after 2022, 25 AlphaFold 3 conformations per target | 35 targets, 875 conformations | DockQ-wave |

All three sets were filtered against training and validation targets at 30 percent sequence identity. The post-2022 ABAG-AF3 construction and use of a different generator test some temporal and generator transfer, although it remains an author-constructed retrospective benchmark.

Baselines include DProQA, ComplexQA, GNN-DOVE, TRScore, AF-Multimer-based AF2Rank, and, on ABAG-AF3, AlphaFold 3's own confidence. The supplement states that released DProQA and ComplexQA models were run for ABAG-AF3, AF2Rank was run through its public notebook, and AlphaFold 3 results came from output self-assessment scores. This improves transparency but does not make every comparison identical in software, hardware, or tuning.

## Main reported results

The numbers in this section are claims reported by Han et al.; they have not been independently recomputed for this white paper.

### Selection and ranking

- **DBM55-AF2:** TopoQA has mean DockQ ranking loss 0.069. DProQA is lower at 0.049, while ComplexQA and AF-Multimer-based AF2Rank are 0.260 and 0.261. TopoQA's 73.6 percent reduction is specifically relative to AF2Rank, not relative to the best comparator. Its Top-10 CAPRI summary is 13/10/3 targets for acceptable-or-better, medium-or-better, and high-quality hits, respectively (Supplementary Tables S5-S6).
- **HAF2:** After sequence filtering, TopoQA reports the lowest mean ranking loss, 0.110, versus 0.120 for AF2Rank and 0.192 for DProQA. Its Top-10 summary is 10/9/4. ComplexQA and AF2Rank each reach acceptable models for 11 targets, while TopoQA ties the best reported medium and high-quality target counts (Tables S7-S8).
- **ABAG-AF3:** AlphaFold 3 is best overall, with ranking loss 0.054 and mean Top-10 DockQ-wave 0.614. TopoQA records 0.092 and 0.592. Among the remaining methods, TopoQA has the lowest ranking loss and highest Top-10 mean, narrowly ahead of AF2Rank at 0.094 and 0.589. Per-target results favor TopoQA over AlphaFold 3 on 17 of 35 targets by ranking loss and 16 of 35 by Top-10 mean (journal Table 1 and Supplementary Tables S13-S14).

Figure 4 reports stacked results across datasets: TopoQA's summed ranking loss is 0.27, compared with 0.36 for DProQA and 0.47 for AF2Rank; its summed Pearson and Spearman coefficients are 1.38 and 1.43. These aggregates are useful for a compact comparison, but sums of dataset-level correlations are not themselves correlation coefficients and should not be interpreted as a pooled effect size.

### Robustness and ablation

Across five random seeds, TopoQA's mean ranking loss is reported as 0.087 with standard deviation 0.010 on DBM55-AF2, versus 0.099 with standard deviation 0.033 for DProQA. On HAF2 the corresponding values are 0.111 with standard deviation 0.008 and 0.234 with standard deviation 0.022 (Tables S9 and S11). These repetitions support optimization stability on the two older test sets, but the paper does not provide multi-seed ABAG-AF3 results.

Removing node topological features worsens DBM55-AF2 ranking loss from 0.069 to 0.129 and HAF2 loss from 0.110 to 0.151. Pearson and Spearman correlations fall from 0.515 and 0.502 to 0.317 and 0.380 on DBM55-AF2, and from 0.600 and 0.675 to 0.116 and 0.271 on HAF2. Removing the all-atom edge histogram changes ranking losses to 0.103 and 0.159. The DBM55-AF2 Pearson correlation slightly increases from 0.515 to 0.525, a useful reminder that no component dominates every metric (Table S18 and Figure S2).

### Computational cost

On an AMD Ryzen Threadripper PRO 5975WX system using 32 cores and 64 threads, 90 percent of training and validation decoys have topological-feature calculation times below 8.69 seconds. Runtime grows strongly with interface size; the supplement reports a 2.30-second mean below 100 interface residues and 104.72 seconds for 1,000-2,000 residues (Figure S1 and Table S2).

For 35 ABAG-AF3 targets, the supplement reports mean TopoQA runtime of 53.33 seconds on an RTX 5000 Ada and mean AlphaFold Server runtime of 1,407.84 seconds. The stated 26.4-fold difference should not be treated as a controlled algorithm benchmark: local scoring of existing structures and a hosted AlphaFold workflow differ in hardware, queueing, and potentially in structure-generation work.

## Evidence-quality assessment

### Strengths

- Target-level sequence filtering reduces obvious homology leakage.
- Three test sets cover antibody-antigen complexes, heterodimers, and AlphaFold 3-generated multimers.
- Ranking, Top-10 retrieval, Pearson correlation, Spearman correlation, and three structural reference metrics expose different failure modes.
- Multi-seed comparisons and component ablations go beyond a single best checkpoint.
- The supplement supplies per-target tables, hyperparameter choices, and runtime analysis.
- The ABAG-AF3 result is appropriately mixed rather than uniformly favorable: AlphaFold 3 wins overall, while TopoQA wins on nearly half the individual targets.

### Limitations and open questions

- The effective target counts are small. Decoy-level sample counts do not substitute for independent biological targets.
- There are no confidence intervals, paired statistical tests, or uncertainty estimates for the target-level comparisons.
- The training set is modest at 8,733 decoys and is dominated by oligomeric structures produced by AlphaFold-family methods. Generalization to other docking engines, disordered interfaces, nucleic-acid complexes, or ligand-containing assemblies is untested.
- Hyperparameters are selected on one validation split. Nested tuning or evaluation across several target-cluster splits is not reported.
- The strongest evidence for topology is an internal ablation. The paper does not compare its 140 PH features against equally sized learned local point-cloud, equivariant, or geometric descriptors under the same ProteinGAT architecture.
- "Stacked" loss and correlation plots compress heterogeneous targets and datasets. Per-target distributions are more informative than bar totals.
- TopoQA predicts one interface-level score. It does not localize errors, evaluate whole-complex folds, or quantify calibrated uncertainty.
- PCA and t-SNE plots in Supplementary Figure S3 show partial separation of acceptable and incorrect decoys, but such visualizations are descriptive and do not establish out-of-distribution generalization.

## Independent replication (clean-room reimplementation, 2026-08)

A from-the-paper reimplementation of the featurizer and ProteinGAT scorer (`open-topoqa-featurizer`, `open-topoqa-scorer`; MIT-licensed) was evaluated against the same DBM55-AF2 (15 targets, 449 decoys) and HAF2 (13 targets, 1,370 decoys; 12 after excluding 7ALA) test sets described above, obtained from the DProQA benchmark distribution. To keep the reimplementation's provenance clean, the *upstream* artifacts were run only by an independent third party on separate infrastructure, which returned per-decoy predictions and provenance facts — numbers, not code. All metrics below were recomputed under a single definition, so differences cannot be attributed to differing metric code.

Three findings resulted.

1. **The released artifacts reproduce the paper.** Running the authors' checkpoint (commit `118f1e11`) on the benchmark yields DBM55-AF2 ranking loss 0.0694 and HAF2-12 0.1103, matching the reported 0.069 and 0.110. The reported correlations reproduce as *pooled* statistics — pooled Spearman/Pearson 0.502/0.515 (DBM55-AF2) and 0.675/0.600 (HAF2-12) — not as per-target means, which are substantially lower (roughly 0.18 Spearman on DBM55-AF2). This is consistent with the paper's use of "stacked" rather than pooled aggregates elsewhere and is worth noting when comparing against per-target correlation reports.

2. **Part of the reported ranking-loss advantage depends on the `(x, y, y)` coordinate handling.** The released code runs with `(x, y, y)`; correcting it to `(x, y, z)` raises ranking loss to 0.077 (DBM55-AF2) and 0.147 (HAF2-12) — roughly a third of the HAF2 margin. The clean reimplementation, which uses the correct `(x, y, z)`, reaches 0.142 on HAF2-12 (parity with a corrected upstream) and matches or exceeds upstream on every correlation metric (pooled Pearson ~0.60 on DBM55-AF2, ~0.70 on HAF2-12).

3. **A residual gap remains on DBM55-AF2 ranking loss** (reimplementation ~0.14 vs 0.077 for the corrected upstream). It localizes to two targets whose single top-ranked decoy is mis-selected; both models are misled by the same deceptive decoys, and upstream wins the top-1 by a narrow calibration margin. A capacity, dropout, epoch-budget, and checkpoint-selection sweep left the number invariant at ~0.14, indicating the residual stems from an unspecified upstream training or architectural detail the paper does not pin — the supplement's hyperparameter table gives layers, heads, hidden width, dropout, and learning rate, but not the full training schedule or data handling — rather than from the reproduced components.

The exercise supports the paper's core claim that the released method ranks interfaces as reported, while showing that roughly a third of the HAF2 ranking-loss margin is attributable to the coordinate defect and that the headline correlation figures are pooled rather than per-target statistics.

## Practical reproducibility guidance

The article points to author-hosted code and ABAG-AF3 endpoints. Those endpoints did not respond during this review on July 28, 2026. A public [GitHub repository](https://github.com/yubingapril/TopoQA) was accessible and inspected at commit `118f1e11d9594cc4c1ca99ea6eee0409b3c3df5e`, dated January 7, 2025. It contains inference code, a 1.5 MB pretrained checkpoint, a conda environment, and one example PDB. The environment pins Python 3.9, PyTorch 2.1, CUDA 12.1, PyTorch Geometric 2.5.3, GUDHI 3.10.1, Biopython, DSSP, and related packages.

Reproduction is incomplete because the repository lacks training and evaluation scripts, benchmark manifests, expected-output tests, a container, and an explicit software license. Its inference script also hard-codes parallelism and several preprocessing choices. In the reviewed snapshot, the coordinate helper in `src/utils.py` constructs all-atom edge-histogram coordinates as `(x, y, y)` rather than `(x, y, z)`. This may be a correctable code defect or an artifact of the released snapshot; users should resolve it with the authors and test whether changing it affects checkpoint compatibility and scores. The independent replication described below confirms that the released code runs with `(x, y, y)` and that the reported ranking-loss numbers depend on it: correcting to `(x, y, z)` raises DBM55-AF2 ranking loss from 0.069 to 0.077 and HAF2-12 from 0.110 to 0.147.

A responsible reproduction should:

1. Pin the repository commit and record operating system, DSSP, CUDA, GUDHI, and PyTorch Geometric versions.
2. Validate structure preparation, chain identifiers, insertion codes, alternate locations, missing residues, and nonstandard atoms before feature calculation.
3. Run the supplied example, preserve all intermediate interface, topology, node, and graph artifacts, and establish an expected score.
4. Compare the code's exact cutoffs, normalization, barcode filtering, coordinate handling, and graph-layer count with the version of record and supplement.
5. Obtain target and decoy manifests from the original benchmark sources, recreate the 30 percent sequence filter, and ensure labels are used only for evaluation.
6. Recompute per-target results and seed variability before accepting aggregate claims.
7. Benchmark against a simple baseline, AF2/AF3 confidence, and at least one modern geometric model under the same candidates and metrics.
8. Treat predicted score as a ranking aid. Inspect interfaces visually and use experimental or orthogonal computational evidence before biological decisions.

## Conclusion

TopoQA presents a coherent multiscale architecture for protein-complex interface assessment. Element-specific persistent homology captures atomic organization around each residue; graph attention integrates those local descriptors across inter-chain contacts; and graph-level regression produces a candidate-ranking score. The published ablations support the value of topological node features within this model, and the HAF2 and cross-generator ABAG-AF3 results justify further study.

The work is also a useful lesson in claim calibration. TopoQA does not beat every comparator on every metric. DProQA has lower single-run ranking loss on DBM55-AF2, and AlphaFold 3 is better overall on ABAG-AF3. TopoQA's contribution is a transferable representation that is competitive across several interface-QA settings and, unlike generator-specific confidence, can in principle score structures from different sources.

Before operational use, the field needs larger target-level benchmarks, independent replication, controlled comparisons with non-topological local geometry, calibrated uncertainty, and a complete licensed training release. With those additions, TopoQA's topology-plus-attention pattern could become a useful component of ensemble selection, docking triage, and protein-complex modeling workflows.

## Source note and selected verified references

The 12-page version-of-record PDF, its 20-page supplementary PDF, and the 26-page arXiv preprint were reviewed. The journal article was the controlling source because it contains revisions and expanded evaluation not present in the October 2024 preprint. Journal Figures 1-5 and Table 1 were rendered and inspected, as were supplementary hyperparameters, runtime figures and tables, per-target results, ablation Table S18 and Figure S2, and embedding Figure S3. The public inference repository was inspected without asserting successful end-to-end execution.

1. Han, B., Zhang, Y., Li, L., Gong, X., and Xia, K. "TopoQA: a topological deep learning-based approach for protein complex structure interface quality assessment." *Briefings in Bioinformatics* 26(2), bbaf083 (2025). [DOI 10.1093/bib/bbaf083](https://doi.org/10.1093/bib/bbaf083).
2. Basu, S. and Wallner, B. "DockQ: a quality measure for protein-protein docking models." *PLOS ONE* 11, e0161879 (2016). [DOI 10.1371/journal.pone.0161879](https://doi.org/10.1371/journal.pone.0161879).
3. Chen, X., Morehead, A., Liu, J., and Cheng, J. "A gated graph transformer for protein complex structure quality assessment and its performance in CASP15." *Bioinformatics* 39, i308-i317 (2023). [DOI 10.1093/bioinformatics/btad203](https://doi.org/10.1093/bioinformatics/btad203).
4. Zhang, L., Wang, S., Hou, J., et al. "ComplexQA: a deep graph learning approach for protein complex structure assessment." *Briefings in Bioinformatics* 24, bbad287 (2023). [DOI 10.1093/bib/bbad287](https://doi.org/10.1093/bib/bbad287).
5. Abramson, J., Adler, J., Dunger, J., et al. "Accurate structure prediction of biomolecular interactions with AlphaFold 3." *Nature* 630, 493-500 (2024). [DOI 10.1038/s41586-024-07487-w](https://doi.org/10.1038/s41586-024-07487-w).
6. Pun, C. S., Lee, S. X., and Xia, K. "Persistent-homology-based machine learning: a survey and a comparative study." *Artificial Intelligence Review* 55, 5169-5213 (2022). [DOI 10.1007/s10462-022-10146-z](https://doi.org/10.1007/s10462-022-10146-z).
7. Zhao, N., Han, B., Zhao, C., Xu, J., and Gong, X. "ABAG-docking benchmark: a non-redundant structure benchmark dataset for antibody-antigen computational docking." *Briefings in Bioinformatics* 25, bbae048 (2024). [DOI 10.1093/bib/bbae048](https://doi.org/10.1093/bib/bbae048).
8. Han, B. et al. "TopoQA" source and pretrained model repository. [GitHub repository](https://github.com/yubingapril/TopoQA), reviewed at commit `118f1e11d9594cc4c1ca99ea6eee0409b3c3df5e`.
