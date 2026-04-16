---
name: markitdown-export
description: 当用户要求把 MarkItDown 支持的 PDF、Word、Excel 等文件转换为 Markdown，并希望默认保存到源文件同目录时使用。遇到同名输出先询问是否覆盖。
---

# MarkItDown Export

## 前置依赖

- 优先使用 `pipx` 安装 MarkItDown，隔离环境更干净
- 推荐安装全量可选依赖：
  - `pipx install "markitdown[all]"`
- 如果用户环境没有 `pipx`，再回退到：
  - `python3.11 -m pip install --user -U "markitdown[all]"`

## 适用场景

- 用户要把 PDF、Word、Excel、PPT、HTML、CSV、JSON、XML、EPUB 等 MarkItDown 支持的文件转成 Markdown
- 用户没有指定导出位置，或明确希望导出到源文件同目录
- 用户希望得到结构化 Markdown，而不是原样版式保真

## 工作流

1. 识别输入
   - 只处理单个文件路径，或 MarkItDown 明确支持的输入
   - 如果输入格式不在 MarkItDown README 支持范围内，先说明无法直接转换
2. 计算输出
   - 默认输出到源文件同目录
   - 输出文件名使用源文件主名，加上 `.md`
   - 不要先询问导出位置
3. 处理重名
   - 如果目标 `.md` 已存在，先询问用户是否覆盖
   - 未得到明确同意前，不要覆盖
4. 执行转换
   - 优先使用 `python3 scripts/convert.py`
   - 需要时直接调用 `markitdown <source> -o <output>`
5. 转换后反馈
   - 告知生成文件的完整路径
   - 如内容和原排版有差异，说明这是 Markdown 转换的正常结果

## 约束

- 不要默认把输出放到下载目录、项目根目录或临时目录
- 不要向用户追问输出路径
- 不要在没有确认的情况下覆盖已有文件
- 目标是内容和结构提取，不是视觉排版还原

## 参考实现

- `scripts/convert.py` 负责默认输出路径、同名确认和调用 MarkItDown
- `references/maintenance.md` 记录仓库更新和回归测试流程
