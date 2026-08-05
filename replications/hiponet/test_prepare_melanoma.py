import csv
import json
import pickle
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np


sys.path.insert(0, str(Path(__file__).resolve().parent))
import prepare_melanoma as subject  # noqa: E402


class PrepareMelanomaTest(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        self.protein_csv = self.root / "cell_protein_data.csv"
        self.patient_csv = self.root / "patient_info.csv"
        self.manifest_path = self.root / "manifest.json"
        self.output_dir = self.root / "melanoma_data_full"

        with self.protein_csv.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["id", "marker-a", "marker-b"])
            writer.writerow(["S1", "1.0", "2.0"])
            writer.writerow(["S2", "3.0", "4.0"])
            writer.writerow(["S2", "5.0", "6.0"])

        with self.patient_csv.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(
                [
                    "id",
                    "age_at_dx_tertile",
                    "dx_stage",
                    "gross_dx_stage",
                    "response_binary",
                    "response_multi",
                ]
            )
            writer.writerow(["S2", "2", "IIIC", "III", "1", "PR"])
            writer.writerow(["S1", "1", "IV", "IV", "0", "PD"])

        manifest = {
            "schema_version": 1,
            "source_dataset": {
                "doi": "10.example/test.1",
                "files": [
                    self._source_record(self.protein_csv),
                    self._source_record(self.patient_csv),
                ],
            },
            "cohort": {
                "cell_count": 3,
                "features": ["marker-a", "marker-b"],
                "samples": [
                    {
                        "sample_id": "S2",
                        "cell_count": 2,
                        "response_binary": 1,
                        "response_multi": "PR",
                    },
                    {
                        "sample_id": "S1",
                        "cell_count": 1,
                        "response_binary": 0,
                        "response_multi": "PD",
                    },
                ],
            },
        }
        self.manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    def tearDown(self):
        self.temporary_directory.cleanup()

    @staticmethod
    def _source_record(path):
        return {
            "filename": path.name,
            "size_bytes": path.stat().st_size,
            "sha256": subject.sha256(path),
        }

    def test_prepares_full_patient_clouds_in_manifest_order(self):
        provenance = subject.prepare(
            self.protein_csv,
            self.patient_csv,
            self.output_dir,
            self.manifest_path,
        )

        with (self.output_dir / "pc_full.pkl").open("rb") as handle:
            point_clouds = pickle.load(handle)
        with (self.output_dir / "patient_list_full.pkl").open("rb") as handle:
            patient_ids = pickle.load(handle)
        labels = np.load(self.output_dir / "labels_full.npy", allow_pickle=False)

        self.assertEqual(patient_ids, ["S2", "S1"])
        np.testing.assert_array_equal(labels, np.asarray([1, 0], dtype=np.int64))
        np.testing.assert_allclose(point_clouds[0], [[3.0, 4.0], [5.0, 6.0]])
        np.testing.assert_allclose(point_clouds[1], [[1.0, 2.0]])
        self.assertEqual(provenance["transform"]["label_column"], "response_binary")
        self.assertTrue((self.output_dir / "samples.csv").is_file())
        self.assertTrue((self.output_dir / "features.csv").is_file())
        self.assertTrue((self.output_dir / "provenance.json").is_file())

    def test_rejects_a_source_that_no_longer_matches_its_pin(self):
        with self.protein_csv.open("a", encoding="utf-8") as handle:
            handle.write("S1,7.0,8.0\n")

        with self.assertRaisesRegex(ValueError, "expected .* bytes"):
            subject.prepare(
                self.protein_csv,
                self.patient_csv,
                self.output_dir,
                self.manifest_path,
            )


if __name__ == "__main__":
    unittest.main()
