# figma-emit-spec

Part of the **figma-workflow-suite** —— phase E(最后一环).
合并 5 份上游 .md 产物 → `implementation-spec.md`(Agent 编码主输入)+ `open-questions.md`,
并在出口处提供 handoff 选择(builtin / superpowers / manual / pause)。

## Quick start

调用 skill:

```
figma-emit-spec feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase E 自动路由调用)

## Prerequisites

`docs/design/<feature>/` 目录下必须**已有 5 份产物**:
- `clarified-requirement.md`(phase A)
- `ui-understanding.md`(phase B)
- `api-mapping.md`(phase C-up)
- `component-mapping.md`(phase C-low)
- `design-token-patch.md`(phase D)

## Outputs

- `docs/design/<feature>/implementation-spec.md` — Agent 编码主输入
- `docs/design/<feature>/open-questions.md` — 跨阶段未决问题汇总
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录
- (handoff = builtin)`task-breakdown.md`
- (handoff = superpowers)调用 `superpowers:writing-plans` 转 implementation plan

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 冲突检测算法 + label_drift 自动校正:[references/conflict-detection.md](./references/conflict-detection.md)
- spec 模板填充规则:[references/spec-template.md](./references/spec-template.md)
- 端到端 fixture:[tests/fixtures/referral-home/](./tests/fixtures/referral-home/)

## 上下游

```
phase A/B/C-up/C-low/D       →  figma-emit-spec     →  apply stage
5 份 .md 产物                    implementation-spec    用户 coding agent
                                + open-questions       或 superpowers:writing-plans
                                + (optional) task-     或 OpenSpec
                                  breakdown
```

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
