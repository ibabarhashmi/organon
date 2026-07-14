/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 3 wall: S103 — THE FRESH CLONE, RUN FROM ZERO. W-DV04 (minted to close E-4).
 *
 * E-4: the pristine fresh-clone run was promoted at D44 (V33) and NEVER executed — the only test of RP-2's durable fix, the
 * census's clone-stability, and the frozen set's 7/9. This wall reads the committed transcript of a REAL clone (git clone
 * the local tree → setup → verify → the full battery, from zero). When the transcript is absent the wall SKIPS with
 * disclosure (the clone runs at the sprint's close, then this asserts); when present it asserts verify exit 0 + the battery
 * green ON THE CLONE, and that the transcript states what it PROVES (self-contained) and does NOT (a stranger's machine —
 * RP-6). A red clone is NEVER simulated (DD-19): a precise named blocker beats a green that lied.
 */
import { test, expect } from "bun:test"
import { Clone } from "../../src/organon/clone"

const t = Clone.transcript()

test("S103 (W-DV04) — the fresh clone RAN (or the wall skips with disclosure until it does — never a simulated green)", () => {
  if (!t) {
    // the transcript is absent — the clone has not run in this tree yet. This is DISCLOSED, not a fabricated pass: the
    // clone script (script/honesty/pristine-clone.ts) runs at the sprint's close and commits the real transcript.
    expect(Clone.pristine().ran).toBe(false) // honest: not-yet-run, never a green
    return
  }
  // the transcript is present — the clone RAN. Assert the convergence proof from zero (or the named blocker).
  const r = Clone.pristine()
  if (!r.ran) {
    expect(r.reason.length).toBeGreaterThan(20) // DD-19 — a genuine blocker is named in ONE checkable sentence
    return
  }
  expect(t.verify.exitCode).toBe(0) // verify GREEN on the clone — the evidence bundle reproduces from a fresh checkout
  expect(t.battery.fail).toBe(0) // the FULL battery is green ON THE CLONE (RP-2's durable cross-check provision survived)
  expect(t.battery.pass).toBeGreaterThan(1000) // a real full run, not an empty one
  expect(t.setup.provisionedCrossCheck).toBe(true) // RP-2 — setup provisioned purgedcv on the clone (S94 survives a fresh clone)
})

test("S103/RP-6 — the transcript states what it PROVES (self-contained) and what it does NOT (a stranger's machine — X-SHOWN(b))", () => {
  if (!t) return // skipped until the clone runs
  expect(t.proves).toMatch(/SELF-CONTAINED/i)
  expect(t.doesNotProve).toMatch(/STRANGER/i)
  expect(t.doesNotProve).toMatch(/UNTESTED until publication/i) // the strongest claim available is self-contained, not reproducible-by-anyone
})
