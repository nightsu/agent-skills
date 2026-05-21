---
name: figma-ui-handoff
description: figma-workflow-suite 的 P14 工程化组件。读取 docs/design/<feature>/ 下的上游产物,输出 ui-handoff.md,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
---

# Figma UI Handoff

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的 P14 工程化能力。它生成面向设计/产品的 `ui-handoff.md`,不是 Phase E implementation handoff,也不是 coding 入口。

`ui-handoff.md` 是辅助产物,不属于 Phase A-E 的必需输入。

## Prerequisites

- `feature=<feature-name>`
- `docs/design/<feature>/` 存在
- 至少存在 `ui-understanding.md` 或 `component-mapping.md` 中的一份上游产物

## 目标

这个 skill 负责:

- 输出 `docs/design/<feature>/ui-handoff.md`
- 在 `docs/design/<feature>/inputs.md` 追加一条 audit 记录
- 从已有产物中汇总 unknown、open questions 和设计/产品待补项
- 区分已确认 evidence 和 required action
- 将 Figma selection、文案、命名、重复项、状态和资源交接信息整理成可转发文档

## 不做的事

- 不修改 Figma 文件
- 不要求设计师使用特定设计系统
- 不生成 implementation spec
- 不替代 `figma-emit-spec`
- 不自动重跑任何 phase
- 不写业务代码
- 不下载真实资源

## 工作流

1. 解析 `feature=<feature-name>`。
2. 确认 `docs/design/<feature>/` 存在。
3. 读取可用产物:`clarified-requirement.md`、`ui-understanding.md`、`component-mapping.md`、`design-token-patch.md`、`design-diff.md`、`open-questions.md`。
4. 识别缺失产物,记录到 `Known Gaps`。
5. 提取 Figma selection 要求。
6. 提取 text requirements,尤其是 `characters` 与 `node.name` 不一致的问题。
7. 提取 component / section naming gaps。
8. 提取 repeat group hints。
9. 提取 state coverage gaps。
10. 提取 asset marking gaps。
11. 当 `design-diff.md` 存在时,提取 design diff follow-up。
12. 生成 `ui-handoff.md`。
13. 追加 `inputs.md` audit 记录。
14. 打印 self-check,供 orchestrator review。

## Output Contract

`ui-handoff.md` 使用 [references/ui-handoff-template.md](references/ui-handoff-template.md) 的结构。

必须包含:

- Required Figma Selection
- Text Requirements
- Component / Section Naming Rules
- Repeat Group Hints
- State Coverage
- Asset Marking
- Design Diff Follow-up
- Known Gaps
- Non-Goals

## Audit

完成后在 `docs/design/<feature>/inputs.md` 追加:

```markdown
## <ISO8601> — figma-ui-handoff

- action: generate_ui_handoff
- output: ui-handoff.md
- target_reader: design/product
- phase_e_handoff: false
- business_code_modified: false
```

## Self-Check

| Check | Warning |
|---|---|
| no upstream products | "没有可读取的上游产物,无法生成有效 UI handoff" |
| Known Gaps empty while upstream unknown exists | "上游存在 unknown 但 handoff 未列出 Known Gaps" |
| State Coverage missing | "状态覆盖未列出 loading/empty/error/permission" |
| Non-Goals missing | "必须明确本文件不是 implementation spec,不授权 coding" |
