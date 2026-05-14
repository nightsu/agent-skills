#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from importlib import metadata
from urllib.error import URLError
from urllib.request import urlopen


PYPI_JSON_URL = "https://pypi.org/pypi/markitdown/json"


def version_parts(version: str) -> tuple[int, ...]:
    return tuple(int(part) for part in re.findall(r"\d+", version))


def version_state(local_version: str, latest_version: str) -> str:
    if version_parts(local_version) < version_parts(latest_version):
        return "update-available"
    return "current"


def upgrade_commands() -> list[str]:
    return [
        'pipx upgrade markitdown --include-injected',
        'python3 -m pip install --user -U "markitdown[all]"',
    ]


def installed_version() -> str | None:
    try:
        return metadata.version("markitdown")
    except metadata.PackageNotFoundError:
        return None


def latest_pypi_version() -> str:
    with urlopen(PYPI_JSON_URL, timeout=10) as response:
        payload = json.load(response)
    return str(payload["info"]["version"])


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check whether the local Microsoft MarkItDown package should be updated."
    )
    parser.add_argument(
        "--latest-version",
        help="Use a known latest version instead of querying PyPI. Useful for offline checks.",
    )
    args = parser.parse_args()

    local_version = installed_version()
    if local_version is None:
        print("markitdown is not installed.")
        print("Install with:")
        print('  pipx install "markitdown[all]"')
        print('  python3 -m pip install --user -U "markitdown[all]"')
        return 2

    try:
        latest_version = args.latest_version or latest_pypi_version()
    except (OSError, URLError, KeyError, TimeoutError) as exc:
        print(f"Unable to check PyPI for the latest markitdown version: {exc}", file=sys.stderr)
        print(f"Installed markitdown version: {local_version}")
        return 1

    state = version_state(local_version, latest_version)
    print(f"Installed markitdown version: {local_version}")
    print(f"Latest PyPI markitdown version: {latest_version}")

    if state == "update-available":
        print("Update available. Upgrade explicitly, then run conversion regressions:")
        for command in upgrade_commands():
            print(f"  {command}")
        return 10

    print("Local markitdown is current.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
