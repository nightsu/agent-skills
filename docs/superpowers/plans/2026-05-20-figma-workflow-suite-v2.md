# Plan P6: Figma Workflow Suite v2 Design and Boundary Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 figma-workflow-suite 第 2 版补齐设计和实施计划,明确 A/B 自动化 skill、外部 handoff 与 Phase E 后 apply boundary。

**Architecture:** P6 是文档与规划阶段,不实现新 skill 代码。它新增 v2 spec,把真实项目 smoke test 暴露出的"代码编写时机"固化为 suite 级规则,然后把后续实现拆成可独立 PR 的 P7/P8/P9 候选任务。

**Tech Stack:** Markdown、现有 figma-workflow-suite specs、superpowers planning workflow。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/validation-findings.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- Real smoke test project: `/Users/su/codeHub/personal/figma-workflow-mvp`

## File Structure

```text
docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/
└── README.md                         # v2 design spec

docs/superpowers/plans/
└── 2026-05-20-figma-workflow-suite-v2.md
```

## P6 Deliverables

- v2 design spec exists and documents A/B skill contracts.
- v2 design spec defines the apply boundary: no business code before Phase E handoff.
- P6 plan documents follow-up implementation slices.
- P6 explicitly keeps `figma-api-first` outside v2 scope and records it as the 第 3 版 focus.
- Existing MVP docs remain unchanged except for optional links in a follow-up PR.

## Task List

- [ ] **Task 1:** Add v2 design spec
- [ ] **Task 2:** Add P6 implementation plan
- [ ] **Task 3:** Self-review v2 boundary language
- [ ] **Task 4:** Verify docs and prepare PR

---

### Task 1: Add v2 design spec

**Files:**
- Create: `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`

- [ ] **Step 1: Create v2 spec**

The file must include these sections:

```markdown
# Figma Workflow Suite v2 — Design Spec

## TL;DR
Phase A/B/C1/C2/D/E only produce docs/design/<feature>/ artifacts.
Business code starts only after Phase E review gate and handoff.

## Skill Contracts
### figma-clarify-requirement
### figma-ui-understand

## Orchestrator v2 Behavior
## Handoff v2 Behavior
## Compatibility
## Validation
```

- [ ] **Step 2: Check for forbidden ambiguity**

Run:

```bash
rg -n "REPLACE_ME|FILL_ME|UNRESOLVED_DECISION" docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md
git commit -m "docs(figma-workflow-suite): add v2 design spec"
```

---

### Task 2: Add P6 implementation plan

**Files:**
- Create: `docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md`

- [ ] **Step 1: Create P6 plan**

The plan must state that P6 does not implement new skills. It must decompose follow-up work into these future slices:

```markdown
## Follow-up Implementation Slices

### P7 — figma-clarify-requirement
### P8 — figma-ui-understand
### P9 — External handoff and apply boundary updates
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md
git commit -m "docs: add P6 plan for figma workflow suite v2"
```

---

### Task 3: Self-review v2 boundary language

**Files:**
- Review: `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- Review: `docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md`

- [ ] **Step 1: Verify apply boundary is explicit**

Run:

```bash
rg -n "apply boundary|Phase E|business code|业务代码|implementation-spec.md|handoff" \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
  docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md
```

Expected:

- `Phase E` appears in both files.
- `业务代码` or `business code` appears in the v2 spec.
- `implementation-spec.md` appears in the handoff section.

- [ ] **Step 2: Verify v2 scope does not claim implementation**

Run:

```bash
rg -n "不实现新 skill|does not implement|Out of Scope|自动化执行 coding apply" \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
  docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md
```

Expected: matches in both files.

- [ ] **Step 3: Commit fixes if needed**

If Step 1 or Step 2 reveals missing language, patch the docs and commit:

```bash
git add docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
        docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md
git commit -m "docs(figma-workflow-suite): clarify v2 apply boundary"
```

---

### Task 4: Verify docs and prepare PR

**Files:**
- Verify: `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
- Verify: `docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md`

- [ ] **Step 1: Run verification commands**

```bash
rg -n "figma-clarify-requirement|figma-ui-understand|superpowers:brainstorming|OpenSpec|Phase E|handoff|implementation-spec.md" \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md \
  docs/superpowers/plans/2026-05-20-figma-workflow-suite-v2.md

git diff --check
```

Expected:

- `rg` finds both v2 skills plus external handoff and Phase E handoff language.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Push and PR**

```bash
git push -u origin codex/p6-figma-workflow-suite-v2
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p6-figma-workflow-suite-v2 \
  --title "docs: add figma workflow suite v2 plan" \
  --body "Adds the P6 v2 design spec and implementation plan. This is documentation only and does not implement new skills."
```

---

## Follow-up Implementation Slices

### P7 — `figma-clarify-requirement`

Implement Phase A skill as a thin requirement clarifier.

Expected files:

- `figma-clarify-requirement/SKILL.md`
- `figma-clarify-requirement/README.md`
- `figma-clarify-requirement/agents/openai.yaml`
- `figma-clarify-requirement/tests/fixtures/<feature>/expected/clarified-requirement.md`

### P8 — `figma-ui-understand`

Implement Phase B skill for Figma structure and UI semantics.

Expected files:

- `figma-ui-understand/SKILL.md`
- `figma-ui-understand/README.md`
- `figma-ui-understand/agents/openai.yaml`
- `figma-ui-understand/references/ui-understanding-template.md`
- `figma-ui-understand/tests/fixtures/<feature>/expected/ui-understanding.md`

### P9 — External handoff and apply boundary updates

Update existing skills after P7/P8 exist.

Expected files:

- `figma-workflow/SKILL.md`
- `figma-workflow/references/progress-routing.md`
- `figma-emit-spec/SKILL.md`
- `figma-emit-spec/references/spec-template.md`
- `docs/superpowers/fixtures/figma-workflow-suite/<feature>/`

Expected behavior:

- `figma-workflow` routes A/B to v2 skills when available.
- C1 still points to the handfilled `api-mapping.md` template.
- `figma-emit-spec` handoff to `superpowers:writing-plans` uses only `implementation-spec.md`.
- OpenSpec is surfaced as a manual handoff target, not auto-generated.

---

## Self-Review Checklist

- [ ] P6 is documentation/planning only.
- [ ] v2 skill contracts are scoped and do not overlap C1/C2/D/E responsibilities.
- [ ] apply boundary is explicit and repeated in spec and plan.
- [ ] follow-up slices are independently reviewable.
- [ ] `figma-api-first` is explicitly outside v2 scope.
- [ ] `figma-api-first` is identified as 第 3 版, not part of P6.
- [ ] no business code changes are included.

## Out of Scope

- Implementing P7/P8/P9.
- Implementing `figma-api-first`(第 3 版).
- Adding `.figma-cache/`.
- Adding design diff.
- Running a coding apply stage.
