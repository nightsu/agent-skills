# Plan P13: Figma Design Diff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `figma-design-diff` 能力,基于 `.figma-cache/` 的 before / after snapshots 生成 `docs/design/<feature>/design-diff.md` 和 recommended rerun phases。

**Architecture:** 这是 P13 的独立工程化 skill,依赖 P12 cache helper 和 snapshot 约定。实现时新增 `figma-design-diff/` skill 目录和 `figma-workflow/scripts/figma-diff.js`,只读取 `.figma-cache/` evidence 并产出 Markdown diff,不修改 Phase A-E 产物、不写业务代码。

**Tech Stack:** Markdown、YAML frontmatter、Node.js 脚本、JSON fixture、现有 figma-workflow-suite skill 结构。

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-design-diff/README.md`
- `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`
- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `figma-workflow/references/progress-routing.md`
- `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/`

## File Structure

```text
figma-design-diff/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── design-diff-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   └── .figma-cache/
            │       └── snapshots/
            │           ├── baseline/
            │           └── current/
            └── expected/
                └── design-diff.md

figma-workflow/
├── SKILL.md
├── references/
│   └── progress-routing.md
└── scripts/
    └── figma-diff.js
```

Project-level catalog updates:

```text
.claude-plugin/marketplace.json
AGENTS.md
README.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-design-diff/SKILL.md` | P13 主指引,定义输入、输出、工作流和边界 |
| `figma-design-diff/README.md` | 仓库门面,说明 skill 在 suite v4 中的位置 |
| `figma-design-diff/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-design-diff/references/design-diff-template.md` | `design-diff.md` 输出模板 |
| `figma-workflow/scripts/figma-diff.js` | 结构化 JSON diff helper,供 skill 和 fixture 验证复用 |
| `figma-workflow/references/progress-routing.md` | orchestrator diff action 和展示规则 |
| `figma-workflow/SKILL.md` | 主 orchestrator 增加 design diff 可选入口 |
| fixture | 覆盖新增/删除/text/layout/token 变化和 rerun phase 推荐 |
| Project catalogs | 暴露新 skill 给 Codex / Claude Code |

## Task List

- [ ] **Task 1:** 新建实现分支和目录骨架
- [ ] **Task 2:** 编写 `figma-design-diff/SKILL.md`
- [ ] **Task 3:** 编写 `design-diff-template.md`
- [ ] **Task 4:** 实现 `figma-diff.js`
- [ ] **Task 5:** 编写 README 和 OpenAI agent 配置
- [ ] **Task 6:** 新增 sales-workbench diff fixture
- [ ] **Task 7:** 更新 `figma-workflow` diff 路由
- [ ] **Task 8:** 注册 skill 到项目级 catalog
- [ ] **Task 9:** 验证、提交、推送和 PR

---

### Task 1: 新建实现分支和目录骨架

**Files:**
- Create dir: `figma-design-diff/`
- Create dir: `figma-design-diff/agents/`
- Create dir: `figma-design-diff/references/`
- Create dir: `figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline/`
- Create dir: `figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current/`
- Create dir: `figma-design-diff/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p13-figma-design-diff
```

Expected:

- branch is `codex/p13-figma-design-diff`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-design-diff/agents \
         figma-design-diff/references \
         figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline/screenshots \
         figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current/screenshots \
         figma-design-diff/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-design-diff -type d | sort
```

prints the created directories.

---

### Task 2: 编写 `figma-design-diff/SKILL.md`

**Files:**
- Create: `figma-design-diff/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-design-diff
description: figma-workflow-suite 的 P13 工程化组件。基于 `.figma-cache/` 的 before / after snapshots 生成 design-diff.md,提示 Figma 改稿影响和建议重跑阶段。
---
```

- [ ] **Step 2: 写 Position**

Include:

```markdown
# Figma Design Diff

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` v4 的 P13 工程化能力,位于 P12 cache layer 之后、P14 UI handoff 之前。

它产出 `docs/design/<feature>/design-diff.md`。
它不产出或修改 Phase A-E 的核心产物。
```

- [ ] **Step 3: 写 prerequisites**

Include:

```markdown
## Prerequisites

- `feature=<feature-name>`
- `fileKey=<file-key>`
- `nodeId=<node-id>`
- `docs/design/<feature>/.figma-cache/` 存在
- 同一 file key + node id 至少有 baseline 和 current evidence
```

- [ ] **Step 4: 写目标和边界**

Goal section must include:

- output exactly `docs/design/<feature>/design-diff.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- compare only same file key + same node id in first version
- output recommended rerun phases

Non-goals must include:

- 不做跨 node diff
- 不做像素级 screenshot diff
- 不修改 A/B/C/D/E 产物
- 不自动重跑任何 phase
- 不修改 Figma 文件
- 不写业务代码
- 不下载真实图片资源

- [ ] **Step 5: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`, `fileKey=<file-key>`, `nodeId=<node-id>`.
2. Ensure `docs/design/<feature>/.figma-cache/` exists; if missing, stop and recommend P12 cache refresh.
3. Resolve baseline and current snapshots.
4. Reject if baseline/current file key or node id differ.
5. Compare metadata trees for added / removed / changed nodes.
6. Compare text fields and design context summaries.
7. Compare bounds, layout summaries and token summaries.
8. Classify severity.
9. Generate recommended rerun phases.
10. Write `design-diff.md`.
11. Append `inputs.md` audit record.
12. Print self-check for orchestrator review.

- [ ] **Step 6: 写 self-check**

Include:

```markdown
## Self-Check

| Check | Warning |
|---|---|
| baseline/current missing | "缺少 before/after snapshot,只能记录 baseline,不能生成有效 diff" |
| file key or node id mismatch | "P13 第一版只支持同一 file/node diff" |
| only unknown changes | "存在无法归类变化,建议人工 review" |
| recommended rerun phases empty but changes exist | "变化存在但没有重跑建议,需要人工补充" |
```

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "figma-design-diff|P13|design-diff.md|baseline|current|recommended rerun|不修改 A/B/C/D/E|不写业务代码|Self-Check" figma-design-diff/SKILL.md
```

Expected: all key phrases found.

---

### Task 3: 编写 `design-diff-template.md`

**Files:**
- Create: `figma-design-diff/references/design-diff-template.md`

- [ ] **Step 1: 写模板**

Use this exact section order:

```markdown
# Design Diff — <feature>

> Generated by figma-design-diff@0.1.0 at <ISO8601>
> Figma: <file-key> / <node-id>
> Baseline: <snapshot-id>
> Current: <snapshot-id>

## Summary

| Severity | Count | Notes |
|---|---:|---|

## Compared Snapshots

| Snapshot | Captured At | Source | Content Hash |
|---|---|---|---|

## Changed Nodes

| Node | Change Type | Before | After | Impact |
|---|---|---|---|---|

## Added Nodes

| Node | Type | Parent | Likely Module |
|---|---|---|---|

## Removed Nodes

| Node | Type | Previous Parent | Likely Module |
|---|---|---|---|

## Text Changes

| Node | Before | After | Recommended Action |
|---|---|---|---|

## Layout Changes

| Node | Property | Before | After | Recommended Action |
|---|---|---|---|---|

## Visual Token Signals

| Token Type | Node | Before | After | Recommended Action |
|---|---|---|---|---|

## Asset Signals

| Asset | Change | Recommended Action |
|---|---|---|

## Recommended Rerun Phases

| Phase | Recommendation | Reason |
|---|---|---|

## Open Questions

- [ ] <question that must be answered before coding>
```

- [ ] **Step 2: Verify**

Run:

```bash
rg -n "Design Diff|Summary|Compared Snapshots|Changed Nodes|Added Nodes|Removed Nodes|Text Changes|Layout Changes|Visual Token Signals|Recommended Rerun Phases|Open Questions" figma-design-diff/references/design-diff-template.md
```

Expected: all sections found.

---

### Task 4: 实现 `figma-diff.js`

**Files:**
- Create: `figma-workflow/scripts/figma-diff.js`

- [ ] **Step 1: 创建脚本**

Implement Node.js ESM with built-in modules only:

```js
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
```

Export:

- `readJson(filePath)`
- `hashJson(value)`
- `indexNodes(metadata)`
- `diffNodes(beforeMetadata, afterMetadata)`
- `diffText(beforeContext, afterContext)`
- `diffLayout(beforeMetadata, afterMetadata)`
- `diffTokens(beforeContext, afterContext)`
- `recommendRerunPhases(diff)`
- `renderDesignDiffMarkdown(diff)`

- [ ] **Step 2: Implement node index behavior**

`indexNodes(metadata)` must return a `Map` keyed by node id. For each node keep:

```js
{
  id,
  name,
  type,
  parentId,
  text,
  bounds,
  fills,
  typography,
  radius,
  spacing
}
```

Support both:

- `metadata.node.children_summary`
- recursive `metadata.node.children`

- [ ] **Step 3: Implement change categories**

`diffNodes` must produce:

```js
{
  addedNodes: [],
  removedNodes: [],
  changedNodes: []
}
```

Classify:

- missing before + present after → `node_added`
- present before + missing after → `node_removed`
- same id but name/type/text/bounds changed → `node_changed`

- [ ] **Step 4: Implement rerun recommendations**

Rules:

```js
node_added/node_removed => B, C-low, D, E
text_changed => B review, E
layout_changed => B review, D, E
token_changed => D, E
asset_changed => D review, P15 assets
unknown_changed => Manual review
```

- [ ] **Step 5: Add CLI mode**

Support:

```bash
node figma-workflow/scripts/figma-diff.js \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current
```

Expected: prints Markdown to stdout.

- [ ] **Step 6: Verify**

Run:

```bash
node figma-workflow/scripts/figma-diff.js \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current \
  > /tmp/sales-workbench-design-diff.md
rg -n "Design Diff|Changed Nodes|Text Changes|Layout Changes|Recommended Rerun Phases|Phase B|Phase D|Phase E" /tmp/sales-workbench-design-diff.md
```

Expected: command exits 0 and key sections exist.

---

### Task 5: 编写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-design-diff/README.md`
- Create: `figma-design-diff/agents/openai.yaml`

- [ ] **Step 1: README 写定位**

Include:

```markdown
# figma-design-diff

`figma-design-diff` 是 figma-workflow-suite v4 的 P13 工程化 skill。它基于 `.figma-cache/` before / after snapshots 生成 `docs/design/<feature>/design-diff.md`,帮助用户判断 Figma 改稿后要重跑哪些阶段。
```

- [ ] **Step 2: README 写边界**

Include:

```markdown
- 不修改 Phase A-E 产物。
- 不自动重跑任何 phase。
- 不写业务代码。
- 不做像素级 screenshot diff。
```

- [ ] **Step 3: openai.yaml**

Create:

```yaml
name: figma-design-diff
description: 基于 .figma-cache before/after snapshots 生成 design-diff.md,提示 Figma 改稿影响和 recommended rerun phases。
default_prompt: "使用 $figma-design-diff feature=<feature-name> fileKey=<file-key> nodeId=<node-id> 对比 docs/design/<feature>/.figma-cache/ 的 before/current evidence,输出 docs/design/<feature>/design-diff.md,并在 inputs.md 追加一条记录。不要修改 Phase A-E 产物,不要写业务代码。"
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma-design-diff|P13|design-diff.md|\\.figma-cache|不写业务代码|default_prompt" figma-design-diff/README.md figma-design-diff/agents/openai.yaml
```

Expected: all key phrases found.

---

### Task 6: 新增 sales-workbench diff fixture

**Files:**
- Create: `figma-design-diff/tests/fixtures/sales-workbench/README.md`
- Create: baseline/current cache JSON under `figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/`
- Create: `figma-design-diff/tests/fixtures/sales-workbench/expected/design-diff.md`

- [ ] **Step 1: 写 fixture README**

Include:

```markdown
# sales-workbench fixture

验证 `figma-design-diff` 能识别销售工作台 Figma 改稿:

- 新增一个指标卡片。
- 修改一个标题文案。
- 修改一个卡片宽度。
- 修改一个 token summary。

预期输出 `design-diff.md`,并建议重跑 Phase B / C-low / D / E。
```

- [ ] **Step 2: 写 baseline metadata**

Create `baseline/metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json` with:

```json
{
  "file_key": "YclTRHKbwKZYdt8uY52fkw",
  "node_id": "122924:5188",
  "node": {
    "id": "122924:5188",
    "name": "后台 销售工作台",
    "type": "FRAME",
    "children": [
      {
        "id": "card-call-out-rate",
        "name": "外呼率",
        "type": "FRAME",
        "bounds": {"x": 24, "y": 120, "width": 240, "height": 96},
        "children": [
          {"id": "text-call-out-rate-title", "name": "外呼率", "type": "TEXT", "text": "外呼率"}
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: 写 current metadata**

Create `current/metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json` with:

```json
{
  "file_key": "YclTRHKbwKZYdt8uY52fkw",
  "node_id": "122924:5188",
  "node": {
    "id": "122924:5188",
    "name": "后台 销售工作台",
    "type": "FRAME",
    "children": [
      {
        "id": "card-call-out-rate",
        "name": "首次外呼率",
        "type": "FRAME",
        "bounds": {"x": 24, "y": 120, "width": 260, "height": 96},
        "children": [
          {"id": "text-call-out-rate-title", "name": "首次外呼率", "type": "TEXT", "text": "首次外呼率"}
        ]
      },
      {
        "id": "card-new-effective-call-rate",
        "name": "有效通话率",
        "type": "FRAME",
        "bounds": {"x": 300, "y": 120, "width": 240, "height": 96},
        "children": [
          {"id": "text-effective-call-rate-title", "name": "有效通话率", "type": "TEXT", "text": "有效通话率"}
        ]
      }
    ]
  }
}
```

- [ ] **Step 4: 写 baseline/current design context**

Baseline token:

```json
{
  "modules": [{"name": "首触效率", "api_section": "firstContactSection"}],
  "tokens": {
    "card.background": "#FFFFFF",
    "card.radius": 8
  }
}
```

Current token:

```json
{
  "modules": [{"name": "首触效率", "api_section": "firstContactSection"}],
  "tokens": {
    "card.background": "#F8FAFF",
    "card.radius": 8
  }
}
```

- [ ] **Step 5: 写 expected design diff**

Expected file must include:

- `card-new-effective-call-rate` in Added Nodes
- `外呼率` → `首次外呼率` in Text Changes
- width `240` → `260` in Layout Changes
- `card.background` `#FFFFFF` → `#F8FAFF` in Visual Token Signals
- Recommended rerun phases include `B`, `C-low`, `D`, `E`

- [ ] **Step 6: Verify fixture**

Run:

```bash
node figma-workflow/scripts/figma-diff.js \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current \
  > /tmp/sales-workbench-design-diff.md
diff -u figma-design-diff/tests/fixtures/sales-workbench/expected/design-diff.md /tmp/sales-workbench-design-diff.md
```

Expected: no diff.

---

### Task 7: 更新 `figma-workflow` diff 路由

**Files:**
- Modify: `figma-workflow/SKILL.md`
- Modify: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: 在 progress-routing 加 design diff 状态**

Add:

````markdown
## Design diff

当 `.figma-cache/` 存在时,orchestrator 可以展示:

```text
Design diff:
  [ ] design-diff.md (not generated)

Diff actions:
  [D] Generate design-diff.md from latest cache snapshots
  [V] View existing design-diff.md
```
````

- [ ] **Step 2: 写 diff action 边界**

Include:

```markdown
Diff action 不标记任何 Phase 完成,不自动覆盖 A/B/C/D/E 产物,不替代 review gate。
```

- [ ] **Step 3: 在 SKILL.md 更新 non-goals**

Replace the old P13 non-goal wording:

```markdown
- ❌ 不做 Figma 改稿 diff
```

with:

```markdown
- ✅ 可通过 `figma-design-diff` 生成 `design-diff.md`
- ❌ 不根据 diff 自动重跑阶段或覆盖产物
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "Design diff|design-diff.md|figma-design-diff|Diff action|不自动覆盖|不根据 diff 自动重跑" figma-workflow/SKILL.md figma-workflow/references/progress-routing.md
```

Expected: all key phrases found.

---

### Task 8: 注册 skill 到项目级 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

- [ ] **Step 1: 更新 marketplace**

Add `figma-design-diff` with description:

```text
基于 .figma-cache before/after snapshots 生成 design-diff.md,提示 Figma 改稿影响和建议重跑阶段。
```

- [ ] **Step 2: 更新 AGENTS**

Add:

```markdown
- `figma-design-diff`:基于 `.figma-cache/` before/current evidence 生成 `design-diff.md`,提示 Figma 改稿影响和建议重跑阶段(P13)。
```

- [ ] **Step 3: 更新 README**

Add:

```markdown
- `figma-design-diff`:基于 `.figma-cache/` before/current evidence 生成 `design-diff.md`,用于改稿影响 review。
```

- [ ] **Step 4: v4 spec 增加 P13 spec 链接**

In P13 section, add:

```markdown
详细设计见 `docs/superpowers/specs/2026-05-21-figma-design-diff/README.md`。
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "figma-design-diff|design-diff.md|\\.figma-cache|2026-05-21-figma-design-diff" .claude-plugin/marketplace.json AGENTS.md README.md docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 9: 验证、提交、推送和 PR

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run documentation checks**

```bash
rg -n "P13|Figma Design Diff|figma-design-diff|design-diff.md|baseline|current|snapshot|recommended rerun|业务代码|review gate" \
  docs/superpowers/specs/2026-05-21-figma-design-diff/README.md \
  docs/superpowers/plans/2026-05-21-figma-design-diff.md \
  docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md

git diff --check
```

Expected:

- `rg` finds P13 contract and boundary terms.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm this PR is docs/spec only**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD
```

Expected names for this spec/plan PR:

```text
docs/superpowers/specs/2026-05-21-figma-design-diff/README.md
docs/superpowers/plans/2026-05-21-figma-design-diff.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-figma-design-diff/README.md \
        docs/superpowers/plans/2026-05-21-figma-design-diff.md \
        docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
git commit -m "docs: add figma design diff plan"
```

- [ ] **Step 4: Push and PR**

```bash
git push -u origin codex/p13-figma-design-diff-spec-plan
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p13-figma-design-diff-spec-plan \
  --title "docs: add figma design diff plan" \
  --body "Adds P13 design diff design spec and implementation plan."
```

Expected: PR targets `docs/figma-workflow-suite-design`.

---

## Self-Review Checklist

- P13 依赖 P12 `.figma-cache/`。
- P13 第一版只支持同一 file key + node id。
- P13 不做像素级 screenshot diff。
- P13 只产出 `design-diff.md` 和 audit 记录。
- P13 不修改 A/B/C/D/E 产物。
- P13 不写业务代码。
- `Recommended Rerun Phases` 覆盖 B/C-low/D/E。
