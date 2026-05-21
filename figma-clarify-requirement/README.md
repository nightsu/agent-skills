# figma-clarify-requirement

Part of the **figma-workflow-suite** —— phase A.
把用户自然语言需求整理为 `clarified-requirement.md`,
作为后续 phase B/C/D/E 的需求事实来源。

## Quick start

调用 skill:

```
figma-clarify-requirement feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase A 自动路由调用)

## Prerequisites

- `feature=<feature-name>` 参数
- 用户自然语言需求或任务描述
- 可选:Figma URL、PRD、已有页面路径、接口草案

## Outputs

- `docs/design/<feature>/clarified-requirement.md` — 主产物
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 产物模板:[references/clarified-requirement-template.md](./references/clarified-requirement-template.md)
- MVP 验证 fixture:[tests/fixtures/sales-workbench/](./tests/fixtures/sales-workbench/)

## 上下游

```
phase A                         →  phase B
clarified-requirement.md           figma-ui-understand / ui-understanding.md
```

本 skill 只做需求澄清,不要写业务代码,不要调用 Figma 深度分析。

当用户需求仍很模糊时,推荐先用 `superpowers:brainstorming` 辅助澄清;但本 skill 不强依赖 superpowers,没有 superpowers 时也应能独立产出 phase A 需求事实。

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
