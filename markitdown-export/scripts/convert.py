#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from shutil import which


def default_output_path(source: Path) -> Path:
    return source.with_suffix(".md")


def ask_overwrite(path: Path) -> bool:
    while True:
        answer = input(f"{path} already exists. Overwrite? [y/N] ").strip().lower()
        if answer in {"y", "yes"}:
            return True
        if answer in {"", "n", "no"}:
            return False
        print("Please answer y or n.")


def run_markitdown(source: Path, output: Path) -> int:
    binary = which("markitdown")
    if binary:
        command = [binary, str(source), "-o", str(output)]
        completed = subprocess.run(command, check=False)
        if completed.returncode == 0:
            print(output)
        return completed.returncode

    candidates = []
    if sys.version_info >= (3, 10):
        candidates.append(sys.executable)

    for candidate in (
        which("python3.13"),
        which("python3.12"),
        which("python3.11"),
        which("python3.10"),
        which("python3"),
    ):
        if candidate and candidate not in candidates:
            candidates.append(candidate)

    if not candidates:
        print("Unable to find a Python interpreter that can run MarkItDown.", file=sys.stderr)
        return 1

    last_returncode = 1
    for python in candidates:
        command = [python, "-m", "markitdown", str(source), "-o", str(output)]
        completed = subprocess.run(command, check=False)
        last_returncode = completed.returncode
        if last_returncode == 0:
            print(output)
            return 0

    return last_returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert a supported file to Markdown next to the source file."
    )
    parser.add_argument("source", help="Source file path")
    parser.add_argument(
        "-o",
        "--output",
        help="Optional output file path. Defaults to the source file with a .md suffix.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite an existing output file without prompting.",
    )
    args = parser.parse_args()

    source = Path(args.source).expanduser().resolve()
    if not source.exists():
        print(f"Source file not found: {source}", file=sys.stderr)
        return 1
    if not source.is_file():
        print(f"Source path is not a file: {source}", file=sys.stderr)
        return 1

    output = Path(args.output).expanduser().resolve() if args.output else default_output_path(source)
    output.parent.mkdir(parents=True, exist_ok=True)

    if output.exists() and not args.overwrite:
        if not sys.stdin.isatty():
            print(
                f"Refusing to overwrite existing file in non-interactive mode: {output}",
                file=sys.stderr,
            )
            return 2
        if not ask_overwrite(output):
            print("Aborted.", file=sys.stderr)
            return 2

    return run_markitdown(source, output)


if __name__ == "__main__":
    raise SystemExit(main())
