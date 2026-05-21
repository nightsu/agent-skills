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
