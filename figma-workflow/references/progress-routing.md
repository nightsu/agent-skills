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

MVP 只做粗略判断。若用户只填了一两行但仍保留大量 TODO,应视为未完成。
若误判,用户可以手动确认并继续。

## 阶段进入条件

| 阶段 | 产物 | 进入条件 | 动作 |
|---|---|---|---|
| A | `clarified-requirement.md` | 永远可进入 | 提示复制 `templates/clarified-requirement.md` |
| B | `ui-understanding.md` | A 非占位 | 提示复制 `templates/ui-understanding.md` |
| C-up | `api-mapping.md` | A + B 非占位 | 提示复制 `templates/api-mapping.md` |
| C-low | `component-mapping.md` | A + B + C-up 非占位 | 调用 `figma-ui-api-mapper` |
| D | `design-token-patch.md` | A + B + C-up + C-low 非占位 | 调用 `figma-design-token` |
| E | `implementation-spec.md` + `open-questions.md` | A + B + C-up + C-low + D 非占位 | 调用 `figma-emit-spec` |

## 下一阶段选择

从上到下寻找第一个未完成阶段:

1. 如果它的进入条件满足,标记为 `← next`
2. 如果进入条件不满足,展示缺失产物并阻塞
3. 如果全部完成,提示进入 phase E handoff 或退出

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

## 手填阶段菜单

当 next step 是 A / B / C-up 时,展示:

```text
Next step:
  [1] Create/fill clarified-requirement.md from template
  [2] Manually edit a product
  [3] Exit
```

选择 [1] 时只提示:

```text
Template: figma-workflow/templates/clarified-requirement.md
Target:   docs/design/<feature>/clarified-requirement.md

Copy the template, fill all <!-- TODO: ... --> sections, then run:
figma-workflow feature=<feature>
```

不替用户自动填业务内容。

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

## Phase E handoff

phase E 完成并在 review gate 选择 [1] 后,追加 handoff 菜单:

```text
Handoff to apply stage:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

处理:

- builtin:产出 `docs/design/<feature>/task-breakdown.md`,并写 `.workflow-prefs.json`
- superpowers:调用 `superpowers:writing-plans`,并写 `.workflow-prefs.json`
- manual:退出,不写偏好
- pause:退出,不写偏好

如果 `.workflow-prefs.json` 已存在:

```text
Previous handoff choice: superpowers (saved 2026-05-20). Use [P] to repeat.
```

`[P]` 只是快捷键,不自动执行。

## 错误处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 报错并展示 `figma-workflow feature=<feature-name>` |
| feature 目录不存在 | 创建目录并 echo 路径 |
| 用户选择未满足条件的阶段 | 阻塞并列出缺失产物 |
| 下游 skill 报错 | 原样透传 |
| 用户中断 | 无状态退出 |
| 上游产物执行中被修改 | MVP 不检测 |

## 不做的事

- ❌ 不自动生成 A/B/C-up 的业务内容
- ❌ 不连跑多个阶段
- ❌ 不做 diff / cache
- ❌ 不支持路径配置
- ❌ 不跨 feature 批量操作
