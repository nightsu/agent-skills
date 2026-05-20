# Figma Workflow Suite — Design Spec

> Date: 2026-05-20
> Status: Draft, awaiting user review
> Owner: @su
> Source of brainstorming: Obsidian note `AI Tools/figma-skill 讨论.md`

---

## TL;DR

把 Figma 设计稿 + 业务需求落成代码的整套工作流,拆成一个 **6 个 skill 的套件**,
由 orchestrator (`figma-workflow`) 按"产物驱动 + 每阶段 review gate"的方式串联。

第一版 (MVP) 只交付 **4 个 active skill**(orchestrator + 阶段 C/D/E 的 3 个 skill),
阶段 A/B 由用户手填(套件给模板),阶段 F 在 emit-spec 出口处提供 handoff 选项。

完整套件最终覆盖 6 个 skill,但分 3 轮 spec 落地:

- **第 1 版 (本 spec, MVP)**:orchestrator + C/D/E 三个 skill
- **第 2 版**:补 A/B 两个 skill + 外部 handoff(`superpowers:brainstorming` / OpenSpec)
- **第 3 版**:缓存层 / diff / UI handoff 规范

---

## 关键决策摘要(brainstorming 过程中已敲定)

| # | 决策 | 选择 |
|---|---|---|
| 1 | 范围拆分 | B + 推荐套件方案(orchestrator + N 阶段 skill) |
| 2 | Orchestrator 形态 | B 产物驱动(无状态,从 `docs/design/<feature>/` 推断进度) |
| 3a | `<feature>` 命名 | A 用户显式传入 |
| 3b | 产物根目录 | C `docs/design/` 默认 + 可配置(MVP 阶段不实现可配置) |
| 4 | 现有 mapper 处理 | A 改名 + 重定位 → `figma-ui-api-mapper`(职责保持) |
| 5 | 套件 skill 清单 | 6 个 skill,见 [01-overview.md](./01-overview.md) |
| 6 | 与 superpowers/OpenSpec 关系 | 姿势 3:零依赖 + 出口可配置 |
| 7 | 触发与确认机制 | A3 每阶段产物落盘后停顿,等用户 review |
| 7-form | Review gate 形态 | B 产物自查 + 提示 + 菜单 |
| 7a | Re-run 覆盖处理 | ③ git 即真相,不引入备份机制(gate 文案提示 commit) |
| 7b | 手工编辑后回归 | ③ 不区分,用户重新调用 orchestrator 即可 |
| 8 | 输入收集 | B 每阶段开始时收集 + 副产物 `inputs.md` |
| 9 | 阶段间数据流 | A+B 折中(skill 默认按约定路径读,orchestrator 显式注入) |
| 11 | 第一版范围 | 方案 2 三轮渐进,本 spec 是 MVP |
| 11-MVP | MVP 边界 | orchestrator + ui-api-mapper + design-token + emit-spec |
| 12 | 产物格式 | Markdown 表格(优先于 JSON,便于阅读 + git diff) |
| 13 | Handoff 出口选项数 | 4 个:builtin / superpowers / manual / pause(OpenSpec stub 砍掉) |
| 14 | 记忆上次 handoff 选择 | 保留(显示提示,但仍然弹菜单让用户重选) |
| 15 | 迁移策略 | 硬迁移(不保留 `figma-api-mapper` 别名) |

---

## 章节索引

1. [Overview — 套件总览(架构)](./01-overview.md)
2. [File Layout — 目录与文件结构约定](./02-file-layout.md)
3. [Orchestrator — figma-workflow 行为契约](./03-orchestrator.md)
4. Core Skills 契约
   - [4a. figma-ui-api-mapper](./04a-ui-api-mapper.md)
   - [4b. figma-design-token](./04b-design-token.md)
   - [4c. figma-emit-spec](./04c-emit-spec.md)
5. [Review Gate & Handoff](./05-review-gate-and-handoff.md)
6. [Testing, Migration, Risks](./06-testing-migration-risks.md)
7. [Validation Findings — MVP 真实业务跑通的反馈](./validation-findings.md)(2026-05-20 新增)

Suite E2E fixture:[referral-home](../../fixtures/figma-workflow-suite/referral-home/)

---

## 阅读顺序建议

- **想快速理解套件做什么**:README (本文件) → 01-overview
- **想理解每个 skill 的契约**:01 → 02 → 03 → 04a/4b/4c
- **想理解用户体感(怎么跑起来)**:03 → 05
- **想接手实现**:全读

---

## MVP 范围确认(明确划线)

**本 spec 包含:**
- `figma-workflow`(orchestrator,线性 C→D→E)
- `figma-ui-api-mapper`(改名 + 从现有 `figma-api-mapper` 迁移)
- `figma-design-token`(新建)
- `figma-emit-spec`(新建,内置 handoff 出口)
- 每阶段产物 review gate
- 输入收集 + `inputs.md` 副产物

**本 spec 不包含(留给第 2/3 版):**
- 阶段 A/B 的两个 skill(`figma-clarify-requirement`、`figma-ui-understand`)
- 外部 skill handoff 的接入(`superpowers:writing-plans`)
- 缓存层、diff、UI handoff 规范

---

## 下游(spec 通过后)

- 进入 `superpowers:writing-plans` 生成实现计划
- 后续 `subagent-driven-development` 或人工分 task 实施

---

## 来源材料

- Obsidian: `AI Tools/figma-skill 讨论.md`(brainstorming 的原始素材)
- 现有 skill: `/Users/su/codeHub/github/agent-skills/figma-api-mapper/`
  - `SKILL.md`
  - `references/classification-and-mapping.md`
  - `agents/openai.yaml`
