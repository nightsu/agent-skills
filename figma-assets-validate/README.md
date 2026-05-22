# figma-assets-validate

`figma-assets-validate` 是 figma-workflow-suite 的 P15 工程化 skill。它读取 `docs/design/<feature>/` 下已有产物,生成 `assets-manifest.md` 和 `validation-report.md`,用于资源交付和自动化验证收口。

## 使用方式

```text
figma-assets-validate feature=<feature-name>
```

## 输出

```text
docs/design/<feature>/
├── snapshots/
│   ├── default.png
│   └── default.json
├── assets-manifest.md
└── validation-report.md
```

`snapshots/*.png` 是实现前后视觉对照基线,`snapshots/*.json` 是小型 metadata,用于记录 file key、node id、原始尺寸、用途和 required 状态。metadata 不包含 raw Figma JSON。

## 边界

- 可下载 required visual baseline snapshot,但不默认下载所有生产资源。
- 不执行像素级视觉回归。
- 不把 LLM-as-judge 当作唯一验收。
- 不修改 Figma 文件。
- 不写业务代码。
- 如果 `implementation-spec.md` 与 snapshot 不一致,只允许迭代 Phase E/P15 产物。
