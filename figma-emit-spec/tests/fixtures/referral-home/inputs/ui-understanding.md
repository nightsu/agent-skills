# UI Understanding — referral-home

## Page Structure

- ReferralHomePage
  - DiamondPreviewCard
  - OperationEntryGrid (4 instances)
  - BannerCarousel
  - HotProductList (待 phase C2 确认是否在本视图内)

## Suspected Components

| UI Area | Meaning | Candidate Component | Confidence |
|---|---|---|---|
| 顶部钻石卡片 | 钻石余额 | DiamondPreviewCard | high |
| 4 个运营入口 | 入口网格 | OperationEntryGrid | high |
| Banner | 轮播图 | BannerCarousel | high |
| 商品列表 | 热门商品 | HotProductList | medium |

## Visual Notes
- 整体移动端布局,375 设计宽度
- 卡片式容器,圆角 12px

## Non-business UI To Ignore
- StatusBar / HomeIndicator
- DeviceFrame
- 装饰背景

## Questions
- HotProductList 是否真的在本页(MVP 第 1 屏)?可能需 phase C2 核对 Figma node 确认
