# HiPoNet melanoma artifact-forensics closure

**Date:** 2026-08-05

**Epic:** [issue #10](https://github.com/jmchilton/bio-topo-foundry/issues/10)

**Conclusion:** the array and label *contents* can be reconstructed and independently verified from
public author-linked sources. The original five random states and patient assignments cannot be
recovered because the submission-era launcher and classifier neither set nor record them. Asking the
authors is no longer a prerequisite for the closest-recoverable replication.

## Sources audited

The audit covered:

- both arXiv source bundles and the official NeurIPS paper;
- the paper's anonymous review snapshot, which now returns HTTP 410, plus the Internet Archive index;
- [Hiren Madhu's website](https://hirenmadhu.github.io/) and public
  [PointCloudNet fork](https://github.com/HirenMadhu/PointCloudNet);
- all reachable branches, tags, and Git objects in the renamed
  [KrishnaswamyLab repository](https://github.com/KrishnaswamyLab/HiPoNet) and its two public forks;
- public repositories belonging to the first three authors; and
- the W&B project names embedded in committed early run logs.

No `pc_full.pkl`, `labels_full.npy`, `patient_list_full.pkl`, paper checkpoint, seed manifest, or split
manifest was recoverable from those surfaces. The review URL
`https://anonymous.4open.science/r/PointCloudNet-1EAD` has no indexed Internet Archive capture. The
later W&B project used by the classification source is not publicly queryable.

## Point-cloud arrays: numerically reconstructed

Hiren Madhu's author fork preserves
[`archive/data/scaled_cell_intensities.csv`](https://github.com/HirenMadhu/PointCloudNet/blob/778f1e8644514746e6330d165abab82263de9507/archive/data/scaled_cell_intensities.csv)
at commit `778f1e8644514746e6330d165abab82263de9507`. Its SHA-256 is
`935f0e3ff7b3ee6af55b4740ad2fb24ce13412c4657500508f2c471a758df8d8`.

The archived author loader applies a base-10 `log(1+x)` transform and library-size normalization. For
every one of 54 patients, 54,989 cells, and 29 features, the Mendeley v1 matrix satisfies

```text
cell_protein_data.csv = log10(1 + legacy_intensity) / sum(log10(1 + legacy_intensity))
```

The patient IDs, feature order, per-patient cell counts, and within-patient cell order all agree. The
maximum absolute numeric difference is `1.6653345369377348e-16`.

The archived loader requests a library-size rescale of 1000, whereas Mendeley v1 rows sum to 1. This is
a single positive factor across the matrix. The released full-cohort HiPoNet loader subsequently applies
`StandardScaler` within each patient, which removes that factor. Consequently, the point clouds emitted
by `prepare_melanoma.py` reproduce the author-linked numeric input to the classifier up to floating-point
roundoff. They do not reproduce the unpublished pickle's byte serialization, which is not scientifically
material here.

The transformation is visible in the author's archived
[`melanoma.py`](https://github.com/KrishnaswamyLab/HiPoNet/blob/45a9d08c49af0aa0a2e24b840d53e0512ad69032/archive/pcnn/data/melanoma.py).

## Labels: semantically reconstructed

The same author fork preserves
[`archive/data/melanoma_clinical_info_MIBI.csv`](https://github.com/HirenMadhu/PointCloudNet/blob/778f1e8644514746e6330d165abab82263de9507/archive/data/melanoma_clinical_info_MIBI.csv),
SHA-256 `1969fa8ab985fef60d24dc3129173363db7d0b0dafba39063f94e81de4d11a71`.
The author's loader constructs IDs as `R{376_1_col}C{376_1_row}` and maps `RESPONSE` from `NO/YES` to
`0/1`.

Cross-checking the 54 Mendeley v1 patients produced:

- 54/54 matching patient IDs;
- 54/54 matching binary response labels;
- 54/54 matching `BEST_RESPONSE_BY_SCAN` / `response_multi` values; and
- nine additional clinical rows that are not part of the deposited T-cell cohort.

Thus `response_binary` is the reconstructed target, not merely a plausible candidate. As with the point
clouds, this establishes semantic identity rather than byte identity with an unpublished NumPy file.

## Seeds and splits: forensically unrecoverable, explicitly replaced

The deleted submission-era
[`main_melanoma_kfold copy.sh`](https://github.com/KrishnaswamyLab/HiPoNet/blob/55db86112a042218a10162d35176d51d65fe3ae1/main_melanoma_kfold%20copy.sh)
launches the same melanoma command five times for each parameter arm. It passes no seed. The associated
classification source calls `train_test_split(..., test_size=0.2)` without `random_state` or
stratification, and it contains no NumPy or PyTorch seed initialization. The paper reports variability
from initialization and data splits but does not print the five random states or assignments.

The original five seeds are therefore not stable identifiers that can be recovered from the source
protocol: each process consumed whatever global/OS RNG state it received. With no surviving public run
logs or split artifacts, the exact assignments are derivable neither from the reported aggregate metric
nor from Git history.

Foundry closes this ambiguity with a replacement experiment identity: seeds `0` through `4` and every
train/test patient assignment are checked into `faithful_splits.json` and `faithful_splits.csv`. They
preserve the released unstratified 80/20 procedure but are explicitly labeled as Foundry-selected, not
author-recovered.

## Resolution

| Requested artifact | Resolution | Remaining boundary |
| --- | --- | --- |
| Point-cloud arrays | Closed: deterministic numeric reconstruction, independently matched cell by cell | Original pickle bytes unavailable |
| Labels | Closed: all 54 labels independently agree with author-committed clinical metadata | Original NumPy bytes unavailable |
| Five author seeds | Closed as unrecoverable: the code and launcher did not define or log them | Foundry seeds are replacements, not author seeds |
| Five author splits | Closed as unrecoverable: assignments were transient consequences of unlogged RNG state | Foundry assignments are the versioned replication identity |

This closes the “obtain arrays, labels, seeds, and splits from the authors” dependency. It does **not**
turn the current result into an exact paper-run reproduction: the precise paper commit remains untagged,
and the source/representation mismatch and test-set checkpoint selection remain separate open problems.

