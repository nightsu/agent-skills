---
name: manga-ebook-conversion
description: 当用户要批量转换漫画/电子书，涉及 MOBI、EPUB、Calibre、KCC、kcc-oasis、Kindle Oasis 或 Paperwhite profile，并需要输出校验时使用。
---

# Manga Ebook Conversion

## 适用场景

- 用户要把漫画 MOBI/EPUB 转成 Kindle 友好的 EPUB/MOBI
- 用户提到 KCC、Kindle Comic Converter、kcc-oasis、Calibre、Oasis、Paperwhite
- 用户要批量处理卷号范围，例如 `23 - 40`
- 用户关心输出体积、设备分辨率、阅读方向或是否和 KCC 结果一致

## 核心规则

- KCC/kcc-oasis 不直接处理 MOBI 输入；MOBI 先用 `ebook-convert` 转临时 EPUB
- `kcc-oasis` 默认是 Oasis：`KO`、`1264x1680`、`EPUB`、manga 右翻
- Paperwhite 常用：`--profile paperwhite34`、`paperwhite5`、`paperwhite6`
- 不要覆盖原始 Calibre EPUB；Oasis 输出命名为 `*_oasis.epub`
- 对比文件大小前，先检查 EPUB 的 `original-resolution` 和 `primary-writing-mode`
- 大小不同通常来自目标 profile 分辨率不同，不一定是错误

## 推荐工作流

1. 确认输入目录、卷号范围和已有输出
2. 优先使用同名 `.epub` 作为 kcc-oasis 输入
3. 如果只有 `.mobi`，先运行：
   - `ebook-convert input.mobi /tmp/name-calibre.epub`
4. 运行 `kcc-oasis`
   - 默认 Oasis：`kcc-oasis --output <out-dir> input.epub`
   - Paperwhite：`kcc-oasis --profile paperwhite34 --no-manga --output <out-dir> input.epub`
5. 转换后校验
   - 文件存在且非空
   - `unzip -t output.epub`
   - 抽查 OPF：`original-resolution`、`primary-writing-mode`
6. 汇报输出路径、大小、profile/reading-mode 校验结果

## 批量脚本

优先使用：

```bash
python3 scripts/kcc_oasis_batch.py "/path/to/series" 23 40
```

常用参数：

```bash
python3 scripts/kcc_oasis_batch.py "/path/to/series" 23 40 --prefix "死神"
python3 scripts/kcc_oasis_batch.py "/path/to/series" 23 40 --profile paperwhite34 --no-manga
python3 scripts/kcc_oasis_batch.py "/path/to/series" 23 40 --overwrite
```

脚本行为：

- 输入文件名格式：`<prefix> (N).epub` 或 `<prefix> (N).mobi`
- 输出文件名：`<prefix> (N)_oasis.epub`
- 如果 EPUB 和 MOBI 都存在，优先 EPUB
- 如果输出已存在，默认拒绝覆盖
- 每个输出都会做 zip 完整性校验

## 常见判断

Oasis 输出比 Paperwhite 输出更大是正常的：

```text
KO:    1264x1680 = 2,123,520 pixels
KPW34: 1072x1448 = 1,552,256 pixels
```

KO 每页像素约多 37%，漫画 EPUB 主要由图片构成，所以体积通常更大。

阅读方向差异：

```text
manga 默认: horizontal-rl
--no-manga: horizontal-lr
```

阅读方向主要影响阅读顺序和 metadata，不是体积差异主因。

## 前置检查

- `which kcc-oasis`
- `kcc-oasis --dry-run /tmp/example.cbz`
- `which ebook-convert`
- `which 7zz 7z 7za unar`

如果 `kcc-oasis` 不存在，先说明需要安装或使用仓库 `nightsu/kcc-oasis`。

## 缺少依赖时

- `ebook-convert` 来自 Calibre；只有输入包含 MOBI 时才必须安装
- 如果批量输入全是 EPUB，可以不安装 `ebook-convert`
- 如果需要处理 MOBI 且缺少 `ebook-convert`，先安装 Calibre CLI：
  - macOS/Homebrew：`brew install --cask calibre`
- 安装后验证：
  - `ebook-convert --version`
  - `ebook-meta input.mobi`
- 不要把 MOBI 直接交给 KCC/kcc-oasis；即使安装了解包工具，KCC 仍不把 MOBI 当作输入格式
