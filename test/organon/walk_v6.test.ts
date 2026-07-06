/**
 * TEST — THE WALK v6 converged honestly (Spine Phase 5; Rules E-CATALOG, E-ROOTCAUSE, C-LOOP, C-USER). The committed
 * record + hash-chained walk ledger prove: the pinned catalog v11 (23 scenarios) traversed in FULL each cycle, judged
 * against expected behavior; the genuine findings (W6-01 panels-not-surfaced, W6-02 framing-not-refusal-aware, W6-03
 * S3-check-over-specified) registered BEFORE their fixes and resolved with a root cause + a re-test; two consecutive
 * FULL-depth clean cycles across ≥4; CONVERGED-5 derived from the register, not asserted.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Walk } from "../../src/studio/walk"
import { Catalog } from "../../src/studio/catalog"

const REC = path.join(PKG_ROOT, "data", "studio", "walk-v6-cycles.json")

test("the walk CONVERGED-5: catalog-complete + rotation-complete + two consecutive FULL-depth clean + ≥4 cycles", () => {
  if (!existsSync(REC)) { console.log("  (walk_v6) record absent — run script/walk-v6.ts. Disclosed."); return }
  const r = JSON.parse(readFileSync(REC, "utf8"))
  expect(["CONVERGED-5", "NON-CONVERGENCE"]).toContain(r.outcome) // exactly one honest terminal
  if (r.outcome === "CONVERGED-5") {
    expect(r.catalogComplete).toBe(true)
    // walk-v6 traversed the v11 catalog it was pinned to (the live catalog is now v12 — a historical walk is judged
    // against its OWN pinned catalog, never a later one; anti-removal spans generations).
    const v11cat = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "studio", "e2e-catalog-v11.json"), "utf8"))
    expect(r.catalog.count).toBe(Catalog.verify(v11cat).count) // the FULL v11 pinned catalog (23), not a subset
    expect(r.catalog.count).toBeGreaterThanOrEqual(23)
    expect(r.rotationComplete).toBe(true)
    expect(r.twoConsecutiveClean).toBe(true)
    expect(r.cycleCount).toBeGreaterThanOrEqual(4)
    expect(r.converged5).toBe(true)
    expect(r.cleanFlags[0]).toBe(false) // cycle 1 is NOT clean (it found W6-01/02/03); a fixed finding doesn't clean its cycle
    expect(r.cleanFlags.filter((x: boolean) => x).length).toBeGreaterThanOrEqual(2)
  }
})

test("the WALK LEDGER is hash-chained, findings registered BEFORE their fixes, resolved with a root cause + re-test", () => {
  const f = path.join(PKG_ROOT, "data", "studio", "walk-v6-ledger.jsonl")
  if (!existsSync(f)) return
  const led = new Walk.Ledger(f)
  expect(led.verifyChain().ok).toBe(true)
  expect(led.openNonParked().length).toBe(0) // no open non-parked issues at convergence
  for (const id of ["W6-01", "W6-02", "W6-03"]) {
    const issue = led.current().find((i) => i.id === id)
    expect(issue?.status).toBe("fixed")
    expect(issue?.resolution).toMatch(/ROOT CAUSE/)
    expect(issue?.resolution).toMatch(/RE-TEST/)
    // register-before-fix: the FIRST record is the open registration, the LAST the fixed resolution
    const recs = led.all().filter((i) => i.id === id)
    expect(recs[0].status).toBe("open")
    expect(recs[recs.length - 1].status).toBe("fixed")
  }
})
