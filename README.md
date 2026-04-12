# agent-skills

面向 Codex 和 Claude Code 的共享技能仓库。

## 已包含的技能

- `document-analysis`：理解、摘要并审阅文档
- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并提交代码
- `figma-api-mapper`：清理 Figma 节点并映射 UI 与接口字段

## 安装

推荐使用 standalone skills 方式安装，这样 Codex CLI 和 Claude Code 都能直接加载同一套技能，并且不会出现 plugin 与 skills 重复展示的问题。

### 安装 skills

直接把仓库中的 skills 同步到本地 `skills` 目录。

```bash
./scripts/install.sh skills
```

### 安装 plugin（可选）

如果你明确需要 Codex / Claude Code plugin 侧的包装层，再单独执行：

```bash
./scripts/install.sh plugin
```

## 更新

仓库更新后，重新运行同一个脚本即可刷新本地 skills：

```bash
./scripts/install.sh update
```

## 目标路径

- Codex skills：`~/.codex/skills`
- Claude Code skills：`~/.claude/skills`
- Codex plugin：`~/.codex/plugins/agent-skills`
- Claude Code plugin：`~/.claude/plugins/agent-skills`

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

插件包装层位于 `plugins/agent-skills/`，会把仓库中的技能暴露成一个可安装的 plugin。
