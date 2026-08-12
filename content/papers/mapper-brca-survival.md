---
type: paper
title: Mapper Survival Analysis on TCGA-BRCA
summary: Mapper risk tiers on breast-cancer expression that survive a held-out split, beside a discordant-survivor result defined by the outcome it predicts.
citation: Emmanuel Kibisi, Olakunle Abawonse, and Donald Woukeng, "Topology-Informed Survival Analysis of Breast Cancer Patients Using the Mapper Algorithm," arXiv:2607.15022v1 (2026).
source_url: https://arxiv.org/abs/2607.15022
source_ids:
  status: declared
  doi: 10.48550/arXiv.2607.15022
  arxiv: "2607.15022"
version: v1
access_date: "2026-08-11"
source_read: full-text
source_license:
  status: declared
  id: CC-BY-SA-4.0
license_statement: The arXiv record and the article's own header both declare CC BY-SA 4.0.
derived: own-words-summary
tags:
  - method/mapper
  - application/clinical-outcome
  - modality/high-dim-tabular
---

# Mapper Survival Analysis on TCGA-BRCA

## A review of Kibisi, Abawonse and Woukeng (2026)

**Primary source:** Emmanuel Kibisi, Olakunle Abawonse, and Donald Woukeng (African Institute for
Mathematical Sciences, Rwanda), "Topology-Informed Survival Analysis of Breast Cancer Patients Using
the Mapper Algorithm," submitted to arXiv 16 July 2026, 25 pages, 14 figures.
[arXiv:2607.15022](https://arxiv.org/abs/2607.15022) |
[arXiv DOI](https://doi.org/10.48550/arXiv.2607.15022)

**Access and reuse:** the article declares CC BY-SA 4.0, the first share-alike source this corpus has
reviewed and a licence the shared policy table carried no row for until this note needed one. The
row landed upstream in `@galaxy-foundry/license-policy@0.7.0` as verbatim-ok with the copyleft
obligation, on the grounds that isolation answers share-alike the same way it answers the GPL. So
verbatim carry is permitted here. This note is an own-words summary anyway — a note may always
summarize in its own words, and nothing in this paper is worth carrying under an isolation
obligation. Numbers, parameter values, and gene symbols below are facts and are reproduced as such;
no upstream prose is.

**Why this note exists.** [[mapper]] is the one method in this corpus with implementations and no
application evidence — it links [[kmapper-environment]], [[giotto-tda-environment]], and
[[scikit-tda-environment]], and no paper showing the technique doing biological work. This is that
paper. It is also, usefully, a paper that exercises every caution [[mapper]] states.

## What the paper does

It builds on Rostami, Fooshee, Carlsson and Subramaniam (*IEEE OJEMB* 6, 465–471, 2025), who applied
Mapper to TCGA-BRCA expression in two directions at once — a *sample* network whose nodes are
clusters of patients, and a *feature* network whose nodes are clusters of co-expressed genes — and
found a Luminal B subgroup in it. Rostami and colleagues stopped at structure. This paper reproduces
that dual construction and then asks the question they did not: does a patient's position in the
graph carry survival information?

Four steps follow: reproduce the two networks; run node-level survival analysis on the sample
network; identify patients whose outcomes diverge from their PAM50 subtype's expectation; and test
whether risk tiers derived from the graph transfer to patients who were not used to build it.

The construction is a two-dimensional lens — L1 (Manhattan) eccentricity paired with the first
principal component of the expression matrix — a cover of 12 intervals at 50% overlap, and DBSCAN
under Euclidean distance with ε = 55, `min_samples` = 2 for the reproduction and 5 for the
train-test graph. The cohort is described only as more than 1,000 TCGA-BRCA patients.

## The result that holds

The train-test section is the paper's real contribution and is structurally sound. The Mapper graph
is built on the 80% training split alone. A univariate Cox model is fitted per node on an in-node
indicator; node hazard ratios are rank-transformed into tertiles, giving High, Mid and Low risk
tiers; each patient takes the tier of their highest-hazard node. Held-out patients — who are not in
the graph — are placed by Pearson correlation of their expression profile against each training
node's mean profile, inheriting a tier directly above 0.65 and by a Borda count over positively
correlated nodes otherwise. Clinical variables are withheld until after tiers are assigned.

That design is the right shape: the graph never sees the validation patients, and the transfer rule
is stated precisely enough to implement. The risk ordering survives it, with a significant global
log-rank test on held-out patients and the High-versus-Low contrast driving the separation.

A second check is more persuasive than the survival result and gets less space. Mean expression of
six proliferation markers (*MKI67*, *CCNB1*, *MYBL2*, *BIRC5*, *UBE2C*, *RRM2*) is monotone across
the tiers — 0.1552, −0.1595, −0.1634 from High to Low, one-way ANOVA p = 0.000158 — even though no
proliferation measurement entered the graph's construction. A partition built from expression
geometry alone lands on an axis oncology already knows is prognostic. That is a real finding about
what Mapper recovers, and it does not depend on any survival claim.

The reporting, though, thins out exactly where the headline lives. Section 4.2.1 states that
held-out High Risk patients faced substantially elevated mortality after adjustment for age, stage,
and treatment, and reports no hazard ratio, no confidence interval, no p-value, and no group sizes.
The abstract's strongest claim rests on a paragraph containing no statistics.

## The result that does not

The discordant-survivor analysis is circular, and the circularity is definitional rather than
subtle. Discordant Basal patients are Basal-like patients who *survived longer than the median
Luminal A patient*. Discordant Luminal A patients are Luminal A patients who *died before the median
Basal-like survival time*. Group membership is a function of each patient's own observed survival.

Those groups are then plotted as Kaplan–Meier curves against their non-discordant counterparts,
where they separate, and entered into Cox models with survival as the outcome, where the discordant
flag is significant after adjusting for age and stage: HR = 0.223 (p = 0.0005) among Basal-like
patients, HR = 65.91 (p < 0.0001) among Luminal A. A hazard ratio of 65.91 is not a finding; it is
what a model returns when the predictor is a relabelling of the outcome. The separation in the
survival curves is guaranteed by construction, and the paper neither notes this nor lists it among
its limitations.

The differential expression built on those groups is a different matter and survives the objection.
Asking which genes distinguish long-surviving Basal-like patients from short-surviving ones is
ordinary outcome-stratified differential expression, and the answer reported — a cross-subtype
reversal, with discordant Basal patients expressing *AKAP12*, *TCEAL7*, *MYH11*, *KANK2*, *SMOC2*
and other differentiation-associated genes from the Luminal-A-associated segment of the feature
network — is a legitimate hypothesis. What it is not is a topological result.

## What Mapper contributes, precisely

This distinction is worth stating because the paper blurs it. Mapper does not identify the
discordant patients; PAM50 labels and survival times identify them, and Mapper is applied
afterwards to say *where* they sit — near transitional and mixed nodes at subtype boundaries rather
than in subtype cores. Localization is a genuine contribution and it is the weaker of the two
claims the text makes for it.

One further claim outruns its evidence. Four genes read off the feature network (*ERBB2*,
*HORMAD1*, plus *ESR1*/*CA12*/*XBP1*) are said to achieve a subtype separation that conventional
classifiers need the full 50-gene PAM50 panel to approximate. No classifier is trained and no
accuracy is reported; the evidence is a 3D scatter plot coloured by PAM50 label, and the genes were
selected by inspecting the feature network coloured by those same labels.

## The comparison that is missing

The paper's organizing claim is that topology carries prognostic information *beyond* PAM50. PAM50
appears as a covariate — the global training Cox model adjusts for subtype alongside age, stage,
treatment, and proliferation score, and the High Risk tier is reported to remain significant — but
never as a competing model. There is no PAM50-only survival model fitted on the same split, no
discrimination metric such as a concordance index, no likelihood-ratio comparison, and no numbers
from the global model at all. Adjustment answers "is there residual signal"; it does not answer "is
this better than what the clinic already uses", which is the question the abstract's phrasing
invites.

## Parameters, and the diagnostic that is absent

[[mapper]] states the rule this paper is the test case for: vary the parameters and show it. Lens,
interval count, overlap fraction, and clustering parameters are all fixed at single values and never
varied. The authors name parameter sensitivity as a limitation and run no sensitivity analysis, so a
reader has no way to tell which findings survive a different cover. `min_samples` also changes from
2 to 5 between the reproduction and the train-test graph without comment.

ε = 55 compounds this. It is a Euclidean radius in standardized gene space, so its meaning depends
entirely on how many genes are retained — and the gene count is never stated, nor is the filtering
criterion, nor the exact cohort size, nor the assay or normalization beyond z-scoring. There is no
data-availability statement, no code repository, and no named Mapper implementation. TCGA-BRCA is
public; this analysis of it is not reconstructible from the paper.

## What it gets right that is easy to miss

The landmark-node section reports a null and explains it. Distance to the highest-hazard node
(HR = 2.94) separates survival by tercile at p = 0.0228, and the continuous-distance hazard ratio
then moves from 0.90 (p = 0.075) to 1.01 (p = 0.90) once age and stage enter the model. Rather than
dropping the result, the authors diagnose it: mean age falls from 71.3 to 54.4 years moving away
from the landmark, and modal stage shifts from IIIA to IIA. The topological gradient was tracking
demographics. Reporting that plainly, and listing it again under limitations, is better practice
than most of what this corpus's survey notes describe.

## What a reader here should take from it

As application evidence for Mapper, this is a genuine but narrow positive: a graph built from
expression alone recovers a proliferation axis it was never shown, and a partition derived from it
retains prognostic ordering on held-out patients from the same cohort. That is worth knowing and it
is roughly the strength of claim [[mapper]] says the method can support.

Everything stronger in the paper fails for a reason [[mapper]] already names. The discordant-survivor
hazard ratios are a Mapper graph being treated as evidence for a subgroup that the outcome variable
defined. The parameter choices are unvaried, so the filter is the model and no one can see how much
the model chose. And the comparison to PAM50 — the claim in the title's spirit and the abstract's
last sentence — is an adjustment, not a benchmark. A note in this Foundry making the same claim
would need a matched non-topological baseline on an identical split with a stated metric, which is
exactly what is absent here.

## Related

[[mapper]] is the method; this note is its first application evidence, and reads as a case study in
that note's three cautions. [[persistent-homology]] is the stable counterpart whose stability
theorem is precisely what would make an unvaried-parameter analysis defensible, and which Mapper
does not have.
