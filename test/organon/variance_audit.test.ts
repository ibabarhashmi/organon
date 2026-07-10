/**
 * ORGΛNON — THE MOAT SPRINT, Phase 4 wall (VARIANCE-HONEST; RE2/D27, S57). The i.i.d. audit's finding is evidence-matched
 * and the D27 decision honored:
 *   · the CODE fact is hermetically re-verifiable — rigor.py::psr (FROZEN) uses the √(n-1) i.i.d. variance (skew/kurtosis
 *     aware, autocorrelation-blind); the audit records it faithfully.
 *   · the DATA fact — the measured shelf/representative series are autocorrelated (τ_int > 1), so the bias is real; the
 *     finding is CONFIRMED and the direction is GENEROUS (never hedged against its own evidence — the D20 discipline).
 *   · the audit is READ-ONLY (it records the no-product-diff claim; the frozen effective_n.py is its measurement tool).
 *   · the CAVEAT is rendered NOW at the Stamp render (the honest interim; a render-layer disclosure).
 *   · the AMENDMENT is specified + PARKED (moat-pins) with the CONSERVATIVE-direction wall (a net-generous fix HALTS);
 *     no verdict moved this session (D27 unsigned).
 *   · the frozen seven + the verdict-path 7 hashes are BYTE-UNCHANGED (the caveat is render-layer, the math untouched).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Lineage } from "../../src/studio/lineage"
import { Stamp } from "../../src/studio/stamp"

const sha256 = (b: string) => createHash("sha256").update(readFileSync(path.join(PKG_ROOT, b), "utf8")).digest("hex")
const AUDIT = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "stamp-variance-audit.json"), "utf8"))
const PINS = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "moat-pins.json"), "utf8"))

const REAL = (nPoints: number): Lineage.SeriesIdentity => ({ poolKey: "p", source: "https://yields.llama.fi/chart/p", reality: "REAL-PIT", asOf: Date.parse("2026-07-01T00:00:00Z"), nPoints, seriesContentHash: "f".repeat(64) })
const go = { available: true, verdict: "GO", terminalState: "GO", dsr: 0.999, familyN: 1, nObs: 1200, reproHash: "deadbeef".repeat(5), reason: "GO — survives the deflation.", facts: null, decay: null, icir: null, cleanGo: true, minTRL: null } as unknown as Stamp.StampResult

test("S57 (code fact, hermetic) — rigor.py::psr (FROZEN) uses the i.i.d. √(n-1) variance; the audit records it faithfully", () => {
  const rigor = readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "rigor.py"), "utf8")
  const psr = rigor.slice(rigor.indexOf("def psr("), rigor.indexOf("def psr(") + 600)
  expect(psr).toMatch(/n\s*-\s*1/) // the √(n-1) factor — the independence assumption
  expect(psr).toMatch(/g3|g4|denom/) // corrects for skew/kurtosis, not autocorrelation
  expect(AUDIT.iidEvidence.assumesIid).toBe(true)
  expect(AUDIT.iidEvidence.why).toMatch(/INDEPENDENT|i\.i\.d|autocorrelation/i)
})

test("S57 (finding evidence-matched) — CONFIRMED + direction GENEROUS; the measured series are autocorrelated (τ_int > 1), never hedged", () => {
  expect(AUDIT.finding).toMatch(/CONFIRMED/)
  expect(AUDIT.biasDirection).toMatch(/GENEROUS/)
  const measured = (AUDIT.representativeReal.perPool as { measurable?: boolean; tauInt?: number }[]).filter((p) => p.measurable !== false)
  expect(measured.length, "at least one representative series measured").toBeGreaterThanOrEqual(1)
  for (const m of measured) expect(m.tauInt, "each measured series is autocorrelated").toBeGreaterThan(1.05)
})

test("S57 (read-only audit) — the audit records the no-product-diff discipline + uses the FROZEN effective_n.py as its tool", () => {
  expect(AUDIT.readOnly).toMatch(/git diff -- src\/. is empty|writes ONLY this artifact/i)
  expect(AUDIT.measurementMethod).toMatch(/FROZEN effective_n\.py/)
  expect(AUDIT.frozenSeven).toMatch(/byte-untouched/i)
})

test("S57 (caveat rendered) — the i.i.d.-optimism is disclosed at the Stamp render (the honest interim; render-layer)", () => {
  const html = Reality.renderStamp("audited GO", "defillama:pool:aud", go, REAL(1200))
  expect(html).toMatch(/optimistic ceiling, not a floor/i)
  expect(html).toMatch(/assumes each recorded observation is independent/i)
  expect(html).toMatch(/autocorrelated/i)
})

test("S57 (amendment specified + PARKED, conservative wall) — the effective-N floor is specified, the direction wall bites a generous fix, no verdict moved (D27 unsigned)", () => {
  const a = PINS.varianceAuditProtocol.d27Paths.amendment
  expect(a.shape).toMatch(/effective-?N floor|n_eff/i)
  expect(a.direction).toMatch(/CONSERVATIVE/)
  expect(a.direction).toMatch(/net-GENEROUS.*HALT|presumptively wrong/i)
  expect(a.frozenSevenUntouched).toMatch(/byte-identical|does not edit rigor/i)
  // D27 recorded but NOT signed (an agent must not perform the math amendment)
  const dev = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "deviations.json"), "utf8"))
  const d27 = dev.deviations.find((x: { id: string }) => x.id === "D27")
  expect(d27.operatorSigned).toBe(false)
  expect(d27.whatWasDone).toMatch(/CAVEAT is rendered|PARKED pending/i)
})

test("S57 (frozen math untouched) — the frozen-core (rigor.py, effective_n.py) + verdict-path 7 hashes are BYTE-UNCHANGED (the caveat is render-layer)", () => {
  for (const [rel, want] of Object.entries(PINS.frozenCoreHashes as Record<string, string>)) expect(sha256(rel), `${rel} moved`).toBe(want)
  for (const [rel, want] of Object.entries(PINS.verdictPathHashes as Record<string, string>)) expect(sha256(rel), `${rel} moved`).toBe(want)
})
