# Flow Map — sales-workbench

## 阶段映射

| Phase | Producer | Product | P9 behavior |
|---|---|---|---|
| A | figma-clarify-requirement | clarified-requirement.md | skill route preferred; template fallback |
| B | figma-ui-understand | ui-understanding.md | skill route preferred; template fallback |
| C-up | manual api-mapping template | api-mapping.md | still manual in v2; future figma-api-first |
| C-low | figma-ui-api-mapper | component-mapping.md | unchanged |
| D | figma-design-token | design-token-patch.md | unchanged |
| E | figma-emit-spec | implementation-spec.md + open-questions.md | handoff menu appears after review gate Proceed |

## 边界说明

sales-workbench 用于验证 P9 的编排语义,不是业务实现 fixture。

- A/B 已从纯手填升级为 skill route preferred。
- C-up 仍由用户基于 `api-mapping.md` 模板手填。
- `figma-api-first` 属于未来 Phase C-up 能力,不在 P9 实现。
- E 完成后先展示 Phase E review gate,用户选择 Proceed 后才进入 handoff。
- handoff 进入 OpenSpec / planning / task breakdown 等准备阶段,不是默认 coding。
- 业务代码只能在用户明确确认执行 coding 后开始。
