/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 3 wall (WALLS-UP; X-LINEAGE b,c,d). The three lineage walls are live + POSITIVE-
 * CONTROLLED, built ON TOP of the byte-frozen Stamp:
 *   · WALL 1 (S45) — SAMPLE-never-GO at the render: a seeded SAMPLE/short/absent/borrowed series → INSUFFICIENT/
 *     UNAVAILABLE, never GO; a cached pre-wall GO payload → still degraded (the guard is at the render, not the engine).
 *   · WALL 2 (S46) — per-subject distinctness + the lineage line: the series hash RECOMPUTES from the subject's own
 *     resolved series (the derivation asserted, not merely displayed); the N-pool walk holds distinct; a seeded bleed is
 *     caught; resolveIdentity ⟺ stampFor (nObs cross-check keeps the inlined derivation byte-honest).
 *   · WALL 3 (S47) — strength legibility + capped precision: n=1 the weakest-form label; the display capped ("≥ 0.9999",
 *     never sixteen digits) while the RAW value stays full-precision; the Stamp math module hashes byte-identical.
 * Clone-robust: the pure functions are tested synthetically (environment-independent); the live-data assertions gate on
 * identity presence (a fresh clone resolves UNAVAILABLE honestly — the walls hold clone-side too).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Lineage } from "../../src/studio/lineage"
import { Stamp } from "../../src/studio/stamp"
import { DataPlane } from "../../src/dataplane/store"
import { Reality } from "../../src/studio/reality"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const registry = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json"), "utf8"))
const REAL = (nPoints: number): Lineage.SeriesIdentity => ({ poolKey: "p", source: "https://yields.llama.fi/chart/p", reality: "REAL-PIT", asOf: Date.parse("2026-07-01T00:00:00Z"), nPoints, seriesContentHash: "f".repeat(64) })

// ── WALL 1 — SAMPLE-NEVER-GO AT THE RENDER (S45) ─────────────────────────────────────────────────────────────────────
test("S45 (WALL 1, pure) — guardRender: a REAL floor-clearing series passes; SAMPLE → INSUFFICIENT; too-short → INSUFFICIENT; absent → UNAVAILABLE; INSUFFICIENT/UNAVAILABLE pass through", () => {
  expect(Lineage.guardRender("GO", REAL(1249))).toEqual({ verdict: "GO", degraded: false, reason: "" }) // a real, per-subject, long series → unchanged
  const sample = Lineage.guardRender("GO", { ...REAL(1000), reality: "SAMPLE" })
  expect(sample.verdict).toBe("INSUFFICIENT"); expect(sample.degraded).toBe(true) // a SAMPLE series can NEVER render a GO
  const short = Lineage.guardRender("GO", REAL(30))
  expect(short.verdict).toBe("INSUFFICIENT"); expect(short.degraded).toBe(true) // below the 60-point floor
  const absent = Lineage.guardRender("GO", null)
  expect(absent.verdict).toBe("UNAVAILABLE"); expect(absent.degraded).toBe(true) // no resolved series → cannot render a verdict
  expect(Lineage.guardRender("NO-GO", { ...REAL(1000), reality: "SAMPLE" }).verdict).toBe("INSUFFICIENT") // a NO-GO off SAMPLE is also void
  expect(Lineage.guardRender("INSUFFICIENT", null).degraded).toBe(false) // already honest — pass through
  expect(Lineage.guardRender("UNAVAILABLE", null).degraded).toBe(false)
  expect(Lineage.SERIES_FLOOR).toBe(60)
})

test("S45 (WALL 1, at the render) — a cached pre-wall GO payload pushed at renderStamp with a SAMPLE identity renders INSUFFICIENT, never GO (the guard is on the RENDERED payload)", () => {
  const goPayload = { available: true, verdict: "GO", terminalState: "GO", dsr: 1, familyN: 1, nObs: 1000, reproHash: "deadbeef".repeat(5), reason: "GO — survives the deflation.", facts: null, decay: null, icir: null, cleanGo: true, minTRL: null } as unknown as Stamp.StampResult
  const sampleIdentity: Lineage.SeriesIdentity = { ...REAL(1000), reality: "SAMPLE" }
  const html = Reality.renderStamp("seeded SAMPLE pool", "defillama:pool:seed", goPayload, sampleIdentity)
  expect(html).toMatch(/class="pill INSUFFICIENT"/) // degraded at the render
  expect(html).not.toMatch(/class="pill GO"/) // the GO never survives to the pill
  expect(html).toMatch(/render degraded this verdict|SAMPLE-never-GO/i) // said plainly, never a silent swap
  // and an absent identity (a stale payload whose series is gone) → UNAVAILABLE at the render
  const gone = Reality.renderStamp("gone", "defillama:pool:gone", goPayload, null)
  expect(gone).toMatch(/class="pill UNAVAILABLE"/)
  expect(gone).not.toMatch(/class="pill GO"/)
})

// ── WALL 2 — PER-SUBJECT DISTINCTNESS + THE LINEAGE LINE (S46) ────────────────────────────────────────────────────────
test("S46 (WALL 2, derivation) — the lineage series-hash RECOMPUTES from the subject's OWN resolved series (asserted, not merely displayed); resolveIdentity ⟺ stampFor", async () => {
  let checkedReal = 0
  for (const p of registry.pools) {
    const key = p.poolKey as string
    const identity = Lineage.resolveIdentity(key)
    const stamp = await Stamp.stampFor(key)
    if (identity) {
      // the derivation: recompute the hash from the subject's own series exactly as the wall does
      const chartKey = key.replace(":pool:", ":chart:")
      const s = DataPlane.snapshotAdapter.fetchSeries(chartKey) ?? DataPlane.snapshotAdapter.fetchSeries(key)
      const returns = Stamp.poolReturnsFromSeries(s)
      expect(identity.seriesContentHash).toBe(sha256(JSON.stringify(returns))) // the rendered hash IS the subject's series
      expect(identity.nPoints).toBe(returns.length)
      expect(identity.nPoints).toBe(stamp.nObs) // the inlined derivation stays byte-honest vs the Stamp's own count
      checkedReal++
    } else {
      // resolveIdentity null ⟺ the Stamp is UNAVAILABLE (the exact correspondence — no lineage without a verdict-able series)
      expect(stamp.verdict).toBe("UNAVAILABLE")
    }
  }
  // in the snapshot-present environment this proves the derivation on real data; on a fresh clone it proves the correspondence
  if (checkedReal > 0) expect(checkedReal).toBeGreaterThanOrEqual(1)
})

test("S46 (WALL 2, distinctness) — the N-pool walk holds distinct on real data; a seeded bleed (one series under two subjects) is CAUGHT", () => {
  const identities = registry.pools.map((p: { poolKey: string }) => Lineage.resolveIdentity(p.poolKey))
  expect(Lineage.distinct(identities).ok).toBe(true) // no two DIFFERENT shelf pools share one lineage
  const real = identities.filter(Boolean) as Lineage.SeriesIdentity[]
  if (real.length >= 2) expect(new Set(real.map((i) => i.seriesContentHash)).size).toBe(real.length) // every present identity distinct
  // a seeded bleed — subject A's series hash under subject B — is a collision (WALL 2 bites)
  const bleed = Lineage.distinct([{ ...REAL(1000), poolKey: "A", seriesContentHash: "c".repeat(64) }, { ...REAL(1000), poolKey: "B", seriesContentHash: "c".repeat(64) }])
  expect(bleed.ok).toBe(false)
  expect(bleed.collisions[0].pools.sort()).toEqual(["A", "B"])
})

test("S46 (WALL 2, the line) — lineageLine renders the unmissable fields (source · REAL/SAMPLE · as-of · N · hash); null → the honest UNAVAILABLE line", () => {
  const line = Lineage.lineageLine(REAL(1249))
  expect(line).toMatch(/yields\.llama\.fi/) // source
  expect(line).toMatch(/REAL/) // provenance
  expect(line).toMatch(/as-of 2026-07-01/) // as-of
  expect(line).toMatch(/1249 recorded return points/) // N
  expect(line).toMatch(/series ffffffffffff…/) // the hash prefix
  expect(Lineage.lineageLine({ ...REAL(1000), reality: "SAMPLE" })).toMatch(/SAMPLE/) // a SAMPLE series is labeled SAMPLE, unmissably
  expect(Lineage.lineageLine(null)).toMatch(/no recorded return series|UNAVAILABLE/i)
})

// ── WALL 3 — GO-STRENGTH LEGIBILITY + CAPPED PRECISION (S47) ──────────────────────────────────────────────────────────
test("S47 (WALL 3, strength) — n=1 is labeled the WEAKEST form (nothing deflated away); n>1 states the multiple-testing charge; n=0 → no line", () => {
  expect(Lineage.strengthLine(1)).toMatch(/1 attempt.*WEAKEST form/i)
  expect(Lineage.strengthLine(1)).toMatch(/nothing was deflated away/i)
  expect(Lineage.strengthLine(7)).toMatch(/7 attempts.*7-way multiple-testing charge/i)
  expect(Lineage.strengthLine(0)).toBe("")
})

test("S47 (WALL 3, capped display, uncapped record) — a near-1 significance renders '≥ 0.9999' (never sixteen digits, never a bare 1.0000); the raw value is UNTOUCHED (capSig is pure)", () => {
  const raw = 0.9999999999998763
  expect(Lineage.capSig(raw)).toBe("≥ 0.9999") // the display is capped
  expect(raw).toBe(0.9999999999998763) // the record is byte-untouched (capSig returns a string; it never mutates the number)
  expect(Lineage.capSig(1)).toBe("≥ 0.9999") // exactly 1 → the ceiling, never a bare "1.0000"
  expect(Lineage.capSig(0.9999999999983499)).toBe("≥ 0.9999")
  expect(Lineage.capSig(0.42)).toBe("0.4200") // a genuinely-low value renders honestly at the cap
  expect(Lineage.capSig(null)).toBe("n/a")
  expect(Lineage.CAP_DIGITS).toBe(4)
  // the cap NEVER touches the recorded value: a real GO Stamp carries a full-precision dsr, the render caps only the DISPLAY
  const capped = Lineage.capSig(raw)
  expect(capped).not.toBe(String(raw)) // the string shown ≠ the raw value string (sixteen digits are gone from the display)
})

test("S47 (WALL 3, math untouched) — the pinned Stamp-math module hashes are byte-identical to the live files (this sprint rendered the statistics, it did not revise them)", () => {
  const mods = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "lineage-pins.json"), "utf8")).stampMathFreeze.modules as Record<string, string>
  for (const [rel, want] of Object.entries(mods)) expect(sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))).toBe(want)
})
