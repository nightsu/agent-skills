#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
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


@dataclass(frozen=True)
class MarkitdownOptions:
    use_plugins: bool = False
    keep_data_uris: bool = False
    extension: str | None = None
    mime_type: str | None = None
    charset: str | None = None


def build_markitdown_args(
    source: Path,
    output: Path,
    options: MarkitdownOptions,
) -> list[str]:
    args = [str(source), "-o", str(output)]
    if options.use_plugins:
        args.append("--use-plugins")
    if options.keep_data_uris:
        args.append("--keep-data-uris")
    if options.extension:
        args.extend(["--extension", options.extension])
    if options.mime_type:
        args.extend(["--mime-type", options.mime_type])
    if options.charset:
        args.extend(["--charset", options.charset])
    return args


def run_markitdown(source: Path, output: Path, options: MarkitdownOptions) -> int:
    markitdown_args = build_markitdown_args(source, output, options)
    binary = which("markitdown")
    if binary:
        command = [binary, *markitdown_args]
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
        command = [python, "-m", "markitdown", *markitdown_args]
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
    parser.add_argument(
        "--use-plugins",
        action="store_true",
        help="Enable installed MarkItDown plugins for this conversion.",
    )
    parser.add_argument(
        "--keep-data-uris",
        action="store_true",
        help="Keep data URIs in Markdown output instead of truncating them.",
    )
    parser.add_argument(
        "--extension",
        help="Optional file extension hint for MarkItDown, such as pdf or .pdf.",
    )
    parser.add_argument(
        "--mime-type",
        help="Optional MIME type hint for MarkItDown, such as application/pdf.",
    )
    parser.add_argument(
        "--charset",
        help="Optional charset hint for MarkItDown, such as utf-8.",
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

    options = MarkitdownOptions(
        use_plugins=args.use_plugins,
        keep_data_uris=args.keep_data_uris,
        extension=args.extension,
        mime_type=args.mime_type,
        charset=args.charset,
    )

    return run_markitdown(source, output, options)


if __name__ == "__main__":
    raise SystemExit(main())
