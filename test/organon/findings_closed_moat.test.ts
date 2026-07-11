/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 1 wall (FINDINGS-CLOSED + D26-DECIDED). Closes every Moat finding:
 *  · MT3 — the two post-mortem layers labeled DISTINCT in the /postmortems render AND the ALPHA.md pitch, NEVER blurred
 *    into "we'd have caught it on real data" (RECONSTRUCTION all-SAMPLE vs AFTERMATH REAL-as-fetched).
 *  · MT2/D26 — the resolver decision recorded with the Bun cost folded (branch B built; branch A on signature).
 *  · MT1/MT4 — the Phase-5 gate package assembled with D27 (the variance amendment) FIRST; the whole gate presented.
 *  · MT5 — the FTO action re-confirmed + re-dated.
 *  · D28 (precision scope) + D29 (promotion) in the ledger, operatorSigned=false (parked/presented).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { app } from "../../script/serve-reality"

const pkg = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const CS = JSON.parse(pkg("data/honesty/precision-countersign-package.json"))
const DEV = JSON.parse(pkg("data/honesty/deviations.json"))

test("MT3 — the /postmortems render labels the TWO layers distinctly and disavows the blurred phrasing", async () => {
  const res = await app.request("/postmortems")
  expect(res.status).toBe(200)
  const body = (await res.json()) as {
    layers: { reconstruction: { label: string; means: string }; aftermath: { label: string; means: string } }
    distinctness: string
    subjects: { reconstruction: { layer: string }; aftermath: { layer: string } }[]
  }
  expect(body.layers.reconstruction.label).toMatch(/RECONSTRUCTION \(all-SAMPLE\)/)
  expect(body.layers.aftermath.label).toMatch(/AFTERMATH \(REAL-as-fetched\)/)
  // the reconstruction means "what we'd have flagged" and EXPLICITLY is NOT a claim of catching it on real data
  expect(body.layers.reconstruction.means).toMatch(/what we'd have flagged/i)
  expect(body.layers.reconstruction.means).toMatch(/NOT a claim we caught it on real data/i)
  expect(body.layers.aftermath.means).toMatch(/REAL-AS-FETCHED-NOW, never as-of-collapse/i)
  // the blur is disavowed at the surface
  expect(body.distinctness).toMatch(/NEVER blurred|we'd have caught it on real data/i)
  // every subject carries BOTH labeled layers
  for (const s of body.subjects) {
    expect(s.reconstruction.layer).toMatch(/RECONSTRUCTION \(all-SAMPLE\)/)
    expect(s.aftermath.layer).toMatch(/AFTERMATH \(REAL-as-fetched\)/)
  }
})

test("MT3 — the ALPHA.md pitch mirrors the two-layer distinction verbatim and never blurs it", () => {
  const alpha = pkg("ALPHA.md")
  expect(alpha).toMatch(/RECONSTRUCTION \(all-SAMPLE\)/)
  expect(alpha).toMatch(/AFTERMATH \(REAL-as-fetched\)/)
  expect(alpha).toMatch(/two explicitly-labeled layers, never blurred/i)
  // the blurred phrasing must appear ONLY inside an explicit disavowal ("we do not claim …")
  const blurIdx = alpha.search(/we'd have caught it on real data/i)
  expect(blurIdx).toBeGreaterThan(-1)
  const around = alpha.slice(Math.max(0, blurIdx - 40), blurIdx)
  expect(around).toMatch(/do\s+\*?\*?not\*?\*?\s+claim/i)
})

test("MT2/D26 — the resolver decision is recorded with the Bun cost folded (branch B built; branch A on signature)", () => {
  const d26 = CS.deviations.find((d: { id: string }) => d.id === "D26")
  expect(d26.decisionThisSprint).toMatch(/BRANCH B BUILT/i)
  expect(d26.decisionThisSprint).toMatch(/branch A.*remains available|the moment the Operator signs/i)
  // a decision text that omits the Bun cost would be dishonest — assert it is folded in
  expect(d26.restsOn).toMatch(/Bun-1\.3\.11|runs under node/i)
  expect(d26.operatorSigned).toBe(false)
})

test("MT1/MT4 — the gate package is assembled with D27 FIRST and presents the WHOLE gate (IN2/IN4/AF4/push)", () => {
  expect(CS.deviations[0].id).toBe("D27") // D27 the variance amendment leads (MT1)
  expect(CS.deviations[0].order).toMatch(/FIRST.*MT1|top-priority/i)
  expect(CS.mt1_topCountersign).toMatch(/GENEROUS by 27–165|THAT IS THE FIX WORKING/i)
  // the whole gate, one sitting (MT4)
  for (const k of ["IN2", "IN4", "AF4", "push"]) expect(CS.gateItems[k], `missing ${k}`).toBeTruthy()
  expect(CS.gateItems.IN2).toMatch(/OWED-OPERATOR-GATED|never simulated|LN5/i)
  expect(CS.rule).toMatch(/no partial credit|Discharged whole/i)
  // every countersign unsigned (an agent must not sign as the Operator)
  for (const d of CS.deviations) expect(d.operatorSigned, `${d.id} pre-signed`).toBe(false)
})

test("MT5 — the FTO action is re-confirmed + re-dated (US 2019/0294990 A1, Operator-owned)", () => {
  const fto = CS.mt5_ftoReDated
  expect(fto.patent).toBe("US 2019/0294990 A1")
  expect(fto.owner).toMatch(/Operator/)
  expect(fto.reDated).toBe("2026-07-11")
})

test("D28 (precision scope) + D29 (promotion) are in the ledger, operatorSigned=false", () => {
  const d28 = DEV.deviations.find((d: { id: string }) => d.id === "D28")
  const d29 = DEV.deviations.find((d: { id: string }) => d.id === "D29")
  expect(d28.operatorSigned).toBe(false)
  expect(d28.whatWasDone).toMatch(/ZERO admin slot -> UNRESOLVED, NEVER EOA|CONSERVATIVE BY LAW/i)
  expect(d29.operatorSigned).toBe(false)
  expect(d29.whatWasDone).toMatch(/degrade-only|CAP a verdict at CAUTION, NEVER lift/i)
})
