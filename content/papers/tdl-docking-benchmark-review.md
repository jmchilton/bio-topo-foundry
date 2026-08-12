---
type: paper
title: TDL for Docking, Screening, and Drug-Target Interaction
summary: Suay-García and Falcó's evaluation playbook for topological drug discovery, prescriptive where this corpus's other surveys are descriptive.
citation: 'Beatriz Suay-García and Antonio Falcó, "Topological deep learning for drug–target interaction, virtual screening, and docking scoring: a practical, benchmark-driven review," Briefings in Bioinformatics 27(4), bbag370 (2026).'
source_url: https://academic.oup.com/bib/article/27/4/bbag370/8732820
source_ids:
  status: declared
  doi: 10.1093/bib/bbag370
  pmid: "42437450"
access_date: "2026-08-12"
source_read: full-text
source_license:
  status: declared
  id: CC-BY-4.0
license_statement: "The article's own permissions block: © The Author(s) 2026, published by Oxford University Press, distributed under the terms of the Creative Commons Attribution License, which permits unrestricted reuse, distribution, and reproduction in any medium, provided the original work is properly cited."
derived: own-words-summary
tags:
  - method/persistent-homology
  - method/topological-deep-learning
  - application/molecular-sciences
  - application/structure-qa
  - modality/molecular-structure
---

# TDL for Docking, Screening, and Drug-Target Interaction

## A review of Suay-García and Falcó (2026)

**Primary source:** Beatriz Suay-García and Antonio Falcó (Universidad CEU Cardenal Herrera),
"Topological deep learning for drug–target interaction, virtual screening, and docking scoring: a
practical, benchmark-driven review," *Briefings in Bioinformatics* 27(4), bbag370, published 1 July
2026. [Journal article](https://doi.org/10.1093/bib/bbag370)

The publisher's article page is behind a bot challenge that refuses non-interactive clients, so this
review was read from the article's PubMed Central deposit. That deposit is not cited above: Europe
PMC has the PMID but has not yet ingested the PMC record, and the citation audit resolves PMCIDs
only against Europe PMC, so the identifier would enter the corpus unchecked. The DOI and PMID both
resolve and identify the same work.

**Access and reuse:** the version of record is gold open access under CC BY 4.0 — plain CC BY, with
no non-commercial, no-derivatives, or share-alike term. That resolves `verbatim-ok` in the shared
policy table, which makes this the first source in the corpus for which
`verbatim-quotes-summary` was actually available. This note declines it. Carrying upstream prose
obliges an attribution notice and a vendored licence copy under a top-level `LICENSES/` directory
that does not exist here, and opening a new top-level owner is a deliberate layout decision rather
than a side effect of ingesting a paper. Nothing in this review needs to travel verbatim more than
it needs to be assessed. Short phrases quoted below for criticism ride on the quotation right
rather than on the licence; parameter values, dataset names, metric names, and counts are facts and
are reproduced as such.

## What it is, and what makes it different

This is a narrative review with a checklist attached, and the checklist is the contribution. It
covers three tasks — drug–target interaction (DTI) prediction, virtual screening (VS), and docking
scoring — and organizes the applied literature into four families: persistent homology as features,
hybrid geometric deep learning with topological signals, end-to-end differentiable topology, and
multimodal fusion. That taxonomy is competent and unsurprising.

What is not unsurprising is the second half. Sections on benchmarks, splits, metrics, baselines,
and ablations set out per-task minimum standards, and they close with a reporting checklist. The
review states in its own framing that topology should be considered compelling only when it is
validated under deployment-relevant splits, against strong baselines, with uncertainty reporting
and transparent compute budgets.

That is [[guiding-principles]]'s *Be Honest About What Topology Buys*, arrived at independently by
authors with no connection to this Foundry. It is worth reading the two side by side, because they
do not agree in every direction and the disagreements run both ways.

## Where the review is stricter than this Foundry

Four places, and each is a live gap rather than a wording difference.

**Capacity-matched baselines.** Our principle asks for a matched non-topological baseline. The
review asks for a *capacity-matched* one — a baseline of comparable model size, not merely a
baseline of a different kind. A topological model beating a smaller conventional model has
demonstrated capacity, not topology, and our phrasing does not currently exclude that.

**Uncertainty on the difference, not on the endpoints.** The review asks for the topology-on versus
topology-off delta with paired bootstrap confidence intervals, at least 1000 resamples, and mean ±
standard deviation over at least three seeds. Reporting a metric with a confidence interval on each
arm is weaker, and it is what our replications currently do.

**A leakage path specific to topology.** This is the review's most useful technical observation and
the one a general ML checklist would not produce. Pocket geometry can act as a target identifier:
distinct sequences can share near-identical binding sites, so a pocket-topology model split by
sequence identity can still see the same pocket on both sides and score its own memory. The
filtration is a second channel for the same failure — a filtration built on interaction fields can
encode target identity or docking-protocol artifacts rather than transferable binding signal. Our
version of the rule says *identical split* and stops there; identical is not sufficient when the
feature is the thing the split was supposed to separate.

**Ablation beyond on/off.** The review treats filtration variants and vectorization variants as
minimum requirements alongside topology on/off, on the grounds that a gain that only survives one
filtration is a gain attributable to a hyperparameter. [[topological-deep-learning]] already says
an ablation removing the topological block is the cheapest honest answer; the review's point is
that it is not a sufficient one.

## Where this Foundry is stricter

One difference, and it is structural rather than a matter of degree: **everything the review
prescribes is advice, and nothing in it is a gate.** Its standards are recommendations, its
checklist is a checklist, and its reproducibility rule carries an explicit opt-out — share code and
configuration when possible, or state the limitations clearly.

[[guiding-principles]] distrusts exactly this form under *Deterministic Tools Do Deterministic
Work*: a prose caveat is advisory, and an author can restate one accurately and violate it in the
same breath. Here that is not a hypothetical. The review's own methods matrix has a Code column,
and across its eighteen representative methods, sixteen carry an em dash meaning no public
repository was identified. Two link to GitHub. The review tabulates that its field is roughly
nine-tenths unreproducible and then recommends, in a later section, that code be shared when
possible. It never connects the two.

The corresponding difference in this corpus is that a replication is not complete until a named
environment has produced the evidence, and that rule is enforced by a schema rather than trusted to
an author. The review has no equivalent, and could not have one.

## The defect at its centre

A benchmark-driven review is judged on whether it drives benchmarks, and this one does not close
the loop.

Its opening guidance tells the reader that Table 1 summarizes representative methods by
construction, integration strategy, **and validation setup**. Table 1 has seven columns — task,
method, family, topological object, filtration and signals, vectorization and learner, code — and
none of them is validation setup. No split, no benchmark, no metric, no baseline appears against
any of the eighteen methods.

So the review specifies a minimum evaluation standard in one section and, in another, tabulates
eighteen methods without recording whether a single one of them meets it. The obvious and most
valuable version of this paper — the standard applied retrospectively, each method graded, the
field's compliance rate reported as a number — is the version that was not written. What is left
tells a practitioner how to evaluate their own next model and gives them nothing with which to
re-read the results already in the literature. For a review whose stated purpose is reducing
overoptimistic claims driven by leakage or incomparable setups, that is the wrong half to leave
out.

The illustrative worked example has the same shape at smaller scale. It specifies a complete
docking-scoring protocol — PDBbind refined set filtered at 2.5 Å resolution, pockets as heavy atoms
within 6 Å of the co-crystallized ligand, element-specific alpha-complex persistent homology in
H0–H2 over C, N, O and S with 4–12 Å interaction cutoffs, 50×50 persistence images with
cross-validated bandwidth, gradient boosting to pKd, CASF-2016 core set under a 30% sequence-identity
target-cluster split, Pearson r with RMSE and Spearman ρ, bootstrap intervals over at least three
seeds, a topology-off ECFP baseline and a classical docking-score baseline, and ablations over both
filtration and vectorization. Every parameter a reader needs is present. No result is. It is a
protocol, offered as an illustration, that nobody ran.

## The argument worth keeping

Set the benchmarking apart and there is one genuinely sharp section, on when topological deep
learning adds anything over 3D-equivariant models such as SchNet, PaiNN, DimeNet, NequIP and MACE.

The claim is mechanical rather than empirical, which is what makes it useful. Equivariant message
passing encodes local geometry — distances, angles, torsions — with a fixed interaction cutoff.
A binding-pocket channel that only becomes apparent at a scale larger than that cutoff is therefore
invisible to the network, however deep, because recovering it would require aggregating across the
whole structure at once. Persistent homology aggregates across scales by construction. The two are
also robust to different things: equivariance is robustness to rigid motion, and persistence
stability is robustness to coordinate noise.

The complement is stated with its cost attached. Topology discards orientation and metric
precision, so two structures with the same diagram can differ in bond lengths, angles, and
chirality; it is insensitive to hydrogen-bond geometry and dihedral preference; and in the
features-based setting the filtration is a manual design step that an equivariant model does not
have. That is a cleaner statement of the tradeoff than either survey already in this corpus
manages, and it is the part of the paper most worth citing.

The practical conclusions follow from it and are stated plainly: prefer pocket topology to
complex-level topology unless pose uncertainty is explicitly handled; keep homology dimensions low;
and treat a gain that vanishes under modest perturbation as fragile. There is also a short section
naming conditions under which topology should not be used at all — unreliable 3D, unavailable
leakage controls, compute as the binding constraint — which is rarer in a survey of a method family
than it should be.

## What it means for the docking work here

The issue that proposed this note placed the review on [[score-docking-poses]]'s exact territory.
It is adjacent rather than identical, and the boundary is worth stating.

The review separates pose selection — choosing a near-native pose among candidates — from
scoring and ranking, and explicitly deprioritizes the first, treating pose noise as a confounder to
be controlled rather than as the task. [[topoqa]], [[topodockq]], and the Mold that wraps the open
reproduction are interface quality assessment: they rank candidate structures for one target, which
is the task the review sets aside. Its docking-scoring guidance is about predicting affinity.

Its evaluation standards still transfer, and two of them bite directly. Target-cluster splits with
documented leakage controls are the default it prescribes for anything trained on PDBbind-derived
structures. And the pocket-as-identifier warning applies with full force to interface featurizers,
which are computed on precisely the geometry that can leak. Neither is a new idea to this corpus —
[[topological-deep-learning]] already tells a reader to check the split and to ask whether
correlations are pooled or per-target — but the review supplies an argument for why the topological
case is worse than the general case, which that note does not currently give.

## What a reader here should take from it

As a taxonomy it is a competent third entry beside [[tda-tdl-molecular-sciences]] and
[[tda-tdl-beyond-persistent-homology]], narrower than either and superseding neither. As an
evaluation standard it is ahead of us in four specific places, and those are worth adopting rather
than admiring.

The gap between what it prescribes and what it demonstrates is the lesson, and it is the same
lesson this corpus reached from the other direction. A standard that is written down is not a
standard that is met. The review says the right things about baselines, splits, and ablation, and
then presents eighteen methods it never checked against any of them — while recording, in a column
of its own table, that sixteen of them ship no code with which anyone else could.

## Related

[[topological-deep-learning]] is the method this reviews, and the review's equivariant-versus-PH
argument belongs beside that note's account of topology-as-features. [[guiding-principles]] holds
the baseline rule the review independently reaches. [[tda-tdl-molecular-sciences]] and
[[tda-tdl-beyond-persistent-homology]] are the broader surveys it narrows. [[score-docking-poses]],
[[topoqa]], and [[topodockq]] are the docking work its standards apply to, across the
scoring-versus-pose-selection boundary described above.
