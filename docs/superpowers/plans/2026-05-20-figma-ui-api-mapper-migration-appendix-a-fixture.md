# Plan P1 — Appendix A: Fixture Content for `course-list`

> Companion of: [2026-05-20-figma-ui-api-mapper-migration.md](./2026-05-20-figma-ui-api-mapper-migration.md)
>
> 本附录提供 Task 6 中要写入 `figma-ui-api-mapper/tests/fixtures/course-list/` 下各文件的**完整内容**。
> 主 plan 文件控制总长度 ≤ 1000 行,故 fixture 内容剥离到本附录。

---

## A1. `tests/fixtures/course-list/README.md`

```markdown
# Fixture: course-list

回归 fixture,用于验证 `figma-ui-api-mapper` 的等价行为。

**来源:** 沿用原 `figma-api-mapper` SKILL.md 中"端到端示例"的课程列表案例,
转为 Markdown 表格输出。

## 用途

人工 review 验证。让 Agent 读 `inputs/` 下的 4 份模拟输入,产出 `component-mapping.md`,
和 `expected/component-mapping.md` 对比,确认**语义等价**(允许置信度数值 ±0.05 浮动,
不要求逐字符相同)。

## 文件

- `inputs/clarified-requirement.md` — 模拟用户阶段 A 手填产物
- `inputs/ui-understanding.md` — 模拟用户阶段 B 手填产物
- `inputs/api-mapping.md` — 模拟用户阶段 C1 手填产物
- `inputs/figma-node.json` — 模拟 Figma MCP 返回的节点 JSON
- `expected/component-mapping.md` — 期望产物

## MVP 验证方式

人工 review。Agent 跑完后,用 `diff` 看产物 vs expected,语义不一致由人判定。

## 未来

第 3 版引入 LLM-as-judge 或结构化等价检查,自动化此 fixture 的验证。
```

---

## A2. `tests/fixtures/course-list/inputs/clarified-requirement.md`

```markdown
# Clarified Requirement — course-list

## Goal
实现课程列表页,展示一组课程卡片,用户可点击进入课程详情。

## Scope
- 课程卡片(封面图、标题、教师名、价格)
- 列表区域(垂直滚动)

## Out of Scope
- 筛选、排序、搜索(本期不做)
- 报名/购买流程(交给详情页)

## User States
- 加载态(loading)
- 空状态(empty)
- 错误态(error)
- 正常列表

## Interaction
- 点击课程卡片 → 跳转课程详情页
- 点击收藏图标 → 收藏/取消收藏(本期 stub)

## Constraints
- 使用项目现有组件库
- 移动端优先

## Open Questions
- 列表是否分页?(待定,假定不分页)
- 限时优惠标签是否后端控制?(待定,先按固定文案)
```

---

## A3. `tests/fixtures/course-list/inputs/ui-understanding.md`

```markdown
# UI Understanding — course-list

## Page Structure
- Header
- CourseListSection
  - CourseCard (重复)

## Suspected Components

| UI Area | Meaning | Candidate Component | Confidence |
|---|---|---|---|
| 课程卡片 | 课程信息展示 | CourseCard | high |
| 列表容器 | 卡片网格/列表 | CourseList | high |

## Visual Notes
- 卡片含封面图、标题、教师名、价格、收藏按钮、限时优惠标签
- 卡片背景、阴影、圆角属于装饰性
- 标签"限时优惠"位置固定

## Non-business UI To Ignore
- StatusBar
- HomeIndicator
- 装饰背景

## Questions
- 入口数量是否固定?
- 是否有空状态单独设计?
```

---

## A4. `tests/fixtures/course-list/inputs/api-mapping.md`

```markdown
# API Mapping — course-list

## Data Sources

| UI Module | API | Method | Description |
|---|---|---|---|
| CourseList | /api/course/list | GET | 获取课程列表 |

## Field Mapping

| UI Field | API Field | Type | Transform | Notes |
|---|---|---|---|---|
| 封面图 | course.coverUrl | string | CDN URL | 需要兜底图 |
| 标题 | course.title | string | none | - |
| 教师名 | course.teacherName | string | none | - |
| 价格 | course.price | number | formatPrice(单位:元) | - |

## State Mapping

| State | Trigger | UI Behavior |
|---|---|---|
| loading | request pending | 展示骨架屏 |
| empty | list.length === 0 | 展示空状态 |
| error | request failed | 展示错误 toast |
```

---

## A5. `tests/fixtures/course-list/inputs/figma-node.json`

```json
{
  "file_key": "FixtureCourseList0001",
  "node_id": "100:200",
  "name": "CourseListPage",
  "type": "FRAME",
  "children": [
    {
      "id": "100:201",
      "name": "StatusBar",
      "type": "FRAME",
      "children": []
    },
    {
      "id": "100:202",
      "name": "Header",
      "type": "FRAME",
      "children": [
        { "id": "100:203", "name": "Title", "type": "TEXT", "characters": "课程列表" }
      ]
    },
    {
      "id": "100:210",
      "name": "CourseList",
      "type": "FRAME",
      "children": [
        {
          "id": "100:211",
          "name": "CourseCard",
          "type": "INSTANCE",
          "componentId": "comp-course-card",
          "children": [
            { "id": "100:212", "name": "course_cover", "type": "RECTANGLE", "fills": [{ "type": "IMAGE", "imageRef": "cover-001" }] },
            { "id": "100:213", "name": "course_title", "type": "TEXT", "characters": "少儿美术启蒙" },
            { "id": "100:214", "name": "teacher_name", "type": "TEXT", "characters": "王老师" },
            { "id": "100:215", "name": "course_price", "type": "TEXT", "characters": "199 元" },
            { "id": "100:216", "name": "promo_tag", "type": "TEXT", "characters": "限时优惠" },
            { "id": "100:217", "name": "favorite_icon", "type": "VECTOR" },
            { "id": "100:218", "name": "card_bg", "type": "RECTANGLE", "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }] }
          ]
        },
        {
          "id": "100:221",
          "name": "CourseCard",
          "type": "INSTANCE",
          "componentId": "comp-course-card",
          "children": [
            { "id": "100:222", "name": "course_cover", "type": "RECTANGLE", "fills": [{ "type": "IMAGE", "imageRef": "cover-002" }] },
            { "id": "100:223", "name": "course_title", "type": "TEXT", "characters": "趣味数学启蒙" },
            { "id": "100:224", "name": "teacher_name", "type": "TEXT", "characters": "李老师" },
            { "id": "100:225", "name": "course_price", "type": "TEXT", "characters": "249 元" },
            { "id": "100:226", "name": "promo_tag", "type": "TEXT", "characters": "限时优惠" },
            { "id": "100:227", "name": "favorite_icon", "type": "VECTOR" },
            { "id": "100:228", "name": "card_bg", "type": "RECTANGLE", "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }] }
          ]
        }
      ]
    },
    {
      "id": "100:290",
      "name": "HomeIndicator",
      "type": "FRAME",
      "children": []
    }
  ]
}
```

---

## A6. `tests/fixtures/course-list/expected/component-mapping.md`

```markdown
# Component Mapping — course-list

> Generated by figma-ui-api-mapper@0.4.0 at 2026-05-20T15:08:33+08:00
> Source: figma file=FixtureCourseList0001 node=100:200 (CourseListPage)

## Summary

- api_bound: 4
- ui_static: 2
- ui_copy: 1
- unknown: 0
- needs_confirmation: 0

## Modules

### CourseCard
| node_id | binding_type | ui_role | api_field | confidence | needs_confirmation | reason | repeat_group |
|---|---|---|---|---|---|---|---|
| course_card_template | ui_static | list_item_container | — | 0.95 | false | — | course_list_item |
| course_cover | api_bound | list_item_image | course.coverUrl | 0.96 | false | — | course_list_item |
| course_title | api_bound | list_item_title | course.title | 0.98 | false | — | course_list_item |
| teacher_name | api_bound | list_item_subtitle | course.teacherName | 0.93 | false | — | course_list_item |
| course_price | api_bound | list_item_price | course.price | 0.97 | false | — | course_list_item |
| promo_tag | ui_copy | badge_copy | — | 0.74 | false | 无证据表明来自接口 | course_list_item |
| favorite_icon | ui_static | action_icon | — | 0.92 | false | — | course_list_item |

## Open Questions
(无)

## Ignored Nodes
- StatusBar / HomeIndicator
```
