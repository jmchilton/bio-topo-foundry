# TDA environment fixtures

One pixi environment per topological-data-analysis tool, chosen so the set spans biopixi's L0–L4
ladder with real packages. Each `pixi.toml` is a standalone manifest — `pixi install` works with
biopixi nowhere in sight.

Each fixture is a directory-shaped `environment` note: `index.md` is the note, and `pixi.toml` and
`pixi.lock` are its declared companions. The note says what the fixture makes runnable, why it
grades where it does, and what to know before trusting it. The manifest beside it stays the
authority on versions and channels, so no note restates a pin.

**This file deliberately holds no inventory table.** It used to carry one row per fixture plus a
long notes section, which is exactly the hand-maintained second copy that drifts: the counts in the
planning documents had already disagreed with the tree by the time the notes were written. The
per-fixture detail now lives in each note, and the generated inventory is the site's
`/environments/` index, grouped by grade and built from the corpus itself.

## Reading a grade

The grade is the *anticipated* `biopixi grade` result, not a declared one — the grader derives it
from the manifest, lockfile, and public channel metadata. Metadata was verified against
anaconda.org, PyPI, and CRAN on 2026-07-29; re-verify before trusting a grade.

A grade scores **packaging**, not science. It says nothing about whether the method inside a fixture
is correct or useful.

**L4 is the one grade a file cannot establish.** L1–L3 are decidable from the lockfile, because the
channel on every resolved artifact is recorded there. L4 also asserts that a container for the
fixture's root target set can be pulled, which no file here records, so profile v0 forbids assigning
it offline. An offline grade stops at L3 and carries a *publication candidate*: the image's name and
the state of the evidence for it — `UNREGISTERED`, `INFERRED`, `REGISTERED`, or `CONFIRMED`. Only
the last is an observation, and only an observation reaches L4, so an L4 note records the image, its
digest, and when the registry was asked. The kind rejects one that does not.

Two patterns recur and are worth reading as a group rather than one fixture at a time:

- **L1 means the recipe is still in this repository.** Most L1 fixtures stage an in-repo recipe
  under `recipes/`; several are redistributable and would reach L3 or L4 on publication. `petls` is
  the exception that will not move, because it declares no license at all. Each of those builds is
  a `recipe` note of its own, and the site's `/recipes/` index groups them by how far they have
  travelled toward a public channel — which is the same list as what holds these fixtures at L1.
- **L0 means out of profile, and the reason differs.** `giotto-tda` is wheel-only on PyPI.
  `hiponet` and `topodockq` run from pinned git clones because neither has anything installable to
  build — for technical reasons in both cases, and additionally a licensing ceiling for `hiponet`.
