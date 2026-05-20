# Expected Handoff — superpowers

本文件描述 referral-home 在 phase E 完成后选择 `superpowers:writing-plans` 的期望行为。

## 触发点

`figma-emit-spec` 产出:

- `docs/design/referral-home/implementation-spec.md`
- `docs/design/referral-home/open-questions.md`

随后先展示 phase E review gate:

```text
Choose:
  [1] Proceed to apply stage
  [2] Re-run phase E
  [3] Pause for manual edit
  [4] Exit workflow
```

只有用户选择 `[1] Proceed` 后,才展示 handoff 菜单。

## Handoff 菜单

```text
Detected environment:
  ✓ superpowers (writing-plans, executing-plans, subagent-driven-development, ...)

Handoff to apply stage:
  [1] Builtin — generate task-breakdown.md (smallest, you implement manually)
  [2] superpowers:writing-plans (detected — recommended)
  [3] Manual — exit, I'll take implementation-spec.md elsewhere
  [4] Pause for manual edit / answer open questions first
```

用户选择:

```text
2
```

## 传给 superpowers 的输入

唯一主输入:

```text
docs/design/referral-home/implementation-spec.md
```

允许作为辅助说明:

```text
docs/design/referral-home/open-questions.md
```

不得作为主输入:

- raw Figma JSON
- Figma MCP 原始响应
- `clarified-requirement.md`
- `ui-understanding.md`
- `api-mapping.md`
- `component-mapping.md`
- `design-token-patch.md`

原因:phase E 的目标就是把上游事实合成成 apply stage 的单一可信源。

## 期望输出

`superpowers:writing-plans` 生成 implementation plan,形态类似:

```markdown
# Referral Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement ReferralHomePage from implementation-spec.md.

## Task List

- [ ] Task 1: Define API types and hooks
- [ ] Task 2: Implement DiamondPreviewCard
- [ ] Task 3: Implement OperationEntryGrid
- [ ] Task 4: Implement BannerCarousel
- [ ] Task 5: Integrate page and run verification checklist
```

后续执行方式:

- `superpowers:executing-plans` — inline 执行
- `superpowers:subagent-driven-development` — subagent 执行

## `.workflow-prefs.json`

选择 superpowers 后应写入:

```json
{
  "handoff_after_emit": "superpowers",
  "remembered_at": "<ISO8601>"
}
```

下次到 phase E handoff 菜单时显示:

```text
Previous handoff choice: superpowers (saved <date>). Use [P] to repeat.
```

注意:`[P]` 是快捷键,不是自动重放。菜单仍然必须展示。

## 验证点

- [ ] phase E review gate 和 handoff 菜单是两个连续但独立的步骤
- [ ] 选择 superpowers 前不会自动调用 `writing-plans`
- [ ] `implementation-spec.md` 是唯一主输入
- [ ] `.workflow-prefs.json` 只在 builtin / superpowers 时写入
- [ ] manual / pause 不写偏好
