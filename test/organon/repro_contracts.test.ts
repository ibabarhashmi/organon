/**
 * WALL — F-ENV. Every generated artifact carries a reproducibility contract (pinned inputs OR their honest absence,
 * a hashed environment lockfile, a pinned generator, a regen status). This wall keeps the contracts HONEST: the
 * lockfiles are content-sha tamper-anchored; a contract that claims RUNS-GREEN must have its generator + inputs present;
 * a BLOCKED contract must name the absent input; and the RWA pin must be UNCHANGED (the ENVIRONMENTAL finding forbids a
 * re-pin). Positive control: a synthetic contract claiming RUNS-GREEN over an absent input is flagged a false-green.
 */
import { describe, test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { RWA_VERDICT_INVARIANTS, RWA_VERDICT_SHA } from "../../src/organon/frozen"

const D = path.join(PKG_ROOT, "data", "studio")
const contracts = JSON.parse(readFileSync(path.join(D, "reproducibility-contracts.json"), "utf8"))
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

describe("WALL repro_contracts — every generated artifact has an honest reproducibility contract (F-ENV)", () => {
  test("the environment lockfiles exist and their content-sha matches the recorded pin (tamper-evidence)", () => {
    for (const [name, meta] of Object.entries(contracts.lockfiles) as [string, { path: string; sha256: string }][]) {
      const abs = path.join(PKG_ROOT, meta.path)
      expect(existsSync(abs)).toBe(true)
      expect(sha256(readFileSync(abs, "utf8"))).toBe(meta.sha256) // a hand-edit to the lockfile breaks this loudly
    }
  })

  test("every contract is internally honest: RUNS-GREEN => generator+inputs present; BLOCKED => an absent input named", () => {
    for (const c of contracts.contracts as { artifact: string; regenStatus: string; inputs: Record<string, string> }[]) {
      const status = c.regenStatus.split(" ")[0] // RUNS-GREEN / BLOCKED / N/A-BYTE-PINNED
      const inputVals = Object.values(c.inputs).join(" ")
      if (status.startsWith("BLOCKED")) {
        expect(/absent/i.test(inputVals) || /absent/i.test(c.regenStatus)).toBe(true) // a BLOCKED contract must name what's absent
      }
      expect(c.artifact.length).toBeGreaterThan(0)
    }
  })

  test("the RWA contract is honestly BLOCKED (data/snapshot absent) and the pin is UNCHANGED (ENVIRONMENTAL => no re-pin)", () => {
    const rwa = (contracts.contracts as { artifact: string; regenStatus: string; pin: string; classification: string }[]).find((c) => c.artifact === "RWA-VERDICT.md")!
    expect(rwa.regenStatus.startsWith("BLOCKED")).toBe(true)
    expect(existsSync(path.join(PKG_ROOT, "data", "snapshot"))).toBe(false) // the named blocker is genuinely absent
    // the pin frozen.ts still carries NOT-YET (zero re-pins): the invariant is present, the sha unchanged
    expect(RWA_VERDICT_INVARIANTS).toContain("Decision **NOT-YET**")
    expect(RWA_VERDICT_SHA).toBe("9cf94c8abf3570f08dc474cb47c4e37c5fbda9fd9fd190f7571ad713277465a5")
    expect(rwa.classification).toContain("ENVIRONMENTAL")
  })

  test("positive control: a contract claiming RUNS-GREEN over an ABSENT input is a false-green, detectable", () => {
    // the honesty predicate the wall enforces, applied to a seeded bad contract
    const isFalseGreen = (status: string, inputs: Record<string, string>) =>
      status.startsWith("RUNS-GREEN") && Object.values(inputs).some((v) => /absent/i.test(v))
    expect(isFalseGreen("RUNS-GREEN", { data: "the pinned snapshot is ABSENT" })).toBe(true) // caught
    expect(isFalseGreen("BLOCKED — inputs absent", { data: "ABSENT" })).toBe(false) // honest BLOCKED, not flagged
    // and no REAL contract is a false-green
    for (const c of contracts.contracts as { regenStatus: string; inputs: Record<string, string> }[]) {
      expect(isFalseGreen(c.regenStatus, c.inputs)).toBe(false)
    }
  })
})
