#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [codex|claude|both]

Installs every skill in this repository as a symlink into the local skill directory.
Defaults to "both".
EOF
}

target="${1:-both}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

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

case "${target}" in
  codex)
    link_skills "${CODEX_HOME:-$HOME/.codex}/skills"
    ;;
  claude)
    link_skills "${HOME}/.claude/skills"
    ;;
  both)
    link_skills "${CODEX_HOME:-$HOME/.codex}/skills"
    link_skills "${HOME}/.claude/skills"
    ;;
  -h|--help)
    usage
    ;;
  *)
    usage
    exit 1
    ;;
esac
