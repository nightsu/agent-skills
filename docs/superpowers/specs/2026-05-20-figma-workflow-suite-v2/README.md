# Figma Workflow Suite v2 — Design Spec

> Date: 2026-05-20
> Status: Draft, awaiting user review
> Owner: @su
> Builds on: `docs/superpowers/specs/2026-05-20-figma-workflow-suite/`
> Source validation: `figma-workflow-mvp` real project smoke test

---

## TL;DR

v2 的目标是把 MVP 中仍需手填的 A/B 阶段补成可编排 skill,接入外部 handoff,并把"什么时候开始写代码"固化成硬边界:

```text
Phase A/B/C-up/C-low/D/E 只生产 docs/design/<feature>/ 下的设计实现产物
Phase E review gate 通过并选择 handoff 后,进入 OpenSpec / planning / task breakdown 等准备阶段
业务代码只能在用户明确确认执行 coding 后开始
```

v2 交付重点:

- 新增 `figma-clarify-requirement`,替代 phase A 手填。
- 新增 `figma-ui-understand`,替代 phase B 手填。
- 收紧 `figma-workflow` / `figma-emit-spec` 的 coding 边界文案和 handoff 行为。
- 接入外部 handoff:`superpowers:brainstorming` 和 OpenSpec。
- 增加 v2 fixture,验证 "spec generation / planning" 与 "coding apply" 是两个阶段。

---

## Why v2

MVP 已验证:

- Figma MCP 能读取真实节点。
- C-low / D / E 产物链可以支撑后续实现。
- `implementation-spec.md` 可以作为 OpenSpec / planning / task breakdown 的主输入。

MVP 同时暴露了一个流程风险:

- Agent 容易在 Phase E 之前提前开始写代码。
- A/B 手填质量决定下游质量,但 MVP 没有自动化约束。
- 外部 handoff 目前只是菜单语义,尚未形成可验证的跨工具交接契约。

v2 因此不优先追求更多视觉能力,而是先补齐 A/B 前置语义产物、外部 handoff 与 coding 边界。

---

## Scope

### In Scope

- `figma-clarify-requirement`:产出 `clarified-requirement.md`。
- `figma-ui-understand`:产出 `ui-understanding.md`。
- `figma-workflow`:识别 A/B skill 存在时可路由到对应 skill。
- `figma-emit-spec`:明确只合成 spec,不触发代码修改,并明确外部 handoff 的输入输出。
- `docs/design/<feature>/` 产物格式保持向后兼容。
- v2 文档 fixture 和验收清单。

### Out of Scope

- `.figma-cache/` 缓存层。
- Figma 改稿 diff(`design-diff.md`)。
- 图片/icon 实际下载。
- UI handoff 给设计师的规范文档。
- 自动化执行 coding apply。
- `figma-api-first` 或其它 C-up 自动化 skill(第 3 版范围)。
- OpenSpec proposal 自动生成的完整实现。

---

## Golden Rule: Coding Boundary

所有 v2 skill 必须遵守:

1. Phase A 到 E 只允许创建或更新 `docs/design/<feature>/` 下的设计实现产物。
2. 不修改业务代码目录,例如 `src/`, `app/`, `components/`, `pages/`。
3. `figma-emit-spec` 的输出 `implementation-spec.md` 是 OpenSpec / planning / task breakdown 的单一主输入。
4. Phase E review gate 选择 Proceed 并完成 handoff 后,只能进入 OpenSpec / planning / task breakdown 等准备阶段。
5. 业务代码只能在用户明确确认执行 coding 后开始。
6. coding 如果由 agent 执行,必须显式声明它正在消费 `implementation-spec.md` 或基于它生成的 OpenSpec / plan,而不是 raw Figma JSON 或上游五份产物。

这条规则来自真实项目 smoke test 的经验:过早写代码会让 figma-workflow 的职责边界变模糊,也会让验证结果无法区分"产物链是否可靠"和"实现 agent 是否可靠"。

---

## Skill Contracts

### `figma-clarify-requirement`

**Position:** Phase A

**Goal:** 把用户意图、业务背景、限制条件整理为 `clarified-requirement.md`。

**Inputs:**

- feature name。
- 用户的自然语言需求。
- 可选:PRD、现有页面路径、接口草案、Figma URL。

**Output:** `docs/design/<feature>/clarified-requirement.md`

**Must include:**

- Goal。
- Scope / Out of Scope。
- User States。
- Interaction。
- Non-blocking Open Questions。

**Must not:**

- 调用 Figma MCP 做深度 UI 分析。
- 写业务代码。
- 把未确认的问题伪装成事实。

**Recommended behavior:**

- 优先复用 `superpowers:brainstorming` 的提问风格,但不能强依赖 superpowers。
- 问题过多时,先产出草案并把不确定项列入 Open Questions。

### `figma-ui-understand`

**Position:** Phase B

**Goal:** 从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,产出 `ui-understanding.md`。

**Inputs:**

- feature name。
- Figma file key。
- Figma node id。
- 可选:phase A 的 `clarified-requirement.md`。

**Required Figma MCP calls:**

- `get_metadata`:拿节点结构、尺寸、层级。
- `get_design_context`:拿真实 text characters 和视觉上下文。
- `get_screenshot`:拿视觉参照,用于校验整体结构。

**Output:** `docs/design/<feature>/ui-understanding.md`

**Must include:**

- Page Structure。
- Suspected Components。
- Repeated Patterns。
- Static / Dynamic UI guess。
- Open Questions。

**Must not:**

- 做 API 字段绑定。
- 把 `node.name` 当作真实业务文案。
- 读取传入 node 之外的兄弟页面。
- 写业务代码。

## Orchestrator v2 Behavior

`figma-workflow` 在 v2 中仍然保持产物驱动和无状态。

新增行为:

- A 缺失时,如果 `figma-clarify-requirement` 可用,提示可运行 Phase A skill;否则提示手填模板。
- B 缺失且 A 已完成时,如果 `figma-ui-understand` 可用,提示可运行 Phase B skill;否则提示手填模板。
- C-up 在 v2 仍保持手填模板路径;如果用户只看截图填写,模板必须提醒字段数和 UI 槽位数可能误判。
- C-low/D/E 的进入条件保持 MVP 规则。
- Phase E 完成后,仍先显示 E review gate,用户选择 Proceed 后才显示 handoff 菜单。

不新增状态机文件;`.workflow-prefs.json` 仍只记录 handoff 偏好。

---

## Handoff v2 Behavior

`figma-emit-spec` 的 handoff 菜单保持四选项:

```text
Handoff to planning / spec authoring:
  [1] Builtin — generate task-breakdown.md
  [2] superpowers:writing-plans
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

v2 收紧语义:

- 选择 `[1] Builtin` 只生成 `task-breakdown.md`,仍不写业务代码。
- 选择 `[2] superpowers` 只把 `implementation-spec.md` 交给 `superpowers:writing-plans`。
- 选择 `[3] Manual` 不产出额外文件,只提示用户自行把 `implementation-spec.md` 交给 OpenSpec / Cursor / Codex 或自有流程。
- 选择 `[4] Pause` 不产出额外文件。

外部 handoff 补充:

- `superpowers:brainstorming` 只作为 Phase A 的可选辅助入口,用于把模糊需求整理成 `clarified-requirement.md` 的输入事实。
- OpenSpec 只作为 handoff 目标被记录和提示;v2 不自动生成 OpenSpec proposal,也不自动进入 coding。

---

## Compatibility

v2 必须兼容 MVP 已存在的产物:

- 如果 A/B 已经手填且非占位,orchestrator 不强制重跑 v2 skill。
- v2 新 skill 的输出文件名与 MVP 手填产物完全一致。
- C-up 仍沿用 MVP 手填产物 `api-mapping.md`。
- C-low/D/E 不需要知道 A/B 是手填还是 skill 生成。
- `implementation-spec.md` 模板保持向后兼容,只补充 coding boundary 文案。

---

## Roadmap Position

版本节奏按以下顺序推进:

- 第 2 版: `figma-clarify-requirement` + `figma-ui-understand` + 外部 handoff / coding boundary。
- 第 3 版: `figma-api-first`,替代 C-up 手填 `api-mapping.md`。
- 第 4 版: 缓存层 / diff / UI handoff 规范 / assets / 自动化验证。详见 `docs/superpowers/specs/2026-05-21-figma-workflow-suite-v4/README.md`。

`figma-api-first` 不属于 `figma-ui-api-mapper`;两者同属 Phase C,但分别产出 `api-mapping.md` 和 `component-mapping.md`。

---

## Validation

v2 验收至少覆盖:

- 缺 A 时,orchestrator 能提示 Phase A skill 或手填模板。
- A 已完成缺 B 时,orchestrator 能提示 Phase B skill 或手填模板。
- A/B 已完成但缺 C-up 时,orchestrator 仍提示手填 `api-mapping.md` 模板。
- Phase A 可引用 `superpowers:brainstorming` 作为外部辅助入口。
- Phase E 前没有任何步骤要求写业务代码。
- Phase E handoff 到 `superpowers:writing-plans` 时,输入只包含 `implementation-spec.md`。
- OpenSpec handoff 只记录目标和使用提示,不自动生成 proposal。
- 业务代码只能在用户明确确认执行 coding 后开始。

---

## Open Questions

- `figma-clarify-requirement` 是否应该直接调用 `superpowers:brainstorming`,还是只借鉴其输出格式。
- v2 是否需要给 A/B 两个 skill 各自准备真实项目 fixture,还是先做 suite 级 fixture。

## Resolved in v3

- 第 3 版 `figma-api-first` 第一版只支持用户粘贴接口结构 / 返回值类型 / 字段清单,暂不接 YApi / Swagger / OpenAPI 平台抓取。详见 `docs/superpowers/specs/2026-05-21-figma-api-first-v3/README.md`。
