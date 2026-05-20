# Validation Findings — figma-workflow-suite MVP

> Date: 2026-05-20
> Source: 真实业务跑通 phase A→B→C-up→C-low→D 的 end-to-end fixture
> Test feature: 销售工作台 - 管理者数据看板(商品维度)
> Detailed report: `/Users/su/codeHub/personal/figma-workflow-test/docs/design/sale-workbench/validation-report.md`(本地)
>
> 本文档只列对 spec 设计有影响的发现 + actionable 改动建议。

---

## 🚨 Finding 1 [必修]:phase C-low 字段映射 12/15 错位

**症状:**
- `figma-ui-api-mapper` 跑完,产出的 `component-mapping.md` 在真实业务中字段映射错位率 80%(12/15)
- 错位的本质:label 推测靠"位置 + 字段名字面拼凑",大量翻车

**根因:**
- Spec §4a `figma-ui-api-mapper` 工作流第 2 步:`get_metadata`(拿结构)+ `get_design_context`(拿视觉细节)
- 但**实际跑的时候**,phase C-low 只关心结构 + 字段对齐,通常只调 `get_metadata`
- 而 Figma 的 `node.name` 在真实业务中**经常是设计师 placeholder**(本案例 100% 是 `"首联率"`)
- 真实文案在 `node.characters` 字段,**只有 `get_design_context` 才能拿到**
- 结果:phase C-low 看不到真实文案,字段映射只能靠拼凑 → 大概率出错

**修复(改动 spec §4a):**
1. 工作流第 2 步明确要求:**同时调用** `get_metadata` 和 `get_design_context`,从 `characters` 提取真实文案作为 label 的事实来源
2. 在"关键行为"段补一条:**"以 `characters` 字段(不是 `node.name`)作为真实业务文案"**
3. 在"不做的事"段补一条:**"不要把 Figma `node.name` 当作真实业务 label,大概率是设计师 placeholder"**

**影响范围:** P1 已交付的 `figma-ui-api-mapper` skill 需要重写 SKILL.md 工作流第 2 步(单独发一个 fix PR)。

---

## 🚨 Finding 2 [必修]:`label_drift` 跨产物冲突类型缺失

**症状:**
phase D `figma-design-token` 拿到真实 label 后,发现与 phase C-low `component-mapping.md` 的 label 推测大量不一致。
当前 spec §4c `figma-emit-spec` 的 cross-product conflict 检测只列了 3 种类型,**没有 `label_drift` 这一种**。

**根因:**
spec §4c 假设 phase C-low 拿到的 label 是可靠的。修了 Finding 1 后,这个假设大部分时候成立,
但仍存在 edge case(如:Figma 中部分文本节点 characters 也是 placeholder)。

**修复(改动 spec §4c):**
1. cross-product conflict 检测段增加第 4 种类型:`label_drift`
2. 处理规则:**如果 phase D 提供了明确真实 label,自动以 phase D 为准**(不写入 open-questions,因为答案已知)
3. 在 implementation-spec 的 metadata 段说明:"X 个 label 在合成时从 C-low 自动校正为 D 真实值"

**影响范围:** P3 `figma-emit-spec` 的 spec(§4c)。

---

## ⚠ Finding 3 [建议]:无解决路径的 open question 应支持 `defer` 标记

**症状:**
本次真实业务的"趋势数据来源"是设计 vs 后端不对齐的真实业务 gap(接口完全无字段,设计稿要展示)。
spec 现有 open question 机制成功暴露了它,但没有"如何处理它"的指引 ——
review gate 只说"强烈建议先回答再 handoff",但没有"如果回答不了怎么办"。

实施时开发者会陷入"trend badge 实现 vs 不实现"的循环纠结。

**修复(改动 spec §4c):**
1. open question 支持 `[deferred]` 前缀(用户判断"本期无法解决")
2. emit-spec 在 implementation-spec 的 Modules 段对 deferred 的 UI 元素**显式标记**:
   "该 UI 元素暂无数据源,本期不实现,占位渲染或隐藏"
3. Verification Checklist 增加一项:"所有 deferred items 已确认本期不实现"

**影响范围:** P3 `figma-emit-spec` 的 spec(§4c)。

---

## ⚠ Finding 4 [建议]:phase C-up 字段数 vs 槽位数核对必须读 metadata

**症状:**
本次 Claude 起草的 phase C-up `api-mapping.md` 误判 "ConversionSection 缺 1 字段" ——
原因是只看截图,没读 Figma metadata,把"2 跨行 cell"看成"3 个 cell"。

**修复(改动 spec §4 of phase C-up,或者直接补到第 2 版的 `figma-api-first` 设计):**
1. 第 2 版 `figma-api-first` skill 工作流明确:**字段数 vs 槽位数核对必须读 Figma metadata,不要只看截图**
2. MVP 阶段(手填)的 phase C-up 模板加一句 warning

**影响范围:** 第 2 版 spec 的 `figma-api-first` 设计(尚未写)。

---

## ℹ Finding 5 [Observation]:Spec 的"严格只读传入 node,不扩散"原则真实有效

本次 frame `122924:5188` 处于一个更大的看板页面里,严格不扩散这一约束直接防止了 token 浪费,
也防止了 mapper 拿到"不属于本次任务"的兄弟模块。

不需要改 spec,只是记录:**这个原则要在 P3/P4/P5 的所有 skill 里继续坚持。**

---

## ℹ Finding 6 [Observation]:Variable 体系真实业务中可能很弱

本次设计稿 3 列分别用了绿 `#19992a` / 蓝 `#007bff` / 橙 `#f80`,但都是字面色值,
**没有定义 `color/category/firstContact` 等语义化 variable**。

spec §4b "Source 列三种取值" 已经预见(`direct` 是合法值),phase D 完整记录后,设计师可以反推。
**不需要改 spec,只是设计系统层面的工作。**

---

## Actionable 改动清单(供后续 commit 用)

| Finding | 改 spec 哪里 | 优先级 | 状态 |
|---|---|---|---|
| F1 | `04a-ui-api-mapper.md` 工作流第 2 步 + 关键行为 + 不做的事 | 🚨 必修 | 本 PR 修 |
| F1 | P1 已交付的 `figma-ui-api-mapper/SKILL.md` 同步修改 | 🚨 必修 | 单独 PR 修(因为是已交付 skill 的修改) |
| F2 | `04c-emit-spec.md` cross-product conflict 增加 `label_drift` | 🚨 必修 | 本 PR 修 |
| F3 | `04c-emit-spec.md` 增加 `[deferred]` open question 机制 | ⚠ 建议 | 本 PR 修 |
| F4 | 第 2 版 spec 的 `figma-api-first` 设计纳入 | ⚠ 建议 | 待第 2 版 spec |

> 本 PR(`fix/spec-from-mvp-validation` 分支)修改 spec(F1 spec + F2 + F3)。
> P1 的 SKILL.md 修复另开 PR(因为是已交付 skill 的改动,需独立 review)。
