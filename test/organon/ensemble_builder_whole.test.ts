/**
 * ORGΛNON — Ensemble Phase 2 walls (BUILDER-WHOLE, K-SCOPE cure). The builder completed to three domains: funding + basis
 * compose/validate under the identical discipline; the basis MIN-tier + EXPERIMENTAL surfaced inline; per-domain honesty
 * (seeded priming caught); the per-domain U-SURFACE traversals admissible; the verdict differential byte-identical.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Builder } from "../../src/studio/builder"
import { Surface } from "../../src/studio/surface"
import { DataPlane } from "../../src/dataplane/store"
import { app } from "../../script/serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const post = (route: string, body: Record<string, string>) => app.request(route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() })
// the captured T1 funding snapshot is gitignored — absent on a fresh clone (W9-01). REAL-PIT where it exists, else the
// honest ILLUSTRATIVE fallback (real-where-it-exists; never a mislabeled REAL-PIT).
const fundingSnapshotPresent = (() => { try { const s = DataPlane.snapshotAdapter.fetchSeries("funding:binance:BTCUSDT"); return !!s && s.provenance?.reality === "REAL-PIT" && ((s.points[0] as { intervalHours?: number }).intervalHours ?? 8) === 8 } catch { return false } })()

// ── funding schema ──
test("funding composes a valid spec and refuses an invalid interval before registration", () => {
  const ok = Builder.composeFunding({ venue: "binance", interval: 8, side: "receive" })
  expect(ok.ok).toBe(true)
  if (ok.ok) expect(ok.spec.family).toBe("funding-carry")
  const bad = Builder.composeFunding({ venue: "binance", interval: 3, side: "receive" })
  expect(bad.ok).toBe(false)
  const badVenue = Builder.composeFunding({ venue: "kraken", interval: 8 })
  expect(badVenue.ok).toBe(false)
})

// ── basis schema + MIN-tier ──
test("basis composes at MIN(legs) tier, surfaces MIN-tier + EXPERIMENTAL inline, and refuses a mismatched pair", () => {
  const ok = Builder.composeBasis({ cexVenue: "binance", dexVenue: "hyperliquid" })
  expect(ok.ok).toBe(true)
  if (ok.ok) {
    expect(ok.spec.minTier).toBe("T2") // MIN(T1, T2) = T2 — a basis is only as strong as its weakest leg
    expect(ok.spec.cexTier).toBe("T1")
    expect(ok.spec.dexTier).toBe("T2")
    expect(ok.formNote).toContain("EXPERIMENTAL")
    expect(ok.formNote).toContain("MIN(")
  }
  expect(Builder.minTier("T1", "T2")).toBe("T2")
  expect(Builder.composeBasis({ cexVenue: "binance", dexVenue: "binance" }).ok).toBe(false) // mismatched (both CeFi)
  expect(Builder.composeBasis({ cexVenue: "hyperliquid", dexVenue: "hyperliquid" }).ok).toBe(false)
})

// ── per-domain honesty (a seeded priming help per domain caught) ──
test("per-domain help is honesty-checked; a seeded priming help is caught per domain", () => {
  expect(Builder.helpHonestFor(Builder.FUNDING_FIELDS, "funding").ok).toBe(true)
  expect(Builder.helpHonestFor(Builder.BASIS_FIELDS, "basis").ok).toBe(true)
  expect(Builder.helpHonestFor([{ id: "s", label: "x", help: "GUARANTEED high returns with leverage", kind: "select" }], "funding").ok).toBe(false)
})

// ── conservative defaults ──
test("the funding + basis defaults are conservative/ratified", () => {
  expect(Builder.FUNDING_DEFAULTS.side).toBe("receive")
  expect(Builder.FUNDING_DEFAULTS.intervalHours).toBe(8)
  expect(Builder.defaultsConservative()).toBe(true)
})

// ── the per-domain U-SURFACE traversals admissible (happy + failure) ──
test("the funding + basis builder traversals are admissible U-SURFACE evidence (fresh serve + failure state, no theater)", () => {
  for (const name of ["traversal-builder-funding.json", "traversal-builder-basis.json"]) {
    const t = Surface.loadTraversal(path.join(D, name))
    expect(t.ok, `${name}: ${t.issues.join("; ")}`).toBe(true)
    expect(Surface.isTheater(t.artifact!)).toBe(false)
  }
})

// ── the served routes produce a verdict (happy) and refuse invalid (failure) through the REAL handlers ──
test("the served funding/basis routes reach a verdict and refuse invalid compositions (funding binance 8h is now REAL-PIT — the V14 parity cure)", async () => {
  const fund = await (await post("/builder/funding", { venue: "binance", interval: "8", side: "receive" })).text()
  expect(fund).toContain("VERDICT:")
  // Explanation Phase 2 (clone-robust, W9-01): binance 8h → REAL-PIT where the captured T1 snapshot exists; ILLUSTRATIVE
  // (the honest fallback) where it does not (a gitignored fresh clone). Never a mislabeled REAL-PIT either way.
  expect(fund).toContain(fundingSnapshotPresent ? "REAL-PIT" : "ILLUSTRATIVE")
  const fundIllus = await (await post("/builder/funding", { venue: "bybit", interval: "8", side: "receive" })).text()
  expect(fundIllus).toContain("ILLUSTRATIVE") // bybit has no captured T1 snapshot → ILLUSTRATIVE, labeled honestly
  const fundBad = await (await post("/builder/funding", { venue: "binance", interval: "3" })).text()
  expect(fundBad).toContain("INVALID COMPOSITION")
  expect(fundBad).not.toContain("VERDICT:")
  const basis = await (await post("/builder/basis", { cexVenue: "binance", dexVenue: "hyperliquid" })).text()
  expect(basis).toContain("MIN(legs)=T2")
  expect(basis).toContain("EXPERIMENTAL")
  const basisBad = await (await post("/builder/basis", { cexVenue: "binance", dexVenue: "binance" })).text()
  expect(basisBad).toContain("INVALID COMPOSITION")
})

// ── the verdict differential byte-identical (the builder grew; no verdict moved) ──
test("BUILDER-WHOLE is satisfiable and the verdict differential is byte-identical", () => {
  const a = JSON.parse(readFileSync(path.join(D, "phase2-builder-whole-v13.json"), "utf8"))
  expect(a.threeDomainsComposable).toBe(true)
  expect(a.verdictDifferential.byteIdentical).toBe(true)
  expect(a.honesty.seededPrimingCaught).toBe(true)
  expect(a.basisMinTierInline).toBe(true)
  expect(a.censusDiff.ok).toBe(true)
})
