# Initial mold plans

> Draft molds (authored actions, `type: mold`) to cast into skills. Follows the
> Foundry setup Phase 4 ("author one action"). Each entry: name · description ·
> action · likely references (with load policy). Provisional.

---

## Scope — own the TDA node, adopt its context

A pipeline is the user-facing unit; a bare featurizer/scorer is not a deliverable.
So we place each TDA application in a **runnable, user-facing pipeline** — but we
only author deeply the part that is ours.

- **Own the TDA node.** The stage that is genuinely topological is the mold we
  author and cast. That is where the depth goes.
- **Adopt its context.** Every other stage (generate, prep, rank, report) is
  adopted state-of-the-art: a survey-grade note (`paper`/`method`, not
  `manuscript`) + tools/packages that already exist, wired as the **simplest path
  that makes the TDA node runnable in real context.**
- **We resist turning non-TDA stages into research projects** — but resist, not
  forbid: sometimes enabling an application means enabling the application, and
  the enabling work is legitimately the work. Escalate past adopt-and-summarize
  only when that is what genuinely unlocks the TDA piece.
- **Guardrail — simplest ≠ stubbed.** Adopted stages must actually run
  end-to-end for a bench scientist / bioinformatician. The line is *authorship
  depth, not existence*; a fake stage fails the same "not user-facing" test.
  "Real" means backed by something that already runs — existing Galaxy tools or
  conda packages — not a placeholder.
- **In-scope test.** A non-TDA stage is in scope only if it is needed to make the
  TDA node run in a real, user-facing pipeline.

The pipeline is real and multi-stage; the molds *we author* are just the TDA
one(s), with the surrounding stages as references.

---

## `score-docking-poses`

**Description.** Rank a set of candidate protein-complex structures (docking
poses / decoys) for one target by predicted DockQ-like interface quality.

**Action.** Given a directory of complex models (PDB/mmCIF) for a single target,
featurize each interface with element-specific persistent homology, score every
model with the retrained ProteinGAT, and return the models ranked by predicted
DockQ — plus the top-k selection.

**References.**

| Ref | Kind | Load | Status |
|---|---|---|---|
| `score-docking-poses-environment` | `environment` | direct (up-front) | **to build** — composite biopixi env bundling featurizer + scorer for a runnable skill |
| `decoy-ranking-workflow` | research write-up (`method`/`manuscript` — TBD) | direct (up-front) | **to write** — our profile of the decoy-ranking / interface-QA workflow; supplies the domain framing the skill assumes |
| `open-topoqa-featurizer` | `package` | as-needed | exists (L1) |
| `open-topoqa-scorer` | `package` | as-needed | exists (L1) |
| glossary: docking pose · decoy · DockQ · interface QA | glossary | verbatim | terms to pin |
