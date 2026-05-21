# Sales Workbench Fixture

本 fixture 用于验证 `figma-api-first` 能把用户粘贴的 TypeScript response type 整理为 `api-mapping.md`。

## 主题

后台销售工作台。

## 输入来源

- 用户粘贴的 TypeScript response type:`inputs/api-response-type.ts`
- Phase A 最小需求产物:`inputs/clarified-requirement.md`
- Phase B 最小 UI 理解产物:`inputs/ui-understanding.md`

## 验证目标

- 嵌套指标字段应展开为完整 dotted API path。
- `MetricValue.percent` 应映射为 `number` + `percent` transform。
- `success=false` / `code!=0` 应进入 error 状态规则。
- 无 Figma MCP 调用。
- 不修改业务代码。
