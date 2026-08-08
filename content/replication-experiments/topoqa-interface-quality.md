---
type: replication_experiment
title: TopoQA interface-quality replication
summary: The released TopoQA checkpoint does reproduce the paper's ranking losses — and part of the margin depends on a coordinate defect.
artifact:
  repository: https://github.com/jmchilton/topoqa-interface-quality-replication
  revision: f11ae40baf4592a7bcc64ba838e07501787cfa19
  protocol: docs/protocol.md
  evidence_manifest: results/reference/manifest.json
arc:
  - replicate
  - harden
status: running
replication_outcome: reproduced
redistribution: mixed
tags:
  - method/persistent-homology
  - method/topological-deep-learning
  - application/structure-qa
  - modality/molecular-structure
---

# TopoQA interface-quality replication

## What was tested

[[topoqa]] ranks predicted protein-complex structures by interface quality, combining
[[persistent-homology]] features with graph attention. The claim under test is its headline
benchmark result: mean ranking loss on DBM55-AF2 and HAF2, plus the reported correlations.

The released checkpoint was run on the same benchmarks the paper reports, obtained from the DProQ
distribution. Because the upstream repository declares no license, no TopoQA code, checkpoint, or
benchmark structure is vendored into the replication repository — it orchestrates against a
checkout the user supplies.

## What came out

**The released artifacts reproduce the paper.** DBM55-AF2 mean ranking loss is 0.069400 against a
reported 0.069; the paper-filtered HAF2-12 loss is 0.110333 against 0.110. The correlations
reproduce too — but only as *pooled* statistics (Spearman/Pearson 0.5016/0.5147 on DBM55-AF2,
0.6747/0.6003 on HAF2-12). Mean per-target correlations are substantially lower. This is worth
carrying forward whenever TopoQA is compared against a method reporting per-target numbers, because
the two are not the same measurement and the paper does not label which it used.

**Part of the reported margin depends on a coordinate defect.** The released code builds all-atom
edge-histogram coordinates as `(x, y, y)` rather than `(x, y, z)`. Substituting `z` at inference
time — retaining the released checkpoint — moves ranking loss to 0.076733 on DBM55-AF2 and 0.147083
on HAF2-12.

That second result needs its limits stated plainly. It is a sensitivity arm, not a corrected
benchmark: changing coordinates at inference while keeping a checkpoint trained on the defective
path measures how much the checkpoint depends on that path. It does not estimate what a correctly
trained model would score. Retraining was not available within this study.

## Where this fits

The clean-room reimplementation is a separate line of work — [[open-topoqa-featurizer]] and
[[open-topoqa-scorer]], both MIT — and it reaches parity with a corrected upstream on HAF2-12. The
comparison between the two is recorded in the [[topoqa]] note. To keep provenance clean, the
*upstream* artifacts here were executed only by an independent third party on separate
infrastructure, which returned per-decoy predictions and provenance facts rather than code. Every
metric was then recomputed under one definition, so no difference in this note can be attributed to
differing metric code.

## Redistribution

Mixed, and the split matters. The replication code and its documentation are MIT. Upstream TopoQA
declares no license and the Zenodo benchmark record identifies none, so neither is redistributed.
The compact result tables derived from those inputs are marked `NOASSERTION` rather than MIT — a
permissive license on the analysis code does not relicense outputs computed from
unlicensed inputs.

## What would make this complete

A biopixi fixture that re-runs the pinned repository inside this Foundry. Until that exists the
evidence is real but lives only upstream, and this note pins it rather than reproduces it. The
obstacle is not licensing here but the historical PyTorch stack the original model requires, which
is deliberately outside the locked MIT verifier environment.

## Related

[[topoqa]] carries the full review of the paper and software. [[topological-deep-learning]] places
the topology-plus-attention pattern in context; [[persistent-homology]] covers the featurization.
[[hiponet-melanoma]] is the other study here whose headline number came out differently from the
paper's.
