/**
 * ORGΛNON — Explanation Phase 4 walls (ONE-COMMAND-TRUE, X-RUN). The runner's gate logic: the prerequisite enumeration
 * (checked, never installed), the pinned verify set (named in one place, printed), and the LAUNCH-WEB gate — enabled ONLY
 * when every prerequisite is present AND every pinned verify item passes; unmet → DISABLED with each unmet requirement
 * rendered beside it (never a dead button, never a soft-launch over red — the gate is DERIVED from the results, not a flag).
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { REPO_ROOT } from "../../src/organon/frozen"
import { Launcher } from "../../src/studio/launcher"

const allPresent = (_: string) => true
const okVerify: Launcher.VerifyResult[] = Launcher.PINNED_VERIFY_SET.map((v) => ({ id: v.id, label: v.label, pass: true, detail: "green" }))

test("the prerequisite enumeration checks bun · python3 · git (required) + python3.11 (conditional)", () => {
  const r = Launcher.checkPrerequisites(allPresent)
  expect(r.ok).toBe(true)
  expect(r.results.map((x) => x.name)).toEqual(["bun", "python3", "git", "python3.11"])
  expect(r.results.find((x) => x.name === "python3.11")!.kind).toBe("conditional")
})

test("a MISSING required prerequisite is reported honestly (and never installed)", () => {
  const r = Launcher.checkPrerequisites((n) => n !== "python3")
  expect(r.ok).toBe(false)
  expect(r.missingRequired).toEqual(["python3"])
  // a missing CONDITIONAL item does not fail the check (only needed for a parked unblock)
  const c = Launcher.checkPrerequisites((n) => n !== "python3.11")
  expect(c.ok).toBe(true)
})

test("the LAUNCH-WEB gate is ENABLED only when every prerequisite is present AND every verify item passes", () => {
  const prereq = Launcher.checkPrerequisites(allPresent)
  expect(Launcher.launchGate(prereq, okVerify).enabled).toBe(true)
})

test("POSITIVE CONTROL: a red verify item DISABLES launch with the item named beside it (no launch over red)", () => {
  const prereq = Launcher.checkPrerequisites(allPresent)
  const red = okVerify.map((v, i) => (i === 0 ? { ...v, pass: false, detail: "a deliberately red wall" } : v))
  const gate = Launcher.launchGate(prereq, red)
  expect(gate.enabled).toBe(false)
  expect(gate.unmet.some((u) => u.startsWith("verify FAILED"))).toBe(true)
})

test("POSITIVE CONTROL: a missing prerequisite DISABLES launch with the prerequisite named", () => {
  const prereq = Launcher.checkPrerequisites((n) => n !== "bun")
  const gate = Launcher.launchGate(prereq, [])
  expect(gate.enabled).toBe(false)
  expect(gate.unmet.some((u) => u.includes("prerequisite MISSING: bun"))).toBe(true)
})

test("the status table renders ENABLED / DISABLED-with-reasons / not-evaluated honestly", () => {
  const prereq = Launcher.checkPrerequisites(allPresent)
  expect(Launcher.statusTable(prereq, okVerify, Launcher.launchGate(prereq, okVerify))).toContain("LAUNCH WEB: ENABLED")
  const red = okVerify.map((v, i) => (i === 0 ? { ...v, pass: false, detail: "red" } : v))
  expect(Launcher.statusTable(prereq, red, Launcher.launchGate(prereq, red))).toContain("LAUNCH WEB: DISABLED")
  expect(Launcher.statusTable(prereq, [], null)).toContain("not yet evaluated") // a prereq-only check never claims a gate
})

test("the pinned verify set is named in one place (a quiet narrowing is visible)", () => {
  expect(Launcher.PINNED_VERIFY_SET.length).toBeGreaterThanOrEqual(3)
  expect(Launcher.PINNED_VERIFY_SET.map((v) => v.id)).toContain("walls")
  expect(Launcher.PINNED_VERIFY_SET.map((v) => v.id)).toContain("why-panel")
})

test("no soft-launch path exists: the gate takes no override — enabling requires real green results", () => {
  // launchGate's ONLY inputs are the prereq results + the verify results; there is no flag/env parameter to force enable
  expect(Launcher.launchGate.length).toBe(2) // (prereq, verify) — nothing else
})

test("./organon.sh exists, is executable, and is a POSIX shell script at repo root (X-RUN)", () => {
  const p = path.join(REPO_ROOT, "organon.sh")
  expect(existsSync(p)).toBe(true)
  const mode = statSync(p).mode
  expect(mode & 0o111).toBeGreaterThan(0) // executable bit set
  const body = readFileSync(p, "utf8")
  expect(body.startsWith("#!/usr/bin/env bash")).toBe(true)
  expect(body).toContain("NEVER installs system packages")
  expect(body).toContain("requirements-gated") // the launch gate is documented
})

test("the committed runner transcripts record the three honest states (happy · missing-prereq · gate-unmet)", () => {
  const f = path.join(REPO_ROOT, "data", "studio", "phase4-one-command-true-v14.json")
  if (!existsSync(f)) { console.log("  (runner) run script/phase4-runner.ts"); return }
  const a = JSON.parse(readFileSync(f, "utf8"))
  expect(a.transcripts.happy.launchEnabled).toBe(true)
  expect(a.transcripts.missingPrereq.launchEnabled).toBe(false)
  expect(a.transcripts.missingPrereq.exitNonzero).toBe(true)
  expect(a.transcripts.gateUnmet.launchEnabled).toBe(false)
  expect(a.transcripts.gateUnmet.unmet.length).toBeGreaterThan(0)
})
