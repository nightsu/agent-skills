# Figma Workflow Suite v4 — Design Spec

> Date: 2026-05-21
> Status: Draft, awaiting user review
> Owner: @su
> Builds on:
> - `docs/superpowers/specs/2026-05-20-figma-workflow-suite-v2/README.md`
> - `docs/superpowers/specs/2026-05-21-figma-api-first-v3/README.md`

---

## TL;DR

第 4 版不再继续补阶段产物 skill,而是补 figma-workflow-suite 的工程化能力:

```text
P12 cache     → 缓存 Figma MCP 读取结果,减少重复读取和 token 消耗
P13 diff      → 基于 cache 产出 design-diff.md,描述 Figma 改稿差量
P14 handoff   → 输出 UI handoff 最低规范,让设计/产品能修正上游输入质量
P15 assets+QA → 资源下载约定和自动化验证,放在最后收口
```

优先级是 **cache → diff → UI handoff → assets / 自动化验证**。

技能数量口径:

- 主链路保持 7 个 skill:`figma-workflow` + Phase A-E 的 6 个阶段 skill。
- v4 预计新增 3 个工程化 skill:`figma-design-diff`、`figma-ui-handoff`、`figma-assets-validate`。
- P12 cache layer 不新增独立 skill,只提供 `figma-workflow` reference / scripts 和 phase contract。
- v4 全部落地后,figma-workflow-suite 相关 skill 总数预计为 10 个。

---

## Why v4

MVP 到 v3 已经把 A/B/C1/C2/D/E 的主链路补齐:

- Phase A:`figma-clarify-requirement`
- Phase B:`figma-ui-understand`
- Phase C1:`figma-api-first`
- Phase C2:`figma-ui-api-mapper`
- Phase D:`figma-design-token`
- Phase E:`figma-emit-spec`
- Orchestrator:`figma-workflow`

接下来最大的风险不再是"缺一个阶段",而是重复读取、改稿不可追踪、上游交接质量不稳定、资源和验证仍停留在人工约定。

v4 因此先做基础设施,不急着扩展更多平台集成。

---

## Scope Split

### P12: Cache Layer

新增 `.figma-cache/` 约定,缓存 Figma MCP 的关键读取结果。

详细设计见 `docs/superpowers/specs/2026-05-21-figma-cache-layer/README.md`。

目标:

- 避免同一 file/node 在 C2/D 等阶段重复读取。
- 为后续 diff 提供 before / after 基线。
- 让 `inputs.md` 不再承担大体量原始证据记录。

建议产物:

```text
docs/design/<feature>/.figma-cache/
├── manifest.json
├── metadata.<file-key>.<node-id>.json
├── design-context.<file-key>.<node-id>.json
└── screenshot.<file-key>.<node-id>.png
```

边界:

- 不把 cache 当作用户可编辑产物。
- 不要求所有 phase 都强依赖 cache;读不到时可以 fallback 到 Figma MCP。
- 不把 raw Figma JSON 写入 `implementation-spec.md`。

### P13: Design Diff

基于 `.figma-cache/` 的两个快照产出 `design-diff.md`。

详细设计见 `docs/superpowers/specs/2026-05-21-figma-design-diff/README.md`。

目标:

- 让 Figma 改稿影响可 review。
- 告诉用户哪些上游产物可能需要重跑。
- 避免每次改稿都从 A 到 E 全量重来。

建议产物:

```text
docs/design/<feature>/design-diff.md
```

内容至少包括:

- changed nodes
- added / removed nodes
- text changes
- size / layout changes
- likely affected modules
- recommended rerun phases

边界:

- diff 只做实现前证据,不直接修改 A/B/C/D/E 产物。
- diff 不自动写业务代码。
- diff 不替代用户 review gate。

### P14: UI Handoff Minimum Spec

新增面向设计师 / 产品的最低交接规范,帮助上游 Figma 和需求输入更稳定。

详细设计见 `docs/superpowers/specs/2026-05-21-figma-ui-handoff/README.md`。

实现 skill:`figma-ui-handoff`。

目标:

- 明确 text characters、组件命名、Frame 边界、重复项、状态、资源标注的最低要求。
- 减少 `figma-ui-understand` / `figma-ui-api-mapper` 的 unknown。
- 给用户一份可以转给设计师的轻量文档。

建议产物:

```text
docs/design/<feature>/ui-handoff.md
```

内容至少包括:

- Required Figma selection
- Text requirements
- Component / section naming rules
- Repeat group hints
- State coverage
- Asset marking
- Known gaps

边界:

- 不修改 Figma 文件。
- 不要求设计师使用特定设计系统。
- 不把 handoff 文档当作 implementation spec。
- 不把 UI handoff 当作 Phase E 的 implementation handoff 或 coding 入口。

### P15: Assets and Automated Validation

最后补 assets 下载约定和自动化验证。

详细设计见 `docs/superpowers/specs/2026-05-21-figma-assets-validation/README.md`。

实现 skill:`figma-assets-validate`。

目标:

- 规范图片/icon 等资源如何被引用、下载或延后。
- 引入最低成本的自动化验证,减少人工 fixture 漏检。

建议方向:

- `assets-manifest.md` 或 `assets-manifest.json`
- fixture 级 markdown contract check
- 可选 LLM-as-judge,只用于文档等价和风险提示

边界:

- 不在 P15 前强制下载所有资源。
- 不把 LLM-as-judge 当作唯一验收。
- 不改变业务代码 coding boundary。

---

## Version Boundaries

v4 仍遵守既有 coding boundary:

- Phase A 到 E 只生产 `docs/design/<feature>/` 下的设计实现产物。
- Phase E handoff 后进入 OpenSpec / planning / task breakdown 等准备阶段。
- 业务代码只能在用户明确确认执行 coding 后开始。

v4 新增能力也必须遵守:

- cache / diff / handoff / assets 都不能写业务代码。
- cache 可以保存 raw Figma evidence,但 `implementation-spec.md` 不能直接引用 raw Figma JSON。
- diff 只能建议重跑阶段,不能自动覆盖上游产物。

---

## Orchestrator Impact

详细编排设计见 `docs/superpowers/specs/2026-05-21-figma-workflow-v4-orchestration-design.md`。该设计在 spec 层使用 v4 追踪版本,在 `figma-workflow` 面向用户的输出中呈现最终 workflow 编排。

`figma-workflow` 在 v4 中需要新增可选菜单能力:

- 当检测到同一 feature 有 cache 时,显示 cache 状态。
- 当 Figma node 重新读取后与 cache 不一致时,提示可生成 `design-diff.md`。
- 在 Phase E 前允许用户查看或生成 `ui-handoff.md`。

但 orchestrator 仍保持产物驱动:

- 不引入长生命周期状态机。
- 不自动连跑多个阶段。
- 不因为 cache 命中就跳过 review gate。

---

## Compatibility

- 现有 `docs/design/<feature>/` 产物继续有效。
- 没有 `.figma-cache/` 时,各 phase 仍可直接调用 Figma MCP。
- 没有 `design-diff.md` 时,既有工作流不受影响。
- `ui-handoff.md` 是辅助文档,不作为 Phase E 必需输入。
- assets / 自动化验证默认 opt-in。

---

## Roadmap

- P11: v4 scope split spec + implementation plan。
- P12: cache layer spec / implementation。
- P13: design diff spec / implementation。详细设计见 `docs/superpowers/specs/2026-05-21-figma-design-diff/README.md`。
- P14: UI handoff minimum spec / implementation。
- P15: assets + automated validation spec / implementation。
- P16: workflow orchestration checkpoint spec / implementation。

---

## Validation

P11 只验证文档决策:

- v4 scope 拆分清楚。
- cache 被排在 diff 前。
- diff 依赖 cache,但不修改上游产物。
- UI handoff 是设计/产品交接文档,不是 implementation spec。
- assets / automated validation 被明确放在后续。
- coding boundary 沿用并保持明确。

后续 P12-P15 各自补 fixture 和更细的验收。

---

## Open Questions

- `.figma-cache/` 是否应该放在 `docs/design/<feature>/` 下,还是 repo 级 `.figma-cache/`。建议第一版放在 feature 目录下,便于随 feature review。
- screenshot 是否必须缓存为 png 文件。建议第一版允许只缓存 screenshot URL/metadata,真正下载放到 P15 assets。
- `design-diff.md` 是否支持跨不同 node 对比。建议第一版只支持同一 file key + node id。
