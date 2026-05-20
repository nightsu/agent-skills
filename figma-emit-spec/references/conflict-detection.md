# Cross-Product Conflict 检测细节

本文档补充 `SKILL.md` 中的冲突检测规则,重点说明 4 种 conflict 的检测算法、
`label_drift` 的自动校正机制、`[deferred]` 的识别。

## 4 种 conflict 类型一览

| 类型 | 检测对象 | 检测方式 | 处理 |
|---|---|---|---|
| `field_unbound` | api-mapping 字段 | api-mapping 字段名是否在 component-mapping 中出现 | 写入 open-questions |
| `module_missing_token` | component-mapping module | component-mapping module 名是否在 design-token-patch 中出现 | 写入 open-questions |
| `module_drift` | ui-understanding module | ui-understanding module 名是否在 component-mapping 中出现 | 写入 open-questions |
| `label_drift` | component-mapping 槽位 label | component-mapping 槽位 label 是否等于 design-token-patch 同槽 label | **自动以 D 为准,不写入 open-questions** |

## `label_drift` 自动校正算法

### 为什么自动校正

来自 validation-findings.md F2:在 MVP 真实业务跑通中发现,
`figma-ui-api-mapper`(phase C-low)如果只调 `get_metadata`,会拿到 Figma node.name(经常是 placeholder),
导致 label 推测大量错位(实测 12/15 错位 = 80%)。

`figma-design-token`(phase D)通过 `get_design_context` 拿到的 `characters` 是真实业务文案的事实来源。
冲突时以 D 为准,不需要人介入(答案已知)。

> 注:PR #3 修了 spec §4a 和 PR #4 修了 P1 SKILL.md,要求 mapper 同时调 get_design_context,
> 这大幅减少 label_drift 发生频率。但 edge case 仍存在(例:Figma 文本节点 characters 也是占位),
> 自动校正机制仍需保留。

### 算法

```
for each module in component-mapping.md:
  for each slot in module:
    if slot.label exists in design-token-patch.md (按 module + position 匹配):
      if c_low_label != d_label:
        record auto-correction:
          - module: <module>
          - slot position: <position>
          - c_low_label: <c_low_label>
          - d_label: <d_label>(真值)
        use d_label in implementation-spec.md
    else:
      skip (无法判定,留 c_low_label)
```

### 写入 implementation-spec.md metadata 段

```markdown
## Auto Corrections Metadata
- label_drift: N 个 label 已从 phase C-low 自动校正为 phase D 真实值
- 校正详情:
  - DiamondPreviewCard.primary_value: "钻石余额" → "钻石数量"
  - OperationEntryGrid.list_item_label: "入口" → "运营入口"
```

## `[deferred]` 识别规则

### 触发

任何 open question(无论来自 phase A/B/C-up/C-low/D 哪个产物)前缀 `[deferred]`,即视为 deferred。

例:
```markdown
- [ ] [deferred] 趋势数据来源:接口完全无字段,本期不实现 trend badge
```

### 处理

- emit-spec 在 implementation-spec.md 对应 Module 段**显式标记**"本期不实现"
- deferred items 单独列在 open-questions.md 的 `## Deferred` 段(汇总,不重复散落)
- Verification Checklist 增加项:`[ ] 所有 deferred items 已确认本期不实现`

### 例子

#### 输入(`api-mapping.md` 或 `clarified-requirement.md`):

```markdown
## Open Questions
- [ ] [deferred] 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge
- [ ] 列表是否分页?(待定,假定不分页)
```

#### 输出(`implementation-spec.md` 对应 Module 段):

```markdown
### N. PrimaryMetricCard - 趋势 Badge

> ⚠ Deferred: 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge

(本元素不参与本期实施)
```

#### 输出(`open-questions.md` 顶部汇总):

```markdown
## Deferred (auto-detected from [deferred] prefix)
- [ ] [Phase A] 趋势数据(每个卡片右下角 ↑/↓ X%):接口无对应字段,本期不实现 trend badge
```

## 检测的边界 / false positive

- MVP 检测是粗粒度字符串匹配,可能 false positive(例:字段名拼写差异、module 名大小写)
- 用户可以直接在 open-questions.md 中标 `[x]` 表示已确认非冲突,emit-spec 不重写该段
- `label_drift` 自动校正只对**已经明确语义对应**的槽位生效;若槽位对应关系本身不确定,留给人工(写入 open-questions 的 module_drift)

## 不做的事

- ❌ 不"猜"字段对应(只做字符串匹配,不做 fuzzy match / 同义词)
- ❌ 不自动改写上游产物(只在 implementation-spec.md 中用校正后的值;上游保持原样)
- ❌ 不无限递归 deferred(若一个 module 全部 deferred,整个 module 段标 deferred,但内部 slot 不重复标)
