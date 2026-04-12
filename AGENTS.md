# 仓库指令

这是 `agent-skills` 共享技能仓库的 Codex 仓库级指令文件。它适用于仓库根目录及其所有子目录。

## 仓库定位

- 这是面向 Codex 和 Claude Code 的共享技能仓库。
- 每个技能以独立目录维护，目录内保持统一结构。
- 仓库同时服务于 standalone skills 和 plugin 两种分发方式。

## 当前技能

- `document-analysis`：理解、摘要并审阅文档。
- `project-interview-analyzer`：把项目整理成面试材料。
- `git-commit`：安全审查改动并生成提交。
- `figma-api-mapper`：清理 Figma 节点并映射 UI 与接口字段。

## 统一结构

每个技能目录默认包含：

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `scripts/`

如果某个技能不需要某一类资源，可以不创建，但不要为了形式强行补空文件。

## 编写原则

- 先写清楚技能的适用场景，再写工作流。
- 优先写可执行的步骤，不写空泛口号。
- 参考资料放在 `references/`，不要把大段细节塞进 `SKILL.md`。
- 默认使用中文编写仓库内说明，除非某个字段要求英文。

## 插件同步

- `.agents/plugins/marketplace.json` 负责 Codex 侧的插件市场定义。
- `.claude-plugin/marketplace.json` 负责 Claude Code 侧的本地插件清单。
- 新增或删除技能时，要同步检查这两处是否需要更新。

## 安装和更新

- 本地同步脚本位于 `scripts/install.sh`。
- 更新仓库后，优先通过同一脚本刷新 skills / plugin 链接。
- 新技能加入仓库后，要确认它能被 plugin 清单暴露出来。

## 维护偏好

- 技能名使用小写、数字和连字符。
- 命名优先短、明确、能触发。
- 参考文件保持单层引用，不要层层嵌套。
- 长参考文件需要尽量结构化，便于快速预览。
