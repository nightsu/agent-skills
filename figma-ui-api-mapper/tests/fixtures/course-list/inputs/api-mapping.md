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
