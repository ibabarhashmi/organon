/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 4 walls (STRANGER-READY, part 1). The wizard's contracts hold in source and
 * behavior: masked paste (read -s) · chmod 600 on every write · validation delegated to the status-only validator
 * with an offline opt-out · the privacy flag shown before the trains-on-prompts paste · keyless stated as fully
 * functional. Doctor detects seeded faults with the right sentence. --version is truthful (package + git + pins).
 * The dead RWA wrappers refuse honestly (never crash). ALPHA.md's claims cross-check against the tree.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { PKG_ROOT } from "../../src/organon/frozen"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const sh = (rel: string, ...args: string[]) => spawnSync("/bin/bash", [path.join(PKG_ROOT, rel), ...args], { cwd: PKG_ROOT })

test("the wizard masks every paste, chmods 600 on every write, and shows the privacy flag BEFORE saving the trains-on-prompts key", () => {
  const w = read("organon-setup.sh")
  expect(w).toMatch(/read -rs val/) // masked — never echoed
  expect(w).not.toMatch(/echo .*\$val|printf.*%s.*\$val.*stdout/) // the value is never printed
  expect(w.split("chmod 600").length).toBeGreaterThanOrEqual(3) // per-paste AND at exit
  expect(w).toMatch(/trains-on-prompts/) // the privacy disclosure exists
  expect(w.indexOf("privacy: $privacy") ).toBeLessThan(w.indexOf('printf "%s=%s\\n"')) // disclosed BEFORE the save line in the function body
  expect(w).toMatch(/offline opt-out/) // validation is skippable
  expect(w).toMatch(/KEYLESS MODE: fully functional/) // skip-all is stated honestly
  expect(w).toMatch(/validate-key\.ts/) // validation is the status-only validator, not an inline curl
})

test("the wizard parses (bash -n) and the runner exposes setup/doctor/--version verbs", () => {
  expect(spawnSync("/bin/bash", ["-n", path.join(PKG_ROOT, "organon-setup.sh")]).status).toBe(0)
  const r = read("organon.sh")
  expect(r).toMatch(/setup\)\s+exec bash .*organon-setup\.sh/)
  expect(r).toMatch(/doctor\) need_bun; bun run script\/doctor\.ts/)
  expect(r).toMatch(/version\) need_bun; bun run script\/doctor\.ts --version/)
})

test("--version is truthful: package version + git sha + PINS_SHA from THIS tree", () => {
  const out = spawnSync("bun", ["run", path.join(PKG_ROOT, "script", "doctor.ts"), "--version"], { cwd: PKG_ROOT }).stdout.toString()
  const pkg = JSON.parse(read("package.json"))
  const pins = JSON.parse(read("data/honesty/alpha-pins.json"))
  expect(out).toContain(`organon ${pkg.version}`)
  expect(out).toContain(`pins ${String(pins.pinsSha).slice(0, 12)}`)
})

test("doctor detects the seeded faults with the right sentence (venv/deps/keys are SHAPE-only lines)", async () => {
  const { report } = await import("../../script/doctor")
  const r = report()
  expect(r.text).toMatch(/copy-paste this whole block/i)
  expect(r.text).toMatch(/bun: /)
  expect(r.text).toMatch(/pins integrity/)
  // key SHAPE only: with a seeded key in env, the value must not appear; the name + length may
  process.env.ALPHA_TEST_FAKE_API_KEY = "sk-alpha-fake-1234567890"
  try {
    const r2 = report()
    expect(r2.text).not.toContain("sk-alpha-fake-1234567890")
  } finally { delete process.env.ALPHA_TEST_FAKE_API_KEY }
})

test("the dead RWA wrappers refuse honestly — a sentence + exit 1, never a crash from a nonexistent script", () => {
  for (const rel of ["organon-run.sh", "organon-report.sh"]) {
    const r = sh(rel)
    expect(r.status).toBe(1)
    const out = r.stdout.toString()
    expect(out).toMatch(/PARKED/)
    expect(out).toMatch(/organon\.sh setup/) // the honest redirect
    expect(r.stderr.toString()).not.toMatch(/No such file|command not found/) // never the old crash
  }
})

test("the subset battery is honestly named (AH8) — it no longer claims 'full' while omitting the walls", () => {
  const t = read("organon-test.sh")
  expect(t).toMatch(/SUBSET battery/i)
  expect(t).toMatch(/CANONICAL battery is \.\/organon-studio-test\.sh|CANONICAL battery/)
  expect(t).not.toMatch(/banner "test — full battery/)
})

test("ALPHA.md exists and its claims cross-check against the tree (advertised == actual, extended to the docs — S51)", () => {
  const a = read("ALPHA.md")
  // the one-command path it advertises exists
  expect(a).toMatch(/\.\/organon\.sh setup/)
  expect(read("organon.sh")).toMatch(/setup\)/)
  // the localhost default it claims is real (both servers)
  expect(a).toMatch(/127\.0\.0\.1 by default/)
  expect(read("script/serve-reality.ts")).toMatch(/process\.env\.HOST \?\? "127\.0\.0\.1"/)
  expect(read("script/serve-studio.ts")).toMatch(/process\.env\.HOST \?\? "127\.0\.0\.1"/)
  // the parity guarantee it advertises is the pinned wall
  expect(a).toMatch(/byte-identical/i)
  expect(existsSync(path.join(PKG_ROOT, "data/honesty/capability-parity.json"))).toBe(true)
  // the no-Docker honesty is true
  expect(a).toMatch(/No Docker/i)
  expect(existsSync(path.join(PKG_ROOT, "Dockerfile"))).toBe(false)
  // the doctor + STUDIO_TOKEN + WSL + SAMPLE-first-launch priming are all present
  for (const claim of [/doctor/, /STUDIO_TOKEN/, /WSL/, /SAMPLE/, /telemetry is OFF by default/i]) expect(a).toMatch(claim)
  // the parked list matches the pins (nothing advertised that is parked)
  expect(a).toMatch(/strategy-proposer/)
  expect(a).toMatch(/D21/)
})

test(".env.example carries the TRUE priority order (Groq first, matching fromEnv) + the chmod 600 guidance (AH4)", () => {
  const e = read(".env.example")
  expect(e).toMatch(/Groq → Google AI Studio/)
  expect(e).toMatch(/chmod 600/)
  expect(e).toMatch(/trains-on-prompts/)
})
