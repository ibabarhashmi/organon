/**
 * ORGΛNON — THE INTERPRETER SPRINT, Phase 3 wall (REGISTERS-REAL; X-INTERPRET b, S42). The register split was a persona
 * HOPE; this proves it is now a deterministic WALL. Positive-controlled: a Simple answer that reads Pro (jargon / a raw
 * decimal), a Pro answer with no metric-literacy (no axis / too short), a Pro answer that omits a proxy-surface caveat /
 * divergence the fact set demands, and two IDENTICAL registers each FAIL; a correctly-registered pair PASSES. The gate is
 * wired into VoiceContract.compose (a mis-registered AI REASONING block rejects to the deterministic template), and the
 * no-key deterministic templates satisfy the register distinction (Simple ≠ Pro). The RUBRIC is the pinned single source.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { VoiceContract } from "../../src/ask/contract"
import { AskRegister } from "../../src/ask/register"

const now = Date.parse("2026-07-08T00:00:00Z")
const iv = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "interpret-pins.json"), "utf8"))

// canonical register exemplars (the persona's own — same facts, same verdict, different register, real meaning)
const SIMPLE = "The yield here is mostly real lending, not temporary rewards — that's the good news. The catch is smart-contract exposure: an upgradeable design lets an admin key change the rules."
const PRO = "Durable base dominates the yield (low emission dependence), so it is structurally durable; the counterparty axis is FLAGGED at the deployed-proxy surface — a structural screen over verified source, not an audit. Provenance REAL, as-of the last capture."

test("S42 — the RUBRIC is the pinned single source of truth (=== interpret-pins.register; a drift is caught)", () => {
  const r = iv.register
  expect([...AskRegister.RUBRIC.jargonList]).toEqual(r.jargonList)
  expect([...AskRegister.RUBRIC.axisTerms]).toEqual(r.axisTerms)
  expect([...AskRegister.RUBRIC.provenanceTerms]).toEqual(r.provenanceTerms)
  expect(AskRegister.RUBRIC.simpleMaxChars).toBe(r.simpleBand.maxChars)
  expect(AskRegister.RUBRIC.proMinChars).toBe(r.proBand.minChars)
})

test("S42 — a correctly-registered pair PASSES: Simple is plain + short, Pro names the axis + is dense; the two differ", () => {
  expect(AskRegister.conforms(SIMPLE, "simple").ok).toBe(true)
  expect(AskRegister.conforms(PRO, "pro").ok).toBe(true)
  expect(AskRegister.differ(SIMPLE, PRO).ok).toBe(true)
})

test("S42 (positive control) — a Simple answer that reads PRO (carries jargon) is REJECTED", () => {
  const proJargonInSimple = "The apyBase share is high and the deflated-Sharpe / ICIR look consistent, so the proxy-surface risk is contained."
  const v = AskRegister.conforms(proJargonInSimple, "simple")
  expect(v.ok).toBe(false)
  expect(v.reasons.join(" ")).toMatch(/jargon/i)
})

test("S42 (positive control) — a Simple answer carrying a RAW DECIMAL is REJECTED (the plain register names the catch in words)", () => {
  const v = AskRegister.conforms("The yield is about 5.2 percent and mostly durable.", "simple")
  expect(v.ok).toBe(false)
  expect(v.reasons.join(" ")).toMatch(/raw decimal/i)
})

test("S42 (positive control) — a Simple answer PADDED past the band is REJECTED (a short true answer beats a padded fake-Pro one)", () => {
  const padded = "The yield looks solid and durable and steady ".repeat(12) // > 360 chars, no jargon — pure padding
  const v = AskRegister.conforms(padded, "simple")
  expect(v.ok).toBe(false)
  expect(v.reasons.join(" ")).toMatch(/band|say less/i)
})

test("S42 (positive control) — a Pro answer with NO metric-literacy (no axis) or too short is REJECTED", () => {
  expect(AskRegister.conforms("It looks fine overall and reads reassuringly on the whole, a decent place to sit for now honestly.", "pro").ok).toBe(false) // long enough but names no axis
  expect(AskRegister.conforms("Durable base.", "pro").ok).toBe(false) // names an axis but far too short for Pro
})

test("S42 (positive control) — a Pro answer that OMITS a proxy-surface caveat / a divergence the fact set demands is REJECTED (ctx-gated)", () => {
  const noCaveat = "Durable base dominates the yield with low emission dependence, so it reads as structurally durable across the observed window."
  expect(AskRegister.conforms(noCaveat, "pro", { proxyCaveat: true }).ok).toBe(false) // the fact set has a proxy tier; the Pro answer must name the screen caveat
  expect(AskRegister.conforms(noCaveat, "pro", { divergence: true }).ok).toBe(false) // a surfaced divergence must be named
  expect(AskRegister.conforms(noCaveat, "pro", { requireProvenance: true }).ok).toBe(false) // provenance-citation, ctx-gated
  // the SAME text WITH the caveat + provenance passes those ctx bars
  expect(AskRegister.conforms(PRO, "pro", { proxyCaveat: true, requireProvenance: true }).ok).toBe(true)
})

test("S42 (positive control) — two IDENTICAL registers FAIL differ() (the split is faked)", () => {
  expect(AskRegister.differ(SIMPLE, SIMPLE).ok).toBe(false)
  expect(AskRegister.differ(SIMPLE, SIMPLE).reasons.join(" ")).toMatch(/identical|faked/i)
})

test("S42 (the WIRING) — a mis-registered AI REASONING block rejects to the deterministic template; a correctly-registered one is used", async () => {
  const aPro = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now })
  // a Simple-shaped one-liner offered for a PRO answer → rejected (no axis / too short) → the deterministic block stands
  const bad = VoiceContract.compose(aPro, "Looks fine to me.")
  expect(bad.aiUsed).toBe(false)
  expect(bad.rejected).toBe(true)
  expect(VoiceContract.renderText(bad.blocks)).toBe(aPro.text)
  // a correctly-registered Pro interpretation (names axis + carries the screen caveat the FLAGGED fact demands) → used
  const good = VoiceContract.compose(aPro, PRO)
  expect(good.aiUsed).toBe(true)
  expect(good.blocks.some((b) => b.tier === "REASONING")).toBe(true)
})

test("S42 — the no-key deterministic templates DIFFER by register (clone-robust: Pro carries the metric-literate lineage Simple omits; Simple stays jargon-free)", async () => {
  const q = "is aave-v3 USDC safe?"
  const s = await Ask.answer(q, { register: "simple", now })
  const p = await Ask.answer(q, { register: "pro", now })
  // the register DISTINCTION is the clone-invariant (on a fresh clone the pool is SAMPLE/UNVERIFIED, so the verdict/axis/
  // length depend on the environment — the full band-conformance is proven on the exemplars above; here we assert only
  // what holds on BOTH dev and a fresh clone). The deterministic templates are FACT/BOUNDARY blocks (not gated by the
  // register wall, which runs on AI REASONING) — so an honest UNVERIFIED template may be long; that is not a violation.
  expect(s.text).not.toBe(p.text) // the two registers render differently
  expect(p.text).toMatch(/\[intent/) // Pro carries the metric-literate lineage (the classified intent + engine tool + provenance)
  expect(s.text).not.toMatch(/\[intent/) // Simple omits the lineage — the plain register
  // Simple stays JARGON-FREE regardless of the verdict (a length-independent plainness invariant that holds on a clone too)
  const jargonInSimple = AskRegister.RUBRIC.jargonList.some((t) => s.text.toLowerCase().includes(t.toLowerCase()))
  expect(jargonInSimple).toBe(false)
})
