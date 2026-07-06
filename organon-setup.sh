#!/usr/bin/env bash
# ORGΛNON · setup — verify prerequisites and install JS deps. Idempotent.
# Checks: Bun, the Python sidecar venv, the FRED key, the pinned snapshot v4.
# It does NOT fetch data and does NOT touch the engine — it only verifies the
# ground a run needs, then runs `bun install`.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/organon-common.sh"

banner "setup — verify prerequisites"

# 1. Bun >= 1.3
need bun
BUN_V="$(bun --version)"
case "$BUN_V" in
  1.[3-9]*|1.[1-9][0-9]*|[2-9]*) ok "Bun $BUN_V (>= 1.3)";;
  *) die "Bun $BUN_V is too old — need >= 1.3";;
esac

# 2. Python sidecar venv (numpy/scipy per backtest/py/requirements-studio.txt (studio-slim; the heavy engine stack is parked, P1-1))
if [ -x "$PY" ]; then
  ok "Python sidecar venv present ($("$PY" --version 2>&1))"
else
  fail "Python venv missing at $PY"
  step "create it with:  cd \"$SRC/backtest/py\" && python3 -m venv .venv && .venv/bin/pip install -r requirements-studio.txt"
  die "Python sidecar not ready"
fi

# 3. FRED key — only needed to REFRESH the snapshot; the pinned snapshot needs no network.
if [ -f "$REPO_ROOT/.env" ] && grep -q '^FRED_API_KEY=' "$REPO_ROOT/.env"; then
  ok "FRED_API_KEY present in .env (only needed to refresh the snapshot)"
else
  warn "FRED_API_KEY not found in .env — fine for running the pinned snapshot; required only to refresh it"
fi

# 4. Pinned snapshot v4
if [ -f "$MANIFEST" ]; then
  VER="$(grep -o '"snapshotVersion"[^,]*' "$MANIFEST" | head -1 | grep -o '[0-9]*' || true)"
  NSER="$(ls "$SNAPSHOT_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$VER" = "4" ]; then ok "snapshot pinned at v4 ($NSER series in $SNAPSHOT_DIR)"; else warn "snapshot version is '$VER' (expected 4)"; fi
else
  warn "no snapshot manifest — run ./organon-run.sh (it verifies/builds the snapshot) or: bun run scripts/snapshot.ts"
fi

# 5. Install JS deps (idempotent)
step "bun install (idempotent)"
( cd "$REPO_ROOT" && bun install ) && ok "dependencies installed"

banner "setup complete"
step "next:  ./organon-run.sh   (run the pipeline → RWA-VERDICT.md)"
step "  or:  ./organon-test.sh  (full battery + golden-noise)"
step "  or:  bun run packages/solidity-sentinel/src/index.ts organon   (the menu TUI)"
