# Plan P14: Figma UI Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `figma-ui-handoff` 能力,把已存在的 Figma workflow 产物整理成 `docs/design/<feature>/ui-handoff.md`,帮助设计/产品补齐上游输入质量。

**Architecture:** 这是 P14 的独立工程化 skill,读取 A/B/C2/D/P13/E 的 Markdown 产物并生成上游交接文档。实现时新增 `figma-ui-handoff/` skill 目录和模板,并在 `figma-workflow` 中提供可选入口;它不修改 Figma、不修改 Phase A-E 产物、不写业务代码。

**Tech Stack:** Markdown、YAML frontmatter、轻量 Markdown parsing、现有 figma-workflow-suite skill 结构和 fixture。

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md`
- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `figma-ui-understand/SKILL.md`
- `figma-ui-api-mapper/SKILL.md`
- `figma-design-token/SKILL.md`
- `figma-workflow/references/progress-routing.md`

## File Structure

```text
figma-ui-handoff/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── ui-handoff-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   ├── clarified-requirement.md
            │   ├── ui-understanding.md
            │   ├── component-mapping.md
            │   ├── design-token-patch.md
            │   ├── design-diff.md
            │   └── open-questions.md
            └── expected/
                └── ui-handoff.md

figma-workflow/
├── SKILL.md
└── references/
    └── progress-routing.md
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
| `figma-ui-handoff/SKILL.md` | P14 主指引,定义输入、输出、工作流和边界 |
| `figma-ui-handoff/README.md` | 仓库门面,说明 UI handoff 与 Phase E handoff 的区别 |
| `figma-ui-handoff/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-ui-handoff/references/ui-handoff-template.md` | `ui-handoff.md` 输出模板 |
| fixture | 覆盖 unknown、重复项、状态缺失、资产标注和 diff follow-up |
| `figma-workflow/*` | 增加可选 UI handoff 入口,不纳入 Phase A-E 完成判断 |
| Project catalogs | 暴露新 skill 给 Codex / Claude Code |

## Task List

- [ ] **Task 1:** 新建实现分支和目录骨架
- [ ] **Task 2:** 编写 `figma-ui-handoff/SKILL.md`
- [ ] **Task 3:** 编写 `ui-handoff-template.md`
- [ ] **Task 4:** 编写 README 和 OpenAI agent 配置
- [ ] **Task 5:** 新增 sales-workbench fixture
- [ ] **Task 6:** 更新 `figma-workflow` UI handoff 路由
- [ ] **Task 7:** 注册 skill 到项目级 catalog
- [ ] **Task 8:** 验证、提交、推送和 PR

---

### Task 1: 新建实现分支和目录骨架

**Files:**
- Create dir: `figma-ui-handoff/`
- Create dir: `figma-ui-handoff/agents/`
- Create dir: `figma-ui-handoff/references/`
- Create dir: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/`
- Create dir: `figma-ui-handoff/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p14-figma-ui-handoff
```

Expected:

- branch is `codex/p14-figma-ui-handoff`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-ui-handoff/agents \
         figma-ui-handoff/references \
         figma-ui-handoff/tests/fixtures/sales-workbench/inputs \
         figma-ui-handoff/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-ui-handoff -type d | sort
```

prints the created directories.

---

### Task 2: 编写 `figma-ui-handoff/SKILL.md`

**Files:**
- Create: `figma-ui-handoff/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-ui-handoff
description: figma-workflow-suite 的 P14 工程化组件。读取 docs/design/<feature>/ 下的上游产物,输出 ui-handoff.md,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
---
```

- [ ] **Step 2: 写 Position**

Include:

```markdown
# Figma UI Handoff

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` v4 的 P14 工程化能力。它生成面向设计/产品的 `ui-handoff.md`,不是 Phase E implementation handoff,也不是 coding 入口。

`ui-handoff.md` 是辅助产物,不属于 Phase A-E 的必需输入。
```

- [ ] **Step 3: 写 prerequisites**

Include:

```markdown
## Prerequisites

- `feature=<feature-name>`
- `docs/design/<feature>/` 存在
- 至少存在 `ui-understanding.md` 或 `component-mapping.md` 中的一份上游产物
```

- [ ] **Step 4: 写目标和边界**

Goal section must include:

- output exactly `docs/design/<feature>/ui-handoff.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- gather unknowns and gaps from existing products
- distinguish confirmed evidence from required action

Non-goals must include:

- 不修改 Figma 文件
- 不要求设计师使用特定设计系统
- 不生成 implementation spec
- 不替代 `figma-emit-spec`
- 不自动重跑任何 phase
- 不写业务代码
- 不下载真实资源

- [ ] **Step 5: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`.
2. Ensure `docs/design/<feature>/` exists.
3. Read available products: `clarified-requirement.md`, `ui-understanding.md`, `component-mapping.md`, `design-token-patch.md`, `design-diff.md`, `open-questions.md`.
4. Identify missing products and record them under `Known Gaps`.
5. Extract Figma selection requirements.
6. Extract text requirements, especially `characters` vs `node.name` issues.
7. Extract component / section naming gaps.
8. Extract repeat group hints.
9. Extract state coverage gaps.
10. Extract asset marking gaps.
11. Extract design diff follow-up when `design-diff.md` exists.
12. Generate `ui-handoff.md`.
13. Append `inputs.md` audit record.
14. Print self-check for orchestrator review.

- [ ] **Step 6: 写 self-check**

Include:

```markdown
## Self-Check

| Check | Warning |
|---|---|
| no upstream products | "没有可读取的上游产物,无法生成有效 UI handoff" |
| Known Gaps empty while upstream unknown exists | "上游存在 unknown 但 handoff 未列出 Known Gaps" |
| State Coverage missing | "状态覆盖未列出 loading/empty/error/permission" |
| Non-Goals missing | "必须明确本文件不是 implementation spec,不授权 coding" |
```

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "figma-ui-handoff|P14|ui-handoff.md|设计/产品|不是 Phase E|不写业务代码|Known Gaps|State Coverage|Self-Check" figma-ui-handoff/SKILL.md
```

Expected: all key phrases found.

---

### Task 3: 编写 `ui-handoff-template.md`

**Files:**
- Create: `figma-ui-handoff/references/ui-handoff-template.md`

- [ ] **Step 1: 写模板**

Use this exact section order:

```markdown
# UI Handoff — <feature>

> Generated by figma-ui-handoff@0.1.0 at <ISO8601>
> Purpose: upstream design/product handoff, not implementation spec

## Summary

| Area | Status | Notes |
|---|---|---|

## Required Figma Selection

| Requirement | Current Evidence | Required Action |
|---|---|---|

## Text Requirements

| Text / Area | Current Evidence | Required Action |
|---|---|---|

## Component / Section Naming Rules

| Area | Current Name | Recommended Name / Rule |
|---|---|---|

## Repeat Group Hints

| Pattern | Current Evidence | Required Action |
|---|---|---|

## State Coverage

| State | Current Evidence | Required Action |
|---|---|---|
| loading |  |  |
| empty |  |  |
| error |  |  |
| permission |  |  |

## Asset Marking

| Asset | Current Evidence | Required Action |
|---|---|---|

## Design Diff Follow-up

| Change | Impact | Required Action |
|---|---|---|

## Known Gaps

- [ ] <gap that must remain unresolved until design/product confirms>

## Non-Goals

- This document does not modify Figma.
- This document is not an implementation spec.
- This document does not authorize coding.
```

- [ ] **Step 2: Verify**

Run:

```bash
rg -n "UI Handoff|Summary|Required Figma Selection|Text Requirements|Component / Section Naming Rules|Repeat Group Hints|State Coverage|Asset Marking|Design Diff Follow-up|Known Gaps|Non-Goals" figma-ui-handoff/references/ui-handoff-template.md
```

Expected: all sections found.

---

### Task 4: 编写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-ui-handoff/README.md`
- Create: `figma-ui-handoff/agents/openai.yaml`

- [ ] **Step 1: README 写定位**

Include:

```markdown
# figma-ui-handoff

`figma-ui-handoff` 是 figma-workflow-suite v4 的 P14 工程化 skill。它读取 `docs/design/<feature>/` 下已有产物,生成 `ui-handoff.md`,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
```

- [ ] **Step 2: README 写边界**

Include:

```markdown
- `ui-handoff.md` 不是 Phase E implementation handoff。
- 不生成 implementation spec。
- 不修改 Figma 文件。
- 不写业务代码。
```

- [ ] **Step 3: openai.yaml**

Create:

```yaml
name: figma-ui-handoff
description: 读取 docs/design/<feature>/ 下已有产物,生成 ui-handoff.md,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
default_prompt: "使用 $figma-ui-handoff feature=<feature-name> 读取 docs/design/<feature>/ 下已有产物,输出 docs/design/<feature>/ui-handoff.md,并在 inputs.md 追加一条记录。不要修改 Figma 文件,不要生成 implementation spec,不要写业务代码。"
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma-ui-handoff|P14|ui-handoff.md|设计/产品|不是 Phase E|不写业务代码|default_prompt" figma-ui-handoff/README.md figma-ui-handoff/agents/openai.yaml
```

Expected: all key phrases found.

---

### Task 5: 新增 sales-workbench fixture

**Files:**
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/README.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/clarified-requirement.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/ui-understanding.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/component-mapping.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/design-token-patch.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/design-diff.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/inputs/open-questions.md`
- Create: `figma-ui-handoff/tests/fixtures/sales-workbench/expected/ui-handoff.md`

- [ ] **Step 1: 写 fixture README**

Include:

```markdown
# sales-workbench fixture

验证 `figma-ui-handoff` 能从销售工作台上游产物整理出给设计/产品的交接文档:

- Figma selection 需要包含完整页面和状态。
- text characters 需要确认。
- 重复指标卡需要标注 template / instance。
- loading / empty / error / permission 状态缺失。
- asset 来源需要标注。
- design diff 中的新增指标卡需要设计确认。
```

- [ ] **Step 2: 写 inputs**

Use compact Markdown fixtures containing:

- `ui-understanding.md`: `Repeated Patterns` with metric cards and `Open Questions` for state coverage.
- `component-mapping.md`: one `unknown` API/UI binding question.
- `design-token-patch.md`: one asset with unknown source.
- `design-diff.md`: one added metric card.
- `open-questions.md`: one unresolved product/design question.

- [ ] **Step 3: 写 expected output**

`expected/ui-handoff.md` must include:

- `Required Figma Selection`
- `Text Requirements`
- `Component / Section Naming Rules`
- `Repeat Group Hints`
- `State Coverage`
- `Asset Marking`
- `Design Diff Follow-up`
- `Known Gaps`
- `This document is not an implementation spec.`
- `This document does not authorize coding.`

- [ ] **Step 4: Verify fixture**

Run:

```bash
rg -n "Required Figma Selection|Text Requirements|Component / Section Naming Rules|Repeat Group Hints|State Coverage|Asset Marking|Design Diff Follow-up|Known Gaps|not an implementation spec|does not authorize coding" figma-ui-handoff/tests/fixtures/sales-workbench/expected/ui-handoff.md
```

Expected: all key phrases found.

---

### Task 6: 更新 `figma-workflow` UI handoff 路由

**Files:**
- Modify: `figma-workflow/SKILL.md`
- Modify: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: 在 progress-routing 加 UI handoff 状态**

Add:

````markdown
## UI handoff

当 `docs/design/<feature>/` 存在时,orchestrator 可以展示:

```text
UI handoff:
  [ ] ui-handoff.md (not generated)

Handoff actions:
  [U] Generate ui-handoff.md
  [V] View existing ui-handoff.md
```
````

- [ ] **Step 2: 写 UI handoff 边界**

Include:

```markdown
UI handoff 是面向设计/产品的上游交接文档,不是 Phase E implementation handoff。它不标记任何 Phase 完成,不阻塞 Phase E,不授权 coding。
```

- [ ] **Step 3: 在 SKILL.md 更新 v4 optional capability**

Add:

```markdown
`figma-workflow` 可以通过 `figma-ui-handoff` 生成 `ui-handoff.md`,用于提示设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。该入口不属于 Phase E handoff,也不触发 coding。
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "UI handoff|ui-handoff.md|figma-ui-handoff|设计/产品|不是 Phase E|不授权 coding|不阻塞 Phase E" figma-workflow/SKILL.md figma-workflow/references/progress-routing.md
```

Expected: all key phrases found.

---

### Task 7: 注册 skill 到项目级 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

- [ ] **Step 1: 更新 marketplace**

Add `figma-ui-handoff` with description:

```text
读取 docs/design/<feature>/ 下已有产物,生成 ui-handoff.md,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
```

- [ ] **Step 2: 更新 AGENTS**

Add:

```markdown
- `figma-ui-handoff`:读取已有 figma-workflow 产物,生成 `ui-handoff.md`,帮助设计/产品补齐上游交接信息(P14)。
```

- [ ] **Step 3: 更新 README**

Add:

```markdown
- `figma-ui-handoff`:生成 `ui-handoff.md`,用于给设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。
```

- [ ] **Step 4: v4 spec 增加 P14 spec 链接**

In P14 section, add:

```markdown
详细设计见 `docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md`。
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "figma-ui-handoff|ui-handoff.md|设计/产品|2026-05-21-figma-ui-handoff" .claude-plugin/marketplace.json AGENTS.md README.md docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 8: 验证、提交、推送和 PR

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run documentation checks**

```bash
rg -n "P14|Figma UI Handoff|figma-ui-handoff|ui-handoff.md|Required Figma Selection|Text Requirements|State Coverage|Asset Marking|Known Gaps|业务代码|implementation spec" \
  docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md \
  docs/superpowers/plans/2026-05-21-figma-ui-handoff.md \
  docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md

git diff --check
```

Expected:

- `rg` finds P14 contract and boundary terms.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm this PR is docs/spec only**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD
```

Expected names for this spec/plan PR:

```text
docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md
docs/superpowers/plans/2026-05-21-figma-ui-handoff.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md \
        docs/superpowers/plans/2026-05-21-figma-ui-handoff.md \
        docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
git commit -m "docs: add figma ui handoff plan"
```

- [ ] **Step 4: Push and PR**

```bash
git push -u origin codex/p14-figma-ui-handoff-spec-plan
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p14-figma-ui-handoff-spec-plan \
  --title "docs: add figma ui handoff plan" \
  --body "Adds P14 UI handoff design spec and implementation plan."
```

Expected: PR targets `docs/figma-workflow-suite-design`.

---

## Self-Review Checklist

- P14 的 UI handoff 不等于 Phase E implementation handoff。
- P14 输出 `ui-handoff.md`,不输出 implementation spec。
- P14 不修改 Figma 文件。
- P14 不要求特定设计系统。
- P14 不修改 A/B/C/D/E 产物。
- P14 不写业务代码。
- `ui-handoff.md` 覆盖 Required Figma Selection、Text Requirements、Component / Section Naming Rules、Repeat Group Hints、State Coverage、Asset Marking、Known Gaps。
