/**
 * ORGΛNON — THE MOAT SPRINT, Phase 1 wall (FINDINGS-CLOSED). Every Probe finding closed + the record items verified:
 * PR4 the DISC-B label reconciled at the natural bump (the Alpha chain intact as superseded history); RE3 the inert-
 * deflation label RENDERED on an n=1 Stamp (a render-layer disclosure, verdict-path hashes frozen); RE4 the FTO action
 * present + dated + Operator-owned; PR2 the countersign package complete (D23–D27, all operatorSigned=false — an agent
 * must not sign as the Operator). The RE3 render is positive-controlled (the text present on n=1, absent when the render
 * degrades a SAMPLE payload).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Lineage } from "../../src/studio/lineage"
import { Stamp } from "../../src/studio/stamp"

const readJson = (rel: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, rel), "utf8"))
const PINS = readJson("data/honesty/moat-pins.json")
const PKG = readJson("data/honesty/moat-countersign-package.json")

// the lineage_walls REAL identity helper — a per-subject, REAL-PIT, floor-clearing series
const REAL = (nPoints: number): Lineage.SeriesIdentity => ({ poolKey: "p", source: "https://yields.llama.fi/chart/p", reality: "REAL-PIT", asOf: Date.parse("2026-07-01T00:00:00Z"), nPoints, seriesContentHash: "f".repeat(64) })
const goN1 = { available: true, verdict: "GO", terminalState: "GO", dsr: 0.999, familyN: 1, nObs: 1000, reproHash: "deadbeef".repeat(5), reason: "GO — survives the deflation.", facts: null, decay: null, icir: null, cleanGo: true, minTRL: null } as unknown as Stamp.StampResult

test("PR4 — the DISC-B label is reconciled at the natural pins bump (the Alpha 'organon-studio' label superseded, the Alpha chain intact as history)", () => {
  const d = PINS.discBReconciliation
  expect(d.finding).toMatch(/organon-studio/)
  expect(d.reconciliation).toMatch(/SUPERSEDED|self-substantiating/i)
  expect(d.alphaChainIntact).toMatch(/UNTOUCHED|never rewrite|supersede/i)
  expect(d.driftEnds).toMatch(/ENDS/i)
})

test("RE3 — the inert-deflation label is RENDERED on an n=1 Stamp (unmissable at the render; verdict-path hashes untouched)", () => {
  const html = Reality.renderStamp("n=1 GO pool", "defillama:pool:n1", goN1, REAL(1000))
  expect(html).toMatch(/GO/)
  expect(html).toMatch(/deflation is currently inert/i)
  expect(html).toMatch(/no multiple-testing penalty was paid/i)
  // the pinned RE3 text is the source of the render words
  expect(PINS.re3InertDeflationLabel.text).toMatch(/inert.*no multiple-testing penalty/i)
})

test("RE3 (positive control) — the inert label does NOT appear when the render degrades a SAMPLE payload (no false 'inert' on a non-GO)", () => {
  const sampleIdentity: Lineage.SeriesIdentity = { ...REAL(1000), reality: "SAMPLE" }
  const html = Reality.renderStamp("seeded SAMPLE", "defillama:pool:seed", goN1, sampleIdentity)
  expect(html).not.toMatch(/deflation is currently inert/i) // WALL 1 degraded → INSUFFICIENT, no inert-GO note
})

test("RE4 — the FTO flag is a dated, Operator-owned business action (US 2019/0294990 A1)", () => {
  const r = PINS.re4FtoAction
  expect(r.patent).toBe("US 2019/0294990 A1")
  expect(r.owner).toMatch(/Operator/)
  expect(r.dated).toBeTruthy()
  expect(r.grantStatus).toMatch(/UNCONFIRMED/i)
})

test("PR2 — the countersign package is complete: D23–D27 present, EVERY one operatorSigned=false (an agent must not sign as the Operator)", () => {
  const ids = PKG.deviations.map((d: { id: string }) => d.id)
  expect(ids).toEqual(["D23", "D24", "D25", "D26", "D27"])
  for (const d of PKG.deviations) expect(d.operatorSigned, `${d.id} must be unsigned`).toBe(false)
  expect(PKG.presentedWhole).toMatch(/Phase 5|one sitting/i)
  expect(PKG.signingConsequence).toMatch(/invites go out|READY-PENDING-OPERATOR/i)
})
