# Fixture: course-list

回归 fixture,用于验证 `figma-ui-api-mapper` 的等价行为。

**来源:** 沿用原 `figma-api-mapper` SKILL.md 中"端到端示例"的课程列表案例,
转为 Markdown 表格输出。

## 用途

人工 review 验证。让 Agent 读 `inputs/` 下的 4 份模拟输入,产出 `component-mapping.md`,
和 `expected/component-mapping.md` 对比,确认**语义等价**(允许置信度数值 ±0.05 浮动,
不要求逐字符相同)。

## 文件

- `inputs/clarified-requirement.md` — 模拟用户阶段 A 手填产物
- `inputs/ui-understanding.md` — 模拟用户阶段 B 手填产物
- `inputs/api-mapping.md` — 模拟用户阶段 C1 手填产物
- `inputs/figma-node.json` — 模拟 Figma MCP 返回的节点 JSON
- `expected/component-mapping.md` — 期望产物

## 验证方式

人工 review。Agent 跑完后,用 `diff` 看产物 vs expected,语义不一致由人判定。

后续如需更稳定的自动化验收,可引入 LLM-as-judge 或结构化等价检查。
