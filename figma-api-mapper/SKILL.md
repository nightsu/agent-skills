---
name: figma-api-mapper
description: 用于清理 Figma 页面中的非业务噪音，区分接口数据与静态 UI，并输出可审阅的 UI 到接口映射草案。适用于页面节点很多、存在重复模板、静态文案较多，或需要结合 YAPI/API 文档对齐设计稿的场景。
---

# Figma API 映射器

## 适用场景

- 需要从 Figma 页面或 Frame 中提取业务结构
- 页面里有状态栏、导航壳、装饰层等非业务节点，需要先清理
- 设计稿里混有接口字段、固定文案和图片资源，需要区分哪些应该走数据绑定
- 已有 YAPI 或其他接口文档，希望把设计稿和接口字段做结构化映射

## 概览

这个技能的目标不是把接口内容“画进”设计稿，而是先把 Figma 里真正有业务意义的部分抽出来，再判断哪些节点应该来自接口，哪些只是静态 UI 或 UI 文案。

如果存在不确定的节点，技能不会强行猜测，而是把它们保留为待确认项，交给用户调整。

## 工作流

1. 确定范围
   - 从用户选中的 page、frame 或局部区域开始。
   - 忽略目标范围之外的页面和装饰层。

2. 清理非业务节点
   - 去掉状态栏、导航壳、分割线、空容器、背景装饰等。
   - 只在它们有助于解释业务结构时保留布局信息。

3. 分类有效节点
   - `api_bound`：用户数据、实体字段、列表项、图片、指标、时间、状态。
   - `ui_static`：容器、图标、按钮、间距、阴影、装饰、固定结构。
   - `ui_copy`：提示文案、空状态文案、标签、说明、按钮文案。
   - `unknown`：无法稳定判断，需要用户确认。

4. 对齐接口文档
   - 先理解页面结构，再使用 YAPI 或其他接口文档确认字段。
   - 优先按角色、位置、重复模式和字段语义做映射。
   - 置信度低时不要强行匹配。

5. 只让用户确认风险点
   - 输出 `unknown` 节点。
   - 输出低置信度映射。
   - 图片、长文本、重复列表内容等歧义较高的节点要单独标出。
   - 高置信度的静态 UI 和明显业务字段可以直接进入草案。

6. 输出可审阅草案
   - 结果必须是结构化数据，不要只给自然语言总结。
   - 每个节点都应包含分类、绑定类型、置信度和建议字段。
   - 方便用户修改后再定稿。

## 输出结构

建议输出成类似下面的 JSON：

```json
{
  "screen_name": "订单详情",
  "summary": {
    "api_bound_count": 5,
    "ui_static_count": 8,
    "ui_copy_count": 4,
    "unknown_count": 2
  },
  "nodes": [
    {
      "node_id": "title_text",
      "binding_type": "api_bound",
      "ui_role": "primary_title",
      "api_field": "order.title",
      "confidence": 0.94
    },
    {
      "node_id": "promo_text",
      "binding_type": "ui_copy",
      "ui_role": "empty_state_copy",
      "confidence": 0.78
    },
    {
      "node_id": "cover_image",
      "binding_type": "unknown",
      "ui_role": "hero_image",
      "api_field": null,
      "confidence": 0.52,
      "needs_user_confirmation": true
    }
  ]
}
```

## 判定规则

- 如果节点会随着数据变化，优先判为 `api_bound`。
- 如果节点主要承担布局或交互壳层作用，优先判为 `ui_static`。
- 如果节点是用户可见文案，但不是业务数据，判为 `ui_copy`。
- 如果节点可能是两者之一，判为 `unknown` 并要求确认。
- 图片优先使用 URL 或资源引用，不要展开或嵌入图片内容。

## 何时接入 YAPI

- 先完成页面结构整理，再接接口文档。
- 只对 `api_bound` 或 `unknown` 的节点取接口字段。
- 不要因为有接口文档就把所有层级都查一遍。

## 不要做的事

- 不要把每个渲染出来的文字都当成硬编码文本。
- 不要强行猜测图片内容。
- 不要引入与本技能无关的规范化层。
- 不要让用户审核所有节点，只关注高风险和不确定项。

## 参考

见 [分类与映射规则](references/classification-and-mapping.md)。
