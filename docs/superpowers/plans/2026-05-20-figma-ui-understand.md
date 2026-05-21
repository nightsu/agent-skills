# Plan P8: `figma-ui-understand` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-ui-understand` skill(figma-workflow-suite phase B),从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,输出 `docs/design/<feature>/ui-understanding.md`。

**Architecture:** 这是一个全新轻量 skill,目录骨架沿用现有 figma suite skill: `SKILL.md` + `README.md` + `agents/openai.yaml` + `references/` + `tests/fixtures/`。它读取 phase A 的 `clarified-requirement.md` 作为业务语义约束,调用 Figma MCP 获取结构和截图上下文,只生产 Phase B 产物,不做 API 字段绑定、不写业务代码。

**Tech Stack:** Markdown、YAML frontmatter、Figma MCP、人工 review fixture、现有 figma-workflow-suite 文档规范。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/03-orchestrator.md`
- `figma-workflow/templates/ui-understanding.md`
- `figma-clarify-requirement/SKILL.md`

## File Structure

```text
figma-ui-understand/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── ui-understanding-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   ├── clarified-requirement.md
            │   └── figma-node-summary.md
            └── expected/
                └── ui-understanding.md
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
| `figma-ui-understand/SKILL.md` | Phase B 主指引,定义输入、Figma MCP 调用、输出结构、边界和 review gate 自查 |
| `figma-ui-understand/README.md` | 仓库门面,说明 skill 在 suite 中的位置和快速调用方式 |
| `figma-ui-understand/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-ui-understand/references/ui-understanding-template.md` | Phase B 输出模板,从现有 `figma-workflow/templates/ui-understanding.md` 收敛而来 |
| `figma-ui-understand/tests/fixtures/sales-workbench/` | 回归 fixture,复用真实 MVP 验证中的销售工作台主题 |

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
- Create dir: `figma-ui-understand/`
- Create dir: `figma-ui-understand/agents/`
- Create dir: `figma-ui-understand/references/`
- Create dir: `figma-ui-understand/tests/fixtures/sales-workbench/inputs/`
- Create dir: `figma-ui-understand/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p8-figma-ui-understand
```

Expected:

- branch is `codex/p8-figma-ui-understand`
- working tree is clean
- branch contains merged P7 `figma-clarify-requirement/`

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-ui-understand/agents \
         figma-ui-understand/references \
         figma-ui-understand/tests/fixtures/sales-workbench/inputs \
         figma-ui-understand/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-ui-understand -type d | sort
```

prints the skill root plus `agents`, `references`, `tests`, `tests/fixtures`, `tests/fixtures/sales-workbench`, `inputs`, and `expected`.

---

### Task 2: 写 `SKILL.md`

**Files:**
- Create: `figma-ui-understand/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-ui-understand
description: figma-workflow-suite 的 phase B 组件。从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,输出 ui-understanding.md,作为后续 API 映射和组件映射的 UI 事实来源。
---
```

- [ ] **Step 2: 写 Position and prerequisites**

Include:

```markdown
# Figma UI Understand

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的 phase B:

phase A → phase B → phase C-up → phase C-low → phase D → phase E
clarified-requirement.md → ui-understanding.md → api-mapping.md → component-mapping.md → design-token-patch.md → implementation-spec.md

## Prerequisites

- feature name,推荐 kebab-case
- `docs/design/<feature>/clarified-requirement.md`(phase A 产物,建议存在且非占位)
- Figma file key
- Figma node id(形如 `123:456`)
```

- [ ] **Step 3: 写目标和边界**

The goal section must say:

- output is exactly `docs/design/<feature>/ui-understanding.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- use phase A to calibrate business meaning
- separate observed UI facts from inferred UI semantics

The "不承担" section must include:

- 不做 API 字段绑定
- 不产出 `api-mapping.md`
- 不产出 `component-mapping.md`
- 不修改业务代码
- 不把 `node.name` 当作真实业务文案
- 不读取传入 node 之外的兄弟页面或 frame

- [ ] **Step 4: 写 Figma MCP 调用规则**

The workflow must require these Figma MCP calls:

1. `get_metadata` — 获取节点层级、尺寸、类型、位置、children。
2. `get_design_context` — 获取真实 text characters、组件线索和视觉上下文。
3. `get_screenshot` — 获取整体截图,用于校验页面结构和主要区域是否漏识别。

Add explicit rules:

- `node.name` can only help identify layers; real copy must come from text `characters`.
- Only read the passed node and descendants.
- Do not inspect sibling frames, pages, or unrelated nodes.
- Screenshot is a cross-check, not the sole source of truth.

- [ ] **Step 5: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`; reject missing feature.
2. Ensure `docs/design/<feature>/` exists.
3. Read `clarified-requirement.md`; if missing, continue only with warning and mark requirement context as partial.
4. Collect Figma file key and node id.
5. Call `get_metadata`, `get_design_context`, and `get_screenshot`.
6. Identify page structure and major regions.
7. Detect repeated patterns such as metric cards, lists, tables, tabs, filters, and sections.
8. Map visual regions to suspected business components.
9. Classify UI facts as `observed`, `inferred`, or `unknown`.
10. Write `ui-understanding.md` using the reference template.
11. Append `inputs.md` entry with source type, figma file key, node id, timestamp, and skill version.
12. Print review gate with Proceed / Re-run / Pause / Exit choices.

- [ ] **Step 6: 写输出结构**

Document this output schema:

```markdown
# UI Understanding — <feature>

> Generated by figma-ui-understand@0.1.0 at <ISO8601>
> Source: figma file=<file_key> node=<node_id> (<node_name>)

## Page Structure
## Suspected Components
## Repeated Patterns
## Static / Dynamic UI Guess
## Visual Notes
## Non-business UI To Ignore
## Open Questions
```

- [ ] **Step 7: 写 self-check**

Self-check rules:

| Check | Warning |
|---|---|
| `Page Structure` empty | "Page Structure 缺失,不能进入 Phase C-low" |
| `Suspected Components` empty | "Suspected Components 缺失,建议 review 后再继续" |
| missing screenshot confirmation | "未使用截图校验整体结构,建议补充 get_screenshot" |
| `node.name` used as copy source | "检测到 node.name 被当作真实文案,需改用 characters" |
| any template placeholder marker remains | "产物仍含模板占位,orchestrator 会视为未完成" |

- [ ] **Step 8: Verify**

Run:

```bash
rg -n "phase B|ui-understanding.md|get_metadata|get_design_context|get_screenshot|node.name|不修改业务代码|Open Questions" figma-ui-understand/SKILL.md
```

Expected: all key phrases found.

- [ ] **Step 9: Commit**

```bash
git add figma-ui-understand/SKILL.md
git commit -m "feat(figma-ui-understand): add phase B skill"
```

---

### Task 3: 写 reference template

**Files:**
- Create: `figma-ui-understand/references/ui-understanding-template.md`

- [ ] **Step 1: Copy and harden template**

Use `figma-workflow/templates/ui-understanding.md` as the base, but remove HTML placeholder comments from the expected final output. The reference template must contain:

```markdown
# UI Understanding — <feature>

> Generated by figma-ui-understand@<version> at <ISO8601>
> Source: figma file=<file_key> node=<node_id> (<node_name>)

## Page Structure

## Suspected Components

| UI Area | Meaning | Candidate Component | Evidence | Confidence |
|---|---|---|---|---|

## Repeated Patterns

| Pattern | Instances | Template Evidence | Implementation Hint |
|---|---:|---|---|

## Static / Dynamic UI Guess

| UI Element | Guess | Evidence | Confidence |
|---|---|---|---|

## Visual Notes

## Non-business UI To Ignore

## Open Questions
```

Add guidance below the template:

- `Evidence` should cite observed structure, text characters, repeated layout, or screenshot confirmation.
- Inferred semantics must be marked `(INFERRED)`.
- `unknown` or low-confidence items must be copied into `Open Questions`.
- Do not bind UI elements to API fields in this phase.

- [ ] **Step 2: Verify**

Run:

```bash
rg -n "Generated by figma-ui-understand|Repeated Patterns|Static / Dynamic UI Guess|\\(INFERRED\\)|Open Questions|API fields" figma-ui-understand/references/ui-understanding-template.md
```

Expected: all phrases found.

- [ ] **Step 3: Commit**

```bash
git add figma-ui-understand/references/ui-understanding-template.md
git commit -m "docs(figma-ui-understand): add ui understanding template"
```

---

### Task 4: 写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-ui-understand/README.md`
- Create: `figma-ui-understand/agents/openai.yaml`

- [ ] **Step 1: Write README**

`README.md` must include, and should use Chinese for section headings and explanations:

```markdown
# figma-ui-understand

`figma-workflow-suite` 的 phase B。
从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,输出 `ui-understanding.md`。

## 快速开始

figma-ui-understand feature=<feature-name>

## 输入

- `docs/design/<feature>/clarified-requirement.md`
- Figma file key
- Figma node id

## 输出

- `docs/design/<feature>/ui-understanding.md`
- `docs/design/<feature>/inputs.md`

## 上下游

phase A → phase B → phase C-up / C-low
clarified-requirement.md → ui-understanding.md → api-mapping.md / component-mapping.md
```

Also state:

- 本 skill 不做 API 字段绑定。
- 本 skill 不写业务代码。
- 真实文案必须来自 `characters`,不能来自 `node.name`。

- [ ] **Step 2: Write OpenAI config**

`agents/openai.yaml` must be:

```yaml
interface:
  display_name: "Figma UI Understand"
  short_description: "把 Figma node 整理成 ui-understanding.md"
  default_prompt: "使用 $figma-ui-understand feature=<feature-name> 读取 docs/design/<feature>/clarified-requirement.md 和指定 Figma node,调用 get_metadata / get_design_context / get_screenshot,提取页面结构、重复模式、疑似组件和 UI 语义,输出 docs/design/<feature>/ui-understanding.md,并在 inputs.md 追加一条记录。不要做 API 字段绑定,不要写业务代码,不要把 node.name 当作真实文案。"
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "phase B|ui-understanding.md|get_metadata|get_design_context|get_screenshot|node.name|不要写业务代码|default_prompt" figma-ui-understand/README.md figma-ui-understand/agents/openai.yaml
ruby -ryaml -e "d = YAML.load_file('figma-ui-understand/agents/openai.yaml'); puts d['interface']['display_name']"
```

Expected:

- `rg` finds all key phrases.
- Ruby prints `Figma UI Understand`.

- [ ] **Step 4: Commit**

```bash
git add figma-ui-understand/README.md figma-ui-understand/agents/openai.yaml
git commit -m "docs(figma-ui-understand): add README and agent config"
```

---

### Task 5: 新增 sales-workbench fixture

**Files:**
- Create: `figma-ui-understand/tests/fixtures/sales-workbench/README.md`
- Create: `figma-ui-understand/tests/fixtures/sales-workbench/inputs/clarified-requirement.md`
- Create: `figma-ui-understand/tests/fixtures/sales-workbench/inputs/figma-node-summary.md`
- Create: `figma-ui-understand/tests/fixtures/sales-workbench/expected/ui-understanding.md`

- [ ] **Step 1: Write fixture README**

README must explain:

- Fixture topic: 后台销售工作台
- Source: real MVP smoke test, reusing the P7 sales-workbench requirement
- Purpose: verify phase B output shape, Figma-only UI semantics, repeated pattern detection, and open question handling
- This fixture does not call live Figma MCP and does not implement code

- [ ] **Step 2: Write clarified requirement input**

Use the expected output from `figma-clarify-requirement/tests/fixtures/sales-workbench/expected/clarified-requirement.md` as the fixture input. Keep these facts:

- three sections: 首联、需求、转化
- metric cards
- mock API
- loading/success states
- deferred empty/error
- no business code before Phase E handoff

- [ ] **Step 3: Write figma node summary input**

`figma-node-summary.md` must simulate the relevant Figma observations without raw JSON:

```markdown
# Figma Node Summary — sales-workbench

Source: simulated Figma MCP output for fixture only.

## Metadata observations

- root node: 后台销售工作台, frame, 1440x900
- top region: page title and toolbar
- main content: three vertical sections
- section labels: 首联, 需求, 转化
- each section contains repeated metric card children
- each metric card contains label, primary value, numerator/denominator, and percent trend area
- help icons appear near some metric labels

## Design context observations

- text characters include 首联, 需求, 转化, 首联率, 外呼率, 接通率, APP 下载率, EVA 提交率, 目标完成率, LTV
- repeated cards share similar padding, value hierarchy, and percent badge placement
- no table or chart region is visible in the selected node

## Screenshot confirmation

- screenshot confirms three stacked business sections and repeated metric cards
- screenshot does not confirm detailed empty/error states
```

- [ ] **Step 4: Write expected ui-understanding**

Expected file must include these facts:

- Page Structure with root page, toolbar, and three metric sections.
- Suspected Components: `MetricSection`, `MetricCard`, `HelpIcon`, optional `Toolbar`.
- Repeated Patterns: metric cards repeated across the three sections.
- Static / Dynamic UI Guess: section titles and help icons mostly static; metric values and percentages dynamic; loading state dynamic.
- Visual Notes: dashboard layout, card hierarchy, repeated metric rhythm.
- Non-business UI To Ignore: decorative dividers/background, if present.
- Open Questions: detailed help copy and empty/error visuals deferred.
- Explicitly no API field binding.

- [ ] **Step 5: Verify fixture**

Run:

```bash
rg -n "Sales Workbench|Page Structure|Suspected Components|Repeated Patterns|Static / Dynamic UI Guess|Open Questions|MetricCard|no API field binding|Phase E" figma-ui-understand/tests/fixtures/sales-workbench
```

Expected: all phrases found.

- [ ] **Step 6: Commit**

```bash
git add figma-ui-understand/tests/fixtures/sales-workbench
git commit -m "test(figma-ui-understand): add sales workbench fixture"
```

---

### Task 6: 注册 skill 到项目级 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Update marketplace**

Add `./figma-ui-understand` to `.claude-plugin/marketplace.json` after `./figma-clarify-requirement` and before `./figma-ui-api-mapper`:

```json
"./figma-clarify-requirement",
"./figma-ui-understand",
"./figma-ui-api-mapper",
```

- [ ] **Step 2: Update AGENTS.md**

Add this bullet in `## 当前技能` near the figma suite entries:

```markdown
- `figma-ui-understand`:从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,输出 ui-understanding.md(figma-workflow-suite 的 phase B)。
```

- [ ] **Step 3: Update README.md**

Add this bullet in `## 已包含的技能` near the figma suite entries:

```markdown
- `figma-ui-understand`:从 Figma node 提取页面结构和 UI 语义,输出 ui-understanding.md(figma-workflow-suite 的 phase B)
```

- [ ] **Step 4: Verify catalog updates**

Run:

```bash
rg -n "figma-ui-understand" .claude-plugin/marketplace.json AGENTS.md README.md
```

Expected: 3 matches.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/marketplace.json AGENTS.md README.md
git commit -m "chore: register figma-ui-understand skill"
```

---

### Task 7: 文档验证、提交、推送和 PR

**Files:**
- Verify all files under `figma-ui-understand/`
- Verify project catalog updates

- [ ] **Step 1: Run verification**

```bash
find figma-ui-understand -type f | sort
rg -n "figma-ui-understand|ui-understanding.md|phase B|get_metadata|get_design_context|get_screenshot|node.name|不修改业务代码|Open Questions" figma-ui-understand .claude-plugin/marketplace.json AGENTS.md README.md
git diff --check
```

Expected:

- file list includes `SKILL.md`, `README.md`, `agents/openai.yaml`, `references/ui-understanding-template.md`, and fixture files.
- `rg` finds phase B, output file, Figma MCP calls, node.name warning, boundary, and open question language.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm no implementation code was changed**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD | rg '^(src|app|components|pages)/' || true
```

Expected: no output.

- [ ] **Step 3: Push and PR**

```bash
git push -u origin codex/p8-figma-ui-understand
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p8-figma-ui-understand \
  --title "feat: add figma ui understand skill" \
  --body "Adds the phase B figma-ui-understand skill for the figma-workflow-suite. It outputs ui-understanding.md and does not bind API fields or write business code."
```

---

## Self-Review Checklist

- [ ] The skill only produces `ui-understanding.md` and appends `inputs.md`.
- [ ] The skill reads `clarified-requirement.md` only as business context.
- [ ] The skill requires `get_metadata`, `get_design_context`, and `get_screenshot`.
- [ ] The skill warns against using `node.name` as real copy.
- [ ] The skill does not overlap `figma-ui-api-mapper`, `figma-design-token`, or `figma-emit-spec`.
- [ ] The fixture proves repeated pattern detection and deferred open questions are preserved.
- [ ] Project catalogs expose the new skill.
- [ ] No business code or unrelated files are changed.

## Out of Scope

- Implementing `figma-api-first`.
- Updating `figma-workflow` routing for v2.
- Updating `figma-emit-spec` handoff wording.
- Writing application code.
- Binding UI elements to API fields.
