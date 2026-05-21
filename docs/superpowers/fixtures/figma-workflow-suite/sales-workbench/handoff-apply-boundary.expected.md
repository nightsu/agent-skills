# Expected Handoff Apply Boundary — sales-workbench

本文档描述 sales-workbench 在 Phase E 完成后的 handoff 与 coding 边界期望。

## Phase E before handoff

Phase E before handoff: no business code.

`figma-emit-spec` 只产出:

- `docs/design/sales-workbench/implementation-spec.md`
- `docs/design/sales-workbench/open-questions.md`
- 可选 `docs/design/sales-workbench/task-breakdown.md`(仅 builtin handoff)

Phase E 不执行 Figma MCP,不生成 OpenSpec proposal,不修改业务代码。

## Review gate

Phase E review gate Proceed required。

只有用户在 Phase E review gate 选择 Proceed 后,才展示 handoff 菜单。

## Handoff options

```text
Handoff to planning / spec authoring:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans (detected — recommended)
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

## superpowers

`superpowers:writing-plans` recommended when available。

superpowers input: `implementation-spec.md` only。

`open-questions.md` 可以作为辅助审阅材料,但不应替代 `implementation-spec.md` 成为主输入。

## builtin

builtin output: `task-breakdown.md` only。

builtin 不写业务代码,只把 `implementation-spec.md` 拆成轻量任务清单。

## manual

manual may mention OpenSpec as external target, but no OpenSpec proposal is generated。

允许提示用户把 `implementation-spec.md` 带到 OpenSpec、Cursor、Codex 或用户自有流程。

## pause

pause exits for open questions / upstream edits。

用户回答 open questions 或编辑上游产物后,重新运行 `figma-workflow feature=sales-workbench`。

## Coding boundary

handoff 后可以进入 OpenSpec / planning / task breakdown 等准备阶段。业务代码只能在用户明确确认执行 coding 后开始。
