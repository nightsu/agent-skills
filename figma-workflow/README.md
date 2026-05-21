# figma-workflow

Part of the **figma-workflow-suite** —— suite orchestrator。

按 `docs/design/<feature>/` 下的产物状态推断当前进度,串联 phase A-E 和工程化检查点,
并在每阶段完成后展示 review gate。

## Quick start

调用 skill:

```text
figma-workflow feature=<feature-name>
```

示例:

```text
figma-workflow feature=referral-home
```

## 产物目录

所有阶段产物固定放在业务仓库:

```text
docs/design/<feature>/
├── inputs.md
├── clarified-requirement.md
├── ui-understanding.md
├── api-mapping.md
├── component-mapping.md
├── design-token-patch.md
├── design-diff.md
├── ui-handoff.md
├── assets-manifest.md
├── validation-report.md
├── implementation-spec.md
└── open-questions.md
```

## Workflow 阶段

- phase A:`figma-clarify-requirement` → `clarified-requirement.md`
- phase B:`figma-ui-understand` → `ui-understanding.md`
- phase C1:`figma-api-first` → `api-mapping.md`
- phase C2:`figma-ui-api-mapper` → `component-mapping.md`
- phase D:`figma-design-token` → `design-token-patch.md`
- phase E:`figma-emit-spec` → `implementation-spec.md` + `open-questions.md`

Phase E review gate 通过后,进入交接前工程化检查:

- `figma-design-diff` → `design-diff.md`
- `figma-ui-handoff` → `ui-handoff.md`
- `figma-assets-validate` → `assets-manifest.md` + `validation-report.md`

## 交接前检查与 Handoff

phase E review gate 通过后,先进入交接前工程化检查。检查项处理完成后,再进入 handoff 出口:

- builtin:`task-breakdown.md`
- `superpowers:writing-plans`
- manual:用户自己拿 `implementation-spec.md` 去实现
- pause:先编辑 `open-questions.md` / `implementation-spec.md`

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 进度推断与路由规则:[references/progress-routing.md](./references/progress-routing.md)
- 手填模板:[templates/](./templates/)
- 进度面板 fixture:[tests/fixtures/progress-states/](./tests/fixtures/progress-states/)

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
