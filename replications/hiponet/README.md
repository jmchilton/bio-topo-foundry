# HiPoNet melanoma replication

This is the first executable slice of
[issue #10](https://github.com/jmchilton/bio-topo-foundry/issues/10): pin one published cohort task,
recover its patient-level manifest, and bridge the cited public data into the filenames consumed by
HiPoNet. It is a **replication** artifact, not yet a successful reproduction of the headline metric.

## What is pinned

- The 30-page official NeurIPS 2025 proceedings PDF, including its SHA-256.
- Mendeley Data **v1**, DOI `10.17632/79y7bht7tf.1`, including all three file IDs, sizes, and SHA-256
  values. The paper links specifically to v1; v2 changes the files and cell population.
- A publication-proximal source candidate, HiPoNet commit
  `9dd23b9cdad5bf98e4af02df3681c415e9b3c961`, and the separate Foundry hardening base at
  `45a9d08c49af0aa0a2e24b840d53e0512ad69032`.
- The exact recoverable cohort: 54 patients, 54,989 cells, 29 protein features, per-patient cell counts,
  response labels, and label distribution.
- The reported melanoma result and paper-selected settings: `90.90 +/- 4.92%` accuracy over five runs,
  four views, `K=1`, threshold `0.5`, bandwidth `1.0`, AdamW at `1e-4`, and 100 epochs.

The machine-readable record is [`manifest.json`](manifest.json). Its
[`forensic-artifact-audit.md`](forensic-artifact-audit.md) closes the former dependency on obtaining
arrays, labels, seeds, and splits from the authors: arrays and labels are independently reconstructed,
while the unlogged original RNG states and assignments are explicitly classified as unrecoverable.

## Prepare the cohort

Download `cell_protein_data.csv` and `patient_info.csv` from the exact URLs in `manifest.json`, then
run:

```bash
python replications/hiponet/prepare_melanoma.py \
  --protein-csv /path/to/cell_protein_data.csv \
  --patient-csv /path/to/patient_info.csv \
  --output-dir /path/to/melanoma_data_full
```

The adapter validates both source checksums and the full patient manifest before writing:

- `pc_full.pkl` — 54 full patient point clouds in `patient_info.csv` order;
- `labels_full.npy` — the independently corroborated binary immunotherapy-response target;
- `patient_list_full.pkl` — the sample IDs missing from the current HiPoNet loader output surface;
- `samples.csv` and `features.csv` — inspectable cohort contracts;
- `provenance.json` — source, transform, and output checksums.

It does not resample cells, create a split, or use the spatial columns. HiPoNet's own loader subsequently
fits `StandardScaler` separately within each patient point cloud. Python with NumPy is required; the
HiPoNet environment already supplies it. The forensic verification can be rerun against the two files in
Hiren Madhu's public PointCloudNet fork:

```bash
python replications/hiponet/verify_legacy_artifacts.py \
  --protein-csv /path/to/cell_protein_data.csv \
  --patient-csv /path/to/patient_info.csv \
  --legacy-intensities-csv /path/to/scaled_cell_intensities.csv \
  --legacy-clinical-csv /path/to/melanoma_clinical_info_MIBI.csv
```

## Explicit faithful-arm splits

The recovered launcher repeats five unseeded processes, and the classifier neither fixes nor records its
RNG state. The resulting paper-run seeds and patient assignments are therefore forensically
unrecoverable, not merely files that remain to be requested. Rather than leave another hidden random
choice in the reproduction, [`faithful_splits.json`](faithful_splits.json) and
[`faithful_splits.csv`](faithful_splits.csv) check in five Foundry-selected runs using seeds `0` through
`4`. Each run has 43 training patients and 11 test patients.

The split generator preserves the released script's unstratified `train_test_split(...,
test_size=0.2)` behavior. Consequently, the test-set positive count ranges from two to five across the
five runs. This is part of the faithful-procedure evidence, not a recommended evaluation design. The
corrected arm will use a separately versioned, patient-grouped train/validation/test contract.

Regenerate both representations with:

```bash
python replications/hiponet/generate_faithful_splits.py
```

The tests require the checked-in JSON to equal the deterministic generator output exactly.

## Faithful-procedure runner

[`run_faithful.py`](run_faithful.py) is an observability-focused derivative of the released
`main_classification.py`. It keeps the publication-proximal model, preprocessing, optimizer, 100x loss
scaling, unstratified 80/20 split shape, and best-test-epoch selection while adding the inputs and outputs
the paper run omitted. It refuses a different upstream commit, a modified tracked worktree, or an
unexpected `uv.lock`.

The default `--graph-features released-diffusion` preserves the pinned `K=1` source dispatch. Use
`--graph-features paper-wavelet` for the separately labeled experiment that redirects that one dispatch
to the full scattering method already present in the same source. The latter is paper-aligned but is a
source intervention; every run records the selected arm and resulting representation dimension.

Prepare an exact detached checkout and its locked environment:

```bash
git clone https://github.com/KrishnaswamyLab/HiPoNet.git /path/to/HiPoNet
git -C /path/to/HiPoNet switch --detach 9dd23b9cdad5bf98e4af02df3681c415e9b3c961
cd /path/to/HiPoNet
uv sync --locked
```

Then run each checked split as a separate process on a Linux CUDA host. An A100 best matches the paper's
reported hardware, but it is not an architectural requirement; another sufficiently capable CUDA GPU
is a useful locked-software reproduction as long as its identity and runtime remain in the report. Here,
`/path/to/foundry` is this repository and the prepared data directory must retain the exact basename
`melanoma_data_full` required by the upstream loader.

```bash
for seed in 0 1 2 3 4; do
  CUDA_VISIBLE_DEVICES=0 uv run python \
    /path/to/foundry/replications/hiponet/run_faithful.py \
    --hiponet-root /path/to/HiPoNet \
    --data-dir /path/to/melanoma_data_full \
    --run-id "faithful-seed-${seed}" \
    --output-dir "/path/to/results/faithful-seed-${seed}"
done
```

For Slurm, [`run_faithful.slurm`](run_faithful.slurm) submits the five seeds as array tasks `0-4` and
requests one GPU, four CPU cores, 64 GB RAM, and six hours per task. Set the four absolute paths, then
add the cluster's account, partition, or GPU-model constraint at submission time rather than baking site
policy into the replication:

```bash
export FOUNDRY_ROOT=/path/to/foundry
export HIPONET_ROOT=/path/to/HiPoNet
export HIPONET_DATA_DIR=/path/to/melanoma_data_full
export HIPONET_RESULTS_ROOT=/path/to/results
export HIPONET_GRAPH_FEATURES=released-diffusion

sbatch --account=YOUR_ACCOUNT --partition=YOUR_GPU_PARTITION --gpus=a100:1 \
  --export=ALL "${FOUNDRY_ROOT}/replications/hiponet/run_faithful.slurm"
```

Use a different empty `HIPONET_RESULTS_ROOT` with `HIPONET_GRAPH_FEATURES=paper-wavelet` to execute the
controlled representation arm on the identical array of splits.

The runner refuses a nonempty per-seed result directory, so failed or partial jobs are not silently
overwritten on resubmission.

Every run produces:

- `run.json` — protocol status, deviations, exact inputs, source/lock pin, metrics, runtime, and hardware;
- `epochs.csv` — epoch-zero test accuracy plus all train/test/best metrics and epoch runtimes;
- `predictions.csv` — best-checkpoint predictions and class probabilities for all 54 patients, labeled
  by train/test membership;
- `best_checkpoint.pt` — model, MLP, optimizer, selected epoch, split indices, and parameters.

After all five runs complete, validate their checksums and common source/input/parameter signature and
produce a shared report:

```bash
python replications/hiponet/aggregate_faithful_runs.py \
  --run-json \
    /path/to/results/faithful-seed-0/run.json \
    /path/to/results/faithful-seed-1/run.json \
    /path/to/results/faithful-seed-2/run.json \
    /path/to/results/faithful-seed-3/run.json \
    /path/to/results/faithful-seed-4/run.json \
  --output-dir /path/to/results/faithful-summary
```

The aggregator refuses missing runs, altered output files, deviated runs, or differences in
the source pin, lock, manifest, splits, or model parameters. It emits `summary.json`, `runs.csv`, and a
combined `predictions.csv`, reporting both population and sample standard deviations because the paper
does not specify the convention behind its `+/-` value. Use `--allow-deviated` only for a deliberately
labeled portability arm such as MPS.

Changing a headline parameter, using CPU, or truncating cells automatically labels `run.json` as
`deviated-or-smoke`. A short CPU invocation can exercise the surface, but it is not comparable with the
paper:

```bash
uv run python /path/to/foundry/replications/hiponet/run_faithful.py \
  --hiponet-root /path/to/HiPoNet \
  --data-dir /path/to/melanoma_data_full \
  --run-id faithful-seed-0 \
  --output-dir /path/to/smoke-result \
  --device cpu \
  --num-epochs 1 \
  --max-cells 60
```

Even an unchanged full run is a closest-recoverable target, not a claim of exact reproduction: no tag
binds the paper to a commit; the original serialized containers and transient RNG states are unavailable;
Foundry's five assignments replace rather than reproduce the paper assignments; and the released
procedure selects its best epoch using test accuracy.

## Local validation

On 2026-08-05, the exact detached candidate commit and its pinned `uv.lock` were verified, the complete
v1 cohort was loaded through the upstream code, and a one-epoch/60-cell CPU smoke run completed on
macOS. The runner emitted one checkpoint, two epoch rows (including epoch zero), and 54 unique patient
predictions split 43/11; the reported test accuracy recomputed exactly from the prediction rows. The
aggregator accepted that run only with both explicit QA escape hatches (`--allow-deviated` and
`--allow-incomplete`). This smoke result is intentionally not retained as biological or benchmark
evidence. All 13 adapter, forensic-contract, split, runner-contract, checksum, and aggregation tests pass under the
publication-proximal Python 3.11 environment.

The complete [MPS portability reproduction](mps-portability-report.md) subsequently ran all five
100-epoch, full-cell contracts on this Apple M4 Pro. It establishes that A100/CUDA is not a delivery
requirement, while remaining separate from the locked result because macOS 26 required PyTorch 2.5.1
and MPS fallback. Its mean best-test accuracy was 67.27%, versus 90.90% in the paper, and four runs
collapsed to all-class-0 predictions at epoch zero. See the report for split-specific majority and
balanced-accuracy diagnostics and the post-execution target-metadata correction.

The follow-up [accuracy-gap investigation](accuracy-gap-report.md) found that the pinned `K=1` source
calls the paper's diffusion-only ablation path rather than its headline wavelet/scattering path. A
controlled five-run `paper-wavelet` intervention raised mean accuracy only from 67.27% to 69.09%, but
raised mean balanced accuracy from 53.33% to 61.39% and allowed every seed to reach at least 97.67%
training accuracy. Wavelets restore fitting capacity and class sensitivity; they do not explain the
remaining 21.81-point headline gap on the recovered splits.

## Evidence boundaries

The public deposit resolves one prominent count discrepancy: v1 contains exactly 54,989 cell rows, which
is compatible with the main paper's “about 61K” but not Appendix G's 11,862. It also exposes 29 protein
columns, while the learned-feature discussion refers to 30.

The cited `response_binary` field is the reconstructed target: `0` combines progressive and stable
disease as non-response, while `1` combines partial and complete response/remission. All 54 binary and
four-way response values agree with author-committed legacy clinical metadata.

The point-cloud reconstruction is comparably strong. Applying the archived author's documented
`log10(1+x)` and library-size transform to all 54,989 legacy intensity rows reproduces every Mendeley v1
value with maximum absolute error `1.6653345369377348e-16`, preserving each patient's cell order and
count. The legacy rescale factor of 1000 is removed by the released loader's per-patient
`StandardScaler`. What remains unavailable is byte identity with unpublished pickle and NumPy
serializations, not the model's numerical arrays or biological labels.

The released non-spatial classifier does split the 54 full point clouds, so its unit is patient-level. It
does not publish or seed that 80/20 split, stratify it, reserve validation patients, or avoid choosing the
best epoch on the test set. Those defects belong in the later **harden** result; changing them here would
erase the distinction between faithful and corrected evaluation.

## Licensing posture

The paper and Mendeley v1 data are CC BY 4.0. HiPoNet code is under Yale's non-commercial license and is
used directly for this research reproduction; this work does not reimplement it to change that license.
The adapter and split generator contain no copied HiPoNet implementation. The faithful runner is a
HiPoNet derivative and carries the Yale copyright and permission notice directly. Any distributed data
derivatives need CC BY 4.0 attribution, and any distributed HiPoNet modification, runner derivative, or
checkpoint must preserve the applicable notice, remain non-commercial absent a separate Yale license,
and satisfy the license's GitHub-availability condition.

## Next slice

1. Execute both named representation arms on the same five splits with locked PyTorch 2.8.0 on an
   available Linux CUDA GPU; an A100 is preferred for hardware matching but is not required.
2. Audit and pin a separate later-source arm for the upstream full-wavelet rewrite rather than silently
   combining it with the one-line representation experiment.
3. Treat author seed/split recovery as closed forensics and preserve the checked Foundry split identity
   for every closest-recoverable comparison.
4. Add a separate, stratified patient-level train/validation/test implementation for corrected
   evaluation; do not overwrite or reuse the closest-recoverable result surface.
