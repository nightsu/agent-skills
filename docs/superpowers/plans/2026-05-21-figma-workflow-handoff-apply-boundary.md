# Plan P9: `figma-workflow` Handoff and Apply Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 更新现有 `figma-workflow` / `figma-emit-spec` 文档契约,让 v2 的 A/B skill 路由、Phase E handoff 和 apply boundary 明确落地。

**Architecture:** 这是文档型行为契约更新,不新增可执行程序。`figma-workflow` 负责把 phase A/B 从手填提示升级为"优先路由到 skill,不可用时 fallback 模板";`figma-emit-spec` 负责收紧 apply boundary 和 handoff 输入输出;fixture 负责验证 handoff 菜单和边界语义。

**Tech Stack:** Markdown、YAML frontmatter、人工 review fixture、现有 figma-workflow-suite 文档规范。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/03-orchestrator.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`
- `figma-clarify-requirement/SKILL.md`
- `figma-ui-understand/SKILL.md`
- `figma-emit-spec/SKILL.md`

## Important Boundary

`figma-api-first` belongs to **Phase C-up** and remains a future v3 / P10 item.

P9 must not implement `figma-api-first`, must not replace `api-mapping.md`, and must not change C-up from "manual template" to an automated skill. P9 may only mention that C-up is still manual in v2 and will be replaced by `figma-api-first` later.

## File Structure

```text
figma-workflow/
├── SKILL.md
└── references/
    └── progress-routing.md

figma-emit-spec/
├── SKILL.md
└── references/
    └── spec-template.md

docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/
├── README.md
├── flow-map.md
└── handoff-apply-boundary.expected.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-workflow/SKILL.md` | 更新 orchestrator 主说明:A/B 路由到 v2 skills,C-up 仍手填,Phase E 前不写业务代码 |
| `figma-workflow/references/progress-routing.md` | 更新阶段进入条件、菜单、fallback 语义和 handoff 菜单细节 |
| `figma-emit-spec/SKILL.md` | 收紧 emit-spec 边界:只合成 spec,不触发代码修改;handoff 只交付明确输入 |
| `figma-emit-spec/references/spec-template.md` | 在 implementation spec 模板规则中补 apply boundary 文案 |
| `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/` | suite 级 fixture,验证 A/B skill 路由、C-up 手填、Phase E 后 handoff 才进入 apply stage |

## Task List

- [ ] **Task 1:** 新建实现分支并确认基线
- [ ] **Task 2:** 更新 `figma-workflow/SKILL.md`
- [ ] **Task 3:** 更新 `figma-workflow/references/progress-routing.md`
- [ ] **Task 4:** 更新 `figma-emit-spec/SKILL.md`
- [ ] **Task 5:** 更新 `figma-emit-spec/references/spec-template.md`
- [ ] **Task 6:** 新增 suite 级 sales-workbench fixture
- [ ] **Task 7:** 文档验证、提交、推送和 PR

---

### Task 1: 新建实现分支并确认基线

**Files:**
- None

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p9-workflow-handoff-apply-boundary
```

Expected:

- branch is `codex/p9-workflow-handoff-apply-boundary`
- working tree is clean
- branch contains merged P7 `figma-clarify-requirement/`
- branch contains merged P8 `figma-ui-understand/`

---

### Task 2: 更新 `figma-workflow/SKILL.md`

**Files:**
- Modify: `figma-workflow/SKILL.md`

- [ ] **Step 1: Update phase overview**

Replace the MVP-only phase overview with v2 wording:

```markdown
phase A → phase B → phase C-up → phase C-low → phase D → phase E → handoff 出口
clarify   UI理解     手填 API     ui-api-mapper  design-token  emit-spec
```

Include:

- phase A routes to `figma-clarify-requirement` when available
- phase B routes to `figma-ui-understand` when available
- phase C-up remains manual `api-mapping.md` in v2
- future `figma-api-first` will replace C-up, but is not part of this version
- business code starts only after Phase E review gate and handoff

- [ ] **Step 2: Update goals and non-goals**

In `目标`, replace "对 A/B/C-up 给出手填模板路径" with:

- A/B: route to v2 skill when available, fallback to template
- C-up: keep manual template path
- Phase E: show handoff menu and enforce apply boundary

In `不承担`, include:

- 不实现 `figma-api-first`
- 不自动生成 `api-mapping.md`
- 不在 Phase E handoff 前写业务代码
- 不自动调用 apply/coding agent

- [ ] **Step 3: Update workflow and stage entry table**

Update workflow step 5:

```markdown
- A:优先调用 `figma-clarify-requirement`;不可用时提示模板
- B:优先调用 `figma-ui-understand`;不可用时提示模板
- C-up:提示复制 `templates/api-mapping.md` 后手填(v2 仍手填)
- C-low/D/E:路由到现有 skill
```

Update stage entry table rows:

| 目标阶段 | 动作 |
|---|---|
| A | `figma-clarify-requirement` if available; fallback template |
| B | `figma-ui-understand` if available; fallback template |
| C-up | manual `api-mapping.md`; future `figma-api-first` not in v2 |

- [ ] **Step 4: Update routing behavior**

Update `## 路由行为` table:

- A:调用 `figma-clarify-requirement feature=<feature>`;若不可用,提示模板
- B:调用 `figma-ui-understand feature=<feature>`;若不可用,提示模板并索取 Figma file key / node id
- C-up:仍手填 `api-mapping.md`
- C-low/D/E unchanged

- [ ] **Step 5: Strengthen handoff text**

In `## Handoff 出口`, add:

- Phase E handoff is the first point where apply/coding may start.
- `superpowers:writing-plans` is recommended when available.
- `builtin` only generates `task-breakdown.md`; it does not write code.
- `manual` may include OpenSpec as an external target, but P9 does not generate OpenSpec proposals.

- [ ] **Step 6: Verify**

Run:

```bash
rg -n "figma-clarify-requirement|figma-ui-understand|figma-api-first|api-mapping.md|Phase E|handoff|业务代码|superpowers:writing-plans|OpenSpec" figma-workflow/SKILL.md
```

Expected: all key phrases found.

- [ ] **Step 7: Commit**

```bash
git add figma-workflow/SKILL.md
git commit -m "docs(figma-workflow): route v2 A B skills"
```

---

### Task 3: 更新 `figma-workflow/references/progress-routing.md`

**Files:**
- Modify: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: Update phase readiness table**

Change A/B actions:

```markdown
| A | `clarified-requirement.md` | 永远可进入 | 调用 `figma-clarify-requirement`;不可用时提示模板 |
| B | `ui-understanding.md` | A 非占位 | 调用 `figma-ui-understand`;不可用时提示模板 |
| C-up | `api-mapping.md` | A + B 非占位 | 提示复制 `templates/api-mapping.md` 后手填(v2 仍手填;未来由 `figma-api-first` 替代) |
```

- [ ] **Step 2: Split manual and skill menus**

Replace `## 手填阶段菜单` with:

- `## Phase A/B skill 菜单`
- `## C-up 手填菜单`

A/B skill menu:

```text
Next step:
  [1] Run figma-clarify-requirement (phase A)
  [2] Use template fallback
  [3] Manually edit a product
  [4] Exit
```

B uses `figma-ui-understand` in option 1.

C-up manual menu:

```text
Next step:
  [1] Create/fill api-mapping.md from template
  [2] Manually edit a product
  [3] Exit
```

State that C-up remains manual in v2 and `figma-api-first` is a future phase C-up skill.

- [ ] **Step 3: Update skill stage menu**

Keep C-low/D/E menu unchanged, but state A/B are now also skill-routed when available and use their own menu.

- [ ] **Step 4: Update Phase E handoff**

Update handoff handling:

- `superpowers` option is recommended when detected.
- `builtin` generates `task-breakdown.md` only.
- `manual` can mention external apply targets including OpenSpec, Cursor, Codex, or user-owned process.
- `pause` means answer open questions or edit upstream products first.
- No handoff option writes business code inside `figma-workflow`.

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "figma-clarify-requirement|figma-ui-understand|figma-api-first|C-up 手填|Phase A/B skill|superpowers.*recommended|OpenSpec|不写业务代码" figma-workflow/references/progress-routing.md
```

Expected: all key phrases found.

- [ ] **Step 6: Commit**

```bash
git add figma-workflow/references/progress-routing.md
git commit -m "docs(figma-workflow): document v2 progress routing"
```

---

### Task 4: 更新 `figma-emit-spec/SKILL.md`

**Files:**
- Modify: `figma-emit-spec/SKILL.md`

- [ ] **Step 1: Tighten apply boundary**

In `目标`, add:

- `implementation-spec.md` is the only main input to apply stage
- emit-spec does not trigger code changes
- code writing starts only after Phase E review gate and handoff

In `不承担`, add:

- 不调用 apply/coding agent
- 不修改业务代码
- 不生成 OpenSpec proposal

- [ ] **Step 2: Update handoff workflow**

In workflow step 7:

- state `superpowers:writing-plans` is recommended when available
- `superpowers` receives only `implementation-spec.md`
- `builtin` generates `task-breakdown.md` only
- `manual` exits and points user to `implementation-spec.md`; manual external targets may include OpenSpec, but this skill does not generate OpenSpec proposal
- `pause` exits so user can answer open questions or edit upstream products

- [ ] **Step 3: Update output / downstream sections**

In `下游衔接`, add:

- `handoff = superpowers` is the preferred apply-planning path when available
- `handoff = builtin` is a lightweight fallback
- all handoff paths occur after Phase E review gate Proceed
- no business code is written by emit-spec itself

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "implementation-spec.md.*唯一主输入|Phase E review gate|handoff|superpowers:writing-plans|OpenSpec|不修改业务代码|不调用 apply|不生成 OpenSpec" figma-emit-spec/SKILL.md
```

Expected: all key phrases found.

- [ ] **Step 5: Commit**

```bash
git add figma-emit-spec/SKILL.md
git commit -m "docs(figma-emit-spec): clarify apply handoff boundary"
```

---

### Task 5: 更新 `figma-emit-spec/references/spec-template.md`

**Files:**
- Modify: `figma-emit-spec/references/spec-template.md`

- [ ] **Step 1: Add apply boundary note**

In `## 完整模板结构`, update the template header to include:

```markdown
> Apply boundary: business code may start only after Phase E review gate Proceed + handoff selection.
```

- [ ] **Step 2: Update Implementation Constraints fill rules**

In `### ## Implementation Constraints`, add fixed constraints:

- `implementation-spec.md` 是 apply stage 的单一主输入
- 实施 agent 不直接读取 raw Figma JSON
- 如果选择 `superpowers:writing-plans`,输入只包含 `implementation-spec.md`
- OpenSpec 仅作为 manual handoff 目标被提示,本阶段不自动生成 proposal

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "Apply boundary|Phase E review gate|implementation-spec.md.*单一主输入|raw Figma JSON|superpowers:writing-plans|OpenSpec" figma-emit-spec/references/spec-template.md
```

Expected: all key phrases found.

- [ ] **Step 4: Commit**

```bash
git add figma-emit-spec/references/spec-template.md
git commit -m "docs(figma-emit-spec): update spec template boundary"
```

---

### Task 6: 新增 suite 级 sales-workbench fixture

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/README.md`
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/flow-map.md`
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/handoff-apply-boundary.expected.md`

- [ ] **Step 1: Create fixture directory**

Run:

```bash
mkdir -p docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
```

- [ ] **Step 2: Write fixture README**

README must explain:

- Fixture topic: 后台销售工作台
- Purpose: suite-level validation for P9 routing and handoff semantics
- It references P7/P8 sales-workbench fixtures
- It does not execute Figma MCP and does not write business code

- [ ] **Step 3: Write flow-map**

`flow-map.md` must include:

```markdown
# Flow Map — sales-workbench

| Phase | Producer | Product | P9 behavior |
|---|---|---|---|
| A | figma-clarify-requirement | clarified-requirement.md | skill route preferred; template fallback |
| B | figma-ui-understand | ui-understanding.md | skill route preferred; template fallback |
| C-up | manual api-mapping template | api-mapping.md | still manual in v2; future figma-api-first |
| C-low | figma-ui-api-mapper | component-mapping.md | unchanged |
| D | figma-design-token | design-token-patch.md | unchanged |
| E | figma-emit-spec | implementation-spec.md + open-questions.md | handoff menu appears after review gate Proceed |
```

- [ ] **Step 4: Write handoff expectation**

`handoff-apply-boundary.expected.md` must include:

- Phase E before handoff: no business code.
- Phase E review gate Proceed required.
- `superpowers:writing-plans` recommended when available.
- superpowers input: `implementation-spec.md` only.
- builtin output: `task-breakdown.md` only.
- manual may mention OpenSpec as external target, but no OpenSpec proposal is generated.
- pause exits for open questions / upstream edits.

- [ ] **Step 5: Verify fixture**

Run:

```bash
rg -n "sales-workbench|figma-clarify-requirement|figma-ui-understand|figma-api-first|C-up|superpowers:writing-plans|implementation-spec.md|task-breakdown.md|OpenSpec|no business code" docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
```

Expected: all key phrases found.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
git commit -m "test(figma-workflow-suite): add handoff boundary fixture"
```

---

### Task 7: 文档验证、提交、推送和 PR

**Files:**
- Verify all modified files

- [ ] **Step 1: Run verification**

```bash
rg -n "figma-clarify-requirement|figma-ui-understand|figma-api-first|api-mapping.md|Phase E|handoff|business code|业务代码|implementation-spec.md|superpowers:writing-plans|OpenSpec" \
  figma-workflow/SKILL.md \
  figma-workflow/references/progress-routing.md \
  figma-emit-spec/SKILL.md \
  figma-emit-spec/references/spec-template.md \
  docs/superpowers/fixtures/figma-workflow-suite/sales-workbench

git diff --check
```

Expected:

- `rg` finds A/B routing, future api-first boundary, Phase E handoff, apply boundary, superpowers and OpenSpec language.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm no implementation code was changed**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD | rg '^(src|app|components|pages)/' || true
```

Expected: no output.

- [ ] **Step 3: Push and PR**

```bash
git push -u origin codex/p9-workflow-handoff-apply-boundary
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p9-workflow-handoff-apply-boundary \
  --title "docs: update workflow handoff and apply boundary" \
  --body "Updates figma-workflow and figma-emit-spec docs for v2 A/B routing and Phase E handoff/apply boundary. Does not implement figma-api-first."
```

---

## Self-Review Checklist

- [ ] A routes to `figma-clarify-requirement` when available.
- [ ] B routes to `figma-ui-understand` when available.
- [ ] C-up remains manual in v2.
- [ ] `figma-api-first` is explicitly future v3/P10, not implemented in P9.
- [ ] Phase E handoff is the first point where apply/coding may start.
- [ ] `superpowers:writing-plans` is recommended when available.
- [ ] `implementation-spec.md` is the only main input to apply stage.
- [ ] OpenSpec is only surfaced as a manual external target, not generated.
- [ ] No business code or unrelated files are changed.

## Out of Scope

- Implementing `figma-api-first`.
- Updating C-up to automated routing.
- Writing application code.
- Calling Figma MCP.
- Generating OpenSpec proposals.
