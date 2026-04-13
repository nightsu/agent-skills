# agent-skills

面向 Codex 和 Claude Code 的共享技能仓库。

## 已包含的技能

- `document-analysis`：理解、摘要并审阅文档
- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并提交代码
- `figma-api-mapper`：清理 Figma 节点并映射 UI 与接口字段
- `markdown-lint`：清理并规范 Markdown 文件格式

## 安装

推荐使用 plugin 方式安装，这样 Codex 和 Claude Code 都会以 `ethan-skills` 命名空间暴露这套技能，界面里的来源更清晰。

```bash
./scripts/install.sh plugin
```

执行后：

- Codex 会把插件包装层同步到本地 `plugins` 目录
- Claude Code 会自动注册本仓库为 marketplace，并安装或更新 `ethan-skills@ethan-skills`

如果你明确想以 standalone skills 方式安装，再执行：

```bash
./scripts/install.sh skills
```

不建议同时保留同一套技能的 plugin 和 standalone skills，否则在 Codex / Claude Code 里通常会重复展示。

## 更新

仓库更新后，重新运行同一个脚本即可刷新已安装内容。推荐继续使用 plugin 模式：

```bash
./scripts/install.sh plugin
```

如果你使用的是 standalone skills 模式，再执行：

```bash
./scripts/install.sh update
```

## 目标路径

- Codex plugin：`~/.codex/plugins/ethan-skills`
- Claude Code plugin：`~/.claude/plugins/ethan-skills`
- Codex skills：`~/.codex/skills`
- Claude Code skills：`~/.claude/skills`

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

插件包装层位于 `plugins/ethan-skills/`，会把仓库中的技能暴露成一个可安装的 plugin。
