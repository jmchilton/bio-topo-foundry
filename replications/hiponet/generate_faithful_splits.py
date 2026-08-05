#!/usr/bin/env python3
"""Generate the five explicit splits for the closest-recoverable HiPoNet arm.

The paper does not publish its seeds or patient assignments.  These splits are
therefore Foundry-authored reconstruction inputs, not recovered paper artifacts.
They reproduce the released script's unstratified 80/20 ShuffleSplit shape while
making the otherwise implicit random state inspectable.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
from typing import Any

import numpy as np


HERE = Path(__file__).resolve().parent
DEFAULT_MANIFEST = HERE / "manifest.json"
DEFAULT_JSON_OUTPUT = HERE / "faithful_splits.json"
DEFAULT_CSV_OUTPUT = HERE / "faithful_splits.csv"
DEFAULT_SEEDS = (0, 1, 2, 3, 4)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_samples(manifest_path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    with manifest_path.open(encoding="utf-8") as handle:
        manifest = json.load(handle)
    if manifest.get("schema_version") != 1:
        raise ValueError(f"Unsupported manifest schema: {manifest.get('schema_version')!r}")

    samples = manifest.get("cohort", {}).get("samples", [])
    if not samples:
        raise ValueError("Manifest cohort has no samples")

    sample_ids = [sample["sample_id"] for sample in samples]
    if len(sample_ids) != len(set(sample_ids)):
        raise ValueError("Manifest cohort contains duplicate sample IDs")
    for sample in samples:
        if sample.get("response_binary") not in {0, 1}:
            raise ValueError(
                f"Sample {sample.get('sample_id')!r} has a non-binary response label"
            )
    return manifest, samples


def class_counts(records: list[dict[str, Any]]) -> dict[str, int]:
    counts = {"0": 0, "1": 0}
    for record in records:
        counts[str(record["response_binary"])] += 1
    return counts


def indexed_sample(samples: list[dict[str, Any]], index: int) -> dict[str, Any]:
    sample = samples[index]
    return {
        "sample_index": index,
        "sample_id": sample["sample_id"],
        "response_binary": sample["response_binary"],
    }


def generate_contract(
    manifest_path: Path,
    seeds: tuple[int, ...] = DEFAULT_SEEDS,
    test_fraction: float = 0.2,
) -> dict[str, Any]:
    if not seeds:
        raise ValueError("At least one seed is required")
    if len(seeds) != len(set(seeds)):
        raise ValueError("Seeds must be unique")
    if not 0 < test_fraction < 1:
        raise ValueError("test_fraction must be between zero and one")

    manifest, samples = load_samples(manifest_path)
    sample_count = len(samples)
    test_count = math.ceil(test_fraction * sample_count)
    train_count = sample_count - test_count
    runs = []

    for seed in seeds:
        # This is the operation used by sklearn.model_selection.ShuffleSplit,
        # which backs train_test_split when shuffle=True and stratify=None.
        permutation = np.random.RandomState(seed).permutation(sample_count).tolist()
        test_indices = permutation[:test_count]
        train_indices = permutation[test_count : test_count + train_count]
        train = [indexed_sample(samples, index) for index in train_indices]
        test = [indexed_sample(samples, index) for index in test_indices]
        runs.append(
            {
                "run_id": f"faithful-seed-{seed}",
                "seed": seed,
                "train": train,
                "test": test,
                "class_counts": {
                    "train": class_counts(train),
                    "test": class_counts(test),
                },
            }
        )

    return {
        "schema_version": 1,
        "arc_stage": "replicate",
        "protocol": "closest-recoverable-published-procedure",
        "origin": (
            "Foundry-authored replacement for unpublished paper seeds and patient "
            "assignments; these are not original HiPoNet benchmark splits."
        ),
        "cohort": {
            "task_id": manifest["cohort"]["task_id"],
            "sample_count": sample_count,
            "manifest_path": manifest_path.name,
            "manifest_sha256": sha256(manifest_path),
        },
        "split_algorithm": {
            "implementation": "numpy.random.RandomState(seed).permutation",
            "sklearn_equivalent": (
                "train_test_split(np.arange(54), test_size=0.2, "
                "random_state=seed, shuffle=True, stratify=None)"
            ),
            "test_fraction": test_fraction,
            "train_count": train_count,
            "test_count": test_count,
            "stratified": False,
            "validation_count": 0,
            "selection_warning": (
                "The faithful arm retains best-epoch selection on this test subset. "
                "Do not reuse these splits for the corrected evaluation arm."
            ),
        },
        "runs": runs,
    }


def write_contract(contract: dict[str, Any], json_output: Path, csv_output: Path) -> None:
    json_output.parent.mkdir(parents=True, exist_ok=True)
    csv_output.parent.mkdir(parents=True, exist_ok=True)
    with json_output.open("w", encoding="utf-8") as handle:
        json.dump(contract, handle, indent=2)
        handle.write("\n")

    with csv_output.open("w", newline="", encoding="utf-8") as handle:
        fieldnames = [
            "run_id",
            "seed",
            "subset",
            "subset_position",
            "sample_index",
            "sample_id",
            "response_binary",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for run in contract["runs"]:
            for subset in ("train", "test"):
                for position, sample in enumerate(run[subset]):
                    writer.writerow(
                        {
                            "run_id": run["run_id"],
                            "seed": run["seed"],
                            "subset": subset,
                            "subset_position": position,
                            **sample,
                        }
                    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--json-output", type=Path, default=DEFAULT_JSON_OUTPUT)
    parser.add_argument("--csv-output", type=Path, default=DEFAULT_CSV_OUTPUT)
    parser.add_argument("--seeds", type=int, nargs="+", default=list(DEFAULT_SEEDS))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    contract = generate_contract(args.manifest, tuple(args.seeds))
    write_contract(contract, args.json_output, args.csv_output)
    print(
        json.dumps(
            {
                "json_output": str(args.json_output.resolve()),
                "csv_output": str(args.csv_output.resolve()),
                "run_ids": [run["run_id"] for run in contract["runs"]],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
