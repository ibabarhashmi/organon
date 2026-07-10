/**
 * ORGΛNON — THE MOAT SPRINT, Phase 1 wall (PR5 — the standing dual-repo divergence wall). data/honesty/dual-repo-
 * divergence.json records the per-repo expect() counts every sprint; both trees asserted 0-fail; the delta between them
 * DOCUMENTED, never smoothed. The wall BITES two ways: (1) a recorded delta that does not equal |organon − studio| is a
 * papered delta; (2) a non-zero delta without a note is a smoothing. The wall watches the divergence, it does not erase it.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const D = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "dual-repo-divergence.json"), "utf8"))

test("PR5 — both trees are 0-fail, same test count, same file count (the behavior is IDENTICAL; only the expect() count differs)", () => {
  expect(D.repos.organon.fail).toBe(0)
  expect(D.repos["organon-studio"].fail).toBe(0)
  expect(D.bothZeroFail).toBe(true)
  expect(D.repos.organon.tests).toBe(D.repos["organon-studio"].tests)
  expect(D.repos.organon.files).toBe(D.repos["organon-studio"].files)
  expect(D.sameTestCount).toBe(true)
  expect(D.sameFileCount).toBe(true)
})

test("PR5 — the recorded delta EQUALS |organon − studio| (a papered delta — counts differing but delta claimed 0 — fails here)", () => {
  const actual = Math.abs(D.repos.organon.expectCalls - D.repos["organon-studio"].expectCalls)
  expect(D.expectDelta, "recorded delta must equal the actual difference of the two counts").toBe(actual)
})

test("PR5 — a non-zero delta carries a note (a smoothing — a delta hidden without explanation — fails here)", () => {
  if (D.expectDelta > 0) {
    expect(typeof D.deltaNote).toBe("string")
    expect(D.deltaNote.length, "a documented, non-empty explanation for the delta").toBeGreaterThan(40)
    expect(D.deltaNote).toMatch(/DISC|never papered|watched|data-fixture/i)
  }
})
