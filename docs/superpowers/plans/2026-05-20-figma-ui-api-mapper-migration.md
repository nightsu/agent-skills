# Plan P1: `figma-ui-api-mapper` Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把现有 `figma-api-mapper` skill 改名为 `figma-ui-api-mapper`,改写 SKILL.md 以适配 figma-workflow-suite(读上游 .md 产物、输出 Markdown 表格、明确 phase C-low 定位),并产出一个端到端 fixture 验证回归等价。

**Architecture:** 这是一次"原地重构":目录改名 → SKILL.md 重写 → references 内容保持 → agents/openai.yaml 微调 → 新增 tests/fixtures/ 做回归 + 新增 README.md。**不写代码**(skill 是 markdown 指引文档),改动全是文档。

**Tech Stack:** Markdown、YAML frontmatter、bash(git mv / commit)、人工 review 验证 fixture(MVP 不接 LLM-as-judge)。

**Spec source:**
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/04a-ui-api-mapper.md`
- `docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md` §6.2

**Prerequisites for the engineer:**
- 已 cd 到 `/Users/su/codeHub/github/agent-skills/`
- 已在 `docs/figma-workflow-suite-design` 分支(或新建 P1 工作分支)
- 已读 spec §4a 和 §6.2

---

## File Structure

**Final layout after this plan:**

```
github/agent-skills/figma-ui-api-mapper/         # ← 改名自 figma-api-mapper/
├── SKILL.md                                     # ← 重写
├── README.md                                    # ← 新增(skill 仓库的入口文档)
├── agents/
│   └── openai.yaml                              # ← 改 display_name + default_prompt
├── references/
│   └── classification-and-mapping.md            # ← 内容保持,只调整一处引用
└── tests/
    └── fixtures/
        └── course-list/                         # ← 新增端到端回归 fixture
            ├── README.md                        # 说明本 fixture 的用途
            ├── inputs/
            │   ├── clarified-requirement.md     # 模拟上游产物
            │   ├── ui-understanding.md          # 模拟上游产物
            │   ├── api-mapping.md               # 模拟上游产物
            │   └── figma-node.json              # 模拟 Figma MCP 输出
            └── expected/
                └── component-mapping.md         # 期望产物(沿用现 SKILL.md 课程列表案例,转 markdown)
```

**Files responsibilities (per spec §4a SKILL.md 章节清单):**

| File | Responsibility |
|---|---|
| `SKILL.md` | Skill 主指引;Agent 在调用时读它就能完整知道做什么、读什么、写什么、不做什么 |
| `README.md` | 仓库门面;说明这个 skill 是 figma-workflow-suite 的一部分,链回 spec |
| `agents/openai.yaml` | OpenAI/Codex agent 接入配置 |
| `references/classification-and-mapping.md` | 节点 4 分类的判定细节,被 SKILL.md 引用 |
| `tests/fixtures/course-list/` | 沿用现 SKILL.md "课程列表"案例的端到端 fixture(用于回归验证) |

---

## Task List

- [ ] **Task 1:** 在新分支上 `git mv` 目录改名
- [ ] **Task 2:** 重写 `SKILL.md`(frontmatter + 章节调整)
- [ ] **Task 3:** 微调 `agents/openai.yaml`
- [ ] **Task 4:** 检查 `references/classification-and-mapping.md`(内容保持,只动一处引用)
- [ ] **Task 5:** 新增 `README.md`(仓库门面)
- [ ] **Task 6:** 新增 `tests/fixtures/course-list/` 回归 fixture
- [ ] **Task 7:** 人工 review fixture,确认期望产物与现 SKILL.md "课程列表"案例**语义等价**
- [ ] **Task 8:** 扫描代码库内对旧名 `figma-api-mapper` 的引用并修补
- [ ] **Task 9:** Final commit(整合所有改动)+ push 分支

---

### Task 1: 在新分支上 `git mv` 目录改名

**Files:**
- Rename: `figma-api-mapper/` → `figma-ui-api-mapper/`

- [ ] **Step 1: 确认当前分支并新建 plan 工作分支**

Run:
```bash
cd /Users/su/codeHub/github/agent-skills
git status
git checkout -b feat/figma-ui-api-mapper-migration docs/figma-workflow-suite-design
```

Expected: 新分支 `feat/figma-ui-api-mapper-migration` 创建,基于 `docs/figma-workflow-suite-design`,工作树干净(spec 已 commit)。

- [ ] **Step 2: 用 `git mv` 改名目录**

Run:
```bash
git mv figma-api-mapper figma-ui-api-mapper
git status
```

Expected:
```
renamed:    figma-api-mapper/SKILL.md -> figma-ui-api-mapper/SKILL.md
renamed:    figma-api-mapper/agents/openai.yaml -> figma-ui-api-mapper/agents/openai.yaml
renamed:    figma-api-mapper/references/classification-and-mapping.md -> figma-ui-api-mapper/references/classification-and-mapping.md
```

- [ ] **Step 3: Commit 改名(单独一个 commit,保留 git rename detection)**

```bash
git commit -m "refactor: rename figma-api-mapper → figma-ui-api-mapper

Part of figma-workflow-suite migration. See:
- docs/superpowers/specs/2026-05-20-figma-workflow-suite/06-testing-migration-risks.md §6.2
- docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 1
"
```

Expected: commit 成功,3 文件 renamed(git 自动识别为 rename,而非 delete+add)。

---

### Task 2: 重写 `SKILL.md`

**Files:**
- Modify: `figma-ui-api-mapper/SKILL.md`(完全重写)

按 spec §4a 的章节清单,重写后的 `SKILL.md` 应有这些段落(顺序保持):

1. Frontmatter(`name` 改为 `figma-ui-api-mapper`,`description` 调整)
2. 顶部 `> ⚠ Renamed from figma-api-mapper. Old name no longer works.`
3. `## Position in figma-workflow`
4. `## Prerequisites`
5. `## 适用场景`(保持)
6. `## 目标`(微调:强调输出对接 figma-workflow-suite)
7. `## 输入方式`(保持)
8. `## 工作流`(保持 8 步,补"读取上游 .md 产物")
9. `## 接口文档接入约定`(保持)
10. `## 置信度规则`(保持)
11. `## 输出结构`(**从 JSON 改为 Markdown 表格**)
12. `## 端到端示例`(沿用课程列表,产出格式同步改为 Markdown 表格)
13. `## 判定规则`(保持)
14. `## 自查规则`(**新增**,对应 spec §4a 的 self-check 表)
15. `## 下游衔接`(改:指向 `figma-design-token` 和 `figma-emit-spec`)
16. `## 不要做的事`(保持)
17. `## 参考`(保持)

- [ ] **Step 1: 写出完整的新 SKILL.md**

新文件内容如下(完整内容,**不要省略任何段落**;后续 step 不会再补):

```markdown
---
name: figma-ui-api-mapper
description: figma-workflow-suite 的 phase C-low 组件。合并上游 api-mapping.md 与 Figma node,清理非业务噪音,区分 api_bound / ui_static / ui_copy / unknown,输出可审阅的 component-mapping.md。
---

> ⚠ **Renamed from `figma-api-mapper`. Old name no longer works.**

# Figma UI-API 映射器

## Position in figma-workflow

本 skill 是 `figma-workflow-suite` 的一部分,处于 **phase C-low**(阶段 C 下半段):

```
phase A → phase B → phase C-up → [phase C-low: figma-ui-api-mapper] → phase D → phase E
                    api-mapping.md  ↓                                    design-token  emit-spec
                                    component-mapping.md
```

可以通过两种方式调用:

- **由 orchestrator 调用** —— `figma-workflow feature=<name>` 在 phase C-low 自动路由到本 skill,
  传入 `feature` 参数,本 skill 按约定路径读上游产物 + 写产物
- **独立调用** —— 用户直接调用本 skill,传入 `feature` 参数,行为等价(skill 自己按约定路径读写)

参见 spec:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/04a-ui-api-mapper.md`

## Prerequisites

执行本 skill 前,以下上游产物必须存在且非占位:

- `docs/design/<feature>/clarified-requirement.md`
- `docs/design/<feature>/ui-understanding.md`
- `docs/design/<feature>/api-mapping.md`

以及用户提供:

- Figma file key
- Figma node id(形如 `123:456`)
- (可选)`max_depth`:节点遍历最大深度,默认 6
- (可选)`exclude_patterns`:节点名忽略正则列表;默认沿用 IGNORE_NAME_PATTERNS

## 适用场景

- 需要从 Figma 页面或 Frame 中提取业务结构
- 页面里有状态栏、导航壳、装饰层等非业务节点,需要先清理
- 设计稿里混有接口字段、固定文案和图片资源,需要区分哪些应该走数据绑定
- 已有 YAPI 或其他接口文档(已落到 `api-mapping.md`),希望把设计稿和接口字段做结构化映射

## 目标

这个技能的目标不是把接口内容"画进"设计稿,而是先把 Figma 里真正有业务意义的部分抽出来,
再判断哪些节点应该来自接口,哪些只是静态 UI 或 UI 文案,最终产出供 `figma-emit-spec`
合成 `implementation-spec.md` 使用的 `component-mapping.md`。

如果存在不确定的节点,技能不会强行猜测,而是把它们保留在 "Open Questions" 段,
由 `figma-emit-spec` 汇总到 `open-questions.md`,交给用户调整。

## 输入方式

优先按下面顺序接收输入,拿到其中一种即可开始:

1. Figma MCP 或其他结构化节点数据
   - 适用于已经能直接读取 page、frame、selection 节点树的场景
   - 优先使用节点名称、层级、重复模式、文本内容、图片引用和组件关系做判断

2. 用户提供的 Figma 导出 JSON
   - 适用于用户手动导出节点树、页面结构或 inspect 数据的场景
   - 如果字段很多,先只关注节点层级、文本、图片、组件和命名信息

3. 截图或局部截图
   - 只在拿不到结构化数据时使用
   - 视觉分析只能作为补充证据,不能替代节点结构;如果截图不足以稳定判断,明确标成 `unknown`

如果同时有结构化节点和截图,以结构化节点为主,截图只用来补充语义和视觉上下文。

## 工作流

1. **读取上游产物**
   - `docs/design/<feature>/clarified-requirement.md` — 用于理解业务语义
   - `docs/design/<feature>/ui-understanding.md` — 用于对齐推测组件
   - `docs/design/<feature>/api-mapping.md` — 用于字段匹配
   - 任一缺失或为模板占位,**拒绝执行**,提示用户先完成上游

2. **获取 Figma 数据**
   - 先确认用户给的是 page、frame、局部区域,还是截图
   - 严格只读传入的 node,不读取兄弟 frame、不扩散到整个文件

3. **确定范围**
   - 从用户选中的 page、frame 或局部区域开始
   - 忽略目标范围之外的页面和装饰层

4. **清理非业务节点**
   - 去掉状态栏、导航壳、分割线、空容器、背景装饰等
   - 只在它们有助于解释业务结构时保留布局信息

5. **识别重复模式**
   - 先找列表、卡片、表格、宫格、评论流等重复组件
   - 同一模板重复出现时,优先抽象成一个模板节点,标 `repeat_group`
   - 不要为同一种卡片的每个实例都重复做一份映射,除非实例结构明显不同

6. **分类有效节点**
   - `api_bound`:用户数据、实体字段、列表项、图片、指标、时间、状态
   - `ui_static`:容器、图标、按钮、间距、阴影、装饰、固定结构
   - `ui_copy`:提示文案、空状态文案、标签、说明、按钮文案
   - `unknown`:无法稳定判断,需要用户确认

7. **对齐接口文档**
   - 用 `api-mapping.md` 中的字段做匹配
   - 优先按角色、位置、重复模式和字段语义做映射
   - 置信度低时不要强行匹配

8. **写产物**
   - 输出 `docs/design/<feature>/component-mapping.md`(格式见下"输出结构")
   - 在 `docs/design/<feature>/inputs.md` 追加一条记录(含 figma_file_key, node_id, node_name, mapper_version)

## 接口文档接入约定

这个技能不绑定某一个接口平台,接口字段统一从上游 `api-mapping.md` 获取。
`api-mapping.md` 的来源可以是 YAPI、Swagger/OpenAPI、后端字段清单、PRD 数据字典等
(MVP 阶段由用户手填,第 2 版由 `figma-api-first` skill 生成)。

接入约束:

- 先完成页面结构整理,再读取 `api-mapping.md`
- 只对 `api_bound` 或 `unknown` 的节点取接口字段
- 不要因为有接口文档就把所有层级都查一遍
- 如果 `api-mapping.md` 缺失某字段示例,先把结构草案输出出来,把待补齐项列到 Open Questions

## 置信度规则

- `0.90` 到 `1.00`:高置信度,可直接进入草案
- `0.70` 到 `0.89`:中等置信度,可保留建议字段,但建议在摘要里提示快速复核
- `< 0.70`:低置信度,**必须**设置 `needs_user_confirmation: true`
- `unknown` 节点默认需要确认,即使置信度高于 `0.70` 也不应自动当成已确定结论

## 输出结构

产物 `component-mapping.md` 使用 Markdown 表格(非 JSON),格式如下:

```markdown
# Component Mapping — <feature>

> Generated by figma-ui-api-mapper@<version> at <ISO8601>
> Source: figma file=<file_key> node=<node_id> (<node_name>)

## Summary

- api_bound: 12
- ui_static: 8
- ui_copy: 5
- unknown: 2
- needs_confirmation: 4

## Modules

### <ModuleName>
| node_id | binding_type | ui_role | api_field | confidence | needs_confirmation | reason | repeat_group |
|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... | ... |

## Open Questions
- node `<id>`: <原因>

## Ignored Nodes
- StatusBar / HomeIndicator / DeviceFrame / 装饰背景
```

**格式约定:**
- 每个 module 一个 `###` 子节,模块名来自 `ui-understanding.md` 的 "Suspected Components" 或推断
- 重复列表项只一行,标 `repeat_group`
- `confidence < 0.7` 自动标 `needs_confirmation: true`
- `unknown` 节点必须出现在 "Open Questions" 段
- "Ignored Nodes" 段汇总被过滤的节点类型(不逐个列)
- `repeat_group` 列**只在含重复列表的 module 表格中出现**,其它 module 表头可省该列

## 端到端示例

### 输入

- Figma 范围:课程列表页中的一个课程卡片区域
- 已知页面元素:
  - 课程封面图
  - 课程标题"少儿美术启蒙"
  - 教师名"王老师"
  - 价格"199 元"
  - 标签"限时优惠"
  - 收藏按钮图标
  - 卡片背景、阴影、圆角
- `api-mapping.md` 中存在课程列表字段:
  - `course.coverUrl`
  - `course.title`
  - `course.teacherName`
  - `course.price`

### 清理与判断

- 卡片背景、阴影、圆角属于 `ui_static`
- 收藏按钮图标本身属于 `ui_static`
- 标签"限时优惠"如果设计稿无法证明它来自接口,先判为 `ui_copy`
- 标题、教师名、价格、封面图属于重复卡片中的业务字段,判为 `api_bound`
- 同类课程卡片重复出现时,只映射一次模板,并标记为列表项

### 输出示例

```markdown
# Component Mapping — course-list

> Generated by figma-ui-api-mapper@0.4.0 at 2026-05-20T15:08:33+08:00
> Source: figma file=AbCdEfG12345 node=123:456 (CourseListPage)

## Summary

- api_bound: 4
- ui_static: 2
- ui_copy: 1
- unknown: 0
- needs_confirmation: 0

## Modules

### CourseCard
| node_id | binding_type | ui_role | api_field | confidence | needs_confirmation | reason | repeat_group |
|---|---|---|---|---|---|---|---|
| course_card_template | ui_static | list_item_container | — | 0.95 | false | — | course_list_item |
| course_cover | api_bound | list_item_image | course.coverUrl | 0.96 | false | — | course_list_item |
| course_title | api_bound | list_item_title | course.title | 0.98 | false | — | course_list_item |
| teacher_name | api_bound | list_item_subtitle | course.teacherName | 0.93 | false | — | course_list_item |
| course_price | api_bound | list_item_price | course.price | 0.97 | false | — | course_list_item |
| promo_tag | ui_copy | badge_copy | — | 0.74 | false | 无证据表明来自接口 | course_list_item |
| favorite_icon | ui_static | action_icon | — | 0.92 | false | — | course_list_item |

## Open Questions
(无)

## Ignored Nodes
- StatusBar / HomeIndicator / 装饰背景
```

## 判定规则

- 如果节点会随着数据变化,优先判为 `api_bound`
- 如果节点主要承担布局或交互壳层作用,优先判为 `ui_static`
- 如果节点是用户可见文案,但不是业务数据,判为 `ui_copy`
- 如果节点可能是两者之一,判为 `unknown` 并要求确认
- 图片优先使用 URL 或资源引用,**不要展开或嵌入图片内容**
- 重复组件优先抽象为模板,再映射模板中的可变字段

## 自查规则

skill 在产物落盘后,应输出以下自查信息供 orchestrator 的 review gate 使用:

| 项 | 阈值 | 提示文案 |
|---|---|---|
| `needs_confirmation: true` 节点数 | > 0 | "N 个节点标记需用户确认" |
| `unknown` 节点数 | > 0 | "N 个节点分类为 unknown,见 Open Questions" |
| 低置信度数(<0.7) | > 0 | "N 个映射置信度 < 0.7" |
| Open Questions 数 | > 0 | "N 个 open question 待回答,建议先回答再进 phase D" |

自查**不阻塞**产物落盘,只是提示。

## 下游衔接

本 skill 的产物 `component-mapping.md` 的下游消费者:

- **`figma-design-token`(phase D)** — 读取本产物的 module 列表,对每个 module 抽视觉 token
- **`figma-emit-spec`(phase E)** — 读取本产物的 module 表格,合并到 `implementation-spec.md` 的 Modules 章节;读取 Open Questions 段,合并到 `open-questions.md`

## 不要做的事

- 不要把每个渲染出来的文字都当成硬编码文本
- 不要强行猜测图片内容
- 不要把组件实例重复映射成多份相同字段
- 不要在拿不到结构化节点时假装视觉分析足够精确
- 不要引入与本技能无关的规范化层
- 不要让用户审核所有节点,只关注高风险和不确定项
- 不要输出 design token(尺寸/字体/色值)→ 那是 `figma-design-token` 的事
- 不要下载资源(只在表格中标注 ui_role)
- 不要读取整个 Figma 文件
- 不要读取兄弟 frame

## 参考

- 节点分类细节:[references/classification-and-mapping.md](references/classification-and-mapping.md)
- Spec:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/04a-ui-api-mapper.md`
- Suite README:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
```

把上面整段完整写入 `figma-ui-api-mapper/SKILL.md`(覆盖)。

- [ ] **Step 2: 验证文件落盘**

Run:
```bash
wc -l figma-ui-api-mapper/SKILL.md
head -5 figma-ui-api-mapper/SKILL.md
```

Expected:
- 行数大致在 220~260 行之间(允许 ±10%)
- 头 5 行是新 frontmatter,`name: figma-ui-api-mapper`

- [ ] **Step 3: Commit**

```bash
git add figma-ui-api-mapper/SKILL.md
git commit -m "feat(figma-ui-api-mapper): rewrite SKILL.md for workflow-suite

- frontmatter: name → figma-ui-api-mapper
- top banner: renamed-from notice
- 新增 Position in figma-workflow 段
- 新增 Prerequisites 段(列出上游产物)
- 工作流 8 步首步改为'读取上游产物',末步明确写 component-mapping.md + inputs.md
- 输出结构: JSON → Markdown 表格
- 端到端示例: 课程列表案例同步改为 Markdown 表格
- 新增 自查规则 段(对应 spec §4a self-check 表)
- 下游衔接: 指向 figma-design-token / figma-emit-spec

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 2
"
```

---

### Task 3: 微调 `agents/openai.yaml`

**Files:**
- Modify: `figma-ui-api-mapper/agents/openai.yaml`

- [ ] **Step 1: 读取当前内容**

Run:
```bash
cat figma-ui-api-mapper/agents/openai.yaml
```

Expected:(当前内容)
```yaml
interface:
  display_name: "Figma API 映射器"
  short_description: "清理 Figma 噪音,区分 UI 与接口字段"
  default_prompt: "使用 $figma-api-mapper 清理 Figma 节点,区分 api_bound、ui_static、ui_copy 和 unknown,并输出一份可审阅的 UI 到接口映射草案。"
```

- [ ] **Step 2: 覆盖为新内容**

把文件**完整**替换为:

```yaml
interface:
  display_name: "Figma UI-API 映射器"
  short_description: "清理 Figma 噪音,合并 api-mapping.md,输出 component-mapping.md"
  default_prompt: "使用 $figma-ui-api-mapper 读取 docs/design/<feature>/ 下的 clarified-requirement.md、ui-understanding.md、api-mapping.md,清理 Figma 节点,区分 api_bound、ui_static、ui_copy 和 unknown,合并接口字段,输出 docs/design/<feature>/component-mapping.md 并在 inputs.md 追加一条记录。"
```

- [ ] **Step 3: 验证 yaml 格式**

Run:
```bash
python3 -c "import yaml; print(yaml.safe_load(open('figma-ui-api-mapper/agents/openai.yaml')))"
```

Expected: 打印 dict,无 yaml 异常。`interface.display_name` 是 `"Figma UI-API 映射器"`。

- [ ] **Step 4: Commit**

```bash
git add figma-ui-api-mapper/agents/openai.yaml
git commit -m "feat(figma-ui-api-mapper): update agents/openai.yaml for new name + workflow

- display_name: Figma API 映射器 → Figma UI-API 映射器
- short_description: 说明产出 component-mapping.md
- default_prompt: 加入读取上游 .md 产物 + 写产物路径

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 3
"
```

---

### Task 4: 检查 `references/classification-and-mapping.md`

**Files:**
- Modify(possibly): `figma-ui-api-mapper/references/classification-and-mapping.md`

按 spec §6.2:"references/classification-and-mapping.md 内容保持"。本任务只检查内部是否
有 `figma-api-mapper` 字样残留,有则改之。

- [ ] **Step 1: 检查残留**

Run:
```bash
grep -n "figma-api-mapper" figma-ui-api-mapper/references/classification-and-mapping.md
```

Expected: **无输出**(因为现有 references 文件并没有引用 skill 名)。

如果有输出 → 进入 Step 2 修;无输出 → 跳到 Task 5。

- [ ] **Step 2(条件): 修补残留**

对每个匹配行,把 `figma-api-mapper` 替换为 `figma-ui-api-mapper`。用 Edit 工具,逐处修改。

- [ ] **Step 3: 验证 + (条件 Commit)**

如果 Step 1 无输出 → 跳过 commit,本任务无产物变更。

如果 Step 2 有修改:
```bash
git diff figma-ui-api-mapper/references/classification-and-mapping.md
git add figma-ui-api-mapper/references/classification-and-mapping.md
git commit -m "docs(figma-ui-api-mapper): update references for new skill name

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 4
"
```

---

### Task 5: 新增 `README.md`(仓库门面)

**Files:**
- Create: `figma-ui-api-mapper/README.md`

- [ ] **Step 1: 写入新文件**

写入以下完整内容到 `figma-ui-api-mapper/README.md`:

```markdown
# figma-ui-api-mapper

> Renamed from `figma-api-mapper`. Old name no longer works.

Part of the **figma-workflow-suite** —— phase C-low.
读取上游 `api-mapping.md` + 用户提供的 Figma node,清理非业务噪音,
区分 `api_bound` / `ui_static` / `ui_copy` / `unknown`,
输出可审阅的 `component-mapping.md`。

## Quick start

调用 skill:

```
figma-ui-api-mapper feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase C-low 自动路由调用)

## Prerequisites

`docs/design/<feature>/` 目录下必须已有:
- `clarified-requirement.md`
- `ui-understanding.md`
- `api-mapping.md`

以及 Figma file key + node id。

## Outputs

- `docs/design/<feature>/component-mapping.md` — 主产物
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 节点分类细节:[references/classification-and-mapping.md](./references/classification-and-mapping.md)
- 端到端 fixture:[tests/fixtures/course-list/](./tests/fixtures/course-list/)

## 上下游

```
phase C-up           → figma-ui-api-mapper →  phase D            →  phase E
api-mapping.md         component-mapping.md   figma-design-token   figma-emit-spec
(MVP 用户手填)                                 design-token-patch    implementation-spec
                                                                       open-questions
```

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
```

- [ ] **Step 2: Commit**

```bash
git add figma-ui-api-mapper/README.md
git commit -m "docs(figma-ui-api-mapper): add README.md as repository entry

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 5
"
```

---

### Task 6: 新增 `tests/fixtures/course-list/` 回归 fixture

**Files:**
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/README.md`
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/inputs/clarified-requirement.md`
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/inputs/ui-understanding.md`
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/inputs/api-mapping.md`
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/inputs/figma-node.json`
- Create: `figma-ui-api-mapper/tests/fixtures/course-list/expected/component-mapping.md`

- [ ] **Step 1: 创建目录**

Run:
```bash
mkdir -p figma-ui-api-mapper/tests/fixtures/course-list/inputs
mkdir -p figma-ui-api-mapper/tests/fixtures/course-list/expected
```

- [ ] **Step 2: 写 `fixtures/course-list/README.md`**

打开附录 A1,把 fenced code 块内**完整内容**写入 `figma-ui-api-mapper/tests/fixtures/course-list/README.md`。

附录路径:`docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration-appendix-a-fixture.md` 的 §A1。

- [ ] **Step 3: 写 `inputs/clarified-requirement.md`**

打开附录 §A2,完整内容写入对应文件。

- [ ] **Step 4: 写 `inputs/ui-understanding.md`**

打开附录 §A3,完整内容写入对应文件。

- [ ] **Step 5: 写 `inputs/api-mapping.md`**

打开附录 §A4,完整内容写入对应文件。

- [ ] **Step 6: 写 `inputs/figma-node.json`**

打开附录 §A5,完整内容写入对应文件。

- [ ] **Step 7: 写 `expected/component-mapping.md`**

打开附录 §A6,完整内容写入对应文件。

- [ ] **Step 8: 验证文件结构**

Run:
```bash
find figma-ui-api-mapper/tests/fixtures -type f | sort
```

Expected:
```
figma-ui-api-mapper/tests/fixtures/course-list/README.md
figma-ui-api-mapper/tests/fixtures/course-list/expected/component-mapping.md
figma-ui-api-mapper/tests/fixtures/course-list/inputs/api-mapping.md
figma-ui-api-mapper/tests/fixtures/course-list/inputs/clarified-requirement.md
figma-ui-api-mapper/tests/fixtures/course-list/inputs/figma-node.json
figma-ui-api-mapper/tests/fixtures/course-list/inputs/ui-understanding.md
```

- [ ] **Step 9: 验证 JSON 合法**

Run:
```bash
python3 -c "import json; json.load(open('figma-ui-api-mapper/tests/fixtures/course-list/inputs/figma-node.json'))"
```

Expected: 无输出(说明 JSON 合法)。

- [ ] **Step 10: Commit**

```bash
git add figma-ui-api-mapper/tests/fixtures/
git commit -m "test(figma-ui-api-mapper): add course-list regression fixture

Mirrors the original figma-api-mapper SKILL.md end-to-end example.
Provides 4 mock upstream products + 1 mock Figma node JSON + 1 expected
component-mapping.md to verify semantic equivalence post-migration.

MVP validation: manual review (diff). Future: LLM-as-judge.

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 6
"
```

---

### Task 7: 人工 review fixture,确认期望产物与原案例语义等价

**这一任务由人执行,不写代码,不调 skill。**

- [ ] **Step 1: 读原案例**

打开 git 历史里的旧 `figma-api-mapper/SKILL.md`(此时已被 Task 1 改名,所以从 git 取):

```bash
git show docs/figma-workflow-suite-design:figma-api-mapper/SKILL.md > /tmp/old-skill.md 2>/dev/null || \
  git log --all --source -- figma-api-mapper/SKILL.md | head
# 或直接看 commit 7f11ca1 之前(改名 commit 之前)的内容
```

定位到旧 SKILL.md 的"端到端示例 → 输出示例" JSON 块。

- [ ] **Step 2: 对比检查清单**

逐项确认 `figma-ui-api-mapper/tests/fixtures/course-list/expected/component-mapping.md` 是否包含:

- [ ] 至少这些节点:`course_card_template`, `course_cover`, `course_title`, `teacher_name`, `course_price`, `promo_tag`
- [ ] 每个节点的 `binding_type` 与原 JSON 一致
- [ ] 每个节点的 `confidence` 数值与原 JSON 在 ±0.05 内一致
- [ ] `summary.api_bound_count` = 4, `ui_static_count` ≥ 2, `ui_copy_count` = 1
- [ ] `promo_tag` 的 `binding_type` 是 `ui_copy`
- [ ] `course_card_template` 是 `ui_static`
- [ ] 重复列表只映射一份(不出现 `course_title_instance_2` 等)

发现不一致时,直接修 `expected/component-mapping.md`,使其与原案例语义对齐。

- [ ] **Step 3: 如有改动 → Commit**

```bash
# 如果 Step 2 修了文件
git add figma-ui-api-mapper/tests/fixtures/course-list/expected/component-mapping.md
git commit -m "test(figma-ui-api-mapper): align fixture expected with original example

Manual review found expected/component-mapping.md drift from the original
figma-api-mapper SKILL.md end-to-end example. Re-aligned.

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 7
"

# 如果 Step 2 未修(完全等价),本任务无 commit
```

---

### Task 8: 扫描代码库内对旧名的引用并修补

**Files:**
- Inspect: 全仓库
- Modify(若有): 仓库内任何引用 `figma-api-mapper` 的非历史文件

- [ ] **Step 1: 全仓扫描**

Run:
```bash
cd /Users/su/codeHub/github/agent-skills
grep -rn "figma-api-mapper" \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude="*.zip" \
  --exclude-dir="docs/superpowers/specs"
```

Expected: 大概率**无输出**(spec 文档里允许保留旧名,因为它们在讲改名史)。

如果只命中 `docs/superpowers/specs/`(spec 在记录迁移史,合理),跳过 Step 2/3。

如果命中其它文件 → Step 2 处理。

- [ ] **Step 2(条件): 逐处修补**

对每个非 spec 命中,人工判断:
- 如果是文档/注释/示例里说"调用 `figma-api-mapper`",改为 `figma-ui-api-mapper`
- 如果是迁移说明/历史记录,保留(并加注释说明为历史名)

用 Edit 工具逐处修改。

- [ ] **Step 3(条件): Commit**

```bash
# 仅在 Step 2 有改动时
git add <修改的文件>
git commit -m "refactor: update remaining references from figma-api-mapper to figma-ui-api-mapper

Refs: docs/superpowers/plans/2026-05-20-figma-ui-api-mapper-migration.md Task 8
"
```

- [ ] **Step 4: 额外提醒 —— 仓库外的引用**

输出一句提示给用户(不自动执行):

```
⚠ 仓库外可能有引用 figma-api-mapper 的地方(Obsidian vault、其它项目),建议手工扫:
  grep -rn "figma-api-mapper" ~/Documents ~/codeHub
  (vault 路径自填)
```

---

### Task 9: Final review + push 分支

- [ ] **Step 1: 看本 plan 在分支上累计的 commit**

Run:
```bash
git log --oneline docs/figma-workflow-suite-design..HEAD
```

Expected: 5~8 个 commit(Task 1~8 中实际有 commit 的任务数)。

- [ ] **Step 2: 验证目录最终状态**

Run:
```bash
ls figma-ui-api-mapper/
ls figma-ui-api-mapper/tests/fixtures/course-list/
```

Expected:
```
README.md  SKILL.md  agents  references  tests
```
```
README.md  expected  inputs
```

- [ ] **Step 3: 确认旧目录确实不在**

Run:
```bash
test -d figma-api-mapper && echo "FAIL: old dir still exists" || echo "OK: old dir removed"
```

Expected: `OK: old dir removed`

- [ ] **Step 4: Push 分支(不开 PR,先让用户 review)**

Run:
```bash
git push -u origin feat/figma-ui-api-mapper-migration
```

Expected: 分支推送成功,无强制推送、无 hook 跳过。

- [ ] **Step 5: 提示用户后续动作**

输出给用户:

```
✅ P1 plan 实施完成。分支 feat/figma-ui-api-mapper-migration 已 push。

后续动作:
  1. 你 review 分支上的 commit
  2. 如 OK,选择:
     - 直接 merge / fast-forward 到 docs/figma-workflow-suite-design
     - 或开 PR 走 review 流程
  3. 完成 P1 收口后,我可以开始写 P2 (figma-design-token)
```

---

## Self-Review Checklist(写完此 plan 后,我已做过的检查)

- ✅ **Spec coverage:** 对照 spec §4a 的 16 个 SKILL.md 章节清单,Task 2 的 SKILL.md 内容全部覆盖
- ✅ **Spec coverage:** 对照 spec §6.2 迁移策略,Task 1/3/8 覆盖(目录改名 + yaml + 引用扫描)
- ✅ **Placeholder scan:** 无 "TBD" / "TODO" / "implement later" / "fill in details"
- ✅ **Type consistency:** Markdown 表格列名(`node_id`, `binding_type`, `ui_role`, `api_field`, `confidence`, `needs_confirmation`, `reason`, `repeat_group`)在 SKILL.md、端到端示例、expected fixture 三处完全一致
- ✅ **可独立执行:** 每个 task 的 step 都是 2-5 分钟单动作;commit 频率高;每个 step 含完整可执行内容
- ✅ **错误兜底:** Task 4/7/8 含"条件性 commit"(无改动则不 commit)

## Out of Scope(本 plan **不**做)

- ❌ 实现 `figma-design-token` skill(P2)
- ❌ 实现 `figma-emit-spec` skill(P3)
- ❌ 实现 `figma-workflow` orchestrator(P4)
- ❌ 端到端套件 fixture(P5)
- ❌ LLM-as-judge 自动化验证(第 3 版)
- ❌ 开 PR(本 plan 只 push 分支,等用户 review)
