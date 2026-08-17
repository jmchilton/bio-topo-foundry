# Citation-integrity audit

> This report verifies scholarly citation identity. It does not determine whether a source
> supports the surrounding scientific claim.

Manual review: **not-required**
Reviewed flagged findings: **0/0**

## Partitions

| Verdict | Count |
|---|---:|
| resolved | 91 |
| resolved-mismatched | 0 |
| unresolved | 0 |
| unavailable | 0 |
| total | 91 |

## Verification

Verified against a described work: **85 of 91** resolved citations.

The remaining **6** resolved an identifier that no nearby text describes, so the only thing checked was that the identifier exists. Give the citation a title, or record the identifier in a note field the extraction config declares, and it becomes checkable.

| Source | Identifier |
|---|---|
| `content/packages/hiponet.md:24` | doi:10.48550/arxiv.2502.07746; arxiv:2502.07746 |
| `content/packages/petls-pytorch.md:33` | arxiv:2508.11560 |
| `content/packages/petls-pytorch.md:92` | arxiv:2508.11560 |
| `content/papers/mapper-brca-survival.md:32` | arxiv:2607.15022 |
| `content/papers/mapper-brca-survival.md:33` | doi:10.48550/arxiv.2607.15022; arxiv:2607.15022 |
| `content/papers/tdl-docking-benchmark-review.md:41` | doi:10.1093/bib/bbag370 |

## Extraction coverage

Extracted **91 of 109** reference-section lines. The verdict counts above describe only the extracted lines.

A wrapped entry counts once per physical line, so this is a lower bound on coverage.

- `content/packages/hiponet.md:236`
- `content/packages/hiponet.md:245`
- `content/packages/petls-pytorch.md:91`
- `content/packages/petls.md:245`
- `content/packages/petls.md:248`
- `content/packages/petls.md:249`
- `content/packages/petls.md:250`
- `content/packages/petls.md:255`
- `content/packages/topodockq.md:209`
- `content/packages/topodockq.md:219`
- `content/packages/topometry.md:259`
- `content/packages/topometry.md:262`
- `content/packages/topometry.md:263`
- `content/packages/topometry.md:264`
- `content/packages/topoqa.md:225`
- `content/packages/topoqa.md:234`
- `content/papers/tda-tdl-beyond-persistent-homology.md:210`
- `content/papers/tda-tdl-molecular-sciences.md:221`

## resolved

| Source | Described identity | Resolver evidence | Review note |
|---|---|---|---|
| `content/packages/hiponet.md:22` | HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell data | openalex `arxiv:2502.07746` → arxiv:2502.07746; citation-metadata-page `url:https://proceedings.neurips.cc/paper_files/paper/2025/hash/b284aad9fb5c6d74b9535a30ece69e1c-Abstract-Conference.html` → doi:10.52202/085713-4107 | — |
| `content/packages/hiponet.md:24` | doi:10.48550/arxiv.2502.07746; arxiv:2502.07746 | openalex `arxiv:2502.07746` → arxiv:2502.07746 | — |
| `content/packages/hiponet.md:238` | HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell data | citation-metadata-page `url:https://proceedings.neurips.cc/paper_files/paper/2025/hash/b284aad9fb5c6d74b9535a30ece69e1c-Abstract-Conference.html` → doi:10.52202/085713-4107 | — |
| `content/packages/hiponet.md:239` | HiPoNet: A Multi-View Simplicial Complex Network for High Dimensional Point-Cloud and Single-Cell Data | openalex `arxiv:2502.07746` → arxiv:2502.07746 | — |
| `content/packages/hiponet.md:240` | Unsupervised parameter-free simplicial representation learning with scattering transforms | citation-metadata-page `url:https://proceedings.mlr.press/v235/madhu24a.html` → url:https://proceedings.mlr.press/v235/madhu24a.html | — |
| `content/packages/hiponet.md:241` | Trellis tree-based analysis reveals stromal regulation of patient-derived organoid drug responses | crossref `doi:10.1016/j.cell.2023.11.005` → doi:10.1016/j.cell.2023.11.005 | — |
| `content/packages/hiponet.md:242` | Space-GM: geometric deep learning of disease-associated microenvironments from multiplex spatial protein profiles | crossref `doi:10.1101/2022.05.12.491707` → doi:10.1101/2022.05.12.491707 | — |
| `content/packages/hiponet.md:243` | Geometric scattering for graph data analysis | citation-metadata-page `url:https://proceedings.mlr.press/v97/gao19e.html` → url:https://proceedings.mlr.press/v97/gao19e.html | — |
| `content/packages/petls-pytorch.md:33` | arxiv:2508.11560 | openalex `arxiv:2508.11560` → arxiv:2508.11560 | — |
| `content/packages/petls-pytorch.md:92` | arxiv:2508.11560 | openalex `arxiv:2508.11560` → arxiv:2508.11560 | — |
| `content/packages/petls.md:24` | PETLS: PErsistent Topological Laplacian Software | openalex `arxiv:2508.11560` → arxiv:2508.11560 | — |
| `content/packages/petls.md:247` | PETLS: PErsistent Topological Laplacian Software | openalex `arxiv:2508.11560` → arxiv:2508.11560 | warning: openalex (arxiv:2508.11560): year differs: described 2026, observed 2025 |
| `content/packages/petls.md:251` | Persistent Laplacians: Properties, Algorithms and Implications | crossref `doi:10.1137/21m1435471` → doi:10.1137/21m1435471 | — |
| `content/packages/petls.md:252` | HERMES: Persistent spectral graph software | crossref `doi:10.3934/fods.2021006` → doi:10.3934/fods.2021006 | — |
| `content/packages/petls.md:253` | Persistent sheaf Laplacians | crossref `doi:10.3934/fods.2024033` → doi:10.3934/fods.2024033 | — |
| `content/packages/petls.md:254` | Persistent topological Laplacians - a survey | crossref `doi:10.3390/math13020208` → doi:10.3390/math13020208 | — |
| `content/packages/topodockq.md:23` | Topological deep learning for enhancing peptide-protein complex prediction | crossref `doi:10.1038/s42004-025-01727-4` → doi:10.1038/s42004-025-01727-4; europe-pmc `pmcid:PMC12612092` → pmcid:PMC12612092 | — |
| `content/packages/topodockq.md:211` | Topological deep learning for enhancing peptide-protein complex prediction | crossref `doi:10.1038/s42004-025-01727-4` → doi:10.1038/s42004-025-01727-4 | — |
| `content/packages/topodockq.md:212` | DockQ: A Quality Measure for Protein-Protein Docking Models | crossref `doi:10.1371/journal.pone.0161879` → doi:10.1371/journal.pone.0161879 | — |
| `content/packages/topodockq.md:213` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376 | — |
| `content/packages/topodockq.md:214` | HERMES: Persistent spectral graph software | crossref `doi:10.3934/fods.2021006` → doi:10.3934/fods.2021006 | — |
| `content/packages/topodockq.md:215` | High-resolution global peptide-protein docking using fragments-based PIPER-FlexPepDock | crossref `doi:10.1371/journal.pcbi.1005905` → doi:10.1371/journal.pcbi.1005905 | — |
| `content/packages/topodockq.md:216` | OpenMM 7: Rapid development of high performance algorithms for molecular dynamics | crossref `doi:10.1371/journal.pcbi.1005659` → doi:10.1371/journal.pcbi.1005659 | — |
| `content/packages/topodockq.md:217` | Development and benchmarking of Open Force Field 2.0.0: the Sage small molecule force field | crossref `doi:10.1021/acs.jctc.3c00039` → doi:10.1021/acs.jctc.3c00039 | — |
| `content/packages/topometry.md:21` | TopoMetry systematically learns and evaluates the latent geometry of single-cell data | crossref `doi:10.7554/elife.100361.3` → doi:10.7554/elife.100361.3 | — |
| `content/packages/topometry.md:261` | TopoMetry systematically learns and evaluates the latent geometry of single-cell data | crossref `doi:10.7554/elife.100361.3` → doi:10.7554/elife.100361.3 | — |
| `content/packages/topometry.md:265` | Laplacian Eigenmaps for dimensionality reduction and data representation | crossref `doi:10.1162/089976603321780317` → doi:10.1162/089976603321780317 | — |
| `content/packages/topometry.md:266` | Diffusion maps | crossref `doi:10.1016/j.acha.2006.04.006` → doi:10.1016/j.acha.2006.04.006 | — |
| `content/packages/topometry.md:267` | SCANPY: large-scale single-cell gene expression data analysis | crossref `doi:10.1186/s13059-017-1382-0` → doi:10.1186/s13059-017-1382-0 | — |
| `content/packages/topometry.md:268` | UMAP: Uniform Manifold Approximation and Projection for dimension reduction | openalex `arxiv:1802.03426` → arxiv:1802.03426 | — |
| `content/packages/topometry.md:269` | Visualizing structure and transitions in high-dimensional biological data | crossref `doi:10.1038/s41587-019-0336-3` → doi:10.1038/s41587-019-0336-3 | — |
| `content/packages/topoqa.md:21` | TopoQA: a topological deep learning-based approach for protein complex structure interface quality assessment | crossref `doi:10.1093/bib/bbaf083` → doi:10.1093/bib/bbaf083; openalex `arxiv:2410.17815` → arxiv:2410.17815; europe-pmc `pmcid:PMC11891663` → pmcid:PMC11891663 | warning: openalex (arxiv:2410.17815): year differs: described 2025, observed 2024 |
| `content/packages/topoqa.md:227` | TopoQA: a topological deep learning-based approach for protein complex structure interface quality assessment | crossref `doi:10.1093/bib/bbaf083` → doi:10.1093/bib/bbaf083 | — |
| `content/packages/topoqa.md:228` | DockQ: a quality measure for protein-protein docking models | crossref `doi:10.1371/journal.pone.0161879` → doi:10.1371/journal.pone.0161879 | — |
| `content/packages/topoqa.md:229` | A gated graph transformer for protein complex structure quality assessment and its performance in CASP15 | crossref `doi:10.1093/bioinformatics/btad203` → doi:10.1093/bioinformatics/btad203 | — |
| `content/packages/topoqa.md:230` | ComplexQA: a deep graph learning approach for protein complex structure assessment | crossref `doi:10.1093/bib/bbad287` → doi:10.1093/bib/bbad287 | — |
| `content/packages/topoqa.md:231` | Accurate structure prediction of biomolecular interactions with AlphaFold 3 | crossref `doi:10.1038/s41586-024-07487-w` → doi:10.1038/s41586-024-07487-w | — |
| `content/packages/topoqa.md:232` | Persistent-homology-based machine learning: a survey and a comparative study | crossref `doi:10.1007/s10462-022-10146-z` → doi:10.1007/s10462-022-10146-z | — |
| `content/packages/topoqa.md:233` | ABAG-docking benchmark: a non-redundant structure benchmark dataset for antibody-antigen computational docking | crossref `doi:10.1093/bib/bbae048` → doi:10.1093/bib/bbae048 | — |
| `content/papers/mapper-brca-survival.md:2` | Topology-Informed Survival Analysis of Breast Cancer Patients Using the Mapper Algorithm | openalex `arxiv:2607.15022` → arxiv:2607.15022 | — |
| `content/papers/mapper-brca-survival.md:32` | arxiv:2607.15022 | openalex `arxiv:2607.15022` → arxiv:2607.15022 | — |
| `content/papers/mapper-brca-survival.md:33` | doi:10.48550/arxiv.2607.15022; arxiv:2607.15022 | openalex `arxiv:2607.15022` → arxiv:2607.15022 | — |
| `content/papers/persistent-spectral-graph.md:2` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376; openalex `arxiv:1912.04135` → arxiv:1912.04135 | warning: openalex (arxiv:1912.04135): year differs: described 2020, observed 2019 |
| `content/papers/persistent-spectral-graph.md:30` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376; openalex `arxiv:1912.04135` → arxiv:1912.04135 | warning: crossref (doi:10.1002/cnm.3376): year differs: described 2019, observed 2020 |
| `content/papers/persistent-spectral-graph.md:165` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376; openalex `arxiv:1912.04135` → arxiv:1912.04135 | warning: openalex (arxiv:1912.04135): year differs: described 2020, observed 2019 |
| `content/papers/persistent-spectral-graph.md:166` | HERMES: Persistent spectral graph software | crossref `doi:10.3934/fods.2021006` → doi:10.3934/fods.2021006 | — |
| `content/papers/persistent-spectral-graph.md:167` | Persistent Laplacians: Properties, Algorithms and Implications | crossref `doi:10.1137/21m1435471` → doi:10.1137/21m1435471 | — |
| `content/papers/persistent-spectral-graph.md:168` | PETLS: PErsistent Topological Laplacian Software | openalex `arxiv:2508.11560` → arxiv:2508.11560 | — |
| `content/papers/persistent-spectral-graph.md:169` | Direct evaluation of thermal fluctuations in proteins using a single-parameter harmonic potential | crossref `doi:10.1016/s1359-0278(97)00024-2` → doi:10.1016/s1359-0278(97)00024-2 | — |
| `content/papers/persistent-spectral-graph.md:170` | Anisotropy of fluctuation dynamics of proteins with an elastic network model | crossref `doi:10.1016/s0006-3495(01)76033-x` → doi:10.1016/s0006-3495(01)76033-x | — |
| `content/papers/persistent-spectral-graph.md:171` | Blind prediction of protein B-factor and flexibility | crossref `doi:10.1063/1.5048469` → doi:10.1063/1.5048469 | — |
| `content/papers/persistent-spectral-graph.md:172` | Persistent topological Laplacians - a survey | crossref `doi:10.3390/math13020208` → doi:10.3390/math13020208 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:2` | Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review | openalex `arxiv:2507.19504` → arxiv:2507.19504 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:27` | Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review | crossref `doi:10.1007/s10462-025-11462-w` → doi:10.1007/s10462-025-11462-w; openalex `arxiv:2507.19504` → arxiv:2507.19504 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:212` | Topological Data Analysis and Topological Deep Learning Beyond Persistent Homology - A Review | crossref `doi:10.1007/s10462-025-11462-w` → doi:10.1007/s10462-025-11462-w; openalex `arxiv:2507.19504` → arxiv:2507.19504 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:213` | Persistent Laplacians: Properties, Algorithms and Implications | crossref `doi:10.1137/21m1435471` → doi:10.1137/21m1435471 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:214` | Evolutionary de Rham-Hodge Method | crossref `doi:10.3934/dcdsb.2020257` → doi:10.3934/dcdsb.2020257 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:215` | Persistent de Rham-Hodge Laplacians in Eulerian Representation for Manifold Topological Learning | crossref `doi:10.3934/math.20241333` → doi:10.3934/math.20241333; openalex `arxiv:2408.00220` → arxiv:2408.00220 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:216` | Persistent Mayer Homology and Persistent Mayer Laplacian | crossref `doi:10.3934/fods.2024032` → doi:10.3934/fods.2024032; openalex `arxiv:2312.01268` → arxiv:2312.01268 | warning: openalex (arxiv:2312.01268): year differs: described 2024, observed 2023 |
| `content/papers/tda-tdl-beyond-persistent-homology.md:217` | Persistent Interaction Topology in Data Analysis | openalex `arxiv:2404.11799` → arxiv:2404.11799 | — |
| `content/papers/tda-tdl-beyond-persistent-homology.md:218` | Knot Data Analysis Using Multiscale Gauss Link Integral | crossref `doi:10.1073/pnas.2408431121` → doi:10.1073/pnas.2408431121; openalex `arxiv:2311.12834` → arxiv:2311.12834 | warning: openalex (arxiv:2311.12834): year differs: described 2024, observed 2023 |
| `content/papers/tda-tdl-beyond-persistent-homology.md:219` | Manifold Topological Deep Learning for Biomedical Data | openalex `arxiv:2503.00175` → arxiv:2503.00175 | — |
| `content/papers/tda-tdl-molecular-sciences.md:2` | A review of topological data analysis and topological deep learning in molecular sciences | openalex `arxiv:2509.16877` → arxiv:2509.16877 | — |
| `content/papers/tda-tdl-molecular-sciences.md:29` | A review of topological data analysis and topological deep learning in molecular sciences | crossref `doi:10.1021/acs.jcim.5c02266` → doi:10.1021/acs.jcim.5c02266; openalex `arxiv:2509.16877` → arxiv:2509.16877 | — |
| `content/papers/tda-tdl-molecular-sciences.md:225` | A review of topological data analysis and topological deep learning in molecular sciences | crossref `doi:10.1021/acs.jcim.5c02266` → doi:10.1021/acs.jcim.5c02266; openalex `arxiv:2509.16877` → arxiv:2509.16877 | — |
| `content/papers/tda-tdl-molecular-sciences.md:226` | Persistent homology analysis of protein structure, flexibility, and folding | crossref `doi:10.1002/cnm.2655` → doi:10.1002/cnm.2655 | — |
| `content/papers/tda-tdl-molecular-sciences.md:227` | Analysis and prediction of protein folding energy changes upon mutation by element specific persistent homology | crossref `doi:10.1093/bioinformatics/btx460` → doi:10.1093/bioinformatics/btx460 | — |
| `content/papers/tda-tdl-molecular-sciences.md:228` | TopologyNet: Topology based deep convolutional and multi-task neural networks for biomolecular property predictions | crossref `doi:10.1371/journal.pcbi.1005690` → doi:10.1371/journal.pcbi.1005690 | — |
| `content/papers/tda-tdl-molecular-sciences.md:229` | Representability of algebraic topology for biomolecules in machine learning based scoring and virtual screening | crossref `doi:10.1371/journal.pcbi.1005929` → doi:10.1371/journal.pcbi.1005929 | — |
| `content/papers/tda-tdl-molecular-sciences.md:230` | Integration of element specific persistent homology and machine learning for protein-ligand binding affinity prediction | crossref `doi:10.1002/cnm.2914` → doi:10.1002/cnm.2914 | — |
| `content/papers/tda-tdl-molecular-sciences.md:231` | A topology-based network tree for the prediction of protein-protein binding affinity changes following mutation | crossref `doi:10.1038/s42256-020-0149-6` → doi:10.1038/s42256-020-0149-6 | — |
| `content/papers/tda-tdl-molecular-sciences.md:232` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376 | — |
| `content/papers/tda-tdl-molecular-sciences.md:233` | Persistent Laplacians: Properties, Algorithms and Implications | crossref `doi:10.1137/21m1435471` → doi:10.1137/21m1435471 | — |
| `content/papers/tda-tdl-molecular-sciences.md:234` | Persistent spectral theory-guided protein engineering | crossref `doi:10.1038/s43588-022-00394-y` → doi:10.1038/s43588-022-00394-y | — |
| `content/papers/tda-tdl-molecular-sciences.md:235` | Omicron BA.2 (B.1.1.529.2): High Potential for Becoming the Next Dominant Variant | crossref `doi:10.1021/acs.jpclett.2c00469` → doi:10.1021/acs.jpclett.2c00469 | — |
| `content/papers/tda-tdl-molecular-sciences.md:236` | Persistent Laplacian projected Omicron BA.4 and BA.5 to become new dominating variants | crossref `doi:10.1016/j.compbiomed.2022.106262` → doi:10.1016/j.compbiomed.2022.106262 | — |
| `content/papers/tda-tdl-molecular-sciences.md:237` | Topological data analysis and topological deep learning beyond persistent homology - a review | openalex `arxiv:2507.19504` → arxiv:2507.19504 | — |
| `content/papers/tdl-docking-benchmark-review.md:2` | Topological deep learning for drug–target interaction, virtual screening, and docking scoring: a practical, benchmark-driven review | crossref `doi:10.1093/bib/bbag370` → doi:10.1093/bib/bbag370; europe-pmc `pmid:42437450` → pmid:42437450 | — |
| `content/papers/tdl-docking-benchmark-review.md:41` | doi:10.1093/bib/bbag370 | crossref `doi:10.1093/bib/bbag370` → doi:10.1093/bib/bbag370 | — |
| `content/papers/weighted-hodge-laplacians.md:2` | Weighted Hodge Laplacians on Manifolds with Boundary | openalex `arxiv:2608.00244` → arxiv:2608.00244 | — |
| `content/papers/weighted-hodge-laplacians.md:27` | Weighted Hodge Laplacians on Manifolds with Boundary | openalex `arxiv:2608.00244` → arxiv:2608.00244 | — |
| `content/papers/weighted-hodge-laplacians.md:142` | Weighted Hodge Laplacians on Manifolds with Boundary | openalex `arxiv:2608.00244` → arxiv:2608.00244 | — |
| `content/papers/weighted-hodge-laplacians.md:143` | Persistent de Rham-Hodge Laplacians in Eulerian representation for manifold topological learning | crossref `doi:10.3934/math.20241333` → doi:10.3934/math.20241333 | — |
| `content/papers/weighted-hodge-laplacians.md:144` | Combinatorial and Hodge Laplacians: Similarities and Differences | crossref `doi:10.1137/22m1482299` → doi:10.1137/22m1482299 | — |
| `content/papers/weighted-hodge-laplacians.md:145` | The heat kernel weighted Hodge Laplacian on noncompact manifolds | crossref `doi:10.1090/s0002-9947-99-02021-8` → doi:10.1090/s0002-9947-99-02021-8 | — |
| `content/papers/weighted-hodge-laplacians.md:146` | Multiscale differential geometry learning for protein flexibility analysis | crossref `doi:10.1002/jcc.70073` → doi:10.1002/jcc.70073 | — |
| `content/papers/weighted-hodge-laplacians.md:147` | Persistent sheaf Laplacian analysis of protein flexibility | crossref `doi:10.1021/acs.jpcb.5c01287` → doi:10.1021/acs.jpcb.5c01287 | — |
| `content/papers/weighted-hodge-laplacians.md:148` | Correction to 'Persistent Sheaf Laplacian Analysis of Protein Flexibility' | crossref `doi:10.1021/acs.jpcb.5c03679` → doi:10.1021/acs.jpcb.5c03679 | — |
| `content/papers/weighted-hodge-laplacians.md:149` | Commutative algebra learning for protein flexibility analysis | openalex `arxiv:2607.00879` → arxiv:2607.00879 | — |
| `content/papers/weighted-hodge-laplacians.md:150` | Fast and anisotropic flexibility-rigidity index for protein flexibility and fluctuation analysis | crossref `doi:10.1063/1.4882258` → doi:10.1063/1.4882258 | — |
| `content/papers/weighted-hodge-laplacians.md:151` | Persistent spectral graph | crossref `doi:10.1002/cnm.3376` → doi:10.1002/cnm.3376 | — |

## resolved-mismatched

None.

## unresolved

None.

## unavailable

None.

## Findings per artifact

| Artifact | Citations | Not resolved |
|---|---:|---:|
| `content/packages/hiponet.md` | 8 | 0 |
| `content/packages/petls-pytorch.md` | 2 | 0 |
| `content/packages/petls.md` | 6 | 0 |
| `content/packages/topodockq.md` | 8 | 0 |
| `content/packages/topometry.md` | 7 | 0 |
| `content/packages/topoqa.md` | 8 | 0 |
| `content/papers/mapper-brca-survival.md` | 3 | 0 |
| `content/papers/persistent-spectral-graph.md` | 10 | 0 |
| `content/papers/tda-tdl-beyond-persistent-homology.md` | 10 | 0 |
| `content/papers/tda-tdl-molecular-sciences.md` | 15 | 0 |
| `content/papers/tdl-docking-benchmark-review.md` | 2 | 0 |
| `content/papers/weighted-hodge-laplacians.md` | 12 | 0 |

## Adjudicated extractor false positives

None.

## Extractor diagnostics

- Generic/non-scholarly URLs excluded: 42
- Potential free-form `Author Year` patterns measured (diagnostic only): 5
