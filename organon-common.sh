#!/usr/bin/env bash
# ORGΛNON — shared helpers for the Week-3 packaging scripts.
# This file is SOURCED by organon-{setup,run,test,report}.sh. It defines path
# variables and pretty-printers ONLY. It runs NO pipeline logic and computes NO
# number — the wrappers it serves call the real entry points (Rule VI).

set -euo pipefail

# Resolve the repo root from THIS file's location so the wrappers work from anywhere.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# STANDALONE: the package IS the repo root (the transplant left a stale monorepo path
# packages/solidity-sentinel that does not exist here — Phase-6 fresh-clone finding W6-04).
PKG="$REPO_ROOT"
SRC="$PKG/src"
PY="$SRC/backtest/py/.venv/bin/python"   # the pinned Python sidecar venv
SNAPSHOT_DIR="$REPO_ROOT/data/snapshot"
MANIFEST="$SNAPSHOT_DIR/MANIFEST.json"

# Colors — surface only, TTY-gated so nothing leaks ANSI when piped into a log/file.
# stdout (fd 1) and stderr (fd 2) are gated INDEPENDENTLY: fail/die write to stderr, so
# coloring them off [ -t 1 ] would leak codes when only stdout is redirected. (Rule VI: surface, not substance.)
if [ -t 1 ]; then
  BOLD="$(printf '\033[1m')"; DIM="$(printf '\033[2m')"; RED="$(printf '\033[31m')"
  GRN="$(printf '\033[32m')"; YLW="$(printf '\033[33m')"; CYN="$(printf '\033[36m')"; RST="$(printf '\033[0m')"
else
  BOLD=""; DIM=""; RED=""; GRN=""; YLW=""; CYN=""; RST=""
fi
if [ -t 2 ]; then E_RED="$(printf '\033[31m')"; E_RST="$(printf '\033[0m')"; else E_RED=""; E_RST=""; fi

banner() { printf '\n%s┌─ ORGΛNON · %s%s%s\n' "$CYN" "$BOLD" "$1" "$RST"; }
step()   { printf '%s▸%s %s\n' "$CYN" "$RST" "$1"; }
ok()     { printf '%s✓%s %s\n' "$GRN" "$RST" "$1"; }
warn()   { printf '%s!%s %s\n' "$YLW" "$RST" "$1"; }
fail()   { printf '%s✗ %s%s\n' "$E_RED" "$1" "$E_RST" >&2; }
die()    { fail "$1"; exit "${2:-1}"; }

# need <cmd> — assert a command exists on PATH.
need() { command -v "$1" >/dev/null 2>&1 || die "missing prerequisite: $1"; }

# ── presentation kit (surface only; every helper degrades to plain off a TTY) ──────────────
# rule [width]                — a dim horizontal divider.
rule() { printf '%s%s%s\n' "$DIM" "$(printf '─%.0s' $(seq 1 "${1:-64}"))" "$RST"; }

# panel "Title" / pline "text" / pend   — a bordered block (open, fill, close).
panel() { printf '\n%s╭─ %s%s%s\n' "$CYN" "$BOLD" "$1" "$RST"; }
pline() { printf '%s│%s %s\n' "$CYN" "$RST" "$1"; }
pend()  { printf '%s╰%s%s\n' "$CYN" "$(printf '─%.0s' $(seq 1 40))" "$RST"; }

# kv "key" "value"            — aligned key/value row (key dimmed, padded to 22).
kv() { printf '  %s%-22s%s %s\n' "$DIM" "$1" "$RST" "$2"; }

# badge STATUS [text]         — a colored status pill. STATUS ∈ GREEN|RED|WARN|INFO (or any label).
badge() {
  local st="$1"; shift 2>/dev/null || true; local c ic
  case "$st" in
    GREEN|GO|PASS|OK|YES|HEALTHY)  c="$GRN"; ic="✓" ;;
    RED|NO-GO|FAIL|HALT)           c="$RED"; ic="✗" ;;
    WARN|WARNING|NOT-YET)          c="$YLW"; ic="!" ;;
    *)                             c="$CYN"; ic="▸" ;;
  esac
  printf '%s%s %s%s%s %s\n' "$c" "$ic" "$BOLD" "$st" "$RST" "$*"
}

# spin "message" … spin_stop ["done msg"]   — a background braille spinner (no-op off a TTY).
SPIN_PID=""
spin() {
  if [ ! -t 1 ]; then step "$1…"; return 0; fi
  local msg="$1"
  ( local fa=(⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏)
    while :; do for f in "${fa[@]}"; do printf '\r%s%s%s %s ' "$CYN" "$f" "$RST" "$msg"; sleep 0.08; done; done ) &
  SPIN_PID=$!
}
spin_stop() {
  [ -n "$SPIN_PID" ] || { [ -n "${1:-}" ] && ok "$1"; return 0; }
  kill "$SPIN_PID" 2>/dev/null || true; wait "$SPIN_PID" 2>/dev/null || true
  SPIN_PID=""; printf '\r\033[K'
  [ -n "${1:-}" ] && ok "$1" || true
}
