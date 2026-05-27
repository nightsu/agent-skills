# MarkItDown Export 本地转换能力迭代设计

## 背景

`markitdown-export` 是对 Microsoft MarkItDown 的轻量封装，当前目标是把用户提供的本地文件转换为同目录 Markdown，并在目标文件已存在时先确认覆盖。

上游 `microsoft/markitdown` 已发布 `0.1.6`。默认本地 converter 覆盖范围比当前技能文档描述更宽，同时 CLI 已有一些适合本地转换的受控参数，例如插件启用、保留 data URI、扩展名/MIME/字符集提示。此迭代只处理本地文件转换能力，不把 Azure、YouTube URL 或远程资源抓取纳入技能默认流程。

## 目标

- 更新技能说明，使本地支持格式列表与上游 `0.1.6` 的内建 converter 更一致。
- 保持默认体验不变：输入本地文件，输出同目录同名 `.md`，重名时先确认。
- 在 `scripts/convert.py` 中支持一组本地相关的受控 MarkItDown 参数。
- 明确插件、OCR、图片描述、音频转写等能力是显式可选增强，不承诺纯离线。
- 补充脚本测试，避免参数透传和覆盖保护出现回归。

## 非目标

- 不支持 HTTP/HTTPS URL、YouTube URL、data URI 或 stdin 作为技能默认输入。
- 不支持 Azure Content Understanding、Azure Document Intelligence 或任何需要 endpoint/credential 的云端转换路径。
- 不自动安装、升级 MarkItDown 或任何插件。
- 不自动配置 LLM client、OpenAI key、Google speech 等外部服务。
- 不追求版式保真；输出仍以内容和结构化 Markdown 为目标。

## 用户可见行为

默认路径保持不变：

```bash
python3 scripts/convert.py <source>
python3 scripts/convert.py <source> -o <output>
python3 scripts/convert.py <source> --overwrite
```

新增参数只在用户明确需要时使用：

```bash
python3 scripts/convert.py <source> --use-plugins
python3 scripts/convert.py <source> --keep-data-uris
python3 scripts/convert.py <source> --extension pdf
python3 scripts/convert.py <source> --mime-type application/pdf
python3 scripts/convert.py <source> --charset utf-8
```

默认不启用插件，不保留 data URI，不触发云端能力。

## 支持格式说明

技能文档采用分层描述。

默认本地文件转换：

- PDF、Word `docx`、PowerPoint `pptx`
- Excel `xlsx`、旧版 Excel `xls`
- HTML、CSV、JSON、XML、纯文本
- EPUB、Outlook MSG、Jupyter Notebook
- ZIP 压缩包，按 MarkItDown 行为遍历其中内容

本地媒体输入：

- JPG、JPEG、PNG 图片
- WAV、MP3、M4A、MP4 音频或视频容器中的音频内容

媒体能力需要边界说明：图片默认主要提取元数据，图片描述或 OCR 需要 LLM client 或插件；音频和 MP4 转写依赖可选依赖，并可能调用外部 speech 服务，因此不能承诺完全离线。

显式可选增强：

- `--use-plugins`：启用已安装的 MarkItDown 插件。
- `markitdown-ocr`：可作为 OCR 增强方案写入维护说明，但技能不负责安装和配置。
- `--keep-data-uris`：保留嵌入式 data URI，可能显著增大输出或带出敏感嵌入数据。
- `--extension`、`--mime-type`、`--charset`：当文件扩展名缺失或识别错误时给 MarkItDown 提示。

排除默认范围：

- Azure Content Understanding
- Azure Document Intelligence
- YouTube URL
- HTTP/HTTPS URL 输入
- 远程资源抓取

## 脚本设计

`scripts/convert.py` 继续验证 `source` 必须是存在的本地文件。输出路径仍由 `default_output_path()` 或 `--output` 决定，且已有文件在没有 `--overwrite` 时继续走确认流程；非交互环境拒绝覆盖。

新增 argparse 参数：

- `--use-plugins`
- `--keep-data-uris`
- `--extension`
- `--mime-type`
- `--charset`

`run_markitdown()` 负责把这些参数以列表形式追加到 MarkItDown 命令，不通过 shell 拼接字符串。

当系统有 `markitdown` 可执行文件时，命令形态为：

```bash
markitdown <source> -o <output> [local options]
```

当回退到 Python 模块时，命令形态为：

```bash
python -m markitdown <source> -o <output> [local options]
```

不新增以下参数：

- `--use-docintel`
- `--endpoint`
- `--use-cu`
- `--cu-endpoint`
- `--cu-analyzer`
- `--cu-file-types`

## 文档设计

`SKILL.md` 更新：

- 前置依赖保留 Python 3.10+、`pipx install "markitdown[all]"`、显式升级说明。
- 适用场景改为本地文件转换分层列表。
- 工作流中补充：遇到插件、OCR、data URI、媒体转写需求时，需要显式说明可选增强和外部依赖风险。
- 约束中明确不默认处理 URL、Azure、远程资源和成本型云服务。

`references/maintenance.md` 更新：

- 增加上游 `0.1.6` 检查点。
- 维护时关注本地 converter 注册列表、optional extras、CLI 本地参数。
- 把 Azure 和 URL 能力列为上游存在但本技能默认不接入的能力。
- 人工回归样例扩展到 DOCX、PDF、XLSX、HTML/CSV、ZIP，以及可选的图片或音频样例。

`agents/openai.yaml` 更新：

- 短描述从 PDF/Word/Excel 扩展为“多种本地文件”。
- 保持同目录导出和覆盖确认作为核心承诺。

`.claude-plugin/marketplace.json` 不需要改，因为技能目录没有新增或删除。

## 测试设计

新增 `tests/test_convert.py`，使用 mock/subprocess 替身测试脚本行为，不依赖真实 MarkItDown 转换。

覆盖项：

- 默认输出路径使用源文件同目录同名 `.md`。
- 源文件不存在时报错。
- 源路径不是文件时报错。
- 目标文件存在且非交互时拒绝覆盖并返回 `2`。
- `--overwrite` 允许跳过覆盖确认。
- `--use-plugins`、`--keep-data-uris`、`--extension`、`--mime-type`、`--charset` 被正确追加到命令列表。
- 有 `markitdown` binary 时优先使用 binary。
- 没有 binary 时回退到可用 Python 解释器执行 `-m markitdown`。

保留 `tests/test_check_markitdown.py`。如果改动升级提示，只增加轻量测试确认仍推荐 `pipx` 和 `python3 -m pip` 两条路径。

## 错误处理

- 参数验证尽量交给 MarkItDown CLI，但 `source` 的本地文件存在性由封装脚本先检查。
- MIME type、charset、extension 参数不在封装脚本内做复杂推断，只做透传。
- MarkItDown 返回非零退出码时，封装脚本原样返回该 code。
- 覆盖拒绝继续使用返回码 `2`。

## 验收标准

- 文档准确区分默认本地能力、媒体/插件可选增强和排除的云端/远程能力。
- `python3 -m unittest discover -s markitdown-export/tests` 通过。
- 默认转换命令行为和现有用户习惯保持兼容。
- 新参数不会让脚本接受 URL 或绕过覆盖保护。

