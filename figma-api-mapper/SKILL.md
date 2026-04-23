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

## 目标

这个技能的目标不是把接口内容“画进”设计稿，而是先把 Figma 里真正有业务意义的部分抽出来，再判断哪些节点应该来自接口，哪些只是静态 UI 或 UI 文案。

如果存在不确定的节点，技能不会强行猜测，而是把它们保留为待确认项，交给用户调整。

## 输入方式

优先按下面顺序接收输入，拿到其中一种即可开始：

1. Figma MCP 或其他结构化节点数据
   - 适用于已经能直接读取 page、frame、selection 节点树的场景。
   - 优先使用节点名称、层级、重复模式、文本内容、图片引用和组件关系做判断。

2. 用户提供的 Figma 导出 JSON
   - 适用于用户手动导出节点树、页面结构或 inspect 数据的场景。
   - 如果字段很多，先只关注节点层级、文本、图片、组件和命名信息。

3. 截图或局部截图
   - 只在拿不到结构化数据时使用。
   - 视觉分析只能作为补充证据，不能替代节点结构；如果截图不足以稳定判断，明确标成 `unknown`。

如果同时有结构化节点和截图，以结构化节点为主，截图只用来补充语义和视觉上下文。

## 工作流

1. 获取 Figma 数据
   - 先确认用户给的是 page、frame、局部区域，还是截图。
   - 如果范围不清楚，只请求最小必要范围，不扩散到整个文件。

2. 确定范围
   - 从用户选中的 page、frame 或局部区域开始。
   - 忽略目标范围之外的页面和装饰层。

3. 清理非业务节点
   - 去掉状态栏、导航壳、分割线、空容器、背景装饰等。
   - 只在它们有助于解释业务结构时保留布局信息。

4. 识别重复模式
   - 先找列表、卡片、表格、宫格、评论流等重复组件。
   - 同一模板重复出现时，优先抽象成一个模板节点，再标注它是列表项或重复单元。
   - 不要为同一种卡片的每个实例都重复做一份映射，除非实例结构明显不同。

5. 分类有效节点
   - `api_bound`：用户数据、实体字段、列表项、图片、指标、时间、状态。
   - `ui_static`：容器、图标、按钮、间距、阴影、装饰、固定结构。
   - `ui_copy`：提示文案、空状态文案、标签、说明、按钮文案。
   - `unknown`：无法稳定判断，需要用户确认。

6. 对齐接口文档
   - 先理解页面结构，再使用 YAPI 或其他接口文档确认字段。
   - 优先按角色、位置、重复模式和字段语义做映射。
   - 置信度低时不要强行匹配。

7. 只让用户确认风险点
   - 输出 `unknown` 节点。
   - 输出低置信度映射。
   - 图片、长文本、重复列表内容等歧义较高的节点要单独标出。
   - 高置信度的静态 UI 和明显业务字段可以直接进入草案。

8. 输出可审阅草案
   - 结果必须是结构化数据，不要只给自然语言总结。
   - 每个节点都应包含分类、绑定类型、置信度和建议字段。
   - 输出应便于用户修改后，再用于 OpenSpec 设计说明、字段确认或代码生成。

## 接口文档接入约定

这个技能不绑定某一个接口平台，但应明确接口文档来自哪里。支持的来源可以是：

- YAPI 页面或导出的接口定义
- Swagger / OpenAPI 文档
- 后端提供的字段清单
- PRD、数据字典、接口示例响应

接入时遵循下面的约束：

- 先完成页面结构整理，再接接口文档。
- 只对 `api_bound` 或 `unknown` 的节点取接口字段。
- 不要因为有接口文档就把所有层级都查一遍。
- 如果缺少认证、token、URL 或接口上下文，先把结构草案输出出来，并把待补齐信息列为阻塞项。

## 置信度规则

- `0.90` 到 `1.00`：高置信度，可直接进入草案。
- `0.70` 到 `0.89`：中等置信度，可保留建议字段，但建议在摘要里提示快速复核。
- `< 0.70`：低置信度，必须设置 `needs_user_confirmation: true`。
- `unknown` 节点默认需要确认，即使置信度高于 `0.70` 也不应自动当成已确定结论。

## 输出结构

建议输出成类似下面的 JSON：

```json
{
  "screen_name": "订单详情",
  "summary": {
    "api_bound_count": 5,
    "ui_static_count": 8,
    "ui_copy_count": 4,
    "unknown_count": 2,
    "needs_confirmation_count": 2
  },
  "data_sources": {
    "figma_input": "frame JSON",
    "api_source": "YAPI"
  },
  "nodes": [
    {
      "node_id": "title_text",
      "binding_type": "api_bound",
      "ui_role": "primary_title",
      "api_field": "order.title",
      "confidence": 0.94,
      "needs_user_confirmation": false
    },
    {
      "node_id": "promo_text",
      "binding_type": "ui_copy",
      "ui_role": "empty_state_copy",
      "api_field": null,
      "confidence": 0.78,
      "needs_user_confirmation": false
    },
    {
      "node_id": "cover_image",
      "binding_type": "unknown",
      "ui_role": "hero_image",
      "api_field": null,
      "confidence": 0.52,
      "needs_user_confirmation": true,
      "reason": "缺少结构化节点信息，截图无法稳定判断是固定素材还是接口图片"
    }
  ]
}
```

## 端到端示例

下面给一个简化案例，帮助理解预期行为。

### 输入

- Figma 范围：课程列表页中的一个课程卡片区域
- 已知页面元素：
  - 课程封面图
  - 课程标题“少儿美术启蒙”
  - 教师名“王老师”
  - 价格“199 元”
  - 标签“限时优惠”
  - 收藏按钮图标
  - 卡片背景、阴影、圆角
- 接口文档里存在课程列表字段：
  - `course.coverUrl`
  - `course.title`
  - `course.teacherName`
  - `course.price`

### 清理与判断

- 卡片背景、阴影、圆角属于 `ui_static`
- 收藏按钮图标本身属于 `ui_static`
- 标签“限时优惠”如果设计稿无法证明它来自接口，先判为 `ui_copy`
- 标题、教师名、价格、封面图属于重复卡片中的业务字段，判为 `api_bound`
- 同类课程卡片重复出现时，只映射一次模板，并标记为列表项

### 输出示例

```json
{
  "screen_name": "课程列表",
  "summary": {
    "api_bound_count": 4,
    "ui_static_count": 2,
    "ui_copy_count": 1,
    "unknown_count": 0,
    "needs_confirmation_count": 0
  },
  "nodes": [
    {
      "node_id": "course_card_template",
      "binding_type": "ui_static",
      "ui_role": "list_item_container",
      "api_field": null,
      "confidence": 0.95,
      "needs_user_confirmation": false
    },
    {
      "node_id": "course_cover",
      "binding_type": "api_bound",
      "ui_role": "list_item_image",
      "api_field": "course.coverUrl",
      "confidence": 0.96,
      "needs_user_confirmation": false,
      "repeat_group": "course_list_item"
    },
    {
      "node_id": "course_title",
      "binding_type": "api_bound",
      "ui_role": "list_item_title",
      "api_field": "course.title",
      "confidence": 0.98,
      "needs_user_confirmation": false,
      "repeat_group": "course_list_item"
    },
    {
      "node_id": "teacher_name",
      "binding_type": "api_bound",
      "ui_role": "list_item_subtitle",
      "api_field": "course.teacherName",
      "confidence": 0.93,
      "needs_user_confirmation": false,
      "repeat_group": "course_list_item"
    },
    {
      "node_id": "course_price",
      "binding_type": "api_bound",
      "ui_role": "list_item_price",
      "api_field": "course.price",
      "confidence": 0.97,
      "needs_user_confirmation": false,
      "repeat_group": "course_list_item"
    },
    {
      "node_id": "promo_tag",
      "binding_type": "ui_copy",
      "ui_role": "badge_copy",
      "api_field": null,
      "confidence": 0.74,
      "needs_user_confirmation": false
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
- 重复组件优先抽象为模板，再映射模板中的可变字段。

## 下游衔接

这个技能的输出通常用于下面几类后续动作：

- 作为 OpenSpec `design.md` 或 change 草案中的设计到数据映射输入
- 作为前端开发前的字段确认清单
- 作为代码生成、页面搭建或 mock 数据设计的中间结构

如果用户没有明确指定下游目标，默认把结果当成“可审阅的中间草案”，不要直接越过确认环节生成最终代码。

## 不要做的事

- 不要把每个渲染出来的文字都当成硬编码文本。
- 不要强行猜测图片内容。
- 不要把组件实例重复映射成多份相同字段。
- 不要在拿不到结构化节点时假装视觉分析足够精确。
- 不要引入与本技能无关的规范化层。
- 不要让用户审核所有节点，只关注高风险和不确定项。

## 参考

见 [分类与映射规则](references/classification-and-mapping.md)。
