#!/usr/bin/env bash
# ORGΛNON · report — render the layered, plain-language REPORT.md from the
# existing verdict artifacts. Wraps script/report.ts, which RE-PRESENTS (never
# recomputes) the real artifacts: every number in REPORT.md is quoted from, and
# cited to, an existing .md (Rule VI). Run ./organon-run.sh first to (re)generate
# the source artifacts.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/organon-common.sh"

banner "report — render layered REPORT.md"

[ -f "$REPO_ROOT/RWA-VERDICT.md" ] || die "RWA-VERDICT.md not found — run ./organon-run.sh first"

step "bun run script/report.ts"
( cd "$PKG" && bun run script/report.ts ) || die "report generation failed"

REPORT_MD="$REPO_ROOT/REPORT.md"
[ -f "$REPORT_MD" ] || die "REPORT.md was not written"
banner "report written → REPORT.md"
ok "$(grep -m1 '^## ' "$REPORT_MD" | sed 's/^## //' || echo 'layered report ready')"
step "open REPORT.md — L1 plain headline → L2 meaning → L3 full numbers (cited) → L4 provenance"
