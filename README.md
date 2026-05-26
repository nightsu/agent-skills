# agent-skills

面向 Codex 和 Claude Code 的共享通用技能仓库。仓库里的每个技能都保持独立目录,可作为 Codex standalone skill 使用,也可通过 Claude Code plugin 分发。

Figma workflow skills 已拆分到独立仓库 `ora-figma-skills`。本仓库继续维护不依赖特定设计工作流的通用 skills。

## 迁移说明

原本位于本仓库的 Figma 相关 skills、规划文档、规格文档和 fixture 已迁移到同级新仓库 `ora-figma-skills`。

迁移范围包括：

- `figma-*` 技能目录
- `docs/superpowers/plans/` 下的 Figma workflow plans
- `docs/superpowers/specs/` 下的 Figma workflow specs
- `docs/superpowers/fixtures/figma-workflow-suite/`
- Claude Code plugin 清单中的 Figma skill 暴露项

迁移后：

- 本仓库的 `ethan-skills` plugin 只分发通用 skills
- Figma workflow 通过 `ora-figma-skills` plugin 独立安装和更新
- Codex standalone skills 仍由各仓库自己的 `scripts/install.sh` 同步

## 当前技能

- `document-analysis`：理解、摘要并审阅文档
- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并生成提交
- `markitdown-export`：将 PDF、Word、Excel 等文件转换为同目录 Markdown
- `markdown-lint`：清理并规范 Markdown 文件格式
- `kabu-story`：为 3 到 4 岁儿童生成低认知负担、高情绪共鸣的故事

## 安装

推荐使用混合安装：

- Codex 使用 standalone skills
- Claude Code 使用 `ethan-skills` plugin

```bash
./scripts/install.sh
```

执行后：

- Codex 会把技能同步到本地 `~/.codex/skills`
- Claude Code 会自动注册本仓库为 marketplace，并安装或更新 `ethan-skills@ethan-skills`
- 脚本会顺手清理这套仓库在相反安装形态下留下的重复项

如果你明确想以 standalone skills 方式安装，再执行：

```bash
./scripts/install.sh skills
```

这会只安装到 Codex 的 `~/.codex/skills`，不会再改动 Claude Code。

## 更新

仓库更新后，重新运行同一个脚本即可刷新已安装内容。推荐继续使用默认混合模式：

```bash
./scripts/install.sh
```

如果你使用的是 standalone skills 模式，再执行：

```bash
./scripts/install.sh update
```

`update` 会刷新默认混合模式，也就是：

- Codex 更新 standalone skills
- Claude Code 更新 `ethan-skills` plugin
- 清理这套仓库在另一种安装形态下留下的重复项

## 目标路径

- Codex skills：`~/.codex/skills`
- Claude Code skills：`~/.claude/skills`
- Claude Code plugin：`~/.claude/plugins/ethan-skills`

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

如果某个技能不需要某一类资源，可以不创建，但不要为了形式强行补空文件。
