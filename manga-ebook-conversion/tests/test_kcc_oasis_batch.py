import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "kcc_oasis_batch.py"
spec = importlib.util.spec_from_file_location("kcc_oasis_batch", SCRIPT_PATH)
kcc_oasis_batch = importlib.util.module_from_spec(spec)
sys.modules["kcc_oasis_batch"] = kcc_oasis_batch
spec.loader.exec_module(kcc_oasis_batch)


class BatchPlanningTests(unittest.TestCase):
    def test_existing_epub_is_used_as_source_and_oasis_name_is_reserved(self):
        files = {
            "死神 (23).epub": b"epub",
            "死神 (23).mobi": b"mobi",
        }
        with kcc_oasis_batch.temporary_series(files) as series_dir:
            plan = kcc_oasis_batch.plan_volume(series_dir, 23, "死神")

        self.assertEqual(plan.source.name, "死神 (23).epub")
        self.assertEqual(plan.final_output.name, "死神 (23)_oasis.epub")
        self.assertFalse(plan.needs_calibre)

    def test_mobi_only_volume_uses_temporary_calibre_source(self):
        files = {"死神 (18).mobi": b"mobi"}
        with kcc_oasis_batch.temporary_series(files) as series_dir:
            plan = kcc_oasis_batch.plan_volume(series_dir, 18, "死神")

        self.assertEqual(plan.source.name, "死神 (18).mobi")
        self.assertEqual(plan.calibre_output.name, "死神 (18)-calibre.epub")
        self.assertTrue(plan.needs_calibre)

    def test_missing_volume_is_rejected(self):
        with kcc_oasis_batch.temporary_series({}) as series_dir:
            with self.assertRaises(FileNotFoundError):
                kcc_oasis_batch.plan_volume(series_dir, 99, "死神")


class CommandTests(unittest.TestCase):
    def test_default_kcc_command_uses_kcc_oasis(self):
        command = kcc_oasis_batch.build_kcc_command(
            source=Path("/tmp/死神 (23).epub"),
            output_dir=Path("/tmp/out"),
            profile="oasis",
            output_format="EPUB",
            no_manga=False,
        )

        self.assertEqual(
            command,
            [
                "kcc-oasis",
                "--profile",
                "oasis",
                "--format",
                "EPUB",
                "--output",
                "/tmp/out",
                "/tmp/死神 (23).epub",
            ],
        )

    def test_no_manga_flag_is_forwarded(self):
        command = kcc_oasis_batch.build_kcc_command(
            source=Path("/tmp/死神 (23).epub"),
            output_dir=Path("/tmp/out"),
            profile="paperwhite34",
            output_format="MOBI",
            no_manga=True,
        )

        self.assertIn("--no-manga", command)
        self.assertIn("paperwhite34", command)
        self.assertIn("MOBI", command)

    def test_missing_ebook_convert_is_reported_when_mobi_input_requires_it(self):
        missing = kcc_oasis_batch.missing_required_commands(needs_calibre=True, lookup=lambda command: None)

        self.assertEqual(missing, ["kcc-oasis", "ebook-convert"])

    def test_ebook_convert_is_not_required_for_epub_only_batches(self):
        def lookup(command):
            return f"/usr/bin/{command}" if command == "kcc-oasis" else None

        missing = kcc_oasis_batch.missing_required_commands(needs_calibre=False, lookup=lookup)

        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
