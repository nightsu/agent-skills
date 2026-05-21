# Plan P11: Figma Workflow Suite v4 Scope Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 figma-workflow-suite v4 scope split spec,把第 4 版拆成 cache / diff / UI handoff / assets+validation 四个后续阶段。

**Architecture:** 这是文档型规划变更,不实现新 skill,不修改业务代码。新增 v4 design spec 作为 P12-P15 的上游决策源,并在既有 roadmap 文档中加入指向。

**Tech Stack:** Markdown、现有 `docs/superpowers/specs/` 和 `docs/superpowers/plans/` 约定。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- `docs/superpowers/specs/2026-05-21-figma-api-first-v3/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md`

## File Structure

```text
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/
└── README.md

docs/superpowers/plans/
└── 2026-05-21-figma-workflow-suite-v4.md
```

Optional roadmap touch points:

```text
docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md
docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md` | v4 范围拆分和边界决策 |
| `docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md` | P11 执行计划和 P12-P15 后续拆解 |
| v2 README / migration risks | 可选:把原第 4 版笼统列表指向新的 v4 spec |

## Task List

- [ ] **Task 1:** 新建 P11 分支和 v4 spec 目录
- [ ] **Task 2:** 编写 v4 design spec
- [ ] **Task 3:** 编写 P11 implementation plan
- [ ] **Task 4:** 对齐既有 roadmap 引用
- [ ] **Task 5:** 验证、提交、推送和 PR

---

### Task 1: 新建 P11 分支和 v4 spec 目录

**Files:**
- Create dir: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/`

- [ ] **Step 1: 创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p11-figma-workflow-v4-spec-plan
```

Expected:

- branch is `codex/p11-figma-workflow-v4-spec-plan`
- working tree is clean

- [ ] **Step 2: 创建目录**

Run:

```bash
mkdir -p docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4
```

Expected:

```bash
test -d docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4
```

exits 0.

---

### Task 2: 编写 v4 design spec

**Files:**
- Create: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

- [ ] **Step 1: 写 TL;DR**

Spec must state:

```text
P12 cache     → 缓存 Figma MCP 读取结果
P13 diff      → 基于 cache 产出 design-diff.md
P14 handoff   → 输出 UI handoff 最低规范
P15 assets+QA → 资源下载约定和自动化验证
```

- [ ] **Step 2: 写 scope split**

Include sections:

- `P12: Cache Layer`
- `P13: Design Diff`
- `P14: UI Handoff Minimum Spec`
- `P15: Assets and Automated Validation`

Each section must include:

- Goal
- Suggested products
- Boundaries

- [ ] **Step 3: 写 coding boundary**

Include:

- Phase A-E only produce `docs/design/<feature>/` artifacts.
- cache / diff / handoff / assets do not write business code.
- business code starts only after explicit user confirmation to execute coding.
- `implementation-spec.md` must not consume raw Figma JSON.

- [ ] **Step 4: 写 roadmap**

Include:

```markdown
- P11: v4 scope split spec + implementation plan。
- P12: cache layer spec / implementation。
- P13: design diff spec / implementation。
- P14: UI handoff minimum spec / implementation。
- P15: assets + automated validation spec / implementation。
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "P12|P13|P14|P15|\\.figma-cache|design-diff.md|ui-handoff.md|assets|automated validation|业务代码|raw Figma JSON" docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 3: 编写 P11 implementation plan

**Files:**
- Create: `docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md`

- [ ] **Step 1: 写 plan header**

Use the standard Superpowers plan header:

```markdown
# Plan P11: Figma Workflow Suite v4 Scope Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 figma-workflow-suite v4 scope split spec,把第 4 版拆成 cache / diff / UI handoff / assets+validation 四个后续阶段。
```

- [ ] **Step 2: 写 file structure 和 responsibilities**

Include exact files:

- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md`
- optional roadmap files

- [ ] **Step 3: 写 future task split**

Plan must explicitly state future phases:

- P12 cache layer
- P13 design diff
- P14 UI handoff minimum spec
- P15 assets + automated validation

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "P11|P12|P13|P14|P15|cache|design diff|UI handoff|assets|automated validation|docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4" docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md
```

Expected: all key phrases found.

---

### Task 4: 对齐既有 roadmap 引用

**Files:**
- Modify: `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- Modify: `docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md`

- [ ] **Step 1: 更新 v2 README**

In `Roadmap Position`, change 第 4 版 row to mention v4 spec path:

```markdown
- 第 4 版: 缓存层 / diff / UI handoff 规范 / assets / 自动化验证。详见 `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`。
```

- [ ] **Step 2: 更新 migration risks**

In `### 第 4 版`, add:

```markdown
> 范围拆分见 `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`。
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "figma-workflow-suite-v4|第 4 版|缓存层|design-diff.md|UI handoff" docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md
```

Expected: all key phrases found.

---

### Task 5: 验证、提交、推送和 PR

**Files:**
- Verify all modified files

- [ ] **Step 1: Run verification**

```bash
rg -n "P11|P12|P13|P14|P15|\\.figma-cache|design-diff.md|ui-handoff.md|assets|automated validation|业务代码|raw Figma JSON|figma-workflow-suite-v4" \
  docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md \
  docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md

git diff --check
```

Expected:

- `rg` finds v4 scope split and boundary terms.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm no implementation code was changed**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD | rg '^(src|app|components|pages|figma-[^/]+)/' || true
```

Expected: no output, because P11 only changes docs under `docs/superpowers/`.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md \
        docs/superpowers/plans/2026-05-21-figma-workflow-suite-v4.md \
        docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
        docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md
git commit -m "docs: add figma workflow suite v4 plan"
```

- [ ] **Step 4: Push and PR**

```bash
git push -u origin codex/p11-figma-workflow-v4-spec-plan
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p11-figma-workflow-v4-spec-plan \
  --title "docs: add figma workflow suite v4 plan" \
  --body "Adds the v4 scope split spec and P11 plan for cache, design diff, UI handoff, and assets/automated validation. No skill implementation or business code changes."
```

---

## Self-Review Checklist

- [ ] v4 scope is split into P12-P15.
- [ ] Cache is before diff.
- [ ] Diff depends on cache and does not mutate upstream products.
- [ ] UI handoff is not an implementation spec.
- [ ] Assets / automated validation are last.
- [ ] Coding boundary remains explicit.
- [ ] P11 only changes docs.

## Out of Scope

- Implementing `.figma-cache/`.
- Implementing `design-diff.md`.
- Implementing `ui-handoff.md`.
- Downloading assets.
- Adding automated tests or LLM-as-judge.
- Writing business code.
