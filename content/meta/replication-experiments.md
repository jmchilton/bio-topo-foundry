---
type: meta
title: Replication Experiments
summary: Why a replication recreates a paper's reported numbers rather than merely running its code, and which half of that work lives outside this Foundry.
record_kind: foundation
order: 1
status: draft
created: 2026-08-08
revised: 2026-08-08
revision: 1
tags:
  - meta
---

# Replication Experiments

A replication experiment should try to recreate a paper's reported results, not merely run its
software. Start from named claims, tables, metrics, and figures, then determine how each number or
graph was generated from inputs, code, parameters, seeds, splits, and checkpoints. Report faithful
matches, partial matches, failures, and evidence gaps with equal care.

## Working practice

- Define the claims and paper artifacts being replicated before running the experiment.
- Preserve released inputs and outputs when redistribution permits; otherwise record acquisition
  instructions, identifiers, and checksums.
- Pin code, dependencies, data versions, parameters, seeds, and split membership. Distinguish the
  paper's stated protocol, the released implementation, and our reconstruction.
- Regenerate tables and figures from recorded machine-readable results. Do not transcribe headline
  values or keep only successful runs.
- Compare reproduced and reported values explicitly, including tolerances and unexplained gaps.
- Give every replication a corresponding Foundry **biopixi Environment** that can execute the
  pinned experiment repository. A replication is not complete until it has been rerun through that
  environment and the resulting evidence is recorded.
- Keep licensing and redistribution status separate for code, environments, data, and weights.

## Where the work lives

The full protocol, narrative, code, generated figures, and evidence belong in an upstream,
standalone replication repository. The short `replication_experiment` note in this Foundry links
to a pinned repository revision, identifies the paper and package under test, records the
corresponding biopixi Environment, summarizes arm-level outcomes and deviations, and points to the
evidence manifest. It should not duplicate the upstream writeup.

## Where the notes are

The studies themselves are typed notes under `content/replication-experiments/`. This page stays
policy; the inventory that used to sit here is gone, because the notes now carry it and a
hand-maintained list beside them would only drift. [[content-model]] owns the frontmatter contract
those notes satisfy.

No study currently has a biopixi-backed rerun recorded in this Foundry, so none can be marked
complete. That is enforced rather than remembered: `status: complete` requires an `environment`.
