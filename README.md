# agent-skills

面向 Codex 和 Claude Code 的共享技能仓库。

## 已包含的技能

- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并提交代码

## 安装

推荐使用 plugin 方式安装，这样 Codex 和 Claude Code 都能直接加载同一套技能，并且重新运行脚本即可同步更新。

```bash
./project-interview-analyzer/scripts/install.sh plugin
```

如果你还想保留旧的 standalone skills 链接，可以用：

```bash
./project-interview-analyzer/scripts/install.sh both
```

## 更新

仓库更新后，重新运行同一个脚本即可刷新本地 plugin/skills 链接：

```bash
./project-interview-analyzer/scripts/install.sh update
```

## 目标路径

- Codex plugin：`~/.codex/plugins/agent-skills`
- Claude Code plugin：`~/.claude/plugins/agent-skills`
- Codex skills：`~/.codex/skills`
- Claude Code skills：`~/.claude/skills`

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

插件包装层位于 `plugins/agent-skills/`，会把仓库中的技能暴露成一个可安装的 plugin。
