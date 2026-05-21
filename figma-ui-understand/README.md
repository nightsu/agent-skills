# figma-ui-understand

`figma-workflow-suite` 的 phase B。
从指定 Figma node 提取页面结构、重复模式、疑似组件和 UI 语义,
输出 `ui-understanding.md`。

## 快速开始

调用 skill:

```
figma-ui-understand feature=<feature-name>
```

(或由 `figma-workflow feature=<feature-name>` 在 phase B 自动路由调用)

## 输入

- `docs/design/<feature>/clarified-requirement.md`
- Figma file key
- Figma node id

## 输出

- `docs/design/<feature>/ui-understanding.md` — 主产物
- `docs/design/<feature>/inputs.md` — 追加一条 audit 记录

## 详细规约

- Skill 使用说明:[SKILL.md](./SKILL.md)
- 产物模板:[references/ui-understanding-template.md](./references/ui-understanding-template.md)
- MVP 验证 fixture:[tests/fixtures/sales-workbench/](./tests/fixtures/sales-workbench/)

## 上下游

```
phase A                    → figma-ui-understand → phase C-up / C-low
clarified-requirement.md     ui-understanding.md   api-mapping.md / component-mapping.md
```

本 skill 不做 API 字段绑定,不写业务代码。
真实文案必须来自 `characters`,不能来自 `node.name`。

## Suite spec

完整套件设计:`docs/superpowers/specs/2026-05-20-figma-workflow-suite/README.md`
