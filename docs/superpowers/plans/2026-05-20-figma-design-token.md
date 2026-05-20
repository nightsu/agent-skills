# Plan P2: `figma-design-token` Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建 `figma-design-token` skill(figma-workflow-suite phase D),从 Figma node 抽取视觉 token + 资源引用,输出 `design-token-patch.md`。

**Architecture:** 全新 skill(不是迁移),目录骨架与 P1 `figma-ui-api-mapper` 一致(SKILL.md + agents/openai.yaml + references/ + tests/fixtures/)。skill 是 markdown 指引文档,无代码。

**Tech Stack:** Markdown、YAML frontmatter、bash(git checkout / commit)、人工 review 验证 fixture。

**Spec source:**
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/04b-design-token.md`(主契约)
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/05-review-gate-and-handoff.md`(自查规则用于 review gate)
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/02-file-layout.md`(产物路径约定)

**Prerequisites for the engineer:**
- 已 cd 到 `/Users/su/codeHub/github/agent-skills/`
- 已熟悉 P1 的 `figma-ui-api-mapper/` 目录结构(本 plan 沿用同样结构)
- 已读 spec §4b、§5、§2

**Companion files:**
- 附录 A(fixture 内容):[2026-05-20-figma-design-token-appendix-a-fixture.md](./2026-05-20-figma-design-token-appendix-a-fixture.md)

---

## File Structure

**Final layout after this plan:**

```
github/agent-skills/figma-design-token/                  # ← 新建
├── SKILL.md                                             # ← 新建,主指引
├── README.md                                            # ← 新建,仓库门面
├── agents/
│   └── openai.yaml                                      # ← 新建
├── references/
│   └── token-extraction.md                              # ← 新建,token 抽取细节
└── tests/
    └── fixtures/
        └── referral-home/                               # ← 新建,对齐 spec §4b 示例
            ├── README.md
            ├── inputs/
            │   ├── component-mapping.md                 # 模拟 phase C-low 产物
            │   └── figma-node.json                      # 模拟 Figma MCP 输出
            └── expected/
                └── design-token-patch.md                # 期望产物
```

**也修改这些项目级文件:**

```
.claude-plugin/marketplace.json                          # ← 注册新 skill 路径
AGENTS.md                                                # ← 加 skill 清单条目
README.md                                                # ← 加 skill 清单条目
```

**Files responsibilities:**

| File | Responsibility |
|---|---|
| `SKILL.md` | Skill 主指引,Agent 调用时读它就能完整知道做什么、读什么、写什么 |
| `README.md` | 仓库门面,说明 skill 是 figma-workflow-suite 的 phase D |
| `agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `references/token-extraction.md` | 详细抽取规则(字体名陷阱、INFERRED 判断、variable 关联) |
| `tests/fixtures/referral-home/` | 端到端 fixture,对齐 spec §4b 的 referral-home 示例 |

**File 划分理由:**
- SKILL.md 保持 ≤300 行,token 抽取细节(陷阱列表、边界场景)放参考文档
- fixture 用 referral-home(对齐 spec §4b 现有示例,等于把 spec 落地为可执行 baseline)

---

## Task List

- [ ] **Task 1:** 新建分支 + 建立 `figma-design-token/` 目录骨架
- [ ] **Task 2:** 写 `SKILL.md`(全新,主指引)
- [ ] **Task 3:** 写 `agents/openai.yaml`
- [ ] **Task 4:** 写 `README.md`(仓库门面)
- [ ] **Task 5:** 写 `references/token-extraction.md`(抽取细节)
- [ ] **Task 6:** 新增 `tests/fixtures/referral-home/` 回归 fixture
- [ ] **Task 7:** 人工 review fixture vs spec §4b 示例的语义等价
- [ ] **Task 8:** 注册新 skill 到项目级 `marketplace.json` + `AGENTS.md` + `README.md`
- [ ] **Task 9:** Final review + 停在 commit 处不 push

---

### Task 1: 新建分支 + 建立 `figma-design-token/` 目录骨架

**Files:**
- Create dir: `figma-design-token/`
- Create dir: `figma-design-token/agents/`
- Create dir: `figma-design-token/references/`
- Create dir: `figma-design-token/tests/fixtures/referral-home/inputs/`
- Create dir: `figma-design-token/tests/fixtures/referral-home/expected/`

- [ ] **Step 1: 确认当前分支并新建 plan 工作分支**

Run:
```bash
cd /Users/su/codeHub/github/agent-skills
git status
git fetch origin
git checkout -b feat/figma-design-token docs/figma-workflow-suite-design
```

Expected: 新分支 `feat/figma-design-token` 创建,基于 `docs/figma-workflow-suite-design`,工作树干净。

> **注意:** 如果 P1 PR 已 merge 回 `docs/figma-workflow-suite-design`,本分支会自动包含 P1 的所有改动(`figma-ui-api-mapper/` 已存在等)。这是预期的。

- [ ] **Step 2: 建立目录骨架**

Run:
```bash
mkdir -p figma-design-token/agents \
         figma-design-token/references \
         figma-design-token/tests/fixtures/referral-home/inputs \
         figma-design-token/tests/fixtures/referral-home/expected
ls -la figma-design-token/
```

Expected: 目录 `figma-design-token/` 含 `agents/`, `references/`, `tests/` 三个子目录。

- [ ] **Step 3: 不 commit(空目录 git 不追踪)**

不在本任务 commit。等 Task 2~6 写入文件后,自然有文件可 commit。

---

### Task 2: 写 `SKILL.md`(全新,主指引)

**Files:**
- Create: `figma-design-token/SKILL.md`

按 spec §4b SKILL.md 章节清单(8 项),完整写入新文件。

- [ ] **Step 1: 写入完整内容**

写入以下完整内容到 `figma-design-token/SKILL.md`:

````markdown
---
name: figma-design-token
description: figma-workflow-suite 的 phase D 组件。从指定 Figma node 抽取视觉 token(尺寸 / 字体 / 字重 / 色值 / 间距 / 圆角 / 资源引用),输出 design-token-patch.md。
---

# Figma Design Token

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的一部分,处于 **phase D**:

```
phase A → phase B → phase C-up → phase C-low → [phase D: figma-design-token] → phase E
                                  component-mapping.md  ↓                       emit-spec
                                                        design-token-patch.md
```

可以通过两种方式调用:

- **由 orchestrator 调用** —— `figma-workflow feature=<name>` 在 phase D 自动路由到本 skill
- **独立调用** —— 用户直接调用本 skill,传入 `feature` 参数

参见 spec:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/04b-design-token.md`

## Prerequisites

执行本 skill 前,以下上游产物必须存在且非占位:

- `docs/design/<feature>/component-mapping.md`(phase C-low 产物,标明业务模块)

以及用户提供:

- Figma file key
- Figma node id(形如 `123:456`,可复用 phase C-low 的值)

## Calling convention

```
figma-design-token feature=<feature-name>
```

`feature=` 必传。orchestrator 调用时还会注入 `figma_file_key` 和 `figma_node_id`,
独立调用时本 skill 会向用户索取这两个值。

## 适用场景

- 已完成 phase C-low(`component-mapping.md` 就绪),需要补充视觉 token 细节
- 设计稿使用了 Figma variables,希望抽取并关联到模块
- 需要列出图片/icon 等资源的引用清单(本 skill 只给引用,不下载)
- 准备进入 phase E 合成 `implementation-spec.md`,需要 design-token-patch 作为视觉事实输入

## 目标

本 skill **只补充精确视觉信息**:
- 模块尺寸、padding、margin、gap
- 字体大小、字重、行高
- 色值、background、border、shadow
- 圆角、border-radius
- Figma variables 引用(自动关联到使用它的模块)
- 资源(图片/icon)的 node id + 推荐导出格式

**不**承担:
- 语义推断(node 是 api_bound 还是 ui_static —— 那是 phase C-low `figma-ui-api-mapper` 的事)
- 接口字段映射
- 抽取 `api_bound` 节点的文本内容(防止把样例数据当成业务事实)
- 资源实际下载

## 工作流

1. **读取上游产物**
   - `docs/design/<feature>/component-mapping.md` — 知道有哪些 module 需要抽 token
   - 缺失或为模板占位,**拒绝执行**,提示用户先完成 phase C-low

2. **获取 Figma 数据**
   - 调用 Figma MCP `get_variable_defs` 获取该 node 关联的 variables
   - 调用 Figma MCP `get_design_context` 获取节点视觉细节
   - 严格只读传入的 node 及其子节点,不读取兄弟 frame、不扩散到整个文件

3. **逐 module 抽取 token**
   - 对 `component-mapping.md` 的每个 `### <ModuleName>` 子节,
     在 Figma 节点中定位对应子树,抽取视觉 token
   - 字体名陷阱:`Inter` 字重写 `"Semi Bold"`(有空格),不是 `"SemiBold"`,同理 `"Extra Bold"`
   - 详见 `references/token-extraction.md`

4. **关联 variables**
   - 对每个 token,判断是否来自 Figma variable
   - 是 → `Source` 列写 `variable: <name>`,同时在 `## Variables` 段记录该 variable 的所有使用方
   - 否 → `Source` 列写 `direct`

5. **判定 INFERRED**
   - 某些 token(如网格 `columnCount`)Figma 不直接给,需从节点数量推断
   - 推断的 token `Source` 列写 `INFERRED (<推断依据>)`,在 self-check 中爆警告

6. **抽取 assets 引用**
   - 对类型为 `IMAGE` 或 `VECTOR`(带 imageRef)的节点,记入 `## Assets` 表
   - 推荐导出格式:icon → svg,照片 → png,纯色背景 → 跳过
   - **不下载**,只输出 node id + suggested export

7. **写产物**
   - 输出 `docs/design/<feature>/design-token-patch.md`(格式见下"输出结构")
   - 在 `docs/design/<feature>/inputs.md` 追加一条记录
     (含 figma_file_key, node_id, exported assets references, token_version)

## 输出结构

产物 `design-token-patch.md` 格式如下:

```markdown
# Design Token Patch — <feature>

> Generated by figma-design-token@<version> at <ISO8601>
> Source: figma file=<file_key> node=<node_id> (<node_name>)

## Page Metrics
| Item | Value |
|---|---|
| Design width | 375px |
| Page padding | 12px |
| Section gap | 16px |

## Module Tokens

### <ModuleName>
| Token | Value | Source |
|---|---|---|
| ... | ... | ... |

## Variables (from Figma variables)
| Name | Value | Used by |
|---|---|---|
| ... | ... | ... |

## Assets
| Asset | Node ID | Usage | Suggested Export |
|---|---|---|---|
| ... | ... | ... | ... |

## Ignored
- StatusBar / HomeIndicator / 装饰背景(已在 component-mapping 阶段过滤)
```

**格式约定:**
- 每个 module 与 `component-mapping.md` 的 module 名**一一对应**
- `Source` 列三种取值:
  - `direct` — 直接从 Figma 节点读出
  - `variable: <name>` — 关联到一个 Figma variable
  - `INFERRED (<原因>)` — 推断而非 Figma 直接给出
- assets 只输出**引用**(node id + 推荐格式),**不下载**

## 关键行为

1. 严格只读传入 node 及其子节点,**不扩散**
2. 对 `component-mapping.md` 中标记为 `api_bound` 的节点,**只抽取 token,不抽取文本内容**
3. 抽取 Figma variables 时,关联到使用它的模块
4. assets 只输出引用,**不下载**
5. 字体名陷阱:`Inter` 字重 `"Semi Bold"` / `"Extra Bold"`(有空格)

## 自查规则

skill 在产物落盘后,应输出以下自查信息供 orchestrator 的 review gate 使用:

| 项 | 阈值 | 提示文案 |
|---|---|---|
| `Source: INFERRED` token 数 | > 0 | "N 个 token 标记为 INFERRED,建议人工核对" |
| `component-mapping.md` 出现但本产物未抽 token 的 module 数 | > 0 | "N 个 module 在 component-mapping 出现但本产物缺 token: [...]" |
| Figma variable 数 | > 0 | ℹ "N 个 Figma variable 被关联"(仅信息) |

自查**不阻塞**产物落盘,只是提示。

## 错误处理

| 情况 | 处理 |
|---|---|
| Figma MCP 调用失败 | 透传错误,产物**不落盘** |
| node id 在文件中找不到 | 报错并提示用户确认 URL 是否正确 |
| `component-mapping.md` 缺失 / 是模板占位 | 拒绝执行,提示用户先完成 phase C-low |
| component-mapping 中存在的 module 在 Figma 节点中找不到对应子节点 | 在 `## Module Tokens` 段列空表 + 写入 self-check 警告;**不阻塞**产物落盘 |
| Figma variable 解析失败 | 该 token 标 `Source: direct (variable resolve failed)`,值仍写入 |

## 不要做的事

- ❌ 不做节点分类(那是 `figma-ui-api-mapper`)
- ❌ 不下载图片资源(只给引用)
- ❌ 不读取整个 Figma 文件,不读兄弟 frame
- ❌ 不抽取 `ui_copy` 节点的文本内容(那些应该用户来约定)
- ❌ 不修改 `component-mapping.md`
- ❌ 不输出 raw Figma JSON

## 下游衔接

本 skill 的产物 `design-token-patch.md` 的下游消费者:

- **`figma-emit-spec`(phase E)** — 读取本产物的 module token 表,合并到 `implementation-spec.md` 的 `### N. <ModuleName>` 的 `**Design Tokens**` 子段;读取 Variables / Assets 段提供完整视觉上下文

## 参考

- 抽取细节:[references/token-extraction.md](references/token-extraction.md)
- Spec:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/04b-design-token.md`
- Suite README:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
````

把上面整段完整写入 `figma-design-token/SKILL.md`。

- [ ] **Step 2: 验证文件落盘**

Run:
```bash
wc -l figma-design-token/SKILL.md
head -5 figma-design-token/SKILL.md
```

Expected:
- 行数大致在 200~250 行之间
- 头 5 行是 frontmatter,`name: figma-design-token`

- [ ] **Step 3: Commit**

```bash
git add figma-design-token/SKILL.md
git commit -m "feat(figma-design-token): add SKILL.md for phase D

New skill for figma-workflow-suite phase D. Extracts visual tokens
(sizes / fonts / colors / spacing / radius / asset refs) from a Figma
node and emits design-token-patch.md.

- Reads component-mapping.md (phase C-low product) to know which modules
  to extract tokens for
- Calls Figma MCP get_variable_defs + get_design_context
- Source column: direct / variable: <name> / INFERRED (<reason>)
- Assets: refs only, no download (MVP)

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 2
"
```

---

### Task 3: 写 `agents/openai.yaml`

**Files:**
- Create: `figma-design-token/agents/openai.yaml`

- [ ] **Step 1: 写入新文件**

写入以下完整内容到 `figma-design-token/agents/openai.yaml`:

```yaml
interface:
  display_name: "Figma Design Token"
  short_description: "从 Figma node 抽取视觉 token,输出 design-token-patch.md"
  default_prompt: "使用 $figma-design-token 读取 docs/design/<feature>/component-mapping.md,对每个 module 从 Figma node 抽取视觉 token(尺寸 / 字体 / 字重 / 色值 / 间距 / 圆角 / 资源引用),关联 Figma variables,输出 docs/design/<feature>/design-token-patch.md 并在 inputs.md 追加一条记录。"
```

- [ ] **Step 2: 验证 yaml 格式**

Run:
```bash
ruby -ryaml -e "d = YAML.load_file('figma-design-token/agents/openai.yaml'); puts d['interface']['display_name']"
```

Expected: 打印 `Figma Design Token`,无 yaml 异常。

- [ ] **Step 3: Commit**

```bash
git add figma-design-token/agents/openai.yaml
git commit -m "feat(figma-design-token): add agents/openai.yaml

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 3
"
```

---

### Task 4: 写 `README.md`(仓库门面)

**Files:**
- Create: `figma-design-token/README.md`

- [ ] **Step 1: 写入新文件**

写入以下完整内容到 `figma-design-token/README.md`:

```markdown
# figma-design-token

Part of the **figma-workflow-suite** —— phase D.
读取上游 `component-mapping.md` + 用户提供的 Figma node,
从节点抽取视觉 token(尺寸 / 字体 / 字重 / 色值 / 间距 / 圆角 / 资源引用),
输出可审阅的 `design-token-patch.md`。

## Quick start

调用 skill:

```
figma-design-token feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase D 自动路由调用)

## Prerequisites

`docs/design/<feature>/` 目录下必须已有:
- `component-mapping.md`(phase C-low 产物)

以及 Figma file key + node id。

## Outputs

- `docs/design/<feature>/design-token-patch.md` — 主产物
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- Token 抽取细节(陷阱、INFERRED 判定):[references/token-extraction.md](./references/token-extraction.md)
- 端到端 fixture:[tests/fixtures/referral-home/](./tests/fixtures/referral-home/)

## 上下游

```
phase C-low                 →  figma-design-token      →  phase E
component-mapping.md          design-token-patch.md      figma-emit-spec
                                                          implementation-spec.md
```

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
```

- [ ] **Step 2: Commit**

```bash
git add figma-design-token/README.md
git commit -m "docs(figma-design-token): add README.md as repository entry

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 4
"
```

---

### Task 5: 写 `references/token-extraction.md`(抽取细节)

**Files:**
- Create: `figma-design-token/references/token-extraction.md`

- [ ] **Step 1: 写入新文件**

写入以下完整内容到 `figma-design-token/references/token-extraction.md`:

```markdown
# Token 抽取细节

本文档补充 `SKILL.md` 中的抽取规则,重点放在陷阱、边界场景和 INFERRED 判定,不重复主流程。

## 字体名陷阱

Figma 中字体的 `style` 字段在不同字族下命名不一致,常见陷阱:

| 字族 | 错误写法 | 正确写法 |
|---|---|---|
| Inter | `SemiBold` | `Semi Bold`(有空格) |
| Inter | `ExtraBold` | `Extra Bold`(有空格) |
| SF Pro | `Heavy` | `Heavy`(无空格,正确) |
| 苹方 / PingFang | `Regular` | `Regular`(无空格,正确) |

抽 token 时**原样保留 Figma 返回的字符串**,不做大小写转换、不做空格归一化。

## Source 列判定规则

| 取值 | 判定条件 |
|---|---|
| `direct` | 从 Figma 节点的 `style` / `fills` / `strokes` / `effects` 直接读出 |
| `variable: <name>` | 节点属性绑定到一个 Figma variable(via `boundVariables`) |
| `INFERRED (<原因>)` | 节点本身不直接给出,从结构推断而来(如网格列数、列表行数) |

**判定优先级:** variable > direct > INFERRED。
同一个 token 既能 direct 读又被 variable 绑定时,优先标 variable(因为 variable 是设计意图)。

## INFERRED 的常见场景

- `columnCount`(网格列数)— Figma 不直接给,从子节点数量推断
- `rowGap` / `columnGap`(在没用 Auto Layout 的页面)— 从子节点位置间距推断
- `itemMinHeight`(列表项最小高度)— 从多个实例的最小高度推断
- `lineHeight`(部分 Figma 版本不导出)— 从文本节点高度 / fontSize 反推

**所有 INFERRED 必须在 `Source` 列写明推断依据**,例如:
- `INFERRED (4-instance grid)`
- `INFERRED (gap between siblings)`
- `INFERRED (min height across 3 list items)`

## Variables 段的填充

`## Variables` 段汇总所有被关联的 Figma variables。每条记录:

```
| color/brand/primary | #FF6A3D | DiamondPreviewCard.valueColor |
```

- `Name` 列:Figma variable 的 collection/name(原样保留斜杠)
- `Value` 列:解析后的值(色值用 `#RRGGBB`,间距用 `Npx`)
- `Used by` 列:用 `<ModuleName>.<tokenName>` 格式列出**所有**使用方,多个用换行分隔

如果一个 variable 被多个 module 使用,`Used by` 多行:

```
| color/brand/primary | #FF6A3D | DiamondPreviewCard.valueColor<br>BannerCarousel.indicatorActive |
```

## Assets 段的填充

只对**实际承载视觉资源**的节点出条目:
- `IMAGE` 填充的 RECTANGLE / FRAME
- `VECTOR` 节点(icon)
- 带 imageRef 的 BOOLEAN_OPERATION

**不出条目**的情况:
- 纯色填充的容器(`Suggested Export` 留 `—`,或直接跳过)
- 装饰背景(在 phase C-low `Ignored Nodes` 中已过滤)

**推荐导出格式:**

| 资源类型 | 推荐格式 |
|---|---|
| 照片(banner / cover) | png |
| icon(几何图形) | svg |
| 复杂插画 | svg(若失真则 png) |
| 渐变 / 纯色 | 跳过,用 CSS 实现 |

## Component-mapping 与 design-token 对齐

`design-token-patch.md` 的每个 `### <ModuleName>` **必须**对应 `component-mapping.md` 的同名 module。

**对齐规则:**
- module 名**原样**复制,不做改写
- module 名顺序与 `component-mapping.md` 保持一致
- 若 component-mapping 有但本产物找不到对应节点,**仍要列出该 module**,表格留空 + self-check 警告

## 不要做的事

- ❌ 不抽取 `api_bound` 节点的文本内容(那是样例数据)
- ❌ 不下载资源(MVP 阶段只给引用)
- ❌ 不读取整个 Figma 文件,不读兄弟 frame
- ❌ 不归一化字体名(原样保留)
- ❌ 不修改上游 `component-mapping.md`
```

- [ ] **Step 2: Commit**

```bash
git add figma-design-token/references/token-extraction.md
git commit -m "docs(figma-design-token): add references/token-extraction.md

Detailed extraction rules: font name pitfalls, Source column judgment,
INFERRED criteria, Variables/Assets segment formatting, alignment with
upstream component-mapping.md.

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 5
"
```

---

### Task 6: 新增 `tests/fixtures/referral-home/` 回归 fixture

**Files:**
- Create: `figma-design-token/tests/fixtures/referral-home/README.md`
- Create: `figma-design-token/tests/fixtures/referral-home/inputs/component-mapping.md`
- Create: `figma-design-token/tests/fixtures/referral-home/inputs/figma-node.json`
- Create: `figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md`

> 各文件**完整内容**在附录 A:[2026-05-20-figma-design-token-appendix-a-fixture.md](./2026-05-20-figma-design-token-appendix-a-fixture.md)

- [ ] **Step 1: 创建目录**

Run:
```bash
ls figma-design-token/tests/fixtures/referral-home/
```

Expected: 目录已在 Task 1 创建,看到 `expected/` 和 `inputs/` 两个空子目录。

- [ ] **Step 2: 写 `fixtures/referral-home/README.md`**

打开附录 §A1,把 fenced code 块内**完整内容**写入对应文件。

- [ ] **Step 3: 写 `inputs/component-mapping.md`**

打开附录 §A2,完整内容写入对应文件。

- [ ] **Step 4: 写 `inputs/figma-node.json`**

打开附录 §A3,完整内容写入对应文件。

- [ ] **Step 5: 写 `expected/design-token-patch.md`**

打开附录 §A4,完整内容写入对应文件。

- [ ] **Step 6: 验证文件结构**

Run:
```bash
find figma-design-token/tests/fixtures -type f | sort
```

Expected:
```
figma-design-token/tests/fixtures/referral-home/README.md
figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md
figma-design-token/tests/fixtures/referral-home/inputs/component-mapping.md
figma-design-token/tests/fixtures/referral-home/inputs/figma-node.json
```

- [ ] **Step 7: 验证 JSON 合法**

Run:
```bash
python3 -c "import json; json.load(open('figma-design-token/tests/fixtures/referral-home/inputs/figma-node.json')); print('JSON OK')"
```

Expected: `JSON OK`(说明 JSON 合法)。

- [ ] **Step 8: Commit**

```bash
git add figma-design-token/tests/
git commit -m "test(figma-design-token): add referral-home regression fixture

Mirrors the spec §4b end-to-end example. Provides:
- 1 mock upstream component-mapping.md (3 modules)
- 1 mock Figma node JSON with variables + assets
- 1 expected design-token-patch.md as baseline

MVP validation: manual review (diff). Future: LLM-as-judge.

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 6
"
```

---

### Task 7: 人工 review fixture vs spec §4b 示例的语义等价

**这一任务由人执行,不写代码,不调 skill。**

- [ ] **Step 1: 打开 spec §4b 示例**

```bash
sed -n '/^## 产物格式/,/^## 关键行为/p' \
  docs/superpowers/specs/2026-05-20-figma-workflow-suite/04b-design-token.md \
  | head -80
```

定位到 spec §4b 的 `## 产物格式` 章节内的 fenced markdown 示例。

- [ ] **Step 2: 对比检查清单**

逐项确认 `figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md` 是否包含:

- [ ] 至少这些 module:`DiamondPreviewCard`、`OperationEntryGrid`
- [ ] `DiamondPreviewCard` 至少含 `borderRadius=12px`、`padding=12px 16px`、`titleFontSize=14px`、`valueFontSize=24px`
- [ ] `OperationEntryGrid` 至少含 `columnCount=4 (INFERRED)`、`itemGap=8px`、`iconSize=32px`、`labelFontSize=12px`
- [ ] 至少 1 个 token 标 `Source: variable: <name>`,与 `## Variables` 段对应
- [ ] 至少 1 个 token 标 `Source: INFERRED (<原因>)`
- [ ] `## Assets` 至少 2 条(banner_image + 一个 icon)

发现不一致 → 直接修 `expected/design-token-patch.md`,使其与 spec 示例语义对齐。

- [ ] **Step 3: 如有改动 → Commit**

```bash
# 若 Step 2 修了文件
git add figma-design-token/tests/fixtures/referral-home/expected/design-token-patch.md
git commit -m "test(figma-design-token): align fixture expected with spec §4b example

Manual review found expected/design-token-patch.md drift from spec §4b
referral-home example. Re-aligned.

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 7
"

# 若 Step 2 未修(完全等价),本任务无 commit
```

---

### Task 8: 注册新 skill 到项目级 `marketplace.json` + `AGENTS.md` + `README.md`

**Files:**
- Modify: `.claude-plugin/marketplace.json`(加 `./figma-design-token` 到 skills 数组)
- Modify: `AGENTS.md`(加 skill 清单条目)
- Modify: `README.md`(加 skill 清单条目)

- [ ] **Step 1: 修 `.claude-plugin/marketplace.json`**

读当前文件:
```bash
cat .claude-plugin/marketplace.json
```

把 `skills` 数组中**位置**合适处(可放 `./figma-ui-api-mapper` 之后)加入 `"./figma-design-token"`。

例如,如果当前 skills 数组是(顺序按 P1 已合并后的状态):
```json
"skills": [
  "./document-analysis",
  "./figma-ui-api-mapper",
  "./project-interview-analyzer",
  ...
]
```

修改为:
```json
"skills": [
  "./document-analysis",
  "./figma-ui-api-mapper",
  "./figma-design-token",
  "./project-interview-analyzer",
  ...
]
```

(P1 已经把 `figma-api-mapper` 改成 `figma-ui-api-mapper`,本 task 在此基础上插入 `figma-design-token`。)

> **如果 P1 PR 还未 merge 到 `docs/figma-workflow-suite-design`**,marketplace.json 里仍然是 `./figma-api-mapper`,本 task 应在该位置后插入 `./figma-design-token`,**不动** `figma-api-mapper`(P1 PR merge 时会自动改名)。

- [ ] **Step 2: 修 `AGENTS.md`**

在 `## 当前技能` 段(line ~12),`figma-ui-api-mapper`(或 P1 未 merge 时是 `figma-api-mapper`)条目后插入一行:

```markdown
- `figma-design-token`:从 Figma node 抽取视觉 token,输出 design-token-patch.md(figma-workflow-suite 的 phase D)。
```

- [ ] **Step 3: 修 `README.md`**

在 `## 已包含的技能` 段(line ~5),`figma-ui-api-mapper`(或 `figma-api-mapper`)条目后插入一行:

```markdown
- `figma-design-token`:从 Figma node 抽取视觉 token,输出 design-token-patch.md(figma-workflow-suite 的 phase D)
```

- [ ] **Step 4: 验证 3 个文件**

Run:
```bash
git diff --stat .claude-plugin/marketplace.json AGENTS.md README.md
```

Expected: 3 个文件各 +1 行。

Run:
```bash
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
```

Expected: 无输出(JSON 合法)。

- [ ] **Step 5: Commit**

```bash
git add .claude-plugin/marketplace.json AGENTS.md README.md
git commit -m "chore: register figma-design-token in project-level catalogs

- .claude-plugin/marketplace.json: skill path
- AGENTS.md: catalog entry
- README.md: catalog entry

Refs: docs/superpowers/plans/2026-05-20-figma-design-token.md Task 8
"
```

---

### Task 9: Final review + 停在 commit 处不 push

- [ ] **Step 1: 看本 plan 累计 commit**

Run:
```bash
git log --oneline docs/figma-workflow-suite-design..HEAD
```

Expected: 6~8 个 commit(Task 2/3/4/5/6/7/8 中实际有 commit 的任务数)。

- [ ] **Step 2: 验证目录最终状态**

Run:
```bash
ls figma-design-token/
ls figma-design-token/tests/fixtures/referral-home/
```

Expected:
```
README.md  SKILL.md  agents  references  tests
```
```
README.md  expected  inputs
```

- [ ] **Step 3: 验证 SKILL.md 行数 + frontmatter**

Run:
```bash
wc -l figma-design-token/SKILL.md
head -5 figma-design-token/SKILL.md
```

Expected:
- 200~250 行
- `name: figma-design-token`

- [ ] **Step 4: 不 push(等用户授权)**

不执行 `git push`。输出给用户:

```
✅ P2 plan 实施完成。分支 feat/figma-design-token 已 commit 但未 push。

后续动作:
  1. 你 review 本地分支上的 commit
  2. 如 OK,你执行 git push -u origin feat/figma-design-token
  3. 然后你可以选择:
     - 直接 merge / fast-forward 到 docs/figma-workflow-suite-design
     - 或开 PR 走 review 流程
  4. 完成 P2 收口后,我可以开始写 P3 (figma-emit-spec)
```

---

## Self-Review Checklist(写完此 plan 后,我已做过的检查)

- ✅ **Spec coverage:** 对照 spec §4b 的 8 个 SKILL.md 章节清单,Task 2 全部覆盖
- ✅ **Spec coverage:** 对照 spec §4b 的"自查规则"表,SKILL.md 自查规则段已 1:1 复刻
- ✅ **Spec coverage:** 对照 spec §4b 的"产物格式"表,Task 2 SKILL.md 输出结构段一致
- ✅ **Placeholder scan:** 无 "TBD" / "TODO" / "implement later" / "fill in details"
- ✅ **Type consistency:** Markdown 表格列名(`Token`, `Value`, `Source`, `Name`, `Used by`, `Asset`, `Node ID`, `Usage`, `Suggested Export`)在 SKILL.md、references/token-extraction.md、expected fixture 三处完全一致
- ✅ **可独立执行:** 每个 task 的 step 都是 2-5 分钟单动作;commit 频率高;每个 step 含完整可执行内容
- ✅ **错误兜底:** Task 7 含"条件性 commit"(无改动则不 commit)

## Out of Scope(本 plan **不**做)

- ❌ 实现 `figma-emit-spec` skill(P3)
- ❌ 实现 `figma-workflow` orchestrator(P4)
- ❌ 端到端套件 fixture(P5)
- ❌ 资源(图片/icon)实际下载(留到第 2/3 版)
- ❌ LLM-as-judge 自动化验证(第 3 版)
- ❌ 开 PR(本 plan 只 commit,等用户 review 后自己 push)
