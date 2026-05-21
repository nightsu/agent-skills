# sales-workbench fixture

本 fixture 主题是“后台销售工作台”,来源于一次真实 MVP smoke test。

它的目的不是沉淀销售工作台业务模板,而是验证 `figma-clarify-requirement` 在真实需求输入下是否能稳定产出 phase A 的 `clarified-requirement.md`:

- 输出结构包含 Goal / Scope / Out of Scope / User States / Interaction / Constraints / Open Questions
- 本期范围与明确不做的内容可以被区分
- 非阻塞问题会保留在 `Open Questions`,并支持 `[deferred]`
- Phase A 不调用 Figma MCP,不做 API 字段映射,不实现业务代码

## 文件

- `inputs/user-request.md` — 模拟用户输入
- `expected/clarified-requirement.md` — 期望产物形态
