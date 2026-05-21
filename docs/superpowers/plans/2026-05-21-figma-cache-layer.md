# Plan P12: Figma Cache Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 figma-workflow-suite 增加 feature 级 `.figma-cache/` 缓存层,让 Phase B / C2 / D 可以复用 Figma MCP 读取证据,并为 P13 design diff 提供基线。

**Architecture:** 新增共享 cache reference 和最小脚本,把 manifest schema、path 规则、cache hit/miss 行为沉到 `figma-workflow/references/` 与 `scripts/` 中。各 phase skill 先只更新文档契约和 fixture,实现时通过同一 cache helper 读写 `.figma-cache/`,避免每个 skill 自行拼路径。

**Tech Stack:** Markdown、JSON、Node.js 脚本、现有 figma-workflow-suite skill 文档和 fixture。

---

## Spec Source

- `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`
- `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`
- `figma-workflow/references/progress-routing.md`
- `figma-ui-api-mapper/SKILL.md`
- `figma-design-token/SKILL.md`
- `figma-ui-understand/SKILL.md`

## File Structure

```text
figma-workflow/
├── references/
│   ├── cache-layer.md
│   └── progress-routing.md
└── scripts/
    └── figma-cache.js

figma-ui-understand/
├── SKILL.md
└── tests/fixtures/sales-workbench/expected/.figma-cache/

figma-ui-api-mapper/
├── SKILL.md
└── tests/fixtures/sales-workbench/expected/.figma-cache/

figma-design-token/
├── SKILL.md
└── tests/fixtures/sales-workbench/expected/.figma-cache/

docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/
└── .figma-cache/
```

Project-level docs:

```text
README.md
AGENTS.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

## Responsibilities

| File | Responsibility |
|---|---|
| `figma-workflow/references/cache-layer.md` | cache schema、path 规则、status 语义、phase integration 的共享说明 |
| `figma-workflow/scripts/figma-cache.js` | 最小 cache helper: path resolve、manifest read/write、entry validation、summary 输出 |
| `figma-workflow/references/progress-routing.md` | orchestrator 如何展示 cache summary 和 refresh action |
| `figma-ui-understand/SKILL.md` | Phase B 说明如何写入/复用 cache |
| `figma-ui-api-mapper/SKILL.md` | Phase C2 说明如何优先读取 cache |
| `figma-design-token/SKILL.md` | Phase D 说明如何优先读取 cache |
| fixture `.figma-cache/` | sales-workbench 示例 manifest 和 cache entry |
| `README.md` / `AGENTS.md` | 仓库级技能清单补充 cache layer 能力说明 |

## Task List

- [ ] **Task 1:** 新建实现分支并确认基线
- [ ] **Task 2:** 编写 cache layer reference
- [ ] **Task 3:** 实现最小 `figma-cache.js` helper
- [ ] **Task 4:** 更新 `figma-workflow` cache 路由说明
- [ ] **Task 5:** 更新 Phase B / C2 / D skill 契约
- [ ] **Task 6:** 新增 sales-workbench cache fixture
- [ ] **Task 7:** 更新项目级说明
- [ ] **Task 8:** 验证、提交、推送和 PR

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
git checkout -b codex/p12-figma-cache-layer
```

Expected:

- branch is `codex/p12-figma-cache-layer`
- working tree is clean

- [ ] **Step 2: 确认 P12 spec 存在**

Run:

```bash
test -f docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md
```

Expected: command exits 0.

---

### Task 2: 编写 cache layer reference

**Files:**
- Create: `figma-workflow/references/cache-layer.md`

- [ ] **Step 1: 写 reference 标题和定位**

Add:

```markdown
# Figma Cache Layer

本文档定义 figma-workflow-suite 的 feature 级 `.figma-cache/` 约定。cache 只保存 Figma MCP evidence,不替代任何 Phase A-E 的 `.md` 产物,也不让 skill 跳过 review gate。
```

- [ ] **Step 2: 写 file layout**

Include:

````markdown
## File Layout

```text
docs/design/<feature>/.figma-cache/
├── manifest.json
├── metadata.<file-key>.<node-id-safe>.json
├── design-context.<file-key>.<node-id-safe>.json
└── screenshots/
    └── screenshot.<file-key>.<node-id-safe>.json
```

`node-id-safe` 把 `:` 转成 `-`。
````

- [ ] **Step 3: 写 manifest schema**

Include the exact JSON schema example from `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`.

- [ ] **Step 4: 写 cache status 和 fallback**

Include:

```markdown
| State | Behavior |
|---|---|
| `fresh` | 默认复用 cache |
| `stale` | 提示重新读取 Figma MCP |
| `invalid` | 忽略 cache,调用 Figma MCP 并重写 entry |
```

- [ ] **Step 5: Verify**

Run:

```bash
rg -n "Figma Cache Layer|\\.figma-cache|manifest.json|metadata\\.|design-context\\.|screenshot\\.|fresh|stale|invalid|review gate" figma-workflow/references/cache-layer.md
```

Expected: all key phrases found.

---

### Task 3: 实现最小 `figma-cache.js` helper

**Files:**
- Create: `figma-workflow/scripts/figma-cache.js`

- [ ] **Step 1: 创建脚本目录**

Run:

```bash
mkdir -p figma-workflow/scripts
```

Expected: directory exists.

- [ ] **Step 2: 写 helper API**

Implement these exported functions:

```js
export function toSafeNodeId(nodeId) {
  return String(nodeId).replace(/:/g, "-");
}

export function getCacheDir(featureDir) {
  return path.join(featureDir, ".figma-cache");
}

export function getCachePaths(featureDir, fileKey, nodeId) {
  const nodeIdSafe = toSafeNodeId(nodeId);
  const cacheDir = getCacheDir(featureDir);
  return {
    cacheDir,
    screenshotsDir: path.join(cacheDir, "screenshots"),
    manifestPath: path.join(cacheDir, "manifest.json"),
    metadataPath: path.join(cacheDir, `metadata.${fileKey}.${nodeIdSafe}.json`),
    designContextPath: path.join(cacheDir, `design-context.${fileKey}.${nodeIdSafe}.json`),
    screenshotMetaPath: path.join(cacheDir, "screenshots", `screenshot.${fileKey}.${nodeIdSafe}.json`)
  };
}
```

Also implement:

- `readManifest(featureDir)`
- `writeManifest(featureDir, manifest)`
- `validateEntry(featureDir, entry)`
- `summarizeCache(featureDir)`

Use Node.js built-in `fs`, `path`, and `crypto`; do not add dependencies.

- [ ] **Step 3: Add CLI summary mode**

Support:

```bash
node figma-workflow/scripts/figma-cache.js summary docs/design/sales-workbench
```

Expected output shape:

```text
Cache: docs/design/sales-workbench/.figma-cache/manifest.json
Entries: 1
- YclTRHKbwKZYdt8uY52fkw 122924:5188 fresh C2
```

- [ ] **Step 4: Add helper self-test fixture command**

Support:

```bash
node figma-workflow/scripts/figma-cache.js paths docs/design/sales-workbench YclTRHKbwKZYdt8uY52fkw 122924:5188
```

Expected output contains:

```text
metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json
design-context.YclTRHKbwKZYdt8uY52fkw.122924-5188.json
screenshots/screenshot.YclTRHKbwKZYdt8uY52fkw.122924-5188.json
```

- [ ] **Step 5: Verify**

Run:

```bash
node figma-workflow/scripts/figma-cache.js paths docs/design/sales-workbench YclTRHKbwKZYdt8uY52fkw 122924:5188
```

Expected: command exits 0 and prints safe paths.

---

### Task 4: 更新 `figma-workflow` cache 路由说明

**Files:**
- Modify: `figma-workflow/references/progress-routing.md`
- Modify: `figma-workflow/SKILL.md`

- [ ] **Step 1: 在 progress-routing 中新增 cache 状态行**

Add:

````markdown
## Cache summary

当 `docs/design/<feature>/.figma-cache/manifest.json` 存在时,进度面板展示:

```text
Cache:
  [✓] .figma-cache/manifest.json (1 node, fresh)
```

当 manifest 缺失时,展示:

```text
Cache:
  [ ] .figma-cache/manifest.json (not created)
```
````

- [ ] **Step 2: 在 Skill 主说明中加入 P12 边界**

Add:

```markdown
Cache layer is optional evidence infrastructure. It can refresh or summarize Figma MCP evidence, but it never marks a phase complete and never skips review gate.
```

- [ ] **Step 3: Verify**

Run:

```bash
rg -n "Cache summary|\\.figma-cache/manifest.json|not created|optional evidence|review gate" figma-workflow/references/progress-routing.md figma-workflow/SKILL.md
```

Expected: all key phrases found.

---

### Task 5: 更新 Phase B / C2 / D skill 契约

**Files:**
- Modify: `figma-ui-understand/SKILL.md`
- Modify: `figma-ui-api-mapper/SKILL.md`
- Modify: `figma-design-token/SKILL.md`

- [ ] **Step 1: Phase B 写入 cache 说明**

In `figma-ui-understand/SKILL.md`, add:

```markdown
## Cache Contract

如果 `docs/design/<feature>/.figma-cache/` 不存在,Phase B 可以在调用 Figma MCP 后创建 cache entry。若存在 fresh cache,优先读取 cache 生成 `ui-understanding.md`。无论 cache 是否命中,Phase B 仍必须输出 `ui-understanding.md` 并进入 review gate。
```

- [ ] **Step 2: C2 读取 cache 说明**

In `figma-ui-api-mapper/SKILL.md`, add:

```markdown
## Cache Contract

优先读取 fresh `.figma-cache/` evidence。cache miss 或 invalid 时,调用 Figma MCP 并更新 manifest。`component-mapping.md` 只能写归纳后的 UI/API 绑定事实,不得粘贴 raw Figma JSON。
```

- [ ] **Step 3: Phase D 读取 cache 说明**

In `figma-design-token/SKILL.md`, add:

```markdown
## Cache Contract

优先读取 fresh `.figma-cache/` evidence 抽取 token。cache 不足时可 fallback 到 Figma MCP。`design-token-patch.md` 只写 token patch,不写 raw Figma JSON。
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "Cache Contract|fresh `.figma-cache/`|raw Figma JSON|review gate|fallback 到 Figma MCP" figma-ui-understand/SKILL.md figma-ui-api-mapper/SKILL.md figma-design-token/SKILL.md
```

Expected: all key phrases found.

---

### Task 6: 新增 sales-workbench cache fixture

**Files:**
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/.figma-cache/manifest.json`
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/.figma-cache/metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json`
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/.figma-cache/design-context.YclTRHKbwKZYdt8uY52fkw.122924-5188.json`
- Create: `docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/.figma-cache/screenshots/screenshot.YclTRHKbwKZYdt8uY52fkw.122924-5188.json`

- [ ] **Step 1: 创建 fixture 目录**

Run:

```bash
mkdir -p docs/superpowers/fixtures/figma-workflow-suite/sales-workbench/.figma-cache/screenshots
```

Expected: directory exists.

- [ ] **Step 2: 写 manifest fixture**

Create a one-entry manifest for:

- `file_key`: `YclTRHKbwKZYdt8uY52fkw`
- `node_id`: `122924:5188`
- `node_id_safe`: `122924-5188`
- `captured_by_phase`: `C2`
- `status`: `fresh`

- [ ] **Step 3: 写 metadata fixture**

Include a small normalized tree:

```json
{
  "file_key": "YclTRHKbwKZYdt8uY52fkw",
  "node_id": "122924:5188",
  "node": {
    "id": "122924:5188",
    "name": "后台 销售工作台",
    "type": "FRAME",
    "children_summary": [
      {"name": "首触效率", "type": "SECTION"},
      {"name": "需求承接", "type": "SECTION"},
      {"name": "转化结果", "type": "SECTION"}
    ]
  }
}
```

- [ ] **Step 4: 写 design context fixture**

Include normalized modules matching the sales-workbench fixture:

```json
{
  "modules": [
    {"name": "首触效率", "api_section": "firstContactSection"},
    {"name": "需求承接", "api_section": "demandSection"},
    {"name": "转化结果", "api_section": "conversionSection"}
  ],
  "raw_response_stored": false
}
```

- [ ] **Step 5: 写 screenshot metadata fixture**

Include:

```json
{
  "file_key": "YclTRHKbwKZYdt8uY52fkw",
  "node_id": "122924:5188",
  "captured_at": "2026-05-21T10:05:00+08:00",
  "screenshot_url": "https://figma.example.invalid/screenshot.png",
  "original_width": 1440,
  "original_height": 900,
  "max_dimension": 2048,
  "downloaded_path": null
}
```

- [ ] **Step 6: Verify**

Run:

```bash
node figma-workflow/scripts/figma-cache.js summary docs/superpowers/fixtures/figma-workflow-suite/sales-workbench
```

Expected:

```text
Entries: 1
- YclTRHKbwKZYdt8uY52fkw 122924:5188 fresh C2
```

---

### Task 7: 更新项目级说明

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

- [ ] **Step 1: README 增加 P12 说明**

Add a short Chinese note:

```markdown
- P12 `figma cache layer`:在 `docs/design/<feature>/.figma-cache/` 缓存 Figma MCP evidence,供 C2/D 和后续 diff 复用。
```

- [ ] **Step 2: AGENTS 增加维护提示**

Add:

```markdown
- `.figma-cache/` 是 feature 级 Figma evidence 缓存,不属于用户手写产物;不要把 raw Figma JSON 复制进 Phase A-E 的 `.md` 输出。
```

- [ ] **Step 3: v4 spec 增加 P12 spec 链接**

In P12 section, add:

```markdown
详细设计见 `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`。
```

- [ ] **Step 4: Verify**

Run:

```bash
rg -n "figma cache layer|\\.figma-cache|Figma MCP evidence|raw Figma JSON|2026-05-21-figma-cache-layer" README.md AGENTS.md docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

Expected: all key phrases found.

---

### Task 8: 验证、提交、推送和 PR

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run documentation checks**

```bash
rg -n "P12|Figma Cache Layer|\\.figma-cache|manifest.json|metadata\\.|design-context\\.|screenshot\\.|fresh|stale|invalid|raw Figma JSON|业务代码" \
  docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md \
  docs/superpowers/plans/2026-05-21-figma-cache-layer.md

git diff --check
```

Expected:

- `rg` finds cache contract and boundary terms.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Confirm this PR is docs/spec only**

Run:

```bash
git diff --name-only docs/figma-workflow-suite-design...HEAD
```

Expected names for this spec/plan PR:

```text
docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md
docs/superpowers/plans/2026-05-21-figma-cache-layer.md
docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md \
        docs/superpowers/plans/2026-05-21-figma-cache-layer.md \
        docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md
git commit -m "docs: add figma cache layer plan"
```

- [ ] **Step 4: Push and PR**

```bash
git push -u origin codex/p12-figma-cache-layer-spec-plan
gh pr create \
  --base docs/figma-workflow-suite-design \
  --head codex/p12-figma-cache-layer-spec-plan \
  --title "docs: add figma cache layer plan" \
  --body "Adds P12 cache layer design spec and implementation plan."
```

Expected: PR targets `docs/figma-workflow-suite-design`.

---

## Self-Review Checklist

- P12 不实现 `design-diff.md`;P13 负责 diff。
- P12 不下载真实图片资源;P15 负责 assets。
- P12 cache 不写业务代码。
- `implementation-spec.md` 不消费 raw Figma JSON。
- 计划中实现文件和文档文件边界清晰。
- 第一版 cache 放在 `docs/design/<feature>/.figma-cache/`。
