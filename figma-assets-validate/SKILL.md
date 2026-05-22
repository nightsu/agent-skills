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
- 在 `docs/design/<feature>/snapshots/` 保存一个或多个 Figma visual baseline
- 为每个 snapshot 写入同名小型 metadata JSON,不保存 raw Figma JSON
- 确保 `implementation-spec.md` 包含 `## Visual Baselines` 和 coding-time snapshot verification checklist
- 运行 Markdown contract check、fixture contract check、boundary check、asset manifest check 和 spec-snapshot consistency check
- 当 spec/snapshot 不一致且可从现有证据自动修正时,最多自我 review 并迭代 2 次
- 在 `docs/design/<feature>/inputs.md` 追加一条 audit 记录
- 默认只记录生产资源引用、下载计划和 open questions,不下载所有生产资源
- 仅在用户明确开启时运行 LLM-as-judge,且只作为风险提示

## 不做的事

- 不默认下载所有生产资源
- 不把 snapshot 当作生产资源提交要求
- 不提交大体积二进制资源,除非该 snapshot 是本次 handoff 的 required visual baseline
- 不做像素级视觉回归
- 不用 Playwright 捕获实现页面截图
- 不把 LLM-as-judge 当唯一验收
- 不修改 Figma 文件
- 不自动重跑 A-E phase
- 不写业务代码
- 不修改业务项目仓库
- 不基于截图发明产品决策

## 工作流

1. 解析 `feature=<feature-name>`。
2. 确认 `docs/design/<feature>/` 存在。
3. 读取可用阶段产物、`.figma-cache/` metadata 和既有 `snapshots/` 文件。
4. 从 `.figma-cache/manifest.json`、`inputs.md`、`clarified-requirement.md`、`ui-understanding.md`、`design-diff.md`、`ui-handoff.md` 中发现 Figma baseline 候选。
5. 为候选分配稳定 baseline id: `default` / `narrow` / `empty` / `error` / `unknown-purpose-N`。
6. 对每个需要捕获的 baseline 调用 Figma MCP `get_screenshot`,将 PNG 保存到 `docs/design/<feature>/snapshots/<id>.png`。
7. 为每个 baseline 写入 `docs/design/<feature>/snapshots/<id>.json` metadata。
8. 从 `design-token-patch.md`、`ui-handoff.md`、`design-diff.md` 和 cache summary 中提取生产资源引用。
9. 将生产资源分类为 image / icon / illustration / screenshot / background / unknown。
10. 判断生产资源状态:pending / downloaded / deferred / skipped / missing。
11. 生成 `assets-manifest.md`,其中 `Visual Baselines` 独立于生产资源。
12. 确保 `implementation-spec.md` 包含 `## Visual Baselines` 和 snapshot 对照 checklist;若缺失且信息可从 baseline metadata 推导,只更新 Phase E/P15 产物。
13. 运行 Markdown contract check。
14. 运行 fixture contract check。
15. 运行 boundary check。
16. 运行 asset manifest check。
17. 运行 spec-snapshot consistency check。
18. 如发现 auto-fixable mismatch,最多执行 2 次自我 review 迭代,只改 `implementation-spec.md` / `assets-manifest.md` / `validation-report.md` / `open-questions.md` / `inputs.md`。
19. 仅在用户明确启用时运行 LLM-as-judge。
20. 生成 `validation-report.md`。
21. 追加 `inputs.md` audit 记录。
22. 打印 self-check。

## Assets Manifest

`assets-manifest.md` 使用 [references/assets-manifest-template.md](references/assets-manifest-template.md) 的结构。

关键规则:

- blocking asset 必须有 destination 或 open question。
- `Required=yes` 的资源不能是 `Status=unknown`。
- `Recommended Format=unknown` 的资源必须进入 `Open Questions`。
- `downloaded` 资源必须有相对路径。
- 大体积二进制资源不能无说明提交。

## Visual Baselines

Visual baseline 是 coding-time verification artifact,不是生产图片资源。

Baseline 发现顺序:

1. `.figma-cache/manifest.json` 中的 screenshot metadata 或 snapshot entries
2. `inputs.md` 中的 `figma_file_key` / `figma_node_id`
3. `clarified-requirement.md` 和 `ui-understanding.md` 中的 Figma URL 或 node references
4. `design-diff.md` 或 `ui-handoff.md` 中的 node references
5. 既有 `docs/design/<feature>/snapshots/` 文件

命名规则:

- 单个 node 默认命名为 `default`
- 明确窄屏/响应式用途命名为 `narrow`
- 明确空态命名为 `empty`
- 明确异常态命名为 `error`
- 多个 node 但用途不清时命名为 `unknown-purpose-1` / `unknown-purpose-2`

每个 baseline 必须写入:

```text
docs/design/<feature>/snapshots/<baseline-id>.png
docs/design/<feature>/snapshots/<baseline-id>.json
```

metadata JSON 只允许包含稳定 handoff 字段:

```json
{
  "id": "default",
  "figma_file_key": "YclTRHKbwKZYdt8uY52fkw",
  "figma_node_id": "123075:3394",
  "source_label": "数据看板默认态",
  "image_path": "snapshots/default.png",
  "metadata_path": "snapshots/default.json",
  "original_width": 1440,
  "original_height": 900,
  "captured_at": "2026-05-22T10:00:00+08:00",
  "required": "yes",
  "purpose": "implementation_visual_baseline"
}
```

禁止把 raw Figma JSON 写入 snapshot metadata。

## Validation Report

`validation-report.md` 使用 [references/validation-report-template.md](references/validation-report-template.md) 的结构。

检查组:

- Markdown Contract Check
- Fixture Contract Check
- Boundary Check
- Asset Manifest Check
- Spec-Snapshot Consistency Check
- Spec-Snapshot Review Iterations
- Optional LLM Judge

## Spec-Snapshot Consistency

`validation-report.md` 必须包含 `Spec-Snapshot Consistency Check`。

必查项:

- `snapshot_exists`: required baseline 的 PNG 和 metadata JSON 存在
- `node_match`: metadata 中 file/node 与发现来源一致
- `dimension_recorded`: metadata 记录 original width/height
- `spec_mentions_baseline`: `implementation-spec.md` 的 `## Visual Baselines` 列出该 baseline
- `structure_match`: spec 覆盖截图中的关键业务结构,例如分组数量、分组标签、重复卡片数量、主次层级
- `state_or_viewport_match`: 状态或响应式 baseline 在 spec 中有对应说明
- `known_deviation_recorded`: intentional deviation 已显式记录

`structure_match` 是轻量规则检查,不是像素级比较。

当检查失败时:

1. 将 mismatch 分类为 `auto_fixable` / `needs_user_confirmation` / `intentional_deviation`
2. `auto_fixable` 只允许修改 Phase E/P15 产物
3. 最多自我 review 并迭代 2 次
4. 迭代历史写入 `Spec-Snapshot Review Iterations`
5. 2 次后仍失败时写 blocking finding,不继续自动重写

## Audit

完成后在 `docs/design/<feature>/inputs.md` 追加:

```markdown
## <ISO8601> — figma-assets-validate

- action: generate_assets_manifest_validation_report_and_visual_baselines
- output:
  - assets-manifest.md
  - validation-report.md
  - snapshots/
- visual_baselines:
  - default: snapshots/default.png
- default_download_all_production_assets: false
- spec_snapshot_consistency: pass
- self_review_iterations: 0
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
| required visual baseline missing PNG or metadata | "必需 visual baseline 缺少 snapshot PNG 或 metadata JSON" |
| implementation spec missing visual baseline | "`implementation-spec.md` 未列出 required snapshot" |
| spec snapshot mismatch unresolved | "spec 与 snapshot 存在未解决不一致,需 blocking open question 或 intentional deviation" |
| raw Figma JSON in snapshot metadata | "snapshot metadata 只能包含稳定 handoff 字段" |
