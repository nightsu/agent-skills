#!/usr/bin/env bash
# markdown-lint.sh -- Normalize and clean Markdown exported from Confluence
# Usage: markdown-lint.sh <file>        (modifies file in place)
#        markdown-lint.sh < input.md    (outputs to stdout)
set -euo pipefail

process() {
  awk '
  {
    if (/^[[:space:]]*$/) {
      blank_count++
    } else {
      if (blank_count > 0) {
        n = (blank_count > 2) ? 2 : blank_count
        for (i = 0; i < n; i++) print ""
        blank_count = 0
      }
      print
    }
  }
  END {
    if (blank_count > 0) print ""
  }
  ' | sed -E '
    # Strip trailing whitespace
    s/[[:space:]]+$//

    # Clean Confluence HTML artifacts
    s|<p[^>]*>[[:space:]]*</p>||g
    s|<br[[:space:]]*/?>||g
    s|<div[^>]*>[[:space:]]*</div>||g
    s|<span[^>]*>||g
    s|</span>||g
    s|<ac:[^>]*>[[:space:]]*</ac:[^>]*>||g

    # Normalize horizontal rules
    s/^[[:space:]]*(\*[[:space:]]*){3,}[[:space:]]*$/---/
    s/^[[:space:]]*(_[[:space:]]*){3,}[[:space:]]*$/---/
    s/^[[:space:]]*(-[[:space:]]*){3,}[[:space:]]*$/---/

    # Normalize link formatting
    s/\[[[:space:]]+/[/g
    s/[[:space:]]+\]/]/g
    s/\([[:space:]]+/(/g
    s/[[:space:]]+\)/)/g

    # Fix table separator minimum dashes
    s/\|[[:space:]]*-[[:space:]]*\|/| --- |/g
    s/\|[[:space:]]*--[[:space:]]*\|/| --- |/g
  '
}

if [ $# -ge 1 ] && [ -f "$1" ]; then
  tmp=$(mktemp)
  process < "$1" > "$tmp"
  mv "$tmp" "$1"
else
  process
fi
