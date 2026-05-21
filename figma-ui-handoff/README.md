# figma-ui-handoff

`figma-ui-handoff` 是 figma-workflow-suite 的 P14 工程化 skill。它读取 `docs/design/<feature>/` 下已有产物,生成 `ui-handoff.md`,帮助设计/产品补齐 Figma selection、文案、命名、重复项、状态和资源交接信息。

## 使用方式

```text
figma-ui-handoff feature=<feature-name>
```

## 输出

```text
docs/design/<feature>/ui-handoff.md
```

## 边界

- `ui-handoff.md` 不是 Phase E implementation handoff。
- 不生成 implementation spec。
- 不修改 Figma 文件。
- 不写业务代码。
