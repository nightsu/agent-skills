# §6 — Testing, Migration, Risks

> 上一篇:[05 Review Gate & Handoff](./05-review-gate-and-handoff.md) · 回到:[README](./README.md)

---

## §6.1 测试策略(MVP)

### 单元层面

每个 skill 是 Markdown 指引文档,无法传统单测。改为**契约示例验证**:
- 每个 skill 在仓库内附 `tests/fixtures/<scenario>/` 目录
- 每个 fixture 含输入(模拟 Figma node JSON / 模拟上游产物 .md)+ 期望输出(参考产物 .md)
- 验证手段:**人工 review**,或后续接 LLM-as-judge(MVP 不做)

### 集成层面

- 准备 **1~2 个真实业务场景** 的 end-to-end fixture(例:讨论文档里的 referral-home 案例)
- 跑完整 C→D→E 链路,产物落盘,人工 review 产物质量
- Suite-level fixture:
  `docs/superpowers/fixtures/figma-workflow-suite/referral-home/`

### 回归层面

- `figma-ui-api-mapper` 改名后,必须用现有 `figma-api-mapper` 的端到端示例
  (SKILL.md 里的"课程列表"案例)做一次**完整跑通**
- 产物等价于现有 JSON 输出**转 Markdown 后**的结果

### MVP 不做

- ❌ 自动化 CI 测试
- ❌ skill 之间的接口契约测试
- ❌ 性能测试(token 消耗)
- ❌ LLM-as-judge 评分

---

## §6.2 迁移策略 — `figma-api-mapper` → `figma-ui-api-mapper`

### 改动清单

```
github/agent-skills/figma-api-mapper/    →   github/agent-skills/figma-ui-api-mapper/
  SKILL.md                                     SKILL.md (重写,见下方)
  references/                                  references/
    classification-and-mapping.md                classification-and-mapping.md (内容保持)
  agents/openai.yaml                           agents/openai.yaml (改 display_name + prompt)
```

### `SKILL.md` 重写要点

- **frontmatter `name`** 改为 `figma-ui-api-mapper`
- **`description`** 调整:强调"阶段 C 末尾,合 `api-mapping.md` + Figma node → `component-mapping.md`"
- 顶部新增 **"Renamed from figma-api-mapper. Old name no longer works."** 声明
- 新增 **"Prerequisites"** 段:明确依赖 A/B/C-api-first 产物存在
- 新增 **"Position in figma-workflow"** 段:说明在套件中的位置(可被 orchestrator 调,也可独立调)
- "工作流" 段保留 8 步,补充"读取上游 .md 产物"的指引
- **"输出结构"** 段从 JSON **改为 Markdown 表格**(§4a 的格式)
- "下游衔接" 段:指向 `figma-design-token` 和 `figma-emit-spec`

### `agents/openai.yaml` 改动

```yaml
interface:
  display_name: "Figma UI-API 映射器"  # 改
  short_description: "清理 Figma 噪音,区分 UI 与接口字段,输出 component-mapping.md"  # 微调
  default_prompt: "使用 $figma-ui-api-mapper 清理 Figma 节点,区分 api_bound、ui_static、ui_copy 和 unknown,合并 api-mapping.md,输出 docs/design/<feature>/component-mapping.md"  # 改
```

### 旧 skill 处理(决策 15)

- **不保留** `figma-api-mapper` 作为别名(MVP 不做软兼容,改名就是改名)
- 在新 skill SKILL.md 顶部放一段
  `> ⚠ Renamed from figma-api-mapper. Old name no longer works.` 提示
- 老用户(包括你自己其它笔记/项目)需要**手工**把 `$figma-api-mapper` 引用全部改成 `$figma-ui-api-mapper`

### 风险

- 你自己的笔记 / Obsidian 卡片 / 项目 README 里可能有旧名引用
- 改完后用以下命令扫一遍并替换:
  ```bash
  grep -rn "figma-api-mapper" ~/codeHub ~/.obsidian-vault  # 实际 vault 路径自填
  ```

---

## §6.3 风险登记表

| # | 风险 | 严重度 | 触发条件 | 缓解 |
|---|---|---|---|---|
| R1 | MVP 阶段 A/B 用户手填质量差,污染下游产物 | 高 | 用户偷懒,套件模板填得潦草 | `figma-emit-spec` 自查会 surface open-questions;但本质要靠用户自觉。第 2 版接 `superpowers:brainstorming` 解决 |
| R2 | Figma MCP 输出格式变化,破坏 ui-api-mapper / design-token | 中 | Figma 升级 MCP 接口 | 在 skill 里固定调用的 MCP 函数版本意识;输出格式断时,产物自查会爆"字段缺失";靠人工发现 |
| R3 | Re-run 覆盖产物,用户没 commit,丢工作 | 中 | 用户跳过 review gate 的 commit 提示 | gate 文案明确提示;不引入备份机制(决策 7a-③) |
| R4 | `superpowers:writing-plans` 升级/改名,handoff 选项 2 失效 | 中 | superpowers 自身迭代 | orchestrator 在 handoff 阶段做存在性检测;失败时降级到选项 1 (builtin) 并提示 |
| R5 | `component-mapping.md` 和 `design-token-patch.md` 节点引用不一致(改了 Figma 但只重跑 D 没重跑 C) | 中 | 用户跳着重跑 | `figma-emit-spec` 自查会爆"跨产物冲突";gate 标红提示 |
| R6 | `inputs.md` 一直追加,长期变成几百行 | 低 | feature 长期迭代 | MVP 接受;第 4 版加截断/归档机制 |
| R7 | MVP 不测试,LLM 输出漂移导致产物质量退化 | 中 | 时间推移,模型版本变化 | 保留 fixture 做 spot-check;真正出问题后回头补自动化测试 |
| R8 | 用户在非 git 仓库使用,Re-run 没有"git 真相"兜底 | 低 | 用户在临时目录跑 | 文档警告:"建议在 git 仓库内使用";不做检测 |
| R9 | `<feature>` 名拼错,产物落到错目录 | 低 | 用户手误 | orchestrator 启动时 echo 路径让用户确认 |
| R10 | 上游产物 markdown 解析失败(用户手工编辑破坏格式) | 中 | 用户瞎改产物文件结构 | emit-spec 错误处理透传,产物不落盘 |

---

## §6.4 成功标准(MVP 完工的定义)

1. **现有 `figma-api-mapper` 的"课程列表"案例**能用 `figma-ui-api-mapper` 跑通,
   产物为 Markdown 表格,内容等价

2. **讨论文档的 referral-home 案例**能从模拟产物 A/B 开始,跑完 C→D→E,
   产出 `implementation-spec.md` 且**该 spec 能被另一个 Agent 在不读任何上游产物的情况下完成实现**
   (来源材料第 17 节:"用更少 token 让 Agent 看到更准确的工程语义"的目标)

3. Handoff 出口到 `superpowers:writing-plans` 链路打通,能拿到 implementation plan

4. **文档完整**:每个 skill 自带 SKILL.md + 至少 1 个 fixture + README

---

## §6.5 不在 MVP 内的功能(汇总,作为第 2/3/4 版输入)

### 第 2 版

- `figma-clarify-requirement`(替代手填阶段 A)
- `figma-ui-understand`(替代手填阶段 B)
- handoff 接入 `superpowers:brainstorming`(阶段 A 的可选项)
- `inputs.md` 截断/归档

### 第 3 版

- `figma-api-first` 替代手填阶段 C-up,产出 `api-mapping.md`
- `figma-api-first` 先支持用户粘贴接口结构 / 字段清单,再评估 YApi/Swagger 实际抓取
- 字段数 vs UI 槽位数核对必须读 Figma metadata,不能只看截图

### 第 4 版

- `.figma-cache/` 三层缓存
- `design-diff.md` Figma 改稿差量
- UI handoff 最低规范文档(给设计师的)
- 资源(图片/icon)实际下载
- 自动化测试 / LLM-as-judge
- 多语言/多框架的 spec 模板(react / vue / 小程序 / taro)
- 路径可配置(`figma-workflow.config.json`)
