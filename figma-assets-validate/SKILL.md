---
name: figma-assets-validate
description: figma-workflow-suite 的 P15 工程化组件。读取 docs/design/<feature>/ 下的资源引用和阶段产物,生成 assets-manifest.md 与 validation-report.md,收口资源交付和自动化验证。
---

# Figma Assets Validate

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的 P15 工程化能力,用于资源交付和验证收口。

它产出 `docs/design/<feature>/assets-manifest.md` 和 `docs/design/<feature>/validation-report.md`。
它不写业务代码,不替代人工 review gate,不改变 Phase E coding boundary。

## Prerequisites

- `feature=<feature-name>`
- `docs/design/<feature>/` 存在
- 至少存在 `design-token-patch.md` / `ui-handoff.md` / `design-diff.md` / `implementation-spec.md` 中的一份产物

## 目标

这个 skill 负责:

- 输出 `docs/design/<feature>/assets-manifest.md`
- 输出 `docs/design/<feature>/validation-report.md`
- 在 `docs/design/<feature>/inputs.md` 追加一条 audit 记录
- 默认只记录资源引用、下载计划和 open questions,不下载所有资源
- 运行 Markdown contract check、fixture contract check 和 boundary check
- 仅在用户明确开启时运行 LLM-as-judge,且只作为风险提示

## 不做的事

- 不默认下载所有资源
- 不提交大体积二进制资源
- 不做像素级视觉回归
- 不把 LLM-as-judge 当唯一验收
- 不修改 Figma 文件
- 不自动重跑任何 phase
- 不写业务代码

## 工作流

1. 解析 `feature=<feature-name>`。
2. 确认 `docs/design/<feature>/` 存在。
3. 读取可用阶段产物和 `.figma-cache/` metadata。
4. 从 `design-token-patch.md`、`ui-handoff.md`、`design-diff.md` 和 cache summary 中提取资源引用。
5. 将资源分类为 image / icon / illustration / screenshot / background / unknown。
6. 判断资源状态:pending / downloaded / deferred / skipped / missing。
7. 生成 `assets-manifest.md`。
8. 运行 Markdown contract check。
9. 运行 fixture contract check。
10. 运行 boundary check。
11. 仅在用户明确启用时运行 LLM-as-judge。
12. 生成 `validation-report.md`。
13. 追加 `inputs.md` audit 记录。
14. 打印 self-check。

## Assets Manifest

`assets-manifest.md` 使用 [references/assets-manifest-template.md](references/assets-manifest-template.md) 的结构。

关键规则:

- blocking asset 必须有 destination 或 open question。
- `Required=yes` 的资源不能是 `Status=unknown`。
- `Recommended Format=unknown` 的资源必须进入 `Open Questions`。
- `downloaded` 资源必须有相对路径。
- 大体积二进制资源不能无说明提交。

## Validation Report

`validation-report.md` 使用 [references/validation-report-template.md](references/validation-report-template.md) 的结构。

检查组:

- Markdown Contract Check
- Fixture Contract Check
- Boundary Check
- Asset Manifest Check
- Optional LLM Judge

## Audit

完成后在 `docs/design/<feature>/inputs.md` 追加:

```markdown
## <ISO8601> — figma-assets-validate

- action: generate_assets_manifest_and_validation_report
- output:
  - assets-manifest.md
  - validation-report.md
- default_download_all_assets: false
- llm_as_judge: skipped
- business_code_modified: false
```

## Self-Check

| Check | Warning |
|---|---|
| blocking asset without destination | "存在必需资源但缺少 destination 或 open question" |
| missing contract sections | "存在产物缺少必需章节" |
| boundary violation | "检测到业务代码目录或 coding boundary 风险" |
| llm judge used as pass source | "LLM-as-judge 不能作为唯一验收" |
