# §1 — Overview / 套件总览(架构)

> 上一篇:[README](./README.md) · 下一篇:[02 File Layout](./02-file-layout.md)

---

## 目标

用户在自己的业务仓库里,从 **Figma 设计稿 + 业务需求 + 接口文档** 出发,产出一份
`implementation-spec.md` 作为 Agent 编码的**单一可信源**(single source of truth),
过程中保留**可追溯证据**。

核心原则(沿用 brainstorming 来源材料第 17 节):

```txt
用更少 token,让 Agent 看到更准确的工程语义。
```

并补充用户在 brainstorming 开始时强调的两条:

- 减少 token **不是根本目的**,减少幻觉、保证 Agent 注意力集中才是
- 实现过程应该尽可能使用项目中已有框架(tailwind / css_module),
  验证环节要和截图对比,但对文本不应要求太高

---

## MVP 阶段链

```
[阶段 A 产物]    [阶段 B 产物]    [阶段 C]              [阶段 D]              [阶段 E]
clarified-      ui-              api-first             design-token          emit-spec
requirement.md  understanding.md ┬─────────────────┐   ┬────────────────┐    ┬─────────────────┐
   ↑              ↑              │ figma-api-first │   │ figma-design-  │    │ figma-emit-spec │
   用户手工       用户手工        │ → api-mapping.md│ → │ token          │ →  │ → implementation│
   (套件给模板)  (套件给模板)    │                 │   │ → design-token-│    │   -spec.md      │
                                 │ figma-ui-api-   │   │   patch.md     │    │ → open-questions│
                                 │ mapper          │   │                │    │   .md           │
                                 │ → component-    │   │                │    │ + handoff 出口  │
                                 │   mapping.md    │   │                │    │   (内置/外部)   │
                                 └─────────────────┘   └────────────────┘    └─────────────────┘
              [orchestrator: figma-workflow,产物驱动 + 每阶段 review gate]
```

> 注:MVP 第 1 版中,**阶段 C 的 figma-api-first 也是用户手填**(套件给模板),
> 只有 `figma-ui-api-mapper` 是 active skill。完整自动化要到第 2 版。
> 见 [§3 Orchestrator](./03-orchestrator.md) 的阶段进入条件。

---

## 套件 skill 全清单(6 个)

| Skill | 角色 | MVP 状态 |
|---|---|---|
| `figma-workflow` | Orchestrator + handoff 选择器 | ✅ 本 spec 交付 |
| `figma-clarify-requirement` | 阶段 A 内置版(薄) | ⏸ 第 2 版 |
| `figma-ui-understand` | 阶段 B | ⏸ 第 2 版 |
| `figma-api-first` | 阶段 C 上半段 | ⏸ 第 2 版 |
| `figma-ui-api-mapper` | 阶段 C 下半段(改名自 `figma-api-mapper`) | ✅ 本 spec 交付 |
| `figma-design-token` | 阶段 D | ✅ 本 spec 交付 |
| `figma-emit-spec` | 阶段 E + handoff 出口 | ✅ 本 spec 交付 |

**MVP 实际激活 4 个:** `figma-workflow` + `figma-ui-api-mapper` + `figma-design-token` + `figma-emit-spec`。

---

## 关键架构决策(固化)

1. **产物驱动 orchestrator** —— 看 `docs/design/<feature>/` 文件存在性决定可进入哪一阶段。
   不引入第二份状态文件(git 即真相)。

2. **零外部依赖** —— 套件本体不强绑 `superpowers` / `OpenSpec`。
   外部 skill 仅出现在 `figma-emit-spec` 的 handoff 出口,作为可选项。

3. **每阶段产物落盘 → 自查 + 菜单 → 用户选下一步**。
   Orchestrator **不**自动连跑多阶段。

4. **每个 skill 默认按约定路径读写产物**(`docs/design/<feature>/<file>`),
   `<feature>` 作为必传参数。Orchestrator 在路由调用时显式传入,用户也可以越过 orchestrator 独立调单 skill。

5. **产物格式优先 Markdown 表格**(而非 JSON),便于人阅读 + git diff 友好。
   JSON 仅在必要的机器可读场景作为 fenced code 内嵌出现。

---

## 阶段产物对照表

| 阶段 | 产物 | 由谁产出 |
|---|---|---|
| A | `clarified-requirement.md` | MVP:用户手填(套件给模板)/ 第 2 版:`figma-clarify-requirement` |
| B | `ui-understanding.md` | MVP:用户手填 / 第 2 版:`figma-ui-understand` |
| C 上 | `api-mapping.md` | MVP:用户手填 / 第 2 版:`figma-api-first` |
| C 下 | `component-mapping.md` | `figma-ui-api-mapper`(active) |
| D | `design-token-patch.md` | `figma-design-token`(active) |
| E | `implementation-spec.md` + `open-questions.md` | `figma-emit-spec`(active) |
| 全程 | `inputs.md` | orchestrator + 各 skill 自动追加 |
| 全程 | `.workflow-prefs.json` | `figma-emit-spec` 首次 handoff 时创建 |

---

## 不在 MVP 内的功能(本 spec 不实现)

- ❌ 阶段 A/B 的自动化 skill
- ❌ 阶段 C 上半段(`figma-api-first`)的实际接口抓取
- ❌ `.figma-cache/` 缓存层
- ❌ Figma 改稿 diff(`design-diff.md`)
- ❌ 资源(图片/icon)实际下载
- ❌ UI handoff 最低规范文档(给设计师的)
- ❌ 多语言/多框架的 spec 模板(只给一个通用模板)
- ❌ 自动化测试 / CI

---

## 套件外部边界(明确)

| 套件**不**承担 | 由谁承担 |
|---|---|
| 项目代码生成 / 真正写组件 | 用户的 coding agent(Claude Code / Codex / Cursor) |
| 实现计划(implementation plan) | 用户选择 `superpowers:writing-plans` 或自己拆 task |
| OpenSpec 协议级 proposal | 用户后续手动接入 OpenSpec(MVP 不生成 stub,见决策 13) |
| Figma 文件本身的修改 | Figma 设计师 |
| API 真实抓取 | 第 2 版的 `figma-api-first` |
