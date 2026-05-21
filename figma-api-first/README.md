# figma-api-first

`figma-api-first` 是 figma-workflow-suite 的 Phase C-up skill。

它把用户粘贴的接口结构、返回值类型或字段清单整理成:

```text
docs/design/<feature>/api-mapping.md
```

## 适用场景

- 已完成 `clarified-requirement.md` 和 `ui-understanding.md`。
- 需要把接口返回结构先稳定成字段事实。
- 准备让 `figma-ui-api-mapper` 在 C-low 阶段结合 Figma 做 UI/API 绑定。

## 不做什么

- 不接 YApi / Swagger / OpenAPI 自动抓取。
- 不调用 Figma MCP。
- 不产出 `component-mapping.md`。
- 不修改业务代码。

## 调用方式

```text
figma-api-first feature=<feature-name>
```

调用后粘贴 TypeScript type、JSON response、字段清单或接口说明文本。
