---
name: figma-workflow
description: figma-workflow-suite 的 orchestrator。按 docs/design/<feature>/ 下的产物状态驱动 C→D→E 阶段,展示进度面板、review gate 与 phase E handoff 出口。
---

# Figma Workflow 编排器

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的入口编排器,负责把各阶段 skill 串成一个**产物驱动**的线性流程:

```
phase A → phase B → phase C1 → phase C2 → phase D → phase E → handoff 出口
clarify   UI理解     api-first    ui-api-mapper  design-token  emit-spec
```

当前阶段路由:

- **phase A**:优先调用 `figma-clarify-requirement`;不可用时提示模板
- **phase B**:优先调用 `figma-ui-understand`;不可用时提示模板
- **phase C1**:优先调用 `figma-api-first`;不可用时提示模板
- **phase C2**:`figma-ui-api-mapper`
- **phase D**:`figma-design-token`
- **phase E**:`figma-emit-spec`

`figma-api-first` 只整理用户提供的接口结构,不接 YApi / Swagger / OpenAPI 自动抓取。

Phase E 只交付实施输入文档和 handoff 选择。handoff 后可进入 OpenSpec / planning / task breakdown 等准备阶段;业务代码只能在用户明确确认执行 coding 后开始。

Cache layer is optional evidence infrastructure. It can refresh or summarize Figma MCP evidence, but it never marks a phase complete and never skips review gate.

工程化检查点是强推荐的编排节点,不是新的 A-E phase。出现设计改稿或上游质量风险时,`figma-design-diff` / `figma-ui-handoff` 可以作为流程中提醒出现。Phase E review gate 通过后、handoff menu 之前,`figma-workflow` 必须展示交接前工程化检查。`required_prompt` 可以被 skip,但 skip 决策必须 audit 到 `inputs.md`。

`figma-workflow` 可以通过 `figma-ui-handoff` 生成 `ui-handoff.md`,用于提示设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。该入口不属于 Phase E handoff,也不触发 coding。

`figma-workflow` 可以通过 `figma-assets-validate` 生成 `assets-manifest.md`、`validation-report.md` 和 `snapshots/`,用于资源交付、visual baseline 和 spec/snapshot 验证收口。该入口不改变 Phase E handoff,也不触发 coding。

## Prerequisites

调用前用户需要明确:

- feature 名称,推荐 kebab-case,如 `referral-home`
- 当前工作目录是业务仓库根目录
- 若要执行 C2 / D,需要准备 Figma file key 和 node id

本 skill 固定读写:

```text
docs/design/<feature>/
```

当前调用契约固定使用 `feature=` 参数和 `docs/design/<feature>/` 路径;不读取额外配置文件,也不扫描或猜测 feature 名。

## Calling convention

```text
figma-workflow feature=<feature-name>
```

`feature=` 必传,其它参数不支持。

如果 `docs/design/<feature>/` 不存在,创建目录并 echo 路径,让用户确认是否拼写正确。

## 适用场景

- 用户已经开始按 figma-workflow-suite 产出设计实现材料
- 需要判断下一步该手填模板、运行 C2、运行 D,还是进入 E
- 每阶段产物落盘后,需要一个统一的 review gate 让用户决定继续、重跑、暂停或退出
- phase E 完成后,需要选择 handoff 路径: builtin / superpowers / manual / pause

## 目标

这个 skill **只做编排**:

- 根据 `docs/design/<feature>/` 下的文件存在性推断进度
- 展示当前 feature 的进度面板
- 对 A/B 优先路由到对应 phase skill,不可用时 fallback 到模板路径
- 对 C1 优先路由到 `figma-api-first`,不可用时 fallback 到模板路径
- 对 C2 / D / E 路由到对应 skill
- 每阶段结束后展示 review gate
- Phase E 结束后展示 handoff 出口并收紧 apply boundary

**不**承担:

- 自动连跑多阶段
- 自动抓取 YApi / Swagger / OpenAPI
- 自动连跑 C1 到 C2
- 自动回答 open questions
- 调用 Figma MCP(由下游 phase skill 自己调用)
- 不修改业务代码
- 未经用户明确确认执行 coding 就写业务代码
- 自动调用 apply/coding agent
- 修改已有上游产物
- 根据 diff 自动重跑阶段或覆盖产物

## 产物布局

```text
docs/design/<feature>/
├── inputs.md
├── .workflow-prefs.json
├── .figma-cache/
├── clarified-requirement.md
├── ui-understanding.md
├── api-mapping.md
├── component-mapping.md
├── design-token-patch.md
├── design-diff.md
├── ui-handoff.md
├── assets-manifest.md
├── validation-report.md
├── snapshots/
├── implementation-spec.md
└── open-questions.md
```

## 工作流

1. **解析 feature**
   - 缺失 `feature=` 时拒绝执行,提示用法
   - 目录不存在时创建 `docs/design/<feature>/` 并打印路径

2. **扫描产物**
   - 检查每个阶段产物是否存在、是否非空、是否仍是模板占位
   - 从文件系统推断当前进度,不依赖内存状态

3. **打印进度面板**
   - 展示 A / B / C1 / C2 / D / E 的完成状态
   - 如果 `.figma-cache/manifest.json` 存在,展示 cache summary
   - 标出第一个可进入的下一阶段

4. **等待用户选择**
   - 运行下一阶段
   - 重跑已完成阶段
   - 暂停让用户手动编辑
   - 退出

5. **路由到阶段动作**
   - A:优先调用 `figma-clarify-requirement`;不可用时提示模板
   - B:优先调用 `figma-ui-understand`;不可用时提示模板
   - C1:优先调用 `figma-api-first`;不可用时提示模板
   - C2:调用 `figma-ui-api-mapper`
   - D:调用 `figma-design-token`
   - E:调用 `figma-emit-spec`

6. **阶段完成后进入 review gate**
   - 展示该阶段 self-check
   - 让用户选择继续、重跑、暂停或退出

7. **phase E 后进入交接前工程化检查**
   - 只有用户在 phase E review gate 选择继续时才出现
   - 汇总 `design-diff.md`、`ui-handoff.md`、`assets-manifest.md` / `validation-report.md` / `snapshots/`
   - `figma-assets-validate` 永远作为 handoff 前 `required_prompt`
   - 用户可以 run / view / skip
   - skip 必须写入 `inputs.md` audit

8. **工程化检查处理后进入 handoff 出口**
   - 只有用户在 phase E review gate 选择继续时才出现
   - 所有 `required_prompt` 都 run/view/skip 后才显示
   - 让用户选择 builtin / superpowers / manual / pause

## 阶段进入条件

| 目标阶段 | 进入条件 | 缺失时处理 |
|---|---|---|
| A `figma-clarify-requirement` | 永远可进入 | skill 不可用时 fallback 到 `templates/clarified-requirement.md` |
| B `figma-ui-understand` | A 存在且非占位 | 阻塞并提示缺 A;skill 不可用时 fallback 到 `templates/ui-understanding.md` |
| C1 `figma-api-first` | A + B 存在且非占位 | 阻塞并提示缺 A/B;skill 不可用时 fallback 到 `templates/api-mapping.md` |
| C2 `figma-ui-api-mapper` | A + B + `api-mapping.md` 存在且非占位 | 阻塞并列缺失产物 |
| D `figma-design-token` | A + B + `api-mapping.md` + `component-mapping.md` 存在且非占位 | 阻塞并列缺失产物 |
| E `figma-emit-spec` | A + B + C + `design-token-patch.md` 存在且非占位 | 阻塞并列缺失产物 |

### 非占位判定

产物至少满足:

- 文件存在
- size > 0
- 不全是模板占位

模板占位包括:

- `<!-- TODO: ... -->`
- `<!-- TBD -->`
- `{{...}}`

当前只做粗略判断,不做语义质量校验。

## 进度面板

```text
Feature: referral-home
Dir:     docs/design/referral-home/

Progress:
  [✓] A      clarified-requirement.md          (handwritten, 1.2 KB)
  [✓] B      ui-understanding.md               (handwritten, 2.4 KB)
  [✓] C1     api-mapping.md                    (handwritten, 1.8 KB)
  [✓] C2     component-mapping.md              (figma-ui-api-mapper, 2026-05-20 15:08)
  [ ] D      design-token-patch.md             ← next
  [ ] E      implementation-spec.md
  [ ] E      open-questions.md

Next step:
  [1] Run figma-design-token (phase D)
  [2] Re-run a completed phase
  [3] Manually edit a product
  [4] Exit
```

面板规则:

- `[✓]`:产物存在且非占位
- `[ ]`:产物缺失或仍是模板
- `← next`:第一个未完成且满足进入条件的阶段
- 手填阶段显示 `(handwritten, <size>)`
- skill 阶段优先从 `inputs.md` 读取来源和时间;读不到时显示文件大小

详细规则见 [references/progress-routing.md](references/progress-routing.md)。

## 路由行为

| 阶段 | 行为 |
|---|---|
| A | 调用 `figma-clarify-requirement feature=<feature>`;若不可用,提示把 `templates/clarified-requirement.md` 复制到 `docs/design/<feature>/clarified-requirement.md` 后手填 |
| B | 调用 `figma-ui-understand feature=<feature>`;若不可用,提示模板并索取 Figma file key / node id |
| C1 | 调用 `figma-api-first feature=<feature>`;若不可用,提示把 `templates/api-mapping.md` 复制到 `docs/design/<feature>/api-mapping.md` 后手填 |
| C2 | 调用 `figma-ui-api-mapper feature=<feature>` 并向用户索取 Figma file key / node id |
| D | 调用 `figma-design-token feature=<feature>` 并向用户索取或复用 Figma file key / node id |
| E | 调用 `figma-emit-spec feature=<feature>` |

如果用户选择了未满足进入条件的阶段,明确列出缺失文件,不继续。

## Review gate 行为

阶段产物落盘后,立即显示 review gate:

```text
Choose:
  [1] Proceed to next phase
  [2] Re-run current phase (will overwrite; git is source of truth, commit before re-running)
  [3] Pause for manual edit
  [4] Exit workflow
```

含义:

- `[1] Proceed`:回到进度推断,进入下一阶段
- `[2] Re-run`:重跑当前阶段,产物覆盖;不做备份
- `[3] Pause`:退出,用户手动编辑后重新运行 `figma-workflow feature=<feature>`
- `[4] Exit`:退出

各阶段 self-check 规则由对应 phase skill 定义。self-check 不阻塞,除非下游 skill 自己失败。

## 交接前工程化检查与 Handoff 出口

只有 phase E 完成且用户在 review gate 选择 `[1] Proceed` 后,才显示交接前工程化检查。
所有 `required_prompt` 都 run / view / skip 后,才显示 handoff 菜单:

```text
Handoff to planning / spec authoring:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

行为:

- **Builtin**:从 `implementation-spec.md` 的 Modules 拆出 `task-breakdown.md`,不写代码
- **superpowers**:推荐在可用时选择;调用 `superpowers:writing-plans`,把 `implementation-spec.md` 作为输入
- **Manual**:退出,不写偏好;可把 OpenSpec 作为外部目标,但本 skill 不生成 OpenSpec proposal
- **Pause**:退出,不写偏好

如果 `.workflow-prefs.json` 已记录 `handoff_after_emit`,菜单顶部显示上次选择和 `[P]` 快捷键。
即使有上次选择,也**不自动重放**。

Phase E handoff 是 OpenSpec / planning / task breakdown 等准备阶段的入口,不是默认 coding 入口。任何 handoff 选项都不应在 `figma-workflow` 内部直接写业务代码;业务代码只能在用户明确确认执行 coding 后开始。

## 错误处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 报错并显示用法 |
| feature 目录不存在 | 创建目录并 echo 路径 |
| 未达阶段进入条件 | 阻塞并列出缺失产物 |
| 下游 skill 报错 | 原样透传,不伪造产物 |
| 用户中断 | 无状态退出,下次从文件系统重判 |
| 上游产物执行中被外部修改 | 当前不检测,以下游 skill 当时读取为准 |

## 不要做的事

- ❌ 不自动连跑多阶段
- ❌ 不自动抓取 YApi / Swagger / OpenAPI
- ❌ 不自动进入 C2
- ❌ 不在用户明确确认执行 coding 前写业务代码
- ❌ 不自动调用 apply/coding agent
- ❌ 不跨 feature 操作
- ❌ 不把 `.figma-cache/` 当作阶段完成条件
- ✅ 可通过 `figma-design-diff` 生成 `design-diff.md`
- ❌ 不根据 diff 自动重跑阶段或覆盖产物
- ❌ 不把工程化检查点当作 A-E 完成条件
- ❌ 不因为工程化检查点 skip 就认为风险已解决
- ❌ 不在 handoff 前静默跳过 `figma-assets-validate` 提示
- ❌ 不读取额外配置文件或自动猜测 feature 名
- ❌ 不自动回答 open questions

## 参考

- 路由细节:[references/progress-routing.md](references/progress-routing.md)
- Workflow 编排:[references/workflow-orchestration.md](references/workflow-orchestration.md)
- Orchestrator spec:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/03-orchestrator.md`
- File layout:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`
- Review gate & handoff:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`
