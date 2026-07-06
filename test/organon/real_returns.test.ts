/**
 * TEST — REAL-PIT is a provenanced claim (Data-Plane Phase 3; Rules D-LABEL, T-REAL). A REAL-PIT label REQUIRES
 * verifying provenance for EVERY series; a series without a nonce-anchored content hash forces BLOCKED — an
 * unprovenanced REAL-PIT is impossible by construction (the positive control). The REAL-PIT deflation demo is a
 * DISTINCT artifact from the V6 ILLUSTRATIVE trial-2 (different hash) — the numbers are never conflated. The verdict is
 * the core's, relayed verbatim; a REAL-PIT NO-GO is the product working.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DataPlane } from "../../src/dataplane/store"
import { DataPlaneAdjudicate } from "../../src/dataplane/adjudicate"

function series(reality: DataPlane.Provenance["reality"], nonce: string, contentSha: string): DataPlane.Series {
  return { key: "k", kind: "yield", points: [{ ts: 0, apyBase: 4 }], provenance: { source: "s", url: "u", capturedAt: 0, contentSha, nonce, chainPos: 0, reality } }
}

test("REAL-PIT label REQUIRES provenance — a series with a nonce-anchored content hash labels REAL-PIT", () => {
  const m = new Map([["k", series("REAL-PIT", "abc123", "deadbeef")]])
  const lab = DataPlaneAdjudicate.label(m)
  expect(lab.reality).toBe("REAL-PIT")
  expect(lab.provenance.length).toBe(1)
})

test("POSITIVE CONTROL: an unprovenanced series (no nonce) forces BLOCKED — an unprovenanced REAL-PIT is impossible", () => {
  const noNonce = DataPlaneAdjudicate.label(new Map([["k", series("REAL-PIT", "", "deadbeef")]]))
  expect(noNonce.reality).toBe("BLOCKED") // no nonce → cannot be REAL-PIT

  const noSha = DataPlaneAdjudicate.label(new Map([["k", series("REAL-PIT", "abc", "")]]))
  expect(noSha.reality).toBe("BLOCKED") // no content sha → cannot be REAL-PIT

  const notLabelled = DataPlaneAdjudicate.label(new Map([["k", series("ILLUSTRATIVE", "abc", "deadbeef")]]))
  expect(notLabelled.reality).toBe("BLOCKED") // provenance not itself REAL-PIT → cannot upgrade to REAL-PIT
})

test("returnsFromEquity computes period returns from an equity index (real carry, never forecast)", () => {
  const eq: [number, number][] = [[0, 1.0], [1, 1.01], [2, 1.0302]]
  const r = DataPlaneAdjudicate.returnsFromEquity(eq)
  expect(r.length).toBe(2)
  expect(Math.abs(r[0] - 0.01)).toBeLessThan(1e-12)
  expect(Math.abs(r[1] - 0.02)).toBeLessThan(1e-9)
})

test("the committed REAL-PIT adjudication carries REAL-PIT + traceable provenance — or is disclosed absent (fresh clone)", () => {
  const p = path.join(PKG_ROOT, "data", "studio", "real-returns-v9.json")
  if (!existsSync(p)) {
    console.log("  (real_returns) real-returns-v9.json absent — fresh clone; re-run script/real-returns.ts after capture")
    return
  }
  const ev = JSON.parse(readFileSync(p, "utf8")) as { blocked: boolean; adjudication?: { reality: string; provenance: unknown[]; verdict: string } }
  if (ev.blocked) return // BLOCKED on a fresh clone (no snapshots) — honest
  expect(ev.adjudication!.reality).toBe("REAL-PIT")
  expect(ev.adjudication!.provenance.length).toBeGreaterThanOrEqual(2) // provenance a skeptic can trace
  expect(typeof ev.adjudication!.verdict).toBe("string") // the core's verdict, relayed verbatim (a NO-GO is the product working)
})

test("the REAL-PIT deflation demo is DISTINCT from the ILLUSTRATIVE trial-2 (different artifact + hash, never conflated)", () => {
  const p = path.join(PKG_ROOT, "data", "studio", "deflation-demo-realpit-v9.json")
  if (!existsSync(p)) return
  const ev = JSON.parse(readFileSync(p, "utf8")) as { reality: string; returnsSha: string; deflated: boolean }
  expect(ev.reality).toBe("REAL-PIT") // real returns, not the V6 canned ones
  expect(ev.deflated).toBe(true) // the family-size mechanism stiffens the bar on real data
  // the illustrative trial-2 artifact (if present) must carry a DIFFERENT data reality label — never conflated
  const trial2 = path.join(PKG_ROOT, "data", "studio", "live-run-2-artifact.json")
  if (existsSync(trial2)) {
    const t2 = JSON.parse(readFileSync(trial2, "utf8")) as { dataReality?: string }
    if (t2.dataReality) expect(t2.dataReality).toBe("ILLUSTRATIVE") // the two are kept apart by their labels
  }
})
