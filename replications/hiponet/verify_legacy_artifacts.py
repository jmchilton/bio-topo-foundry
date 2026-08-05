#!/usr/bin/env python3
"""Verify Mendeley v1 melanoma arrays and labels against author-committed legacy data."""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

import numpy as np

import prepare_melanoma


HERE = Path(__file__).resolve().parent
DEFAULT_MANIFEST = HERE / "manifest.json"


def require_sha256(path: Path, expected: str) -> None:
    actual = prepare_melanoma.sha256(path)
    if actual != expected:
        raise ValueError(f"{path}: expected SHA-256 {expected}, found {actual}")


def read_mendeley_points(path: Path, features: list[str]) -> dict[str, np.ndarray]:
    grouped: dict[str, list[list[float]]] = defaultdict(list)
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != ["id", *features]:
            raise ValueError(f"Unexpected Mendeley protein columns: {reader.fieldnames!r}")
        for row in reader:
            grouped[row["id"]].append([float(row[feature]) for feature in features])
    return {sample_id: np.asarray(rows) for sample_id, rows in grouped.items()}


def read_legacy_points(path: Path, features: list[str]) -> dict[str, np.ndarray]:
    grouped: dict[str, list[list[float]]] = defaultdict(list)
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or any(feature not in reader.fieldnames for feature in features):
            raise ValueError("Legacy intensity CSV does not contain the expected 29 features")
        for row in reader:
            try:
                sample_id = row["FOV Name"].split("_", 1)[1]
            except (KeyError, IndexError) as exc:
                raise ValueError(f"Cannot derive a patient ID from {row.get('FOV Name')!r}") from exc
            grouped[sample_id].append([float(row[feature]) for feature in features])

    normalized: dict[str, np.ndarray] = {}
    for sample_id, rows in grouped.items():
        logged = np.log10(1.0 + np.asarray(rows))
        row_sums = logged.sum(axis=1, keepdims=True)
        if np.any(row_sums == 0):
            raise ValueError(f"Legacy intensity data contains an all-zero cell for {sample_id}")
        normalized[sample_id] = logged / row_sums
    return normalized


def read_mendeley_labels(path: Path) -> dict[str, tuple[int, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return {
            row["id"]: (int(row["response_binary"]), row["response_multi"])
            for row in csv.DictReader(handle)
        }


def read_legacy_labels(path: Path) -> dict[str, tuple[int | None, str]]:
    binary = {"NO": 0, "YES": 1}
    labels: dict[str, tuple[int | None, str]] = {}
    with path.open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            sample_id = f"R{row['376_1_col']}C{row['376_1_row']}"
            if sample_id in labels:
                raise ValueError(f"Duplicate legacy clinical patient ID {sample_id}")
            response = row["RESPONSE"]
            labels[sample_id] = (
                binary[response] if response in binary else None,
                row["BEST_RESPONSE_BY_SCAN"].strip(),
            )
    return labels


def verify(
    protein_csv: Path,
    patient_csv: Path,
    legacy_intensities_csv: Path,
    legacy_clinical_csv: Path,
    manifest_path: Path = DEFAULT_MANIFEST,
) -> dict[str, Any]:
    manifest = prepare_melanoma.load_manifest(manifest_path)
    evidence = manifest["artifact_forensics"]
    legacy = evidence["author_committed_legacy_sources"]

    require_sha256(
        protein_csv,
        prepare_melanoma.source_file(manifest, "cell_protein_data.csv")["sha256"],
    )
    require_sha256(
        patient_csv,
        prepare_melanoma.source_file(manifest, "patient_info.csv")["sha256"],
    )
    require_sha256(legacy_intensities_csv, legacy["scaled_cell_intensities_sha256"])
    require_sha256(legacy_clinical_csv, legacy["clinical_metadata_sha256"])

    features = manifest["cohort"]["features"]
    current_points = read_mendeley_points(protein_csv, features)
    legacy_points = read_legacy_points(legacy_intensities_csv, features)
    if current_points.keys() != legacy_points.keys():
        raise ValueError("Patient membership differs between legacy and Mendeley point data")

    maximum_error = 0.0
    row_count = 0
    for sample_id, current in current_points.items():
        old = legacy_points[sample_id]
        if current.shape != old.shape:
            raise ValueError(
                f"{sample_id}: Mendeley shape {current.shape} differs from legacy shape {old.shape}"
            )
        maximum_error = max(maximum_error, float(np.max(np.abs(current - old))))
        row_count += current.shape[0]

    expected_tolerance = evidence["point_cloud_reconstruction"]["absolute_tolerance"]
    if maximum_error > expected_tolerance:
        raise ValueError(
            f"Point arrays differ by {maximum_error}, above tolerance {expected_tolerance}"
        )

    current_labels = read_mendeley_labels(patient_csv)
    legacy_labels = read_legacy_labels(legacy_clinical_csv)
    missing = sorted(set(current_labels).difference(legacy_labels))
    mismatches = sorted(
        sample_id
        for sample_id, label in current_labels.items()
        if legacy_labels.get(sample_id) != label
    )
    extras = sorted(set(legacy_labels).difference(current_labels))
    if missing or mismatches:
        raise ValueError(f"Clinical label mismatch: missing={missing}, mismatches={mismatches}")

    return {
        "status": "verified",
        "patients": len(current_points),
        "cells": row_count,
        "features": len(features),
        "point_cloud_maximum_absolute_error": maximum_error,
        "matching_binary_labels": len(current_labels),
        "matching_multiclass_labels": len(current_labels),
        "legacy_clinical_rows_outside_cohort": len(extras),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--protein-csv", type=Path, required=True)
    parser.add_argument("--patient-csv", type=Path, required=True)
    parser.add_argument("--legacy-intensities-csv", type=Path, required=True)
    parser.add_argument("--legacy-clinical-csv", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = verify(
        args.protein_csv,
        args.patient_csv,
        args.legacy_intensities_csv,
        args.legacy_clinical_csv,
        args.manifest,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
