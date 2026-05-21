# 进度推断与路由细节

本文档补充 `figma-workflow/SKILL.md` 的细节,说明 orchestrator 如何判断产物状态、
如何展示进度面板、如何处理 review gate 与 phase E handoff。

## 产物存在性检查

一个阶段产物被视为"完成",必须同时满足:

1. 文件存在
2. 文件 size > 0
3. 文件不是模板占位

模板占位的识别标记:

- `<!-- TODO: ... -->`
- `<!-- TBD -->`
- `{{...}}`

当前只做粗略判断。若用户只填了一两行但仍保留大量 TODO,应视为未完成。
若误判,用户可以手动确认并继续。

## 阶段进入条件

| 阶段 | 产物 | 进入条件 | 动作 |
|---|---|---|---|
| A | `clarified-requirement.md` | 永远可进入 | 调用 `figma-clarify-requirement`;不可用时提示模板 |
| B | `ui-understanding.md` | A 非占位 | 调用 `figma-ui-understand`;不可用时提示模板 |
| C-up | `api-mapping.md` | A + B 非占位 | 调用 `figma-api-first`;不可用时提示 `templates/api-mapping.md` |
| C-low | `component-mapping.md` | A + B + C-up 非占位 | 调用 `figma-ui-api-mapper` |
| D | `design-token-patch.md` | A + B + C-up + C-low 非占位 | 调用 `figma-design-token` |
| E | `implementation-spec.md` + `open-questions.md` | A + B + C-up + C-low + D 非占位 | 调用 `figma-emit-spec` |

## 下一阶段选择

从上到下寻找第一个未完成阶段:

1. 如果它的进入条件满足,标记为 `← next`
2. 如果进入条件不满足,展示缺失产物并阻塞
3. 如果全部完成,提示进入交接前工程化检查或退出

不要自动连跑。即使 A/B/C-up 都已经存在,也只推荐一个 next step。

## 进度面板字段

```text
Feature: <feature>
Dir:     docs/design/<feature>/

Progress:
  [✓] A      clarified-requirement.md          (handwritten, 1.2 KB)
  [ ] D      design-token-patch.md             ← next

Next step:
  [1] Run figma-design-token (phase D)
  [2] Re-run a completed phase
  [3] Manually edit a product
  [4] Exit
```

字段规则:

- `Feature`:用户传入的 `<feature>`
- `Dir`:固定 `docs/design/<feature>/`
- `[✓]`:产物完成
- `[ ]`:产物缺失或未填
- `<size>`:使用人类可读大小,如 `1.2 KB`
- `<timestamp>`:优先从 `inputs.md` 对应阶段记录读取
- `← next`:只出现一次

## Cache summary

当 `docs/design/<feature>/.figma-cache/manifest.json` 存在时,进度面板展示:

```text
Cache:
  [✓] .figma-cache/manifest.json (1 node, fresh)
```

当 manifest 缺失时,展示:

```text
Cache:
  [ ] .figma-cache/manifest.json (not created)
```

cache 只提示 Figma MCP evidence 状态,不作为阶段完成条件。

## Design diff

当 `.figma-cache/` 存在时,orchestrator 可以展示:

```text
Design diff:
  [ ] design-diff.md (not generated)

Diff actions:
  [D] Generate design-diff.md from latest cache snapshots
  [V] View existing design-diff.md
```

Diff action 不标记任何 Phase 完成,不自动覆盖 A/B/C/D/E 产物,不替代 review gate。

## UI handoff

当 `docs/design/<feature>/` 存在时,orchestrator 可以展示:

```text
UI handoff:
  [ ] ui-handoff.md (not generated)

Handoff actions:
  [U] Generate ui-handoff.md
  [V] View existing ui-handoff.md
```

UI handoff 是面向设计/产品的上游交接文档,不是 Phase E implementation handoff。它不标记任何 Phase 完成,不阻塞 Phase E,不授权 coding。

## Assets / validation

当 `docs/design/<feature>/` 存在时,orchestrator 可以展示:

```text
Assets / validation:
  [ ] assets-manifest.md (not generated)
  [ ] validation-report.md (not generated)

Actions:
  [A] Generate assets manifest
  [Q] Run validation checks
```

Assets / validation action 不标记任何 Phase 完成,不替代人工 review gate,不默认下载所有资源,不授权 coding。

## 工程化检查点

工程化检查点不混入 A-E `Progress:` 表格。它们显示在独立区域:

```text
交接前工程化检查:
  [P13] design-diff.md
  [P14] ui-handoff.md
  [P15] assets-manifest.md / validation-report.md
```

推荐等级:

| Level | Meaning |
|---|---|
| `required_prompt` | 必须提示,用户可 skip。 |
| `recommended` | 条件满足时推荐,用户可 skip。 |
| `available` | 可用但不主动打断。 |

`figma-assets-validate` 在 Phase E review gate 之后始终是 `required_prompt`。

## Phase A/B skill 菜单

当 next step 是 A 时,展示:

```text
Next step:
  [1] Run figma-clarify-requirement (phase A)
  [2] Use template fallback
  [3] Manually edit a product
  [4] Exit
```

当 next step 是 B 时,展示:

```text
Next step:
  [1] Run figma-ui-understand (phase B)
  [2] Use template fallback
  [3] Manually edit a product
  [4] Exit
```

选择 [1] 时优先路由到对应 skill。若 skill 不可用,退回 template fallback。
选择 [2] 时只提示:

```text
Template: figma-workflow/templates/clarified-requirement.md
Target:   docs/design/<feature>/clarified-requirement.md

Copy the template, fill all <!-- TODO: ... --> sections, then run:
figma-workflow feature=<feature>
```

不替用户自动填业务内容。

## C-up skill 菜单

当 next step 是 C-up 时,展示:

```text
Next step:
  [1] Run figma-api-first (phase C-up)
  [2] Use template fallback
  [3] Manually edit a product
  [4] Exit
```

C-up 需要 A + B 非占位。选择 [1] 时优先路由到 `figma-api-first`,由用户粘贴接口结构生成 `api-mapping.md`。
如果 `figma-api-first` 不可用,退回 `templates/api-mapping.md` fallback。
C-up 完成后回到 review gate,不自动进入 C-low,不自动运行 `figma-ui-api-mapper`。
`figma-api-first` 不接 YApi / Swagger / OpenAPI 自动抓取,不修改业务代码。

## Skill 阶段菜单

当 next step 是 C-low / D / E 时,展示:

```text
Next step:
  [1] Run <skill-name> (phase X)
  [2] Re-run a completed phase
  [3] Manually edit a product
  [4] Exit
```

选择 [1] 后:

- C-low:路由到 `figma-ui-api-mapper`
- D:路由到 `figma-design-token`
- E:路由到 `figma-emit-spec`

如果缺少 Figma file key / node id,在调用 C-low / D 前向用户索取。
A/B 现在也优先 skill 路由,但使用独立的 Phase A/B skill 菜单。
C-up 也优先 skill 路由,但使用独立的 C-up skill 菜单。

## Review gate

阶段 skill 落盘后,先展示该阶段 self-check,再展示:

```text
Choose:
  [1] Proceed to next phase
  [2] Re-run current phase (will overwrite; git is source of truth, commit before re-running)
  [3] Pause for manual edit
  [4] Exit workflow
```

语义:

- [1] 回到产物扫描并进入下一阶段
- [2] 重跑当前阶段,产物覆盖,不做备份
- [3] 退出,用户编辑后重新运行
- [4] 退出

自查不阻塞。只有下游 skill 报错时才停止。

## Pre-handoff summary

进入 handoff menu 前先展示:

```text
Core products:
  [✓] implementation-spec.md
  [✓] open-questions.md

工程化检查:
  [✓] design-diff.md
  [S] ui-handoff.md skipped
  [✓] assets-manifest.md
  [✓] validation-report.md

Risk notes:
  - ui-handoff.md skipped: design/product follow-up not captured
```

summary 不落新文件。它只帮助用户在 handoff 前看到工程化检查结果和 skip 风险。

## 交接前工程化检查与 Phase E handoff

phase E 完成并在 review gate 选择 [1] 后,先展示交接前工程化检查。
所有 `required_prompt` 都 run / view / skip 后,再追加 handoff 菜单:

```text
Handoff to planning / spec authoring:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

处理:

- builtin:只产出 `docs/design/<feature>/task-breakdown.md`,并写 `.workflow-prefs.json`;不写业务代码
- superpowers:检测到时推荐选择,调用 `superpowers:writing-plans`,并写 `.workflow-prefs.json`;输入只包含 `implementation-spec.md`
- manual:退出,不写偏好;可提示外部目标,包括 OpenSpec、Cursor、Codex 或用户自有流程
- pause:退出,不写偏好,用于先回答 open questions 或编辑上游产物

如果 `.workflow-prefs.json` 已存在:

```text
Previous handoff choice: superpowers (saved 2026-05-20). Use [P] to repeat.
```

`[P]` 只是快捷键,不自动执行。

Phase E handoff 进入的是 OpenSpec / planning / task breakdown 等准备阶段,不是默认 coding 阶段。任何 handoff 选项都不在 `figma-workflow` 内写业务代码;业务代码只能在用户明确确认执行 coding 后开始。

## 错误处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 报错并展示 `figma-workflow feature=<feature-name>` |
| feature 目录不存在 | 创建目录并 echo 路径 |
| 用户选择未满足条件的阶段 | 阻塞并列出缺失产物 |
| 下游 skill 报错 | 原样透传 |
| 用户中断 | 无状态退出 |
| 上游产物执行中被修改 | 当前不检测 |

## 不做的事

- ❌ 不自动生成 A/B/C-up 的业务内容
- ❌ 不连跑多个阶段
- ❌ 不根据 diff 自动重跑阶段或覆盖产物
- ❌ 不读取额外配置文件或路径配置
- ❌ 不跨 feature 批量操作
