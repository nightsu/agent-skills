# §2 — File Layout / 目录与文件结构约定

> 上一篇:[01 Overview](./01-overview.md) · 下一篇:[03 Orchestrator](./03-orchestrator.md)

---

## 用户业务仓库内的产物布局

```
<repo-root>/
└── docs/design/<feature>/                   # 所有阶段产物 + 输入元数据
    ├── inputs.md                            # ★ 各阶段输入元数据(自动追加)
    ├── .workflow-prefs.json                 # 本 feature 偏好(emit-spec 首次写入)
    │
    ├── clarified-requirement.md             # 阶段 A 产物 (MVP 用户手填,套件给模板)
    ├── ui-understanding.md                  # 阶段 B 产物 (MVP 用户手填,套件给模板)
    │
    ├── api-mapping.md                       # 阶段 C1 产物 (MVP 用户手填 / 第 3 版 figma-api-first)
    ├── component-mapping.md                 # 阶段 C - figma-ui-api-mapper 产物
    ├── design-token-patch.md                # 阶段 D - figma-design-token 产物
    ├── implementation-spec.md               # 阶段 E - figma-emit-spec 主产物
    └── open-questions.md                    # 阶段 E - 跨阶段问题汇总
```

> MVP 阶段**没有** `figma-workflow.config.json`(决策:砍掉,默认硬编码 `docs/design/`)。
> 第 4 版可加入。

---

## `<feature>` 命名规范

- 用户**显式传入**(决策 3a-A),orchestrator 不猜
- 推荐 kebab-case(`referral-home`、`order-detail`),与目录名一致
- orchestrator 启动时如发现 `docs/design/<feature>/` 不存在,会**创建并 echo 路径**让用户确认拼写

---

## `inputs.md` 形态

**作用:** 审计记录。说明"这次 spec 用了哪个版本的 Figma / 哪个 YApi 接口",
diff 时知道边界条件变没变。

**机制:** 每阶段执行后**追加**一段,不覆盖。

**MVP 示例:**

```markdown
# Inputs Log — referral-home

## 2026-05-20T14:32:11+08:00 — phase C (figma-api-first, manual)
- source: YApi (manual transcription)
- url: https://yapi.example.com/project/123/interface/456
- captured fields: 5 (overview, entries, goods, banner, footer)
- captured by: user manual entry into api-mapping.md

## 2026-05-20T15:08:33+08:00 — phase C (figma-ui-api-mapper)
- figma_file_key: AbCdEfG12345
- figma_node_id: 123:456
- node_name: ReferralHomePage
- mapper_version: 0.4.0

## 2026-05-20T15:42:01+08:00 — phase D (figma-design-token)
- figma_file_key: AbCdEfG12345
- figma_node_id: 123:456
- exported assets references: 4 (banner_image, icon_diamond, icon_arrow, bg_card)
- token_version: 0.1.0

## 2026-05-20T16:10:22+08:00 — phase E (figma-emit-spec)
- inputs read: clarified-requirement.md, ui-understanding.md, api-mapping.md, component-mapping.md, design-token-patch.md
- emit_version: 0.1.0
- handoff choice: superpowers
```

**字段约定:**
- 每条以 `## <ISO8601 timestamp> — phase <X> (<skill name>[, <mode>])` 开头
- 后续 bullet 列表,字段视 skill 而定(各 skill 契约文档里定义自己的 inputs 字段)
- 不引入 schema 校验(MVP 是松散自由格式)

---

## `.workflow-prefs.json` 形态(MVP 极简)

**作用:** 记住用户在 emit-spec 出口选过哪条 handoff 路径,下次到 gate 时显示提示。

**机制:** 由 `figma-emit-spec` 在 handoff 出口**首次被选择**时创建,后续覆盖。
其它阶段都不写入这个文件。

**结构:**

```jsonc
{
  "handoff_after_emit": "superpowers",
  "remembered_at": "2026-05-20T16:30:11+08:00"
}
```

**取值:**
- `handoff_after_emit`: `"builtin"` | `"superpowers"` | `"manual"` | `"pause"`
- `remembered_at`: ISO8601 timestamp

> 决策 14:**不做自动回放**,每次到 gate 仍然弹菜单,只在菜单顶部加一行
> `Previous choice: superpowers (saved 2026-05-20). Use [P] to repeat.`

---

## Git 策略

| 文件 / 目录 | 入 git? | 说明 |
|---|---|---|
| `docs/design/<feature>/*.md` | ✅ | Spec cache 是工程事实来源,必入 git |
| `docs/design/<feature>/inputs.md` | ✅ | 审计需要 |
| `docs/design/<feature>/.workflow-prefs.json` | ✅ | 团队偏好可共享,个人可覆盖 |
| `docs/design/<feature>/*.bak.*` | ❌ | MVP **不引入备份机制**(决策 7a-③) |

---

## 默认路径硬编码(MVP)

| 用途 | 路径 |
|---|---|
| 产物根目录 | `<cwd>/docs/design/<feature>/` |
| 模板目录 | 套件内置(在每个 skill 仓库的 `templates/` 下),不暴露给用户 |
| `inputs.md` | `<cwd>/docs/design/<feature>/inputs.md` |
| `.workflow-prefs.json` | `<cwd>/docs/design/<feature>/.workflow-prefs.json` |

> `<cwd>` = orchestrator/skill 被调用时的当前工作目录。
> 用户在 monorepo / 非常规仓库结构里使用时,需要手动 `cd` 到合适的位置。
> 配置化路径推迟到第 2/3 版。
