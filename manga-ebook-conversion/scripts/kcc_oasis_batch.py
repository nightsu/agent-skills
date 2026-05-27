#!/usr/bin/env python3
from __future__ import annotations

import argparse
import contextlib
import shutil
import subprocess
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class VolumePlan:
    volume: int
    source: Path
    calibre_output: Path
    temp_output_dir: Path
    temp_kcc_output: Path
    final_output: Path

    @property
    def needs_calibre(self) -> bool:
        return self.source.suffix.lower() == ".mobi"


def plan_volume(series_dir: Path, volume: int, prefix: str, work_dir: Path | None = None) -> VolumePlan:
    epub = series_dir / f"{prefix} ({volume}).epub"
    mobi = series_dir / f"{prefix} ({volume}).mobi"

    if epub.exists():
        source = epub
    elif mobi.exists():
        source = mobi
    else:
        raise FileNotFoundError(f"Missing input for volume {volume}: {epub} or {mobi}")

    temp_root = work_dir or Path(tempfile.gettempdir()) / "kcc-oasis-batch"
    calibre_output = temp_root / f"{prefix} ({volume})-calibre.epub"
    temp_output_dir = temp_root / "out"
    temp_kcc_output = temp_output_dir / calibre_output.name if source.suffix.lower() == ".mobi" else temp_output_dir / epub.name
    final_output = series_dir / f"{prefix} ({volume})_oasis.epub"

    return VolumePlan(
        volume=volume,
        source=source,
        calibre_output=calibre_output,
        temp_output_dir=temp_output_dir,
        temp_kcc_output=temp_kcc_output,
        final_output=final_output,
    )


def build_kcc_command(
    *,
    source: Path,
    output_dir: Path,
    profile: str,
    output_format: str,
    no_manga: bool,
) -> list[str]:
    command = [
        "kcc-oasis",
        "--profile",
        profile,
        "--format",
        output_format,
        "--output",
        str(output_dir),
    ]
    if no_manga:
        command.append("--no-manga")
    command.append(str(source))
    return command


def convert_volume(plan: VolumePlan, *, profile: str, output_format: str, no_manga: bool, overwrite: bool) -> None:
    if plan.final_output.exists() and not overwrite:
        raise FileExistsError(f"Refusing to overwrite existing output: {plan.final_output}")

    plan.calibre_output.parent.mkdir(parents=True, exist_ok=True)
    plan.temp_output_dir.mkdir(parents=True, exist_ok=True)
    if plan.temp_kcc_output.exists():
        plan.temp_kcc_output.unlink()

    kcc_source = plan.source
    if plan.needs_calibre:
        run(["ebook-convert", str(plan.source), str(plan.calibre_output)])
        kcc_source = plan.calibre_output

    run(
        build_kcc_command(
            source=kcc_source,
            output_dir=plan.temp_output_dir,
            profile=profile,
            output_format=output_format,
            no_manga=no_manga,
        )
    )

    if not plan.temp_kcc_output.exists():
        candidates = sorted(plan.temp_output_dir.glob("*.epub"))
        if len(candidates) == 1:
            temp_output = candidates[0]
        else:
            raise FileNotFoundError(f"KCC output not found for volume {plan.volume}: {plan.temp_kcc_output}")
    else:
        temp_output = plan.temp_kcc_output

    shutil.move(str(temp_output), str(plan.final_output))
    verify_epub(plan.final_output)


def missing_required_commands(*, needs_calibre: bool, lookup=shutil.which) -> list[str]:
    commands = ["kcc-oasis"]
    if needs_calibre:
        commands.append("ebook-convert")
    return [command for command in commands if lookup(command) is None]


def verify_epub(path: Path) -> None:
    if not path.exists() or path.stat().st_size == 0:
        raise RuntimeError(f"Output is missing or empty: {path}")
    with zipfile.ZipFile(path) as archive:
        bad_file = archive.testzip()
    if bad_file is not None:
        raise RuntimeError(f"EPUB zip check failed at {bad_file}: {path}")


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def main(argv: list[str] | None = None) -> int:
    args = parser().parse_args(argv)
    series_dir = Path(args.series_dir).expanduser().resolve()
    work_dir = Path(args.work_dir).expanduser().resolve() if args.work_dir else None

    plans = [plan_volume(series_dir, volume, args.prefix, work_dir) for volume in range(args.start, args.end + 1)]
    missing = missing_required_commands(needs_calibre=any(plan.needs_calibre for plan in plans))
    if missing:
        print("Missing required command(s): " + ", ".join(missing))
        if "ebook-convert" in missing:
            print("Install Calibre CLI first, for example: brew install --cask calibre")
        if "kcc-oasis" in missing:
            print("Install kcc-oasis first, then confirm: kcc-oasis --dry-run /tmp/example.cbz")
        return 2

    for plan in plans:
        print(f"Converting {plan.volume}: {plan.source.name} -> {plan.final_output.name}")
        convert_volume(
            plan,
            profile=args.profile,
            output_format=args.output_format,
            no_manga=args.no_manga,
            overwrite=args.overwrite,
        )
        print(f"Done {volume}: {plan.final_output}")
    return 0


def parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Batch convert manga ebooks with kcc-oasis.")
    parser.add_argument("series_dir", help="Directory containing files like '死神 (23).epub' or '死神 (23).mobi'.")
    parser.add_argument("start", type=int, help="First volume number.")
    parser.add_argument("end", type=int, help="Last volume number, inclusive.")
    parser.add_argument("--prefix", default="死神", help="Filename prefix before the volume number. Default: 死神.")
    parser.add_argument("--profile", default="oasis", help="kcc-oasis profile. Default: oasis.")
    parser.add_argument("--format", dest="output_format", default="EPUB", help="kcc-oasis output format. Default: EPUB.")
    parser.add_argument("--no-manga", action="store_true", help="Disable kcc-oasis manga right-to-left mode.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing *_oasis.epub outputs.")
    parser.add_argument("--work-dir", help="Temporary working directory. Default: system temp directory.")
    return parser


@contextlib.contextmanager
def temporary_series(files: dict[str, bytes]):
    with tempfile.TemporaryDirectory() as tmp:
        directory = Path(tmp)
        for name, content in files.items():
            (directory / name).write_bytes(content)
        yield directory


if __name__ == "__main__":
    raise SystemExit(main())
