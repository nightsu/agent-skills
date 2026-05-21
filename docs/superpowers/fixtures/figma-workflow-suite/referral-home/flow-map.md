# Flow Map — referral-home

本文档描述 suite 级 referral-home fixture 如何串联 A/B/C1/C2/D/E。

## 总览

```text
docs/design/referral-home/
├── clarified-requirement.md   ← phase A 手填
├── ui-understanding.md        ← phase B 手填
├── api-mapping.md             ← phase C1 手填
├── component-mapping.md       ← figma-ui-api-mapper
├── design-token-patch.md      ← figma-design-token
├── implementation-spec.md     ← figma-emit-spec
└── open-questions.md          ← figma-emit-spec
```

## 阶段映射

| 阶段 | 输入 | 执行动作 | 输出 | fixture 来源 |
|---|---|---|---|---|
| A | 用户需求 | 手填模板 | `clarified-requirement.md` | `figma-emit-spec/tests/fixtures/referral-home/inputs/clarified-requirement.md` |
| B | Figma 截图 / 人工理解 | 手填模板 | `ui-understanding.md` | `figma-emit-spec/tests/fixtures/referral-home/inputs/ui-understanding.md` |
| C1 | YApi / Swagger / 字段清单 | 手填模板 | `api-mapping.md` | `figma-emit-spec/tests/fixtures/referral-home/inputs/api-mapping.md` |
| C2 | A + B + C1 + Figma node | `figma-ui-api-mapper` | `component-mapping.md` | `figma-emit-spec/tests/fixtures/referral-home/inputs/component-mapping.md` |
| D | `component-mapping.md` + Figma node | `figma-design-token` | `design-token-patch.md` | `figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md` |
| E | A/B/C1/C2/D 五份产物 | `figma-emit-spec` | `implementation-spec.md` + `open-questions.md` | `figma-emit-spec/tests/fixtures/referral-home/expected/` |

## Orchestrator 期望

`figma-workflow feature=referral-home` 每次只推荐一个下一步,不自动连跑。

### 空 feature

对应:

```text
figma-workflow/tests/fixtures/progress-states/empty-feature.expected.md
```

期望:

- A/B/C1/C2/D/E 全部 `[ ]`
- `clarified-requirement.md` 标 `← next`
- next step 提示复制 phase A 模板

### A/B/C1/C2 已完成

对应:

```text
figma-workflow/tests/fixtures/progress-states/ready-for-d.expected.md
```

期望:

- A/B/C1/C2 为 `[✓]`
- `design-token-patch.md` 标 `← next`
- next step 为 `Run figma-design-token (phase D)`

## Review gate 边界

每次 phase skill 完成后必须停在 review gate:

```text
[1] Proceed to next phase
[2] Re-run current phase
[3] Pause for manual edit
[4] Exit workflow
```

fixture 验证重点:

- C2 完成后不自动进入 D
- D 完成后不自动进入 E
- E 完成后先展示 E 的 review gate,用户选择 Proceed 后才进入 handoff 菜单

## 关键跨阶段行为

### label_drift

`component-mapping.md` 中:

```text
DiamondPreviewCard.primary_value = "钻石余额"
OperationEntryGrid.list_item_label = "入口"
```

`design-token-patch.md` 中:

```text
valueLabel = 钻石数量
labelText = 运营入口
```

`figma-emit-spec` 应在 `implementation-spec.md` 中自动以 D 为准,并写入 `Auto Corrections Metadata`。

### deferred

`clarified-requirement.md` 中:

```text
[deferred] 趋势数据(钻石余额右侧 ↑/↓ X%)
```

`figma-emit-spec` 应:

- 在 `implementation-spec.md` 对应 module 标 `Deferred`
- 在 `open-questions.md` 的 `## Deferred` 段汇总
- 不把 deferred 当成 blocker

### implementation-spec 作为唯一主输入

进入 apply 阶段时,下游 Agent 只应读取:

```text
docs/design/referral-home/implementation-spec.md
```

不应再读取 raw Figma JSON 或 A/B/C/D 上游产物。
