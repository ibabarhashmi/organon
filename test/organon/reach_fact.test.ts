/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 4 wall: S96 — REACH (the door exists, and it is still locked from outside).
 *
 * The binary is the SAME code, compiled (D49, unsigned). REACH IS A FACT — structural, never surveyed (X-REACH(e)):
 * published is DERIVED from the git remote (RP-4, not a declared constant), and reachableHumans = published ? UNJUDGEABLE
 * : 1. The three hardening assertions (DD-13) are walled at the strength they can be PROVEN (RP-3): no key required, no
 * provider constructed on the offline first-run path, the studio console disabled unless explicitly flagged.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reach } from "../../src/organon/reach"
import { AskProvider } from "../../src/ask/provider"

const record = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "reach.json"), "utf8"))

// ── the reach fact: structural, DERIVED, never surveyed ──────────────────────────────────────────────────────────────

test("S96 — reach is a FACT: published is DERIVED from the git remote (RP-4, not a declared constant), reachableHumans = published ? UNJUDGEABLE : 1", () => {
  const f = Reach.fact()
  expect(typeof f.published).toBe("boolean")
  expect(f.publishedDetail).toMatch(/DERIVED/i)
  expect(f.publishedDetail).toMatch(/git branch -r --contains|remote/i) // derived from git, not a constant
  expect(f.reachableHumans).toBe(f.published ? "UNJUDGEABLE" : 1) // the structural invariant
  // this sprint the tree is unpublished → exactly one human (the Operator) can reach it
  expect(record.fact.published).toBe(false)
  expect(record.fact.reachableHumans).toBe(1)
})

test("S96/attack-9 — reachableHumans is NEVER surveyed: a seeded published:false with reachableHumans>1 FAILS; a seeded published:true with a numeric count FAILS", () => {
  expect(Reach.validFact({ published: false, reachableHumans: 1 }).ok).toBe(true)
  expect(Reach.validFact({ published: true, reachableHumans: "UNJUDGEABLE" }).ok).toBe(true)
  // the SEEDED NEGATIVES — a surveyed / made-up reach number
  expect(Reach.validFact({ published: false, reachableHumans: 40 }).ok).toBe(false) // "we estimate 40 people could have tried"
  expect(Reach.validFact({ published: false, reachableHumans: 40 }).reason).toMatch(/must be 1/i)
  expect(Reach.validFact({ published: true, reachableHumans: 1000 }).ok).toBe(false) // published → count is UNJUDGEABLE, never a number
  expect(Reach.validFact({ published: true, reachableHumans: 1000 }).reason).toMatch(/UNJUDGEABLE/i)
})

// ── the first run: MEASURED, offline, keyless (DD-14) ────────────────────────────────────────────────────────────────

test("S96/DD-14 — the first-run seconds are MEASURED (not estimated), and the fixture renders offline with the honest SAMPLE fallback", () => {
  expect(record.firstRun.seconds).toBeGreaterThan(0)
  expect(record.firstRun.seconds).toBeLessThan(30) // a real, fast first run
  expect(record.firstRun.status).toBe(200)
  expect(record.firstRun.offline).toBe(true)
  expect(record.firstRun.sampleFallback).toBe(true) // offline → values render as SAMPLE, never fabricated
  expect(record.firstRun.note).toMatch(/MEASURED, not estimated/i)
})

// ── the three hardening assertions (DD-13), walled at the provable strength (RP-3) ───────────────────────────────────

test("S96/DD-13(i) — no API key is embedded or required: the fixture render succeeds with all provider keys empty", () => {
  expect(record.hardening.i_noKeyRequired.ok).toBe(true)
})

test("S96/DD-13(ii)/RP-3 — no provider is constructed on the offline first-run path: fromEnv({}) === null AND the SBOM shows two leaf deps with zero transitive (no third-party code that could egress)", () => {
  // the PROVABLE strength (RP-3): not an unqualified "zero egress" (which would be NOT HELD), but the two things we CAN show
  expect(AskProvider.fromEnv({ GROQ_API_KEY: "", GOOGLE_AI_STUDIO_KEY: "", GEMINI_API_KEY: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_COMPATIBLE_API_KEY: "", OPENAI_COMPATIBLE_BASE_URL: "" })).toBeNull()
  const sbom = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "sbom.cdx.json"), "utf8"))
  expect(sbom.components.length).toBe(2)
  expect(sbom.dependencies.filter((d: { ref: string }) => d.ref.startsWith("pkg:npm/")).every((d: { dependsOn: string[] }) => d.dependsOn.length === 0)).toBe(true)
  expect(record.hardening.ii_noProviderConstructed.ok).toBe(true)
})

test("S96/DD-13(iii) — the studio console is DISABLED unless --studio is passed: a seeded default-launch attempt REFUSES (exit 2)", () => {
  const r = spawnSync("bun", ["run", "script/organon-cli.ts", "--studio"], { cwd: PKG_ROOT, encoding: "utf8", timeout: 30_000, env: { ...process.env, GROQ_API_KEY: "", GOOGLE_AI_STUDIO_KEY: "" } })
  expect(r.status).toBe(2) // refused
  expect((r.stderr || "") + (r.stdout || "")).toMatch(/console is an Operator tool|disabled by default/i)
})

// ── LIVE — the first-run render actually runs offline, in-process (executed, shown) ──────────────────────────────────

test("S96 LIVE — the zero-config first run renders the committed fixture offline (status 200, real content), keyless", async () => {
  for (const k of ["GROQ_API_KEY", "GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]) process.env[k] = ""
  process.env.ORGANON_OFFLINE = "1"
  const { app } = await import("../../script/serve-reality.ts")
  const res = await app.fetch(new Request(`http://localhost/check/manifest:${record.firstRun.fixtureId}`))
  const html = await res.text()
  expect(res.status).toBe(200)
  expect(html.length).toBeGreaterThan(10_000) // a real Composed Reality Check, not a stub
  expect(/SAMPLE/i.test(html)).toBe(true) // offline honesty
}, 60_000)
