#!/usr/bin/env bash
# slim-cli: puts your CLI output on a diet.
# Rewrites verbose commands to compact versions for git, Docker,
# npm/yarn/pnpm, pip, curl/wget, and Go.
#
# Reads JSON from stdin, outputs hookSpecificOutput with updatedInput.
# Exit 0 with no output = allow the tool call unchanged.

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [[ -z "$CMD" ]]; then
  exit 0
fi

REWRITTEN=""

# ─── Git (8 rules) ──────────────────────────────────────────────────

# git status → git status --short --branch
if [[ "$CMD" =~ ^git\ status$ ]]; then
  REWRITTEN="git status --short --branch"

# git log (bare) → git log --oneline -10
elif [[ "$CMD" =~ ^git\ log$ ]]; then
  REWRITTEN="git log --oneline -10"

# git diff (bare) → git diff --stat
elif [[ "$CMD" =~ ^git\ diff$ ]]; then
  REWRITTEN="git diff --stat"

# git push (without pipe) → append tail -2
elif [[ "$CMD" =~ ^git\ push ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -2"

# git pull (bare) → git pull --rebase + tail -3
elif [[ "$CMD" =~ ^git\ pull$ ]]; then
  REWRITTEN="git pull --rebase 2>&1 | tail -3"

# git pull --rebase (without pipe) → append tail -3
elif [[ "$CMD" =~ ^git\ pull\ --rebase$ ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -3"

# git fetch (without --quiet/-q) → append --quiet
elif [[ "$CMD" =~ ^git\ fetch ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ -q ]]; then
  REWRITTEN="$CMD --quiet"

# git clone (without --quiet/-q) → insert --quiet after "git clone"
elif [[ "$CMD" =~ ^git\ clone ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ -q ]]; then
  REWRITTEN="${CMD/git clone/git clone --quiet}"

# ─── Docker (5 rules) ───────────────────────────────────────────────

# docker compose logs (without --tail) → append --tail=50
elif [[ "$CMD" =~ ^docker\ compose\ logs ]] && [[ ! "$CMD" =~ --tail ]]; then
  REWRITTEN="$CMD --tail=50"

# docker compose build (without --quiet, without pipe) → tail -30
elif [[ "$CMD" =~ ^docker\ compose\ build ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -30"

# docker compose up ... -d (without pipe) → tail -5
elif [[ "$CMD" =~ ^docker\ compose\ up ]] && [[ "$CMD" =~ -d ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -5"

# docker ps (without --format) → append --format for compact output
elif [[ "$CMD" =~ ^docker\ ps ]] && [[ ! "$CMD" =~ --format ]]; then
  REWRITTEN="$CMD --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# docker images (without --format) → append --format for compact output
elif [[ "$CMD" =~ ^docker\ images ]] && [[ ! "$CMD" =~ --format ]]; then
  REWRITTEN="$CMD --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}'"

# ─── npm / yarn / pnpm (5 rules) ────────────────────────────────────

# npm install/ci/add (without pipe) → tail -5
elif [[ "$CMD" =~ ^npm\ (install|ci|add) ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -5"

# npm run build (without pipe) → tail -10
elif [[ "$CMD" =~ ^npm\ run\ build ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -10"

# npm list / npm ls (bare) → --depth=0
elif [[ "$CMD" =~ ^npm\ (list|ls)$ ]]; then
  REWRITTEN="$CMD --depth=0"

# yarn install/add (without pipe) → tail -5
elif [[ "$CMD" =~ ^yarn\ (install|add) ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -5"

# pnpm install/add (without pipe) → tail -5
elif [[ "$CMD" =~ ^pnpm\ (install|add) ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -5"

# ─── pip (3 rules) ──────────────────────────────────────────────────

# pip/pip3 install (without --quiet/-q, without pipe) → append --quiet
elif [[ "$CMD" =~ ^pip[3]?\ install ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ -q ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD --quiet"

# python -m pip install (without --quiet/-q, without pipe) → append --quiet
elif [[ "$CMD" =~ ^python[3]?\ -m\ pip\ install ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ -q ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD --quiet"

# pip/pip3 list (bare) → head -30
elif [[ "$CMD" =~ ^pip[3]?\ list$ ]]; then
  REWRITTEN="$CMD 2>&1 | head -30"

# ─── curl / wget (2 rules) ──────────────────────────────────────────

# curl (without -s/--silent) → insert -sS after curl
elif [[ "$CMD" =~ ^curl\  ]] && [[ ! "$CMD" =~ -s ]] && [[ ! "$CMD" =~ --silent ]]; then
  REWRITTEN="${CMD/curl /curl -sS }"

# wget (without --quiet/-q) → append --quiet
elif [[ "$CMD" =~ ^wget\  ]] && [[ ! "$CMD" =~ --quiet ]] && [[ ! "$CMD" =~ -q ]]; then
  REWRITTEN="${CMD/wget /wget --quiet }"

# ─── Go (3 rules) ───────────────────────────────────────────────────

# go test (without pipe) → tail -20 for compact summary
elif [[ "$CMD" =~ ^go\ test ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -20"

# go build (without pipe) → tail -10
elif [[ "$CMD" =~ ^go\ build ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -10"

# go get (without pipe) → tail -5
elif [[ "$CMD" =~ ^go\ get ]] && [[ ! "$CMD" =~ \| ]]; then
  REWRITTEN="$CMD 2>&1 | tail -5"

fi

# ─── Output ─────────────────────────────────────────────────────────

if [[ -n "$REWRITTEN" ]]; then
  jq -n --arg cmd "$REWRITTEN" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: { command: $cmd }
    }
  }'
else
  exit 0
fi
