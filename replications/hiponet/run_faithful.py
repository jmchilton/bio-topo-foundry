#!/usr/bin/env python3
"""Run one auditable HiPoNet melanoma classification replication arm.

This runner is intentionally coupled to the publication-proximal HiPoNet commit.
By default it preserves the released diffusion-only graph-feature dispatch. The
``paper-wavelet`` arm changes only that dispatch to the full wavelet/scattering
method already present in the pinned source. Both arms add explicit seeds, fixed
split input, patient identifiers, predictions, metrics, runtime metadata, and a
checkpoint.

This file is a Derivative Work of HiPoNet's ``main_classification.py`` and is
therefore governed by the upstream Yale Non-Commercial License:

Yale Copyright © 2024 Yale University.

Permission is hereby granted to use, copy, modify, and distribute this Software
for any non-commercial purpose. Any distribution or modification or derivations
of the Software (together “Derivative Works”) must be made available on GitHub
and shall include this copyright notice and this permission notice in all copies
or substantial portions of the Software. For the purposes of this license,
"non-commercial" means not intended for or directed towards commercial advantage
or monetary compensation either via the Software itself or Derivative Works or
uses of either which lead to or generate any commercial products. Any commercial
use requires a separate commercial license from Yale University.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
"""

from __future__ import annotations

import argparse
import csv
import gc
import hashlib
import json
import os
import pickle
import platform
import random
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import numpy as np


HERE = Path(__file__).resolve().parent
DEFAULT_MANIFEST = HERE / "manifest.json"
DEFAULT_SPLITS = HERE / "faithful_splits.json"
EXPECTED_COMMIT = "9dd23b9cdad5bf98e4af02df3681c415e9b3c961"
EXPECTED_TORCH_VERSION = "2.8.0"
FAITHFUL_PARAMETERS = {
    "num_weights": 4,
    "threshold": 0.5,
    "sigma": 1.0,
    "K": 1,
    "hidden_dim": 256,
    "num_layers": 3,
    "learning_rate": 0.0001,
    "weight_decay": 0.0001,
    "epochs": 100,
    "batch_size": 32,
    "graph_features": "released-diffusion",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_output(root: Path, *args: str) -> str:
    completed = subprocess.run(
        ["git", "-C", str(root), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout.strip()


def verify_upstream(root: Path, expected_commit: str = EXPECTED_COMMIT) -> dict[str, Any]:
    required = [
        root / "LICENSE.md",
        root / "main_classification.py",
        root / "models" / "graph_learning.py",
        root / "utils" / "read_data.py",
        root / "uv.lock",
    ]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise ValueError(f"HiPoNet root is missing required files: {missing}")

    commit = git_output(root, "rev-parse", "HEAD")
    if commit != expected_commit:
        raise ValueError(f"Expected HiPoNet commit {expected_commit}, found {commit}")
    tracked_changes = git_output(root, "status", "--porcelain", "--untracked-files=no")
    if tracked_changes:
        raise ValueError("HiPoNet checkout has tracked changes; use a clean detached checkout")
    return {
        "repository": "https://github.com/KrishnaswamyLab/HiPoNet",
        "commit": commit,
        "tracked_worktree_clean": True,
        "uv_lock_sha256": sha256(root / "uv.lock"),
        "license": "Yale Non-Commercial License",
    }


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_run(splits_path: Path, run_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    contract = load_json(splits_path)
    if contract.get("schema_version") != 1:
        raise ValueError(f"Unsupported split schema: {contract.get('schema_version')!r}")
    matches = [run for run in contract.get("runs", []) if run.get("run_id") == run_id]
    if len(matches) != 1:
        raise ValueError(f"Expected exactly one split named {run_id!r}, found {len(matches)}")
    return contract, matches[0]


def load_prepared_identity(data_dir: Path) -> tuple[list[str], np.ndarray]:
    if data_dir.name != "melanoma_data_full":
        raise ValueError(
            "The publication-proximal loader recognizes the cohort only when the data "
            "directory is named 'melanoma_data_full'"
        )
    with (data_dir / "patient_list_full.pkl").open("rb") as handle:
        patient_ids = pickle.load(handle)
    labels = np.load(data_dir / "labels_full.npy", allow_pickle=False)
    if not isinstance(patient_ids, list) or not all(
        isinstance(sample_id, str) for sample_id in patient_ids
    ):
        raise ValueError("patient_list_full.pkl must contain a list of sample ID strings")
    if labels.ndim != 1 or len(labels) != len(patient_ids):
        raise ValueError("Prepared labels and patient IDs have incompatible shapes")
    return patient_ids, labels


def validate_run_membership(
    run: dict[str, Any], patient_ids: list[str], labels: np.ndarray
) -> tuple[list[int], list[int]]:
    observed: set[int] = set()
    indices: dict[str, list[int]] = {"train": [], "test": []}
    for subset in ("train", "test"):
        for record in run.get(subset, []):
            index = record.get("sample_index")
            if not isinstance(index, int) or not 0 <= index < len(patient_ids):
                raise ValueError(f"Invalid {subset} sample index: {index!r}")
            if index in observed:
                raise ValueError(f"Sample index {index} occurs more than once in the split")
            if record.get("sample_id") != patient_ids[index]:
                raise ValueError(f"Split sample ID does not match prepared index {index}")
            if record.get("response_binary") != int(labels[index]):
                raise ValueError(f"Split label does not match prepared index {index}")
            observed.add(index)
            indices[subset].append(index)
    if observed != set(range(len(patient_ids))):
        raise ValueError("Split does not partition the complete prepared cohort")
    return indices["train"], indices["test"]


def protocol_deviations(args: argparse.Namespace) -> dict[str, dict[str, Any]]:
    actual = {
        "num_weights": args.num_weights,
        "threshold": args.threshold,
        "sigma": args.sigma,
        "K": args.K,
        "hidden_dim": args.hidden_dim,
        "num_layers": args.num_layers,
        "learning_rate": args.lr,
        "weight_decay": args.wd,
        "epochs": args.num_epochs,
        "batch_size": args.batch_size,
        "graph_features": args.graph_features,
    }
    deviations = {
        key: {"faithful": expected, "actual": actual[key]}
        for key, expected in FAITHFUL_PARAMETERS.items()
        if actual[key] != expected
    }
    if args.device != "cuda":
        deviations["device"] = {"faithful": "cuda (paper reports A100)", "actual": args.device}
    if args.max_cells is not None:
        deviations["max_cells"] = {"faithful": None, "actual": args.max_cells}
    return deviations


def configure_graph_features(graph_features: str, graph_wavelet_transform: type) -> dict[str, Any]:
    """Select the released or paper-aligned K=1 representation path.

    The pinned graph layer unconditionally calls ``diffusion_only``. For the
    experimental paper-aligned arm, redirect precisely that method dispatch to
    ``generate_timepoint_features``. This leaves graph construction, pooling,
    model initialization, and the training procedure untouched.
    """
    if graph_features == "released-diffusion":
        return {
            "arm": graph_features,
            "paper_alignment": "paper ablation: w/o wavelets (diffusion only)",
            "source_intervention": None,
            "dispatched_method": "GraphWaveletTransform.diffusion_only",
        }
    if graph_features == "paper-wavelet":
        graph_wavelet_transform.diffusion_only = (
            graph_wavelet_transform.generate_timepoint_features
        )
        return {
            "arm": graph_features,
            "paper_alignment": "paper headline: zeroth-, first-, and second-order scattering",
            "source_intervention": (
                "redirect GraphWaveletTransform.diffusion_only to the pinned source's "
                "generate_timepoint_features implementation"
            ),
            "dispatched_method": "GraphWaveletTransform.generate_timepoint_features",
        }
    raise ValueError(f"Unknown graph feature arm: {graph_features!r}")


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def run(args: argparse.Namespace) -> dict[str, Any]:
    started_at = time.time()
    started_clock = time.perf_counter()
    manifest = load_json(args.manifest)
    upstream = verify_upstream(args.hiponet_root, args.expected_commit)
    expected_lock = manifest["software"]["publication_proximal_candidate"]["uv_lock_sha256"]
    if upstream["uv_lock_sha256"] != expected_lock:
        raise ValueError(
            f"Publication-proximal uv.lock checksum mismatch: expected {expected_lock}, "
            f"found {upstream['uv_lock_sha256']}"
        )

    split_contract, selected_run = load_run(args.splits, args.run_id)
    if split_contract["cohort"]["manifest_sha256"] != sha256(args.manifest):
        raise ValueError("Split contract was generated from a different replication manifest")
    patient_ids, prepared_labels = load_prepared_identity(args.data_dir)
    train_indices, test_indices = validate_run_membership(
        selected_run, patient_ids, prepared_labels
    )

    if args.output_dir.exists() and any(args.output_dir.iterdir()):
        raise ValueError(f"Output directory is not empty: {args.output_dir}")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    random.seed(selected_run["seed"])
    np.random.seed(selected_run["seed"])

    # Imports occur only after the commit and lock have been verified, ensuring
    # the module names resolve from the intended detached upstream checkout.
    sys.path.insert(0, str(args.hiponet_root))
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader

    from models.GWT import GraphWaveletTransform
    from models.graph_learning import HiPoNet, MLP
    from utils.read_data import load_data

    if args.graph_features == "paper-wavelet" and args.K != 1:
        raise ValueError("The paper-wavelet dispatch experiment is defined only for K=1")
    representation = configure_graph_features(args.graph_features, GraphWaveletTransform)

    if args.device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("CUDA was requested but torch.cuda.is_available() is false")
    if args.device == "mps" and not torch.backends.mps.is_available():
        raise RuntimeError("MPS was requested but torch.backends.mps.is_available() is false")
    device = args.device
    torch.manual_seed(selected_run["seed"])
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(selected_run["seed"])
    if device == "mps" and hasattr(torch.mps, "manual_seed"):
        torch.mps.manual_seed(selected_run["seed"])

    point_clouds, labels, num_labels = load_data(str(args.data_dir), True)
    if len(point_clouds) != len(patient_ids) or not np.array_equal(
        np.asarray(labels), prepared_labels
    ):
        raise ValueError("HiPoNet loader output does not match the prepared cohort identity")
    if num_labels != 2:
        raise ValueError(f"Expected a binary task, found {num_labels} labels")
    if args.max_cells is not None:
        point_clouds = [point_cloud[: args.max_cells] for point_cloud in point_clouds]

    labels_tensor = torch.LongTensor(labels).to(device)
    # The released CUDA/CPU path puts index tensors on the execution device.
    # MPS scalar tensors cannot reliably index Python point-cloud lists, so the
    # explicitly deviated portability path retains indices on CPU and moves only
    # the label-index view below.
    index_device = "cpu" if device == "mps" else device
    train_tensor = torch.LongTensor(train_indices).to(index_device)
    test_tensor = torch.LongTensor(test_indices).to(index_device)
    train_loader = DataLoader(train_tensor, batch_size=args.batch_size, shuffle=True)
    train_eval_loader = DataLoader(train_tensor, batch_size=args.batch_size, shuffle=False)
    test_loader = DataLoader(test_tensor, batch_size=args.batch_size, shuffle=False)

    model = HiPoNet(
        point_clouds[0].shape[1],
        args.num_weights,
        args.threshold,
        args.K,
        device,
    )
    model = nn.DataParallel(model).to(device)
    with torch.no_grad():
        # Preserve the released script's dimension probe, including sigma=1.
        representation_dim = model([point_clouds[0].to(device)], 1).shape[1]
    mlp = MLP(representation_dim, args.hidden_dim, num_labels, args.num_layers).to(device)
    optimizer = torch.optim.AdamW(
        list(model.parameters()) + list(mlp.parameters()),
        lr=args.lr,
        weight_decay=args.wd,
    )
    loss_fn = torch.nn.CrossEntropyLoss()

    def evaluate(loader: Any) -> tuple[float, list[dict[str, Any]]]:
        model.eval()
        mlp.eval()
        rows = []
        correct = 0
        total = 0
        with torch.no_grad():
            for index_batch in loader:
                label_indices = index_batch.to(device)
                representations = model(
                    [point_clouds[index].to(device) for index in index_batch], args.sigma
                )
                logits = mlp(representations)
                probabilities = torch.softmax(logits, dim=1)
                predictions = torch.argmax(logits, dim=1)
                true_labels = labels_tensor[label_indices]
                correct += int(torch.sum(predictions == true_labels).detach().cpu().item())
                total += len(index_batch)
                for position, sample_index in enumerate(index_batch.detach().cpu().tolist()):
                    probability_values = probabilities[position].detach().cpu().tolist()
                    predicted_label = int(predictions[position].detach().cpu().item())
                    true_label = int(labels_tensor[sample_index].detach().cpu().item())
                    rows.append(
                        {
                            "sample_index": sample_index,
                            "sample_id": patient_ids[sample_index],
                            "true_label": true_label,
                            "predicted_label": predicted_label,
                            "probability_0": probability_values[0],
                            "probability_1": probability_values[1],
                            "correct": int(predicted_label == true_label),
                        }
                    )
        return (correct * 100.0) / total, rows

    epoch_rows: list[dict[str, Any]] = []
    best_accuracy, best_test_rows = evaluate(test_loader)
    best_epoch = 0
    checkpoint_path = args.output_dir / "best_checkpoint.pt"

    def save_checkpoint() -> None:
        torch.save(
            {
                "epoch": best_epoch,
                "model_state_dict": model.state_dict(),
                "mlp_state_dict": mlp.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "best_test_accuracy_percent": best_accuracy,
                "run_id": selected_run["run_id"],
                "seed": selected_run["seed"],
                "train_indices": train_indices,
                "test_indices": test_indices,
                "parameters": vars(args),
                "upstream_commit": upstream["commit"],
            },
            checkpoint_path,
        )

    save_checkpoint()
    epoch_rows.append(
        {
            "epoch": 0,
            "train_loss": "",
            "train_accuracy_percent": "",
            "test_accuracy_percent": best_accuracy,
            "best_test_accuracy_percent": best_accuracy,
            "epoch_seconds": 0.0,
        }
    )

    for epoch in range(1, args.num_epochs + 1):
        epoch_clock = time.perf_counter()
        correct_train = 0
        train_loss = 0.0
        model.train()
        mlp.train()
        for index_batch in train_loader:
            optimizer.zero_grad()
            representations = model(
                [point_clouds[index].to(device) for index in index_batch], args.sigma
            )
            logits = mlp(representations)
            predictions = torch.argmax(logits, dim=1)
            label_indices = index_batch.to(device)
            correct_train += int(
                torch.sum(predictions == labels_tensor[label_indices]).detach().cpu().item()
            )
            # Preserve the released classification script's 100x loss scaling.
            loss = loss_fn(logits, labels_tensor[label_indices]) * 100
            loss.backward()
            optimizer.step()
            train_loss += float(loss.detach().cpu().item())
            del representations, logits, predictions, loss
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            if device == "mps":
                torch.mps.empty_cache()
            gc.collect()

        train_accuracy = (correct_train * 100.0) / len(train_indices)
        test_accuracy, test_rows = evaluate(test_loader)
        if test_accuracy > best_accuracy:
            best_accuracy = test_accuracy
            best_epoch = epoch
            best_test_rows = test_rows
            save_checkpoint()
        epoch_rows.append(
            {
                "epoch": epoch,
                "train_loss": train_loss,
                "train_accuracy_percent": train_accuracy,
                "test_accuracy_percent": test_accuracy,
                "best_test_accuracy_percent": best_accuracy,
                "epoch_seconds": time.perf_counter() - epoch_clock,
            }
        )
        print(
            f"epoch={epoch} loss={train_loss:.6f} train_acc={train_accuracy:.4f} "
            f"test_acc={test_accuracy:.4f} best_acc={best_accuracy:.4f}"
        )

    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    mlp.load_state_dict(checkpoint["mlp_state_dict"])
    selected_train_accuracy, selected_train_rows = evaluate(train_eval_loader)
    selected_test_accuracy, selected_test_rows = evaluate(test_loader)
    if abs(selected_test_accuracy - best_accuracy) > 1e-9:
        raise RuntimeError("Reloaded checkpoint accuracy differs from the selected best accuracy")

    predictions = []
    for subset, rows in (("train", selected_train_rows), ("test", selected_test_rows)):
        for row in rows:
            predictions.append(
                {
                    "run_id": selected_run["run_id"],
                    "seed": selected_run["seed"],
                    "selected_epoch": best_epoch,
                    "subset": subset,
                    **row,
                }
            )

    epochs_path = args.output_dir / "epochs.csv"
    predictions_path = args.output_dir / "predictions.csv"
    write_csv(
        epochs_path,
        [
            "epoch",
            "train_loss",
            "train_accuracy_percent",
            "test_accuracy_percent",
            "best_test_accuracy_percent",
            "epoch_seconds",
        ],
        epoch_rows,
    )
    write_csv(
        predictions_path,
        [
            "run_id",
            "seed",
            "selected_epoch",
            "subset",
            "sample_index",
            "sample_id",
            "true_label",
            "predicted_label",
            "probability_0",
            "probability_1",
            "correct",
        ],
        predictions,
    )

    deviations = protocol_deviations(args)
    installed_torch_version = torch.__version__.split("+", maxsplit=1)[0]
    if installed_torch_version != EXPECTED_TORCH_VERSION:
        deviations["torch_version"] = {
            "faithful": EXPECTED_TORCH_VERSION,
            "actual": torch.__version__,
        }
    if platform.system() != "Linux":
        deviations["operating_system"] = {
            "faithful": "Linux",
            "actual": platform.platform(),
        }
    result = {
        "schema_version": 1,
        "arc_stage": "replicate",
        "protocol": "closest-recoverable-published-procedure",
        "protocol_status": "faithful-target" if not deviations else "deviated-or-smoke",
        "deviations": deviations,
        "paper_result": manifest["published_evaluation"],
        "run": {
            "run_id": selected_run["run_id"],
            "seed": selected_run["seed"],
            "best_epoch": best_epoch,
            "best_test_accuracy_percent": best_accuracy,
            "selected_train_accuracy_percent": selected_train_accuracy,
            "train_count": len(train_indices),
            "test_count": len(test_indices),
            "started_at_unix": started_at,
            "runtime_seconds": time.perf_counter() - started_clock,
        },
        "parameters": {
            "num_weights": args.num_weights,
            "threshold": args.threshold,
            "sigma": args.sigma,
            "K": args.K,
            "wavelet_scales_J": 3,
            "graph_features": args.graph_features,
            "representation_dim": representation_dim,
            "hidden_dim": args.hidden_dim,
            "num_layers": args.num_layers,
            "learning_rate": args.lr,
            "weight_decay": args.wd,
            "epochs": args.num_epochs,
            "batch_size": args.batch_size,
            "loss_multiplier": 100,
            "selection": "best test-set accuracy observed at epoch 0 through final epoch",
        },
        "representation": representation,
        "inputs": {
            "manifest": {"path": str(args.manifest.resolve()), "sha256": sha256(args.manifest)},
            "splits": {"path": str(args.splits.resolve()), "sha256": sha256(args.splits)},
            "data_provenance": {
                "path": str((args.data_dir / "provenance.json").resolve()),
                "sha256": sha256(args.data_dir / "provenance.json"),
            },
        },
        "upstream": upstream,
        "environment": {
            "python": sys.version,
            "platform": platform.platform(),
            "torch": torch.__version__,
            "device": device,
            "cuda_available": torch.cuda.is_available(),
            "cuda_version": torch.version.cuda,
            "cudnn_version": torch.backends.cudnn.version(),
            "gpu_names": [
                torch.cuda.get_device_name(index)
                for index in range(torch.cuda.device_count())
            ],
            "mps_built": torch.backends.mps.is_built(),
            "mps_available": torch.backends.mps.is_available(),
            "pytorch_enable_mps_fallback": os.environ.get("PYTORCH_ENABLE_MPS_FALLBACK"),
            "cuda_visible_devices": os.environ.get("CUDA_VISIBLE_DEVICES"),
            "slurm_job_id": os.environ.get("SLURM_JOB_ID"),
        },
        "outputs": {
            "checkpoint": {
                "path": checkpoint_path.name,
                "sha256": sha256(checkpoint_path),
                "license": "Yale Non-Commercial License",
            },
            "epochs": {"path": epochs_path.name, "sha256": sha256(epochs_path)},
            "predictions": {
                "path": predictions_path.name,
                "sha256": sha256(predictions_path),
            },
        },
        "evidence_warning": (
            "The split and seed are Foundry-authored because the paper's five assignments are "
            "unpublished. The pinned source dispatches K=1 to diffusion-only features even though "
            "the paper's headline model uses scattering features; the selected representation arm "
            "is recorded explicitly. Test-selected best accuracy is retained only to reproduce the "
            "released procedure and is not a leakage-safe performance estimate."
        ),
    }
    result_path = args.output_dir / "run.json"
    with result_path.open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2, default=str)
        handle.write("\n")
    print(json.dumps(result, indent=2, default=str))
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hiponet-root", required=True, type=Path)
    parser.add_argument("--data-dir", required=True, type=Path)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--splits", type=Path, default=DEFAULT_SPLITS)
    parser.add_argument("--expected-commit", default=EXPECTED_COMMIT)
    parser.add_argument("--num-weights", type=int, default=4)
    parser.add_argument("--threshold", type=float, default=0.5)
    parser.add_argument("--sigma", type=float, default=1.0)
    parser.add_argument("--K", type=int, default=1)
    parser.add_argument("--hidden-dim", type=int, default=256)
    parser.add_argument("--num-layers", type=int, default=3)
    parser.add_argument("--lr", type=float, default=0.0001)
    parser.add_argument("--wd", type=float, default=0.0001)
    parser.add_argument("--num-epochs", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument(
        "--graph-features",
        choices=("released-diffusion", "paper-wavelet"),
        default="released-diffusion",
        help=(
            "Use the pinned K=1 source dispatch or redirect it to the full scattering "
            "implementation already present in that source"
        ),
    )
    parser.add_argument("--device", choices=("cuda", "cpu", "mps"), default="cuda")
    parser.add_argument(
        "--max-cells",
        type=int,
        help="Truncate each cloud for a smoke run; marks the result as deviated-or-smoke",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run(args)


if __name__ == "__main__":
    main()
