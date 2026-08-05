#!/usr/bin/env python3
"""Validate and aggregate the five closest-recoverable HiPoNet run reports."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import statistics
from pathlib import Path
from typing import Any


EXPECTED_RUN_IDS = [f"faithful-seed-{seed}" for seed in range(5)]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def binary_metrics(rows: list[dict[str, str]]) -> dict[str, Any]:
    confusion = {(truth, prediction): 0 for truth in (0, 1) for prediction in (0, 1)}
    for row in rows:
        confusion[(int(row["true_label"]), int(row["predicted_label"]))] += 1
    true_negative = confusion[(0, 0)]
    false_positive = confusion[(0, 1)]
    false_negative = confusion[(1, 0)]
    true_positive = confusion[(1, 1)]
    negative_count = true_negative + false_positive
    positive_count = true_positive + false_negative
    total = negative_count + positive_count
    sensitivity = true_positive / positive_count if positive_count else None
    specificity = true_negative / negative_count if negative_count else None
    balanced_accuracy = (
        100.0 * (sensitivity + specificity) / 2
        if sensitivity is not None and specificity is not None
        else None
    )
    accuracy = 100.0 * (true_positive + true_negative) / total
    majority_accuracy = 100.0 * max(negative_count, positive_count) / total
    return {
        "true_negative": true_negative,
        "false_positive": false_positive,
        "false_negative": false_negative,
        "true_positive": true_positive,
        "true_class_0_count": negative_count,
        "true_class_1_count": positive_count,
        "predicted_class_0_count": true_negative + false_negative,
        "predicted_class_1_count": true_positive + false_positive,
        "accuracy_percent": accuracy,
        "majority_accuracy_percent": majority_accuracy,
        "accuracy_minus_majority_points": accuracy - majority_accuracy,
        "sensitivity_class_1": sensitivity,
        "specificity_class_0": specificity,
        "balanced_accuracy_percent": balanced_accuracy,
    }


def validate_output(run_json_path: Path, output: dict[str, Any]) -> Path:
    path = run_json_path.parent / output["path"]
    if not path.is_file():
        raise ValueError(f"Missing run output: {path}")
    actual = sha256(path)
    if actual != output["sha256"]:
        raise ValueError(f"Output checksum mismatch for {path}: {actual}")
    return path


def validate_run(
    run_json_path: Path, allow_deviated: bool = False
) -> tuple[dict[str, Any], list[dict[str, str]]]:
    report = load_json(run_json_path)
    if report.get("schema_version") != 1:
        raise ValueError(f"Unsupported run schema in {run_json_path}")
    if report.get("protocol") != "closest-recoverable-published-procedure":
        raise ValueError(f"Unexpected protocol in {run_json_path}")
    if report.get("protocol_status") != "faithful-target" and not allow_deviated:
        raise ValueError(f"Refusing non-faithful run {run_json_path}; use --allow-deviated for QA")

    for output in report["outputs"].values():
        validate_output(run_json_path, output)
    predictions_path = run_json_path.parent / report["outputs"]["predictions"]["path"]
    predictions = read_csv(predictions_path)
    patient_ids = [row["sample_id"] for row in predictions]
    if len(patient_ids) != len(set(patient_ids)):
        raise ValueError(f"Duplicate patient predictions in {predictions_path}")

    train_rows = [row for row in predictions if row["subset"] == "train"]
    test_rows = [row for row in predictions if row["subset"] == "test"]
    run = report["run"]
    if len(train_rows) != run["train_count"] or len(test_rows) != run["test_count"]:
        raise ValueError(f"Prediction counts do not match run.json in {run_json_path}")
    if len(predictions) != run["train_count"] + run["test_count"]:
        raise ValueError(f"Unexpected prediction subset in {predictions_path}")
    if any(int(row["selected_epoch"]) != run["best_epoch"] for row in predictions):
        raise ValueError(
            f"Prediction epoch does not match selected checkpoint in {predictions_path}"
        )

    recomputed_accuracy = 100.0 * sum(int(row["correct"]) for row in test_rows) / len(test_rows)
    if not math.isclose(
        recomputed_accuracy,
        run["best_test_accuracy_percent"],
        rel_tol=0,
        abs_tol=1e-9,
    ):
        raise ValueError(f"Prediction accuracy does not match run.json in {run_json_path}")
    return report, predictions


def comparable_signature(report: dict[str, Any]) -> str:
    signature = {
        "protocol_status": report["protocol_status"],
        "deviations": report["deviations"],
        "parameters": report["parameters"],
        "manifest_sha256": report["inputs"]["manifest"]["sha256"],
        "splits_sha256": report["inputs"]["splits"]["sha256"],
        "upstream_commit": report["upstream"]["commit"],
        "upstream_uv_lock_sha256": report["upstream"]["uv_lock_sha256"],
    }
    return json.dumps(signature, sort_keys=True)


def aggregate(
    run_json_paths: list[Path],
    allow_deviated: bool = False,
    allow_incomplete: bool = False,
) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    validated = [validate_run(path, allow_deviated) for path in run_json_paths]
    reports = [item[0] for item in validated]
    if not reports:
        raise ValueError("At least one run report is required")

    by_run_id = {
        report["run"]["run_id"]: (report, predictions, path)
        for path, (report, predictions) in zip(run_json_paths, validated, strict=True)
    }
    if len(by_run_id) != len(reports):
        raise ValueError("Run IDs must be unique")
    observed_ids = sorted(by_run_id, key=lambda run_id: by_run_id[run_id][0]["run"]["seed"])
    if observed_ids != EXPECTED_RUN_IDS and not allow_incomplete:
        raise ValueError(f"Expected run IDs {EXPECTED_RUN_IDS}, found {observed_ids}")

    signatures = {comparable_signature(report) for report in reports}
    if len(signatures) != 1:
        raise ValueError(
            "Run inputs, source pins, parameters, or protocol status are not comparable"
        )

    run_rows = []
    combined_predictions = []
    accuracies = []
    majority_accuracies = []
    accuracy_minus_majority = []
    balanced_accuracies = []
    predicted_positive_counts = []
    for run_id in observed_ids:
        report, predictions, path = by_run_id[run_id]
        run = report["run"]
        test_predictions = [row for row in predictions if row["subset"] == "test"]
        diagnostics = binary_metrics(test_predictions)
        accuracies.append(run["best_test_accuracy_percent"])
        majority_accuracies.append(diagnostics["majority_accuracy_percent"])
        accuracy_minus_majority.append(diagnostics["accuracy_minus_majority_points"])
        balanced_accuracies.append(diagnostics["balanced_accuracy_percent"])
        predicted_positive_counts.append(diagnostics["predicted_class_1_count"])
        run_rows.append(
            {
                "run_id": run_id,
                "seed": run["seed"],
                "best_epoch": run["best_epoch"],
                "best_test_accuracy_percent": run["best_test_accuracy_percent"],
                "selected_train_accuracy_percent": run["selected_train_accuracy_percent"],
                "majority_accuracy_percent": diagnostics["majority_accuracy_percent"],
                "accuracy_minus_majority_points": diagnostics[
                    "accuracy_minus_majority_points"
                ],
                "balanced_accuracy_percent": diagnostics["balanced_accuracy_percent"],
                "sensitivity_class_1": diagnostics["sensitivity_class_1"],
                "specificity_class_0": diagnostics["specificity_class_0"],
                "predicted_class_1_count": diagnostics["predicted_class_1_count"],
                "true_class_1_count": diagnostics["true_class_1_count"],
                "runtime_seconds": run["runtime_seconds"],
                "run_json": str(path.resolve()),
            }
        )
        for prediction in predictions:
            combined_predictions.append({"source_run_json": str(path.resolve()), **prediction})

    paper = reports[0]["paper_result"]
    observed_mean = statistics.mean(accuracies)
    summary = {
        "schema_version": 1,
        "arc_stage": "replicate",
        "protocol": reports[0]["protocol"],
        "protocol_status": reports[0]["protocol_status"],
        "run_count": len(reports),
        "complete_five_run_contract": observed_ids == EXPECTED_RUN_IDS,
        "run_ids": observed_ids,
        "accuracy_percent": {
            "values": accuracies,
            "mean": observed_mean,
            "population_standard_deviation": statistics.pstdev(accuracies),
            "sample_standard_deviation": (
                statistics.stdev(accuracies) if len(accuracies) > 1 else None
            ),
        },
        "baseline_diagnostics": {
            "majority_accuracy_percent_values": majority_accuracies,
            "mean_majority_accuracy_percent": statistics.mean(majority_accuracies),
            "accuracy_minus_majority_points_values": accuracy_minus_majority,
            "mean_accuracy_minus_majority_points": statistics.mean(
                accuracy_minus_majority
            ),
            "balanced_accuracy_percent_values": balanced_accuracies,
            "mean_balanced_accuracy_percent": statistics.mean(balanced_accuracies),
            "predicted_class_1_count_values": predicted_positive_counts,
            "runs_predicting_no_class_1_patients": sum(
                count == 0 for count in predicted_positive_counts
            ),
        },
        "paper_comparison": {
            "reported_mean": paper["mean"],
            "reported_standard_deviation": paper["standard_deviation"],
            "mean_delta_observed_minus_reported": observed_mean - paper["mean"],
            "interpretation_warning": (
                "The original splits, seeds, and prepared arrays are unavailable. A similar "
                "mean or overlapping spread would not establish exact reproduction."
            ),
        },
        "common_signature": json.loads(next(iter(signatures))),
    }
    return summary, run_rows, combined_predictions


def write_outputs(
    output_dir: Path,
    summary: dict[str, Any],
    run_rows: list[dict[str, Any]],
    predictions: list[dict[str, Any]],
) -> None:
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError(f"Output directory is not empty: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / "summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2)
        handle.write("\n")
    for filename, rows in (("runs.csv", run_rows), ("predictions.csv", predictions)):
        if not rows:
            continue
        with (output_dir / filename).open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-json", type=Path, nargs="+", required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--allow-deviated", action="store_true")
    parser.add_argument("--allow-incomplete", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary, run_rows, predictions = aggregate(
        args.run_json,
        allow_deviated=args.allow_deviated,
        allow_incomplete=args.allow_incomplete,
    )
    write_outputs(args.output_dir, summary, run_rows, predictions)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
