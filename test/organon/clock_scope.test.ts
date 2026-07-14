/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 2 wall (DD-3, S82c-EXTENDED). B-10: the Date.now() grep-wall covered only the
 * 5 Reckoning strategy modules (compile/exit/monitor/baseline/envelope) — narrower than "every judged path." This extends
 * it to EVERY judged path: all of src/strategy, all of src/domain, the scorecard, the Ask contract, the Stamp. A judged
 * path that reads the wall-clock produces a non-reproducible judgment (the determinism hazard the injected clock exists to
 * kill). The two exemptions are ENUMERATED WITH REASONS — the HTTP route boundary (seeds `now`) and the transport timer.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

// strip comments so a comment mentioning "Date.now()" (e.g. "a caller label, NOT Date.now()") is not a false positive
const stripComments = (s: string) => s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
const readCode = (rel: string) => stripComments(readFileSync(path.join(PKG_ROOT, rel), "utf8"))

// the JUDGED directories + files — every path that produces a verdict/judgment must be clock-free (the clock is injected)
const JUDGED_DIRS = ["src/strategy", "src/domain", "src/domain/axes"]
const JUDGED_FILES = ["src/analytics/scorecard.ts", "src/ask/contract.ts", "src/studio/stamp.ts"]

function judgedTsFiles(): string[] {
  const files: string[] = [...JUDGED_FILES]
  for (const dir of JUDGED_DIRS) {
    const abs = path.join(PKG_ROOT, dir)
    if (!existsSync(abs)) continue
    for (const f of readdirSync(abs)) if (f.endsWith(".ts")) files.push(path.join(dir, f))
  }
  return [...new Set(files)]
}

// the ENUMERATED EXEMPTIONS (DD-3) — a path that reads Date.now() legitimately, each with its reason. These are NOT judged
// code: the HTTP route is the injection boundary (it may read Date.now() to seed `now`); the transport timer paces requests.
const EXEMPTIONS: { file: string; reason: string }[] = [
  { file: "src/studio/routes.ts", reason: "the HTTP route boundary — reads Date.now() ONLY to SEED `now` (opts.now ?? Date.now()); it threads the clock INTO the judged code, it is not judged code itself (the clockInjection rule: the route is the boundary)" },
  { file: "src/ask/provider.ts", reason: "the provider transport's rate-limit timer (request pacing / backoff) — not a judged path; the phrasing it fetches is gated WHOLESALE downstream by the deterministic gates regardless of timing" },
]

test("DD-3 — EVERY judged path is clock-free: no Date.now() in src/strategy, src/domain, the scorecard, the Ask contract, or the Stamp", () => {
  const offenders: string[] = []
  for (const rel of judgedTsFiles()) if (/\bDate\.now\(\)/.test(readCode(rel))) offenders.push(rel)
  expect(offenders).toEqual([]) // a judged path reading the wall-clock is a non-reproducible-judgment Halt
})

test("DD-3 — the grep-wall now covers MORE than the Reckoning 5 (the audit's B-10 gap closed) — the judged set is enumerated + non-trivial", () => {
  const files = judgedTsFiles()
  // the Reckoning 5 are still covered …
  for (const f of ["src/strategy/compile.ts", "src/strategy/exit.ts", "src/strategy/monitor.ts", "src/strategy/baseline.ts", "src/strategy/envelope.ts"]) expect(files).toContain(f)
  // … AND the paths B-10 named (resolve, scorecard, stamp, domain, contract) are now covered
  for (const f of ["src/strategy/resolve.ts", "src/analytics/scorecard.ts", "src/studio/stamp.ts", "src/domain/classify.ts", "src/ask/contract.ts"]) expect(files).toContain(f)
  expect(files.length).toBeGreaterThanOrEqual(15) // a real sweep, not the 5-file list
})

test("DD-3 — the exemptions are ENUMERATED WITH REASONS, and each is a real file that IS the boundary (reads Date.now() in code)", () => {
  for (const { file, reason } of EXEMPTIONS) {
    expect(existsSync(path.join(PKG_ROOT, file))).toBe(true)
    expect(reason.length).toBeGreaterThan(40) // a real reason, not a shrug
    expect(readCode(file)).toMatch(/\bDate\.now\(\)/) // it genuinely reads the clock — that is WHY it is enumerated as the boundary
  }
  // and the exempt files are NOT in the judged set (the boundary is distinct from the judged code)
  const judged = new Set(judgedTsFiles())
  for (const { file } of EXEMPTIONS) expect(judged.has(file)).toBe(false)
})
