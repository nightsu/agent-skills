# Workflow 编排

本文档定义 `figma-workflow` 如何编排工程化能力。工程化检查点是强推荐检查点,不是 A-E 主链路阶段,不改变 Phase 完成条件,不授权 coding。

本文件承接 P13/P14/P15 的工程化设计,但在 `figma-workflow` 面向用户的输出中呈现最终 workflow 编排,不要求用户理解版本号。

## Skill Count Model

主链路保持 7 个 skill:

- `figma-workflow`
- `figma-clarify-requirement`
- `figma-ui-understand`
- `figma-api-first`
- `figma-ui-api-mapper`
- `figma-design-token`
- `figma-emit-spec`

工程化层新增 3 个 skill:

- P13 `figma-design-diff`
- P14 `figma-ui-handoff`
- P15 `figma-assets-validate`

P12 cache layer 是基础设施,不新增独立 skill。工程化层全部落地后,figma-workflow-suite 相关 skill 总数为 10 个。

## Orchestration Positions

工程化检查点出现在两个位置:

1. **Mid-workflow prompt**:C2 或 D 后,当设计改稿、cache snapshot、unknown/open questions 等风险出现时提示 P13/P14。
2. **Pre-handoff checkpoint**:Phase E review gate 通过后、handoff menu 之前,汇总 P13/P14/P15 状态。

顺序:

```text
A → B → C1 → C2 → D → E
→ Phase E review gate
→ 交接前工程化检查
→ handoff menu
→ OpenSpec / planning / task breakdown
→ explicit coding confirmation
→ business code
```

## Recommendation Levels

| Level | Meaning |
|---|---|
| `required_prompt` | `figma-workflow` 必须提示用户,但用户仍可 skip。 |
| `recommended` | 条件满足时展示为推荐项,用户可轻量 skip。 |
| `available` | 只作为可用工具展示,不打断流程。 |

## Trigger Rules

| Capability | Mid-workflow trigger | Pre-handoff trigger | Level |
|---|---|---|---|
| P13 `figma-design-diff` | `.figma-cache/snapshots/` 有 baseline/current;用户说设计改稿;refresh 后 evidence hash 变化 | snapshots 存在且 `design-diff.md` 缺失或 stale | `required_prompt` |
| P14 `figma-ui-handoff` | 存在 unknown/open questions;用户要给设计/产品反馈 | `ui-handoff.md` 缺失且存在 unknown/open questions 或 design diff | `recommended` |
| P15 `figma-assets-validate` | 用户明确询问资源或验证 | Phase E review gate 后始终出现 | `required_prompt` |

## Actions

| Action | Behavior |
|---|---|
| `run` | 调用对应工程化 skill,由该 skill 追加正常 audit。 |
| `view` | 展示已有产物路径或摘要,不重新生成。 |
| `skip` | 不生成产物,由 `figma-workflow` 追加 skip audit。 |
| `continue` | 所有 `required_prompt` 都 run/view/skip 后进入 handoff menu。 |

## Status Values

| Status | Meaning |
|---|---|
| `missing` | 产物不存在。 |
| `generated` | 产物存在。 |
| `stale` | 上游 evidence 比产物更新。 |
| `skipped` | 当前 checkpoint 已 skip 且已写 audit。 |
| `not_applicable` | 触发条件不满足。 |

## Skip Audit

Skip audit 写入 `docs/design/<feature>/inputs.md`:

```markdown
## <ISO8601> — figma-workflow@engineering-checkpoint

- checkpoint: pre-handoff
- phase_context: after_phase_e_review
- action: skip
- skipped:
  - skill: figma-assets-validate
    product: assets-manifest.md, validation-report.md
    recommendation: required_prompt
    reason: pre-handoff validation recommended
    risk: assets and boundary checks not reviewed before handoff
- continue_to_handoff: true
```

## Handoff Boundary

- `implementation-spec.md` 仍是 handoff 主输入。
- `open-questions.md` 是风险输入。
- `design-diff.md` 是改稿影响输入。
- `ui-handoff.md` 是设计/产品协作输入,不是 implementation spec。
- `assets-manifest.md` 和 `validation-report.md` 是 coding 前资源/验证输入。
- `handoff != coding`,`planning != coding`,`OpenSpec != coding`。
- 只有用户明确确认执行 coding 后,才能写业务代码。
