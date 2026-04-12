# agent-skills

面向 Codex 和 Claude Code 的共享技能仓库。

## 已包含的技能

- `document-analysis`：理解、摘要并审阅文档
- `project-interview-analyzer`：把项目整理成面试材料
- `git-commit`：安全审查改动并提交代码
- `figma-api-mapper`：清理 Figma 节点并映射 UI 与接口字段

## 安装

推荐使用 plugin 方式安装，这样 Codex 和 Claude Code 都能直接加载同一套技能，并且重新运行脚本即可同步更新。

### 远程安装

把这个 GitHub 仓库注册为 marketplace 后，可以直接安装，不需要先 clone 到本地。

Claude Code:

```bash
/plugin marketplace add nightsu/agent-skills
```

然后在插件市场里安装 `agent-skills`。

仓库地址：`https://github.com/nightsu/agent-skills`

Codex:

- 使用仓库内的 `.agents/plugins/marketplace.json` 作为同源 marketplace 定义。
- 远程安装时，直接使用仓库地址 `https://github.com/nightsu/agent-skills` 作为来源。
- 如果当前 Codex 环境暂不支持远程 marketplace，再使用下面的本地同步方式。

```bash
./scripts/install.sh plugin
```

如果你还想保留旧的 standalone skills 链接，可以用：

```bash
./scripts/install.sh both
```

## 更新

仓库更新后，远程 marketplace 只需要点更新即可；本地环境则重新运行同一个脚本即可刷新 plugin/skills 链接：

```bash
./scripts/install.sh update
```

## 目标路径

- Codex plugin：`~/.codex/plugins/agent-skills`
- Claude Code plugin：`~/.claude/plugins/agent-skills`
- Codex skills：`~/.codex/skills`
- Claude Code skills：`~/.claude/skills`
- Claude Code marketplace manifest：`.claude-plugin/marketplace.json`

## 技能结构

每个技能都放在独立目录里，并保持统一结构：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

插件包装层位于 `plugins/agent-skills/`，会把仓库中的技能暴露成一个可安装的 plugin。
