# Fixture: progress-states

用于人工 review `figma-workflow` 的进度面板与下一步推断。

## 覆盖场景

- `empty-feature.expected.md`:新 feature 目录刚创建,所有产物缺失,下一步应提示 phase A 手填模板。
- `ready-for-d.expected.md`:A / B / C1 / C2 已完成,下一步应运行 `figma-design-token`。

## 验证重点

- 面板包含 `Feature:` / `Dir:` / `Progress:` / `Next step:`
- 只标一个 `← next`
- 手填阶段和 skill 阶段显示不同来源说明
- 不自动连跑多个阶段
