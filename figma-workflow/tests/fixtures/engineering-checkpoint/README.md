# Fixture: engineering-checkpoint

用于人工 review `figma-workflow` 的工程化检查点编排。

## 覆盖场景

- `pre-handoff.expected.md`:Phase E review gate 通过后,展示 `figma-design-diff` / `figma-ui-handoff` / `figma-assets-validate` 状态和 handoff 前风险。
- `mid-workflow.expected.md`:C2 或 D 后,当设计改稿或 unknown/open questions 出现时,展示中途工程化提醒。

## 验证重点

- 工程化检查点不混入 A-E Progress。
- `figma-assets-validate` 在 pre-handoff 总是 `required_prompt`。
- `skip` 是显式动作,并要求写入 `inputs.md` audit。
- `continue` 不代表风险已解决,只代表强推荐项已处理或跳过。
