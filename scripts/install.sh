#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [install|skills|plugin|both|update]

Installs the shared skills for Codex and Claude Code.
Defaults to "install" (Codex standalone skills + Claude plugin).
EOF
}

target="${1:-install}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
plugin_name="ethan-skills"
plugin_src="${repo_root}/plugins/${plugin_name}"
codex_home="${CODEX_HOME:-$HOME/.codex}"
codex_skills_dir="${codex_home}/skills"
codex_plugins_dir="${codex_home}/plugins"
claude_skills_dir="${HOME}/.claude/skills"
claude_plugins_dir="${HOME}/.claude/plugins"
claude_known_marketplaces="${claude_plugins_dir}/known_marketplaces.json"
claude_installed_plugins="${claude_plugins_dir}/installed_plugins.json"

require_claude_cli() {
  if ! command -v claude >/dev/null 2>&1; then
    echo "error: claude CLI is required for plugin installation" >&2
    exit 1
  fi
}

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

unlink_skills() {
  local base_dir="$1"

  [[ -d "${base_dir}" ]] || return 0

  for skill_md in "${repo_root}"/*/SKILL.md; do
    [[ -f "${skill_md}" ]] || continue
    local skill_dir
    skill_dir="$(dirname "${skill_md}")"
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    local target_path="${base_dir}/${skill_name}"
    if [[ -L "${target_path}" ]] && [[ "$(readlink "${target_path}")" == "${skill_dir}" ]]; then
      rm -f "${target_path}"
      echo "removed ${target_path}"
    fi
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

install_claude_plugin() {
  local plugin_ref="${plugin_name}@${plugin_name}"

  require_claude_cli

  if [[ -f "${claude_known_marketplaces}" ]] && grep -Fq "\"${plugin_name}\":" "${claude_known_marketplaces}"; then
    claude plugin marketplace update "${plugin_name}"
  else
    claude plugin marketplace add "${repo_root}"
  fi

  if [[ -f "${claude_installed_plugins}" ]] && grep -Fq "\"${plugin_ref}\":" "${claude_installed_plugins}"; then
    claude plugin update "${plugin_ref}"
  else
    claude plugin install "${plugin_ref}"
  fi
}

remove_plugin_dir() {
  local base_dir="$1"
  local plugin_dir="${base_dir}/${plugin_name}"

  [[ -e "${plugin_dir}" ]] || return 0
  rm -rf "${plugin_dir}"
  echo "removed ${plugin_dir}"
}

case "${target}" in
  install)
    link_skills "${codex_skills_dir}"
    remove_plugin_dir "${codex_plugins_dir}"
    unlink_skills "${claude_skills_dir}"
    remove_plugin_dir "${claude_plugins_dir}"
    install_claude_plugin
    ;;
  skills)
    link_skills "${codex_skills_dir}"
    link_skills "${claude_skills_dir}"
    ;;
  plugin)
    link_plugin "${codex_plugins_dir}"
    install_claude_plugin
    ;;
  both)
    link_skills "${codex_skills_dir}"
    link_skills "${claude_skills_dir}"
    link_plugin "${codex_plugins_dir}"
    install_claude_plugin
    ;;
  update)
    link_skills "${codex_skills_dir}"
    install_claude_plugin
    ;;
  -h|--help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
