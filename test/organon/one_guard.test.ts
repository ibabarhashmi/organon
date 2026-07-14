/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 1 wall S87 (ONE GUARD). The V33 audit found the advice guard BIFURCATED:
 * AdviceShape.detect (the SHAPE guard) reached the strategy surfaces (compile.guardLine · monitor.guardCycleLine ·
 * envelope.serialize) but the Ask OUTPUT path — the text phrased at runtime by a third-party LLM, whose most natural
 * failure mode IS hedged token-free advice — was left on VoiceGates.advicePattern, a SUBSTRING matcher. This wall proves
 * the convergence: ONE definition of advice (AdviceShape.detect) now reaches EVERY emitting surface INCLUDING Ask, composed
 * DOWNSTREAM of the five gates at the single call site (VoiceContract.compose) — zero frozen bytes moved (D46 unneeded).
 *
 * THE KEY PROOF (X-SHOWN — shown, not claimed): the token-free corpus PASSES the substring matcher cleanly and is CAUGHT
 * by the shape guard ON THE ASK PATH. The hole is closed where the LLM actually writes the words. A grep wall (mechanical,
 * R-4-style) asserts no emitting surface makes its advice decision on the substring matcher ALONE.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { VoiceContract } from "../../src/ask/contract"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice"
import { StrategyCompile } from "../../src/strategy/compile"
import { Monitor } from "../../src/strategy/monitor"

const now = Date.parse("2026-07-14T00:00:00Z")
const answer = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now })

// the enumerated advice corpus (RP-1 a-tightening) + the token-free set that walked through the substring wall for 34 sprints
const CORPUS = [...AdviceShape.ENUMERATED_ADVICE]
const TOKEN_FREE = ["size into it", "trim the position", "I'd rotate out of this", "you may want to wait", "consider taking some off"]
const LOOSENINGS = ["It judges what you're doing; it never tells you what to buy", "the buy button is on the exchange, not here"]

test("S87 — ONE definition catches the whole corpus on the ASK OUTPUT PATH (compose routes every advice line to the ADVICE boundary)", () => {
  for (const line of CORPUS) {
    const c = VoiceContract.compose(answer, line)
    expect({ line, adviceBoundary: c.adviceBoundary, aiUsed: c.aiUsed }).toEqual({ line, adviceBoundary: true, aiUsed: false })
    // the recommendation text never reaches the rendered answer — the engine-authored ADVICE boundary stands in its place
    expect(VoiceContract.renderText(c.blocks)).toContain(VoiceContract.ADVICE_BOUNDARY)
  }
})

test("S87 — THE HOLE, CLOSED WHERE THE LLM WRITES: the token-free set PASSES the substring matcher and is CAUGHT by the shape guard on the Ask path", () => {
  for (const line of TOKEN_FREE) {
    // the substring matcher (gates.ts, frozen) MISSES it — this is exactly the bifurcation the audit named
    expect({ line, substring: VoiceGates.advicePattern(line).advice }).toEqual({ line, substring: false })
    // the shape guard catches it …
    expect({ line, shape: AdviceShape.detect(line).advice }).toEqual({ line, shape: true })
    // … and on the composed Ask output path it now routes to the ADVICE boundary (the surface where the LLM phrases at runtime)
    expect({ line, boundary: VoiceContract.compose(answer, line).adviceBoundary }).toEqual({ line, boundary: true })
  }
})

test("S87 — the two enumerated loosenings (MR8) PASS the one guard (a converged guard did not over-tighten)", () => {
  for (const line of LOOSENINGS) expect({ line, advice: AdviceShape.detect(line).advice }).toEqual({ line, advice: false })
})

test("S87 — the one guard reaches every OTHER emitting surface (compile · monitor cycle line · envelope disclaimer) — the corpus refuses on each", () => {
  for (const line of [...CORPUS, ...TOKEN_FREE]) {
    expect({ surface: "compile.guardLine", line, ok: StrategyCompile.guardLine(line).ok }).toEqual({ surface: "compile.guardLine", line, ok: false })
    expect({ surface: "monitor.guardCycleLine", line, ok: Monitor.guardCycleLine(line).ok }).toEqual({ surface: "monitor.guardCycleLine", line, ok: false })
  }
})

test("S87 — THE GREP WALL: no emitting surface makes its advice decision on the substring matcher ALONE (each reaches AdviceShape.detect)", () => {
  const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
  // the Ask output path — compose runs BOTH the five gates AND the shape guard (the composition, shown in source)
  const contract = read("src/ask/contract.ts")
  expect(contract).toMatch(/VoiceGates\.runReasoningGates/)
  expect(contract).toMatch(/AdviceShape\.detect/) // the composed second refusal on the Ask path
  expect(contract).toMatch(/g\.advice \|\| shape\.advice/) // both, at the single call site
  // the strategy surfaces reach the one guard (compile + envelope directly; monitor via guardCycleLine → guardLine)
  expect(read("src/strategy/compile.ts")).toMatch(/AdviceShape\.detect/)
  expect(read("src/strategy/envelope.ts")).toMatch(/AdviceShape\.detect/)
  const monitor = read("src/strategy/monitor.ts")
  expect(monitor).toMatch(/StrategyCompile\.guardLine/) // guardCycleLine chains to the one guard
  // the honest record: the ONLY advice-decision use of VoiceGates.advicePattern that gates an EMITTED surface is now
  // ACCOMPANIED by AdviceShape.detect in the same file (contract.ts). gates.ts stays frozen; eval.ts is a measurement harness.
  expect(contract.indexOf("AdviceShape.detect")).toBeGreaterThan(-1)
})

test("S87 — the maintainability hazard retired: AdviceShape.detect is ONE function with ONE corpus (the enumerated corpus is the single reference)", () => {
  expect(AdviceShape.ENUMERATED_ADVICE.length).toBe(22)
  // every enumerated line is advice by the ONE definition; a single grammar, not two algorithms
  for (const line of AdviceShape.ENUMERATED_ADVICE) expect({ line, advice: AdviceShape.detect(line).advice }).toEqual({ line, advice: true })
})
