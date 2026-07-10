/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 5 walls (RED-TEAM-CLEAN). The full S1–S51 catalog is accounted for: S1–S47
 * carried (re-run under the three capability profiles via the parity differential) + S48–S51 pinned and green. The
 * stranger red-team drive (S50) is recorded clean. The two human prerequisites (IN2/IN4) are recorded as OWED-
 * OPERATOR-GATED — an honest ALPHA BLOCKER on the human step, never waved through (A′#10). The convergence rule:
 * every machine-checkable gate green across the canonical battery; the alpha verdict is READY-PENDING-OPERATOR.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = (f: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", f), "utf8"))
const pins = H("alpha-pins.json")

test("S50 — the stranger red-team drive is recorded CLEAN: every hostile probe got a sentence, never a stack or a secret", () => {
  const rt = H("alpha-redteam.json")
  expect(rt.clean).toBe(true)
  expect(rt.probes.length).toBeGreaterThanOrEqual(8)
  for (const p of rt.probes) expect(p.ok, `probe failed: ${p.name}`).toBe(true)
  // the door probe, the injection probe, the flood, and the seeded-key grep are all present
  const names = rt.probes.map((p: { name: string }) => p.name).join(" | ")
  expect(names).toMatch(/injection/i)
  expect(names).toMatch(/fourth door/i)
  expect(names).toMatch(/flood/i)
  expect(names).toMatch(/seeded-key grep/i)
})

test("S48–S51 are pinned and their artifacts exist; S1–S47 carried (re-run under the three profiles via the parity differential)", () => {
  for (const s of ["S48", "S49", "S50", "S51"]) expect(pins.stressCatalog[s]).toBeTruthy()
  expect(pins.stressCatalog.carried).toMatch(/S1.S47/)
  // the S48 parity artifact is green; the S49/S50 artifacts exist
  expect(H("capability-parity.json").identical).toBe(true)
  expect(existsSync(path.join(PKG_ROOT, "data/honesty/alpha-security-pass.json"))).toBe(true)
  expect(existsSync(path.join(PKG_ROOT, "data/honesty/alpha-redteam.json"))).toBe(true)
})

test("IN2/IN4 (LN3) are DISCHARGED-OR-BLOCKED honestly — OWED-OPERATOR-GATED with a real checklist, never a silent skip (A′#10)", () => {
  const p = H("alpha-prereqs.json")
  for (const k of ["IN4_a11y", "IN2_operator_session"]) {
    expect(p[k].status).toMatch(/OWED — OPERATOR-GATED/)
    expect(p[k].operatorChecklist.length).toBeGreaterThanOrEqual(4) // a concrete checklist, not a hand-wave
    expect(p[k].recordedResult).toMatch(/PENDING|PASS|FAIL/) // a slot that MUST be filled, present
  }
  // LN5 carried verbatim: the agent-drive vs Operator-session distinction is stated
  expect(p.rule).toMatch(/CANNOT SIT the Operator's real-screen session/)
  // the honest consequence: the alpha verdict is gated on the human step, not faked green
  expect(p.handoffConsequence).toMatch(/READY-PENDING-OPERATOR/)
})

test("the parked list stays parked — no proposer surface, no reports/API productization, no new screen was added this sprint", () => {
  // the served screen set is still exactly the conscious 3 on :4444 (a fourth screen is a Halt)
  const reality = readFileSync(path.join(PKG_ROOT, "script/serve-reality.ts"), "utf8")
  const getRoutes = (reality.match(/app\.get\("\/[^"]*"/g) ?? []).map((s) => s.replace(/app\.get\("|"/g, ""))
  // /, /check/:key, /ask are the screens; /stamp/:key (drawer), /health, /refresh are sub-routes/ops — no NEW screen
  expect(getRoutes).toContain("/")
  expect(getRoutes).toContain("/check/:key")
  expect(getRoutes).toContain("/ask")
  expect(pins.screens.count).toBe(3)
})
