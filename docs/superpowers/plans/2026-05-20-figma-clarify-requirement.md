# Plan P7: `figma-clarify-requirement` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-clarify-requirement` skill(figma-workflow-suite phase A),把用户自然语言需求整理成 `docs/design/<feature>/clarified-requirement.md`。

**Architecture:** 这是一个全新轻量 skill,目录骨架沿用现有 figma suite skill: `SKILL.md` + `README.md` + `agents/openai.yaml` + `references/` + `tests/fixtures/`。它只生产 Phase A 产物,不做 Figma 深度分析、不做 API 字段绑定、不写业务代码。

**Tech Stack:** Markdown、YAML frontmatter、人工 review fixture、现有 figma-workflow-suite 文档规范。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/03-orchestrator.md`
- `figma-workflow/templates/clarified-requirement.md`

## File Structure

```text
figma-clarify-requirement/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── clarified-requirement-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   └── user-request.md
            └── expected/
                └── clarified-requirement.md
```

Project-level catalog updates:

```text
.claude-plugin/marketplace.json
AGENTS.md
README.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-clarify-requirement/SKILL.md` | Phase A 主指引,定义输入、输出、工作流、边界和 review gate 自查 |
| `figma-clarify-requirement/README.md` | 仓库门面,说明 skill 在 suite 中的位置和快速调用方式 |
| `figma-clarify-requirement/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-clarify-requirement/references/clarified-requirement-template.md` | Phase A 输出模板,从现有 `figma-workflow/templates/clarified-requirement.md` 收敛而来 |
| `figma-clarify-requirement/tests/fixtures/sales-workbench/` | 回归 fixture,使用真实 MVP 验证中的销售工作台主题 |

## Task List

- [ ] **Task 1:** 新建实现分支和目录骨架
- [ ] **Task 2:** 写 `SKILL.md`
- [ ] **Task 3:** 写 reference template
- [ ] **Task 4:** 写 README 和 OpenAI agent 配置
- [ ] **Task 5:** 新增 sales-workbench fixture
- [ ] **Task 6:** 注册 skill 到项目级 catalog
- [ ] **Task 7:** 文档验证、提交、推送和 PR

---

### Task 1: 新建实现分支和目录骨架

**Files:**
- Create dir: `figma-clarify-requirement/`
- Create dir: `figma-clarify-requirement/agents/`
- Create dir: `figma-clarify-requirement/references/`
- Create dir: `figma-clarify-requirement/tests/fixtures/sales-workbench/inputs/`
- Create dir: `figma-clarify-requirement/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p7-figma-clarify-requirement
```

Expected:

- branch is `codex/p7-figma-clarify-requirement`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-clarify-requirement/agents \
         figma-clarify-requirement/references \
         figma-clarify-requirement/tests/fixtures/sales-workbench/inputs \
         figma-clarify-requirement/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-clarify-requirement -type d | sort
```

prints the five directories above.

---

### Task 2: 写 `SKILL.md`

**Files:**
- Create: `figma-clarify-requirement/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-clarify-requirement
description: figma-workflow-suite 的 phase A 组件。把用户自然语言需求、业务背景和约束整理为 clarified-requirement.md,作为后续 UI 理解、API 映射和实现规格的需求事实来源。
---
```

- [ ] **Step 2: 写 Position and prerequisites**

Include:

```markdown
# Figma Clarify Requirement

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的 phase A:

phase A → phase B → phase C1 → phase C2 → phase D → phase E
clarified-requirement.md → ui-understanding.md → api-mapping.md → component-mapping.md → design-token-patch.md → implementation-spec.md

## Prerequisites

- feature name,推荐 kebab-case
- 用户的自然语言需求或任务描述
- 可选:Figma URL、PRD、已有页面路径、接口草案
```

- [ ] **Step 3: 写目标和边界**

The goal section must say:

- output is exactly `docs/design/<feature>/clarified-requirement.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- capture known facts separately from open questions

The "不承担" section must include:

- 不调用 Figma MCP 做深度 UI 分析
- 不做 API 字段映射
- 不产出 `ui-understanding.md`
- 不修改业务代码
- 不把未确认事项写成确定事实

- [ ] **Step 4: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`; reject missing feature.
2. Ensure `docs/design/<feature>/` exists.
3. Gather user-provided requirement facts.
4. Ask at most 3 clarification questions only if blocking facts are missing.
5. Draft `clarified-requirement.md` using the reference template.
6. Mark unresolved but non-blocking items under `Open Questions`.
7. Append `inputs.md` entry with source type, timestamp, and clarifier version.
8. Print review gate with Proceed / Re-run / Pause / Exit choices.

- [ ] **Step 5: 写输出结构**

Document this output schema:

```markdown
# Clarified Requirement — <feature>

> Generated by figma-clarify-requirement@0.1.0 at <ISO8601>

## Goal
## Scope
## Out of Scope
## User States
## Interaction
## Constraints
## Open Questions
```

- [ ] **Step 6: 写 self-check**

Self-check rules:

| Check | Warning |
|---|---|
| `Goal` empty | "Goal 缺失,不能进入 Phase B" |
| `Scope` empty | "Scope 缺失,不能进入 Phase B" |
| `Open Questions` contains non-deferred items | "存在未解决问题,建议 review 后再继续" |
| any template placeholder marker remains | "产物仍含模板占位,orchestrator 会视为未完成" |

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "phase A|clarified-requirement.md|Open Questions|不修改业务代码|review gate|inputs.md" figma-clarify-requirement/SKILL.md
```

Expected: all key phrases found.

- [ ] **Step 8: Commit**

```bash
git add figma-clarify-requirement/SKILL.md
git commit -m "feat(figma-clarify-requirement): add phase A skill"
```

---

### Task 3: 写 reference template

**Files:**
- Create: `figma-clarify-requirement/references/clarified-requirement-template.md`

- [ ] **Step 1: Copy and harden template**

Use `figma-workflow/templates/clarified-requirement.md` as the base, but remove HTML placeholder comments from the expected final output. The reference template must contain:

```markdown
# Clarified Requirement — <feature>

> Generated by figma-clarify-requirement@<version> at <ISO8601>

## Goal

## Scope

## Out of Scope

## User States

## Interaction

## Constraints

## Open Questions
```

Add guidance below the template:

- `Open Questions` items may use `[deferred]` when explicitly out of scope for this implementation.
- Empty `Goal` or `Scope` means the product is not ready for Phase B.
- Facts inferred by the agent must be marked `(INFERRED)`.

- [ ] **Step 2: Verify**

Run:

```bash
rg -n "Generated by figma-clarify-requirement|\\[deferred\\]|\\(INFERRED\\)|Goal|Scope" figma-clarify-requirement/references/clarified-requirement-template.md
```

Expected: all phrases found.

- [ ] **Step 3: Commit**

```bash
git add figma-clarify-requirement/references/clarified-requirement-template.md
git commit -m "docs(figma-clarify-requirement): add clarified requirement template"
```

---

### Task 4: 写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-clarify-requirement/README.md`
- Create: `figma-clarify-requirement/agents/openai.yaml`

- [ ] **Step 1: Write README**

`README.md` must include:

```markdown
# figma-clarify-requirement

Part of the **figma-workflow-suite** —— phase A.
把用户自然语言需求整理为 `clarified-requirement.md`,作为后续 phase B/C/D/E 的需求事实来源。

## Quick start

figma-clarify-requirement feature=<feature-name>

## Outputs

- `docs/design/<feature>/clarified-requirement.md`
- `docs/design/<feature>/inputs.md`

## 上下游

phase A → phase B
clarified-requirement.md → figma-ui-understand / ui-understanding.md
```

- [ ] **Step 2: Write OpenAI config**

`agents/openai.yaml` must be:

```yaml
interface:
  display_name: "Figma Clarify Requirement"
  short_description: "把用户需求整理成 clarified-requirement.md"
  default_prompt: "使用 $figma-clarify-requirement feature=<feature-name> 把用户自然语言需求、业务背景、约束和待确认项整理为 docs/design/<feature>/clarified-requirement.md,并在 inputs.md 追加一条记录。不要写业务代码,不要调用 Figma 深度分析。"
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "phase A|clarified-requirement.md|不要写业务代码|default_prompt" figma-clarify-requirement/README.md figma-clarify-requirement/agents/openai.yaml
```

Expected: all phrases found.

- [ ] **Step 4: Commit**

```bash
git add figma-clarify-requirement/README.md figma-clarify-requirement/agents/openai.yaml
git commit -m "docs(figma-clarify-requirement): add README and agent config"
```

---

### Task 5: 新增 sales-workbench fixture

**Files:**
- Create: `figma-clarify-requirement/tests/fixtures/sales-workbench/README.md`
- Create: `figma-clarify-requirement/tests/fixtures/sales-workbench/inputs/user-request.md`
- Create: `figma-clarify-requirement/tests/fixtures/sales-workbench/expected/clarified-requirement.md`

- [ ] **Step 1: Write fixture README**

README must explain:

- Fixture topic: 后台销售工作台
- Source: real MVP smoke test
- Purpose: verify phase A output shape, boundary, and open question handling
- This fixture does not call Figma MCP and does not implement code

- [ ] **Step 2: Write user request input**

Use this concrete input:

```markdown
# User Request — sales-workbench

请基于 Figma 节点实现后台销售工作台指标区。

技术栈: React + Vite + TypeScript。

页面需要展示三个业务阶段:
- 首联
- 需求
- 转化

接口返回值包含:
- firstContactSection
- demandSection
- conversionSection

每个指标字段都是:

```ts
type MetricValue = {
  denominator: number;
  numerator: number;
  percent: number;
};
```

本期使用 mock 数据验证 workflow MVP,不做真实后端联调。
```

- [ ] **Step 3: Write expected clarified requirement**

Expected file must include these facts:

- Goal: implement sales workbench metric section and validate workflow.
- Scope: three sections, metric cards, mock API, loading/success states.
- Out of Scope: filters, drilldown, real backend integration, metric explanation modal.
- User States: loading, success, deferred empty/error.
- Interaction: help icon is informational only.
- Constraints: React/Vite/TS, no business code before Phase E handoff.
- Open Questions: deferred metric explanation copy and detailed error states.

- [ ] **Step 4: Verify fixture**

Run:

```bash
rg -n "Sales Workbench|Goal|Scope|Out of Scope|User States|Open Questions|\\[deferred\\]|Phase E" figma-clarify-requirement/tests/fixtures/sales-workbench
```

Expected: all phrases found.

- [ ] **Step 5: Commit**

```bash
git add figma-clarify-requirement/tests/fixtures/sales-workbench
git commit -m "test(figma-clarify-requirement): add sales workbench fixture"
```

---

### Task 6: 注册 skill 到项目级 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Update marketplace**

Add `./figma-clarify-requirement` to `.claude-plugin/marketplace.json` before `./figma-ui-api-mapper`:

```json
"./figma-clarify-requirement",
"./figma-ui-api-mapper",
```

- [ ] **Step 2: Update AGENTS.md**

Add this bullet in `## 当前技能` near the figma suite entries:

```markdown
- `figma-clarify-requirement`:把用户自然语言需求整理为 clarified-requirement.md(figma-workflow-suite 的 phase A)。
```

- [ ] **Step 3: Update README.md**

Add this bullet in `## 已包含的技能` near the figma suite entries:

```markdown
- `figma-clarify-requirement`:把用户需求整理成 clarified-requirement.md(figma-workflow-suite 的 phase A)
```

- [ ] **Step 4: Verify catalog updates**

Run:

```bash
rg -n "figma-clarify-requirement" .claude-plugin/marketplace.json AGENTS.md README.md
```

Expected: 3 matches.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/marketplace.json AGENTS.md README.md
git commit -m "chore: register figma-clarify-requirement skill"
```

---

### Task 7: 文档验证、提交、推送和 PR

**Files:**
- Verify all files under `figma-clarify-requirement/`
- Verify project catalog updates

- [ ] **Step 1: Run verification**

```bash
find figma-clarify-requirement -type f | sort
rg -n "figma-clarify-requirement|clarified-requirement.md|phase A|不修改业务代码|Open Questions" figma-clarify-requirement .claude-plugin/marketplace.json AGENTS.md README.md
git diff --check
```

Expected:

- file list includes `SKILL.md`, `README.md`, `agents/openai.yaml`, `references/clarified-requirement-template.md`, and fixture files.
- `rg` finds phase A, output file, boundary, and open question language.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm no implementation code was changed**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD | rg '^(src|app|components|pages)/' || true
```

Expected: no output.

- [ ] **Step 3: Push and PR**

```bash
git push -u origin codex/p7-figma-clarify-requirement
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p7-figma-clarify-requirement \
  --title "feat: add figma clarify requirement skill" \
  --body "Adds the phase A figma-clarify-requirement skill for the figma-workflow-suite. It outputs clarified-requirement.md and does not write business code."
```

---

## Self-Review Checklist

- [ ] The skill only produces `clarified-requirement.md` and `inputs.md`.
- [ ] The skill does not overlap `figma-ui-understand`, `figma-ui-api-mapper`, `figma-design-token`, or `figma-emit-spec`.
- [ ] The fixture proves deferred open questions are preserved.
- [ ] Project catalogs expose the new skill.
- [ ] No business code or unrelated files are changed.

## Out of Scope

- Implementing `figma-ui-understand`.
- Implementing `figma-api-first`.
- Updating `figma-workflow` routing for v2.
- Calling Figma MCP.
- Writing application code.
