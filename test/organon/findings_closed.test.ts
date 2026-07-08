/**
 * ORGΛNON — THE PERSISTENCE SPRINT, Phase 1 walls (FINDINGS-CLOSED). The six Crown-Jewel validation findings are closed
 * as documentation + ledger (no engine change): V1 the screen-count reconciled ONCE (no "FROZEN AT 2"/bare "two-screen"
 * contradiction survives in a current-authority source; the SCREENS set + /health agree on the conscious 3, the Stamp a
 * sub-route); V3→D8 the dep=1 modeling assumption laddered in the ledger; V4 the Studio.submit/frozen-core naming
 * reconciled in stamp.ts (+ the frozen seven git-clean); V5 the GO(conditional) honest paragraph; V6 the live-value
 * ceiling stated. The differential is proven zero by the honesty_stamp X-KEEP wall — here we prove the RECORD is clean.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Evidence } from "../../src/studio/evidence"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const CONSCIOUS_3 = ["shelf", "reality-check", "ask"]

test("V1 — the screen set is the conscious 3, reconciled: SCREENS + the served /health agree (the Stamp a sub-route, not a screen)", () => {
  expect(Reality.SCREENS).toEqual(CONSCIOUS_3) // the runtime authority
  // the persistence pins reconcile it: 2 mass screens + the Stamp sub-route + the Ask console = 3
  const ps = JSON.parse(read("data/honesty/persistence-pins.json"))
  expect(ps.screens.count).toBe(3)
  expect(ps.screens.massScreens).toEqual(["shelf", "reality-check"])
  expect(ps.screens.stampIsASubRoute).toMatch(/sub-route|NOT a screen/i)
})

test("V1 — NO stale screen-count contradiction survives in a current-authority source (a lingering 'FROZEN AT 2' → fail)", () => {
  // the sources that state the screen set to a reader — each reconciled to the conscious 3, the stale prose removed
  for (const rel of ["src/studio/reality.ts", "script/serve-reality.ts", "test/organon/honesty_ui.test.ts"]) {
    const src = read(rel)
    expect(src).not.toMatch(/FROZEN AT 2/i) // the stale "frozen at two" contradiction is gone
    expect(src).not.toMatch(/two-screen consumer tool/i)
    expect(src).toMatch(/conscious 3|conscious three/i) // the reconciliation is stated
  }
  // PINS.md reconciles the count + names the Stamp a sub-route in the deviations line (D7)
  const pins = read("PINS.md")
  expect(pins).toMatch(/conscious \*\*2→3\*\*|2→3|conscious 3/i)
  expect(pins).toMatch(/Ask console|Ask Console/)
})

test("V3/D8 — the dep=1 modeling assumption is laddered in the live deviations ledger (the four fields; the default text)", () => {
  const dev = JSON.parse(read("data/honesty/deviations.json"))
  const d8 = dev.deviations.find((d: { id: string }) => d.id === "D8")
  expect(d8).toBeDefined()
  for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d8[k]).trim().length).toBeGreaterThan(0)
  expect(d8.whatWasDone).toMatch(/depProtocols=1|dependency=1|\?\? 1/i) // the concrete default
  expect(d8.whatWasDone).toMatch(/no existing.*verdict moves|baseline/i) // it moves no verdict
  expect(d8.lawAuthority).toMatch(/X-DEP/)
})

test("V4 — the Studio.submit / frozen-core naming is reconciled in stamp.ts (one core, invoked never edited) + frozen seven git-clean", () => {
  const src = read("src/studio/stamp.ts")
  expect(src).toMatch(/V4 RECONCILIATION/)
  expect(src).toMatch(/SAME byte-pinned core/i)
  expect(src).toMatch(/AttestAdjudicate/) // names the exact frozen path (Studio.submit → adjudicateRegistered → AttestAdjudicate.adjudicate)
  expect(src).toMatch(/core_byte_identity/)
  // and the frozen seven are actually byte-clean on disk (the reconciled fact is TRUE, not just asserted)
  expect(Evidence.frozenGitStatus().clean).toBe(true)
})

test("V5 — the GO(conditional) honest paragraph is a PUBLISHED artifact (PINS.md): deflation basis + post-hoc fence + the narrow rare-GO thesis", () => {
  // PUBLISHED (clone-robust) — not the internal BuildLog: the rare-GO honest paragraph lives in PINS.md, where a reader looks
  const pins = read("PINS.md")
  expect(pins).toMatch(/GO \(conditional\)/)
  expect(pins).toMatch(/survives the anti-PBO deflation/i) // the deflation basis
  expect(pins).toMatch(/post-hoc/i) // the fence
  expect(pins).toMatch(/not a safety verdict|NOT the scorecard's SOLID/i) // never conflated
  expect(pins).toMatch(/narrow|harder to earn/i) // the rare-GO thesis restated
  // and the engine's own GO reason carries the same honest framing (published in src/studio/stamp.ts)
  const stamp = read("src/studio/stamp.ts")
  expect(stamp).toMatch(/GO \(conditional\)/)
  expect(stamp).toMatch(/POST-HOC|post-hoc/)
})

test("V6 — the live-value ceiling is stated beside X-LIVE (the HASH reproduces, the underlying value is re-capturable not frozen)", () => {
  const pins = read("PINS.md")
  expect(pins).toMatch(/live-value ceiling/i)
  expect(pins).toMatch(/re-capturable, not frozen/i)
  // stated at the source too (the capture-manifest writer)
  const be = read("script/build-evidence.ts")
  expect(be).toMatch(/LIVE-VALUE CEILING/)
  expect(be).toMatch(/re-capturable, not frozen/i)
})
