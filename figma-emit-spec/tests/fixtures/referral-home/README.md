# Fixture: referral-home

回归 fixture,用于验证 `figma-emit-spec` 的合成行为。

**来源:** 沿用 P2 `figma-design-token/tests/fixtures/referral-home/` 主题,
扩展为 phase A~D 五份模拟产物 + 期望 phase E 输出。

## 用途

人工 review 验证。让 Agent 读 `inputs/` 下的 5 份模拟产物,合成 `implementation-spec.md` + `open-questions.md`,
和 `expected/` 对比,确认**关键行为**:
- `label_drift` 自动校正(C-low 槽位 label 被 D 真实 label 覆盖)
- `[deferred]` 标记在 spec 中显式标"本期不实现"
- 跨产物冲突写入 open-questions(field_unbound / module_missing_token / module_drift)
- 6 phase 分段汇总 open questions

## 注入的测试场景

- `component-mapping.md` 中 `DiamondPreviewCard.primary_value` label 故意写成"钻石余额"(C-low 推测)
  → `design-token-patch.md` 中真实 label 是"钻石数量"(D 真值)
  → emit-spec 应自动校正,implementation-spec 用"钻石数量",并在 Auto Corrections Metadata 段说明
- `clarified-requirement.md` 第 1 个 open question 带 `[deferred]` 前缀
  → emit-spec 应在对应 Module 段显式标 Deferred + 在 open-questions.md Deferred 段汇总

## 文件

- `inputs/clarified-requirement.md` — phase A 模拟产物(含 [deferred] open question)
- `inputs/ui-understanding.md` — phase B 模拟产物
- `inputs/api-mapping.md` — phase C-up 模拟产物
- `inputs/component-mapping.md` — phase C-low 模拟产物(故意含 label_drift)
- `inputs/design-token-patch.md` — phase D 模拟产物(直接复用 P2 fixture)
- `expected/implementation-spec.md` — 期望主产物
- `expected/open-questions.md` — 期望 open-questions 汇总

## MVP 验证方式

人工 review。Agent 跑完后,用 `diff` 对比产物 vs expected:
- 关键看 Auto Corrections Metadata 段 + Module 段的 Deferred 标记
- 关键看 open-questions 的分段结构 + Deferred 段
- 允许格式略有浮动(空行 / 列序),不允许语义偏离

## 未来

第 3 版引入 LLM-as-judge 或结构化等价检查。
