from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "convert.py"


def load_module():
    if not SCRIPT_PATH.exists():
        raise AssertionError(f"missing convert script: {SCRIPT_PATH}")
    spec = importlib.util.spec_from_file_location("convert", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise AssertionError("unable to load convert module")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class ConvertScriptTest(unittest.TestCase):
    def setUp(self) -> None:
        self.module = load_module()
        self.tempdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tempdir.cleanup)
        self.root = Path(self.tempdir.name)

    def make_file(self, name: str, content: str = "content") -> Path:
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def test_default_output_path_replaces_suffix_with_md(self) -> None:
        source = self.root / "report.final.docx"

        self.assertEqual(
            self.module.default_output_path(source),
            self.root / "report.final.md",
        )

    def test_build_markitdown_args_includes_local_options(self) -> None:
        options = self.module.MarkitdownOptions(
            use_plugins=True,
            keep_data_uris=True,
            extension="pdf",
            mime_type="application/pdf",
            charset="utf-8",
        )

        args = self.module.build_markitdown_args(
            self.root / "input.bin",
            self.root / "input.md",
            options,
        )

        self.assertEqual(
            args,
            [
                str(self.root / "input.bin"),
                "-o",
                str(self.root / "input.md"),
                "--use-plugins",
                "--keep-data-uris",
                "--extension",
                "pdf",
                "--mime-type",
                "application/pdf",
                "--charset",
                "utf-8",
            ],
        )

    def test_run_markitdown_prefers_binary_when_available(self) -> None:
        source = self.make_file("input.pdf")
        output = self.root / "input.md"
        options = self.module.MarkitdownOptions(use_plugins=True)
        completed = mock.Mock(returncode=0)

        with (
            mock.patch.object(self.module, "which", return_value="/usr/local/bin/markitdown"),
            mock.patch.object(self.module.subprocess, "run", return_value=completed) as run,
            mock.patch("builtins.print") as printed,
        ):
            code = self.module.run_markitdown(source, output, options)

        self.assertEqual(code, 0)
        run.assert_called_once_with(
            [
                "/usr/local/bin/markitdown",
                str(source),
                "-o",
                str(output),
                "--use-plugins",
            ],
            check=False,
        )
        printed.assert_called_once_with(output)

    def test_run_markitdown_falls_back_to_python_module(self) -> None:
        source = self.make_file("input.pdf")
        output = self.root / "input.md"
        options = self.module.MarkitdownOptions(keep_data_uris=True)
        completed = mock.Mock(returncode=0)

        def fake_which(name: str) -> str | None:
            if name == "python3.12":
                return "/usr/local/bin/python3.12"
            return None

        with (
            mock.patch.object(self.module, "which", side_effect=fake_which),
            mock.patch.object(self.module.sys, "version_info", (3, 9, 0)),
            mock.patch.object(self.module.subprocess, "run", return_value=completed) as run,
            mock.patch("builtins.print"),
        ):
            code = self.module.run_markitdown(source, output, options)

        self.assertEqual(code, 0)
        run.assert_called_once_with(
            [
                "/usr/local/bin/python3.12",
                "-m",
                "markitdown",
                str(source),
                "-o",
                str(output),
                "--keep-data-uris",
            ],
            check=False,
        )

    def test_main_rejects_missing_source(self) -> None:
        missing = self.root / "missing.pdf"

        with mock.patch.object(sys, "argv", ["convert.py", str(missing)]):
            code = self.module.main()

        self.assertEqual(code, 1)

    def test_main_rejects_directory_source(self) -> None:
        source_dir = self.root / "source-dir"
        source_dir.mkdir()

        with mock.patch.object(sys, "argv", ["convert.py", str(source_dir)]):
            code = self.module.main()

        self.assertEqual(code, 1)

    def test_main_refuses_noninteractive_overwrite(self) -> None:
        source = self.make_file("input.pdf")
        output = self.make_file("input.md", "existing")

        with (
            mock.patch.object(sys, "argv", ["convert.py", str(source)]),
            mock.patch.object(self.module.sys.stdin, "isatty", return_value=False),
            mock.patch.object(self.module, "run_markitdown") as run,
        ):
            code = self.module.main()

        self.assertEqual(code, 2)
        run.assert_not_called()
        self.assertEqual(output.read_text(encoding="utf-8"), "existing")

    def test_main_overwrite_skips_prompt_and_passes_options(self) -> None:
        source = self.make_file("input.bin")
        output = self.make_file("input.md", "existing")

        with (
            mock.patch.object(
                sys,
                "argv",
                [
                    "convert.py",
                    str(source),
                    "--overwrite",
                    "--extension",
                    "pdf",
                    "--mime-type",
                    "application/pdf",
                    "--charset",
                    "utf-8",
                    "--use-plugins",
                    "--keep-data-uris",
                ],
            ),
            mock.patch.object(self.module, "ask_overwrite") as ask,
            mock.patch.object(self.module, "run_markitdown", return_value=0) as run,
        ):
            code = self.module.main()

        self.assertEqual(code, 0)
        ask.assert_not_called()
        run.assert_called_once()
        called_source, called_output, called_options = run.call_args.args
        self.assertEqual(called_source, source.resolve())
        self.assertEqual(called_output, output.resolve())
        self.assertEqual(
            called_options,
            self.module.MarkitdownOptions(
                use_plugins=True,
                keep_data_uris=True,
                extension="pdf",
                mime_type="application/pdf",
                charset="utf-8",
            ),
        )


if __name__ == "__main__":
    unittest.main()
