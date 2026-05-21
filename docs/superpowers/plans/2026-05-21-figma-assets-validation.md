# Plan P15: Figma Assets and Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `figma-assets-validate` 能力,生成 `assets-manifest.md` 和 `validation-report.md`,收口资源交付约定与最低成本自动化验证。

**Architecture:** 这是 P15 的独立工程化 skill,读取 `docs/design/<feature>/` 下已有 Markdown 产物和 `.figma-cache/` evidence,默认只生成资源 manifest 和验证报告。实现时新增 `figma-assets-validate/` skill 目录、模板和一个 Node.js contract checker;不默认下载资源、不写业务代码、不改变 Phase E coding boundary。

**Tech Stack:** Markdown、YAML frontmatter、Node.js 脚本、JSON/Markdown fixture、现有 figma-workflow-suite skill 结构。

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md`
- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md`
- `figma-design-token/SKILL.md`
- `figma-workflow/references/progress-routing.md`

## File Structure

```text
figma-assets-validate/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── assets-manifest-template.md
│   └── validation-report-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   ├── design-token-patch.md
            │   ├── ui-handoff.md
            │   ├── design-diff.md
            │   └── implementation-spec.md
            └── expected/
                ├── assets-manifest.md
                └── validation-report.md

figma-workflow/
├── SKILL.md
├── references/
│   └── progress-routing.md
└── scripts/
    └── figma-validate-contracts.js
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
| `figma-assets-validate/SKILL.md` | P15 主指引,定义输入、输出、资源和验证边界 |
| `figma-assets-validate/README.md` | 仓库门面,说明 assets / validation 能力 |
| `figma-assets-validate/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-assets-validate/references/assets-manifest-template.md` | `assets-manifest.md` 输出模板 |
| `figma-assets-validate/references/validation-report-template.md` | `validation-report.md` 输出模板 |
| `figma-workflow/scripts/figma-validate-contracts.js` | Markdown contract / fixture contract / boundary check |
| `figma-workflow/*` | 增加 assets / validation 可选入口 |
| fixture | 覆盖 asset manifest、缺失章节检测和 boundary check |
| Project catalogs | 暴露新 skill 给 Codex / Claude Code |

## Task List

- [ ] **Task 1:** 新建实现分支和目录骨架
- [ ] **Task 2:** 编写 `figma-assets-validate/SKILL.md`
- [ ] **Task 3:** 编写 assets / validation 模板
- [ ] **Task 4:** 实现 `figma-validate-contracts.js`
- [ ] **Task 5:** 编写 README 和 OpenAI agent 配置
- [ ] **Task 6:** 新增 sales-workbench fixture
- [ ] **Task 7:** 更新 `figma-workflow` assets / validation 路由
- [ ] **Task 8:** 注册 skill 到项目级 catalog
- [ ] **Task 9:** 验证、提交、推送和 PR

---

### Task 1: 新建实现分支和目录骨架

**Files:**
- Create dir: `figma-assets-validate/`
- Create dir: `figma-assets-validate/agents/`
- Create dir: `figma-assets-validate/references/`
- Create dir: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/`
- Create dir: `figma-assets-validate/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p15-figma-assets-validation
```

Expected:

- branch is `codex/p15-figma-assets-validation`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-assets-validate/agents \
         figma-assets-validate/references \
         figma-assets-validate/tests/fixtures/sales-workbench/inputs \
         figma-assets-validate/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-assets-validate -type d | sort
```

prints the created directories.

---

### Task 2: 编写 `figma-assets-validate/SKILL.md`

**Files:**
- Create: `figma-assets-validate/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-assets-validate
description: figma-workflow-suite 的 P15 工程化组件。读取 docs/design/<feature>/ 下的资源引用和阶段产物,生成 assets-manifest.md 与 validation-report.md,收口资源交付和自动化验证。
---
```

- [ ] **Step 2: 写 Position**

Include:

```markdown
# Figma Assets Validate

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` v4 的 P15 工程化能力,用于资源交付和验证收口。

它产出 `docs/design/<feature>/assets-manifest.md` 和 `docs/design/<feature>/validation-report.md`。
它不写业务代码,不替代人工 review gate,不改变 Phase E coding boundary。
```

- [ ] **Step 3: 写 prerequisites**

Include:

```markdown
## Prerequisites

- `feature=<feature-name>`
- `docs/design/<feature>/` 存在
- 至少存在 `design-token-patch.md` / `ui-handoff.md` / `design-diff.md` / `implementation-spec.md` 中的一份产物
```

- [ ] **Step 4: 写目标和边界**

Goal section must include:

- output exactly `docs/design/<feature>/assets-manifest.md`
- output exactly `docs/design/<feature>/validation-report.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- default to manifest-only asset handling
- run Markdown contract, fixture contract and boundary checks

Non-goals must include:

- 不默认下载所有资源
- 不提交大体积二进制资源
- 不做像素级视觉回归
- 不把 LLM-as-judge 当唯一验收
- 不修改 Figma 文件
- 不自动重跑任何 phase
- 不写业务代码

- [ ] **Step 5: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`.
2. Ensure `docs/design/<feature>/` exists.
3. Read available products and `.figma-cache/` metadata.
4. Extract asset references from `design-token-patch.md`, `ui-handoff.md`, `design-diff.md`, and cache summaries.
5. Classify assets as image / icon / illustration / screenshot / background / unknown.
6. Decide status: pending / downloaded / deferred / skipped / missing.
7. Generate `assets-manifest.md`.
8. Run Markdown contract check.
9. Run fixture contract check.
10. Run boundary check.
11. Optionally run LLM-as-judge only when explicitly enabled.
12. Generate `validation-report.md`.
13. Append `inputs.md` audit record.
14. Print self-check.

- [ ] **Step 6: 写 self-check**

Include:

```markdown
## Self-Check

| Check | Warning |
|---|---|
| blocking asset without destination | "存在必需资源但缺少 destination 或 open question" |
| missing contract sections | "存在产物缺少必需章节" |
| boundary violation | "检测到业务代码目录或 coding boundary 风险" |
| llm judge used as pass source | "LLM-as-judge 不能作为唯一验收" |
```

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "figma-assets-validate|P15|assets-manifest.md|validation-report.md|LLM-as-judge|不写业务代码|Self-Check" figma-assets-validate/SKILL.md
```

Expected: all key phrases found.

---

### Task 3: 编写 assets / validation 模板

**Files:**
- Create: `figma-assets-validate/references/assets-manifest-template.md`
- Create: `figma-assets-validate/references/validation-report-template.md`

- [ ] **Step 1: 写 assets manifest template**

Use this exact section order:

```markdown
# Assets Manifest — <feature>

> Generated by figma-assets-validate@0.1.0 at <ISO8601>
> Source: design-token-patch.md / ui-handoff.md / design-diff.md / .figma-cache

## Summary

| Type | Count | Download Required | Deferred |
|---|---:|---:|---:|

## Asset References

| Asset ID | Type | Source | Figma Node | Recommended Format | Required | Destination | Status | Notes |
|---|---|---|---|---|---|---|---|---|

## Download Plan

| Asset ID | Action | Command / Tool | Blocking |
|---|---|---|---|

## Deferred Assets

| Asset ID | Reason | Owner | Follow-up |
|---|---|---|---|

## Open Questions

- [ ] <asset question that must be resolved before coding if blocking>
```

- [ ] **Step 2: 写 validation report template**

Use this exact section order:

```markdown
# Validation Report — <feature>

> Generated by figma-assets-validate@0.1.0 at <ISO8601>

## Summary

| Check Group | Status | Notes |
|---|---|---|

## Markdown Contract Check

| File | Required Sections | Status | Notes |
|---|---|---|---|

## Fixture Contract Check

| Fixture | Required Files | Status | Notes |
|---|---|---|---|

## Boundary Check

| Rule | Status | Notes |
|---|---|---|

## Asset Manifest Check

| Rule | Status | Notes |
|---|---|---|

## Optional LLM Judge

| Target | Status | Notes |
|---|---|---|

## Open Questions

- [ ] <validation concern that needs human review>
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "Assets Manifest|Asset References|Download Plan|Deferred Assets|Validation Report|Markdown Contract Check|Fixture Contract Check|Boundary Check|Asset Manifest Check|Optional LLM Judge" figma-assets-validate/references
```

Expected: all key sections found.

---

### Task 4: 实现 `figma-validate-contracts.js`

**Files:**
- Create: `figma-workflow/scripts/figma-validate-contracts.js`

- [ ] **Step 1: 创建脚本**

Implement Node.js ESM with built-in modules only:

```js
import fs from "node:fs";
import path from "node:path";
```

Export:

- `readText(filePath)`
- `hasSections(markdown, sections)`
- `checkMarkdownContracts(featureDir)`
- `checkFixtureContracts(repoRoot)`
- `checkBoundary(repoRoot, baseRef)`
- `renderValidationReport(result)`

- [ ] **Step 2: Implement Markdown contract map**

Use this exact contract:

```js
const markdownContracts = {
  "clarified-requirement.md": ["Open Questions"],
  "ui-understanding.md": ["Page Structure", "Repeated Patterns", "Open Questions"],
  "api-mapping.md": ["Data Sources", "Field Mapping", "State Mapping", "Open Questions"],
  "component-mapping.md": ["Open Questions"],
  "design-token-patch.md": ["Asset", "Open Questions"],
  "implementation-spec.md": ["Coding Boundary"],
  "ui-handoff.md": ["Required Figma Selection", "Text Requirements", "State Coverage", "Known Gaps", "Non-Goals"],
  "design-diff.md": ["Recommended Rerun Phases"]
};
```

- [ ] **Step 3: Implement boundary check**

Boundary check must warn if `git diff --name-only <baseRef>...HEAD` includes paths matching:

```text
src/
app/
components/
pages/
```

It must also warn if `implementation-spec.md` contains `raw Figma JSON`.

- [ ] **Step 4: Add CLI mode**

Support:

```bash
node figma-workflow/scripts/figma-validate-contracts.js docs/design/sales-workbench docs/figma-workflow-suite-design
```

Expected: prints validation report Markdown to stdout.

- [ ] **Step 5: Verify**

Run:

```bash
node figma-workflow/scripts/figma-validate-contracts.js figma-assets-validate/tests/fixtures/sales-workbench/inputs docs/figma-workflow-suite-design > /tmp/sales-workbench-validation-report.md
rg -n "Validation Report|Markdown Contract Check|Fixture Contract Check|Boundary Check|Asset Manifest Check|Optional LLM Judge" /tmp/sales-workbench-validation-report.md
```

Expected: command exits 0 and key sections exist.

---

### Task 5: 编写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-assets-validate/README.md`
- Create: `figma-assets-validate/agents/openai.yaml`

- [ ] **Step 1: README 写定位**

Include:

```markdown
# figma-assets-validate

`figma-assets-validate` 是 figma-workflow-suite v4 的 P15 工程化 skill。它读取 `docs/design/<feature>/` 下已有产物,生成 `assets-manifest.md` 和 `validation-report.md`,用于资源交付和自动化验证收口。
```

- [ ] **Step 2: README 写边界**

Include:

```markdown
- 默认不下载所有资源。
- 不把 LLM-as-judge 当作唯一验收。
- 不修改 Figma 文件。
- 不写业务代码。
```

- [ ] **Step 3: openai.yaml**

Create:

```yaml
name: figma-assets-validate
description: 读取 docs/design/<feature>/ 下已有产物,生成 assets-manifest.md 与 validation-report.md,收口资源交付和自动化验证。
default_prompt: "使用 $figma-assets-validate feature=<feature-name> 读取 docs/design/<feature>/ 下已有产物和 .figma-cache evidence,输出 docs/design/<feature>/assets-manifest.md 与 validation-report.md,并在 inputs.md 追加一条记录。默认不下载所有资源,不要把 LLM-as-judge 当作唯一验收,不要写业务代码。"
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma-assets-validate|P15|assets-manifest.md|validation-report.md|LLM-as-judge|不写业务代码|default_prompt" figma-assets-validate/README.md figma-assets-validate/agents/openai.yaml
```

Expected: all key phrases found.

---

### Task 6: 新增 sales-workbench fixture

**Files:**
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/README.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/design-token-patch.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/ui-handoff.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/design-diff.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/inputs/implementation-spec.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/expected/assets-manifest.md`
- Create: `figma-assets-validate/tests/fixtures/sales-workbench/expected/validation-report.md`

- [ ] **Step 1: 写 fixture README**

Include:

```markdown
# sales-workbench fixture

验证 `figma-assets-validate` 能从销售工作台产物中整理资源引用并输出验证报告:

- `design-token-patch.md` 提供 icon / image 引用。
- `ui-handoff.md` 提供资源来源待确认项。
- `design-diff.md` 提供 asset_changed 信号。
- `implementation-spec.md` 提供 coding boundary 文案。
```

- [ ] **Step 2: 写 compact inputs**

Inputs must include:

- `design-token-patch.md` with an asset table containing `icon-filter` as svg and `chart-empty` as png.
- `ui-handoff.md` with Asset Marking and Known Gaps.
- `design-diff.md` with Asset Signals and Recommended Rerun Phases.
- `implementation-spec.md` with Coding Boundary and no raw Figma JSON.

- [ ] **Step 3: 写 expected assets manifest**

Expected output must include:

- `icon-filter`
- `chart-empty`
- `Asset References`
- `Download Plan`
- `Deferred Assets`
- `Open Questions`

- [ ] **Step 4: 写 expected validation report**

Expected output must include:

- `Markdown Contract Check`
- `Fixture Contract Check`
- `Boundary Check`
- `Asset Manifest Check`
- `Optional LLM Judge`
- `LLM-as-judge skipped`

- [ ] **Step 5: Verify fixture**

Run:

```bash
rg -n "icon-filter|chart-empty|Asset References|Download Plan|Deferred Assets|Open Questions" figma-assets-validate/tests/fixtures/sales-workbench/expected/assets-manifest.md
rg -n "Markdown Contract Check|Fixture Contract Check|Boundary Check|Asset Manifest Check|Optional LLM Judge|LLM-as-judge skipped" figma-assets-validate/tests/fixtures/sales-workbench/expected/validation-report.md
```

Expected: all key phrases found.

---

### Task 7: 更新 `figma-workflow` assets / validation 路由

**Files:**
- Modify: `figma-workflow/SKILL.md`
- Modify: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: 在 progress-routing 加 assets / validation 状态**

Add:

````markdown
## Assets / validation

当 `docs/design/<feature>/` 存在时,orchestrator 可以展示:

```text
Assets / validation:
  [ ] assets-manifest.md (not generated)
  [ ] validation-report.md (not generated)

Actions:
  [A] Generate assets manifest
  [Q] Run validation checks
```
````

- [ ] **Step 2: 写 assets / validation 边界**

Include:

```markdown
Assets / validation action 不标记任何 Phase 完成,不替代人工 review gate,不默认下载所有资源,不授权 coding。
```

- [ ] **Step 3: 在 SKILL.md 更新 v4 optional capability**

Add:

```markdown
`figma-workflow` 可以通过 `figma-assets-validate` 生成 `assets-manifest.md` 和 `validation-report.md`,用于资源交付和验证收口。该入口不改变 Phase E handoff,也不触发 coding。
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "Assets / validation|assets-manifest.md|validation-report.md|figma-assets-validate|不默认下载所有资源|不授权 coding" figma-workflow/SKILL.md figma-workflow/references/progress-routing.md
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

Add `figma-assets-validate` with description:

```text
读取 docs/design/<feature>/ 下已有产物,生成 assets-manifest.md 与 validation-report.md,收口资源交付和自动化验证。
```

- [ ] **Step 2: 更新 AGENTS**

Add:

```markdown
- `figma-assets-validate`:读取已有 figma-workflow 产物,生成 `assets-manifest.md` 与 `validation-report.md`,收口资源交付和自动化验证(P15)。
```

- [ ] **Step 3: 更新 README**

Add:

```markdown
- `figma-assets-validate`:生成 `assets-manifest.md` 与 `validation-report.md`,用于资源交付和自动化验证收口。
```

- [ ] **Step 4: v4 spec 增加 P15 spec 链接**

In P15 section, add:

```markdown
详细设计见 `docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md`。
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "figma-assets-validate|assets-manifest.md|validation-report.md|2026-05-21-figma-assets-validation" .claude-plugin/marketplace.json AGENTS.md README.md docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 9: 验证、提交、推送和 PR

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run documentation checks**

```bash
rg -n "P15|Figma Assets|figma-assets-validate|assets-manifest.md|validation-report.md|LLM-as-judge|Markdown Contract Check|Boundary Check|业务代码" \
  docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md \
  docs/superpowers/plans/2026-05-21-figma-assets-validation.md \
  docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md

git diff --check
```

Expected:

- `rg` finds P15 contract and boundary terms.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm this PR is docs/spec only**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD
```

Expected names for this spec/plan PR:

```text
docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md
docs/superpowers/plans/2026-05-21-figma-assets-validation.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md \
        docs/superpowers/plans/2026-05-21-figma-assets-validation.md \
        docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
git commit -m "docs: add figma assets validation plan"
```

- [ ] **Step 4: Push and PR**

```bash
git push -u origin codex/p15-figma-assets-validation-spec-plan
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p15-figma-assets-validation-spec-plan \
  --title "docs: add figma assets validation plan" \
  --body "Adds P15 assets and validation design spec and implementation plan."
```

Expected: PR targets `docs/figma-workflow-suite-design`.

---

## Self-Review Checklist

- P15 默认只生成 manifest/report,不默认下载所有资源。
- P15 不把 LLM-as-judge 当作唯一验收。
- P15 不做像素级视觉回归。
- P15 不修改 Figma 文件。
- P15 不修改 A/B/C/D/E 产物。
- P15 不写业务代码。
- `assets-manifest.md` 和 `validation-report.md` 的章节完整。
