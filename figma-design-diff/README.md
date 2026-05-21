# figma-design-diff

`figma-design-diff` 是 figma-workflow-suite v4 的 P13 工程化 skill。它基于 `.figma-cache/` before / after snapshots 生成 `docs/design/<feature>/design-diff.md`,帮助用户判断 Figma 改稿后要重跑哪些阶段。

## 边界

- 不修改 Phase A-E 产物。
- 不自动重跑任何 phase。
- 不写业务代码。
- 不做像素级 screenshot diff。

## 输出

- `docs/design/<feature>/design-diff.md`
- `docs/design/<feature>/inputs.md` 中的一条 audit 记录

## 验证

```bash
node --test figma-workflow/scripts/figma-diff.test.js
node figma-workflow/scripts/figma-diff.js \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/baseline \
  figma-design-diff/tests/fixtures/sales-workbench/inputs/.figma-cache/snapshots/current
```
