# Clarified Requirement — referral-home

## Goal
实现转介绍首页,展示用户钻石余额、运营入口、banner 轮播、热门商品列表。

## Scope
- 钻石卡片(余额 + 记录入口)
- 运营入口网格(4 个入口)
- Banner 轮播
- 热门商品列表

## Out of Scope
- 钻石记录详情页(本期占位跳转)
- 商品详情页(本期占位跳转)

## User States
- loading / empty / error / success

## Interaction
- 点击钻石记录 → 跳转钻石记录页
- 点击金刚位 → 根据 jumpType 跳转
- 点击商品 → 打开商品详情或兑吧 H5

## Constraints
- 使用项目现有 React + TypeScript 栈
- 移动端优先

## Open Questions
- [ ] [deferred] 趋势数据(钻石余额右侧 ↑/↓ X%):接口完全无字段,本期不实现 trend badge
- [ ] 入口数量是否固定 4 个?
- [ ] 商品列表是否分页?
