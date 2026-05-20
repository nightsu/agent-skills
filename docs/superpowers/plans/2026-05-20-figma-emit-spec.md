# Plan P3: `figma-emit-spec` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-emit-spec` skill(figma-workflow-suite phase E),合并 5 份上游 .md 产物,输出 `implementation-spec.md` + `open-questions.md`(Agent 编码主输入),并在出口处提供 handoff 选择(builtin task-breakdown / superpowers / manual / pause)。

**Architecture:** 全新 skill。**纯函数式合成**(只读上游 + 写产物,不调 Figma MCP、不联网),职责是把 5 份产物正确合并为单一可信源。skill 是 markdown 指引文档,无代码。

**Tech Stack:** Markdown、YAML frontmatter、bash(git checkout / commit)、人工 review 验证 fixture。

**Spec source:**
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/04c-emit-spec.md`(主契约,已含 PR #3 修复的 label_drift + [deferred] 机制)
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`(handoff 出口 4 选项)
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/validation-findings.md`(F2/F3 修复来源)

**Prerequisites for the engineer:**
- 已 cd 到 `/Users/su/codeHub/github/agent-skills/`
- 已熟悉 P1/P2 的 `figma-ui-api-mapper/` 和 `figma-design-token/` 目录结构(本 plan 沿用同结构)
- 已读 spec §4c(尤其 PR #3 修复后的 label_drift 段)+ §5 + validation-findings.md F2/F3

**Companion files:**
- 附录 A(fixture 内容):[2026-05-20-figma-emit-spec-appendix-a-fixture.md](./2026-05-20-figma-emit-spec-appendix-a-fixture.md)

---

## File Structure

**Final layout after this plan:**

```
github/agent-skills/figma-emit-spec/                     # ← 新建
├── SKILL.md                                             # ← 新建,主指引
├── README.md                                            # ← 新建,仓库门面
├── agents/
│   └── openai.yaml                                      # ← 新建
├── references/
│   ├── conflict-detection.md                            # ← 新建:4 种 conflict 规则 + label_drift 算法 + deferred 识别
│   └── spec-template.md                                 # ← 新建:implementation-spec.md 模板与字段填充规则
└── tests/
    └── fixtures/
        └── referral-home/                               # ← 新建,沿用 P2 referral-home 主题
            ├── README.md
            ├── inputs/
            │   ├── clarified-requirement.md             # 模拟 phase A 产物
            │   ├── ui-understanding.md                  # 模拟 phase B 产物
            │   ├── api-mapping.md                       # 模拟 phase C-up 产物
            │   ├── component-mapping.md                 # 模拟 phase C-low 产物(从 P1 fixture 移植 + 加 label_drift)
            │   └── design-token-patch.md                # 模拟 phase D 产物(从 P2 fixture 复用)
            └── expected/
                ├── implementation-spec.md               # 期望主产物
                └── open-questions.md                    # 期望 open-questions 汇总
```

**也修改这些项目级文件:**

```
.claude-plugin/marketplace.json                          # ← 注册 ./figma-emit-spec
AGENTS.md                                                # ← 加 skill 清单条目
README.md                                                # ← 加 skill 清单条目
```

**Files responsibilities:**

| File | Responsibility |
|---|---|
| `SKILL.md` | 主指引,Agent 调用时读它就能完整知道如何合成 + 如何处理 4 种 conflict + 如何识别 deferred + handoff 出口 |
| `README.md` | 仓库门面,说明 skill 是 phase E + handoff 出口 |
| `agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `references/conflict-detection.md` | 4 种 cross-product conflict 检测规则;`label_drift` 自动校正算法;`[deferred]` 识别规则 |
| `references/spec-template.md` | `implementation-spec.md` 模板的逐章节填充规则(每个章节字段从哪份上游产物来) |
| `tests/fixtures/referral-home/` | 端到端 fixture,沿用 P2 referral-home 主题,人工注入 label_drift 触发自动校正 |

**File 划分理由:**
- SKILL.md 保持 ≤300 行,合成逻辑细节(conflict 检测算法、模板填充规则)放参考文档
- fixture 主题沿用 referral-home 与 P2 连贯,套件 fixture 数据接得上
- 故意在 fixture 的 `component-mapping.md` 注入 label_drift(C-low label 与 D label 不一致),展示自动校正机制

---

## Task List

- [ ] **Task 1:** 新分支 + 建立 `figma-emit-spec/` 目录骨架
- [ ] **Task 2:** 写 `SKILL.md`(全新,主指引)
- [ ] **Task 3:** 写 `agents/openai.yaml`
- [ ] **Task 4:** 写 `README.md`
- [ ] **Task 5:** 写 `references/conflict-detection.md`
- [ ] **Task 6:** 写 `references/spec-template.md`
- [ ] **Task 7:** 新增 `tests/fixtures/referral-home/` 端到端 fixture
- [ ] **Task 8:** 人工 review fixture vs spec §4c 的期望行为
- [ ] **Task 9:** 注册 catalog
- [ ] **Task 10:** Final review + 停在 commit 不 push

---

### Task 1: 新分支 + 建立 `figma-emit-spec/` 目录骨架

**Files:**
- Create dir: `figma-emit-spec/`
- Create dir: `figma-emit-spec/agents/`
- Create dir: `figma-emit-spec/references/`
- Create dir: `figma-emit-spec/tests/fixtures/referral-home/inputs/`
- Create dir: `figma-emit-spec/tests/fixtures/referral-home/expected/`

- [ ] **Step 1: 新建分支**

Run:
```bash
cd /Users/su/codeHub/github/agent-skills
git fetch origin
git checkout -b feat/figma-emit-spec docs/figma-workflow-suite-design
git status
```

Expected: 新分支 `feat/figma-emit-spec` 创建,基于已含 P1/P2/PR#3/PR#4 的父分支,工作树干净。

- [ ] **Step 2: 建立目录骨架**

Run:
```bash
mkdir -p figma-emit-spec/agents \
         figma-emit-spec/references \
         figma-emit-spec/tests/fixtures/referral-home/inputs \
         figma-emit-spec/tests/fixtures/referral-home/expected
ls -la figma-emit-spec/
```

Expected: 目录 `figma-emit-spec/` 含 `agents/`, `references/`, `tests/` 三个子目录。

- [ ] **Step 3: 不 commit(空目录 git 不追踪)**

不 commit,等 Task 2~7 写入文件后再 commit。

---

### Task 2: 写 `SKILL.md`(全新,主指引)

**Files:**
- Create: `figma-emit-spec/SKILL.md`

按 spec §4c 章节清单完整写入(8 项)。

- [ ] **Step 1: 写入完整内容**

写入 SKILL.md 完整内容,见附录 B:[2026-05-20-figma-emit-spec-appendix-b-skill-md.md](./2026-05-20-figma-emit-spec-appendix-b-skill-md.md) 的 "SKILL.md 完整内容" 段。

> 附录 B 因 SKILL.md 完整内容(~270 行)较长,从主 plan 剥离以保持主 plan ≤ 1000 行约束。

- [ ] **Step 2: 验证文件落盘**

Run:
```bash
wc -l figma-emit-spec/SKILL.md
head -5 figma-emit-spec/SKILL.md
```

Expected:
- 行数 250~310 之间
- 头 5 行是 frontmatter,`name: figma-emit-spec`

- [ ] **Step 3: Commit**

```bash
git add figma-emit-spec/SKILL.md
git commit -m "feat(figma-emit-spec): add SKILL.md for phase E

New skill for figma-workflow-suite phase E. Synthesizes 5 upstream .md
products into implementation-spec.md + open-questions.md as the single
source of truth for Agent apply stage.

- Reads 5 upstream products (phase A/B/C-up/C-low/D), refuses if any missing
- Detects 4 cross-product conflicts: field_unbound / module_missing_token /
  module_drift / label_drift
- label_drift: auto-correct (use phase D as truth), do NOT write to open-questions
- [deferred] open question: mark module as 'not implemented this iteration'
- Provides 4-option handoff exit (builtin / superpowers / manual / pause)
- Pure functional: does NOT call Figma MCP, does NOT modify upstream

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 2
"
```

---

### Task 3: 写 `agents/openai.yaml`

**Files:**
- Create: `figma-emit-spec/agents/openai.yaml`

- [ ] **Step 1: 写入新文件**

```yaml
interface:
  display_name: "Figma Emit Spec"
  short_description: "合并 5 份上游产物 → implementation-spec.md + handoff"
  default_prompt: "使用 $figma-emit-spec 读取 docs/design/<feature>/ 下的 5 份上游产物(clarified-requirement / ui-understanding / api-mapping / component-mapping / design-token-patch),检测 4 种跨产物冲突(field_unbound / module_missing_token / module_drift / label_drift),识别 [deferred] open questions,合成 implementation-spec.md + open-questions.md 并在 inputs.md 追加记录;最后弹 handoff 菜单让用户选 builtin / superpowers / manual / pause。"
```

- [ ] **Step 2: 验证 yaml 格式**

Run:
```bash
ruby -ryaml -e "d = YAML.load_file('figma-emit-spec/agents/openai.yaml'); puts d['interface']['display_name']"
```

Expected: 打印 `Figma Emit Spec`。

- [ ] **Step 3: Commit**

```bash
git add figma-emit-spec/agents/openai.yaml
git commit -m "feat(figma-emit-spec): add agents/openai.yaml

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 3
"
```

---

### Task 4: 写 `README.md`

**Files:**
- Create: `figma-emit-spec/README.md`

- [ ] **Step 1: 写入新文件**

```markdown
# figma-emit-spec

Part of the **figma-workflow-suite** —— phase E(最后一环).
合并 5 份上游 .md 产物 → `implementation-spec.md`(Agent 编码主输入)+ `open-questions.md`,
并在出口处提供 handoff 选择(builtin / superpowers / manual / pause)。

## Quick start

调用 skill:

```
figma-emit-spec feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase E 自动路由调用)

## Prerequisites

`docs/design/<feature>/` 目录下必须**已有 5 份产物**:
- `clarified-requirement.md`(phase A)
- `ui-understanding.md`(phase B)
- `api-mapping.md`(phase C-up)
- `component-mapping.md`(phase C-low)
- `design-token-patch.md`(phase D)

## Outputs

- `docs/design/<feature>/implementation-spec.md` — Agent 编码主输入
- `docs/design/<feature>/open-questions.md` — 跨阶段未决问题汇总
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录
- (handoff = builtin)`task-breakdown.md`
- (handoff = superpowers)调用 `superpowers:writing-plans` 转 implementation plan

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 冲突检测算法 + label_drift 自动校正:[references/conflict-detection.md](./references/conflict-detection.md)
- spec 模板填充规则:[references/spec-template.md](./references/spec-template.md)
- 端到端 fixture:[tests/fixtures/referral-home/](./tests/fixtures/referral-home/)

## 上下游

```
phase A/B/C-up/C-low/D       →  figma-emit-spec     →  apply stage
5 份 .md 产物                    implementation-spec    用户 coding agent
                                + open-questions       或 superpowers:writing-plans
                                + (optional) task-     或 OpenSpec
                                  breakdown
```

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
```

- [ ] **Step 2: Commit**

```bash
git add figma-emit-spec/README.md
git commit -m "docs(figma-emit-spec): add README.md

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 4
"
```

---

### Task 5: 写 `references/conflict-detection.md`

**Files:**
- Create: `figma-emit-spec/references/conflict-detection.md`

- [ ] **Step 1: 写入新文件**

```markdown
# Cross-Product Conflict 检测细节

本文档补充 `SKILL.md` 中的冲突检测规则,重点说明 4 种 conflict 的检测算法、
`label_drift` 的自动校正机制、`[deferred]` 的识别。

## 4 种 conflict 类型一览

| 类型 | 检测对象 | 检测方式 | 处理 |
|---|---|---|---|
| `field_unbound` | api-mapping 字段 | api-mapping 字段名是否在 component-mapping 中出现 | 写入 open-questions |
| `module_missing_token` | component-mapping module | component-mapping module 名是否在 design-token-patch 中出现 | 写入 open-questions |
| `module_drift` | ui-understanding module | ui-understanding module 名是否在 component-mapping 中出现 | 写入 open-questions |
| `label_drift` | component-mapping 槽位 label | component-mapping 槽位 label 是否等于 design-token-patch 同槽 label | **自动以 D 为准,不写入 open-questions** |

## `label_drift` 自动校正算法

### 为什么自动校正

来自 validation-findings.md F2:在 MVP 真实业务跑通中发现,
`figma-ui-api-mapper`(phase C-low)如果只调 `get_metadata`,会拿到 Figma node.name(经常是 placeholder),
导致 label 推测大量错位(实测 12/15 错位 = 80%)。

`figma-design-token`(phase D)通过 `get_design_context` 拿到的 `characters` 是真实业务文案的事实来源。
冲突时以 D 为准,不需要人介入(答案已知)。

> 注:PR #3 修了 spec §4a 和 PR #4 修了 P1 SKILL.md,要求 mapper 同时调 get_design_context,
> 这大幅减少 label_drift 发生频率。但 edge case 仍存在(例:Figma 文本节点 characters 也是占位),
> 自动校正机制仍需保留。

### 算法

```
for each module in component-mapping.md:
  for each slot in module:
    if slot.label exists in design-token-patch.md (按 module + position 匹配):
      if c_low_label != d_label:
        record auto-correction:
          - module: <module>
          - slot position: <position>
          - c_low_label: <c_low_label>
          - d_label: <d_label>(真值)
        use d_label in implementation-spec.md
    else:
      skip (无法判定,留 c_low_label)
```

### 写入 implementation-spec.md metadata 段

```markdown
## Auto Corrections Metadata
- label_drift: N 个 label 已从 phase C-low 自动校正为 phase D 真实值
- 校正详情:
  - DiamondPreviewCard.primary_value: "钻石余额" → "钻石数量"
  - OperationEntryGrid.list_item_label: "入口" → "运营入口"
```

## `[deferred]` 识别规则

### 触发

任何 open question(无论来自 phase A/B/C-up/C-low/D 哪个产物)前缀 `[deferred]`,即视为 deferred。

例:
```markdown
- [ ] [deferred] 趋势数据来源:接口完全无字段,本期不实现 trend badge
```

### 处理

- emit-spec 在 implementation-spec.md 对应 Module 段**显式标记**"本期不实现"
- deferred items 单独列在 open-questions.md 的 `## Deferred` 段(汇总,不重复散落)
- Verification Checklist 增加项:`[ ] 所有 deferred items 已确认本期不实现`

### 例子

#### 输入(`api-mapping.md` 或 `clarified-requirement.md`):

```markdown
## Open Questions
- [ ] [deferred] 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge
- [ ] 列表是否分页?(待定,假定不分页)
```

#### 输出(`implementation-spec.md` 对应 Module 段):

```markdown
### N. PrimaryMetricCard - 趋势 Badge

> ⚠ Deferred: 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge

(本元素不参与本期实施)
```

#### 输出(`open-questions.md` 顶部汇总):

```markdown
## Deferred (auto-detected from [deferred] prefix)
- [ ] [Phase A] 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge
```

## 检测的边界 / false positive

- MVP 检测是粗粒度字符串匹配,可能 false positive(例:字段名拼写差异、module 名大小写)
- 用户可以直接在 open-questions.md 中标 `[x]` 表示已确认非冲突,emit-spec 不重写该段
- `label_drift` 自动校正只对**已经明确语义对应**的槽位生效;若槽位对应关系本身不确定,留给人工(写入 open-questions 的 module_drift)

## 不做的事

- ❌ 不"猜"字段对应(只做字符串匹配,不做 fuzzy match / 同义词)
- ❌ 不自动改写上游产物(只在 implementation-spec.md 中用校正后的值;上游保持原样)
- ❌ 不无限递归 deferred(若一个 module 全部 deferred,整个 module 段标 deferred,但内部 slot 不重复标)
```

- [ ] **Step 2: Commit**

```bash
git add figma-emit-spec/references/conflict-detection.md
git commit -m "docs(figma-emit-spec): add references/conflict-detection.md

4 conflict types + label_drift auto-correction algorithm + [deferred]
recognition rules. References validation-findings.md F2/F3 as origin.

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 5
"
```

---

### Task 6: 写 `references/spec-template.md`

**Files:**
- Create: `figma-emit-spec/references/spec-template.md`

- [ ] **Step 1: 写入新文件**

```markdown
# implementation-spec.md 模板填充规则

本文档说明 `implementation-spec.md` 每个章节的填充规则 —— 哪份上游产物的哪段内容填到哪。

## 完整模板结构

```markdown
# Implementation Spec — <feature>

> Source of truth for Agent apply stage. DO NOT consume raw Figma JSON in apply.
> Generated by figma-emit-spec@<version> at <ISO8601>
> Label drift auto-corrections: N

## Page
## Goal
## Scope / Out of Scope
## Modules
## API Usage
## Interaction
## Implementation Constraints
## Verification Checklist
## Open Questions
## Auto Corrections Metadata
```

## 各章节填充规则

### `## Page`
- **来源:** `ui-understanding.md` 的 `## Page Structure` 段
- **填充:** 抽取顶层 Page 名,例如 `ReferralHomePage`

### `## Goal`
- **来源:** `clarified-requirement.md` 的 `## Goal` 段
- **填充:** 原文照搬

### `## Scope / Out of Scope`
- **来源:** `clarified-requirement.md` 的 `## Scope` 和 `## Out of Scope` 段
- **填充:** 原文照搬

### `## Modules`(每个 module 一个 ### 子段)

每个 ### 子段的填充顺序:

```markdown
### N. <ModuleName>

> ⚠ Deferred: <若该 module 全部 deferred,在此显式标>

**Responsibilities** (从 ui-understanding.md 推断 + clarified-requirement 校准)
- <bullet 1>
- <bullet 2>

**Data Binding** (从 api-mapping.md + component-mapping.md 合并)
| UI Field | API Field | Transform |
|---|---|---|
| <slot label, 优先用 D 真值> | <api 字段> | <transform> |

**Component** (从 component-mapping.md 推断)
- 优先复用项目已有 `<ComponentName>`(若存在)
- 否则新建 `components/<ModuleName>/`

**Design Tokens** (从 design-token-patch.md 抽取该 module 的 token 表)
- borderRadius: 12px
- padding: 12px 16px
- ...

**States** (从 clarified-requirement.md 的 User States 节推断该 module 涉及的状态)
- loading / empty / error
```

#### Module 顺序

按 `component-mapping.md` 中 module 出现顺序排列(保持视觉上下/左右顺序一致)。

#### slot label 取值优先级

1. `design-token-patch.md` 真值 (D) — 优先
2. `component-mapping.md` C-low 推测 — fallback
3. 若两边都缺,用 `<TBD>` 占位 + 写入 open-questions

### `## API Usage`
- **来源:** `api-mapping.md` 的 `## Data Sources` 段
- **填充:**

```markdown
| Module | API | Suggested Hook |
|---|---|---|
| <module 名,来自 component-mapping> | <api 路径> | use<ModuleName> |
```

### `## Interaction`
- **来源:** `clarified-requirement.md` 的 `## Interaction` 段
- **填充:** 原文照搬

### `## Implementation Constraints`(固定模板 + clarified-requirement 补充)
- 固定 6 项(不直接复刻 Figma 图层 / 不实现装饰节点 / 重复列表数据驱动 / 优先复用项目组件 / 样式 token 来自 D / API 字段以 api-mapping 为准)
- 加上 `clarified-requirement.md` 的 `## Constraints` 段(如有项目级约束)

### `## Verification Checklist`(固定 5 项)
- [ ] 与 Figma 截图视觉对比(允许文本不严格一致)
- [ ] 接口字段类型与 API 文档一致
- [ ] 复用项目已有组件 / 框架
- [ ] 所有 open questions 已解决或显式 defer
- [ ] 所有 deferred items 已确认本期不实现

### `## Open Questions`
- **填充:** 一句话指向 `open-questions.md`,不重复内容

### `## Auto Corrections Metadata`
- **填充:** 列出本次合成的所有 `label_drift` 自动校正

```markdown
- label_drift: N 个 label 已从 phase C-low 自动校正为 phase D 真实值
- 校正详情:
  - <Module>.<slot>: "<原 label>" → "<校正后 label>"
  - ...

(若无校正,本段保持 `(无)`)
```

## INFERRED 标记

任何**新增内容**(不直接来自上游产物原文,而是 emit-spec 合成推断)必须显式标 `(INFERRED)`,例如:

```markdown
**Responsibilities** (INFERRED 从 ui-understanding + clarified-requirement 推断)
- 展示用户当前钻石余额(INFERRED)
```

## 不做的事

- ❌ 不引用 raw Figma JSON
- ❌ 不引入未在上游产物中存在的字段
- ❌ 不在 spec 中添加 emit-spec 的"建议",所有建议应该是 phase A clarified-requirement 的产物
```

- [ ] **Step 2: Commit**

```bash
git add figma-emit-spec/references/spec-template.md
git commit -m "docs(figma-emit-spec): add references/spec-template.md

Per-section filling rules for implementation-spec.md template: which
upstream product each section comes from, slot label priority (D > C-low),
INFERRED marker convention.

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 6
"
```

---

### Task 7: 新增 `tests/fixtures/referral-home/` 端到端 fixture

**Files:** 8 个新文件(见 File Structure 段)

> 各文件**完整内容**在附录 A:[2026-05-20-figma-emit-spec-appendix-a-fixture.md](./2026-05-20-figma-emit-spec-appendix-a-fixture.md)

- [ ] **Step 1: 创建目录**

Run:
```bash
ls figma-emit-spec/tests/fixtures/referral-home/
```

Expected: `expected/` 和 `inputs/` 两个空子目录(Task 1 已建)。

- [ ] **Step 2: 写 `fixtures/referral-home/README.md`** — 取附录 §A1

- [ ] **Step 3: 写 `inputs/clarified-requirement.md`** — 取附录 §A2(含 1 个 [deferred] 标记)

- [ ] **Step 4: 写 `inputs/ui-understanding.md`** — 取附录 §A3

- [ ] **Step 5: 写 `inputs/api-mapping.md`** — 取附录 §A4

- [ ] **Step 6: 写 `inputs/component-mapping.md`** — 取附录 §A5(故意注入 label_drift)

- [ ] **Step 7: 写 `inputs/design-token-patch.md`** — 取附录 §A6(从 P2 fixture 借用,含真实 label)

- [ ] **Step 8: 写 `expected/implementation-spec.md`** — 取附录 §A7(展示 label_drift 自动校正 + deferred 标记)

- [ ] **Step 9: 写 `expected/open-questions.md`** — 取附录 §A8(展示分段汇总 + Deferred 段)

- [ ] **Step 10: 验证文件结构**

Run:
```bash
find figma-emit-spec/tests/fixtures -type f | sort
```

Expected:
```
figma-emit-spec/tests/fixtures/referral-home/README.md
figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md
figma-emit-spec/tests/fixtures/referral-home/expected/open-questions.md
figma-emit-spec/tests/fixtures/referral-home/inputs/api-mapping.md
figma-emit-spec/tests/fixtures/referral-home/inputs/clarified-requirement.md
figma-emit-spec/tests/fixtures/referral-home/inputs/component-mapping.md
figma-emit-spec/tests/fixtures/referral-home/inputs/design-token-patch.md
figma-emit-spec/tests/fixtures/referral-home/inputs/ui-understanding.md
```

- [ ] **Step 11: Commit**

```bash
git add figma-emit-spec/tests/
git commit -m "test(figma-emit-spec): add referral-home end-to-end fixture

Reuses P2 referral-home theme for narrative continuity across the suite.
Provides:
- 5 mock upstream products (phase A/B/C-up/C-low/D)
- 1 expected implementation-spec.md showing label_drift auto-correction +
  deferred marker
- 1 expected open-questions.md showing per-phase segmentation + Deferred section

Intentional label_drift injected in component-mapping.md inputs to demonstrate
auto-correction mechanism (validation-findings.md F2 in action).

MVP validation: manual review (diff). Future: LLM-as-judge.

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 7
"
```

---

### Task 8: 人工 review fixture vs spec §4c 的期望行为

**这一任务由人执行,不写代码,不调 skill。**

- [ ] **Step 1: 对比检查清单**

逐项确认 `figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md` 含:

- [ ] 至少 2 个 Module 子段(对应 component-mapping.md 的 2~3 个 module)
- [ ] 每个 Module 子段含 5 个子项:Responsibilities / Data Binding / Component / Design Tokens / States
- [ ] `## Auto Corrections Metadata` 段非空,列出至少 1 个 label_drift 校正(展示自动校正机制工作)
- [ ] 至少 1 个 Module 子段或 slot 含 `> ⚠ Deferred:` 标记(展示 deferred 机制工作)
- [ ] `## Verification Checklist` 含 5 项 + 最后一项是"所有 deferred items 已确认本期不实现"

逐项确认 `expected/open-questions.md` 含:

- [ ] 6 个分段:Phase A / B / C-up / C-low / D / Cross-Product Conflicts
- [ ] **不**含已被自动校正的 label_drift 项
- [ ] 含 `## Deferred (auto-detected from [deferred] prefix)` 段

发现不一致 → 修对应文件,使其符合 spec §4c 的期望行为。

- [ ] **Step 2: 条件性 Commit**

```bash
# 若 Step 1 修了文件
git add figma-emit-spec/tests/fixtures/referral-home/expected/
git commit -m "test(figma-emit-spec): align fixture expected with spec §4c

Manual review found expected/ products drift from spec §4c expected
behavior. Re-aligned.

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 8
"

# 若 Step 1 未修,本任务无 commit
```

---

### Task 9: 注册 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`(加 `./figma-emit-spec`)
- Modify: `AGENTS.md`(加条目)
- Modify: `README.md`(加条目)

- [ ] **Step 1: 修 `.claude-plugin/marketplace.json`**

在 `figma-design-token` 之后插入:
```json
        "./figma-emit-spec",
```

- [ ] **Step 2: 修 `AGENTS.md`**

在 `figma-design-token` 条目之后插入:
```markdown
- `figma-emit-spec`:合并 5 份上游 .md 产物 → implementation-spec.md + open-questions.md,提供 handoff 出口(figma-workflow-suite 的 phase E)。
```

- [ ] **Step 3: 修 `README.md`**

在 `figma-design-token` 条目之后插入:
```markdown
- `figma-emit-spec`:合并 5 份上游 .md 产物 → implementation-spec.md + open-questions.md,提供 handoff 出口(figma-workflow-suite 的 phase E)
```

- [ ] **Step 4: 验证**

Run:
```bash
git diff --stat .claude-plugin/marketplace.json AGENTS.md README.md
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('JSON OK')"
```

Expected: 3 文件各 +1 行;JSON 合法。

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/marketplace.json AGENTS.md README.md
git commit -m "chore: register figma-emit-spec in project-level catalogs

Refs: docs/superpowers/plans/2026-05-20-figma-emit-spec.md Task 9
"
```

---

### Task 10: Final review + 停在 commit 处不 push

- [ ] **Step 1: 看本 plan 累计 commit**

Run:
```bash
git log --oneline docs/figma-workflow-suite-design..HEAD
```

Expected: 7~9 个 commit(Task 2/3/4/5/6/7/8/9 中实际有 commit 的任务数)。

- [ ] **Step 2: 验证目录最终状态**

Run:
```bash
ls figma-emit-spec/
ls figma-emit-spec/references/
ls figma-emit-spec/tests/fixtures/referral-home/
```

Expected:
```
README.md  SKILL.md  agents  references  tests
```
```
conflict-detection.md  spec-template.md
```
```
README.md  expected  inputs
```

- [ ] **Step 3: 验证 SKILL.md 行数 + frontmatter**

Run:
```bash
wc -l figma-emit-spec/SKILL.md
head -5 figma-emit-spec/SKILL.md
```

Expected:
- 250~310 行
- `name: figma-emit-spec`

- [ ] **Step 4: 不 push,输出后续提示给用户**

```
✅ P3 plan 实施完成。分支 feat/figma-emit-spec 已 commit 但未 push。

后续动作:
  1. 你 review 本地分支上的 commit
  2. 如 OK,你执行 git push -u origin feat/figma-emit-spec
  3. 然后开 PR(base = docs/figma-workflow-suite-design)
  4. 完成 P3 收口后,我可以开始写 P4 (figma-workflow orchestrator)
```

---

## Self-Review Checklist(写完此 plan 后,我已做过的检查)

- ✅ **Spec coverage:** 对照 spec §4c 8 个 SKILL.md 章节清单,Task 2 全部覆盖
- ✅ **Spec coverage:** spec §4c 的 4 conflict + `label_drift` 自动校正(F2)+ `[deferred]` 机制(F3)在 Task 2/5/7 全部体现
- ✅ **Spec coverage:** spec §5.2 handoff 4 选项在 Task 2 SKILL.md 工作流第 7 步 + 5 references 涵盖
- ✅ **Placeholder scan:** 无 "TBD" / "implement later" / "fill in details"
- ✅ **Type consistency:** 5 份上游产物文件名 / 4 种 conflict 类型名 / Module 字段名(Responsibilities / Data Binding / Component / Design Tokens / States)在 SKILL.md、conflict-detection.md、spec-template.md 完全一致
- ✅ **错误兜底:** Task 8 含条件性 commit

## Out of Scope(本 plan **不**做)

- ❌ 实现 `figma-workflow` orchestrator(P4)
- ❌ 端到端套件 fixture(P5)
- ❌ 在 emit-spec 内部实现 superpowers 调用(只在 SKILL.md 写明"调用 superpowers:writing-plans",实际 plugin loader 处理)
- ❌ LLM-as-judge 自动化验证(第 3 版)
- ❌ 开 PR(本 plan 只 commit,等用户 review 后自己 push)
