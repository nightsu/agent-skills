# Flow Map — sales-workbench

## 阶段映射

| Phase | Producer | Product | P10 behavior |
|---|---|---|---|
| A | figma-clarify-requirement | clarified-requirement.md | skill route preferred; template fallback |
| B | figma-ui-understand | ui-understanding.md | skill route preferred; template fallback |
| C1 | figma-api-first | api-mapping.md | skill route preferred; template fallback |
| C2 | figma-ui-api-mapper | component-mapping.md | unchanged |
| D | figma-design-token | design-token-patch.md | unchanged |
| E | figma-emit-spec | implementation-spec.md + open-questions.md | handoff menu appears after review gate Proceed |

## 边界说明

sales-workbench 用于验证 P10 的编排语义,不是业务实现 fixture。

- A/B 已从纯手填升级为 skill route preferred。
- C1 已从纯手填升级为 `figma-api-first` skill route preferred。
- P10 替代 v2 manual C1,但仍保留 `api-mapping.md` template fallback。
- `figma-api-first` 第一版使用用户粘贴的接口结构,不做 YApi / Swagger / OpenAPI 平台抓取。
- E 完成后先展示 Phase E review gate,用户选择 Proceed 后才进入 handoff。
- handoff 进入 OpenSpec / planning / task breakdown 等准备阶段,不是默认 coding。
- 业务代码只能在用户明确确认执行 coding 后开始。
