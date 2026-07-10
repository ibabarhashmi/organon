/**
 * ORGΛNON — THE PROBE SPRINT, Phase 1 wall (FINDINGS-CLOSED — the Alpha findings AF1-AF7, both repos). AF5 pristine's
 * per-repo-correct branch · AF6 the durable self-contained provenance record + the pin-label note · AF3 D23's countersign
 * prepared (parity green both repos) · AF1/AF2/AF4 the prereqs recorded OWED-OPERATOR-GATED (never simulated) · LN1/LN2
 * carried. AF7 (the evidence bundle + itemized reconciliation) is carried in BUILDLOG-PROBE; the deviations D24/D25 land.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const json = (rel: string) => JSON.parse(read(rel))

test("AF5 — pristine.ts clone-checkout targets the SOURCE repo's current branch, not a hardcoded 'v0' (DISC-A resolved)", () => {
  const src = read("script/honesty/pristine.ts")
  expect(src).toMatch(/rev-parse", "--abbrev-ref", "HEAD"/) // it derives the source branch
  expect(src).not.toMatch(/checkout", "-q", "v0"/) // the dormant hardcoded v0 is gone
  expect(src).toMatch(/srcBranch/) // and checks out that branch on the clone
})

test("AF6 — a durable, self-contained base-identity record lives in this repo (not 'trust organon-studio')", () => {
  const p = json("data/honesty/probe-provenance.json")
  expect(p.selfContained).toBe(true)
  expect(p.baseIdentity.sharedBase).toMatch(/^34d20e7/)
  expect(p.alphaLayer.alphaTreeHash).toMatch(/^2b242ac7/)
  expect(p.alphaLayer.byteIdentical).toMatch(/byte-identical|===/i)
  expect(p.pinLabelNote).toMatch(/DISC-B|organon-studio.*label/i) // the pin-label honesty (AF6)
})

test("AF1/AF2/AF4 — the human/live prerequisites are recorded OWED-OPERATOR-GATED with real checklists, never simulated (LN5)", () => {
  const pr = json("data/honesty/probe-prereqs.json")
  for (const k of ["AF1_IN2_operator_session", "AF2_IN4_a11y", "AF4_live_paid_parity"]) {
    expect(pr[k].status, `${k} not owed-gated`).toMatch(/OWED — OPERATOR-GATED/)
    expect(pr[k].recordedResult).toMatch(/PENDING|PASS|FAIL/)
  }
  expect(pr.AF1_IN2_operator_session.operatorChecklist.length).toBeGreaterThanOrEqual(4)
  expect(pr.rule).toMatch(/CANNOT SIT the Operator|never simulated|LN5/i)
  expect(pr.handoffConsequence).toMatch(/READY-PENDING-OPERATOR|PROBE-ARMED/)
  // AF4 keeps the hermetic parity as the stand-in, owed-live (the split's promise, not yet paid-key-tested)
  expect(pr.AF4_live_paid_parity.hermeticStatus).toMatch(/PROVEN HERMETICALLY|cc7e5e5a/i)
})

test("AF3 — D23's countersign is PREPARED (parity green in both repos); D24/D25 land in the ledger, Operator-signed pending", () => {
  const dev = json("data/honesty/deviations.json")
  const byId = Object.fromEntries(dev.deviations.map((d: { id: string }) => [d.id, d]))
  expect(byId.D23.note).toMatch(/AF3.*GREEN in BOTH repos|countersign block is PREPARED/i)
  for (const id of ["D24", "D25"]) {
    expect(byId[id], `missing ${id}`).toBeTruthy()
    expect(byId[id].operatorSigned).toBe(false) // an agent must not sign as the Operator
  }
  expect(byId.D24.whatWasDone).toMatch(/OFF by default|scrubbed|double-consent/i)
  expect(byId.D25.whatWasDone).toMatch(/kill-criterion|re-score|SAMPLE/i)
})

test("LN1/LN2 carried verbatim in the pins (familyN=1 legible-not-stronger; the frozen-prose 1.000 residual)", () => {
  const P = json("data/honesty/probe-pins.json")
  expect(P.afResolutions.LN1).toMatch(/familyN=1|legible-not-stronger/i)
  expect(P.afResolutions.LN2).toMatch(/1\.000|frozen-prose|X-KEEP/i)
})
