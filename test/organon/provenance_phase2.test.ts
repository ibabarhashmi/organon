/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 2 walls (S170 applied, RP-2): THE CARRIED-CLAIM AUDIT. NO NEW LAW (seventh).
 *
 * W-PR02 (S170) — M-2: V41's D33 note/iidRider/flipEvidence were V39's PROSE reproduced verbatim in a "generated" field
 * (a stored string, not a claim computed this run). The audit walks every generated field and tags COMPUTED (a producer ran)
 * or carried:{from,why,reverified}. PART A′ #2: `carried` is a LOOPHOLE unless re-verified — so a carried field re-runs its
 * OWN inputs (RP-2/F-2, never transitively-coupled state) and the carried value must equal the recompute. The D33 note is
 * SPLIT: the SIGNABILITY claim is carried (D33 unchanged since the autopsy), the FALSE-FIRE reference (d67) is COMPUTED (the
 * REAL★ archive feeds it THIS sprint). A carry that would recompute differently is a lie the Ship Gate refuses.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Freshness } from "../../src/organon/freshness"

const AUDIT = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "carried-audit.json"), "utf8"))

test("S170 (W-PR02) — the committed carried-audit is HONEST: every generated field is COMPUTED or carried-and-reverified", () => {
  expect(AUDIT.honest).toBe(true)
  expect(AUDIT.computed).toBeGreaterThanOrEqual(5)
  expect(AUDIT.carried).toBeGreaterThanOrEqual(1)
  for (const f of AUDIT.fields) {
    expect(["COMPUTED", "CARRIED"]).toContain(f.kind)
    if (f.kind === "CARRIED") { expect(f.reverified).toBe(true); expect(f.inputsMoved).toBe(false); expect(Array.isArray(f.inputs)).toBe(true) }
    else expect(typeof f.producer).toBe("string")
  }
})

test("S170 (W-PR02) — the live audit REPRODUCES the committed one (a producer, not a stored table — X-DERIVE)", () => {
  const live = Freshness.honest(Rollup.freshnessAudit())
  expect(live.ok).toBe(AUDIT.honest)
  expect(live.computed).toBe(AUDIT.computed)
  expect(live.carried).toBe(AUDIT.carried)
})

test("S170 (RP-2/F-2) — the D33 note is SPLIT: SIGNABILITY carried (D33 unchanged), FALSE-FIRE (d67) COMPUTED (the REAL★ archive feeds it this sprint)", () => {
  const note = Rollup.d33NoteClass()
  expect(note.kind).toBe("CARRIED")
  expect(note.from).toBe("V39")
  expect(note.reverified).toBe(true) // D33 is still SIGNABLE, so the carry re-verifies
  expect(note.inputs).toEqual(["d33.state"]) // its ONLY input — recomputed, not transitively-coupled state (RP-2)
  expect(note.inputsMoved).toBe(false)
  // the d67 FALSE-FIRE reference is COMPUTED (its input, the own-capture count, moves with the REAL★ archive — F-2)
  const d67 = Rollup.d67Line()
  expect(d67.cls.kind).toBe("COMPUTED")
  expect(d67.line).toMatch(/ownCaptures 0|UNJUDGEABLE/) // computed from the live own-capture count, honestly
})

test("S170 (W-PR02) — SEEDED NEGATIVE: a carried claim whose recompute would DIFFER is a lie (staleness cannot be BLESSED) — the audit is NOT honest", () => {
  // a carried field whose input moved this sprint → the recompute differs → reverified:false → the audit refuses
  const lie = Freshness.carried("some.field", "V39", "carried but its input moved", "OLD", ["movedInput"], () => "NEW (recompute differs)")
  expect(lie.reverified).toBe(false)
  expect(lie.inputsMoved).toBe(true)
  const honest = Freshness.honest([...Rollup.freshnessAudit(), lie])
  expect(honest.ok).toBe(false)
  expect(honest.lies.length).toBe(1)
})

test("S170 (W-PR02) — an UNTAGGED prior-sprint string in a COMPUTED field is caught (M-2's exact defect: V39's prose echoed untagged)", () => {
  const echoed = Freshness.computed("gate.echo", "producer", "V39's verbatim narrative")
  const offenders = Freshness.untaggedPriorStrings([echoed], { V39: "V39's verbatim narrative" })
  expect(offenders.length).toBe(1)
  expect(offenders[0]).toMatch(/untagged prior-sprint echo/)
})
