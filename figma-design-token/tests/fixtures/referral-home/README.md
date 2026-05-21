# Fixture: referral-home

回归 fixture,用于验证 `figma-design-token` 的等价行为。

**来源:** 对齐 spec §4b(`docs/superpowers/specs/2026-05-20-figma-workflow-suite/04b-design-token.md`)
中"产物格式"章节的 referral-home 示例。

## 用途

人工 review 验证。让 Agent 读 `inputs/` 下的 2 份模拟输入,产出 `design-token-patch.md`,
和 `expected/design-token-patch.md` 对比,确认**语义等价**:
- 同名 module、同名 token、Source 列归类正确
- 允许数值 ±5% 浮动(色值不允许)

## 文件

- `inputs/component-mapping.md` — 模拟 phase C2 产物,标明 3 个模块
- `inputs/figma-node.json` — 模拟 Figma MCP 返回的节点 JSON(含 variables / assets)
- `expected/design-token-patch.md` — 期望产物(对齐 spec §4b 示例)

## 验证方式

人工 review。Agent 跑完后,用 `diff` 看产物 vs expected,语义不一致由人判定。

后续如需更稳定的自动化验收,可引入 LLM-as-judge 或结构化等价检查。
