# figma-assets-validate

`figma-assets-validate` 是 figma-workflow-suite 的 P15 工程化 skill。它读取 `docs/design/<feature>/` 下已有产物,生成 `assets-manifest.md` 和 `validation-report.md`,用于资源交付和自动化验证收口。

## 使用方式

```text
figma-assets-validate feature=<feature-name>
```

## 输出

```text
docs/design/<feature>/
├── assets-manifest.md
└── validation-report.md
```

## 边界

- 默认不下载所有资源。
- 不把 LLM-as-judge 当作唯一验收。
- 不修改 Figma 文件。
- 不写业务代码。
