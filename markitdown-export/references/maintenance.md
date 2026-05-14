# MarkItDown 维护说明

## 什么时候需要更新

- 上游 `microsoft/markitdown` 仓库新增或调整了支持格式
- 上游 README 改了可选依赖列表
- 上游 CLI 参数或默认行为发生变化
- 本地转换结果出现新报错、依赖缺失或行为回归

## 更新步骤

1. 重新对齐上游说明
   - 先查看上游 README 的安装、可选依赖和用法部分
   - 重点关注 `docx`、`pdf`、`xlsx`、`pptx`、`outlook`、`audio-transcription`、`youtube-transcription`
2. 检查本地版本
   - 运行：
     - `python3 scripts/check_markitdown.py`
   - 如果网络不可用，也可以用已知上游版本做离线判断：
     - `python3 scripts/check_markitdown.py --latest-version <version>`
   - 检查脚本只提示状态和升级命令，不会自动安装或升级
3. 更新本地安装
   - 优先用 `pipx` 隔离安装：
     - `pipx install "markitdown[all]"`
   - 已安装后显式升级：
     - `pipx upgrade markitdown --include-injected`
   - 如果没有 `pipx`，再用 Python 3.10+ 调用 `pip`：
     - `python3 -m pip install --user -U "markitdown[all]"`
   - 如果只想补某类格式，也可以改成对应 extra
4. 回归测试
   - 在技能目录下跑 `python3 scripts/convert.py <sample-file>`
   - 至少覆盖：
     - 一个 `.docx`
     - 一个 `.pdf`
     - 一个 `.xlsx`
   - 检查输出是否仍然在源文件同目录
5. 技能同步
   - 如果上游新增/删除支持格式，更新 `SKILL.md`
   - 如果默认行为变了，更新 `scripts/convert.py`
   - 如 UI 描述失效，重新生成 `agents/openai.yaml`

## 回归判定

- `quick_validate.py` 必须通过
- 同目录输出必须成立
- 同名文件必须先询问覆盖
- 真实文件转换必须成功，不应只靠 mock
