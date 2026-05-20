# API Mapping — referral-home

## Data Sources

| UI Module | API | Method | Description |
|---|---|---|---|
| DiamondPreviewCard | /api/diamond/overview | GET | 钻石概览 |
| OperationEntryGrid | /api/operation/entries | GET | 运营入口列表 |
| BannerCarousel | /api/banner/list | GET | banner 列表 |

## Field Mapping

| UI Field | API Field | Type | Transform |
|---|---|---|---|
| 钻石数量 | user.diamond.balance | number | formatNumber |
| 运营入口 icon | entries[].iconUrl | string | CDN URL |
| 运营入口 title | entries[].title | string | none |
| banner 图 | banners[].imageUrl | string | CDN URL |

## State Mapping

| State | Trigger | UI Behavior |
|---|---|---|
| loading | request pending | 骨架屏 |
| empty | list.length === 0 | 空状态 |
| error | request failed | 错误 toast |
