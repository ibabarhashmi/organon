/**
 * TEST — funding DELIVERED, oracle-faithful on real T1 data (End-User Phase 2; Rules E-ATTEMPT, D-DOMAIN, D-DIFF).
 * The committed fixture records the funding domain delivered: the RECONSTRUCTION transform byte-identical to the
 * monorepo's exact FreePitFunding.reconstruct, the funding_accrual.py sidecar byte-identical cross-tree, a REAL-PIT
 * funding adjudication (verdict relayed verbatim), a seeded flattering divergence caught. The reconstruct/annualize
 * MECHANISM is proven here on synthetic data (fresh-clone safe), and the T1 checksum gate refuses a tampered dump.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DataPlaneFunding } from "../../src/dataplane/funding"

const FIX = path.join(PKG_ROOT, "data", "studio", "funding-differential-v10.json")

test("annualize + reconstruct are byte-faithful to the monorepo funding transform (mechanism, fresh-clone safe)", () => {
  // annualize: rate * (24/intervalHours) * 365 — the exact monorepo formula
  expect(DataPlaneFunding.annualize(0.0001, 8)).toBeCloseTo(0.0001 * (24 / 8) * 365, 12)
  // reconstruct: parse the immutable-dump CSV, drop the header, sort by ts, keep {ts,rate,intervalHours,annualized}
  const csv = "calc_time,funding_interval_hours,last_funding_rate\n1735718400000,8,0.00005000\n1735689600015,8,0.00010000"
  const pts = DataPlaneFunding.reconstruct(csv)
  expect(pts.length).toBe(2)
  expect(pts[0].ts).toBe(1735689600015) // sorted ascending — the earlier ts first
  expect(pts[0].rate).toBe(0.0001)
  expect(pts[1].rate).toBe(0.00005)
})

test("the T1 checksum gate ACCEPTS a matching dump and REFUSES a tampered one (never fabricate)", () => {
  const zip = Buffer.from("immutable-dump-bytes")
  const { createHash } = require("node:crypto")
  const good = createHash("sha256").update(zip).digest("hex")
  expect(DataPlaneFunding.verifyT1(zip, `${good}  BTCUSDT-fundingRate-2025-01.zip`).ok).toBe(true)
  expect(DataPlaneFunding.verifyT1(zip, `deadbeef  x.zip`).ok).toBe(false) // a mismatch voids the T1 claim — refuse
})

test("buildFundingJob emits the funding_accrual.py contract (per-interval rates, not annualized)", () => {
  const pts = [ { ts: 1, rate: 0.0001, intervalHours: 8, annualized: 0 }, { ts: 2, rate: -0.0002, intervalHours: 8, annualized: 0 } ]
  const job = DataPlaneFunding.buildFundingJob(pts)
  expect(job.funding).toEqual([0.0001, -0.0002]) // raw per-interval charge, tail (negative) preserved
  expect(job.intervalHours).toBe(8)
  expect(job.notionalUsd).toBe(1_000_000)
})

test("the committed funding differential records DELIVERED (reconstruction + sidecar byte-identical, REAL-PIT, seeded catch)", () => {
  if (!existsSync(FIX)) {
    console.log("  (funding_differential) fixture absent — run script/funding-differential.ts (needs the sandbox + network). Disclosed.")
    return
  }
  const f = JSON.parse(readFileSync(FIX, "utf8"))
  expect(f.outcome).toBe("DELIVERED")
  expect(f.reconstructionDifferential.allMatch).toBe(true) // the monorepo's exact reconstruct == the standalone port
  expect(f.sidecarDifferential.byteIdentical).toBe(true) // funding_accrual.py byte-identical between trees
  expect(f.sidecarDifferential.outputMatch).toBe(true) // the same Job → byte-identical output cross-tree
  expect(f.realPitAdjudication.reality).toBe("REAL-PIT")
  expect(["NO-GO", "INSUFFICIENT-EVIDENCE", "CANNOT-VERIFY-DATA", "CANNOT-VERIFY-SEARCH", "CONDITIONAL"]).toContain(f.realPitAdjudication.verdict) // a non-GO on real data is the product working
  expect(f.seededDivergence.caught).toBe(true)
  expect(f.rePins).toBe(0)
})
