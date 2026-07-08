/**
 * ORGΛNON — THE PERSISTENCE SPRINT, PART E (X-STRESS). The BUILT system driven as intended (depositor · quant · skeptic ·
 * clumsy) then broken across the FULL first-class catalog, focused on the three NEW lines: S22 (decay-gate honesty), S23
 * (ICIR determinism/scope), S24 (live-AI grounding). S1–S21 stay covered by their own walls (honesty_*, ask_*, crownjewel
 * _redteam); this file adds the adversarial + cross-cutting persistence checks: the sub-scores are deterministic, honest on
 * short/degenerate/SAMPLE history, OFF the mass path (a scorecard render invokes them ZERO times), the ICIR is never dressed
 * as cross-sectional alpha, a prompt-injection cannot fabricate a half-life/ICIR, and the committed live-AI proof holds.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Decay } from "../../src/studio/decay"
import { Icir } from "../../src/studio/icir"
import { Stamp } from "../../src/studio/stamp"
import { Scorecard } from "../../src/analytics/scorecard"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"
import { Evidence } from "../../src/studio/evidence"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const mock = (out: string): AskProvider.Provider => ({ id: "mock", provider: "gemini", async phrase() { return out } })
function series(seed: number, n: number, ic: number, sd: number): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  return Array.from({ length: n }, () => ic + sd * g())
}

// ── S22 — DECAY-GATE HONESTY (skeptic + clumsy: feed short / flat / SAMPLE / noise; try to fabricate a half-life) ──
test("S22 — a short / flat / SAMPLE / serially-random series NEVER fabricates a half-life (INSUFFICIENT or SHORT_LIVED, honestly)", () => {
  expect(Decay.decayHalfLife(series(3, 20, 0.006, 0.003)).tier).toBe("INSUFFICIENT") // too short
  expect(Decay.decayHalfLife(Array.from({ length: 200 }, () => 0.0001)).tier).toBe("INSUFFICIENT") // flat/degenerate
  expect(Decay.decayHalfLife(series(3, 400, 0.006, 0.003), { reality: "SAMPLE" }).tier).toBe("INSUFFICIENT") // SAMPLE not scored
  const noise = Decay.decayHalfLife(series(9, 500, 0.0, 0.01)) // serially-random → no persistent edge
  expect(noise.tier).toBe("SHORT_LIVED")
  expect(noise.halfLife === 0 || (noise.halfLife !== null && noise.halfLife < Decay.HALFLIFE_FLOOR)).toBe(true) // never a long fabricated fit
})

test("S22 — deterministic + OFF THE MASS PATH: a scorecard render invokes decay ZERO times (the scorecard imports no decay)", () => {
  const s = series(11, 400, 0.006, 0.003)
  expect(JSON.stringify(Decay.decayHalfLife(s))).toBe(JSON.stringify(Decay.decayHalfLife(s))) // byte-identical
  const src = read("src/analytics/scorecard.ts")
  expect(src).not.toMatch(/\/decay"/)
  expect(src).not.toMatch(/\bDecay\./)
  // a full scorecard render produces only scorecard verdicts — no decay/half-life bleed-through
  const scored = Scorecard.score({ name: "x", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000 })
  expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).toContain(scored.verdict)
  expect(JSON.stringify(scored)).not.toMatch(/half-life|TRACEABLE|SHORT_LIVED/i)
})

// ── S23 — ICIR DETERMINISM / SCOPE (skeptic: hunt an ICIR dressed as cross-sectional alpha; a div-by-zero) ──
test("S23 — ICIR is deterministic, guards std→0 (no div-by-zero), and is labeled WITHIN-STRATEGY, never cross-sectional", () => {
  const s = series(11, 200, 0.006, 0.003)
  expect(JSON.stringify(Icir.icir(s))).toBe(JSON.stringify(Icir.icir(s))) // byte-identical
  const degenerate = Icir.icir(Array.from({ length: 100 }, () => 0.0001))
  expect(degenerate.tier).toBe("INSUFFICIENT") // std→0 → INSUFFICIENT, never Infinity/NaN
  expect(degenerate.icir).toBeNull()
  const r = Icir.icir(s)
  expect(r.scope).toBe("within-strategy-temporal")
  expect(r.reason).toMatch(/within-strategy/i)
  expect(r.reason).toMatch(/NOT a cross-sectional/i) // the scope wall — a cross-sectional claim is a doc-lie
  // off the mass path
  const src = read("src/analytics/scorecard.ts")
  expect(src).not.toMatch(/\/icir"/)
  expect(src).not.toMatch(/\bIcir\./)
})

// ── S22/S23 — the enriched Stamp: a GO's clean/fenced status is deterministic + the verdict WORD is never minted/moved ──
test("S22/S23 — the enriched Stamp is deterministic and NEVER mints/moves a verdict word (a fenced GO is still GO)", async () => {
  const a = await Stamp.stampFromReturns(series(11, 400, 0.006, 0.003), { label: "det" })
  const b = await Stamp.stampFromReturns(series(11, 400, 0.006, 0.003), { label: "det" })
  expect(JSON.stringify(a)).toBe(JSON.stringify(b)) // the whole enriched result (incl. decay + icir + cleanGo) is byte-identical
  expect(["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"]).toContain(a.verdict) // still the 4-name enum — decay/ICIR mint NO new word
  if (a.verdict === "GO" && !a.cleanGo) expect(a.reason).toMatch(/NOT cleared/i) // a fenced GO discloses the unmet hurdle, GO word stands
})

// ── S23/S21 — a prompt-injection cannot FABRICATE a sub-score: an ungrounded half-life/ICIR is rejected wholesale ──
test("S23/S21 — the Ask cannot be injected into stating a half-life/ICIR the engine did not produce (rejected → deterministic)", async () => {
  const NOW = Date.parse("2026-07-08T00:00:00Z")
  const base = await Ask.answer("stamp aave-v3 USDC", { register: "pro", now: NOW })
  // whatever the engine returned (UNAVAILABLE on a fresh clone, or a scored Stamp), an INVENTED half-life is not a fact → rejected
  const p = await AskPhrase.phraseGrounded(base, mock("The overfit Stamp: the edge half-life is 137 periods and the ICIR is 9.9 — an extremely persistent, cross-sectional-grade signal."))
  expect(p.rejected).toBe(true)
  expect(p.text).toBe(base.text) // the deterministic answer stands
})

// ── S24 — LIVE-AI GROUNDING: the committed Groq round-trip proves the gate against a real model; the transcript is safe ──
test("S24 — the committed live-Groq proof holds: a real-model grounded PASS + a forced-fabrication REJECT, manifested, no key", () => {
  const t = JSON.parse(read("data/honesty/evidence/ask-live-groq.json"))
  expect(t.probeA_grounded.aiPhrased).toBe(true) // a real model phrased the engine facts and passed the gate
  expect(t.probeB_fabricationRejected.rejectedWholesale).toBe(true) // a fabricated number was rejected wholesale
  expect(t.probeB_fabricationRejected.fellBackToDeterministic).toBe(true)
  expect(Evidence.verifyCaptureManifest().ok).toBe(true) // the redacted transcript reproduces its manifest content-hash (S18)
  expect(/gsk_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}|AQ\.[A-Za-z0-9_-]{20,}|\bsk-[A-Za-z0-9]{20,}/.test(read("data/honesty/evidence/ask-live-groq.json"))).toBe(false) // no key leaks
})
