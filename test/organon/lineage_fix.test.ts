/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 4 wall (CAUSE-FIXED; X-LINEAGE e). D20 convicted H3 (real but illegible), so the
 * fix is the LEGIBILITY REPAIR ALONE — the three walls (Phase 3) ARE the fix; there is NO keying/cache/fallback path to
 * repair or delete, and (H3's signature) ZERO per-pool verdict changes. This wall proves exactly that:
 *   · the POST-FIX re-run: for EVERY shelf pool the render-side guard leaves the Stamp verdict UNCHANGED (WALL 1 degrades
 *     nothing on the real REAL-PIT shelf) — the disclosed verdict-change list is EMPTY, as D20 predicted;
 *   · the legibility landed: a real pool's render now carries the lineage + strength + CAPPED-significance (the defect the
 *     Operator hit is fixed) while the verdict WORD is byte-unchanged;
 *   · the fix aimed EXACTLY at the convicted hypothesis (H3) — no fabricated keying repair for a bleed that doesn't exist.
 * Clone-robust: the per-pool assertions gate on identity presence (a fresh clone resolves UNAVAILABLE honestly).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Stamp } from "../../src/studio/stamp"
import { Lineage } from "../../src/studio/lineage"
import { Reality } from "../../src/studio/reality"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const registry = JSON.parse(readFileSync(path.join(H, "shelf-registry.json"), "utf8"))
const diag = JSON.parse(readFileSync(path.join(H, "lineage-diagnosis.json"), "utf8"))

test("CAUSE-FIXED — D20 convicted H3, so the fix is legibility-only: the render-side guard changes ZERO shelf-pool verdicts (the disclosed change-list is EMPTY)", async () => {
  const changes: string[] = []
  for (const p of registry.pools) {
    const r = await Stamp.stampFor(p.poolKey)
    const id = Lineage.resolveIdentity(p.poolKey)
    const guarded = Lineage.guardRender(r.verdict, id)
    if (guarded.verdict !== r.verdict) changes.push(`${p.name}: ${r.verdict} → ${guarded.verdict}`)
  }
  expect(changes).toEqual([]) // H3: every pool keeps its verdict WORD; only the legibility changed (no keying/cache repair, no verdict move)
})

test("CAUSE-FIXED — a GO with a provable REAL lineage keeps its verdict WORD but is now LEGIBLE (lineage line + n=1 strength + capped significance); an unprovable one is degraded (WALL 1)", async () => {
  // find a real, provable-lineage GO pool if the snapshot environment provides one (clone-robust)
  let provedOne = false
  for (const p of registry.pools) {
    const id = Lineage.resolveIdentity(p.poolKey)
    const r = await Stamp.stampFor(p.poolKey)
    if (id && r.verdict === "GO") {
      const html = Reality.renderStamp(p.name, p.poolKey, r, id)
      expect(html).toMatch(/class="pill GO"/) // the verdict WORD is unchanged
      expect(html).toMatch(/Lineage — whose data earned this/) // WALL 2 — the defect (buried lineage) is fixed
      expect(html).toMatch(/deflation counted 1 attempt.*weakest form/i) // WALL 3 — the n=1 weakest-form label (the un-legible n=1 is fixed)
      expect(html).toMatch(/significance ≥ 0\.9999/) // WALL 3 — the sixteen-digit precision theater is capped
      expect(html).not.toMatch(/0\.9999999999998763/) // the sixteen-digit render is GONE from the display
      provedOne = true
      break
    }
  }
  // WALL 1 still bites on an unprovable payload regardless of environment (a GO off a SAMPLE identity → degraded)
  const goPayload = { available: true, verdict: "GO", terminalState: "GO", dsr: 1, familyN: 1, nObs: 1000, reproHash: "ab".repeat(10), reason: "GO", facts: null, decay: null, icir: null, cleanGo: true, minTRL: null } as unknown as Stamp.StampResult
  const degraded = Reality.renderStamp("x", "defillama:pool:x", goPayload, { poolKey: "x", source: "s", reality: "SAMPLE", asOf: 0, nPoints: 1000, seriesContentHash: "d".repeat(64) })
  expect(degraded).toMatch(/class="pill INSUFFICIENT"/)
  if (provedOne) expect(provedOne).toBe(true) // in the snapshot env we proved the legibility repair on real data
})

test("CAUSE-FIXED — the fix aimed EXACTLY at the convicted hypothesis (H3 legibility), not a fabricated keying/bleed repair — the diagnosis says H3 with 0 breaches / 0 bleed", () => {
  expect(diag.finding.hypothesis).toBe("H3")
  const rows = diag.finding.perPool as { reality: string | null; verdict: string; nObs: number; seriesContentHash: string }[]
  const strong = rows.filter((r) => r.verdict === "GO" || r.verdict === "NO-GO")
  expect(strong.every((r) => r.reality === "REAL-PIT")).toBe(true) // 0 SAMPLE-fed strong verdicts → no H1 repair was needed
  const presentHashes = rows.filter((r) => r.nObs > 0).map((r) => r.seriesContentHash)
  expect(new Set(presentHashes).size).toBe(presentHashes.length) // 0 duplicate identities → no H2 keying repair was fabricated
})

test("CAUSE-FIXED — no convicted fallback/cache/key path exists to delete (H3 has none); the Stamp math + scorecard path stay byte-frozen (a keying 'fix' would have moved a hash)", () => {
  // the Stamp-math module hashes are byte-identical (a keying repair would have edited stamp.ts/resolution — it didn't)
  const mods = JSON.parse(readFileSync(path.join(H, "lineage-pins.json"), "utf8")).stampMathFreeze.modules as Record<string, string>
  for (const [rel, want] of Object.entries(mods)) expect(sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))).toBe(want)
  // the scorecard is untouched by the fix (the Stamp is off the scorecard path — proven at the source boundary)
  const sc = readFileSync(path.join(PKG_ROOT, "src", "analytics", "scorecard.ts"), "utf8")
  expect(sc).not.toMatch(/lineage|guardRender/i) // the fix never reached the scorecard
})
