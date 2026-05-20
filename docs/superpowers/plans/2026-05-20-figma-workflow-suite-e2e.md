# Plan P5: figma-workflow-suite End-to-End Fixture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 suite 级 `referral-home` 端到端 fixture,验证 figma-workflow-suite MVP 从 A/B/C-up 手填产物到 C-low/D/E 输出和 superpowers handoff 的完整链路。

**Architecture:** 这是文档型 fixture,不新增可执行测试。fixture 放在 `docs/superpowers/fixtures/figma-workflow-suite/referral-home/`,用一份 flow map 串联现有 per-skill fixtures,再补齐 suite 级验收清单与 handoff 期望。

**Tech Stack:** Markdown、人工 review fixture、现有 figma skill fixture 复用。

---

## Spec Source

- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/01-overview.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`
- Existing fixtures:
  - `figma-ui-api-mapper/tests/fixtures/course-list/`
  - `figma-design-token/tests/fixtures/referral-home/`
  - `figma-emit-spec/tests/fixtures/referral-home/`
  - `figma-workflow/tests/fixtures/progress-states/`

## File Structure

```text
docs/superpowers/fixtures/figma-workflow-suite/referral-home/
├── README.md
├── flow-map.md
├── validation-checklist.md
└── handoff-superpowers.expected.md
```

## Task List

- [ ] **Task 1:** 新建 fixture 目录和 README
- [ ] **Task 2:** 写 `flow-map.md`
- [ ] **Task 3:** 写 `validation-checklist.md`
- [ ] **Task 4:** 写 `handoff-superpowers.expected.md`
- [ ] **Task 5:** 更新 spec §6 / README 索引
- [ ] **Task 6:** Final review + commit/push/PR

---

### Task 1: 新建 fixture 目录和 README

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/referral-home/README.md`

- [ ] **Step 1: 写 README**

README 必须说明:
- 这是 suite 级端到端 fixture,不是单个 skill fixture
- 覆盖 referral-home 从 A/B/C-up → C-low → D → E → handoff
- 复用现有 per-skill fixture,避免复制大段重复产物
- MVP 验证方式是人工 review

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/fixtures/figma-workflow-suite/referral-home/README.md
git commit -m "test(figma-workflow-suite): add e2e fixture README"
```

---

### Task 2: 写 `flow-map.md`

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/referral-home/flow-map.md`

- [ ] **Step 1: 写 flow map**

必须包含:
- phase A/B/C-up 输入来源
- C-low/D/E 对应 skill 和产物
- 每一步引用现有 fixture 路径
- 预期 progress panel 转换
- 明确 C→D→E 不自动连跑,每步都需要 review gate

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/fixtures/figma-workflow-suite/referral-home/flow-map.md
git commit -m "test(figma-workflow-suite): add referral-home flow map"
```

---

### Task 3: 写 `validation-checklist.md`

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/referral-home/validation-checklist.md`

- [ ] **Step 1: 写验收清单**

清单必须覆盖 §6.4 成功标准:
- P1 course-list 回归等价
- referral-home C→D→E 链路完整
- implementation-spec 可作为唯一主输入
- handoff 到 superpowers 能生成 implementation plan
- 每个 active skill 有 SKILL.md + README + fixture

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/fixtures/figma-workflow-suite/referral-home/validation-checklist.md
git commit -m "test(figma-workflow-suite): add MVP validation checklist"
```

---

### Task 4: 写 `handoff-superpowers.expected.md`

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/referral-home/handoff-superpowers.expected.md`

- [ ] **Step 1: 写 handoff 期望**

必须说明:
- phase E review gate 选择 Proceed 后出现 handoff 菜单
- 选择 `superpowers:writing-plans`
- 输入是 `implementation-spec.md`,不是 raw Figma JSON 或上游五份产物
- 期望输出是 implementation plan,后续由 `executing-plans` / `subagent-driven-development` 接手
- `.workflow-prefs.json` 应记录 `handoff_after_emit: "superpowers"`

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/fixtures/figma-workflow-suite/referral-home/handoff-superpowers.expected.md
git commit -m "test(figma-workflow-suite): add superpowers handoff expectation"
```

---

### Task 5: 更新 spec §6 / README 索引

**Files:**
- Modify: `docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md`
- Modify: `docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`

- [ ] **Step 1: 在 §6.1 集成层面添加 fixture 路径**

加入:
```markdown
Suite-level fixture:
`docs/superpowers/fixtures/figma-workflow-suite/referral-home/`
```

- [ ] **Step 2: 在 suite README 来源材料或目录附近添加 fixture 链接**

加入:
```markdown
- Suite E2E fixture:[referral-home](../../fixtures/figma-workflow-suite/referral-home/)
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md \
        docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md
git commit -m "docs(figma-workflow-suite): link suite-level e2e fixture"
```

---

### Task 6: Final review + commit/push/PR

- [ ] **Step 1: 验证文件结构**

Run:
```bash
find docs/superpowers/fixtures/figma-workflow-suite/referral-home -type f | sort
rg -n "referral-home|figma-ui-api-mapper|figma-design-token|figma-emit-spec|superpowers:writing-plans" docs/superpowers/fixtures/figma-workflow-suite/referral-home
python3 markitdown-export/tests/test_check_markitdown.py
```

Expected:
- 4 个 fixture 文件存在
- 引用 C-low/D/E 和 superpowers handoff
- unittest 通过

- [ ] **Step 2: Push and PR**

```bash
git push -u origin test/figma-workflow-suite-e2e
gh pr create --base docs/figma-workflow-suite-design --head test/figma-workflow-suite-e2e --title "test: add figma workflow suite e2e fixture"
```

---

## Self-Review Checklist

- ✅ 覆盖 §6.1 集成层面 fixture 要求。
- ✅ 覆盖 §6.4 MVP 完工定义。
- ✅ 不复制既有 per-skill fixture 的大段产物,只做 suite 级串联与验收。
- ✅ 不新增自动化 CI / LLM-as-judge。

## Out of Scope

- ❌ 自动执行 C→D→E。
- ❌ 真实调用 Figma MCP。
- ❌ 生成真实 superpowers implementation plan。
- ❌ 自动化评分。
