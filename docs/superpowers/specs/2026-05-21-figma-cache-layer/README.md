# Figma Cache Layer — Design Spec

> Date: 2026-05-21
> Status: Draft, awaiting user review
> Owner: @su
> Builds on: `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`

---

## TL;DR

P12 为 figma-workflow-suite 增加 feature 级 `.figma-cache/` 约定,缓存 Figma MCP 的读取证据,减少 C-low / D / 后续 diff 阶段重复读取同一 node。

第一版只做三件事:

```text
Figma MCP 读取结果
  → docs/design/<feature>/.figma-cache/manifest.json
  → metadata.<file-key>.<node-id>.json
  → design-context.<file-key>.<node-id>.json
```

截图第一版只缓存 screenshot metadata / URL / captured_at,不强制下载 png。png 下载和 assets manifest 放到 P15。

---

## Why P12

真实项目验证后,当前链路的主要摩擦已经从"缺阶段"转向"重复读取和证据漂移":

- `figma-ui-api-mapper` 和 `figma-design-token` 都可能读取同一个 Figma node。
- Figma 改稿后,用户很难判断当前 `.md` 产物对应哪一次读取。
- 后续 `design-diff.md` 需要稳定的 before / after 基线。
- `inputs.md` 适合记录 audit,不适合保存大体量 raw evidence。

P12 的目标是把 Figma evidence 从用户可编辑产物中分离出来,同时保持 Phase A-E 的文档边界不变。

---

## Scope

### In Scope

- 新增 feature 级缓存目录约定:`docs/design/<feature>/.figma-cache/`。
- 定义 `manifest.json` schema。
- 定义 `metadata.<file-key>.<node-id>.json` 和 `design-context.<file-key>.<node-id>.json` 的保存约定。
- 定义 screenshot metadata 的记录方式。
- 定义 cache hit / miss / stale 的判断规则。
- 定义 phase skill 如何优先读取 cache,并在缺失或 stale 时 fallback 到 Figma MCP。
- 在 `figma-workflow` 中展示 cache 状态,但不把 cache 命中作为跳过 review gate 的理由。

### Out of Scope

- 不下载或管理真实图片资源;png / svg / icon 下载放到 P15。
- 不生成 `design-diff.md`;diff 放到 P13。
- 不修改 Figma 文件。
- 不把 raw Figma JSON 写入 `implementation-spec.md`。
- 不把 cache 目录视为用户需要手工编辑的产物。
- 不写业务代码。
- 不自动重跑 A/B/C/D/E 阶段。

---

## File Layout

P12 默认使用 feature 级 cache:

```text
docs/design/<feature>/.figma-cache/
├── manifest.json
├── metadata.<file-key>.<node-id>.json
├── design-context.<file-key>.<node-id>.json
└── screenshots/
    └── screenshot.<file-key>.<node-id>.json
```

命名规则:

- `<file-key>` 使用 Figma file key 原文。
- `<node-id>` 将 `:` 转成 `-`,例如 `122924:5188` 保存为 `122924-5188`。
- 第一版不要求 cache 跨 feature 复用。
- 第一版不把 `.figma-cache/` 放到 repo 根目录,避免不同 feature 的 evidence 混在一起。

---

## Manifest Schema

`manifest.json` 记录 cache index,用于判断是否命中、是否过期、哪些 phase 可复用。

```json
{
  "version": "0.1.0",
  "feature": "sales-workbench",
  "created_at": "2026-05-21T10:00:00+08:00",
  "updated_at": "2026-05-21T10:05:00+08:00",
  "entries": [
    {
      "file_key": "YclTRHKbwKZYdt8uY52fkw",
      "node_id": "122924:5188",
      "node_id_safe": "122924-5188",
      "source_url": "https://www.figma.com/design/YclTRHKbwKZYdt8uY52fkw/...node-id=122924-5188",
      "metadata_path": "metadata.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
      "design_context_path": "design-context.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
      "screenshot_meta_path": "screenshots/screenshot.YclTRHKbwKZYdt8uY52fkw.122924-5188.json",
      "captured_at": "2026-05-21T10:05:00+08:00",
      "captured_by_phase": "C-low",
      "figma_mcp_tools": ["get_metadata", "get_design_context", "get_screenshot"],
      "content_hash": "sha256:<hash-of-normalized-cache-entry>",
      "status": "fresh"
    }
  ]
}
```

字段规则:

| Field | Meaning |
|---|---|
| `version` | cache schema 版本,第一版固定 `0.1.0` |
| `feature` | 对应 `docs/design/<feature>/` |
| `entries[]` | 一个 Figma file/node 对应一个 entry |
| `node_id_safe` | 文件名安全版本,只用于 path |
| `captured_by_phase` | 触发读取的 phase,例如 `B` / `C-low` / `D` |
| `figma_mcp_tools` | 本次缓存使用过的 Figma MCP tool 名称 |
| `content_hash` | 对 normalized metadata + design context + screenshot meta 计算的 hash |
| `status` | `fresh` / `stale` / `invalid` |

---

## Cache Entry Rules

### Metadata Cache

`metadata.<file-key>.<node-id-safe>.json` 保存 `get_metadata` 的结构化结果。

要求:

- 保留 node id、name、type、bounds、children summary。
- 可保存 raw MCP response,但必须只存在于 `.figma-cache/`。
- 不能复制到 `ui-understanding.md` / `component-mapping.md` / `implementation-spec.md`。

### Design Context Cache

`design-context.<file-key>.<node-id-safe>.json` 保存 `get_design_context` 的结构化结果。

要求:

- 保留 reference code、asset refs、variables summary。
- 如果原始 response 过大,允许只保存 normalized summary 和 raw response path。
- 下游 `.md` 产物只能引用归纳后的 UI/API/Token 事实,不能引用 raw JSON。

### Screenshot Metadata

`screenshots/screenshot.<file-key>.<node-id-safe>.json` 保存截图证据的 metadata。

```json
{
  "file_key": "YclTRHKbwKZYdt8uY52fkw",
  "node_id": "122924:5188",
  "captured_at": "2026-05-21T10:05:00+08:00",
  "screenshot_url": "https://...",
  "original_width": 1440,
  "original_height": 900,
  "max_dimension": 2048,
  "downloaded_path": null
}
```

第一版规则:

- `downloaded_path` 默认为 `null`。
- 如果人工或后续工具下载了 png,可填写相对路径。
- P12 不要求下载、压缩或提交真实图片。

---

## Cache Flow

```text
phase skill needs Figma evidence
  → resolve feature + file_key + node_id
  → read manifest.json
  → matching entry exists and status=fresh?
      yes → read cache files
      no  → call Figma MCP, write cache, update manifest
  → phase skill writes its normal .md artifact
  → inputs.md appends audit with cache_hit/cache_miss
```

缓存状态:

| State | Meaning | Behavior |
|---|---|---|
| `fresh` | file/node 匹配,hash 可读,entry 未被标记 stale | 默认复用 |
| `stale` | 用户明确要求重新读取,或后续 diff 标记 Figma 改稿 | 提示重新读取 |
| `invalid` | 文件缺失、JSON 解析失败、manifest entry 与文件不一致 | 忽略 cache 并 fallback 到 Figma MCP |

`inputs.md` audit 建议追加:

```markdown
- at: 2026-05-21T10:05:00+08:00
  phase: C-low
  skill: figma-ui-api-mapper
  figma_file_key: YclTRHKbwKZYdt8uY52fkw
  figma_node_id: 122924:5188
  cache: miss
  cache_manifest: .figma-cache/manifest.json
```

---

## Phase Integration

### Phase B: `figma-ui-understand`

- 可写入 metadata / design-context / screenshot metadata。
- 如果已有 fresh cache,可以优先读取 cache。
- 仍必须输出 `ui-understanding.md` 并进入 review gate。

### Phase C-low: `figma-ui-api-mapper`

- 优先读取 fresh cache,避免重复调用 Figma MCP。
- 只把已归纳 UI 事实写入 `component-mapping.md`。
- 不把 raw metadata 或 raw design context 粘进产物。

### Phase D: `figma-design-token`

- 优先读取 fresh cache。
- 从 cache 中抽取视觉 token 时,仍要输出 `design-token-patch.md`。
- 如果 token 证据不足,可 fallback 到 Figma MCP。

### Orchestrator: `figma-workflow`

进度面板可新增一行:

```text
Cache:
  [✓] .figma-cache/manifest.json (1 node, fresh)
```

菜单可新增:

```text
Cache actions:
  [C] Refresh Figma cache for current node
  [S] Show cache summary
```

限制:

- cache action 是辅助动作,不代表任何 phase 完成。
- cache 命中不跳过 review gate。
- cache stale 不自动覆盖既有 `.md` 产物。

---

## Compatibility

- 没有 `.figma-cache/` 时,现有 skill 继续直接调用 Figma MCP。
- 旧 feature 目录不需要迁移。
- cache 文件可以随 feature 分支提交,但不要求用户手写。
- 如果 cache 文件过大,后续可以补 `.gitignore` 或压缩策略;P12 第一版不提前引入 repo 级缓存服务。

---

## Validation

P12 实现完成后至少验证:

- fresh cache 命中时,C-low 或 D 不需要再次调用同一 Figma MCP evidence。
- cache miss 时,能调用 Figma MCP 并写入 manifest。
- manifest entry 文件缺失时,status 视为 invalid,并 fallback。
- `.md` 产物不包含 raw Figma JSON。
- `inputs.md` audit 能区分 cache hit / miss。
- 没有 `.figma-cache/` 的旧 fixture 仍可按原流程运行。

---

## Open Questions

- cache 文件是否默认提交到 git。建议第一版允许提交,因为它位于 feature 文档目录,便于 review。
- content hash 是否需要稳定跨 Node 版本。建议第一版只要求同一运行环境稳定,后续如需跨环境 diff 再规范 canonical JSON。
- orchestrator 是否在 P12 同步实现 cache actions。建议 P12 先提供 summary/refresh 最小入口,更复杂的 stale diff 交给 P13。
