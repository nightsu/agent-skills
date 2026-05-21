# Suite Fixture: sales-workbench

这是 `figma-workflow-suite` 的 suite 级 fixture,用于验证 P9 的路由与 handoff 边界语义。

## 主题

后台销售工作台。

## 验证目标

- Phase A 优先路由到 `figma-clarify-requirement`,不可用时 fallback 到模板。
- Phase B 优先路由到 `figma-ui-understand`,不可用时 fallback 到模板。
- Phase C1 在 v2 仍手填 `api-mapping.md`,未来再由 `figma-api-first` 替代。
- Phase E 只产出 `implementation-spec.md` / `open-questions.md` 并展示 handoff 菜单。
- handoff 后可进入 OpenSpec / planning / task breakdown 等准备阶段。
- 业务代码只能在用户明确确认执行 coding 后开始。

## 关联 fixture

本目录复用 P7 / P8 的 sales-workbench fixture 语义:

- `figma-clarify-requirement/tests/fixtures/sales-workbench/`
- `figma-ui-understand/tests/fixtures/sales-workbench/`

## 本目录文件

- `flow-map.md` — sales-workbench 在 A/B/C1/C2/D/E 的 suite 级流转图。
- `handoff-apply-boundary.expected.md` — Phase E handoff 与 coding 边界期望。

## 约束

本 fixture 不执行 Figma MCP,不生成 OpenSpec proposal,不写业务代码。它只用于人工 review 文档契约是否表达清楚。
