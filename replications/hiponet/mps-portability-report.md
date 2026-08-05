# HiPoNet melanoma MPS portability reproduction

**Date:** 2026-08-05

**Epic:** [issue #10](https://github.com/jmchilton/bio-topo-foundry/issues/10)

**Status:** complete five-run portability arm; not the locked Linux/CUDA arm

## Outcome

HiPoNet is not inherently tied to an A100 or even to CUDA. The publication-proximal K=1 classifier ran
end to end on an Apple M4 Pro through PyTorch's MPS backend, using all 54 patients, all 54,989 cells,
four learned views, 100 epochs, and the five checked Foundry splits.

The environment required a material portability deviation. The pinned PyTorch 2.8.0 wheel reports that
MPS is built but unavailable on macOS 26.5.2 because its operating-system check misclassifies macOS 26.
An isolated PyTorch 2.5.1 environment exposed the Metal device successfully. This version is below
HiPoNet's declared `torch>=2.8.0` requirement, and `PYTORCH_ENABLE_MPS_FALLBACK=1` was enabled. Every run
records those deviations and is labeled `deviated-or-smoke` rather than `faithful-target`.

The five-run result did **not** reproduce the reported melanoma accuracy. Mean best-test accuracy was
67.27%, 23.63 percentage points below the paper's 90.90%. More importantly, accuracy mostly followed
the majority class in each small, unstratified 11-patient test subset.

| Seed | Class-1 test patients | Predicted class 1 | Majority accuracy | Best-test accuracy | Balanced accuracy | Best epoch |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 3 | 1 | 72.73% | 81.82% | 66.67% | 1 |
| 1 | 5 | 0 | 54.55% | 54.55% | 50.00% | 0 |
| 2 | 2 | 0 | 81.82% | 81.82% | 50.00% | 0 |
| 3 | 5 | 0 | 54.55% | 54.55% | 50.00% | 0 |
| 4 | 4 | 0 | 63.64% | 63.64% | 50.00% | 0 |
| **Mean** | — | **0.2** | **65.45%** | **67.27%** | **53.33%** | — |

Best-test accuracy values were `81.82, 54.55, 81.82, 54.55, 63.64`; population SD was 12.33 points
and sample SD was 13.79 points. Four runs selected the untrained epoch-zero checkpoint and predicted
every test patient as class 0. Seed 0 selected epoch 1, correctly identifying one of three class-1 test
patients. Across runs, mean accuracy exceeded the split-specific majority baseline by only 1.82 points.

These results show that the released code, the strongest recoverable deposited target, the full v1
cohort, the paper-selected headline settings, and explicit replacement seeds are insufficient to recover
the headline result in this portability environment. A follow-up source audit found that this pinned
`K=1` code calls the paper's diffusion-only ablation path. The controlled five-run wavelet intervention
documented in the [accuracy-gap report](accuracy-gap-report.md) raised mean accuracy only to 69.09%,
while materially improving balanced accuracy and training-set fit. Remaining candidate causes include
the later rewritten wavelet implementation, unavailable prepared arrays or target, unavailable original
splits/seeds, and the MPS/PyTorch portability deviations.

## Exact execution boundary

- Upstream commit: `9dd23b9cdad5bf98e4af02df3681c415e9b3c961`
- Upstream `uv.lock` SHA-256: `41c28a7b172b3df93b9b5cbec77ab22a605b26084ff742320243238c0643f7fd`
- Execution manifest SHA-256: `369c8578b0b9e529d83369744262e5db5dbf7e41f8ba3c61b0eddc8808b9b902`
- Execution split JSON SHA-256: `6f237eda48a871a8c12ae0a94198c49a6c35c8639d5dee459bdd963d01a3900c`
- Platform: macOS 26.5.2 arm64, Apple M4 Pro, 48 GB unified memory
- Runtime: Python 3.11.14, PyTorch 2.5.1, MPS with CPU fallback enabled
- Model settings: four views, `K=1`, threshold 0.5, sigma 1.0, `J=3`, hidden dimension 256,
  three MLP layers, AdamW at `1e-4`, weight decay `1e-4`, batch size 32, 100 epochs; the pinned graph
  layer dispatched to diffusion-only features
- Selection: best test accuracy from epoch 0 through epoch 100, retained solely as the released
  procedure's behavior

The ignored local result tree at `results/mps-portability/` contains each run's `run.json`, 101-row
epoch table, 54-row patient prediction table, and checkpoint, plus the checksum-validated aggregate.
Exact pre-correction manifest and split snapshots are preserved under `execution-inputs/`.

## Metadata correction discovered after execution

The execution manifest's human-readable target mapping was wrong: it described class 0 as progressive
disease only and class 1 as stable/partial/complete response. The deposited cross-tab is unambiguous:

| `response_binary` | `response_multi` | Patients |
| ---: | --- | ---: |
| 0 | PD | 15 |
| 0 | SD | 16 |
| 1 | PR | 15 |
| 1 | CR | 8 |

The correct interpretation is class 0 = non-response (PD or SD) and class 1 = response (PR or CR).
This was a descriptive metadata error only: the adapter, split contract, runner, and model all consumed
the deposited numeric `response_binary` values unchanged. The canonical manifest and documentation have
been corrected; the exact execution inputs remain preserved for auditability.

## What this changes

The A100 should be treated as hardware-match evidence, not as a delivery prerequisite. Three execution
arms are now distinct:

1. **Locked reproduction arm:** Linux, pinned PyTorch 2.8.0, any sufficiently capable CUDA GPU. An A100
   best matches the paper, but another CUDA GPU can still isolate the software/runtime question while
   recording hardware and runtime differences.
2. **MPS portability arm:** completed here. It proves the workflow can execute on Apple Silicon, while
   the PyTorch downgrade and backend difference prevent treating its metric as the locked result.
3. **Corrected evaluation arm:** still to be built with validation-based checkpoint selection and
   stronger metrics; it should not reuse the faithful arm's test-selected claims.

The most informative next reproduction action is therefore not “find exactly an A100,” but run both
named representation arms on the five checked splits under the locked PyTorch 2.8.0 environment on an
available Linux CUDA GPU. A separately pinned later-source arm should then test the upstream full-wavelet
rewrite without conflating it with the controlled one-method dispatch experiment.
