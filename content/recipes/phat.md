---
type: recipe
title: phat
summary: PHAT's C++ persistence matrix-reduction backend behind pybind11 bindings, built here because the channels carry no package for it.
gap: absent
build:
  status: verified
  platforms:
    - linux-64
upstreaming: eligible
tags:
  - method/persistent-homology
---

# phat

PHAT is the persistent-homology matrix-reduction engine — the algorithmic core several higher-level
tools sit on top of, exposed to Python through pybind11. It is on no conda channel, so
[[phat-environment]] stages this build and grades L1 for it.

LGPL-3.0 is redistributable, so nothing but the pull request stands between this and a channel.
That makes it one of the cheaper entries on the upstreaming backlog: the build is a straightforward
pybind11 compile with no vendored submodules and no network requirement, unlike
[[giotto-ph-recipe]] and [[pyflagser-recipe]].

Verified green under `rattler-build` on linux-64.
