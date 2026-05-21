---
name: figma-ui-understand
description: figma-workflow-suite 的 phase B 组件。从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,输出 ui-understanding.md,作为后续 API 映射和组件映射的 UI 事实来源。
---

# Figma UI Understand

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的一部分,处于 **phase B**:

```
phase A → phase B → phase C-up → phase C-low → phase D → phase E
clarified-requirement.md → ui-understanding.md → api-mapping.md → component-mapping.md → design-token-patch.md → implementation-spec.md
```

可以通过两种方式调用:

- **由 orchestrator 调用** —— `figma-workflow feature=<name>` 在 phase B 路由到本 skill
- **独立调用** —— 用户直接调用本 skill,传入 `feature` 参数

## Prerequisites

- `feature` name,推荐 kebab-case
- `docs/design/<feature>/clarified-requirement.md`(phase A 产物,建议存在且非占位)
- Figma file key
- Figma node id(形如 `123:456`)

## Calling convention

```
figma-ui-understand feature=<feature-name>
```

`feature=` 必传。缺失时拒绝继续,并提示用户补充 feature 名称。

## 适用场景

- 已完成 phase A,需要从 Figma node 提取页面结构和 UI 语义
- 需要识别主要区域、疑似业务组件和重复模式
- 需要区分 Figma 中观察到的 UI 事实、由上下文推断的语义和仍不确定的问题
- 准备进入 phase C-up / C-low,需要 `ui-understanding.md` 作为 UI 事实来源

## 目标

本 skill **只做 UI 理解和结构整理**:

- 输出 `docs/design/<feature>/ui-understanding.md`
- 追加一条审计记录到 `docs/design/<feature>/inputs.md`
- 使用 phase A 的 `clarified-requirement.md` 校准业务语义
- 将 observed UI facts 与 inferred UI semantics 分开记录
- 把不确定区域写入 `Open Questions`

**不**承担:

- 不做 API 字段绑定
- 不产出 `api-mapping.md`
- 不产出 `component-mapping.md`
- 不修改业务代码
- 不把 `node.name` 当作真实业务文案
- 不读取传入 node 之外的兄弟页面或 frame

## Figma MCP 调用规则

必须调用以下 Figma MCP 工具:

1. `get_metadata` — 获取节点层级、尺寸、类型、位置、children
2. `get_design_context` — 获取真实 text `characters`、组件线索和视觉上下文
3. `get_screenshot` — 获取整体截图,用于校验页面结构和主要区域是否漏识别

规则:

- `node.name` 只能辅助识别 layer;真实文案必须来自 text `characters`
- 只读取传入 node 及其 descendants
- 不读取 sibling frames、其他 pages 或无关 nodes
- screenshot 只做交叉校验,不是唯一事实来源

## Cache Contract

如果 `docs/design/<feature>/.figma-cache/` 不存在,Phase B 可以在调用 Figma MCP 后创建 cache entry。若存在 fresh cache,优先读取 cache 生成 `ui-understanding.md`。无论 cache 是否命中,Phase B 仍必须输出 `ui-understanding.md` 并进入 review gate。

## 工作流

1. **解析 feature**
   - 从用户输入中解析 `feature=<feature-name>`
   - 缺失时拒绝执行,提示用户补充 feature 名称

2. **准备产物目录**
   - 确保 `docs/design/<feature>/` 存在
   - 如果目录已有 `ui-understanding.md`,先读取并询问是覆盖、补充还是暂停

3. **读取 phase A 产物**
   - 读取 `docs/design/<feature>/clarified-requirement.md`
   - 如果缺失,仍可继续,但必须警告 `requirement_context: partial`
   - 只用 phase A 校准业务语义,不能凭空补 Figma 没观察到的 UI 区域

4. **收集 Figma 输入**
   - 获取 Figma file key
   - 获取 Figma node id
   - 确认 node 是 page、frame 还是局部区域

5. **调用 Figma MCP**
   - 调用 `get_metadata`
   - 调用 `get_design_context`
   - 调用 `get_screenshot`
   - 任何调用失败时停止落盘,提示用户检查 Figma MCP / 权限 / node id

6. **识别页面结构**
   - 从 root node 到主要区域建立层级结构
   - 标出 page / toolbar / section / card / list / table / modal 等 UI 区域
   - 只记录当前 node 范围内可观察到的结构

7. **识别重复模式**
   - 检测 metric cards、lists、tables、tabs、filters、sections 等重复结构
   - 同一模板重复出现时,记录 pattern 和 instance 数
   - 不把重复实例逐个当作独立组件

8. **推断疑似组件**
   - 将视觉区域映射成候选业务组件
   - evidence 必须来自结构、text `characters`、重复布局或截图确认
   - 推断内容标记 `(INFERRED)`

9. **分类 UI 事实**
   - `observed`:Figma 结构、text `characters` 或截图能直接证明
   - `inferred`:由 phase A + Figma 结构共同推断
   - `unknown`:无法稳定判断,必须进入 `Open Questions`

10. **写产物**
    - 使用 [references/ui-understanding-template.md](references/ui-understanding-template.md)
    - 输出 `docs/design/<feature>/ui-understanding.md`
    - 不要在本阶段绑定 API fields

11. **追加 inputs.md**
    - 在 `docs/design/<feature>/inputs.md` 追加一条审计记录
    - 记录 source type、figma file key、node id、timestamp、skill version

12. **输出 review gate**
    - 落盘后打印 review gate,让用户选择:
      - `Proceed`: 进入 phase C-up / C-low
      - `Re-run`: 修改输入后重新执行 phase B
      - `Pause`: 暂停,用户先补充或手动编辑
      - `Exit`: 结束流程

## 输出结构

`docs/design/<feature>/ui-understanding.md` 必须按
[references/ui-understanding-template.md](references/ui-understanding-template.md)
生成。

产物至少包含:

- `Page Structure`
- `Suspected Components`
- `Repeated Patterns`
- `Static / Dynamic UI Guess`
- `Visual Notes`
- `Non-business UI To Ignore`
- `Open Questions`

## inputs.md 记录格式

追加记录建议使用:

```markdown
## <ISO8601> — figma-ui-understand@0.1.0

- source_type: figma_mcp
- feature: <feature>
- figma_file_key: <file_key>
- figma_node_id: <node_id>
- output: ui-understanding.md
- notes: requirement_context=<complete|partial>, screenshot_checked=<true|false>
```

## 自查规则

skill 在产物落盘后,应输出以下自查信息供 orchestrator 的 review gate 使用:

| Check | Warning |
|---|---|
| `Page Structure` empty | "Page Structure 缺失,不能进入 Phase C-low" |
| `Suspected Components` empty | "Suspected Components 缺失,建议 review 后再继续" |
| missing screenshot confirmation | "未使用截图校验整体结构,建议补充 get_screenshot" |
| `node.name` used as copy source | "检测到 node.name 被当作真实文案,需改用 characters" |
| any template placeholder marker remains | "产物仍含模板占位,orchestrator 会视为未完成" |

## 错误处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 拒绝执行,提示补充 `feature=<feature-name>` |
| Figma file key / node id 缺失 | 向用户索取后继续 |
| `clarified-requirement.md` 缺失 | 警告并标记 `requirement_context: partial`,可继续 |
| Figma MCP 调用失败 | 透传错误,产物不落盘 |
| 截图与 metadata 结构明显不一致 | 写入 `Open Questions`,提示人工核对 |

## 不要做的事

- 不做 API 字段绑定
- 不读取传入 node 之外的兄弟页面或 frame
- 不把 `node.name` 当作真实业务文案
- 不修改 `clarified-requirement.md`
- 不生成 `api-mapping.md` / `component-mapping.md`
- 不修改业务代码
- 不下载 Figma 资源
- 不输出 raw Figma JSON

## 下游衔接

本 skill 的产物会被后续 phase 读取:

- **phase C-up `figma-api-first`** — 参考页面结构和疑似动态 UI,生成接口优先的字段草案
- **phase C-low `figma-ui-api-mapper`** — 读取 `Suspected Components`、`Repeated Patterns` 和 `Static / Dynamic UI Guess`,再结合 API mapping 产出 `component-mapping.md`
- **phase E `figma-emit-spec`** — 读取 UI 结构和开放问题,合成最终 implementation spec
