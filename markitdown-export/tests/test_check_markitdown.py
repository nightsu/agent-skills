from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "check_markitdown.py"


def load_module():
    if not SCRIPT_PATH.exists():
        raise AssertionError(f"missing update check script: {SCRIPT_PATH}")
    spec = importlib.util.spec_from_file_location("check_markitdown", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise AssertionError("unable to load check_markitdown module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CheckMarkitdownTest(unittest.TestCase):
    def setUp(self) -> None:
        self.module = load_module()

    def test_version_state_detects_available_update(self) -> None:
        state = self.module.version_state("0.1.2", "0.1.5")

        self.assertEqual(state, "update-available")

    def test_version_state_accepts_matching_or_newer_local_versions(self) -> None:
        self.assertEqual(self.module.version_state("0.1.5", "0.1.5"), "current")
        self.assertEqual(self.module.version_state("0.1.6", "0.1.5"), "current")

    def test_upgrade_commands_cover_pipx_and_pip_fallback(self) -> None:
        commands = self.module.upgrade_commands()

        self.assertIn('pipx upgrade markitdown --include-injected', commands)
        self.assertIn('python3 -m pip install --user -U "markitdown[all]"', commands)
        self.assertNotIn('python3.11 -m pip install --user -U "markitdown[all]"', commands)


if __name__ == "__main__":
    unittest.main()
