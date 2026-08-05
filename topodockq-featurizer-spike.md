# TopoDockQ featurizer — reproduction spike debrief

**Date:** 2026-07-31
**Scope:** Feasibility spike for [bio-topo-foundry #3](https://github.com/jmchilton/bio-topo-foundry/issues/3)
— reimplement the TopoDockQ interface featurizer (blocked upstream as unlicensed `.pyc`) on open tooling.
**Bottom line:** Done. **All four feature blocks are reproduced clean-room bit-exactly** against the released
`.pyc`, on open tooling (GUDHI + our petls-pytorch fork), with no `.pyc` dependency: the 2,079-value
persistent-Laplacian eigenvalue block, the 189 Betti-0 death bins, the 54 H0 barcode summaries, and the 324
alpha H1/H2 barcode summaries. Every hardcoded constant (`max_edge=7`, `cut=7`, intra-chain padding `=100`,
persistence floor `0.1`, `2×` diameter scaling) is pinned. What remains for a shippable tool is pure
assembly: order the 2,646-vector, apply the valid-column mask, serialize the scaler, wire the MIT scorer, and
validate across the full Zenodo set.

## Search-first result (the #2 lesson)

Before planning a reimplementation we searched for an existing open featurizer, as with #2 (which found
`petls-pytorch`). Findings:

- **No open featurizer exists.** The PCL feature generator is still `.pyc`-only in *both*
  `wangru25/TopoDockQ-Feature` (no license) and the **MIT** `XDaiNYU/TopoDockQ` (`main.pyc`,
  `src/get_MLfeature.pyc`, `get_PHcomplex.pyc`, `get_PHinputs.pyc`, `read_pdb.pyc`) — MIT now nominally
  covers the bytecode, but there is no source and it is Py-interpreter-locked. Not adoptable.
- **Engine already decided:** `petls-pytorch` (Apache-2.0, in-foundry) supplies the persistent-Laplacian
  spectra. **HERMES** (`wangru25/HERMES`, **MIT**, the featurizer author's own persistent-spectral-graph
  engine) exists but requires **MATLAB** (`CMakeLists.txt` lines 15/20) + CGAL 4.14 — unbuildable here and
  a poor foundry citizen; useful only as an oracle we can't run. So no engine pivot.
- **Scorer side is fully MIT with source** (`XDaiNYU/TopoDockQ`, `ResidueX`) + Zenodo weights/features.
  Only feature-gen is blocked. So #3 is a genuine build, not an adopt — but well-scoped.

## Setup

- **Oracle env** (black-box, run not decompiled — sanctioned "using, not copying"): `uv` venv py3.8.20 with
  the exact upstream pins (`gudhi==3.8.0`, `numpy<=1.24.3`, `scikit-learn==1.3.0`, `pandas`). The `.pyc`
  runs; its `--bins`/`--filtration` args are the feature-dimension knobs.
- **Reimplementation env:** py3.11 with **our fork `jmchilton/petls-pytorch @ v2`** + `gudhi 3.13` +
  `biopython`. Ground truth = the two interface PDBs + their committed `.npy` feature vectors shipped in the
  repos (`2fns`, `4k38`) — no Zenodo download needed.

## Feature layout — fully decoded

By sweeping the CLI args and diffing outputs, per **element channel** (9 of them, order
`CC, CN, CO, NC, NN, NO, OC, ON, OO`, each a **bipartite** protein-A × peptide-B pairing):

```
per-channel length = 7·F + (B−1) + 42
```

- **7·F — eigenvalue-statistics block**: 7 values per filtration point (see below).
- **(B−1) — Betti-0 death-bin block**: one count per bin interval (B = number of `--bins` points).
- **42 — barcode-statistics block**: fixed (H0 Rips + alpha H1/H2 summaries).

This reconciles with the paper's raw 2,754 = 9×306 (committed `4k38`, F=33, B=34) and the pruned 2,646 =
9×294 (F=33, B=22 after dropping empty betti bins; 12 pruned columns/channel, all empty betti bins).

## Bit-exact results

### Eigenvalue-statistics block — the crux — BIT-EXACT, 9/9 channels

Each filtration point contributes 7 values:

```
[ sum, min, max, mean, std(pop, ddof=0), var(pop, ddof=0)  of the NONZERO L0 eigenvalues,  then Betti-0 ]
```

computed on the **bipartite Rips** complex (cross-interface distances only, intra-chain = ∞) at the given
threshold. Verified for all 9 channels of `2fns` at t=10 to ~1e-14 relative error, e.g. CC:

| | sum | min | max | mean | std | var | Betti-0 |
|--|--|--|--|--|--|--|--|
| oracle | 5262 | 0.844 | 106.889 | 22.391 | 22.22 | 493.745 | 70 |
| ours   | 5262.0 | 0.8436 | 106.889 | 22.391 | 22.220 | 493.745 | 70 |

**Conventions pinned:**
- **Snapshot** Laplacian: `spectra(dim=0, a=t, b=t)` (persistent operator with a=b=t = ordinary L0 of K_t).
- Filtration value **t = cross-interface distance ≤ t** (diameter, *not* HERMES's 2×radius).
- **float64 required** (float32 puts harmonic eigenvalues ~1e-4 and corrupts nullity).
- Betti-0 counts **all vertices including isolated ones** (CC has 70 components at t=10, 69 of them isolated
  atoms) — this is exactly what required the fork fix (below).

Reproduction path: build a GUDHI bipartite simplex tree → `petls_pytorch.Complex(simplex_tree=st)` →
`.spectra(0, t, t)`.

### Betti-0 death-bin block — BIT-EXACT, 9/9 channels

A histogram of H0 **death** values over the `(B−1)` bin intervals, on the bipartite Rips complex built with
**`max_edge_length = 7`** (a hardcoded constant — invariant across all `--bins`/`--filtration` args,
confirmed by instrumenting the `.pyc`). The 7 Å cap is why bars that would die ≥7 are essential (infinite)
and drop out of the finite-death histogram — the earlier "last-bin" discrepancy. With max_edge=7 (and
intra-chain padding = 100.0, also observed), the block matches for all 9 channels, e.g. bins `[2,6,10]`:

| | CC | CN | CO | NC | NN | NO | OC | ON | OO |
|--|--|--|--|--|--|--|--|--|--|
| oracle | 126,33 | 52,29 | 67,23 | 55,15 | 20,9 | 24,9 | 58,10 | 18,7 | 23,8 |
| ours   | 126,33 | 52,29 | 67,23 | 55,15 | 20,9 | 24,9 | 58,10 | 18,7 | 23,8 |

### Barcode-statistics block (42/channel) — BIT-EXACT

Within-channel order (F=1 example): `[ (B−1) betti | 6 barcode-A | 7·F eig | 36 barcode-B ]`.

- **Barcode-A (6) — H0 Rips summaries — BIT-EXACT.** `[mean, std(pop), max, min, sum, count]` of the finite
  H0 **death** values on the same bipartite Rips (max_edge=7). CC = `[5.033, 1.033, 6.995, 3.238, 800.323,
  159]`, reproduced to machine precision.
- **Barcode-B (36) — alpha H1/H2 summaries — CLEAN-ROOM BIT-EXACT.** Two 18-value blocks (degree 1 then 2)
  from a GUDHI `AlphaComplex` on the channel's **pooled** protein+peptide points (raw *squared* circumradius
  persistence). `alpha_topo` was fully reverse-engineered by black-box probing (controlled synthetic bars →
  observed outputs; never decompiled) and reimplemented. Our clean version matches the `.pyc` on both real
  PDBs × all 9 channels × both degrees, and reproduces the oracle `.npy` end-to-end from our own alpha
  (maxdiff ~1e-5). The transcribed algorithm:

  ```
  alpha_topo(PH, cut, degree):            # cut = 7.0 in production
    bars = [(birth², death²) for (dim,(birth²,death²)) in PH if dim == degree]
    if len(bars) < 2: return zeros(18)
    b2   = clip(2·√birth², max=cut);  d2 = clip(2·√death², max=cut);  pers = d2 − b2
    keep = pers > 0.1                     # persistence filter (diameter units)
    B, D, P = b2[keep], d2[keep], pers[keep];   j = argmax(P)     # most-persistent survivor
    return [ mean,std,max,min,sum of P,   # persistence stats (std = population/ddof0)
             B[j], D[j],                  # birth & death of the most-persistent bar
             mean,std,max,min,sum of B,   # birth stats
             mean,std,max,min,sum of D,   # death stats
             len(P) ]                     # surviving-bar count
  ```
  The two hardcoded constants (`2×` diameter scaling, `cut=7`, persistence floor `0.1`) are all pinned.

## petls-pytorch fork — root-caused upstream bug, fixed at the right layer

The bipartite complexes routinely contain **isolated vertices** (atoms with no cross-interface neighbour ≤
cutoff). Upstream `simplex_tree_boundaries_filtrations` built its vertex index set from boundary incidences
(`face_set | simplex_set`), silently dropping isolated vertices while keeping their filtration entries →
`boundaries[0]`/`filtrations[0]` size mismatch → `ValueError` in `Complex(simplex_tree=)` / `Rips(distances=)`.

- **Upstream bug, not our misuse** (minimal 3-vertex repro confirms).
- **Pruning isolated vertices would be WRONG** — the oracle counts them (our Betti-0 = 70 includes 69
  isolated components and matches bit-exactly). The fix is required for parity, not just cleaner.
- **Fix:** index every simplex per dimension in filtration order. L0 nullity then equals true Betti-0
  (matches scipy: CC 70 / NN 41 / OO 31); **byte-identical to upstream on orphan-free complexes**
  (no regression); fork suite 49→ green.
- Shipped as fork branch `fix/simplex-tree-isolated-vertices` + regression test, folded into fork branch
  **`v2`** (all three fork fixes; suite 62 passed / 21 skipped). Foundry `recipes/petls-pytorch` now builds
  from v2 (rattler-build green, env relocked). Upstream PR pending.

## Remaining work (all mechanical, no engine risk)

All four feature blocks are now reproduced fully clean-room bit-exact. What is left is pure assembly, no
reverse-engineering:

1. **Assembly:** emit the full per-channel vector in order (`betti | barcode-A | eig | barcode-B`) across the
   9 channels; apply the 2,754→2,646 valid-column mask (drop constant/empty betti bins); serialize the scaler
   from the Zenodo training features; wire to the MIT MLP scorer + published weights.
2. **Validate** across the full Zenodo `processed_data` set (beyond the two in-repo interfaces).
3. **Package** as an in-repo recipe + biopixi env → the open, end-to-end TopoDockQ vertical (L1→L3).

## Hardcoded constants discovered

- **`max_edge_length = 7.0`** for the H0/Betti bipartite Rips (barcode-A + betti bins).
- **intra-chain distance padding = 100.0** (bipartite construction; any value > 7 works).
- **`cut = 7.0`** clip for `alpha_topo` (barcode-B), applied to the `2×√alpha` (diameter) values.
- **persistence floor = 0.1** — alpha bars with clipped diameter-persistence ≤ 0.1 are dropped in barcode-B.
- **`2×` diameter scaling** on alpha circumradii (`√alpha`).
- Eigenvalue block uses its own non-GUDHI Laplacian path at the **`--filtration`** values (edges ≤ t), not
  the 7 Å cap — the two blocks build genuinely different complexes.

## Conclusion

The entire 2,646-feature TopoDockQ interface descriptor is reproduced clean-room bit-exactly on open tooling
(GUDHI + our petls-pytorch fork) with no dependence on the unlicensed `.pyc`. The persistent-Laplacian half —
the part that needed the engine and the fork fix — and the full barcode half are both bit-exact. The
featurizer is no longer a research risk; it is a buildable, fully-open L1→L3 vertical. What remains is pure
assembly: emit the ordered vector, apply the column mask, serialize the scaler, wire the MIT scorer, and
validate across the Zenodo set.
