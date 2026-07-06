/**
 * ORGΛNON — the FUNDING freepit T1 capture (End-User Phase 2; Rules E-ATTEMPT, D-LABEL, A3). Fetches Binance's IMMUTABLE
 * monthly funding-rate bulk dumps (data.binance.vision) + their published `.CHECKSUM`, verifies the sha256 chain (T1
 * admissibility — refuse on mismatch, never fabricate), reconstructs the PIT funding series, and stores it into the
 * standalone-native PIT store (provenance-chained, nonce-anchored — a retro-capture cannot verify). The raw dumps go to
 * a GITIGNORED temp (never committed); the committed guarantee is the provenance chain. Deterministic capturedAt (no
 * Date.now — Rule VIII). Run: bun run script/capture-funding.ts
 */
import { execFileSync } from "node:child_process"
import { writeFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneFunding } from "../src/dataplane/funding"

const SYMBOLS = ["BTCUSDT", "ETHUSDT"]
const MONTHS = ["2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"]
const NOW_BASE = 1_735_689_600_000 // 2025-01-01 — a fixed deterministic capture stamp (Rule VIII; no Date.now)
const tmp = mkdtempSync(path.join(tmpdir(), "funding-capture-")) // GITIGNORED (tmpdir) — raw dumps never committed

async function fetchBuf(url: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url)
      if (!r.ok) return null
      return Buffer.from(await r.arrayBuffer())
    } catch { /* retry */ }
  }
  return null
}

const captured: { symbol: string; months: number; points: number; t1: boolean; window: string }[] = []
for (const symbol of SYMBOLS) {
  const base = `https://data.binance.vision/data/futures/um/monthly/fundingRate/${symbol}`
  let allCsvRows: string[] = ["calc_time,funding_interval_hours,last_funding_rate"]
  let t1AllOk = true
  let monthsOk = 0
  for (const month of MONTHS) {
    const zipName = `${symbol}-fundingRate-${month}.zip`
    const zip = await fetchBuf(`${base}/${zipName}`)
    const checksum = await fetchBuf(`${base}/${zipName}.CHECKSUM`)
    if (!zip || !checksum) { console.log(`  ${symbol} ${month}: dump/checksum unreachable — skipped (gap-honest)`); continue }
    const t1 = DataPlaneFunding.verifyT1(zip, checksum.toString("utf8"))
    if (!t1.ok) { console.log(`  ${symbol} ${month}: T1 VOID — zip sha ${t1.got.slice(0, 12)}… ≠ published ${t1.want.slice(0, 12)}… — refused (never fabricated)`); t1AllOk = false; continue }
    // extract the CSV from the verified immutable zip
    const zipPath = path.join(tmp, zipName)
    writeFileSync(zipPath, zip)
    const csv = execFileSync("unzip", ["-p", zipPath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
    const rows = csv.trim().split("\n").slice(1) // drop each month's header; keep the rows
    allCsvRows.push(...rows)
    monthsOk++
  }
  const fullCsv = allCsvRows.join("\n")
  const points = DataPlaneFunding.reconstruct(fullCsv)
  if (points.length < 3) { console.log(`  ${symbol}: only ${points.length} points — not enough to store`); continue }
  // store the reconstructed PIT series into the provenance-chained store (kind "rate")
  const key = `funding:binance:${symbol}`
  const snap: DataPlane.SnapshotFile = {
    key, kind: "rate", source: "binance-data-vision:freepit-T1", url: `https://data.binance.vision/.../fundingRate/${symbol}`, capturedAt: NOW_BASE,
    points: points.map((p) => ({ ts: p.ts, rate: p.rate, intervalHours: p.intervalHours })),
  }
  const res = DataPlane.capture(snap, { origin: "manual" })
  const w = `${new Date(points[0].ts).toISOString().slice(0, 10)}..${new Date(points[points.length - 1].ts).toISOString().slice(0, 10)}`
  captured.push({ symbol, months: monthsOk, points: points.length, t1: t1AllOk, window: w })
  console.log(`  ${symbol}: ${monthsOk}/${MONTHS.length} months, ${points.length} funding intervals [${w}], T1 ${t1AllOk ? "OK" : "PARTIAL"} → snapshot ${res.contentSha.slice(0, 12)}… (nonce-anchored, chain pos ${res.chainPos})`)
}

const out = {
  protocol: "capture-funding-v10",
  at: "2026-07-05",
  rule: "E-ATTEMPT, A3 — freepit T1: Binance immutable monthly dumps, sha256 verified against the published CHECKSUM (refuse on mismatch, never fabricate)",
  source: "data.binance.vision (immutable monthly funding-rate bulk dumps + published CHECKSUM)",
  symbols: captured,
  note: "raw dumps gitignored (tmpdir); the committed guarantee is the nonce-anchored provenance chain. Re-capturable keyless.",
}
writeFileSync(path.join(DataPlane.paths.ROOT, "..", "studio", "capture-funding-v10.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`\ncaptured ${captured.length} funding series (T1-verified) · written data/studio/capture-funding-v10.json`)
