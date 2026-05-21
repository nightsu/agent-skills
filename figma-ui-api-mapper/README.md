# figma-ui-api-mapper

> Renamed from `figma-api-mapper`. Old name no longer works.

Part of the **figma-workflow-suite** —— phase C2.
读取上游 `api-mapping.md` + 用户提供的 Figma node,清理非业务噪音,
区分 `api_bound` / `ui_static` / `ui_copy` / `unknown`,
输出可审阅的 `component-mapping.md`。

## Quick start

调用 skill:

```
figma-ui-api-mapper feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase C2 自动路由调用)

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
phase C1           → figma-ui-api-mapper →  phase D            →  phase E
api-mapping.md         component-mapping.md   figma-design-token   figma-emit-spec
                                              design-token-patch    implementation-spec
                                                                       open-questions
```

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
