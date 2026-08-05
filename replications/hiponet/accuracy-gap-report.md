# HiPoNet melanoma accuracy-gap investigation

**Date:** 2026-08-05

**Epic:** [issue #10](https://github.com/jmchilton/bio-topo-foundry/issues/10)

**Status:** complete five-run representation experiment on MPS; locked Linux/CUDA comparison remains

## Source/paper mismatch

The paper's headline HiPoNet representation concatenates zeroth-, first-, and second-order wavelet
scattering coefficients. Its component ablation reports `70.90 +/- 14.93%` for **w/o wavelets**, which
the paper defines as using diffusion only, versus `90.90 +/- 4.92%` for the full melanoma model.

The publication-proximal source candidate does not execute that headline representation for `K=1`.
At commit `9dd23b9cdad5bf98e4af02df3681c415e9b3c961`,
`GraphFeatLearningLayer.forward()` calls `GraphWaveletTransform.diffusion_only()`. The same pinned
source already contains `generate_timepoint_features()`, which concatenates the three scattering
orders. Upstream changed the graph layer to call `generate_timepoint_features()` in commit `f77082e`
on 2025-09-30 as part of a larger GWT rewrite; it was not a one-line release fix.

This makes the completed 67.27% MPS result much closer to the paper's diffusion-only ablation than to
its headline result. It also makes source version a concrete experimental factor rather than a generic
reproducibility caveat.

## Controlled representation experiment

`run_faithful.py` now exposes two explicit arms:

- `released-diffusion` preserves the pinned source dispatch.
- `paper-wavelet` redirects only that dispatch to the pinned source's existing
  `generate_timepoint_features()` method. It leaves graph construction, preprocessing, model
  initialization, optimizer, splits, test-selected checkpoint rule, and every other setting unchanged.

The intervention increases the four-view representation from 348 to 696 features. Both arms ran on
the same Apple M4 Pro, PyTorch 2.5.1 MPS environment, complete 54-patient/54,989-cell cohort, five
checked splits, and 100-epoch procedure.

| Seed | Diffusion best accuracy | Wavelet best accuracy | Diffusion max train | Wavelet max train |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 81.82% | 81.82% | 65.12% | 97.67% |
| 1 | 54.55% | 54.55% | 62.79% | 100.00% |
| 2 | 81.82% | 81.82% | 67.44% | 97.67% |
| 3 | 54.55% | 54.55% | 65.12% | 97.67% |
| 4 | 63.64% | 72.73% | 62.79% | 100.00% |
| **Mean** | **67.27%** | **69.09%** | **64.65%** | **98.60%** |

The checksum-validated wavelet aggregate has population SD 12.33 points and sample SD 13.79 points.
Its mean is 21.81 points below the paper, compared with a 23.63-point diffusion gap.

The class-aware diagnostics reveal a larger but still insufficient improvement:

| Diagnostic | Released diffusion | Paper-wavelet intervention |
| --- | ---: | ---: |
| Mean accuracy | 67.27% | 69.09% |
| Mean split-majority accuracy | 65.45% | 65.45% |
| Mean accuracy above majority | 1.82 points | 3.64 points |
| Mean balanced accuracy | 53.33% | 61.39% |
| Runs predicting no class-1 patients | 4/5 | 1/5 |

## Interpretation

Wavelet features repair a real representation/optimization problem: all five models can now fit the
training cohort, and class-1 sensitivity improves. They do **not** close the headline accuracy gap on
the frozen recovered splits. Two wavelet runs still select epoch zero, and later epochs commonly reach
95--100% training accuracy while test accuracy deteriorates. The remaining failure is therefore
generalization or experiment-identity mismatch, not simply lack of model capacity.

This experiment does not identify whether the remaining gap comes from the MPS/PyTorch deviation, the
later rewritten wavelet implementation, or the transient original seeds and patient assignments. A
subsequent [artifact-forensics audit](forensic-artifact-audit.md) removed prepared arrays and target
semantics from that list: the public Mendeley values match author-committed legacy intensities after the
documented transform, and all 54 labels match the author's clinical metadata. It also established that
the submission-era launcher did not define or log its five RNG states. Blindly tuning the optimizer on
the current test sets remains the wrong next move.

## Ordered path to resolve the remaining gap

1. Run both named representation arms on the same five splits under locked PyTorch 2.8.0 on Linux
   CUDA. This isolates backend/runtime effects without requiring an A100 specifically.
2. Add a separately pinned **later-source** arm based on the first internally coherent full-wavelet
   classification revision. Audit the 2025-09-30 GWT rewrite and the 2026-02-06 `Fixed classification`
   commit before choosing it; do not fold that larger architecture change into the one-line experiment.
3. Preserve the forensic closure: use the reconstructed arrays and labels, and treat the checked
   Foundry seeds and assignments as the explicit experiment identity. Do not imply that seeds `0-4`
   were used by the authors or that an exact paper-run split can still be recovered.
4. In parallel, build the hardened estimate with stratified patient-level repeated splits, a validation
   set for checkpointing, balanced metrics, and regularization selected without test feedback. Its goal
   is credible generalization, not retrofitting 90.90%.
5. Compare HiPoNet with transparent topological and non-topological baselines on that corrected
   contract. If all methods fail on the same patients, investigate cohort/target shift; if only HiPoNet
   fails, focus on representation and regularization.

Do not tune threshold, bandwidth, class weights, or split seeds against these 11-patient test sets and
then call the result a reproduction. Those are legitimate hardening experiments only behind a separate
validation boundary.
