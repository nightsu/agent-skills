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
