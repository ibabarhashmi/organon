#!/usr/bin/env bash
# ORGΛNON — THE RUNNER (Explanation Phase 4; Rule X-RUN). One honest command from a fresh clone to the web door:
#   prerequisite CHECK (never installs system items) → setup from the pinned lockfile (idempotent) → the pinned verify
#   set → offline-honest refresh → the bounded TUI (status · launch-web [requirements-gated] · quit).
# The first command a stranger ever runs is the most honest thing in the repo: it refuses to open the door until the
# house is provably in order, and when it refuses it says exactly why.
#
# Usage:  ./organon.sh [menu|status|check|setup|doctor|launch|verify|stamp <poolKey>|ask "<q>"|monitor [--since <iso>]|--version|--full]
#   menu    (default) check → setup → verify → the bounded TUI (interactive)
#   status  check → setup → verify → the status table (non-interactive; the happy transcript)
#   check   the prerequisite enumeration only (honest per-item; exit nonzero if a required item is missing)
#   launch  verify → launch the web app ONLY if the pinned gate list is green (else refuse with reasons)
#   verify  regenerate the EVIDENCE BUNDLE + diff it against the committed copy — the numbers reproduce themselves (X-PROVE)
#   stamp   <poolKey> — the OPT-IN overfit stress test: a DISTINCT GO/NO-GO/INSUFFICIENT verdict on a pool's recorded
#           track record (the frozen anti-PBO adjudicator, off the mass path — orthogonal to the Reality Check; X-OPTIN)
#   ask     "<query>" — the grounded Ask console (deterministic mode, no AI key): every number/verdict is engine-sourced;
#           an unmappable query → an honest "here's what I can help with" (X-ASK)
#   --full  run the FULL in-scope battery as the verify set (default is the fast pinned subset)
set -euo pipefail
cd "$(dirname "$0")"

MODE="menu"; FULL=""; STAMP_ARG=""; ASK_ARGS=(); PASS_ARGS=()
# once MODE is a value-taking verb (ask/telemetry/feedback), subsequent tokens are ARGS, not mode words — so a value
# like `--screen ask` cannot flip the mode (a targeted fix for AH11 on the value-taking verbs; Probe Phase 2).
for a in "$@"; do
  case "$a" in
    menu|status|check|setup|setup-deps|doctor|launch|verify|stamp|ask|monitor|telemetry|feedback)
      case "$MODE" in ask) ASK_ARGS+=("$a");; monitor|telemetry|feedback) PASS_ARGS+=("$a");; *) MODE="$a";; esac;;
    --full) FULL="--full";;
    --version) MODE="version";;
    *)
      case "$MODE" in
        stamp) [ -z "$STAMP_ARG" ] && STAMP_ARG="$a";;
        ask) ASK_ARGS+=("$a");;
        monitor|telemetry|feedback) PASS_ARGS+=("$a");;
      esac;;
  esac
done

need_bun() { if ! command -v bun >/dev/null 2>&1; then echo "✗ bun is required and is not on PATH — install it yourself (https://bun.sh). The runner NEVER installs system packages."; exit 1; fi; }

# ── (1) prerequisite CHECK — honest per-item; never installs a system item ──────────────────────────────────────────
prereq_check() { need_bun; bun run script/organon-status.ts --prereq; }

# ── (2) SETUP — the sidecar venv from the pinned lockfile if absent; idempotent, offline-safe ──────────────────────
setup() {
  # JS deps first (AB4, D22): the most common fresh-clone failure is a missing node_modules — every verify row went
  # red 'exit 1' with no stated cure. Install here (idempotent, instant when present) so the refusal never hides the remedy.
  if [ ! -d "node_modules" ]; then
    echo "○ setup: node_modules is absent — running 'bun install' (hono + zod, the whole mass-path dep set)…"
    bun install || { echo "  ✗ bun install failed — the battery and the served doors cannot run without it. Fix the error above (offline? registry?) and re-run: ./organon.sh status"; return 1; }
  fi
  local py_dir="src/backtest/py"
  # REACH V35 (RP-2): the frozen-core DSR/PSR/PBO cross-check (S94) needs the independent `purgedcv` oracle, which the
  # studio-slim lockfile omits. Provision it idempotently & best-effort so S94's green survives a fresh clone — never a
  # hard requirement: if it cannot install, S94 stays BLOCKED (named precisely by the sidecar census), never mocked.
  provision_crosscheck() {
    [ -x "$py_dir/.venv/bin/python" ] || return 0
    "$py_dir/.venv/bin/python" -c "import purgedcv" >/dev/null 2>&1 && return 0
    echo "  ○ provisioning the frozen-core cross-check oracle (purgedcv) for S94 (idempotent, best-effort)…"
    if "$py_dir/.venv/bin/pip" install -q -r "$py_dir/requirements-crosscheck.txt" >/dev/null 2>&1; then
      echo "  ✓ cross-check oracle present — S94 (DSR/PSR/PBO vs purgedcv) can execute."
    else
      echo "  ○ purgedcv did not install — S94 stays BLOCKED (disclosed by the sidecar census, never faked). Provision later with:"
      echo "    $py_dir/.venv/bin/pip install -r $py_dir/requirements-crosscheck.txt"
    fi
  }
  if [ -d "src/backtest/py/.venv" ]; then echo "✓ setup: the scientific sidecar venv is present (idempotent — nothing to do)."; provision_crosscheck; return 0; fi
  echo "○ setup: the sidecar venv is absent."
  # Derivation V36 (S103 fresh-clone finding): the frozen sidecar + the cross-check oracle are Python-3.11-only (S83
  # mandate; purgedcv==0.1.2 is 3.11), but bare `python3` on a stock macOS is 3.9 — so a fresh clone built a 3.9 venv that
  # failed S83 and could not provision purgedcv. PREFER python3.11, then a 3.11.x, then bare python3 (disclosed gap: a
  # non-3.11 venv trips S83 and the cross-check walls state BLOCKED, never faked). The pristine clone RAN and caught this.
  local PYBIN=""
  for c in python3.11 python3.12 python3; do command -v "$c" >/dev/null 2>&1 && { PYBIN="$c"; break; }; done
  # the lockfile lives in the sidecar dir, NOT the repo root (AB3, D22 — the old root-path check meant this build could never run)
  if [ -f "$py_dir/requirements-studio.txt" ] && [ -n "$PYBIN" ]; then
    echo "  creating $py_dir/.venv from the pinned lockfile via $PYBIN ($("$PYBIN" --version 2>&1))…"
    [ "$PYBIN" = "python3" ] && ! "$PYBIN" --version 2>&1 | grep -q "3\.11" && echo "  ⚠ python3.11 not found — falling back to $("$PYBIN" --version 2>&1); the 3.11 mandate (S83) will flag it and the cross-check will state BLOCKED (disclosed, never faked)."
    local venv_err=""
    venv_err="$( { "$PYBIN" -m venv "$py_dir/.venv" && "$py_dir/.venv/bin/pip" install -q -r "$py_dir/requirements-studio.txt"; } 2>&1 >/dev/null )" \
      && { echo "  ✓ venv created from the lockfile."; provision_crosscheck; } \
      || { echo "  ○ venv setup did not complete — disclosed as a GAP, never faked (the core TS battery still runs; the sidecar tests will state BLOCKED)."; \
           echo "    the actual error (never laundered as 'offline'): $(printf '%s' "$venv_err" | tail -1)"; \
           echo "    on Debian/Ubuntu/WSL the usual cure is:  sudo apt install python3-venv"; }
  else
    echo "  ○ a python3 (prefer 3.11) or $py_dir/requirements-studio.txt is absent — the venv is a GAP (disclosed, never faked)."
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
    echo "✓ LAUNCH WEB: the pinned gate list is green — starting the Reality Check…"
    echo "  ORGΛNON (3 screens: the Shelf · the Reality Check · the Ask console) serves at http://localhost:4444  (Ctrl-C to stop; nothing signs)"
    echo "  is this yield real, and what's the catch? — REAL where recorded, the honest SAMPLE fallback where not · ask in your own words (AI-optional, BYOK)."
    exec bun run script/serve-reality.ts
  else
    echo "✗ LAUNCH WEB refused: the requirements above are not met. The door stays shut until the house is in order (no soft-launch path exists — the gate is derived from the verify results, not a flag)."
    exit 1
  fi
}

# ── the VERIFY verb — the evidence bundle regenerates + diffs against the committed copy (X-PROVE) ─────────────────
# A stranger runs this and the sprint's headline numbers reproduce themselves: the full battery + its count, the
# deterministic scorecard bundle, the frozen-seven git-clean proof, and the verdict-differential reproduction — every
# one diffed against the committed evidence. A mismatch exits non-zero (the numbers no longer rest on trust).
do_verify() {
  need_bun
  echo "○ verify: regenerating the evidence bundle and diffing it against the committed copy (data/honesty/evidence/)…"
  echo "  (1) the full battery + its count vs the committed battery-summary…"
  local out pass fail want
  out="$(bash organon-studio-test.sh 2>&1)" || { echo "✗ the battery is not green — verify refuses (the count cannot be attested)"; echo "$out" | tail -3; exit 1; }
  pass="$(printf '%s' "$out" | grep -oE '[0-9]+ pass' | head -1 | grep -oE '[0-9]+')"
  fail="$(printf '%s' "$out" | grep -oE '[0-9]+ fail' | head -1 | grep -oE '[0-9]+')"
  want="$(bun -e 'const a=require("./data/honesty/evidence/battery-summary.json");console.log(a.canonical.pass+"/"+a.canonical.fail)' 2>/dev/null || echo "?/?")"
  echo "    battery ${pass}/${fail} · committed ${want}"
  if [ "${pass}/${fail}" != "$want" ]; then echo "✗ battery count ${pass}/${fail} ≠ the committed evidence ${want} — regenerate + re-pin (bun run script/build-evidence.ts)"; exit 1; fi
  echo "  (2) the deterministic bundle (determinism · frozen-seven · verdict differential) + every claim + every LIVE number's capture-manifest hash…"
  bun run script/build-evidence.ts --check || exit 1
  echo "✓ VERIFY GREEN: the evidence bundle reproduces — the battery count, the frozen-seven git-clean, the verdict differential, every claimed number, and every cited LIVE number (capture-manifest content-hash) diff clean against the committed copy."
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

# ── the STAMP verb — the opt-in overfit stress test (Crown-Jewel; X-OPTIN) — a DISTINCT GO/NO-GO/INSUFFICIENT verdict ──
do_stamp() { need_bun; bun run script/stamp.ts $STAMP_ARG; }

# ── the RELEASE verb (Derivation V36, S105/DD-21) — the release in ONE COMMAND: a single-file binary + SHA-256 + install ──
# The SAME code, compiled (distribution is not capability, X-REACH(f)/D49). dist/ is gitignored: the binary is BUILT, not
# committed — the D50 checkboxes COMPUTE, and they compute RED until a human publishes. bun build --compile reproducibility
# is UNVERIFIED (stated, not assumed). The console stays behind --studio (V34-sealed); no key is embedded.
do_release() { need_bun; bun run script/release.ts ${PASS_ARGS[@]+"${PASS_ARGS[@]}"}; }

# ── the ASK verb — the grounded Ask console (Crown-Jewel; X-ASK), deterministic mode from the CLI (no AI key needed) ──
# AB6 (D22): `set -u` + an empty-array expansion is fatal on stock macOS bash 3.2 — the ${arr[@]+…} form is the
# bash-3.2-safe expansion, so `./organon.sh ask` with no query reaches the script's own honest usage line, not a shell error.
do_ask() { need_bun; bun run script/ask.ts ${ASK_ARGS[@]+"${ASK_ARGS[@]}"}; }

# ── the TELEMETRY + FEEDBACK verbs (Probe Phase 2; X-TELEMETRY) — the tester's sight + control over their OWN local data.
# Telemetry is OFF by default; these verbs never enable capture (that is ORGANON_TELEMETRY=1 + `telemetry --accept`).
do_telemetry() { need_bun; bun run script/telemetry.ts ${PASS_ARGS[@]+"${PASS_ARGS[@]}"}; }
do_feedback() { need_bun; bun run script/feedback.ts ${PASS_ARGS[@]+"${PASS_ARGS[@]}"}; }

case "$MODE" in
  check)  prereq_check;;
  setup)  exec bash "$(dirname "$0")/organon-setup.sh";;   # the wizard (masked BYOK keys · chmod 600 · doctor chained)
  setup-deps) need_bun; setup;;                            # internal: deps+venv only (the wizard calls this)
  doctor) need_bun; bun run script/doctor.ts;;             # the standing diagnostic — copy-pasteable bug-report block
  version) need_bun; bun run script/doctor.ts --version;;  # version = package + git sha + PINS_SHA (truthful, pinned)
  status) do_status;;
  launch) do_launch;;
  verify) do_verify;;
  stamp)  do_stamp;;
  release) do_release;;
  ask)    do_ask;;
  monitor) need_bun; bun run script/monitor-manifests.ts "${PASS_ARGS[@]}";;  # re-judge held manifests on the capture cadence (X-CADENCE; reads-never-acts; no daemon)
  telemetry) do_telemetry;;
  feedback)  do_feedback;;
  menu|*) tui;;
esac
