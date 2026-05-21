# User Request — Sales Workbench

请基于 Figma 节点实现后台销售工作台指标区。

技术栈: React + Vite + TypeScript。

页面需要展示三个业务阶段:

- 首联
- 需求
- 转化

接口返回值包含:

- firstContactSection
- demandSection
- conversionSection

每个指标字段都是:

```ts
type MetricValue = {
  denominator: number;
  numerator: number;
  percent: number;
};
```

本期使用 mock 数据验证 workflow MVP,不做真实后端联调。
