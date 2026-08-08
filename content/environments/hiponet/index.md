---
type: environment
title: hiponet
summary: The HiPoNet research codebase run from a pinned git clone, with a locked dependency closure but nothing installable to package.
portability_grade: L0
tags:
  - method/simplicial-learning
  - method/topological-deep-learning
  - application/single-cell
  - modality/high-dim-tabular
---

# hiponet

This fixture reproduces HiPoNet's dependency closure — locked green on linux-64 — and runs the
tool from its pinned git clone at `@45a9d08`. See [[hiponet]] for the software profile.

It is L0 for two independent reasons, and they should not be confused. The **technical** reason
is that there is nothing to build: the repository has no `[build-system]`, its `pyproject.toml`
names the distribution `pointcloudnet`, and the code is flat scripts, so no recipe is possible
today regardless of licensing. The **licensing** reason is that HiPoNet's Yale terms are
non-commercial, which caps it at L0 or L1 no matter what upstream does to the build.

A fixture that runs a pinned clone is still worth having: the closure is reproducible and the
mathematical test suite passes inside it. It is simply not a packageable artifact, and calling
it one would be the kind of hollow green this corpus tries to avoid.
