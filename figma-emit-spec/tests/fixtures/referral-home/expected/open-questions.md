# Open Questions — referral-home

聚合自所有阶段产物中标记的待确认项。

## From Phase A (clarified-requirement.md)
- [ ] 入口数量是否固定 4 个?
- [ ] 商品列表是否分页?

## From Phase B (ui-understanding.md)
- [ ] HotProductList 是否真的在本页(MVP 第 1 屏)?可能需 phase C-low 核对 Figma node 确认

## From Phase C-up (api-mapping.md)
(无)

## From Phase C-low (component-mapping.md, needs_confirmation: true)
- [ ] node `hot_product_section`: 不确定本页是否包含 HotProductList,需 phase D 视觉确认

## From Phase D (design-token-patch.md, INFERRED)
- [ ] OperationEntryGrid.columnCount: INFERRED from 4-instance grid,需确认是否固定

## Cross-Product Conflicts (auto-detected)
- [ ] field_unbound: (本 fixture 无此类冲突,留作示例段)
- [ ] module_drift: HotProductList(ui-understanding 出现,component-mapping 未确认)

(label_drift 已自动校正,不出现在此处 —— 详见 implementation-spec.md ## Auto Corrections Metadata)

## Deferred (auto-detected from [deferred] prefix)
- [ ] [Phase A] 趋势数据(钻石余额右侧 ↑/↓ X%):接口完全无字段,本期不实现 trend badge
