# agent-skills

面向 Codex 和 Claude Code 的共享技能仓库。

## 已包含的技能

- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并提交代码

## 安装

使用脚本将仓库中的所有技能链接到本地技能目录：

```bash
./project-interview-analyzer/scripts/install.sh both
```

Targets:

- `codex`：链接到 `~/.codex/skills`
- `claude`：链接到 `~/.claude/skills`
- `both`：同时链接到两个位置

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

这样便于版本管理、审阅，并且可以同时安装到多个助手环境中。
