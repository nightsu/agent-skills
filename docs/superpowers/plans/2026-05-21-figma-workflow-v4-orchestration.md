# Figma Workflow v4 Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `figma-workflow` explicitly orchestrate v4 engineering checkpoints as strongly recommended, non-blocking, auditable pre-handoff and mid-workflow prompts.

**Architecture:** Add a focused v4 orchestration reference plus a small Node.js helper that can infer checkpoint status from `docs/design/<feature>/`, render checkpoint/summary text, and append skip audit entries. Keep A-E phase completion unchanged; v4 remains a separate engineering checkpoint layer. The helper is intentionally filesystem-only so it can be tested with fixtures before P14/P15 implementation exists.

**Tech Stack:** Markdown, Node.js CommonJS scripts, JSON/Markdown fixtures, existing `figma-workflow` docs and test fixture style.

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-workflow-v4-orchestration-design.md`
- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `figma-workflow/SKILL.md`
- `figma-workflow/references/progress-routing.md`
- `figma-workflow/scripts/figma-cache.js`
- `figma-workflow/scripts/figma-diff.js`

## File Structure

```text
figma-workflow/
├── SKILL.md
├── references/
│   ├── progress-routing.md
│   └── v4-orchestration.md
├── scripts/
│   ├── figma-v4-checkpoint.js
│   └── figma-v4-checkpoint.test.js
└── tests/
    └── fixtures/
        └── v4-checkpoint/
            ├── README.md
            ├── pre-handoff.expected.md
            └── mid-workflow.expected.md

docs/superpowers/specs/
└── 2026-05-21-figma-workflow-suite-v4/README.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-workflow/references/v4-orchestration.md` | Canonical orchestration contract for P13/P14/P15 prompt levels, statuses, actions, skip audit, and handoff summary |
| `figma-workflow/scripts/figma-v4-checkpoint.js` | Filesystem helper for detecting v4 checkpoint state, rendering checkpoint/summary text, and appending skip audit entries |
| `figma-workflow/scripts/figma-v4-checkpoint.test.js` | Node built-in tests for required prompt detection, non-blocking continue semantics, and skip audit output |
| `figma-workflow/tests/fixtures/v4-checkpoint/*` | Human-readable expected output fixtures for mid-workflow and pre-handoff checkpoint panels |
| `figma-workflow/SKILL.md` | Orchestrator instructions for where v4 checkpoints appear and how they interact with handoff |
| `figma-workflow/references/progress-routing.md` | Detailed routing rules for v4 checkpoint menu and status rendering |
| v4 suite spec | Link to the dedicated v4 orchestration design/implementation plan |

## Task List

- [ ] **Task 1:** 新建实现分支并确认基线
- [ ] **Task 2:** 编写 v4 orchestration reference
- [ ] **Task 3:** TDD 实现 `figma-v4-checkpoint.js`
- [ ] **Task 4:** 新增 v4 checkpoint fixtures
- [ ] **Task 5:** 更新 `figma-workflow` 主说明和 progress routing
- [ ] **Task 6:** 更新 v4 suite spec 索引
- [ ] **Task 7:** 验证、提交、推送和 PR

---

### Task 1: 新建实现分支并确认基线

**Files:**
- No file changes.

- [ ] **Step 1: 切到设计基线并创建分支**

Run:

```bash
cd /Users/su/codeHub/github/agent-skills
git status --short --branch
git checkout docs/figma-workflow-suite-design
git pull --ff-only
git checkout -b codex/p16-figma-workflow-v4-orchestration
```

Expected:

- branch is `codex/p16-figma-workflow-v4-orchestration`
- working tree is clean

- [ ] **Step 2: 确认编排设计 spec 存在**

Run:

```bash
test -f docs/superpowers/specs/2026-05-21-figma-workflow-v4-orchestration-design.md
```

Expected: command exits 0.

---

### Task 2: 编写 v4 orchestration reference

**Files:**
- Create: `figma-workflow/references/v4-orchestration.md`

- [ ] **Step 1: 写标题和定位**

Create the file with:

```markdown
# v4 Orchestration

本文档定义 `figma-workflow` 如何编排 v4 工程化能力。v4 checkpoint 是强推荐检查点,不是 A-E 主链路阶段,不改变 Phase 完成条件,不授权 coding。
```

- [ ] **Step 2: 写 skill count model**

Add:

```markdown
## Skill Count Model

主链路保持 7 个 skill:

- `figma-workflow`
- `figma-clarify-requirement`
- `figma-ui-understand`
- `figma-api-first`
- `figma-ui-api-mapper`
- `figma-design-token`
- `figma-emit-spec`

v4 新增 3 个工程化 skill:

- P13 `figma-design-diff`
- P14 `figma-ui-handoff`
- P15 `figma-assets-validate`

P12 cache layer 是基础设施,不新增独立 skill。v4 全部落地后,figma-workflow-suite 相关 skill 总数为 10 个。
```

- [ ] **Step 3: 写 orchestration positions**

Add:

````markdown
## Orchestration Positions

v4 出现在两个位置:

1. **Mid-workflow prompt**:C-low 或 D 后,当设计改稿、cache snapshot、unknown/open questions 等风险出现时提示 P13/P14。
2. **Pre-handoff checkpoint**:Phase E review gate 通过后、handoff menu 之前,汇总 P13/P14/P15 状态。

顺序:

```text
A → B → C-up → C-low → D → E
→ Phase E review gate
→ v4 pre-handoff checkpoint
→ handoff menu
→ OpenSpec / planning / task breakdown
→ explicit coding confirmation
→ business code
```
````

- [ ] **Step 4: 写 recommendation levels 和 trigger rules**

Add:

```markdown
## Recommendation Levels

| Level | Meaning |
|---|---|
| `required_prompt` | `figma-workflow` 必须提示用户,但用户仍可 skip。 |
| `recommended` | 条件满足时展示为推荐项,用户可轻量 skip。 |
| `available` | 只作为可用工具展示,不打断流程。 |

## Trigger Rules

| Capability | Mid-workflow trigger | Pre-handoff trigger | Level |
|---|---|---|---|
| P13 `figma-design-diff` | `.figma-cache/snapshots/` 有 baseline/current;用户说设计改稿;refresh 后 evidence hash 变化 | snapshots 存在且 `design-diff.md` 缺失或 stale | `required_prompt` |
| P14 `figma-ui-handoff` | 存在 unknown/open questions;用户要给设计/产品反馈 | `ui-handoff.md` 缺失且存在 unknown/open questions 或 design diff | `recommended` |
| P15 `figma-assets-validate` | 用户明确询问资源或验证 | Phase E review gate 后始终出现 | `required_prompt` |
```

- [ ] **Step 5: 写 action/status/audit 规则**

Add:

````markdown
## Actions

| Action | Behavior |
|---|---|
| `run` | 调用对应 v4 skill,由该 skill 追加正常 audit。 |
| `view` | 展示已有产物路径或摘要,不重新生成。 |
| `skip` | 不生成产物,由 `figma-workflow` 追加 skip audit。 |
| `continue` | 所有 `required_prompt` 都 run/view/skip 后进入 handoff menu。 |

## Status Values

| Status | Meaning |
|---|---|
| `missing` | 产物不存在。 |
| `generated` | 产物存在。 |
| `stale` | 上游 evidence 比产物更新。 |
| `skipped` | 当前 checkpoint 已 skip 且已写 audit。 |
| `not_applicable` | 触发条件不满足。 |

## Skip Audit

Skip audit 写入 `docs/design/<feature>/inputs.md`:

```markdown
## <ISO8601> — figma-workflow@v4-checkpoint

- checkpoint: pre-handoff
- phase_context: after_phase_e_review
- action: skip
- skipped:
  - skill: figma-assets-validate
    product: assets-manifest.md, validation-report.md
    recommendation: required_prompt
    reason: pre-handoff validation recommended
    risk: assets and boundary checks not reviewed before handoff
- continue_to_handoff: true
```
````

- [ ] **Step 6: 写 boundary 和 handoff inputs**

Add:

```markdown
## Handoff Boundary

- `implementation-spec.md` 仍是 handoff 主输入。
- `open-questions.md` 是风险输入。
- `design-diff.md` 是改稿影响输入。
- `ui-handoff.md` 是设计/产品协作输入,不是 implementation spec。
- `assets-manifest.md` 和 `validation-report.md` 是 coding 前资源/验证输入。
- `handoff != coding`,`planning != coding`,`OpenSpec != coding`。
- 只有用户明确确认执行 coding 后,才能写业务代码。
```

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "v4 Orchestration|Skill Count Model|required_prompt|recommended|available|Mid-workflow|Pre-handoff|Skip Audit|handoff != coding|10 个" figma-workflow/references/v4-orchestration.md
```

Expected: all key phrases found.

---

### Task 3: TDD 实现 `figma-v4-checkpoint.js`

**Files:**
- Create: `figma-workflow/scripts/figma-v4-checkpoint.test.js`
- Create: `figma-workflow/scripts/figma-v4-checkpoint.js`

- [ ] **Step 1: 写 failing test**

Create `figma-workflow/scripts/figma-v4-checkpoint.test.js` with:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const checkpoint = require("./figma-v4-checkpoint.js");

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

test("infers required pre-handoff prompts from feature products", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "v4-checkpoint-"));
  write(path.join(featureDir, "implementation-spec.md"), "# Implementation Spec\n");
  write(path.join(featureDir, "open-questions.md"), "# Open Questions\n- [ ] confirm metric copy\n");
  write(path.join(featureDir, ".figma-cache/snapshots/baseline/metadata.file.1-2.json"), "{}\n");
  write(path.join(featureDir, ".figma-cache/snapshots/current/metadata.file.1-2.json"), "{}\n");

  const state = checkpoint.inferV4Checkpoint(featureDir, { checkpoint: "pre-handoff" });

  assert.equal(state.items.find((item) => item.skill === "figma-design-diff").status, "missing");
  assert.equal(state.items.find((item) => item.skill === "figma-design-diff").recommendation, "required_prompt");
  assert.equal(state.items.find((item) => item.skill === "figma-ui-handoff").recommendation, "recommended");
  assert.equal(state.items.find((item) => item.skill === "figma-assets-validate").recommendation, "required_prompt");
});

test("renders checkpoint and allows continue after required prompts are handled", () => {
  const state = {
    checkpoint: "pre-handoff",
    items: [
      {
        label: "Design diff",
        skill: "figma-design-diff",
        product: "design-diff.md",
        status: "generated",
        recommendation: "required_prompt",
        reason: "cache snapshots detected",
      },
      {
        label: "Assets / validation",
        skill: "figma-assets-validate",
        product: "assets-manifest.md, validation-report.md",
        status: "skipped",
        recommendation: "required_prompt",
        reason: "pre-handoff validation is recommended before planning",
      },
    ],
  };

  assert.equal(checkpoint.canContinueToHandoff(state), true);
  const rendered = checkpoint.renderV4Checkpoint(state);
  assert.match(rendered, /v4 pre-handoff checkpoint/);
  assert.match(rendered, /figma-design-diff/);
  assert.match(rendered, /\[C\] Continue to handoff menu/);
});

test("appends skip audit without changing products", () => {
  const featureDir = fs.mkdtempSync(path.join(os.tmpdir(), "v4-skip-audit-"));
  const item = {
    skill: "figma-assets-validate",
    product: "assets-manifest.md, validation-report.md",
    recommendation: "required_prompt",
    reason: "pre-handoff validation recommended",
    risk: "assets and boundary checks not reviewed before handoff",
  };

  checkpoint.appendSkipAudit(featureDir, {
    checkpoint: "pre-handoff",
    phaseContext: "after_phase_e_review",
    skipped: [item],
    continueField: "continue_to_handoff",
    now: "2026-05-21T12:00:00+08:00",
  });

  const audit = fs.readFileSync(path.join(featureDir, "inputs.md"), "utf8");
  assert.match(audit, /figma-workflow@v4-checkpoint/);
  assert.match(audit, /skill: figma-assets-validate/);
  assert.match(audit, /continue_to_handoff: true/);
  assert.equal(fs.existsSync(path.join(featureDir, "assets-manifest.md")), false);
});
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
node --test figma-workflow/scripts/figma-v4-checkpoint.test.js
```

Expected: FAIL with `Cannot find module './figma-v4-checkpoint.js'`.

- [ ] **Step 3: Implement helper**

Create `figma-workflow/scripts/figma-v4-checkpoint.js` with this complete implementation:

```js
const fs = require("node:fs");
const path = require("node:path");

function exists(filePath) {
  return fs.existsSync(filePath);
}

function hasSnapshots(featureDir) {
  const snapshotsDir = path.join(featureDir, ".figma-cache", "snapshots");
  if (!exists(snapshotsDir)) return false;
  const entries = fs.readdirSync(snapshotsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  return entries.length >= 2;
}

function readTextIfExists(filePath) {
  return exists(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function hasUnknownOrOpenQuestions(featureDir) {
  const candidates = [
    "component-mapping.md",
    "open-questions.md",
    "design-diff.md",
  ];
  return candidates.some((fileName) => {
    const text = readTextIfExists(path.join(featureDir, fileName));
    return /unknown|Open Questions|- \[ \]/i.test(text);
  });
}

function productStatus(featureDir, product) {
  const firstProduct = product.split(",")[0].trim();
  return exists(path.join(featureDir, firstProduct)) ? "generated" : "missing";
}

function inferV4Checkpoint(featureDir, options = {}) {
  const checkpoint = options.checkpoint || "pre-handoff";
  const snapshots = hasSnapshots(featureDir);
  const unknowns = hasUnknownOrOpenQuestions(featureDir);
  const items = [];

  items.push({
    label: "Design diff",
    skill: "figma-design-diff",
    product: "design-diff.md",
    status: snapshots ? productStatus(featureDir, "design-diff.md") : "not_applicable",
    recommendation: snapshots ? "required_prompt" : "available",
    reason: snapshots ? "cache snapshots detected" : "no baseline/current snapshots detected",
    risk: "design changes not reviewed before handoff",
  });

  items.push({
    label: "UI handoff",
    skill: "figma-ui-handoff",
    product: "ui-handoff.md",
    status: unknowns ? productStatus(featureDir, "ui-handoff.md") : "not_applicable",
    recommendation: unknowns ? "recommended" : "available",
    reason: unknowns ? "unknown or open questions detected" : "no unknown or open questions detected",
    risk: "design/product follow-up not captured",
  });

  items.push({
    label: "Assets / validation",
    skill: "figma-assets-validate",
    product: "assets-manifest.md, validation-report.md",
    status: checkpoint === "pre-handoff" ? productStatus(featureDir, "assets-manifest.md") : "not_applicable",
    recommendation: checkpoint === "pre-handoff" ? "required_prompt" : "available",
    reason: checkpoint === "pre-handoff"
      ? "pre-handoff validation is recommended before planning"
      : "available when the user asks about assets or validation",
    risk: "assets and boundary checks not reviewed before handoff",
  });

  return { checkpoint, featureDir, items };
}

function isHandled(item) {
  return item.recommendation !== "required_prompt" || ["generated", "skipped", "not_applicable"].includes(item.status);
}

function canContinueToHandoff(state) {
  return state.items.every(isHandled);
}

function renderV4Checkpoint(state) {
  const title = state.checkpoint === "pre-handoff"
    ? "v4 pre-handoff checkpoint:"
    : "v4 mid-workflow checkpoint:";
  const lines = [title, ""];

  for (const item of state.items) {
    lines.push(`[${item.skill}] ${item.label}`);
    lines.push(`  status: ${item.status}`);
    lines.push(`  recommendation: ${item.recommendation}`);
    lines.push(`  reason: ${item.reason}`);
    lines.push("  actions: [R] run  [V] view  [S] skip");
    lines.push("");
  }

  if (canContinueToHandoff(state)) {
    lines.push("[C] Continue to handoff menu");
  } else {
    lines.push("Handle required prompts before continuing to handoff.");
  }

  return lines.join("\n");
}

function appendSkipAudit(featureDir, options) {
  const now = options.now || new Date().toISOString();
  const continueField = options.continueField || "continue_to_handoff";
  const lines = [
    "",
    `## ${now} — figma-workflow@v4-checkpoint`,
    "",
    `- checkpoint: ${options.checkpoint}`,
    `- phase_context: ${options.phaseContext}`,
    "- action: skip",
    "- skipped:",
  ];

  for (const item of options.skipped) {
    lines.push(`  - skill: ${item.skill}`);
    lines.push(`    product: ${item.product}`);
    lines.push(`    recommendation: ${item.recommendation}`);
    lines.push(`    reason: ${item.reason}`);
    lines.push(`    risk: ${item.risk}`);
  }

  lines.push(`- ${continueField}: true`);
  lines.push("");

  const inputsPath = path.join(featureDir, "inputs.md");
  fs.mkdirSync(featureDir, { recursive: true });
  fs.appendFileSync(inputsPath, lines.join("\n"));
}

function runCli(argv) {
  const [command, featureDir] = argv;
  if (command !== "summary" || !featureDir) {
    process.stderr.write("Usage: node figma-workflow/scripts/figma-v4-checkpoint.js summary <featureDir>\n");
    return 1;
  }

  process.stdout.write(`${renderV4Checkpoint(inferV4Checkpoint(featureDir))}\n`);
  return 0;
}

module.exports = {
  appendSkipAudit,
  canContinueToHandoff,
  inferV4Checkpoint,
  renderV4Checkpoint,
};

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}
```

- [ ] **Step 4: Run test to verify GREEN**

Run:

```bash
node --test figma-workflow/scripts/figma-v4-checkpoint.test.js
```

Expected: 3 tests pass, 0 failures.

- [ ] **Step 5: Run CLI smoke test**

Run:

```bash
node figma-workflow/scripts/figma-v4-checkpoint.js summary docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
```

Expected: command exits 0 and prints `v4 pre-handoff checkpoint:`.

---

### Task 4: 新增 v4 checkpoint fixtures

**Files:**
- Create: `figma-workflow/tests/fixtures/v4-checkpoint/README.md`
- Create: `figma-workflow/tests/fixtures/v4-checkpoint/pre-handoff.expected.md`
- Create: `figma-workflow/tests/fixtures/v4-checkpoint/mid-workflow.expected.md`

- [ ] **Step 1: 写 fixture README**

Create `figma-workflow/tests/fixtures/v4-checkpoint/README.md`:

```markdown
# Fixture: v4-checkpoint

用于人工 review `figma-workflow` 的 v4 工程化检查点编排。

## 覆盖场景

- `pre-handoff.expected.md`:Phase E review gate 通过后,展示 P13/P14/P15 状态和 handoff 前风险。
- `mid-workflow.expected.md`:C-low 或 D 后,当设计改稿或 unknown/open questions 出现时,展示 P13/P14 中途提醒。

## 验证重点

- v4 checkpoint 不混入 A-E Progress。
- P15 在 pre-handoff 总是 `required_prompt`。
- `skip` 是显式动作,并要求写入 `inputs.md` audit。
- `continue` 不代表风险已解决,只代表强推荐项已处理或跳过。
```

- [ ] **Step 2: 写 pre-handoff expected fixture**

Create `figma-workflow/tests/fixtures/v4-checkpoint/pre-handoff.expected.md`:

````markdown
# Expected v4 Checkpoint — pre-handoff

```text
v4 pre-handoff checkpoint:

[figma-design-diff] Design diff
  status: missing
  recommendation: required_prompt
  reason: cache snapshots detected
  actions: [R] run  [V] view  [S] skip

[figma-ui-handoff] UI handoff
  status: missing
  recommendation: recommended
  reason: unknown or open questions detected
  actions: [R] run  [V] view  [S] skip

[figma-assets-validate] Assets / validation
  status: missing
  recommendation: required_prompt
  reason: pre-handoff validation is recommended before planning
  actions: [R] run  [V] view  [S] skip

Handle required prompts before continuing to handoff.
```

## Expected behavior

- User can run, view, or skip P13/P14/P15.
- Required prompts must be handled before handoff menu appears.
- Skip writes `figma-workflow@v4-checkpoint` audit to `inputs.md`.
- No business code is written.
````

- [ ] **Step 3: 写 mid-workflow expected fixture**

Create `figma-workflow/tests/fixtures/v4-checkpoint/mid-workflow.expected.md`:

````markdown
# Expected v4 Checkpoint — mid-workflow

```text
v4 mid-workflow checkpoint:

[figma-design-diff] Design diff
  status: missing
  recommendation: required_prompt
  reason: cache snapshots detected
  actions: [R] run  [V] view  [S] skip

[figma-ui-handoff] UI handoff
  status: missing
  recommendation: recommended
  reason: unknown or open questions detected
  actions: [R] run  [V] view  [S] skip
```

## Expected behavior

- Mid-workflow prompt is advisory and does not replace current next phase.
- Skip writes `checkpoint: mid-workflow` audit if user chooses skip.
- User can continue A-E flow after run/view/skip.
````

- [ ] **Step 4: Verify fixture content**

Run:

```bash
rg -n "v4 checkpoint|pre-handoff|mid-workflow|required_prompt|figma-assets-validate|inputs.md|No business code|checkpoint: mid-workflow" figma-workflow/tests/fixtures/v4-checkpoint
```

Expected: key phrases found.

---

### Task 5: 更新 `figma-workflow` 主说明和 progress routing

**Files:**
- Modify: `figma-workflow/SKILL.md`
- Modify: `figma-workflow/references/progress-routing.md`

- [ ] **Step 1: 在 SKILL.md Position 后补 v4 编排说明**

In `figma-workflow/SKILL.md`, after the cache layer paragraph, add:

```markdown
v4 engineering checkpoints are strongly recommended orchestration points, not new A-E phases. P13/P14 can appear as mid-workflow prompts when design change or upstream quality risks are visible. After Phase E review gate, `figma-workflow` must show the v4 pre-handoff checkpoint before the handoff menu. Required prompts can be skipped, but skip decisions must be audited in `inputs.md`.
```

- [ ] **Step 2: 在产物布局中加入 v4 产物**

Ensure the product layout includes:

```text
├── design-diff.md
├── ui-handoff.md
├── assets-manifest.md
├── validation-report.md
```

Expected: `implementation-spec.md` and `open-questions.md` remain the core Phase E products.

- [ ] **Step 3: 在工作流步骤中插入 pre-handoff checkpoint**

Replace current step 7 in `figma-workflow/SKILL.md` with:

```markdown
7. **phase E 后进入 v4 pre-handoff checkpoint**
   - 只有用户在 phase E review gate 选择继续时才出现
   - 汇总 P13 `design-diff.md`、P14 `ui-handoff.md`、P15 `assets-manifest.md` / `validation-report.md`
   - P15 永远作为 handoff 前 `required_prompt`
   - 用户可以 run / view / skip
   - skip 必须写入 `inputs.md` audit

8. **v4 checkpoint 处理后进入 handoff 出口**
   - 所有 `required_prompt` 都 run/view/skip 后才显示
   - 让用户选择 builtin / superpowers / manual / pause
```

- [ ] **Step 4: 在不要做的事中补边界**

Ensure `figma-workflow/SKILL.md` contains:

```markdown
- ❌ 不把 v4 checkpoint 当作 A-E 完成条件
- ❌ 不因为 v4 skip 就认为风险已解决
- ❌ 不在 handoff 前静默跳过 P15 提示
```

- [ ] **Step 5: 在 progress-routing 中新增 v4 orchestration section**

Add after `Design diff` section:

````markdown
## v4 engineering checkpoints

v4 checkpoint 不混入 A-E `Progress:` 表格。它们显示在独立区域:

```text
v4 pre-handoff checkpoint:
  [P13] design-diff.md
  [P14] ui-handoff.md
  [P15] assets-manifest.md / validation-report.md
```

推荐等级:

| Level | Meaning |
|---|---|
| `required_prompt` | 必须提示,用户可 skip。 |
| `recommended` | 条件满足时推荐,用户可 skip。 |
| `available` | 可用但不主动打断。 |

P15 `figma-assets-validate` 在 Phase E review gate 之后始终是 `required_prompt`。
```
````

- [ ] **Step 6: 在 Phase E handoff 前补 summary 规则**

In `progress-routing.md`, before `## Phase E handoff`, add:

````markdown
## Pre-handoff summary

进入 handoff menu 前先展示:

```text
Core products:
  [✓] implementation-spec.md
  [✓] open-questions.md

v4 checkpoint:
  [✓] design-diff.md
  [S] ui-handoff.md skipped
  [✓] assets-manifest.md
  [✓] validation-report.md

Risk notes:
  - ui-handoff.md skipped: design/product follow-up not captured
```

summary 不落新文件。它只帮助用户在 handoff 前看到 v4 检查结果和 skip 风险。
````

- [ ] **Step 7: Verify**

Run:

```bash
rg -n "v4 engineering checkpoints|pre-handoff checkpoint|required_prompt|figma-assets-validate|inputs.md audit|不把 v4 checkpoint|Pre-handoff summary|Risk notes" figma-workflow/SKILL.md figma-workflow/references/progress-routing.md
```

Expected: all key phrases found.

---

### Task 6: 更新 v4 suite spec 索引

**Files:**
- Modify: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

- [ ] **Step 1: 在 Orchestrator Impact 中加入编排 spec 链接**

Add near `## Orchestrator Impact`:

```markdown
详细编排设计见 `docs/superpowers/specs/2026-05-21-figma-workflow-v4-orchestration-design.md`。
```

- [ ] **Step 2: 在 Roadmap 中加入 P16**

Add:

```markdown
- P16: v4 orchestration checkpoint spec / implementation。
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "figma-workflow-v4-orchestration-design|P16|v4 orchestration checkpoint" docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 7: 验证、提交、推送和 PR

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run full verification**

Run:

```bash
node --test figma-workflow/scripts/figma-v4-checkpoint.test.js
node figma-workflow/scripts/figma-v4-checkpoint.js summary docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
rg -n "v4 Orchestration|required_prompt|pre-handoff|mid-workflow|figma-assets-validate|skip audit|handoff != coding|business code" \
  figma-workflow/references/v4-orchestration.md \
  docs/superpowers/specs/2026-05-21-figma-workflow-v4-orchestration-design.md \
  docs/superpowers/plans/2026-05-21-figma-workflow-v4-orchestration.md
git diff --check
```

Expected:

- Node tests pass with 0 failures.
- CLI prints `v4 pre-handoff checkpoint:`.
- `rg` finds all v4 boundary phrases.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Review changed files**

Run:

```bash
git status --short
git diff --stat
```

Expected changed files:

```text
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
figma-workflow/SKILL.md
figma-workflow/references/progress-routing.md
figma-workflow/references/v4-orchestration.md
figma-workflow/scripts/figma-v4-checkpoint.js
figma-workflow/scripts/figma-v4-checkpoint.test.js
figma-workflow/tests/fixtures/v4-checkpoint/README.md
figma-workflow/tests/fixtures/v4-checkpoint/pre-handoff.expected.md
figma-workflow/tests/fixtures/v4-checkpoint/mid-workflow.expected.md
```

- [ ] **Step 3: Stage files**

Run:

```bash
git add docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md \
        figma-workflow/SKILL.md \
        figma-workflow/references/progress-routing.md \
        figma-workflow/references/v4-orchestration.md \
        figma-workflow/scripts/figma-v4-checkpoint.js \
        figma-workflow/scripts/figma-v4-checkpoint.test.js \
        figma-workflow/tests/fixtures/v4-checkpoint/README.md \
        figma-workflow/tests/fixtures/v4-checkpoint/pre-handoff.expected.md \
        figma-workflow/tests/fixtures/v4-checkpoint/mid-workflow.expected.md
```

- [ ] **Step 4: Validate staged diff**

Run:

```bash
git diff --cached --check
git diff --cached --stat
```

Expected: no whitespace errors; staged diff contains only P16 orchestration files.

- [ ] **Step 5: Commit**

Run:

```bash
git commit -m "feat: add figma workflow v4 orchestration checkpoint"
```

Expected: commit succeeds.

- [ ] **Step 6: Push and create PR**

Run:

```bash
git push -u origin codex/p16-figma-workflow-v4-orchestration
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p16-figma-workflow-v4-orchestration \
  --title "feat: add figma workflow v4 orchestration checkpoint" \
  --body "Implements the v4 orchestration checkpoint contract for figma-workflow, including checkpoint inference, skip audit support, fixtures, and docs."
```

Expected: PR targets `docs/figma-workflow-suite-design`.

---

## Self-Review Checklist

- Plan implements the approved v4 orchestration design.
- P12 remains infrastructure, not a standalone skill.
- v4 checkpoints do not become A-E phases.
- P15 is always `required_prompt` before handoff.
- Skip audit is written by `figma-workflow`, not by skipped skills.
- Skip does not mean risk is resolved.
- Handoff remains separate from coding.
- No task writes business code.
- Tests use Node built-ins only and match existing script style.
