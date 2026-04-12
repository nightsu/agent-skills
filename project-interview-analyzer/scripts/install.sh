#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [skills|plugin|both|update]

Installs the shared skills as standalone skill symlinks and/or as plugin installs for Codex and Claude Code.
Defaults to "both".
EOF
}

target="${1:-both}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
plugin_name="agent-skills"
plugin_src="${repo_root}/plugins/${plugin_name}"

link_skills() {
  local base_dir="$1"
  mkdir -p "${base_dir}"

  for skill_md in "${repo_root}"/*/SKILL.md; do
    [[ -f "${skill_md}" ]] || continue
    local skill_dir
    skill_dir="$(dirname "${skill_md}")"
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    ln -sfn "${skill_dir}" "${base_dir}/${skill_name}"
    echo "linked ${skill_dir} -> ${base_dir}/${skill_name}"
  done
}

link_plugin() {
  local base_dir="$1"
  local plugin_dir="${base_dir}/${plugin_name}"
  mkdir -p "${plugin_dir}/.codex-plugin" "${plugin_dir}/agents" "${plugin_dir}/skills"

  cp "${plugin_src}/.codex-plugin/plugin.json" "${plugin_dir}/.codex-plugin/plugin.json"
  cp "${plugin_src}/agents/openai.yaml" "${plugin_dir}/agents/openai.yaml"

  find "${plugin_dir}/skills" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

  for skill_md in "${repo_root}"/*/SKILL.md; do
    [[ -f "${skill_md}" ]] || continue
    local skill_dir
    skill_dir="$(dirname "${skill_md}")"
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    ln -sfn "${skill_dir}" "${plugin_dir}/skills/${skill_name}"
    echo "linked ${skill_dir} -> ${plugin_dir}/skills/${skill_name}"
  done
}

case "${target}" in
  skills)
    link_skills "${CODEX_HOME:-$HOME/.codex}/skills"
    link_skills "${HOME}/.claude/skills"
    ;;
  plugin)
    link_plugin "${CODEX_HOME:-$HOME/.codex}/plugins"
    link_plugin "${HOME}/.claude/plugins"
    ;;
  both)
    link_skills "${CODEX_HOME:-$HOME/.codex}/skills"
    link_skills "${HOME}/.claude/skills"
    link_plugin "${CODEX_HOME:-$HOME/.codex}/plugins"
    link_plugin "${HOME}/.claude/plugins"
    ;;
  update)
    link_skills "${CODEX_HOME:-$HOME/.codex}/skills"
    link_skills "${HOME}/.claude/skills"
    link_plugin "${CODEX_HOME:-$HOME/.codex}/plugins"
    link_plugin "${HOME}/.claude/plugins"
    ;;
  -h|--help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
