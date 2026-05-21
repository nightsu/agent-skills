# UI Understanding — sales-workbench

## Page Structure

- 页面根节点为后台销售工作台。
- 指标区域分为首联、需求、转化三段。

## Repeated Patterns

| Pattern | Evidence | Notes |
|---|---|---|
| metric-card | 多个指标卡视觉结构一致 | 需要标注 template / instance 关系 |

## Open Questions

- [ ] loading / empty / error / permission 状态在当前 selection 中未完整出现。
- [ ] 部分 text layer 的 `characters` 需要确认,不能只使用 `node.name`。
