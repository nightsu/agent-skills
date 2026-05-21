# sales-workbench fixture

本 fixture 主题是“后台销售工作台”,来源于真实 MVP smoke test,并复用 P7 的 sales-workbench 需求澄清产物。

它用于验证 `figma-ui-understand` 在 phase B 是否能稳定产出 `ui-understanding.md`:

- 从 Figma 观察中整理 Page Structure
- 识别 Suspected Components
- 识别 Repeated Patterns
- 区分 Static / Dynamic UI Guess
- 保留 Open Questions
- 不做 API 字段绑定
- 不实现业务代码

## 文件

- `inputs/clarified-requirement.md` — phase A 输入事实
- `inputs/figma-node-summary.md` — 模拟 Figma MCP 观察摘要,不是 raw JSON
- `expected/ui-understanding.md` — 期望产物形态
