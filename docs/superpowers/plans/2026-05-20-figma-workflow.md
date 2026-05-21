# Plan P4: `figma-workflow` Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-workflow` skill,作为 figma-workflow-suite MVP 的 orchestrator,按 `docs/design/<feature>/` 的产物存在性推断下一阶段,展示进度面板、review gate 与 handoff 出口说明。

**Architecture:** 这是一个文档型 orchestrator skill,不引入可执行程序。`SKILL.md` 放核心流程和调用约定,`references/progress-routing.md` 放阶段推断、菜单与 review gate 细节,`templates/` 放 A/B/C1 手填产物模板,`tests/fixtures/progress-states/` 放人工 review fixture。

**Tech Stack:** Markdown、YAML frontmatter、Claude Code marketplace JSON、人工 fixture review。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/03-orchestrator.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/01-overview.md`

## File Structure

Final layout:

```text
figma-workflow/
├── SKILL.md
├── README.md
├── agents/
│   └── openai.yaml
├── references/
│   └── progress-routing.md
├── templates/
│   ├── clarified-requirement.md
│   ├── ui-understanding.md
│   └── api-mapping.md
└── tests/
    └── fixtures/
        └── progress-states/
            ├── README.md
            ├── empty-feature.expected.md
            └── ready-for-d.expected.md
```

Project-level files:

```text
.claude-plugin/marketplace.json
AGENTS.md
README.md
```

## Task List

- [ ] **Task 1:** 建立 `figma-workflow/` 目录骨架
- [ ] **Task 2:** 写 `SKILL.md`
- [ ] **Task 3:** 写 `agents/openai.yaml`
- [ ] **Task 4:** 写 `README.md`
- [ ] **Task 5:** 写 `references/progress-routing.md`
- [ ] **Task 6:** 写 A/B/C1 手填模板
- [ ] **Task 7:** 新增 `progress-states` fixture
- [ ] **Task 8:** 注册 catalog
- [ ] **Task 9:** Final review + commit/push/PR

---

### Task 1: 建立目录骨架

**Files:**
- Create dir: `figma-workflow/agents/`
- Create dir: `figma-workflow/references/`
- Create dir: `figma-workflow/templates/`
- Create dir: `figma-workflow/tests/fixtures/progress-states/`

- [ ] **Step 1: 创建目录**

Run:
```bash
mkdir -p figma-workflow/agents \
         figma-workflow/references \
         figma-workflow/templates \
         figma-workflow/tests/fixtures/progress-states
ls figma-workflow/
```

Expected:
```text
agents
references
templates
tests
```

No commit; empty directories are not tracked.

---

### Task 2: 写 `SKILL.md`

**Files:**
- Create: `figma-workflow/SKILL.md`

- [ ] **Step 1: 写入主指引**

`SKILL.md` 风格参考已有 `figma-ui-api-mapper` / `figma-design-token` / `figma-emit-spec`,正文尽量使用中文,仅保留必要英文术语。必须包含:
- Frontmatter `name: figma-workflow`
- `Position in figma-workflow`
- `Prerequisites`
- `Calling convention`
- 适用场景 / 目标 / 工作流
- 阶段进入条件表
- 进度面板格式
- Review gate 行为
- Handoff 出口
- 不要做的事

- [ ] **Step 2: 验证**

Run:
```bash
wc -l figma-workflow/SKILL.md
head -5 figma-workflow/SKILL.md
rg -n "适用场景|目标|工作流|阶段进入条件|进度面板|路由行为|Review gate 行为|Handoff 出口|不要做的事" figma-workflow/SKILL.md
```

Expected:
- 220~300 lines
- frontmatter contains `name: figma-workflow`
- all required sections found

- [ ] **Step 3: Commit**

```bash
git add figma-workflow/SKILL.md
git commit -m "feat(figma-workflow): add orchestrator SKILL.md

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 2
"
```

---

### Task 3: 写 `agents/openai.yaml`

**Files:**
- Create: `figma-workflow/agents/openai.yaml`

- [ ] **Step 1: 写入 YAML**

```yaml
interface:
  display_name: "Figma Workflow"
  short_description: "按 docs/design/<feature>/ 产物驱动 C→D→E 流程"
  default_prompt: "使用 $figma-workflow feature=<feature-name> 按 docs/design/<feature>/ 下的产物存在性推断进度,展示阶段面板,提供 A/B/C1 手填模板,并路由到 figma-ui-api-mapper / figma-design-token / figma-emit-spec;每阶段完成后展示 review gate,phase E 后展示 handoff 出口。"
```

- [ ] **Step 2: 验证 YAML**

Run:
```bash
ruby -ryaml -e "d = YAML.load_file('figma-workflow/agents/openai.yaml'); puts d['interface']['display_name']"
```

Expected: `Figma Workflow`

- [ ] **Step 3: Commit**

```bash
git add figma-workflow/agents/openai.yaml
git commit -m "feat(figma-workflow): add agents/openai.yaml

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 3
"
```

---

### Task 4: 写 `README.md`

**Files:**
- Create: `figma-workflow/README.md`

- [ ] **Step 1: 写入 README**

README must explain:
- this is the suite orchestrator
- quick start `figma-workflow feature=<feature-name>`
- artifact layout under `docs/design/<feature>/`
- active MVP phases: C2, D, E
- handoff options after phase E

- [ ] **Step 2: Commit**

```bash
git add figma-workflow/README.md
git commit -m "docs(figma-workflow): add README.md

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 4
"
```

---

### Task 5: 写 `references/progress-routing.md`

**Files:**
- Create: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: 写入 routing 细节**

Reference must include:
- artifact existence/non-placeholder checks
- phase readiness table copied from spec §3.1
- progress panel rendering rules
- review gate menu semantics
- phase E handoff menu semantics
- error handling table

- [ ] **Step 2: Commit**

```bash
git add figma-workflow/references/progress-routing.md
git commit -m "docs(figma-workflow): add progress routing reference

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 5
"
```

---

### Task 6: 写 A/B/C1 手填模板

**Files:**
- Create: `figma-workflow/templates/clarified-requirement.md`
- Create: `figma-workflow/templates/ui-understanding.md`
- Create: `figma-workflow/templates/api-mapping.md`

- [ ] **Step 1: 写模板**

Each template must:
- contain concrete section headings
- include `<!-- TODO: ... -->` placeholders so orchestrator can detect unfilled templates
- avoid business-specific defaults

- [ ] **Step 2: 验证 placeholder 存在**

Run:
```bash
rg -n "<!-- TODO:" figma-workflow/templates
```

Expected: at least one TODO marker in each template.

- [ ] **Step 3: Commit**

```bash
git add figma-workflow/templates/
git commit -m "docs(figma-workflow): add handwritten phase templates

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 6
"
```

---

### Task 7: 新增 `progress-states` fixture

**Files:**
- Create: `figma-workflow/tests/fixtures/progress-states/README.md`
- Create: `figma-workflow/tests/fixtures/progress-states/empty-feature.expected.md`
- Create: `figma-workflow/tests/fixtures/progress-states/ready-for-d.expected.md`

- [ ] **Step 1: 写 fixture**

Fixture must cover:
- empty feature directory → next step phase A templates
- A/B/C1/C2 present → next step phase D
- expected progress panel format

- [ ] **Step 2: 验证内容**

Run:
```bash
rg -n "Feature:|Progress:|Next step:|phase A|phase D|figma-design-token" figma-workflow/tests/fixtures/progress-states
```

Expected: all fixture files include the expected panel markers.

- [ ] **Step 3: Commit**

```bash
git add figma-workflow/tests/
git commit -m "test(figma-workflow): add progress state fixtures

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 7
"
```

---

### Task 8: 注册 catalog

**Files:**
- Modify: `.claude-plugin/marketplace.json`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: marketplace 注册**

Insert after `./figma-emit-spec`:
```json
        "./figma-workflow",
```

- [ ] **Step 2: AGENTS.md 注册**

Insert after `figma-emit-spec`:
```markdown
- `figma-workflow`:按 docs/design/<feature>/ 产物状态驱动 figma-workflow-suite C→D→E 阶段,展示 review gate 与 handoff 出口。
```

- [ ] **Step 3: README.md 注册**

Insert after `figma-emit-spec`:
```markdown
- `figma-workflow`:按 docs/design/<feature>/ 产物状态驱动 figma-workflow-suite C→D→E 阶段,展示 review gate 与 handoff 出口
```

- [ ] **Step 4: 验证**

Run:
```bash
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('JSON OK')"
rg -n "figma-workflow" .claude-plugin/marketplace.json AGENTS.md README.md
```

Expected: JSON OK and all 3 project-level files mention `figma-workflow`.

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/marketplace.json AGENTS.md README.md
git commit -m "chore: register figma-workflow in project-level catalogs

Refs: docs/superpowers/plans/2026-05-20-figma-workflow.md Task 8
"
```

---

### Task 9: Final review + commit/push/PR

- [ ] **Step 1: 验证结构**

Run:
```bash
find figma-workflow -maxdepth 3 -type f | sort
wc -l figma-workflow/SKILL.md
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('JSON OK')"
ruby -ryaml -e "d = YAML.load_file('figma-workflow/agents/openai.yaml'); puts d['interface']['display_name']"
```

Expected:
- expected files exist
- `SKILL.md` 220~300 lines
- JSON OK
- `Figma Workflow`

- [ ] **Step 2: Run available test**

Run:
```bash
python3 markitdown-export/tests/test_check_markitdown.py
```

Expected: unittest passes.

- [ ] **Step 3: Push and PR**

```bash
git push -u origin feat/figma-workflow
gh pr create --base docs/figma-workflow-suite-design --head feat/figma-workflow --title "feat: add figma-workflow orchestrator skill"
```

---

## Self-Review Checklist

- ✅ Spec coverage: §3 orchestrator required SKILL.md sections map to Task 2.
- ✅ Spec coverage: §2 file layout and templates map to Task 6.
- ✅ Spec coverage: §5 review gate and handoff semantics map to Task 5.
- ✅ Catalog registration map to Task 8.
- ✅ No placeholder steps: every task has concrete files, commands, and expected outcomes.

## Out of Scope

- ❌ Implementing executable CLI code.
- ❌ Auto-running C→D→E without user review.
- ❌ `figma-workflow.config.json`.
- ❌ Phase A/B automated skills.
- ❌ Figma diff/cache behavior.
