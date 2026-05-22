---
name: figma-design-diff
description: figma-workflow-suite 的工程化组件。基于 `.figma-cache/` 的 before / after snapshots 生成 design-diff.md,提示 Figma 改稿影响和建议重跑阶段。
---

# Figma Design Diff

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的工程化能力,通常在 cache layer 已生成 before / after snapshots 后使用。

它产出 `docs/design/<feature>/design-diff.md`。
它不产出或修改 Phase A-E 的核心产物。

## Prerequisites

- `feature=<feature-name>`
- `fileKey=<file-key>`
- `nodeId=<node-id>`
- `docs/design/<feature>/.figma-cache/` 存在
- 同一 file key + node id 至少有 baseline 和 current evidence

## Calling convention

```text
figma-design-diff feature=<feature-name> fileKey=<file-key> nodeId=<node-id>
```

可选参数:

- `baseline=<snapshot-id>`
- `current=<snapshot-id>`

## 适用场景

- Figma node 已重新读取,需要知道改稿影响了哪些设计实现材料。
- Phase E 之后发现设计有变化,需要判断是否重跑 B/C2/D/E。
- 用户希望在进入 coding 前审阅改稿差量。

## 目标

本 skill 只做结构化 diff:

- 输出 `docs/design/<feature>/design-diff.md`
- 在 `docs/design/<feature>/inputs.md` 追加一条 audit 记录
- 当前实现只比较同一 file key + 同一 node id
- 输出 added / removed / changed nodes
- 输出 text / layout / token / asset signals
- 输出 recommended rerun phases

**不**承担:

- 不做跨 node diff
- 不做像素级 screenshot diff
- 不修改 A/B/C/D/E 产物
- 不自动重跑任何 phase
- 不修改 Figma 文件
- 不写业务代码
- 不下载真实图片资源

## 工作流

1. Parse `feature=<feature-name>`, `fileKey=<file-key>`, `nodeId=<node-id>`.
2. Ensure `docs/design/<feature>/.figma-cache/` exists; if missing, stop and recommend cache refresh.
3. Resolve baseline and current snapshots.
4. Reject if baseline/current file key or node id differ.
5. Compare metadata trees for added / removed / changed nodes.
6. Compare text fields and design context summaries.
7. Compare bounds, layout summaries and token summaries.
8. Classify severity.
9. Generate recommended rerun phases.
10. Write `design-diff.md`.
11. Append `inputs.md` audit record.
12. Print self-check for orchestrator review.

## 输出结构

`docs/design/<feature>/design-diff.md` 必须按 [references/design-diff-template.md](references/design-diff-template.md) 生成。

至少包含:

- `Summary`
- `Compared Snapshots`
- `Changed Nodes`
- `Added Nodes`
- `Removed Nodes`
- `Text Changes`
- `Layout Changes`
- `Visual Token Signals`
- `Asset Signals`
- `Recommended Rerun Phases`
- `Open Questions`

## 推荐重跑规则

| Change | Recommended Phase |
|---|---|
| 新增/删除业务模块或重复项 | Phase B + C2 + D + E |
| 文案变化但结构未变 | Phase B review + E |
| UI/API 绑定候选变化 | C2 + E |
| 颜色、字号、圆角、间距变化 | D + E |
| 资源引用变化 | D review + assets validation |
| 只有 screenshot metadata 变化 | Manual review |
| raw hash changed 但无法归类 | Manual review,必要时重跑 B/D |

## inputs.md 记录格式

追加记录建议使用:

```markdown
## <ISO8601> — figma-design-diff@0.1.0

- source_type: figma_cache_snapshot
- feature: <feature>
- figma_file_key: <fileKey>
- figma_node_id: <nodeId>
- baseline: <snapshot-id>
- current: <snapshot-id>
- output: design-diff.md
- recommended_rerun: <B|C2|D|E|manual>
```

## Self-Check

| Check | Warning |
|---|---|
| baseline/current missing | "缺少 before/after snapshot,只能记录 baseline,不能生成有效 diff" |
| file key or node id mismatch | "当前实现只支持同一 file/node diff" |
| only unknown changes | "存在无法归类变化,建议人工 review" |
| recommended rerun phases empty but changes exist | "变化存在但没有重跑建议,需要人工补充" |

## 不要做的事

- 不修改 Phase A-E 的 `.md` 产物
- 不把 `design-diff.md` 当作 review gate 替代品
- 不自动调用 `figma-ui-understand` / `figma-ui-api-mapper` / `figma-design-token` / `figma-emit-spec`
- 不写业务代码

## 参考

- Cache layer:[../figma-workflow/references/cache-layer.md](../figma-workflow/references/cache-layer.md)
