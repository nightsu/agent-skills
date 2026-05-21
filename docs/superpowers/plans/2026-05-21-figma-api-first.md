# Plan P10: `figma-api-first` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-api-first` skill(figma-workflow-suite Phase C1),把用户粘贴的接口结构整理成 `docs/design/<feature>/api-mapping.md`。

**Architecture:** 这是一个独立 Phase C1 skill,目录结构沿用现有 figma suite skill:`SKILL.md` + `README.md` + `agents/openai.yaml` + `references/` + `tests/fixtures/`。第一版只处理用户粘贴接口结构,不接 YApi/Swagger/OpenAPI 抓取,不调用 Figma MCP,不写业务代码。

**Tech Stack:** Markdown、YAML frontmatter、人工 review fixture、现有 figma-workflow-suite 文档规范。

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-api-first-v3/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`
- `figma-workflow/templates/api-mapping.md`
- `figma-ui-api-mapper/SKILL.md`

## File Structure

```text
figma-api-first/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── api-mapping-template.md
└── tests/
    └── fixtures/
        └── sales-workbench/
            ├── README.md
            ├── inputs/
            │   ├── api-response-type.ts
            │   ├── clarified-requirement.md
            │   └── ui-understanding.md
            └── expected/
                └── api-mapping.md
```

Project-level catalog updates:

```text
.claude-plugin/marketplace.json
AGENTS.md
README.md
figma-workflow/SKILL.md
figma-workflow/references/progress-routing.md
docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-api-first/SKILL.md` | Phase C1 主指引,定义输入、输出、工作流、边界和 self-check |
| `figma-api-first/README.md` | 仓库门面,说明 skill 在 suite 中的位置和快速调用方式 |
| `figma-api-first/agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `figma-api-first/references/api-mapping-template.md` | 输出模板,兼容现有 `figma-workflow/templates/api-mapping.md` |
| `figma-api-first/tests/fixtures/sales-workbench/` | 回归 fixture,使用销售工作台嵌套指标接口结构 |
| `figma-workflow/*` | 把 C1 从默认手填改为优先路由 `figma-api-first`,保留模板 fallback |
| Project catalogs | 暴露新 skill 给 Codex / Claude Code |

## Task List

- [ ] **Task 1:** 新建实现分支和目录骨架
- [ ] **Task 2:** 写 `figma-api-first/SKILL.md`
- [ ] **Task 3:** 写 reference template
- [ ] **Task 4:** 写 README 和 OpenAI agent 配置
- [ ] **Task 5:** 新增 sales-workbench fixture
- [ ] **Task 6:** 更新 `figma-workflow` C1 路由契约
- [ ] **Task 7:** 注册 skill 到项目级 catalog
- [ ] **Task 8:** 文档验证、提交、推送和 PR

---

### Task 1: 新建实现分支和目录骨架

**Files:**
- Create dir: `figma-api-first/`
- Create dir: `figma-api-first/agents/`
- Create dir: `figma-api-first/references/`
- Create dir: `figma-api-first/tests/fixtures/sales-workbench/inputs/`
- Create dir: `figma-api-first/tests/fixtures/sales-workbench/expected/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p10-figma-api-first
```

Expected:

- branch is `codex/p10-figma-api-first`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p figma-api-first/agents \
         figma-api-first/references \
         figma-api-first/tests/fixtures/sales-workbench/inputs \
         figma-api-first/tests/fixtures/sales-workbench/expected
```

Expected:

```bash
find figma-api-first -type d | sort
```

prints the created directories.

---

### Task 2: 写 `figma-api-first/SKILL.md`

**Files:**
- Create: `figma-api-first/SKILL.md`

- [ ] **Step 1: 写 frontmatter**

`SKILL.md` must start with:

```markdown
---
name: figma-api-first
description: figma-workflow-suite 的 phase C1 组件。把用户粘贴的接口结构、返回值类型或字段清单整理为 api-mapping.md,供 figma-ui-api-mapper 在 C2 阶段消费。
---
```

- [ ] **Step 2: 写 Position**

Include:

```markdown
# Figma API First

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的 Phase C1:

phase A → phase B → phase C1 → phase C2 → phase D → phase E
clarified-requirement.md → ui-understanding.md → api-mapping.md → component-mapping.md → design-token-patch.md → implementation-spec.md

`figma-api-first` 产出 `api-mapping.md`。
`figma-ui-api-mapper` 消费 `api-mapping.md` 并结合 Figma node 产出 `component-mapping.md`。
```

- [ ] **Step 3: 写 prerequisites**

Include:

```markdown
## Prerequisites

- `feature=<feature-name>`
- `docs/design/<feature>/clarified-requirement.md` 存在且非占位
- `docs/design/<feature>/ui-understanding.md` 存在且非占位
- 用户粘贴接口结构,支持 TypeScript type / JSON response / 字段清单 / 接口说明文本
```

- [ ] **Step 4: 写目标和边界**

Goal section must include:

- output exactly `docs/design/<feature>/api-mapping.md`
- append one audit entry to `docs/design/<feature>/inputs.md`
- keep API facts separate from UI binding guesses
- expose uncertain fields and states under `Open Questions`

Non-goals must include:

- 不接 YApi / Swagger / OpenAPI 自动抓取
- 不调用 Figma MCP
- 不读取 raw Figma JSON
- 不产出 `component-mapping.md`
- 不做 UI 节点绑定
- 不修改业务代码
- 不生成 OpenSpec proposal

- [ ] **Step 5: 写工作流**

The workflow must contain these ordered steps:

1. Parse `feature=<feature-name>`; reject missing feature.
2. Ensure `docs/design/<feature>/` exists; if created, print path and ask user to confirm feature spelling before continuing.
3. Read `clarified-requirement.md` and `ui-understanding.md`; reject if missing or placeholder.
4. Ask user for pasted API structure if not already provided.
5. Extract API facts: API name/url, method, root response shape, field paths, types, state clues.
6. Align with A/B modules only as UI Field candidates; never fabricate API fields.
7. Generate `api-mapping.md` from the reference template.
8. Put low-confidence mappings, missing types, pagination, permission and fallback questions under `Open Questions`.
9. Append `inputs.md` with source type, timestamp, api_first_version, field_count, open_questions_count.
10. Print self-check for orchestrator review gate.

- [ ] **Step 6: 写输出结构**

Document this output schema:

```markdown
# API Mapping — <feature>

> Generated by figma-api-first@0.1.0 at <ISO8601>
> Source: pasted schema

## Data Sources
| UI Module | API | Method | Description |

## Field Mapping
| UI Field | API Field | Type | Transform |

## State Mapping
| State | Trigger | UI Behavior |

## Open Questions
```

- [ ] **Step 7: 写 self-check**

Self-check rules:

| Check | Warning |
|---|---|
| `Data Sources` empty | "Data Sources 缺失,不能进入 C2" |
| `Field Mapping` empty | "Field Mapping 缺失,不能进入 C2" |
| field type contains `unknown` | "存在 unknown 类型,建议 review 后再继续" |
| `Open Questions` contains non-deferred items | "存在未解决接口问题,建议 review 后再继续" |
| template placeholder remains | "产物仍含模板占位,orchestrator 会视为未完成" |

- [ ] **Step 8: Verify**

Run:

```bash
rg -n "phase C1|api-mapping.md|TypeScript|JSON response|不调用 Figma MCP|不修改业务代码|Open Questions|inputs.md|figma-ui-api-mapper" figma-api-first/SKILL.md
```

Expected: all key phrases found.

- [ ] **Step 9: Commit**

```bash
git add figma-api-first/SKILL.md
git commit -m "docs(figma-api-first): add skill contract"
```

---

### Task 3: 写 reference template

**Files:**
- Create: `figma-api-first/references/api-mapping-template.md`

- [ ] **Step 1: 写模板**

Create the file with:

```markdown
# API Mapping — <feature>

> Generated by figma-api-first@0.1.0 at <ISO8601>
> Source: pasted schema

## Data Sources

| UI Module | API | Method | Description |
|---|---|---|---|
| <module or page> | <api name/url> | GET/POST/UNKNOWN | <business purpose> |

## Field Mapping

| UI Field | API Field | Type | Transform |
|---|---|---|---|
| <ui candidate or UNKNOWN> | data.foo.bar | number | percent / duration / currency / count / raw |

## State Mapping

| State | Trigger | UI Behavior |
|---|---|---|
| loading | request pending | show loading placeholder |
| empty | response success but key list/count is empty | show empty state |
| error | request failed or success=false/code!=0 | show error state |

## Open Questions

- [ ] <unresolved api / type / pagination / permission / fallback question>
```

- [ ] **Step 2: 写填充规则**

Append rules:

- API Field uses full dotted path.
- Type must come from API facts; use `unknown` only when missing.
- Transform is display transform, not UI binding.
- UI Field may use A/B module hints; use `UNKNOWN` when unstable.
- Do not invent API fields from UI slots.
- Do not assume every API field is shown.

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "Generated by figma-api-first|Data Sources|Field Mapping|State Mapping|Open Questions|Do not invent API fields|UNKNOWN" figma-api-first/references/api-mapping-template.md
```

Expected: all key phrases found.

- [ ] **Step 4: Commit**

```bash
git add figma-api-first/references/api-mapping-template.md
git commit -m "docs(figma-api-first): add api mapping template"
```

---

### Task 4: 写 README 和 OpenAI agent 配置

**Files:**
- Create: `figma-api-first/README.md`
- Create: `figma-api-first/agents/openai.yaml`

- [ ] **Step 1: 写 README**

`README.md` content:

```markdown
# figma-api-first

`figma-api-first` 是 figma-workflow-suite 的 Phase C1 skill。

它把用户粘贴的接口结构、返回值类型或字段清单整理成:

```text
docs/design/<feature>/api-mapping.md
```

## 适用场景

- 已完成 `clarified-requirement.md` 和 `ui-understanding.md`。
- 需要把接口返回结构先稳定成字段事实。
- 准备让 `figma-ui-api-mapper` 在 C2 阶段结合 Figma 做 UI/API 绑定。

## 不做什么

- 不接 YApi / Swagger / OpenAPI 自动抓取。
- 不调用 Figma MCP。
- 不产出 `component-mapping.md`。
- 不修改业务代码。

## 调用方式

```text
figma-api-first feature=<feature-name>
```

调用后粘贴 TypeScript type、JSON response、字段清单或接口说明文本。
```

- [ ] **Step 2: 写 OpenAI agent 配置**

`agents/openai.yaml` content:

```yaml
name: figma-api-first
version: 0.1.0
description: "Generate api-mapping.md from pasted API structures for figma-workflow-suite Phase C1."
default_prompt: "使用 $figma-api-first feature=<feature-name> 读取 docs/design/<feature>/ 下的 clarified-requirement.md 和 ui-understanding.md,根据用户粘贴的接口结构整理 api-mapping.md,并在 inputs.md 追加 audit 记录。"
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "figma-api-first|Phase C1|api-mapping.md|不调用 Figma MCP|不修改业务代码|default_prompt" figma-api-first/README.md figma-api-first/agents/openai.yaml
```

Expected: all key phrases found.

- [ ] **Step 4: Commit**

```bash
git add figma-api-first/README.md figma-api-first/agents/openai.yaml
git commit -m "docs(figma-api-first): add readme and agent config"
```

---

### Task 5: 新增 sales-workbench fixture

**Files:**
- Create: `figma-api-first/tests/fixtures/sales-workbench/README.md`
- Create: `figma-api-first/tests/fixtures/sales-workbench/inputs/api-response-type.ts`
- Create: `figma-api-first/tests/fixtures/sales-workbench/inputs/clarified-requirement.md`
- Create: `figma-api-first/tests/fixtures/sales-workbench/inputs/ui-understanding.md`
- Create: `figma-api-first/tests/fixtures/sales-workbench/expected/api-mapping.md`

- [ ] **Step 1: 写 fixture README**

README must explain:

- Fixture topic: 后台销售工作台
- Source: user pasted TypeScript response type
- Purpose: verify nested metric fields become full dotted API paths
- No Figma MCP, no business code

- [ ] **Step 2: 写 `api-response-type.ts`**

Use this interface:

```ts
export interface SalesWorkbenchResponse {
  code: number;
  msg: string;
  success: boolean;
  data: {
    firstContactSection: {
      avgAssignedStudentCount: MetricValue;
      callOutRate: MetricValue;
      callConnectRate: MetricValue;
      wechatAddRate: MetricValue;
      notFirstContactRate: MetricValue;
      notFirstContactOver24hRate: MetricValue;
    };
    demandSection: {
      avgTalkDurationPerSales: MetricValue;
      avgEffectiveTalkDurationPerStudent: MetricValue;
      avgFollowCountPerStudent: MetricValue;
      evaSubmitRate: MetricValue;
      appDownloadRate: MetricValue;
    };
    conversionSection: {
      targetCompletionRate: MetricValue;
      headConversionRate: MetricValue;
      breakShellRate: MetricValue;
      ltv: MetricValue;
    };
  };
}

export interface MetricValue {
  numerator: number;
  denominator: number;
  percent: number;
}
```

- [ ] **Step 3: 写 minimal A/B inputs**

`clarified-requirement.md` must include:

```markdown
# Clarified Requirement — sales-workbench

## Goal
展示销售工作台的首联、需求挖掘和转化指标。

## Scope
- 展示三组指标区域。
- 支持 loading / empty / error。

## Out of Scope
- 不实现趋势图。

## Open Questions
- [ ] 指标小数位规则待确认。
```

`ui-understanding.md` must include:

```markdown
# UI Understanding — sales-workbench

## Page Structure
SalesWorkbenchPage

## Suspected Components
- FirstContactSection
- DemandSection
- ConversionSection
- MetricCard

## Static / Dynamic UI Guess
- 指标标题为 UI copy。
- 指标 numerator / denominator / percent 来自 API。

## Open Questions
- [ ] 空态文案待确认。
```

- [ ] **Step 4: 写 expected api-mapping**

Expected output must include full dotted paths:

```markdown
# API Mapping — sales-workbench

> Generated by figma-api-first@0.1.0 at <ISO8601>
> Source: pasted schema

## Data Sources

| UI Module | API | Method | Description |
|---|---|---|---|
| SalesWorkbenchPage | SalesWorkbenchResponse | UNKNOWN | 获取销售工作台首联、需求挖掘和转化指标 |

## Field Mapping

| UI Field | API Field | Type | Transform |
|---|---|---|---|
| FirstContactSection.avgAssignedStudentCount.percent | data.firstContactSection.avgAssignedStudentCount.percent | number | percent |
| FirstContactSection.callOutRate.percent | data.firstContactSection.callOutRate.percent | number | percent |
| FirstContactSection.callConnectRate.percent | data.firstContactSection.callConnectRate.percent | number | percent |
| FirstContactSection.wechatAddRate.percent | data.firstContactSection.wechatAddRate.percent | number | percent |
| FirstContactSection.notFirstContactRate.percent | data.firstContactSection.notFirstContactRate.percent | number | percent |
| FirstContactSection.notFirstContactOver24hRate.percent | data.firstContactSection.notFirstContactOver24hRate.percent | number | percent |
| DemandSection.avgTalkDurationPerSales.percent | data.demandSection.avgTalkDurationPerSales.percent | number | percent |
| DemandSection.avgEffectiveTalkDurationPerStudent.percent | data.demandSection.avgEffectiveTalkDurationPerStudent.percent | number | percent |
| DemandSection.avgFollowCountPerStudent.percent | data.demandSection.avgFollowCountPerStudent.percent | number | percent |
| DemandSection.evaSubmitRate.percent | data.demandSection.evaSubmitRate.percent | number | percent |
| DemandSection.appDownloadRate.percent | data.demandSection.appDownloadRate.percent | number | percent |
| ConversionSection.targetCompletionRate.percent | data.conversionSection.targetCompletionRate.percent | number | percent |
| ConversionSection.headConversionRate.percent | data.conversionSection.headConversionRate.percent | number | percent |
| ConversionSection.breakShellRate.percent | data.conversionSection.breakShellRate.percent | number | percent |
| ConversionSection.ltv.percent | data.conversionSection.ltv.percent | number | percent |

## State Mapping

| State | Trigger | UI Behavior |
|---|---|---|
| loading | request pending | 展示指标 loading 占位 |
| empty | success=true but data missing or all metric values are zero | 展示空态或零值态,文案待确认 |
| error | success=false or code!=0 or request failed | 展示错误态,优先使用 msg |

## Open Questions

- [ ] 指标小数位规则待确认。
- [ ] empty 状态中全 0 是否应展示为零值还是空态。
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "SalesWorkbenchResponse|MetricValue|firstContactSection|demandSection|conversionSection|data\\.firstContactSection\\.callOutRate\\.percent|Open Questions|不修改业务代码" figma-api-first/tests/fixtures/sales-workbench
```

Expected: all key phrases found.

- [ ] **Step 6: Commit**

```bash
git add figma-api-first/tests/fixtures/sales-workbench
git commit -m "test(figma-api-first): add sales workbench fixture"
```

---

### Task 6: 更新 `figma-workflow` C1 路由契约

**Files:**
- Modify: `figma-workflow/SKILL.md`
- Modify: `figma-workflow/references/progress-routing.md`
- Modify: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md`

- [ ] **Step 1: 更新 `figma-workflow/SKILL.md`**

Change C1 wording:

- From: v2 still manual `api-mapping.md`
- To: v3 prefers `figma-api-first`; template fallback remains available

Required phrases:

- `C1:优先调用 figma-api-first;不可用时提示模板`
- `figma-api-first` 不接 YApi / Swagger / OpenAPI 自动抓取
- 不自动进入 C2
- 不修改业务代码

- [ ] **Step 2: 更新 `progress-routing.md`**

Add C1 skill menu:

```text
Next step:
  [1] Run figma-api-first (phase C1)
  [2] Use template fallback
  [3] Manually edit a product
  [4] Exit
```

State:

- C1 requires A + B non-placeholder.
- If `figma-api-first` is unavailable, fallback is `templates/api-mapping.md`.
- C1 completion returns to review gate; it does not automatically run `figma-ui-api-mapper`.

- [ ] **Step 3: 更新 suite fixture flow map**

Change sales-workbench flow map C1 row:

```markdown
| C1 | figma-api-first | api-mapping.md | skill route preferred; template fallback |
```

Add note:

- P10 replaces v2 manual C1 for this fixture.
- It still uses pasted API structure, not platform fetching.

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma-api-first|C1|api-mapping.md|template fallback|YApi|Swagger|OpenAPI|不修改业务代码|不自动进入 C2" figma-workflow/SKILL.md figma-workflow/references/progress-routing.md docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md
```

Expected: all key phrases found.

- [ ] **Step 5: Commit**

```bash
git add figma-workflow/SKILL.md figma-workflow/references/progress-routing.md docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md
git commit -m "docs(figma-workflow): route c1 to api first"
```

---

### Task 7: 注册 skill 到项目级 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: 更新 `AGENTS.md`**

Add `figma-api-first` to 当前技能:

```markdown
- `figma-api-first`:把接口结构整理为 api-mapping.md(figma-workflow-suite 的 phase C1)。
```

- [ ] **Step 2: 更新 root `README.md`**

Add `figma-api-first` to skill list using Chinese-first wording.

- [ ] **Step 3: 更新 `.claude-plugin/marketplace.json`**

Add a skill entry consistent with existing figma skill entries.

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma-api-first|phase C1|api-mapping.md" AGENTS.md README.md .claude-plugin/marketplace.json
```

Expected: all key phrases found.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md README.md .claude-plugin/marketplace.json
git commit -m "chore: register figma-api-first skill"
```

---

### Task 8: 文档验证、提交、推送和 PR

**Files:**
- Verify all modified files

- [ ] **Step 1: Run verification**

```bash
rg -n "figma-api-first|phase C1|api-mapping.md|TypeScript|JSON response|YApi|Swagger|OpenAPI|不调用 Figma MCP|不修改业务代码|Open Questions|figma-ui-api-mapper" \
  figma-api-first \
  figma-workflow/SKILL.md \
  figma-workflow/references/progress-routing.md \
  docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md \
  AGENTS.md \
  README.md \
  .claude-plugin/marketplace.json

git diff --check
```

Expected:

- `rg` finds scope, boundaries, output contract and registration.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm no implementation code was changed**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD | rg '^(src|app|components|pages)/' || true
```

Expected: no output.

- [ ] **Step 3: Push and PR**

```bash
git push -u origin codex/p10-figma-api-first
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p10-figma-api-first \
  --title "docs: add figma api first plan" \
  --body "Adds the P10 plan for figma-api-first, the Phase C1 skill that generates api-mapping.md from pasted API structures. The plan keeps YApi/Swagger/OpenAPI fetching out of scope for the first version."
```

---

## Self-Review Checklist

- [ ] `figma-api-first` is Phase C1.
- [ ] It produces `api-mapping.md`.
- [ ] It does not belong to `figma-ui-api-mapper`.
- [ ] First version supports pasted API structures only.
- [ ] YApi / Swagger / OpenAPI fetching remains out of scope.
- [ ] It does not call Figma MCP.
- [ ] It does not write business code.
- [ ] `figma-workflow` routes C1 to the skill when available, with template fallback.
- [ ] sales-workbench fixture covers nested metric fields.

## Out of Scope

- Implementing YApi / Swagger / OpenAPI integrations.
- Calling Figma MCP from `figma-api-first`.
- Producing `component-mapping.md`.
- Writing business code.
- Generating OpenSpec proposals.
