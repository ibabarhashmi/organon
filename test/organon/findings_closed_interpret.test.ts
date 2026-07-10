/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 1 wall (FINDINGS-CLOSED). The Interpreter validation findings IN1/IN4/IN5 are
 * closed + the IN3 POOL-EVENTS drift is FORCED to a signed branch, as record hygiene BEFORE the diagnosis + walls —
 * IN1 the register wall's TWO strengths stated (the RUNTIME gate enforces the register DISTINCTION; the FULL rubric is
 * exemplar+control-enforced, NOT a live-answer guarantee — continuity inherits NO live-Pro-provenance promise), IN4 the
 * browser/AT a11y pass pinned in writing to the PROBE sprint's Phase 0, IN5 the truncated-finish mark-only choice
 * recorded DELIBERATE, IN3 the POOL-EVENTS decision forced on the token's presence (absent → D21 fence-proven-only, the
 * drift ends). IN2 (the Operator real-screen session) is Phase 5, Operator-gated. No engine change — documentation +
 * ledger; this wall imports only fs/path (no verdict surface that could move a golden).
 *
 * NB the file name: findings_closed_sovereign (Sovereign SV1–SV5) is TAKEN; this closes the INTERPRETER findings
 * IN1–IN5, so it is findings_closed_interpret — the caught-collision naming discipline continues.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = path.join(PKG_ROOT, "data", "honesty")
const lv = JSON.parse(readFileSync(path.join(H, "lineage-pins.json"), "utf8"))
const devs = JSON.parse(readFileSync(path.join(H, "deviations.json"), "utf8")).deviations as { id: string; whatWasDone: string; lawAuthority: string }[]
const byId = (id: string) => lv.inResolutions.find((v: { id: string }) => v.id === id)

test("IN1 — the register wall's TWO strengths are stated: the RUNTIME gate enforces the register DISTINCTION; the FULL rubric is exemplar+control-enforced, NOT a live guarantee (continuity carries no live-Pro-provenance promise)", () => {
  const in1 = byId("IN1")
  expect(in1.status).toBe("RESOLVED")
  expect(in1.resolution).toMatch(/RUNTIME gate enforces the.*register DISTINCTION/i) // strength (1)
  expect(in1.resolution).toMatch(/EXEMPLARS \+ POSITIVE CONTROLS|NOT on every live answer/i) // strength (2)
  expect(in1.resolution).toMatch(/no live-Pro-provenance guarantee|NO live-Pro-provenance/i) // the exact thing continuity must NOT inherit
  // the W-IN02 lesson is carried: a deterministic UNVERIFIED answer that names no axis is FACT/BOUNDARY, not gated by the register wall
  expect(in1.resolution).toMatch(/FACT\/BOUNDARY|W-IN02/i)
})

test("IN4 — the real browser/AT a11y pass is pinned IN WRITING as the probe sprint's Phase 0 requirement (not claimed done here)", () => {
  const in4 = byId("IN4")
  expect(in4.status).toBe("RESOLVED")
  expect(in4.resolution).toMatch(/PROBE SPRINT's Phase 0/i)
  expect(in4.resolution).toMatch(/browser.*assistive-technology|live-viewport/i)
  expect(in4.resolution).toMatch(/not claimed done|standing.*follow-up|this harness has no browser/i)
})

test("IN5 — the truncated-finish mark-only choice is recorded DELIBERATE (a continuation call doubles cost + can compound truncation; the mark is the honest bounded choice; continuation PARKED)", () => {
  const in5 = byId("IN5")
  expect(in5.status).toBe("RESOLVED")
  expect(in5.resolution).toMatch(/mark-only was shipped/i)
  expect(in5.resolution).toMatch(/doubles cost.*compound truncation|COMPOUND truncation/i)
  expect(in5.resolution).toMatch(/PARKED/i) // the continuation stays a conscious future option
})

test("IN3 — the POOL-EVENTS drift is FORCED to a signed branch (never left undecided); this run: token ABSENT → D21 fence-proven-only, and the D21 ledger entry is present + Operator-signed", () => {
  const in3 = byId("IN3")
  expect(in3.status).toBe("RESOLVED")
  expect(["token-live", "D21-fence-proven-only"]).toContain(in3.branch) // a BRANCH is taken, not a drift
  // this run's environment had no HYPERSYNC_TOKEN → the fence-proven-only branch + the D21 ledger entry
  if (in3.branch === "D21-fence-proven-only") {
    expect(in3.resolution).toMatch(/token ABSENT|FENCE-PROVEN-ONLY|drift ENDS/i)
    const d21 = devs.find((d) => d.id === "D21")
    expect(d21).toBeDefined()
    expect(d21!.whatWasDone).toMatch(/FENCE-PROVEN-ONLY|NOT live-exercised|drift ENDS/i)
    expect(d21!.lawAuthority).toMatch(/Operator-signed/i)
  } else {
    // the token-live branch would evidence a committed live capture manifest instead
    expect(in3.resolution).toMatch(/live POOL-EVENTS capture.*committed|run end-to-end/i)
  }
})

test("IN2 — the Operator real-screen session is NAMED as Phase 5 Operator-gated (run or honest gap; never an agent simulation relabeled) — NOT claimed closed here", () => {
  const in2 = byId("IN2")
  expect(in2.status).toBe("PHASE-5-OPERATOR-GATED") // explicitly NOT resolved in Phase 1
  expect(in2.resolution).toMatch(/OPERATOR.*not the agent|never an agent simulation relabeled/i)
})

test("FINDINGS-CLOSED adds no engine change — record hygiene only: this wall imports only fs/path (no verdict surface that could move a golden)", () => {
  const self = readFileSync(path.join(PKG_ROOT, "test/organon/findings_closed_interpret.test.ts"), "utf8")
  const importBlock = self.slice(0, self.indexOf("const H ="))
  expect(importBlock).toMatch(/from "node:fs"/)
  expect(importBlock).toMatch(/frozen/) // only PKG_ROOT from the frozen module
  expect(importBlock).not.toMatch(/studio\/(scorecard|stamp|differential|console|lineage)|analytics\/scorecard/) // no verdict surface imported
})
