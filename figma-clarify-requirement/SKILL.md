---
name: figma-clarify-requirement
description: figma-workflow-suite 的 phase A 组件。把用户自然语言需求、业务背景和约束整理为 clarified-requirement.md,作为后续 UI 理解、API 映射和实现规格的需求事实来源。
---

# Figma Clarify Requirement

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的一部分,处于 **phase A**:

```
phase A → phase B → phase C-up → phase C-low → phase D → phase E
clarified-requirement.md → ui-understanding.md → api-mapping.md → component-mapping.md → design-token-patch.md → implementation-spec.md
```

可以通过两种方式调用:

- **由 orchestrator 调用** —— `figma-workflow feature=<name>` 在 phase A 路由到本 skill
- **独立调用** —— 用户直接调用本 skill,传入 `feature` 参数

## Prerequisites

- `feature` name,推荐 kebab-case
- 用户的自然语言需求或任务描述
- 可选:Figma URL、PRD、已有页面路径、接口草案

## Calling convention

```
figma-clarify-requirement feature=<feature-name>
```

`feature=` 必传。缺失时拒绝继续,并提示用户补充 feature 名称。

## 适用场景

- 用户刚给出一个 Figma 实现需求,但还没有整理成稳定需求事实
- 准备进入 phase B/C/D/E,需要先明确目标、范围、状态和约束
- 用户提供了零散描述、Figma URL、接口草案或现有页面信息,需要汇总为可 review 的需求产物
- 需要把不确定项集中放到 `Open Questions`,避免后续阶段把猜测当成事实

## 与 superpowers 的关系

- 本 skill 可以独立执行,不强依赖 superpowers。
- 如果用户需求很模糊、目标和范围还没有形成共识,推荐先使用 `superpowers:brainstorming` 辅助澄清,再把确认后的事实写入 `clarified-requirement.md`。
- 如果没有 superpowers,本 skill 仍按"最多 3 个阻塞问题 + 非阻塞问题进入 Open Questions"的规则完成 phase A。
- 编码计划不在 phase A 生成;Phase E handoff 后优先建议 `superpowers:writing-plans`。

## 目标

本 skill **只做需求澄清和事实整理**:

- 输出 `docs/design/<feature>/clarified-requirement.md`
- 追加一条审计记录到 `docs/design/<feature>/inputs.md`
- 将用户已确认的事实和仍待确认的问题分开记录
- 把非阻塞问题放入 `Open Questions`,必要时用 `[deferred]` 标记本期不处理

**不**承担:

- 不调用 Figma MCP 做深度 UI 分析
- 不做 API 字段映射
- 不产出 `ui-understanding.md`
- 不修改业务代码
- 不把未确认事项写成确定事实

## 工作流

1. **解析 feature**
   - 从用户输入中解析 `feature=<feature-name>`
   - 缺失时拒绝执行,提示用户补充 feature 名称
   - feature 名推荐 kebab-case,用于 `docs/design/<feature>/`

2. **准备产物目录**
   - 确保 `docs/design/<feature>/` 存在
   - 如果目录已有 `clarified-requirement.md`,先读取并询问是覆盖、补充还是暂停

3. **收集用户事实**
   - 整理用户已给出的业务目标、页面范围、技术栈、接口草案、设计链接、状态要求
   - 只记录来源明确的事实
   - 由 agent 推断的内容必须标记 `(INFERRED)`

4. **必要时追问**
   - 仅在阻塞 phase B 的关键事实缺失时追问
   - 一次最多问 3 个 clarification questions
   - 需求非常模糊时,可建议用户先走 `superpowers:brainstorming`,但不要把它作为继续执行的硬前置
   - 非阻塞问题不要打断流程,写入 `Open Questions`

5. **生成 clarified-requirement.md**
   - 使用 [references/clarified-requirement-template.md](references/clarified-requirement-template.md)
   - 产物路径固定为 `docs/design/<feature>/clarified-requirement.md`
   - 保持中文为主,必要英文术语可保留

6. **整理 Open Questions**
   - 未解决但不阻塞的事项写入 `Open Questions`
   - 明确本期不做的事项使用 `[deferred]`
   - 不要把开放问题改写成已确认结论

7. **追加 inputs.md**
   - 在 `docs/design/<feature>/inputs.md` 追加一条审计记录
   - 记录 source type、timestamp、clarifier version
   - 如果用户提供 Figma URL、PRD 或接口草案,在 entry 中记录对应来源

8. **输出 review gate**
   - 落盘后打印 review gate,让用户选择:
     - `Proceed`: 进入 phase B
     - `Re-run`: 修改输入后重新执行 phase A
     - `Pause`: 暂停,用户先补充问题
     - `Exit`: 结束流程

## 输出结构

`docs/design/<feature>/clarified-requirement.md` 必须按
[references/clarified-requirement-template.md](references/clarified-requirement-template.md)
生成。

产物至少包含:

- `Goal`
- `Scope`
- `Out of Scope`
- `User States`
- `Interaction`
- `Constraints`
- `Open Questions`

不得保留模板占位,不得把未确认事项写成确定事实。

## inputs.md 记录格式

追加记录建议使用:

```markdown
## <ISO8601> — figma-clarify-requirement@0.1.0

- source_type: user_request | prd | figma_url | api_draft | mixed
- feature: <feature>
- output: clarified-requirement.md
- notes: <本次澄清的输入来源摘要>
```

## 自查规则

skill 在产物落盘后,应输出以下自查信息供 orchestrator 的 review gate 使用:

| Check | Warning |
|---|---|
| `Goal` empty | "Goal 缺失,不能进入 Phase B" |
| `Scope` empty | "Scope 缺失,不能进入 Phase B" |
| `Open Questions` contains non-deferred items | "存在未解决问题,建议 review 后再继续" |
| any template placeholder marker remains | "产物仍含模板占位,orchestrator 会视为未完成" |

## 错误处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 拒绝执行,提示补充 `feature=<feature-name>` |
| 用户需求为空 | 拒绝执行,提示补充目标或任务描述 |
| 关键事实缺失 | 最多追问 3 个阻塞问题 |
| 非阻塞事实不清 | 写入 `Open Questions`,不阻塞落盘 |
| 目标产物已存在 | 先询问覆盖、补充或暂停 |

## 不要做的事

- 不调用 Figma MCP 做深度 UI 分析
- 不下载 Figma 资源
- 不读取 raw Figma JSON
- 不生成 `ui-understanding.md` / `api-mapping.md` / `component-mapping.md`
- 不修改业务代码
- 不替用户决定未确认的产品范围

## 下游衔接

本 skill 的产物会被后续 phase 读取:

- **phase B `figma-ui-understand`** — 读取 `Goal`、`Scope`、`User States`、`Interaction`
- **phase C-up `figma-api-first`** — 读取接口相关约束和开放问题
- **phase E `figma-emit-spec`** — 汇总 `Open Questions`,并把 `[deferred]` 标记传递到实施规格

编码阶段只能在 phase E handoff 之后开始:

- `docs/design/<feature>/implementation-spec.md` — Agent 编码主输入
- `docs/design/<feature>/open-questions.md` — 跨阶段未决问题汇总
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录
- `handoff = builtin` — 产出 `task-breakdown.md`
- `handoff = superpowers` — 推荐路径,调用 `superpowers:writing-plans`,以 `implementation-spec.md` 作为输入
