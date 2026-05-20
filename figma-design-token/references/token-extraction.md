# Token 抽取细节

本文档补充 `SKILL.md` 中的抽取规则,重点放在陷阱、边界场景和 INFERRED 判定,不重复主流程。

## 字体名陷阱

Figma 中字体的 `style` 字段在不同字族下命名不一致,常见陷阱:

| 字族 | 错误写法 | 正确写法 |
|---|---|---|
| Inter | `SemiBold` | `Semi Bold`(有空格) |
| Inter | `ExtraBold` | `Extra Bold`(有空格) |
| SF Pro | `Heavy` | `Heavy`(无空格,正确) |
| 苹方 / PingFang | `Regular` | `Regular`(无空格,正确) |

抽 token 时**原样保留 Figma 返回的字符串**,不做大小写转换、不做空格归一化。

## Source 列判定规则

| 取值 | 判定条件 |
|---|---|
| `direct` | 从 Figma 节点的 `style` / `fills` / `strokes` / `effects` 直接读出 |
| `variable: <name>` | 节点属性绑定到一个 Figma variable(via `boundVariables`) |
| `INFERRED (<原因>)` | 节点本身不直接给出,从结构推断而来(如网格列数、列表行数) |

**判定优先级:** variable > direct > INFERRED。
同一个 token 既能 direct 读又被 variable 绑定时,优先标 variable(因为 variable 是设计意图)。

## INFERRED 的常见场景

- `columnCount`(网格列数)— Figma 不直接给,从子节点数量推断
- `rowGap` / `columnGap`(在没用 Auto Layout 的页面)— 从子节点位置间距推断
- `itemMinHeight`(列表项最小高度)— 从多个实例的最小高度推断
- `lineHeight`(部分 Figma 版本不导出)— 从文本节点高度 / fontSize 反推

**所有 INFERRED 必须在 `Source` 列写明推断依据**,例如:
- `INFERRED (4-instance grid)`
- `INFERRED (gap between siblings)`
- `INFERRED (min height across 3 list items)`

## Variables 段的填充

`## Variables` 段汇总所有被关联的 Figma variables。每条记录:

```
| color/brand/primary | #FF6A3D | DiamondPreviewCard.valueColor |
```

- `Name` 列:Figma variable 的 collection/name(原样保留斜杠)
- `Value` 列:解析后的值(色值用 `#RRGGBB`,间距用 `Npx`)
- `Used by` 列:用 `<ModuleName>.<tokenName>` 格式列出**所有**使用方,多个用换行分隔

如果一个 variable 被多个 module 使用,`Used by` 多行:

```
| color/brand/primary | #FF6A3D | DiamondPreviewCard.valueColor<br>BannerCarousel.indicatorActive |
```

## Assets 段的填充

只对**实际承载视觉资源**的节点出条目:
- `IMAGE` 填充的 RECTANGLE / FRAME
- `VECTOR` 节点(icon)
- 带 imageRef 的 BOOLEAN_OPERATION

**不出条目**的情况:
- 纯色填充的容器(`Suggested Export` 留 `—`,或直接跳过)
- 装饰背景(在 phase C-low `Ignored Nodes` 中已过滤)

**推荐导出格式:**

| 资源类型 | 推荐格式 |
|---|---|
| 照片(banner / cover) | png |
| icon(几何图形) | svg |
| 复杂插画 | svg(若失真则 png) |
| 渐变 / 纯色 | 跳过,用 CSS 实现 |

## Component-mapping 与 design-token 对齐

`design-token-patch.md` 的每个 `### <ModuleName>` **必须**对应 `component-mapping.md` 的同名 module。

**对齐规则:**
- module 名**原样**复制,不做改写
- module 名顺序与 `component-mapping.md` 保持一致
- 若 component-mapping 有但本产物找不到对应节点,**仍要列出该 module**,表格留空 + self-check 警告

## 不要做的事

- ❌ 不抽取 `api_bound` 节点的文本内容(那是样例数据)
- ❌ 不下载资源(MVP 阶段只给引用)
- ❌ 不读取整个 Figma 文件,不读兄弟 frame
- ❌ 不归一化字体名(原样保留)
- ❌ 不修改上游 `component-mapping.md`
