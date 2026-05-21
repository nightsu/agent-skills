# §3 — Orchestrator (`figma-workflow`) 行为契约

> 上一篇:[02 File Layout](./02-file-layout.md) · 下一篇:[04a UI-API Mapper](./04a-ui-api-mapper.md)

---

## 调用形态

```
figma-workflow feature=referral-home
```

`feature=` 必传,其它一律没有。

---

## 单次调用做的事(产物驱动,无状态)

```
1. 解析 feature 参数;feature 缺失则报错让用户补
2. 解析 docs/design/<feature>/ (不存在则创建,echo 路径让用户确认拼写)
3. 扫描目录,推断当前进度:
     - 检测哪些产物文件已存在
     - 按"阶段进入条件"(下表)判断"可进入的下一阶段"
4. 打印进度面板(下方 §3.4)
5. 等用户从菜单选下一步
6. 路由到对应 skill,或停在原地等用户编辑
7. skill 执行完毕,产物落盘
8. 触发产物自查(形态 B,详见 §5)
9. 打印 review gate(见 §5)
10. 等用户选,循环回到 3
```

orchestrator **不**自动连跑多阶段。每跑完一阶段必停下,等用户决定下一步。

---

## §3.1 阶段进入条件(产物驱动推断)

| 目标阶段 | 进入条件 | 缺失时的处理 |
|---|---|---|
| 阶段 A (手填) | 永远可进入 | orchestrator 提供模板,让用户复制到 `clarified-requirement.md` 后手填 |
| 阶段 B (手填) | `clarified-requirement.md` 存在且非空 | 同上,缺 A 产物时阻塞 |
| 阶段 C1 (`api-mapping.md`,MVP 手填) | A + B 产物存在 | 阻塞,提示缺哪份 |
| 阶段 C2 (`figma-ui-api-mapper`) | A + B + `api-mapping.md` 存在 | 阻塞 |
| 阶段 D (`figma-design-token`) | A + B + C(api-mapping + component-mapping) 全部 4 份存在 | 阻塞 |
| 阶段 E (`figma-emit-spec`) | A + B + C + D 全部 5 份产物存在 | 阻塞 |

**"产物存在且非空"** 的判定:
- 文件存在
- size > 0
- **不全是模板占位符**

**模板占位符识别:**
- 套件模板里的 `<!-- TBD -->`、`<!-- TODO: ... -->`、`{{...}}` 等标记
- 如果文件中此类标记的剩余数量 > 0,且文件长度未超过模板自身长度的 1.2 倍,
  判定为"未填"(只填了一两行不算)
- 阈值粗略,接受 false positive(用户被误判 → 自行确认或 commit 触发重判)

> ⚠ **MVP 第 1 版的退让:** A/B/C1 是用户手填的,套件无法保证语义质量。
> 判定逻辑只检查"非模板占位",不做语义校验。
> 质量靠用户自觉 + `figma-emit-spec` 阶段的自查兜底。

---

## §3.2 进度面板(每次启动 + 每阶段完成后打印)

```
Feature: referral-home
Dir:     docs/design/referral-home/

Progress:
  [✓] A      clarified-requirement.md          (handwritten, 1.2 KB)
  [✓] B      ui-understanding.md               (handwritten, 2.4 KB)
  [✓] C1     api-mapping.md                    (handwritten, 1.8 KB)
  [✓] C2     component-mapping.md              (figma-ui-api-mapper, 2026-05-20 15:08)
  [ ] D      design-token-patch.md             ← next
  [ ] E      implementation-spec.md
  [ ] E      open-questions.md

Next step:
  [1] Run figma-design-token (phase D)
  [2] Re-run a completed phase
  [3] Manually edit a product
  [4] Exit
```

**面板字段说明:**
- `[✓]` / `[ ]`:产物是否已存在且非占位
- 阶段标签:`A` / `B` / `C1` / `C2` / `D` / `E`
- 文件名 + 来源标注:`(handwritten, <size>)` 或 `(<skill name>, <timestamp>)`
- `← next`:第一个未完成且可进入的阶段

---

## §3.3 错误与异常处理

| 情况 | 处理 |
|---|---|
| `feature=` 缺失 | 报错,提示用法,退出 |
| `docs/design/<feature>/` 不存在 | 创建,echo 提示 |
| 用户选了一个未达进入条件的阶段 | 阻塞,告诉用户"缺哪份产物" |
| skill 执行中报错 | orchestrator **不吞错**,原样透传,产物**不落盘**(保留上一版本) |
| 用户中途 Ctrl-C / 异常退出 | orchestrator **无状态**,下次启动从文件系统重新推断 |
| 上游产物在执行过程中被外部修改 | 不检测;skill 完成后产物会基于当时读到的内容生成 |

---

## §3.4 SKILL.md 必须包含的章节(交付清单)

`figma-workflow` 的 SKILL.md 至少包含:

1. **Frontmatter** — `name: figma-workflow`,`description: ...`
2. **What this skill does** — 三句话总览
3. **Prerequisites** — 用户已知 `<feature>` 名
4. **Calling convention** — `figma-workflow feature=<name>` 的完整说明
5. **Phase progression** — §3.1 表格
6. **Progress panel format** — §3.2 示例
7. **Review gate behavior** — 指向 §5
8. **Handoff exit behavior** — 指向 §5(only at phase E)
9. **What this skill does NOT do** — 不自动连跑、不调用 skill 之外的能力

---

## §3.5 不在 MVP 内的功能(明确划线)

- ❌ 自动连跑多阶段
- ❌ 跨 feature 操作(`figma-workflow list-features` 等)
- ❌ 缓存层 (`.figma-cache/`)
- ❌ Figma 改稿 diff
- ❌ 路径可配置(`figma-workflow.config.json`)
- ❌ 多语言/多框架的 spec 模板(只给一个通用模板)
- ❌ 自动检测上游产物的"语义未填"(只检测占位符)
