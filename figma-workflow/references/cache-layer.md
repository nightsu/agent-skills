# Figma Cache Layer

本文档定义 figma-workflow-suite 的 feature 级 `.figma-cache/` 约定。cache 只保存 Figma MCP evidence,不替代任何 Phase A-E 的 `.md` 产物,也不让 skill 跳过 review gate。

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

## Cache Status

| State | Behavior |
|---|---|
| `fresh` | 默认复用 cache |
| `stale` | 提示重新读取 Figma MCP |
| `invalid` | 忽略 cache,调用 Figma MCP 并重写 entry |

## Fallback Rules

- cache miss 时,phase skill 可以调用 Figma MCP 并写入新的 cache entry。
- `stale` entry 不应静默复用,需要提示用户重新读取或确认继续。
- `invalid` entry 必须被忽略,不能把损坏或缺失的 evidence 写入下游 `.md`。
- raw Figma JSON 只能留在 `.figma-cache/` 内;`ui-understanding.md`、`component-mapping.md`、`design-token-patch.md` 和 `implementation-spec.md` 只写归纳后的事实。
- cache 命中只减少重复读取,不代表 phase 完成,也不能跳过 review gate。

## Phase Integration

- Phase B `figma-ui-understand`:首次读取 Figma MCP 后可创建 cache;fresh cache 可作为生成 `ui-understanding.md` 的 evidence。
- Phase C-low `figma-ui-api-mapper`:优先读取 fresh cache,miss 或 invalid 时 fallback 到 Figma MCP。
- Phase D `figma-design-token`:优先读取 fresh cache 抽取 token;cache 不足时 fallback 到 Figma MCP。
- `figma-workflow`:只展示 cache summary 和 refresh 提示,不把 cache 状态当成阶段完成条件。
