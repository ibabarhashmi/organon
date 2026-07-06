#!/usr/bin/env bash
# ORGΛNON · run — the full pipeline → RWA-VERDICT.md.
# Thin wrapper: verifies the pinned snapshot, then runs the REAL verdict entry
# point (script/rwa-verdict.ts). It reimplements NOTHING and computes no number.
# Usage:  ./organon-run.sh [decisionCount=24] [seed=1]
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/organon-common.sh"

COUNT="${1:-}"; SEED="${2:-}"

banner "run — full pipeline → RWA-VERDICT.md"

# 1. Snapshot: pinned + idempotent. We do NOT refetch when v4 is present (no network needed).
if [ -f "$MANIFEST" ]; then
  ok "using pinned snapshot ($(ls "$SNAPSHOT_DIR"/*.json 2>/dev/null | wc -l | tr -d ' ') series, v$(grep -o '"snapshotVersion"[^,]*' "$MANIFEST" | grep -o '[0-9]*' | head -1))"
else
  warn "no snapshot found — building it (needs FRED_API_KEY, free sources only)"
  step "bun run scripts/snapshot.ts"
  ( cd "$REPO_ROOT" && bun run scripts/snapshot.ts ) || die "snapshot build failed"
fi

# 2. The pipeline. rwa-verdict.ts computes the Decision (count 24, byte-identical to v6) AND
#    runs the fair-edge + cohort-vs-asset diagnostics inline at the canonical n_trials 96,
#    embedding them into RWA-VERDICT.md. HALTs (exit 1) if any sanity check fails.
step "bun run script/rwa-verdict.ts ${COUNT} ${SEED}"
echo "${DIM}   (this runs the engine 3× for the Decision + the diagnostics — ~30-60s)${RST}"
( cd "$PKG" && bun run script/rwa-verdict.ts ${COUNT:+$COUNT} ${SEED:+$SEED} ) || die "pipeline HALTed — see output above (sanity/price-mark/adapter failure)"

# 3. Surface the headline truthfully — read straight from the artifact (no recomputation).
VERDICT_MD="$REPO_ROOT/RWA-VERDICT.md"
[ -f "$VERDICT_MD" ] || die "RWA-VERDICT.md was not written"
panel "verdict written → RWA-VERDICT.md"
pline "$(ok "$(head -1 "$VERDICT_MD" | sed 's/^# //')")"
pline ""
pline "plain-language layered report:  ./organon-report.sh"
pline "full numbers:  RWA-VERDICT.md · COHORT-VS-ASSET-W29.md · FAIR-EDGE-W275.md"
pend
