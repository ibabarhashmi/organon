/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 2 wall (DIAGNOSED; X-LINEAGE a). The instrumented diagnosis artifact
 * (data/honesty/lineage-diagnosis.json) exists, covers EVERY shelf pool with the complete identity schema, and — the
 * anti-fabrication guard — its stated hypothesis PROVABLY FOLLOWS the captured evidence (the test re-derives the
 * H1/H2/H3 signals from the artifact's own perPool rows and asserts they match the recorded finding; a hedge where the
 * rows show identical hashes, or a claim the rows contradict, FAILS). D20 is in the ledger, verbatim. This wall reads the
 * committed artifact (clone-robust — it does NOT re-resolve the live environment) + the registry; it imports no verdict
 * surface, so it cannot move a golden. NO product diff belongs in the diagnosis phase (verified in the BUILDLOG via git).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = path.join(PKG_ROOT, "data", "honesty")
const diag = JSON.parse(readFileSync(path.join(H, "lineage-diagnosis.json"), "utf8"))
const registry = JSON.parse(readFileSync(path.join(H, "shelf-registry.json"), "utf8"))
const devs = JSON.parse(readFileSync(path.join(H, "deviations.json"), "utf8")).deviations as { id: string; whatWasDone: string; lawAuthority: string }[]
type Row = { pool: string; name: string; source: string | null; reality: string | null; nObs: number; seriesContentHash: string; reproHash: string | null; significance: number | null; familyN: number; verdict: string }
const rows = diag.finding.perPool as Row[]

test("DIAGNOSIS — the artifact exists, is a pure READ (no fix), and covers EVERY shelf pool with the complete identity schema", () => {
  expect(diag.protocol).toBe("lineage-diagnosis")
  expect(diag.method).toMatch(/pure READ of the live Stamp path|NO fix|finding is DERIVED/i)
  // every shelf pool is captured, once
  const shelfKeys = registry.pools.map((p: { poolKey: string }) => p.poolKey).sort()
  expect(rows.map((r) => r.pool).sort()).toEqual(shelfKeys)
  expect(diag.shelfPoolCount).toBe(registry.pools.length)
  // the identity schema is complete on every row (the reproHash + seriesContentHash fields are mandatory)
  for (const r of rows) {
    for (const f of ["pool", "name", "source", "reality", "nObs", "seriesContentHash", "reproHash", "significance", "familyN", "verdict"]) expect(r).toHaveProperty(f)
    expect(r.seriesContentHash).toMatch(/^[0-9a-f]{64}$/) // always computed (even an empty series has a hash)
  }
})

test("DIAGNOSIS — the H-finding schema is complete + the hypothesis is one of the three (or INDETERMINATE)", () => {
  for (const f of ["hypothesis", "perPool", "evidence", "conclusion"]) expect(diag.finding).toHaveProperty(f)
  expect(["H1", "H2", "H3", "INDETERMINATE"]).toContain(diag.finding.hypothesis)
  expect(Array.isArray(diag.finding.evidence) && diag.finding.evidence.length).toBeGreaterThanOrEqual(3)
  expect(diag.finding.conclusion.length).toBeGreaterThan(200)
})

test("DIAGNOSIS — THE FINDING FOLLOWS THE EVIDENCE: the stated hypothesis is re-derived from the artifact's OWN rows and matches (a claim the rows contradict FAILS)", () => {
  const strong = rows.filter((r) => r.verdict === "GO" || r.verdict === "NO-GO")
  const present = rows.filter((r) => r.nObs > 0)
  // re-derive the three signals from the committed rows (independent of the script's own computation)
  const h1Breaches = strong.filter((r) => r.reality !== "REAL-PIT").length
  const dupCount = (vals: (string | null)[]) => { const m = new Map<string, number>(); for (const v of vals) if (v) m.set(v, (m.get(v) ?? 0) + 1); return [...m.values()].filter((n) => n > 1).length }
  const dupSeries = dupCount(present.map((r) => r.seriesContentHash))
  const dupRepro = dupCount(strong.map((r) => r.reproHash))
  const dupSource = dupCount(present.map((r) => r.source))
  const lookAlike = strong.length > 1 && strong.every((r) => r.verdict === "GO") && strong.every((r) => r.familyN === 1) && strong.every((r) => r.significance !== null && r.significance > 0.999)
  const distinctPerSubject = dupSeries === 0 && dupRepro === 0 && dupSource === 0

  // the hypothesis MUST be the one the evidence supports — the recorded finding is not allowed to disagree with its own rows
  if (diag.finding.hypothesis === "H1") expect(h1Breaches).toBeGreaterThan(0)
  if (diag.finding.hypothesis === "H2") expect(dupSeries + dupRepro).toBeGreaterThan(0)
  if (diag.finding.hypothesis === "H3") {
    expect(h1Breaches).toBe(0) // no SAMPLE-fed strong verdict
    expect(distinctPerSubject).toBe(true) // genuinely per-subject (no bleed)
    expect(lookAlike).toBe(true) // yet they look alike (all GO, n=1, sig>0.999)
  }
})

test("DIAGNOSIS — for THIS committed environment the finding is H3 (real-but-illegible): 7 REAL-PIT per-subject pools, 0 breaches, 0 bleed; the 2 funding pools honestly UNAVAILABLE", () => {
  expect(diag.finding.hypothesis).toBe("H3")
  const real = rows.filter((r) => r.reality === "REAL-PIT" && r.nObs > 0)
  const strong = rows.filter((r) => r.verdict === "GO" || r.verdict === "NO-GO")
  const unavailable = rows.filter((r) => r.verdict === "UNAVAILABLE")
  expect(strong.length).toBe(7)
  expect(strong.every((r) => r.verdict === "GO")).toBe(true)
  expect(strong.every((r) => r.familyN === 1)).toBe(true) // every GO is n=1 — the weakest form (the WALL-3 target)
  // the 7 present series are genuinely DISTINCT per subject (WALL-2's premise holds on the real data)
  expect(new Set(real.map((r) => r.seriesContentHash)).size).toBe(7)
  expect(new Set(strong.map((r) => r.reproHash)).size).toBe(7)
  expect(new Set(real.map((r) => r.source)).size).toBe(7)
  // the Operator's exact block is aave-v3 USDT's OWN row (not a shared bleed)
  const usdt = rows.find((r) => r.name === "aave-v3 USDT")!
  expect(usdt.nObs).toBe(1242)
  expect(usdt.significance).toBe(0.9999999999998763)
  expect((usdt.reproHash ?? "").startsWith("3c5264ca")).toBe(true)
  // the funding pools honestly degrade (no apy-shaped points) — never a fabricated GO
  expect(unavailable.map((r) => r.name).sort()).toEqual(["Hyperliquid BTC delta-neutral", "Hyperliquid ETH delta-neutral"])
})

test("DIAGNOSIS — D20 is recorded in the ledger, verbatim + Operator-signed (the finding derived from evidence, not authored to a conclusion)", () => {
  const d20 = devs.find((d) => d.id === "D20")
  expect(d20).toBeDefined()
  expect(d20!.whatWasDone).toMatch(/H3 \(real but illegible\)/i)
  expect(d20!.whatWasDone).toMatch(/H1 \(SAMPLE-fed\) REFUTED/i)
  expect(d20!.whatWasDone).toMatch(/H2 \(mis-keyed bleed\) REFUTED/i)
  expect(d20!.lawAuthority).toMatch(/X-LINEAGE\(a\)/)
  expect(d20!.lawAuthority).toMatch(/DERIVED programmatically|follows the evidence|Operator-signed/i)
})
