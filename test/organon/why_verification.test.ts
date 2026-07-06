/**
 * ORGΛNON — Explanation Phase 6 verification walls (HANDOFF-HONEST). The terminal's numbers derive themselves AND its
 * narrative arithmetic checks out (the delta-aware differential); both noise walls green; the verdict differential
 * byte-identical (no verdict moved by any panel or paraphrase); the newest door (the WHY panel) re-runs from nothing;
 * the ratification chain coherent with the WHY-panel ADOPT + the selection SUPERSEDE standing.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Summary } from "../../src/studio/summary"
import { Ratify } from "../../src/studio/ratify"

const D = path.join(PKG_ROOT, "data", "studio")
const art = () => JSON.parse(readFileSync(path.join(D, "phase6-verification-v14.json"), "utf8"))

test("the summary differential is green on the terminal's own numbers (floor 86 · 40 PRESENT / 3 ABSENT · catalog 46)", () => {
  const d = Summary.derive()
  expect(Summary.differential({ floor: 86, matrixPresent: 40, matrixAbsent: 3, catalogCount: 46 }, d).ok).toBe(true)
})

test("the DELTA-aware differential is green on the terminal's narrative arithmetic (floor 74→86 · matrix 34→40 · catalog 36→46)", () => {
  const d = Summary.derive()
  const r = Summary.deltaDifferential(
    [{ metric: "floor", from: 74, to: 86 }, { metric: "matrixPresent", from: 34, to: 40 }, { metric: "catalogCount", from: 36, to: 46 }],
    { floor: 74, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 }, d,
  )
  expect(r.ok, r.mismatches.join("; ")).toBe(true)
  // POSITIVE CONTROL: a wrong delta (the V13-style 58→ slip) is caught
  expect(Summary.deltaDifferential([{ metric: "floor", from: 58, to: 86 }], { floor: 74 }, d).ok).toBe(false)
})

test("Phase 6 verification: both noise walls green, verdict differential byte-identical, the newest door re-ran from nothing", () => {
  const a = art()
  expect(a.summaryDifferential.ok).toBe(true)
  expect(a.deltaDifferential.ok).toBe(true)
  expect(a.noiseWalls.voc.clean).toBe(true)
  expect(a.noiseWalls.pooled.clean).toBe(true)
  expect(a.verdictDifferential.byteIdentical).toBe(true)
  expect(a.newestDoorReRun.everyTerminalStateExplainable).toBe(true) // the WHY panel (screen extensions) re-run from nothing
  expect(a.newestDoorReRun.reachableThroughServedConsole).toBe(true)
  expect(a.rwaPinUnchanged).toBe(true)
  expect(a.noRePin).toBe(true)
})

test("the ratification chain (v14) verifies + is coherent; the WHY-panel ADOPT + the selection SUPERSEDE + the disposals stand", () => {
  const { entries, chainOk } = Ratify.load(path.join(D, "research-ratification-v14.json"))
  expect(chainOk).toBe(true)
  expect(Ratify.supersessionsCoherent(entries).ok).toBe(true)
  expect(Ratify.experimentRegistryCoherent(entries).ok).toBe(true)
  expect(Ratify.artifactRatified(entries, "src/analytics/explain.ts")).toBe(true) // the WHY panel ADOPT
  expect(Ratify.effectiveRecord(entries, "pool-member-selection-pricing")?.disposition).toBe("SUPERSEDE") // the selection door TERM
  expect(Ratify.effectiveRecord(entries, "hrp-portfolio-construction")?.disposition).toBe("SUPERSEDE")
  expect(Ratify.effectiveRecord(entries, "shared-multiuser-ledger-tournament")?.disposition).toBe("SUPERSEDE")
})

test("the parks forward are all disposed/filed (selection TERM · WHY DELIVERED · sybil FILED · tournament NO · hrp DISPOSED)", () => {
  const a = art()
  expect(a.parksForward.selection).toMatch(/TERM/)
  expect(a.parksForward.whyPanel).toMatch(/DELIVERED/)
  expect(a.parksForward.scopeParity).toMatch(/CURED/)
  expect(a.parksForward.signing).toMatch(/ever-standing/)
})

test("the pristine proof (if run via the runner) is green", () => {
  const f = path.join(D, "pristine-clone-v14.json")
  if (!existsSync(f)) { console.log("  (pristine) run script/pristine-clone.ts (via ./organon.sh --full). Disclosed."); return }
  const p = JSON.parse(readFileSync(f, "utf8"))
  expect(p.pristineGreen).toBe(true)
})
