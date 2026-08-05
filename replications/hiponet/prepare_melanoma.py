#!/usr/bin/env python3
"""Prepare the published melanoma cohort for HiPoNet's legacy loader.

The input files are the versioned, CC BY 4.0 Mendeley Data v1 files pinned in
``manifest.json``.  This adapter intentionally emits the filenames expected by
HiPoNet when ``main_classification.py`` is run with ``--full``; it does not
perform a split or silently reproduce the legacy 400-cell resampling path.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import pickle
from pathlib import Path
from typing import Any

import numpy as np


HERE = Path(__file__).resolve().parent
DEFAULT_MANIFEST = HERE / "manifest.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_manifest(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        manifest = json.load(handle)
    if manifest.get("schema_version") != 1:
        raise ValueError(f"Unsupported manifest schema: {manifest.get('schema_version')!r}")
    return manifest


def source_file(manifest: dict[str, Any], filename: str) -> dict[str, Any]:
    for entry in manifest["source_dataset"]["files"]:
        if entry["filename"] == filename:
            return entry
    raise ValueError(f"Manifest has no source file named {filename!r}")


def verify_source(path: Path, specification: dict[str, Any]) -> dict[str, Any]:
    actual_size = path.stat().st_size
    actual_sha256 = sha256(path)
    if actual_size != specification["size_bytes"]:
        raise ValueError(
            f"{path}: expected {specification['size_bytes']} bytes, found {actual_size}"
        )
    if actual_sha256 != specification["sha256"]:
        raise ValueError(
            f"{path}: expected SHA-256 {specification['sha256']}, found {actual_sha256}"
        )
    return {"path": str(path.resolve()), "size_bytes": actual_size, "sha256": actual_sha256}


def read_patients(path: Path) -> tuple[list[dict[str, str]], dict[str, dict[str, str]]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))

    required = {
        "id",
        "age_at_dx_tertile",
        "dx_stage",
        "gross_dx_stage",
        "response_binary",
        "response_multi",
    }
    missing = required.difference(rows[0] if rows else {})
    if missing:
        raise ValueError(f"{path}: missing patient columns: {sorted(missing)}")

    by_id: dict[str, dict[str, str]] = {}
    for row in rows:
        sample_id = row["id"]
        if sample_id in by_id:
            raise ValueError(f"{path}: duplicate patient ID {sample_id!r}")
        if row["response_binary"] not in {"0", "1"}:
            raise ValueError(
                f"{path}: response_binary for {sample_id!r} is not 0 or 1: "
                f"{row['response_binary']!r}"
            )
        by_id[sample_id] = row
    return rows, by_id


def read_point_clouds(
    path: Path,
    features: list[str],
    sample_order: list[str],
) -> tuple[list[np.ndarray], dict[str, int]]:
    rows_by_sample: dict[str, list[list[float]]] = {sample_id: [] for sample_id in sample_order}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        expected_columns = ["id", *features]
        if reader.fieldnames != expected_columns:
            raise ValueError(
                f"{path}: expected columns {expected_columns!r}, found {reader.fieldnames!r}"
            )
        for row_number, row in enumerate(reader, start=2):
            sample_id = row["id"]
            if sample_id not in rows_by_sample:
                raise ValueError(f"{path}:{row_number}: unknown patient ID {sample_id!r}")
            try:
                values = [float(row[feature]) for feature in features]
            except ValueError as exc:
                raise ValueError(f"{path}:{row_number}: non-numeric protein value") from exc
            if not np.isfinite(values).all():
                raise ValueError(f"{path}:{row_number}: non-finite protein value")
            rows_by_sample[sample_id].append(values)

    clouds = [np.asarray(rows_by_sample[sample_id], dtype=np.float64) for sample_id in sample_order]
    counts = {sample_id: len(rows_by_sample[sample_id]) for sample_id in sample_order}
    return clouds, counts


def validate_cohort(
    manifest: dict[str, Any],
    patient_rows: list[dict[str, str]],
    counts: dict[str, int],
) -> None:
    expected_samples = manifest["cohort"]["samples"]
    expected_order = [sample["sample_id"] for sample in expected_samples]
    actual_order = [row["id"] for row in patient_rows]
    if actual_order != expected_order:
        raise ValueError("Patient order or membership differs from the pinned cohort manifest")

    for expected, actual in zip(expected_samples, patient_rows, strict=True):
        sample_id = expected["sample_id"]
        observed = {
            "cell_count": counts[sample_id],
            "response_binary": int(actual["response_binary"]),
            "response_multi": actual["response_multi"],
        }
        wanted = {key: expected[key] for key in observed}
        if observed != wanted:
            raise ValueError(
                f"Pinned cohort mismatch for {sample_id}: expected {wanted}, found {observed}"
            )

    if sum(counts.values()) != manifest["cohort"]["cell_count"]:
        raise ValueError("Total cell count differs from the pinned cohort manifest")


def write_outputs(
    output_dir: Path,
    manifest: dict[str, Any],
    manifest_path: Path,
    patient_rows: list[dict[str, str]],
    clouds: list[np.ndarray],
    counts: dict[str, int],
    verified_inputs: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    sample_ids = [row["id"] for row in patient_rows]
    labels = np.asarray([int(row["response_binary"]) for row in patient_rows], dtype=np.int64)

    artifacts = {
        "point_clouds": output_dir / "pc_full.pkl",
        "labels": output_dir / "labels_full.npy",
        "patient_ids": output_dir / "patient_list_full.pkl",
        "samples": output_dir / "samples.csv",
        "features": output_dir / "features.csv",
    }

    with artifacts["point_clouds"].open("wb") as handle:
        pickle.dump(clouds, handle, protocol=pickle.HIGHEST_PROTOCOL)
    np.save(artifacts["labels"], labels, allow_pickle=False)
    with artifacts["patient_ids"].open("wb") as handle:
        pickle.dump(sample_ids, handle, protocol=pickle.HIGHEST_PROTOCOL)

    with artifacts["samples"].open("w", newline="", encoding="utf-8") as handle:
        fieldnames = [
            "sample_index",
            "sample_id",
            "cell_count",
            "response_binary",
            "response_multi",
            "age_at_dx_tertile",
            "dx_stage",
            "gross_dx_stage",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for index, row in enumerate(patient_rows):
            writer.writerow(
                {
                    "sample_index": index,
                    "sample_id": row["id"],
                    "cell_count": counts[row["id"]],
                    "response_binary": row["response_binary"],
                    "response_multi": row["response_multi"],
                    "age_at_dx_tertile": row["age_at_dx_tertile"],
                    "dx_stage": row["dx_stage"],
                    "gross_dx_stage": row["gross_dx_stage"],
                }
            )

    with artifacts["features"].open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["feature_index", "feature_name"])
        writer.writeheader()
        for index, feature in enumerate(manifest["cohort"]["features"]):
            writer.writerow({"feature_index": index, "feature_name": feature})

    output_records = {
        name: {
            "path": str(path.resolve()),
            "size_bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        for name, path in artifacts.items()
    }
    provenance = {
        "schema_version": 1,
        "arc_stage": "replicate",
        "manifest": {
            "path": str(manifest_path.resolve()),
            "sha256": sha256(manifest_path),
        },
        "source_dataset_doi": manifest["source_dataset"]["doi"],
        "source_inputs": verified_inputs,
        "transform": {
            "description": (
                "Group the deposited, already processed protein rows by patient_info.csv order; "
                "do not use spatial columns, resample cells, scale features, or create a split."
            ),
            "point_cloud_dtype": "float64",
            "label_dtype": "int64",
            "label_column": "response_binary",
        },
        "outputs": output_records,
    }
    provenance_path = output_dir / "provenance.json"
    with provenance_path.open("w", encoding="utf-8") as handle:
        json.dump(provenance, handle, indent=2)
        handle.write("\n")
    return provenance


def prepare(
    protein_csv: Path,
    patient_csv: Path,
    output_dir: Path,
    manifest_path: Path = DEFAULT_MANIFEST,
) -> dict[str, Any]:
    manifest = load_manifest(manifest_path)
    verified_inputs = {
        "cell_protein_data.csv": verify_source(
            protein_csv, source_file(manifest, "cell_protein_data.csv")
        ),
        "patient_info.csv": verify_source(patient_csv, source_file(manifest, "patient_info.csv")),
    }
    patient_rows, _ = read_patients(patient_csv)
    sample_order = [row["id"] for row in patient_rows]
    clouds, counts = read_point_clouds(
        protein_csv,
        manifest["cohort"]["features"],
        sample_order,
    )
    validate_cohort(manifest, patient_rows, counts)
    return write_outputs(
        output_dir,
        manifest,
        manifest_path,
        patient_rows,
        clouds,
        counts,
        verified_inputs,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--protein-csv", required=True, type=Path)
    parser.add_argument("--patient-csv", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST, type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    provenance = prepare(
        protein_csv=args.protein_csv,
        patient_csv=args.patient_csv,
        output_dir=args.output_dir,
        manifest_path=args.manifest,
    )
    print(json.dumps(provenance, indent=2))


if __name__ == "__main__":
    main()
