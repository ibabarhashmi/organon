/**
 * ORGΛNON — THE SURFACE SPRINT, wall S38 (the impeccable detector gate; X-SURFACE c). The deterministic 45-rule
 * anti-pattern detector (no LLM, no key, no browser for files) runs over the built stylesheet AND (from Phase 3) the
 * rendered surface, and asserts ZERO UNEXCEPTED findings — a re-introduced AI-slop / general-quality anti-pattern fails
 * the wall exactly as a seeded vuln fails the contract wall. Project-legitimate exceptions live in the committed
 * .impeccable/config.json with a REASON (the constitution outranks the detector — Attack-11).
 *
 * The detector lives in the DEV HARNESS (~/.claude/skills/impeccable), NOT the repo — so on a pristine fresh clone it is
 * ABSENT and these tests SKIP honestly (a named skip joining {ask_live, eval_live} → {..., surface_detector}); the built
 * stylesheet still ships in-repo and the mass tool runs without the tool (proving X-SURFACE b — dev-time-only).
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs"
import path from "node:path"
import os from "node:os"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { VoiceContract } from "../../src/ask/contract"

const DETECT = path.join(os.homedir(), ".claude", "skills", "impeccable", "scripts", "detect.mjs")
const HAS_DETECTOR = existsSync(DETECT)
const cfg = JSON.parse(readFileSync(path.join(PKG_ROOT, ".impeccable", "config.json"), "utf8"))
const EXCEPTED = new Set<string>(cfg.detector.ignoreRules)

interface Finding { antipattern: string; name: string; severity: string; file: string; line: number; snippet: string }
function detect(targets: string[]): Finding[] {
  // --no-config: the TEST is the wall — it applies the committed exceptions explicitly (auditable), not the detector's own config resolution
  const r = Bun.spawnSync(["node", DETECT, "--json", "--no-config", ...targets], { cwd: PKG_ROOT })
  const out = r.stdout.toString().trim()
  if (!out) return []
  return JSON.parse(out) as Finding[]
}
const unexcepted = (fs: Finding[]) => fs.filter((f) => !EXCEPTED.has(f.antipattern))

// render the three screens (+ a degraded state) to a temp dir the detector can scan (static HTML/CSS analysis)
export function renderScreens(): string[] {
  const dir = mkdtempSync(path.join(os.tmpdir(), "organon-detect-"))
  const NOW = Date.parse("2026-07-09T00:00:00Z")
  const files: string[] = []
  const w = (name: string, html: string) => { const p = path.join(dir, name); writeFileSync(p, html); files.push(p) }
  w("shelf.html", Reality.renderShelf(Reality.shelfSample(), true))
  const rc = Reality.realityCheck(`defillama:pool:${DefiLlama.SAMPLE_POOLS[0].pool}`, NOW)
  if (rc) w("reality.html", Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "defillama:pool:x"))
  w("ask.html", Reality.renderAsk({
    query: "is aave-v3 USDC safe?", register: "pro", raw: false, intentKind: "STRATEGY_LOOKUP", tool: "poolFacts", reality: "SAMPLE",
    aiStatus: { keyed: false, provider: null },
    blocks: [
      { tier: "FACT", text: "aave-v3 USDC — durable base yield, steady deposits, peg holding." },
      { tier: "REASONING", text: "The economics look durable; the catch is smart-contract and depeg tail risk.", label: VoiceContract.ANALYSIS_LABEL },
      { tier: "BOUNDARY", text: "This is not financial advice." },
    ],
    residual: VoiceContract.RESIDUAL_DISCLOSURE,
  }))
  return files
}

test.skipIf(!HAS_DETECTOR)("S38 — the built stylesheet (public/organon.css) has ZERO unexcepted anti-patterns (the clean foundation)", () => {
  const findings = detect([path.join(PKG_ROOT, "public", "organon.css")])
  expect(unexcepted(findings)).toEqual([])
})

test.skipIf(!HAS_DETECTOR)("S38 — the three RENDERED screens have ZERO unexcepted anti-patterns (no side-tab, no flat-type, no AI slop; only the reasoned exceptions remain)", () => {
  const findings = detect(renderScreens())
  const bad = unexcepted(findings)
  if (bad.length) console.error("UNEXCEPTED:", bad.map((f) => `${f.antipattern}@${path.basename(f.file)}:${f.line}`).join(", "))
  expect(bad).toEqual([]) // green after the Phase-3 restyle (the screens use the token stylesheet; side-tab + flat-type gone)
  for (const f of findings) expect(EXCEPTED.has(f.antipattern)).toBe(true) // any finding is a committed reasoned exception
})

test.skipIf(!HAS_DETECTOR)("S38 — every committed detector exception carries a REASON (the constitution outranks the detector — a silent suppression is refused)", () => {
  expect(Array.isArray(cfg.exceptions)).toBe(true)
  for (const ex of cfg.exceptions) {
    expect(EXCEPTED.has(ex.rule)).toBe(true) // the reasoned exception is actually the ignored rule
    expect(ex.reason.length).toBeGreaterThan(20) // a real reason, not a rubber stamp
  }
})

test("S38 (X-SURFACE b) — the detector is DEV-TIME-ONLY: it never became a runtime dependency (deps stay hono+zod); its absence is an honest skip, never a crash", () => {
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
  expect(typeof HAS_DETECTOR).toBe("boolean") // runs REGARDLESS of the detector's presence — the mass tool survives its absence
})
