/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B3 wall: S136 — THE BREAK LEDGER. *Never sheds — the only direct order the pen
 * has ever issued (D33: "break it to understand yourself, red team the math adversely").*
 *
 * The frozen core's DSR/PSR/PBO attacked five classes deep (DD-49). Every finding classified into EXACTLY ONE of
 * BREAK / ASSUMPTION-LIMIT / THEORY-GAP (a clean pass is NONE). RP-1: an ASSUMPTION-LIMIT must cite its assumption by paper
 * section — one that cannot is reclassified BREAK by default (the burden falls toward the harsher class). A BREAK carries its
 * reproduction. rigor.py stays BYTE-FROZEN — 0 drift before AND after the autopsy; every BREAK is ROUTED, never fixed in place.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"

const rec = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "math-redteam.json"), "utf8"))
const VALID = new Set(["BREAK", "ASSUMPTION-LIMIT", "THEORY-GAP", "NONE"])

// the classification validator (S136 / RP-1) — a finding is well-formed iff: it carries a valid classification; a BREAK has a
// reproduction; an ASSUMPTION-LIMIT cites its assumption (else it is reclassified BREAK by default, the harsher class).
function validateFinding(f: { classification?: string; assumptionCited?: string; reproduction?: string }): { ok: boolean; effectiveClass: string; why: string } {
  if (!f.classification || !VALID.has(f.classification)) return { ok: false, effectiveClass: "UNCLASSIFIED", why: "no valid classification — a finding with no classification FAILS" }
  if (f.classification === "ASSUMPTION-LIMIT" && !f.assumptionCited) return { ok: false, effectiveClass: "BREAK", why: "an ASSUMPTION-LIMIT that cannot cite its assumption is RECLASSIFIED BREAK (RP-1)" }
  if (f.classification === "BREAK" && !f.reproduction) return { ok: false, effectiveClass: "BREAK", why: "a BREAK without a reproduction FAILS (S136)" }
  return { ok: true, effectiveClass: f.classification, why: "well-formed" }
}

test("S136 (W-SB02) — the ledger EXECUTED: five attack classes run, every finding classified into exactly one of BREAK/ASSUMPTION-LIMIT/THEORY-GAP/NONE", () => {
  expect(rec.ledger.executed).toBe(true)
  expect(rec.ledger.attackClassesRun.sort()).toEqual(["adversarial", "degenerate", "known-answer", "null-distribution", "property"])
  expect(Array.isArray(rec.ledger.findings)).toBe(true)
  expect(rec.ledger.findings.length).toBeGreaterThanOrEqual(10)
  for (const f of rec.ledger.findings) expect(VALID.has(f.classification)).toBe(true) // exactly one valid class each
  // the counts partition the findings exactly
  const c = rec.ledger.counts
  expect(c.BREAK + c["ASSUMPTION-LIMIT"] + c["THEORY-GAP"] + c.clean).toBe(c.total)
  expect(c.total).toBe(rec.ledger.findings.length)
})

test("S136 / RP-1 — every ASSUMPTION-LIMIT cites its assumption by section; the classifier RECLASSIFIES an uncited one BREAK (burden toward the harsher class)", () => {
  for (const f of rec.ledger.findings) {
    const v = validateFinding(f)
    expect(v.ok).toBe(true) // every committed finding is well-formed (RP-1 satisfied)
    if (f.classification === "ASSUMPTION-LIMIT") expect(typeof f.assumptionCited).toBe("string")
  }
  // SEEDED NEGATIVE — an assumption-limit that cannot cite its assumption is reclassified BREAK by default (RP-1)
  expect(validateFinding({ classification: "ASSUMPTION-LIMIT" }).effectiveClass).toBe("BREAK")
  // SEEDED NEGATIVE — a finding with no classification FAILS
  expect(validateFinding({}).ok).toBe(false)
  // SEEDED NEGATIVE — a BREAK with no reproduction FAILS
  expect(validateFinding({ classification: "BREAK" }).ok).toBe(false)
})

test("S136 — NO BREAK found (the honest lower bound), and IF a break existed it would carry a reproduction and be ROUTED, never fixed", () => {
  const breaks = rec.ledger.findings.filter((f: { classification: string }) => f.classification === "BREAK")
  expect(breaks.length).toBe(rec.ledger.counts.BREAK)
  expect(breaks.length).toBe(0) // the frozen core is faithful across five attack classes
  expect(rec.ledger.headline).toMatch(/LOWER BOUND, not a proof/i) // an empty ledger carries its honest bound
  for (const b of breaks) expect(typeof b.reproduction).toBe("string") // vacuously true, but the discipline holds
  expect(rec.ledger.standingRule).toMatch(/BYTE-FROZEN|ROUTED to the gate, never fixed/i)
})

test("S136 / RP-2 — the known-answer search is RECORDED (found/partial/none, sources named), never silently substituted", () => {
  expect(rec.ledger.knownAnswerProvenance).toMatch(/PARTIAL|FOUND|NONE/i)
  expect(rec.ledger.knownAnswerProvenance).toMatch(/purgedcv|Bailey|closed-form/i) // the sources are named
  // the autocorrelation (i.i.d.) assumption-limit is present and routed FLAG-DON'T-EMIT, not a break (attack #4)
  const iid = rec.ledger.findings.find((f: { attack: string }) => /autocorrelat|i\.i\.d/i.test(f.attack))
  expect(iid).toBeTruthy()
  expect(iid.classification).toBe("ASSUMPTION-LIMIT")
  expect(iid.routed).toMatch(/FLAG-DON'T-EMIT|routed to the gate/i)
  expect(iid.routed).toMatch(/(NOT|never) an? (fix|change|edit).*(rigor\.py|frozen)/i) // the fix is a render caveat, NEVER an edit to the frozen core
})

test("S136 — rigor.py stays BYTE-FROZEN through the autopsy: 0 drift before AND after; the live frozen check agrees", () => {
  expect(rec.frozenBefore.ok).toBe(true)
  expect(rec.frozenAfter.ok).toBe(true)
  expect(rec.rigorPyBytesMovedZero).toBe(true)
  // the LIVE frozen check confirms rigor.py is still byte-identical to its pin (the autopsy touched nothing)
  const rows = checkFrozenSet() as unknown as { id: string; status: string }[]
  expect(rows.find((r) => r.id === "rigor.py")?.status).toBe("ok")
})
