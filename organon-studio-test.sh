#!/usr/bin/env bash
# ORGΛNON (standalone) — the studio trust battery: walls + the in-scope capability-floor tests.
set -euo pipefail
cd "$(dirname "$0")"
export NO_COLOR=1 XDG_DATA_HOME="$(mktemp -d)"
bun test --timeout 30000 test/walls/ \
  test/organon/ledger.test.ts \
  test/organon/ledger_laundering.test.ts \
  test/organon/ledger_refragmentation.test.ts \
  test/organon/durable_ledger.test.ts \
  test/organon/studio_capture.test.ts \
  test/organon/studio_clocks.test.ts \
  test/organon/studio_agents.test.ts \
  test/organon/studio_enroll.test.ts \
  test/organon/studio_surfaces.test.ts \
  test/organon/studio_routes.test.ts \
  test/organon/studio_screens.test.ts \
  test/organon/studio_graph.test.ts \
  test/organon/scheduler_cadence.test.ts \
  test/organon/restore_drill.test.ts \
  test/organon/surface_fuzz.test.ts \
  test/organon/error_honesty.test.ts \
  test/organon/walk_fixes.test.ts \
  test/organon/walk_ledger.test.ts \
  test/organon/rejection_boundary.test.ts \
  test/organon/served_persistence.test.ts \
  test/organon/tense_scan.test.ts \
  test/organon/ledger_pollution.test.ts \
  test/organon/inventory_absences.test.ts \
  test/organon/repro_contracts.test.ts \
  test/organon/capability_matrix.test.ts \
  test/organon/dataplane_store.test.ts \
  test/organon/dataplane_differential.test.ts \
  test/organon/real_returns.test.ts \
  test/organon/transform_differential.test.ts \
  test/organon/funding_differential.test.ts \
  test/organon/goal_console.test.ts \
  test/organon/walk_v5.test.ts \
  test/organon/breadth_panel.test.ts \
  test/organon/cpcv_panel.test.ts \
  test/organon/voc_proposer.test.ts \
  test/organon/basis_domain.test.ts \
  test/organon/walk_v6.test.ts \
  test/organon/summary_differential.test.ts \
  test/organon/walls_deeper.test.ts \
  test/organon/experiments_answered.test.ts \
  test/organon/guided_builder.test.ts \
  test/organon/walk_v7.test.ts \
  test/organon/ensemble_law.test.ts \
  test/organon/ensemble_preconditions.test.ts \
  test/organon/ensemble_builder_whole.test.ts \
  test/organon/ensemble_pool.test.ts \
  test/organon/walk_v8.test.ts \
  test/organon/ensemble_verification.test.ts \
  test/organon/why_law.test.ts \
  test/organon/selection_door.test.ts \
  test/organon/parity_identity.test.ts \
  test/organon/why_panel.test.ts \
  test/organon/runner.test.ts \
  test/organon/walk_v9.test.ts \
  test/organon/why_verification.test.ts
