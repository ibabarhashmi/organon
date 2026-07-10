/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 0 walls (PINS-LOCKED). The sprint is judgeable before it is buildable:
 * alpha-pins.json hash-locks (a changed pin ⇒ a changed sha), the VERDICT-PATH HASH SET matches the tree
 * (the modules no capability may ever flag into), the split contract carries both allowlists, the parity
 * contract asserts byte-identity across all three key profiles, and the wizard/doctor/scrub + D22 schemas
 * are present and testable. Red-team refusals from the blueprint's Phase-0 are positive-controlled.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "alpha-pins.json"), "utf8"))

test("the pins hash-lock: pinsSha is self-consistent AND the lock bites on mutation", () => {
  const { pinsSha, ...rest } = pins
  expect(sha256(JSON.stringify(rest))).toBe(pinsSha)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.splitContract.modelMayNever = "loosened"
  expect(sha256(JSON.stringify(mutated))).not.toBe(pinsSha)
})

test("the carry is verbatim: carriedFromPinsSha is the Lineage terminal PINS_SHA", () => {
  expect(pins.carriedFromPinsSha).toBe("ed4bb2cb8957f244927f5e00daf7ddd0d1408abf984dd1fe40ff0557f61bd42f")
  const lineage = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "lineage-pins.json"), "utf8"))
  expect(lineage.pinsSha).toBe(pins.carriedFromPinsSha)
})

test("the VERDICT-PATH HASH SET matches the tree byte-for-byte (no capability may ever flag into these)", () => {
  const entries = Object.entries(pins.verdictPathHashes as Record<string, string>)
  expect(entries.length).toBe(7)
  for (const [rel, want] of entries) {
    expect(sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))).toBe(want)
  }
  // the four Stamp modules carry the Lineage-frozen hashes verbatim
  expect(pins.verdictPathHashes["src/studio/stamp.ts"]).toBe("a4007e99b634fe3b2387eebc813fb4a058b496b370986f59cd2ffd0843bcaee0")
  expect(pins.verdictPathHashes["src/studio/decay.ts"]).toBe("6b419268160104858efccd6817bf46e3cfdc78e03a4248eb2890e10f6ad28cd1")
  expect(pins.verdictPathHashes["src/studio/icir.ts"]).toBe("215eb7e6f5185d160c9d185dd8684b3d1b7d3b1d173bf9aab084eb29008128e4")
  expect(pins.verdictPathHashes["src/studio/mintrl.ts"]).toBe("3a1d2216361b711041f60e5173713b5f43d0261910dbbc35fd4c462c7f714658")
})

test("the split contract refuses a verdict-path flag by construction (allowlists disjoint from the forbidden set)", () => {
  const model: string[] = pins.splitContract.modelConsumerAllowlist
  const data: string[] = pins.splitContract.dataConsumerAllowlist
  const forbidden: string[] = pins.splitContract.verdictPathForbidden
  expect(model.length).toBeGreaterThan(0)
  expect(data.length).toBeGreaterThan(0)
  for (const f of forbidden) {
    expect(model).not.toContain(f)
    expect(data).not.toContain(f)
  }
  // gates.ts is FORBIDDEN even though it lives in src/ask — model capabilities clean the gate's INPUT, never the gate
  expect(forbidden).toContain("src/ask/gates.ts")
  expect(model).not.toContain("src/ask/gates.ts")
})

test("the parity contract asserts full byte-identity across all three profiles (never less)", () => {
  expect(pins.parityContract.profiles).toEqual(["zero-key", "free-key", "paid-key"])
  expect(pins.parityContract.assertion).toMatch(/BYTE-IDENTICAL/)
  expect(pins.parityContract.differentialBaseline.lendingSetSha).toBe(
    "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54",
  )
})

test("the wizard/doctor/scrub contracts are pinned WITH the scrubber test (a doctor contract without it is refused)", () => {
  const w = pins.wizardContract
  expect(w.maskedInput).toBeTruthy()
  expect(w.validationNeverLogsBodies).toBeTruthy()
  expect(w.envPerms).toMatch(/600/)
  expect(w.scrubberTest).toMatch(/seeded key/)
  expect(w.doctorChecks).toContain("pins-integrity")
  expect(w.doctorChecks).toContain("key-shape")
})

test("the D22 audit schema demands the full subsystem list + the door inventory (an audit schema without doors is refused)", () => {
  expect(pins.d22Schema.subsystems.length).toBeGreaterThanOrEqual(25)
  expect(pins.d22Schema.doorInventory).toMatch(/HARDEN-FOR-ALPHA or CONSCIOUSLY-GATED/)
  expect(pins.d22Schema.discrepancyList).toMatch(/the tree wins/)
  expect(pins.d22Schema.perFinding).toContain("disposition (BLOCKER|HARDEN|DEFER)")
})

test("LN1–LN5 are pinned; S48–S51 join the catalog; the descriptor schema carries the privacy flag", () => {
  for (const k of ["LN1", "LN2", "LN3", "LN4", "LN5"]) expect(pins.lnResolutions[k]).toBeTruthy()
  for (const k of ["S48", "S49", "S50", "S51"]) expect(pins.stressCatalog[k]).toBeTruthy()
  expect(pins.descriptorSchema.fields.privacy).toMatch(/trainsOnPrompts/)
  expect(pins.descriptorSchema.law).toMatch(/never provider names/)
  expect(pins.massPathDeps).toEqual(["hono", "zod"])
})
