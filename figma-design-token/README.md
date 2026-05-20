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
