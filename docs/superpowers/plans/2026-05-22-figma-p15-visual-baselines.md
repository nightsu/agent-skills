# Figma P15 Visual Baselines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `figma-assets-validate` so P15 records Figma visual baselines, checks `implementation-spec.md` against them, and hands coding agents explicit snapshot verification instructions.

**Architecture:** This repository implements the workflow through skill instructions, reference templates, and fixture contracts. The change updates the P15 skill contract, the Phase E spec template, and workflow checkpoint wording so future agents consistently capture `snapshots/*.png` plus small `snapshots/*.json` metadata and report spec/snapshot consistency before handoff.

**Tech Stack:** Codex skills in Markdown, Figma MCP `get_screenshot`, Node.js built-in test runner for workflow scripts, fixture-based Markdown contract review.

---

## File Structure

- Modify `figma-assets-validate/SKILL.md`: add visual baseline discovery, capture, manifest, consistency check, self-review loop, audit fields, and boundary rules.
- Modify `figma-assets-validate/README.md`: document the new `snapshots/` output and the visual-baseline boundary.
- Modify `figma-assets-validate/references/assets-manifest-template.md`: add `Visual Baselines` rows separate from production assets.
- Modify `figma-assets-validate/references/validation-report-template.md`: add `Spec-Snapshot Consistency Check` and `Spec-Snapshot Review Iterations`.
- Modify `figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md`: include a realistic `Visual Baselines` section for fixture validation.
- Modify `figma-assets-validate/tests/fixtures/sales-workbench/expected/assets-manifest.md`: include one required implementation baseline and one optional responsive baseline.
- Modify `figma-assets-validate/tests/fixtures/sales-workbench/expected/validation-report.md`: include consistency rows and review iteration rows.
- Modify `figma-assets-validate/tests/fixtures/sales-workbench/README.md`: explain that fixture snapshot metadata is representative and does not require committing binary PNGs.
- Modify `figma-emit-spec/references/spec-template.md`: add the `Visual Baselines` section and required coding-time checklist copy so P15 has a stable place to fill.
- Modify `figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md`: include the placeholder visual baseline section and checklist items.
- Modify `figma-workflow/references/workflow-orchestration.md`: make P15 pre-handoff wording include visual baselines and spec/snapshot consistency.
- Modify `figma-workflow/references/progress-routing.md`: update the Assets / validation panel copy to mention visual baselines.
- Modify `figma-workflow/scripts/figma-engineering-checkpoint.js`: update P15 labels/reason/risk text only, preserving existing status logic.
- Modify `figma-workflow/scripts/figma-engineering-checkpoint.test.js` and `figma-workflow/tests/fixtures/engineering-checkpoint/pre-handoff.expected.md`: update assertions and expected rendered output for the new P15 wording.

### Task 1: Update P15 Skill Contract

**Files:**
- Modify: `figma-assets-validate/SKILL.md`
- Modify: `figma-assets-validate/README.md`

- [ ] **Step 1: Update `figma-assets-validate/SKILL.md` goals and non-goals**

Replace the `## 目标` bullet list with:

```markdown
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
```

Replace the `## 不做的事` bullet list with:

```markdown
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
```

- [ ] **Step 2: Update `figma-assets-validate/SKILL.md` workflow**

Replace the numbered `## 工作流` list with:

```markdown
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
```

- [ ] **Step 3: Add visual baseline rules to `figma-assets-validate/SKILL.md`**

Insert this section between `## Assets Manifest` and `## Validation Report`:

```markdown
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
```

- [ ] **Step 4: Add consistency and iteration rules to `figma-assets-validate/SKILL.md`**

Insert this section before `## Audit`:

```markdown
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
```

- [ ] **Step 5: Update audit and self-check in `figma-assets-validate/SKILL.md`**

Replace the audit code block with:

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

Add these rows to the `## Self-Check` table:

```markdown
| required visual baseline missing PNG or metadata | "必需 visual baseline 缺少 snapshot PNG 或 metadata JSON" |
| implementation spec missing visual baseline | "`implementation-spec.md` 未列出 required snapshot" |
| spec snapshot mismatch unresolved | "spec 与 snapshot 存在未解决不一致,需 blocking open question 或 intentional deviation" |
| raw Figma JSON in snapshot metadata | "snapshot metadata 只能包含稳定 handoff 字段" |
```

- [ ] **Step 6: Update `figma-assets-validate/README.md`**

Replace the output tree with:

```text
docs/design/<feature>/
├── snapshots/
│   ├── default.png
│   └── default.json
├── assets-manifest.md
└── validation-report.md
```

Add this paragraph under `## 输出`:

```markdown
`snapshots/*.png` 是实现前后视觉对照基线,`snapshots/*.json` 是小型 metadata,用于记录 file key、node id、原始尺寸、用途和 required 状态。metadata 不包含 raw Figma JSON。
```

Add these boundary bullets:

```markdown
- 可下载 required visual baseline snapshot,但不默认下载所有生产资源。
- 不执行像素级视觉回归。
- 如果 `implementation-spec.md` 与 snapshot 不一致,只允许迭代 Phase E/P15 产物。
```

- [ ] **Step 7: Review Task 1 changes**

Run:

```bash
rg -n "Visual Baselines|Spec-Snapshot|snapshot metadata|raw Figma JSON|self_review_iterations" figma-assets-validate
```

Expected: matches appear in `SKILL.md` and `README.md`; no claim says P15 writes business code or modifies Figma.

- [ ] **Step 8: Commit Task 1**

```bash
git add figma-assets-validate/SKILL.md figma-assets-validate/README.md
git commit -m "docs: define p15 visual baseline contract"
```

### Task 2: Update P15 Templates and Fixture Outputs

**Files:**
- Modify: `figma-assets-validate/references/assets-manifest-template.md`
- Modify: `figma-assets-validate/references/validation-report-template.md`
- Modify: `figma-assets-validate/tests/fixtures/sales-workbench/expected/assets-manifest.md`
- Modify: `figma-assets-validate/tests/fixtures/sales-workbench/expected/validation-report.md`
- Modify: `figma-assets-validate/tests/fixtures/sales-workbench/README.md`

- [ ] **Step 1: Add `Visual Baselines` to `assets-manifest-template.md`**

Insert this section between `## Asset References` and `## Download Plan`:

```markdown
## Visual Baselines

| Baseline ID | Figma Node | Image Path | Metadata Path | Required | Purpose | Status | Notes |
|---|---|---|---|---|---|---|---|
```

Add this row type to the Summary guidance by keeping the table generic and documenting in text after the Summary table:

```markdown
Summary rows may include `visual-baseline`; visual baselines are verification artifacts and must stay separate from production asset references.
```

- [ ] **Step 2: Add consistency sections to `validation-report-template.md`**

Insert this section after `## Asset Manifest Check`:

```markdown
## Spec-Snapshot Consistency Check

| Baseline ID | Check | Status | Notes |
|---|---|---|---|
```

Insert this section after `## Spec-Snapshot Consistency Check`:

```markdown
## Spec-Snapshot Review Iterations

| Iteration | Finding | Action | Result |
|---:|---|---|---|
```

- [ ] **Step 3: Update fixture `expected/assets-manifest.md`**

Add this Summary row:

```markdown
| visual-baseline | 2 | 1 | 0 |
```

Insert this section after `## Asset References`:

```markdown
## Visual Baselines

| Baseline ID | Figma Node | Image Path | Metadata Path | Required | Purpose | Status | Notes |
|---|---|---|---|---|---|---|---|
| default | 123075:3394 | snapshots/default.png | snapshots/default.json | yes | implementation_visual_baseline | downloaded | Main sales workbench dashboard |
| narrow | 123075:3520 | snapshots/narrow.png | snapshots/narrow.json | no | responsive_reference | pending | Optional narrow viewport reference |
```

- [ ] **Step 4: Update fixture `expected/validation-report.md` summary**

Add these summary rows:

```markdown
| visual baselines | pass | Required baseline `default` is registered |
| spec snapshot consistency | pass | `implementation-spec.md` lists required baselines |
```

- [ ] **Step 5: Update fixture `expected/validation-report.md` checks**

Insert after `## Asset Manifest Check`:

```markdown
## Spec-Snapshot Consistency Check

| Baseline ID | Check | Status | Notes |
|---|---|---|---|
| default | snapshot_exists | pass | `snapshots/default.png` and `snapshots/default.json` registered |
| default | node_match | pass | Source node `123075:3394` matches manifest |
| default | dimension_recorded | pass | Original dimensions are recorded in metadata |
| default | spec_mentions_baseline | pass | Listed in `implementation-spec.md` |
| default | structure_match | pass | Spec covers the sales metrics module used by the dashboard |
| narrow | snapshot_exists | warn | Optional responsive reference not downloaded in fixture |

## Spec-Snapshot Review Iterations

| Iteration | Finding | Action | Result |
|---:|---|---|---|
| 0 | No required baseline mismatch | No auto-fix needed | pass |
```

- [ ] **Step 6: Update fixture README**

Add this section:

```markdown
## Visual Baseline Fixture

The expected outputs model two baselines:

- `default`: required implementation visual baseline for the main dashboard node.
- `narrow`: optional responsive reference.

The fixture does not commit binary PNG files. It verifies the Markdown contract and expected metadata references that P15 must produce in a real workflow run.
```

- [ ] **Step 7: Review Task 2 changes**

Run:

```bash
rg -n "Visual Baselines|Spec-Snapshot|visual-baseline|snapshots/default" figma-assets-validate/references figma-assets-validate/tests/fixtures/sales-workbench
```

Expected: templates and expected outputs contain the new sections; fixture README states binary PNGs are not committed.

- [ ] **Step 8: Commit Task 2**

```bash
git add figma-assets-validate/references figma-assets-validate/tests/fixtures/sales-workbench
git commit -m "docs: add p15 visual baseline fixtures"
```

### Task 3: Update Implementation Spec Contract

**Files:**
- Modify: `figma-emit-spec/references/spec-template.md`
- Modify: `figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md`
- Modify: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md`

- [ ] **Step 1: Update template structure in `spec-template.md`**

In the complete template structure, insert `## Visual Baselines` before `## Verification Checklist`:

```markdown
## Implementation Constraints
## Visual Baselines
## Verification Checklist
```

- [ ] **Step 2: Add `Visual Baselines` fill rules to `spec-template.md`**

Insert this section before `### ## Verification Checklist`:

```markdown
### `## Visual Baselines`
- **来源:** P15 `figma-assets-validate` 的 snapshot metadata 和 `assets-manifest.md`
- **Phase E 初次生成:** 若 P15 尚未运行,保留空表和说明,由 P15 回填
- **P15 回填格式:**

```markdown
| Baseline ID | Image Path | Figma Node | Purpose | Required |
|---|---|---|---|---|
| default | snapshots/default.png | 123075:3394 | implementation_visual_baseline | yes |
```

- **约束:** 不引用 raw Figma JSON;只引用 `snapshots/*.png` 和 `snapshots/*.json` handoff artifact
```

- [ ] **Step 3: Update verification checklist rules in `spec-template.md`**

Replace the fixed checklist section with:

```markdown
### `## Verification Checklist`(固定 8 项)
- [ ] 实现后逐个对比 `## Visual Baselines` 中 `Required=yes` 的 snapshot
- [ ] 对比项至少包括模块数量、标签、主/次层级、布局、颜色、间距、字号比例
- [ ] 若实现与 snapshot 有 intentional deviation,必须在验证记录中说明原因
- [ ] 与 Figma 截图视觉对比(允许文本不严格一致)
- [ ] 接口字段类型与 API 文档一致
- [ ] 复用项目已有组件 / 框架
- [ ] 所有 open questions 已解决或显式 defer
- [ ] 所有 deferred items 已确认本期不实现
```

- [ ] **Step 4: Update `referral-home` expected implementation spec**

Insert before `## Verification Checklist`:

```markdown
## Visual Baselines

| Baseline ID | Image Path | Figma Node | Purpose | Required |
|---|---|---|---|---|
| default | snapshots/default.png | 120001:884 | implementation_visual_baseline | yes |
```

Prepend these checklist items:

```markdown
- [ ] 实现后逐个对比 `## Visual Baselines` 中 `Required=yes` 的 snapshot
- [ ] 对比项至少包括模块数量、标签、主/次层级、布局、颜色、间距、字号比例
- [ ] 若实现与 snapshot 有 intentional deviation,必须在验证记录中说明原因
```

- [ ] **Step 5: Update P15 fixture input implementation spec**

Replace `figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md` with:

```markdown
# Implementation Spec — sales-workbench

## Modules

- `SalesWorkbenchMetrics`

## Coding Boundary

This document is implementation input only. Business code starts only after explicit coding confirmation.

## Visual Baselines

| Baseline ID | Image Path | Figma Node | Purpose | Required |
|---|---|---|---|---|
| default | snapshots/default.png | 123075:3394 | implementation_visual_baseline | yes |

## Verification Checklist

- [ ] 实现后逐个对比 `## Visual Baselines` 中 `Required=yes` 的 snapshot
- [ ] 对比项至少包括模块数量、标签、主/次层级、布局、颜色、间距、字号比例
- [ ] 若实现与 snapshot 有 intentional deviation,必须在验证记录中说明原因

## Open Questions

- [ ] Confirm final empty-state image source.
```

- [ ] **Step 6: Review Task 3 changes**

Run:

```bash
rg -n "Visual Baselines|Required=yes|intentional deviation|raw Figma JSON" figma-emit-spec figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md
```

Expected: Phase E template and fixtures instruct coding agents to compare implementation against snapshots.

- [ ] **Step 7: Commit Task 3**

```bash
git add figma-emit-spec/references/spec-template.md figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md
git commit -m "docs: require snapshot checks in implementation specs"
```

### Task 4: Update Workflow Checkpoint Wording

**Files:**
- Modify: `figma-workflow/references/workflow-orchestration.md`
- Modify: `figma-workflow/references/progress-routing.md`
- Modify: `figma-workflow/scripts/figma-engineering-checkpoint.js`
- Modify: `figma-workflow/scripts/figma-engineering-checkpoint.test.js`
- Modify: `figma-workflow/tests/fixtures/engineering-checkpoint/pre-handoff.expected.md`

- [ ] **Step 1: Update workflow orchestration references**

In `workflow-orchestration.md`, replace the P15 product sentence in `## Handoff Boundary` with:

```markdown
- `assets-manifest.md`、`validation-report.md` 和 `snapshots/` 是 coding 前资源/验证输入,其中 `snapshots/` 是实现视觉对照基线。
```

In the trigger table, change P15 reason from asset validation only to:

```markdown
| P15 `figma-assets-validate` | 用户明确询问资源、snapshot 或验证 | Phase E review gate 后始终出现,用于资源清单、visual baselines 和 spec/snapshot consistency | `required_prompt` |
```

- [ ] **Step 2: Update progress routing references**

In `progress-routing.md`, replace the Assets / validation panel with:

```text
Assets / validation:
  [ ] assets-manifest.md (not generated)
  [ ] validation-report.md (not generated)
  [ ] snapshots/ (not generated)

Actions:
  [A] Generate assets manifest and visual baselines
  [Q] Run validation and spec-snapshot checks
```

Replace the P15 checkpoint line with:

```text
  [P15] assets-manifest.md / validation-report.md / snapshots/
```

Replace the explanatory sentence with:

```markdown
`figma-assets-validate` 在 Phase E review gate 之后始终是 `required_prompt`,用于生成资源清单、visual baselines,并验证 implementation spec 与 required snapshot 是否一致。
```

- [ ] **Step 3: Update engineering checkpoint label and reason**

In `figma-engineering-checkpoint.js`, change the P15 item to:

```js
  items.push({
    label: "Assets / visual validation",
    skill: "figma-assets-validate",
    product: "assets-manifest.md, validation-report.md",
    status: checkpoint === "pre-handoff"
      ? productStatus(featureDir, "assets-manifest.md, validation-report.md")
      : "not_applicable",
    recommendation: checkpoint === "pre-handoff" ? "required_prompt" : "available",
    reason: checkpoint === "pre-handoff"
      ? "pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning"
      : "available when the user asks about assets, snapshots, or validation",
    risk: "assets, visual baselines, and spec-snapshot consistency not reviewed before handoff",
  });
```

- [ ] **Step 4: Update engineering checkpoint tests**

In `figma-engineering-checkpoint.test.js`, update assertions that match the old P15 reason/risk to the new strings:

```js
assert.match(rendered, /Assets \/ visual validation/);
```

In the skip audit test item, use:

```js
reason: "pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning",
risk: "assets, visual baselines, and spec-snapshot consistency not reviewed before handoff",
```

- [ ] **Step 5: Update expected pre-handoff fixture**

In `pre-handoff.expected.md`, replace:

```text
[figma-assets-validate] Assets / validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff validation is recommended before planning
```

with:

```text
[figma-assets-validate] Assets / visual validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff assets, visual baselines, and spec-snapshot checks are recommended before planning
```

Update expected behavior bullets to include:

```markdown
- P15 generates or validates `assets-manifest.md`, `validation-report.md`, and required visual baselines.
```

- [ ] **Step 6: Run workflow script tests**

Run:

```bash
node figma-workflow/scripts/figma-engineering-checkpoint.test.js
```

Expected: all tests pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add figma-workflow/references/workflow-orchestration.md figma-workflow/references/progress-routing.md figma-workflow/scripts/figma-engineering-checkpoint.js figma-workflow/scripts/figma-engineering-checkpoint.test.js figma-workflow/tests/fixtures/engineering-checkpoint/pre-handoff.expected.md
git commit -m "docs: surface p15 visual validation in workflow"
```

### Task 5: Final Verification, Commit Hygiene, and PR

**Files:**
- Review all files changed in Tasks 1-4.

- [ ] **Step 1: Run repository status check**

Run:

```bash
git status --short
```

Expected: only files from this plan are modified.

- [ ] **Step 2: Run targeted searches**

Run:

```bash
rg -n "Visual Baselines|Spec-Snapshot Consistency|Spec-Snapshot Review Iterations|snapshots/|visual-baseline" figma-assets-validate figma-emit-spec figma-workflow
```

Expected: all three skills have consistent visual baseline terminology.

- [ ] **Step 3: Run Node tests**

Run:

```bash
node figma-workflow/scripts/figma-engineering-checkpoint.test.js
node figma-workflow/scripts/figma-validate-contracts.test.js
node figma-workflow/scripts/figma-diff.test.js
node figma-workflow/scripts/figma-cache.test.js
```

Expected: all tests pass.

- [ ] **Step 4: Check for forbidden claims**

Run:

```bash
rg -n "pixel-level|像素级|business code|业务代码|modify Figma|修改 Figma|raw Figma JSON" figma-assets-validate figma-emit-spec figma-workflow
```

Expected: matches reinforce boundaries: no pixel-level P15 regression, no business code, no Figma writes, no raw Figma JSON in implementation/snapshot metadata.

- [ ] **Step 5: Inspect staged diff**

Run:

```bash
git diff --stat
git diff --check
```

Expected: no whitespace errors; diff only contains planned docs/templates/fixtures/script wording.

- [ ] **Step 6: Commit any remaining verification/doc cleanup**

If Task 5 produced additional planned cleanup changes, commit them:

```bash
git add figma-assets-validate figma-emit-spec figma-workflow
git commit -m "docs: finalize p15 visual baseline workflow"
```

If there are no changes, do not create an empty commit.

- [ ] **Step 7: Push the branch**

Run:

```bash
git push -u origin codex/figma-p15-visual-baselines
```

Expected: branch pushes successfully.

- [ ] **Step 8: Open PR**

Run:

```bash
gh pr create --title "Add P15 visual baseline workflow" --body "## Summary
- document P15 visual baseline capture and metadata contract
- add Visual Baselines and spec-snapshot consistency sections to templates and fixtures
- require implementation specs to tell coding agents to compare required snapshots
- surface P15 visual validation in workflow checkpoint wording

## Verification
- node figma-workflow/scripts/figma-engineering-checkpoint.test.js
- node figma-workflow/scripts/figma-validate-contracts.test.js
- node figma-workflow/scripts/figma-diff.test.js
- node figma-workflow/scripts/figma-cache.test.js"
```

Expected: PR URL is printed.

## Self-Review

- Spec coverage: The plan maps every acceptance criterion to a task. Multiple snapshots are handled in Task 1 naming rules and Task 2 fixture rows. `implementation-spec.md` comparison instructions are handled in Task 3. P15 spec/snapshot checks and self-review iterations are handled in Tasks 1 and 2. Branch and PR are handled in Task 5.
- Placeholder scan: The plan contains no `TBD`, `TODO`, "implement later", or unspecified "write tests" steps. Code and Markdown snippets are explicit.
- Type consistency: Baseline fields use the same names across the skill contract, templates, fixtures, and implementation spec: `Baseline ID`, `Image Path`, `Metadata Path`, `Required`, `Purpose`, `Spec-Snapshot Consistency Check`, and `Spec-Snapshot Review Iterations`.
