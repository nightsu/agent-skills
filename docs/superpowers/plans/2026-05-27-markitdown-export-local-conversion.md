# MarkItDown Export Local Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `markitdown-export` so it accurately documents MarkItDown 0.1.6 local file conversion support and exposes safe local-only CLI passthrough options.

**Architecture:** Keep the skill as a thin local-file wrapper around MarkItDown. Add a small `MarkitdownOptions` data structure and command builder in `scripts/convert.py` so tests can validate command generation without invoking the real converter. Keep cloud, URL, stdin, and credential-based paths out of the wrapper.

**Tech Stack:** Python 3.10+, `argparse`, `unittest`, `unittest.mock`, Markdown skill documentation, YAML interface metadata.

---

## File Structure

- Modify `markitdown-export/scripts/convert.py`
  - Owns local source validation, default output path, overwrite prompting, and safe list-based MarkItDown command construction.
- Create `markitdown-export/tests/test_convert.py`
  - Unit tests for output path behavior, local-only validation, overwrite protection, command construction, and Python fallback.
- Modify `markitdown-export/SKILL.md`
  - User-facing skill instructions and local conversion boundary.
- Modify `markitdown-export/references/maintenance.md`
  - Maintainer checklist for MarkItDown 0.1.6 local converter support and regression coverage.
- Modify `markitdown-export/agents/openai.yaml`
  - Short interface copy only; no behavior lives here.

---

## Task 1: Add Convert Script Tests

**Files:**
- Create: `markitdown-export/tests/test_convert.py`
- Read: `markitdown-export/scripts/convert.py`

- [ ] **Step 1: Create failing tests for local conversion behavior**

Create `markitdown-export/tests/test_convert.py` with this content:

```python
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
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
python3 -m unittest markitdown-export/tests/test_convert.py
```

Expected: FAIL because `MarkitdownOptions` and `build_markitdown_args()` do not exist, and `run_markitdown()` still accepts only `(source, output)`.

- [ ] **Step 3: Commit the failing tests**

Run:

```bash
git add markitdown-export/tests/test_convert.py
git commit -m "test: cover markitdown local option handling"
```

---

## Task 2: Implement Safe Local Option Passthrough

**Files:**
- Modify: `markitdown-export/scripts/convert.py`
- Test: `markitdown-export/tests/test_convert.py`

- [ ] **Step 1: Add the options data structure and command builder**

In `markitdown-export/scripts/convert.py`, add the import and helper near the top:

```python
from dataclasses import dataclass
```

Add this code after `ask_overwrite()`:

```python
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
```

- [ ] **Step 2: Update `run_markitdown()` to accept options**

Change the function signature and command construction to:

```python
def run_markitdown(source: Path, output: Path, options: MarkitdownOptions) -> int:
    markitdown_args = build_markitdown_args(source, output, options)
    binary = which("markitdown")
    if binary:
        command = [binary, *markitdown_args]
        completed = subprocess.run(command, check=False)
        if completed.returncode == 0:
            print(output)
        return completed.returncode
```

In the Python fallback loop, replace the command with:

```python
command = [python, "-m", "markitdown", *markitdown_args]
```

- [ ] **Step 3: Add argparse options and pass them through**

In `main()`, add these parser arguments after `--overwrite`:

```python
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
```

Before the final return, create the options object:

```python
options = MarkitdownOptions(
    use_plugins=args.use_plugins,
    keep_data_uris=args.keep_data_uris,
    extension=args.extension,
    mime_type=args.mime_type,
    charset=args.charset,
)
```

Replace the final call with:

```python
return run_markitdown(source, output, options)
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
python3 -m unittest markitdown-export/tests/test_convert.py
```

Expected: PASS.

- [ ] **Step 5: Run all markitdown-export tests**

Run:

```bash
python3 -m unittest discover -s markitdown-export/tests
```

Expected: PASS.

- [ ] **Step 6: Commit the implementation**

Run:

```bash
git add markitdown-export/scripts/convert.py
git commit -m "feat: pass local markitdown options"
```

---

## Task 3: Update Skill Documentation

**Files:**
- Modify: `markitdown-export/SKILL.md`
- Modify: `markitdown-export/agents/openai.yaml`

- [ ] **Step 1: Update `SKILL.md` dependency and scope text**

Replace the `## 适用场景` section in `markitdown-export/SKILL.md` with:

```markdown
## 适用场景

- 用户要把 MarkItDown 支持的本地文件转成 Markdown
- 用户没有指定导出位置，或明确希望导出到源文件同目录
- 用户希望得到结构化 Markdown，而不是原样版式保真

默认本地文件转换包括：

- PDF、Word `docx`、PowerPoint `pptx`
- Excel `xlsx`、旧版 Excel `xls`
- HTML、CSV、JSON、XML、纯文本
- EPUB、Outlook MSG、Jupyter Notebook
- ZIP 压缩包，按 MarkItDown 行为遍历其中内容

本地媒体输入包括：

- JPG、JPEG、PNG 图片
- WAV、MP3、M4A、MP4 音频或视频容器中的音频内容

媒体和插件能力需要显式说明边界：图片默认主要提取元数据，图片描述或 OCR 需要 LLM client 或插件；音频和 MP4 转写依赖可选依赖，并可能调用外部 speech 服务，因此不要承诺完全离线。
```

- [ ] **Step 2: Update workflow instructions for local options**

In the `4. 执行转换` subsection, replace the two bullets with:

```markdown
   - 优先使用 `python3 scripts/convert.py`
   - 如用户明确需要插件、保留 data URI 或识别提示，可使用：
     - `--use-plugins`
     - `--keep-data-uris`
     - `--extension <ext>`
     - `--mime-type <mime>`
     - `--charset <charset>`
   - 需要时直接调用 `markitdown <source> -o <output>`，但仍保持本地文件输入和覆盖确认约束
```

- [ ] **Step 3: Update constraints**

Add these bullets to `## 约束`:

```markdown
- 默认只处理本地文件路径，不把 HTTP/HTTPS URL、YouTube URL、data URI 或 stdin 作为技能默认输入
- 不默认接入 Azure Content Understanding、Azure Document Intelligence 或任何需要 endpoint/credential 的云端转换路径
- 不自动安装或启用插件；`--use-plugins` 只启用用户环境里已经安装的 MarkItDown 插件
- `--keep-data-uris` 可能显著增大输出或带出嵌入数据，只有用户明确需要时使用
```

- [ ] **Step 4: Update reference implementation list**

Change the `scripts/convert.py` bullet to:

```markdown
- `scripts/convert.py` 负责默认输出路径、同名确认、调用 MarkItDown，并透传受控的本地转换参数
```

- [ ] **Step 5: Update `agents/openai.yaml` short description**

Change `short_description` to:

```yaml
  short_description: "将多种本地文件转换为同目录 Markdown，并在重名时先询问覆盖"
```

- [ ] **Step 6: Run documentation sanity checks**

Run:

```bash
rg -n "Azure|YouTube|HTTP/HTTPS|--use-plugins|--keep-data-uris|Outlook|Jupyter|ZIP" markitdown-export/SKILL.md markitdown-export/agents/openai.yaml
```

Expected: Output shows the new scope boundaries and local option names in `SKILL.md`, and no YAML syntax change beyond the short description.

- [ ] **Step 7: Commit documentation updates**

Run:

```bash
git add markitdown-export/SKILL.md markitdown-export/agents/openai.yaml
git commit -m "docs: clarify markitdown local conversion scope"
```

---

## Task 4: Update Maintenance Notes

**Files:**
- Modify: `markitdown-export/references/maintenance.md`

- [ ] **Step 1: Update upstream review checklist**

In `markitdown-export/references/maintenance.md`, replace the first numbered subsection under `## 更新步骤` with:

```markdown
1. 重新对齐上游说明
   - 先查看上游 README 的安装、可选依赖和用法部分
   - 检查 `packages/markitdown/src/markitdown/_markitdown.py` 的内建 converter 注册列表
   - 检查 `packages/markitdown/src/markitdown/converters/__init__.py` 的 converter 导出列表
   - 重点关注本地格式：`docx`、`pdf`、`xlsx`、`xls`、`pptx`、`outlook`、`epub`、`ipynb`、`zip`、`image`、`audio-transcription`
   - 关注本地 CLI 参数：`--use-plugins`、`--keep-data-uris`、`--extension`、`--mime-type`、`--charset`
   - Azure Content Understanding、Azure Document Intelligence、YouTube URL、HTTP/HTTPS URL 是上游能力，但不是本技能默认本地转换流程
```

- [ ] **Step 2: Expand regression sample list**

Replace the sample list under `4. 回归测试` with:

```markdown
   - 至少覆盖：
     - 一个 `.docx`
     - 一个 `.pdf`
     - 一个 `.xlsx`
     - 一个 `.html` 或 `.csv`
     - 一个 `.zip`
   - 可选覆盖：
     - 一个 `.jpg` 或 `.png`，检查元数据提取行为
     - 一个 `.mp3` 或 `.wav`，只在确认外部转写依赖可接受时测试转写
   - 检查输出是否仍然在源文件同目录
   - 检查 `--use-plugins`、`--keep-data-uris`、`--extension`、`--mime-type`、`--charset` 不会绕过覆盖确认
```

- [ ] **Step 3: Update regression judgment**

Replace `quick_validate.py` in the `## 回归判定` section with the concrete unittest command:

```markdown
- `python3 -m unittest discover -s markitdown-export/tests` 必须通过
```

Keep the existing bullets about same-directory output, overwrite prompting, and real file conversion.

- [ ] **Step 4: Run a maintenance doc sanity check**

Run:

```bash
rg -n "quick_validate|--use-plugins|--keep-data-uris|az-content|YouTube|unittest" markitdown-export/references/maintenance.md
```

Expected: `quick_validate` is absent, local option names are present, and cloud/URL scope is described as excluded from default local conversion.

- [ ] **Step 5: Commit maintenance notes**

Run:

```bash
git add markitdown-export/references/maintenance.md
git commit -m "docs: update markitdown maintenance checklist"
```

---

## Task 5: Final Verification

**Files:**
- Verify: `markitdown-export/scripts/convert.py`
- Verify: `markitdown-export/tests/test_convert.py`
- Verify: `markitdown-export/SKILL.md`
- Verify: `markitdown-export/references/maintenance.md`
- Verify: `markitdown-export/agents/openai.yaml`

- [ ] **Step 1: Run full test suite for the skill**

Run:

```bash
python3 -m unittest discover -s markitdown-export/tests
```

Expected: PASS for all `markitdown-export` tests.

- [ ] **Step 2: Check that no cloud options were added to `convert.py`**

Run:

```bash
rg -n "use-docintel|use-cu|cu-endpoint|cu-analyzer|cu-file-types|endpoint" markitdown-export/scripts/convert.py
```

Expected: No matches.

- [ ] **Step 3: Check that local options are documented and implemented**

Run:

```bash
rg -n "use-plugins|keep-data-uris|extension|mime-type|charset" markitdown-export
```

Expected: Matches in `scripts/convert.py`, `tests/test_convert.py`, `SKILL.md`, and `references/maintenance.md`.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git diff --stat HEAD~4..HEAD
git log --oneline -5
```

Expected: The recent commits cover tests, implementation, skill docs, and maintenance docs. There are no unrelated files.

- [ ] **Step 5: Report completion**

Summarize:

- Tests run and result.
- Files changed.
- Explicit note that Azure, URL, YouTube, and stdin remain outside default scope.
- Any real-file conversion not run, if no sample files were available.

