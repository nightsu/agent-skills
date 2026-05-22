# sales-workbench fixture

验证 `figma-assets-validate` 能从销售工作台产物中整理资源引用并输出验证报告:

- `design-token-patch.md` 提供 icon / image 引用。
- `ui-handoff.md` 提供资源来源待确认项。
- `design-diff.md` 提供 asset_changed 信号。
- `implementation-spec.md` 提供 coding boundary 文案。

## Visual Baseline Fixture

The expected outputs model two baselines:

- `default`: required implementation visual baseline for the main dashboard node.
- `narrow`: optional responsive reference.

The fixture does not commit binary PNG files. It verifies the Markdown contract and expected metadata references that P15 must produce in a real workflow run.
