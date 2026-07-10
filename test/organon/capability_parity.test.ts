/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 3 walls (SPLIT-TRUE, part 2 — S48, the flagship). The CAPABILITY-PARITY
 * DIFFERENTIAL: the full verdict surface (shelf scorecard verdicts + the Stamp verdict + the pinned lending
 * fingerprint-set + the funding NO-GO) computed under zero-key · free-key · paid-key profiles is BYTE-IDENTICAL —
 * hermetic (fake keys, no live call: the engine never phones a provider to compute a verdict, which is the point).
 * Positive-controlled: a tampered verdict surface produces a DIFFERENT fingerprint (the byte-compare bites).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { computeParity, fingerprint, PROFILES } from "../../script/honesty/capability-parity"

const parity = await computeParity()

test("S48 — the three profiles yield BYTE-IDENTICAL verdict surfaces (a moved verdict word anywhere = the two-tier-truth breach = a Halt)", () => {
  expect(Object.keys(PROFILES)).toEqual(["zero-key", "free-key", "paid-key"])
  expect(parity.results.length).toBe(3)
  expect(parity.identical).toBe(true)
  const prints = Object.values(parity.fingerprints)
  expect(new Set(prints).size).toBe(1)
})

test("S48 — the parity surface carries the PINNED differential goldens (the parity baseline IS the frozen truth, not a fresh invention)", () => {
  const r = parity.results[0]
  expect(r.lendingSetSha).toBe("70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54")
  expect(r.fundingVerdict).toBe("NO-GO")
  expect(r.fundingReproHash ?? "").toMatch(/^0a63151b/)
  expect(Object.keys(r.shelfVerdicts).length).toBeGreaterThanOrEqual(3) // the whole shelf, not a cherry-pick
  expect(r.stampVerdict).toBeTruthy() // whatever word this clone's record yields — the SAME word under every profile
})

test("POSITIVE CONTROL — a tampered verdict surface fingerprints DIFFERENTLY (the byte-compare bites, not a no-op)", () => {
  const real = parity.results[0]
  const tampered = JSON.parse(JSON.stringify(real))
  const firstPool = Object.keys(tampered.shelfVerdicts)[0]
  tampered.shelfVerdicts[firstPool] = tampered.shelfVerdicts[firstPool] === "SOLID" ? "AVOID" : "SOLID"
  expect(fingerprint(tampered)).not.toBe(fingerprint(real))
  // and a tampered PROFILE NAME alone does NOT change the fingerprint (only the verdict surface is compared)
  const renamed = { ...real, profile: "paid-key" }
  expect(fingerprint(renamed)).toBe(fingerprint(real))
})

test("the committed parity artifact is green and self-consistent with the pinned rule", () => {
  const artifact = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capability-parity.json"), "utf8"))
  expect(artifact.identical).toBe(true)
  expect(artifact.rule).toMatch(/two-tier-truth/)
  expect(artifact.profiles).toEqual(["zero-key", "free-key", "paid-key"])
  expect(new Set(Object.values(artifact.fingerprints as Record<string, string>)).size).toBe(1)
})
