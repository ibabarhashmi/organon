#!/usr/bin/env bash
# ORGΛNON — THE RUNNER (Explanation Phase 4; Rule X-RUN). One honest command from a fresh clone to the web door:
#   prerequisite CHECK (never installs system items) → setup from the pinned lockfile (idempotent) → the pinned verify
#   set → offline-honest refresh → the bounded TUI (status · launch-web [requirements-gated] · quit).
# The first command a stranger ever runs is the most honest thing in the repo: it refuses to open the door until the
# house is provably in order, and when it refuses it says exactly why.
#
# Usage:  ./organon.sh [menu|status|check|launch|--full]
#   menu    (default) check → setup → verify → the bounded TUI (interactive)
#   status  check → setup → verify → the status table (non-interactive; the happy transcript)
#   check   the prerequisite enumeration only (honest per-item; exit nonzero if a required item is missing)
#   launch  verify → launch the web app ONLY if the pinned gate list is green (else refuse with reasons)
#   --full  run the FULL in-scope battery as the verify set (default is the fast pinned subset)
set -euo pipefail
cd "$(dirname "$0")"

MODE="menu"; FULL=""
for a in "$@"; do case "$a" in menu|status|check|launch) MODE="$a";; --full) FULL="--full";; esac; done

need_bun() { if ! command -v bun >/dev/null 2>&1; then echo "✗ bun is required and is not on PATH — install it yourself (https://bun.sh). The runner NEVER installs system packages."; exit 1; fi; }

# ── (1) prerequisite CHECK — honest per-item; never installs a system item ──────────────────────────────────────────
prereq_check() { need_bun; bun run script/organon-status.ts --prereq; }

# ── (2) SETUP — the sidecar venv from the pinned lockfile if absent; idempotent, offline-safe ──────────────────────
setup() {
  if [ -d "src/backtest/py/.venv" ]; then echo "✓ setup: the scientific sidecar venv is present (idempotent — nothing to do)."; return 0; fi
  echo "○ setup: the sidecar venv is absent."
  if [ -f "requirements-studio.txt" ] && command -v python3 >/dev/null 2>&1; then
    echo "  creating src/backtest/py/.venv from the pinned lockfile (no network installs beyond it)…"
    python3 -m venv src/backtest/py/.venv 2>/dev/null && src/backtest/py/.venv/bin/pip install -q -r requirements-studio.txt 2>/dev/null \
      && echo "  ✓ venv created from the lockfile." \
      || echo "  ○ venv setup could not complete offline — disclosed as a GAP, never faked (the core TS battery still runs; the sidecar tests will state BLOCKED)."
  else
    echo "  ○ python3 or the lockfile is absent — the venv is a GAP (disclosed, never faked)."
  fi
}

# ── (3) offline-honest REFRESH (optional) — a missed fetch renders as a gap, never a fabrication ───────────────────
refresh_note() { echo "○ data refresh: run 'bun run script/capture-dataplane.ts' to capture keyless snapshots; offline, a gap renders (never a fabrication)."; }

# ── the TUI/CLI — bounded menu (status · launch-web [requirements-gated] · quit) ───────────────────────────────────
launch_state() { bun run script/organon-status.ts $FULL 2>/dev/null | tail -1 | sed 's/.*ORGANON_LAUNCH_ENABLED=//'; }

do_status() { need_bun; setup; bun run script/organon-status.ts $FULL; }

do_launch() {
  need_bun
  local enabled; enabled="$(bun run script/organon-status.ts $FULL | tee /dev/stderr | tail -1 | sed 's/.*ORGANON_LAUNCH_ENABLED=//')"
  if [ "$enabled" = "1" ]; then
    echo "✓ LAUNCH WEB: the pinned gate list is green — starting the web app…"
    echo "  the console will serve at http://localhost:8787  (Ctrl-C to stop; nothing signs)"
    exec bun run script/serve-studio.ts
  else
    echo "✗ LAUNCH WEB refused: the requirements above are not met. The door stays shut until the house is in order (no soft-launch path exists — the gate is derived from the verify results, not a flag)."
    exit 1
  fi
}

tui() {
  need_bun; setup; refresh_note
  bun run script/organon-status.ts $FULL || true
  echo ""
  echo "═══ ORGΛNON — bounded menu ═══"
  echo "  [s] status    — re-render the verify table + the launch gate"
  echo "  [l] launch web — enabled only when the gate list is green (else it tells you why)"
  echo "  [q] quit"
  printf "choice: "
  read -r choice || choice="q"
  case "$choice" in
    s|S) do_status;;
    l|L) do_launch;;
    *) echo "bye.";;
  esac
}

case "$MODE" in
  check)  prereq_check;;
  status) do_status;;
  launch) do_launch;;
  menu|*) tui;;
esac
