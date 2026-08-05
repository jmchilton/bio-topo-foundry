import argparse
import csv
import json
import pickle
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import generate_faithful_splits as split_subject  # noqa: E402
import aggregate_faithful_runs as aggregate_subject  # noqa: E402
import run_faithful as run_subject  # noqa: E402
import verify_legacy_artifacts as forensic_subject  # noqa: E402


class ForensicArtifactContractTest(unittest.TestCase):
    def test_manifest_closes_each_requested_artifact_without_overclaiming(self):
        manifest = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
        evidence = manifest["artifact_forensics"]

        self.assertEqual(evidence["status"], "closed without author contact")
        self.assertTrue(
            evidence["point_cloud_reconstruction"]["status"].startswith("resolved:")
        )
        self.assertEqual(
            evidence["point_cloud_reconstruction"]["observed_maximum_absolute_error"],
            1.6653345369377348e-16,
        )
        self.assertEqual(evidence["label_reconstruction"]["binary_label_mismatches"], 0)
        self.assertEqual(evidence["label_reconstruction"]["response_multi_mismatches"], 0)
        self.assertEqual(
            evidence["seed_and_split_recovery"]["status"],
            "closed as forensically unrecoverable",
        )
        self.assertIn(
            "not recovered paper seeds",
            manifest["reproduction_execution"]["split_contract"]["seed_origin"],
        )

    def test_legacy_clinical_parser_preserves_unlabeled_out_of_cohort_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "clinical.csv"
            path.write_text(
                "376_1_row,376_1_col,RESPONSE,BEST_RESPONSE_BY_SCAN\n"
                "2,10,YES,CR\n"
                "6,1,, \n",
                encoding="utf-8",
            )

            labels = forensic_subject.read_legacy_labels(path)

        self.assertEqual(labels["R10C2"], (1, "CR"))
        self.assertEqual(labels["R1C6"], (None, ""))


class FaithfulSplitContractTest(unittest.TestCase):
    def test_checked_in_contract_is_the_deterministic_generator_output(self):
        expected = split_subject.generate_contract(HERE / "manifest.json")
        actual = json.loads((HERE / "faithful_splits.json").read_text(encoding="utf-8"))

        self.assertEqual(actual, expected)
        self.assertEqual(len(actual["runs"]), 5)
        for run in actual["runs"]:
            self.assertEqual(len(run["train"]), 43)
            self.assertEqual(len(run["test"]), 11)
            indices = [record["sample_index"] for record in run["train"] + run["test"]]
            self.assertEqual(set(indices), set(range(54)))
            self.assertEqual(len(indices), len(set(indices)))

        self.assertEqual(
            [record["sample_id"] for record in actual["runs"][0]["test"]],
            [
                "R9C4",
                "R5C4",
                "R8C4",
                "R4C1",
                "R12C4",
                "R10C4",
                "R5C3",
                "R7C3",
                "R8C1",
                "R4C5",
                "R11C1",
            ],
        )

    def test_generator_rejects_duplicate_seeds(self):
        with self.assertRaisesRegex(ValueError, "Seeds must be unique"):
            split_subject.generate_contract(HERE / "manifest.json", seeds=(0, 0))


class FaithfulRunnerContractTest(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        self.data_dir = self.root / "melanoma_data_full"
        self.data_dir.mkdir()
        with (self.data_dir / "patient_list_full.pkl").open("wb") as handle:
            pickle.dump(["S1", "S2", "S3"], handle)
        np.save(
            self.data_dir / "labels_full.npy",
            np.asarray([0, 1, 0], dtype=np.int64),
            allow_pickle=False,
        )

    def tearDown(self):
        self.temporary_directory.cleanup()

    def test_prepared_identity_and_split_membership_round_trip(self):
        patient_ids, labels = run_subject.load_prepared_identity(self.data_dir)
        run = {
            "train": [
                {"sample_index": 2, "sample_id": "S3", "response_binary": 0},
                {"sample_index": 0, "sample_id": "S1", "response_binary": 0},
            ],
            "test": [
                {"sample_index": 1, "sample_id": "S2", "response_binary": 1},
            ],
        }

        train, test = run_subject.validate_run_membership(run, patient_ids, labels)

        self.assertEqual(train, [2, 0])
        self.assertEqual(test, [1])

    def test_split_membership_rejects_a_reconstructed_label_mismatch(self):
        patient_ids, labels = run_subject.load_prepared_identity(self.data_dir)
        run = {
            "train": [
                {"sample_index": 0, "sample_id": "S1", "response_binary": 1},
                {"sample_index": 2, "sample_id": "S3", "response_binary": 0},
            ],
            "test": [
                {"sample_index": 1, "sample_id": "S2", "response_binary": 1},
            ],
        }

        with self.assertRaisesRegex(ValueError, "label does not match"):
            run_subject.validate_run_membership(run, patient_ids, labels)

    def test_non_faithful_parameters_are_labeled_as_deviations(self):
        args = argparse.Namespace(
            num_weights=4,
            threshold=0.5,
            sigma=1.0,
            K=1,
            hidden_dim=256,
            num_layers=3,
            lr=0.0001,
            wd=0.0001,
            num_epochs=1,
            batch_size=32,
            graph_features="released-diffusion",
            device="cpu",
            max_cells=60,
        )

        deviations = run_subject.protocol_deviations(args)

        self.assertEqual(set(deviations), {"epochs", "device", "max_cells"})

    def test_paper_wavelet_arm_redirects_only_the_feature_dispatch(self):
        class FakeGraphWaveletTransform:
            def diffusion_only(self):
                return "diffusion"

            def generate_timepoint_features(self):
                return "wavelet"

        metadata = run_subject.configure_graph_features(
            "paper-wavelet", FakeGraphWaveletTransform
        )

        self.assertEqual(FakeGraphWaveletTransform().diffusion_only(), "wavelet")
        self.assertEqual(
            metadata["dispatched_method"],
            "GraphWaveletTransform.generate_timepoint_features",
        )
        self.assertIn("redirect", metadata["source_intervention"])


class FaithfulAggregationTest(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)

    def tearDown(self):
        self.temporary_directory.cleanup()

    def _write_run(self, seed, correct_test):
        run_dir = self.root / f"faithful-seed-{seed}"
        run_dir.mkdir()
        checkpoint = run_dir / "best_checkpoint.pt"
        epochs = run_dir / "epochs.csv"
        predictions = run_dir / "predictions.csv"
        checkpoint.write_bytes(b"test checkpoint")
        epochs.write_text("epoch,test_accuracy_percent\n7,90.0\n", encoding="utf-8")

        fieldnames = [
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
        ]
        with predictions.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            for index in range(54):
                subset = "train" if index < 43 else "test"
                test_position = index - 43
                correct = 1 if subset == "train" or test_position < correct_test else 0
                writer.writerow(
                    {
                        "run_id": f"faithful-seed-{seed}",
                        "seed": seed,
                        "selected_epoch": 7,
                        "subset": subset,
                        "sample_index": index,
                        "sample_id": f"S{index}",
                        "true_label": index % 2,
                        "predicted_label": index % 2 if correct else 1 - (index % 2),
                        "probability_0": 0.75,
                        "probability_1": 0.25,
                        "correct": correct,
                    }
                )

        accuracy = 100.0 * correct_test / 11
        report = {
            "schema_version": 1,
            "protocol": "closest-recoverable-published-procedure",
            "protocol_status": "faithful-target",
            "deviations": {},
            "paper_result": {"mean": 90.9, "standard_deviation": 4.92},
            "run": {
                "run_id": f"faithful-seed-{seed}",
                "seed": seed,
                "best_epoch": 7,
                "best_test_accuracy_percent": accuracy,
                "selected_train_accuracy_percent": 100.0,
                "train_count": 43,
                "test_count": 11,
                "runtime_seconds": 12.0,
            },
            "parameters": {"epochs": 100, "num_weights": 4},
            "inputs": {
                "manifest": {"sha256": "manifest-sha"},
                "splits": {"sha256": "splits-sha"},
            },
            "upstream": {"commit": "commit", "uv_lock_sha256": "lock-sha"},
            "outputs": {
                "checkpoint": {
                    "path": checkpoint.name,
                    "sha256": aggregate_subject.sha256(checkpoint),
                },
                "epochs": {
                    "path": epochs.name,
                    "sha256": aggregate_subject.sha256(epochs),
                },
                "predictions": {
                    "path": predictions.name,
                    "sha256": aggregate_subject.sha256(predictions),
                },
            },
        }
        run_json = run_dir / "run.json"
        run_json.write_text(json.dumps(report), encoding="utf-8")
        return run_json

    def test_aggregates_exactly_five_comparable_runs(self):
        paths = [self._write_run(seed, correct_test=7 + seed) for seed in range(5)]

        summary, run_rows, predictions = aggregate_subject.aggregate(paths)

        self.assertTrue(summary["complete_five_run_contract"])
        self.assertEqual(summary["run_count"], 5)
        self.assertEqual(len(run_rows), 5)
        self.assertEqual(len(predictions), 270)
        self.assertAlmostEqual(
            summary["accuracy_percent"]["mean"],
            sum(100.0 * correct / 11 for correct in range(7, 12)) / 5,
        )
        self.assertEqual(
            len(summary["baseline_diagnostics"]["balanced_accuracy_percent_values"]),
            5,
        )
        self.assertIn("majority_accuracy_percent", run_rows[0])

    def test_binary_diagnostics_expose_majority_and_balanced_accuracy(self):
        rows = [
            {"true_label": "0", "predicted_label": "0"},
            {"true_label": "0", "predicted_label": "0"},
            {"true_label": "1", "predicted_label": "0"},
            {"true_label": "1", "predicted_label": "1"},
        ]

        metrics = aggregate_subject.binary_metrics(rows)

        self.assertEqual(metrics["accuracy_percent"], 75.0)
        self.assertEqual(metrics["majority_accuracy_percent"], 50.0)
        self.assertEqual(metrics["balanced_accuracy_percent"], 75.0)
        self.assertEqual(metrics["predicted_class_1_count"], 1)

    def test_rejects_a_tampered_output(self):
        path = self._write_run(0, correct_test=9)
        with (path.parent / "predictions.csv").open("a", encoding="utf-8") as handle:
            handle.write("tampered\n")

        with self.assertRaisesRegex(ValueError, "checksum mismatch"):
            aggregate_subject.validate_run(path)


if __name__ == "__main__":
    unittest.main()
