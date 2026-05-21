# Suite E2E Fixture: referral-home

这是 `figma-workflow-suite` 的 suite 级端到端 fixture,用于验证 MVP 链路:

```text
phase A/B/C1 手填产物
  → phase C2 figma-ui-api-mapper
  → phase D figma-design-token
  → phase E figma-emit-spec
  → handoff superpowers:writing-plans
```

## 定位

这个目录不是单个 skill 的 fixture。它负责把已有 per-skill fixture 串起来,验证它们作为一个 suite 时是否能形成连续输入/输出链路。

## 复用的 fixture

- `figma-ui-api-mapper/tests/fixtures/course-list/` — P1 改名回归,验证旧 `figma-api-mapper` 示例转 Markdown 后语义等价
- `figma-design-token/tests/fixtures/referral-home/` — phase D referral-home token 抽取 fixture
- `figma-emit-spec/tests/fixtures/referral-home/` — phase E referral-home 合成 fixture
- `figma-workflow/tests/fixtures/progress-states/` — orchestrator 进度面板 fixture

## 本目录文件

- `flow-map.md` — referral-home 从 A/B/C1 到 E 的 suite 级流转图
- `validation-checklist.md` — MVP 成功标准验收清单
- `handoff-superpowers.expected.md` — phase E 后 handoff 到 `superpowers:writing-plans` 的期望行为

## 验证方式

MVP 采用人工 review:

1. 对照 `flow-map.md` 检查每阶段输入输出是否能串起来
2. 对照 `validation-checklist.md` 勾选 §6.4 成功标准
3. 对照 `handoff-superpowers.expected.md` 检查 phase E 后只把 `implementation-spec.md` 交给 superpowers

第 3 版再考虑 LLM-as-judge 或结构化自动验证。
