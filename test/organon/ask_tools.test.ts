/**
 * ORGΛNON — THE CROWN-JEWEL SPRINT, Phase 6 walls (ASK-ROUTED; Rule X-ASK b, X-DETERM). The engine tools return the SAME
 * REAL/SAMPLE-labeled fact rows the Reality Check renders (a scorecard-via-Ask ≡ a scorecard-via-screen, byte-identical);
 * they are READ-ONLY (Ask touches no engine state — the verdict differential is zero); an UNVERIFIED / not-found field is
 * NEVER filled; the deterministic templated answer is register-aware (Simple carries no raw decimals, Pro echoes the
 * intent + tool + facts); the raw toggle is byte-reproducible. NO AI anywhere in this path.
 */
import { test, expect } from "bun:test"
import { Ask } from "../../src/ask/answer"
import { AskRouter } from "../../src/ask/router"
import { AskTools } from "../../src/ask/tools"
import { Reality } from "../../src/studio/reality"
import { VerdictDifferential } from "../../src/studio/differential"

const NOW = Date.parse("2026-07-08T00:00:00Z")
const AAVE_USDC = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501"

test("X-ASK b — a scorecard-via-Ask ≡ a scorecard-via-screen (BYTE-IDENTICAL fact rows — the engine is the single source)", () => {
  const viaScreen = Reality.realityCheck(AAVE_USDC, NOW)
  if (!viaScreen) { console.log("  (ask_tools) aave USDC not in the record — skipped (clone)"); return }
  const viaAsk = AskTools.scorecardFor(AAVE_USDC, "aave usdc", NOW)
  expect(viaAsk.ok).toBe(true)
  // the SCORECARD-AXIS fact rows are BYTE-IDENTICAL whether via Ask or screen (the engine is the single source); the Ask
  // then APPENDS the deep-counterparty contract-screen grounding rows (Contract-Truth Phase 4 — like stampFor's depth rows).
  const n = viaScreen.scored.factRows.length
  expect(JSON.stringify(viaAsk.facts.slice(0, n))).toBe(JSON.stringify(viaScreen.scored.factRows)) // the axis rows, byte-identical
  const appended = viaAsk.facts.slice(n)
  expect(appended[0].id).toBe("contract-screen") // the contract detail is appended as grounded facts
  expect(appended[0].value).toBe(viaScreen.scored.contract.tier) // grounded in the engine's own contract tier
  expect(viaAsk.reality).toBe(viaScreen.scored.facts.reality) // the SAME REAL/SAMPLE label
  expect(viaAsk.meta.verdict).toBe(viaScreen.scored.verdict)
})

test("X-ASK e — a not-found strategy → an honest 'not found', NEVER a fabricated pool", () => {
  const r = AskTools.scorecardFor(undefined, "frobnicator 9000", NOW)
  expect(r.ok).toBe(false)
  expect(r.facts).toEqual([]) // no facts invented
  expect(r.summary).toMatch(/don'?t have|not.*record|won'?t guess/i)
})

test("X-ASK e — a DATA_QUERY for an UNVERIFIED field renders UNVERIFIED, never filled", () => {
  // a SAMPLE pool → its metric is UNVERIFIED (never a fabricated number)
  const sampleKey = `defillama:pool:${Reality.shelfSample()[0].poolKey.replace("defillama:pool:", "")}`
  const r = AskTools.metric(sampleKey, "tvl-trend", "sample", NOW)
  if (r.ok) { // if resolvable, the SAMPLE drives UNVERIFIED / n/a — never a confident number
    const row = r.facts[0]
    expect(["n/a", "info"]).toContain(row.outcome) // an unverifiable metric is not a pass/fail
  } else {
    expect(r.facts).toEqual([])
  }
})

test("X-DETERM — the tools are READ-ONLY: the verdict differential is UNCHANGED after Ask runs (Ask moves no engine state)", async () => {
  const before = await VerdictDifferential.fingerprintSetSha()
  await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now: NOW })
  await Ask.answer("stamp aave-v3 USDC", { register: "pro", now: NOW })
  await Ask.answer("aave USDC vs compound USDC", { now: NOW })
  const after = await VerdictDifferential.fingerprintSetSha()
  expect(after).toBe(before)
  expect(after).toBe("70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54") // the cross-sprint golden
})

test("X-ASK f — SIMPLE carries no raw decimals; PRO echoes the classified intent + tool + facts", async () => {
  for (const q of ["is aave-v3 USDC safe?", "what is the peg of aave USDC", "stamp aave-v3 USDC", "aave USDC vs compound USDC", "what can you check?"]) {
    const simple = await Ask.answer(q, { register: "simple", now: NOW })
    expect(/\d+\.\d+/.test(simple.text), `Simple answer for "${q}" must carry NO raw decimals: ${simple.text}`).toBe(false)
    const pro = await Ask.answer(q, { register: "pro", now: NOW })
    expect(pro.text).toMatch(new RegExp(`intent ${simple.intent.kind}`)) // the classified intent is shown
    expect(pro.text).toMatch(new RegExp(`tool ${pro.result.tool}`)) // the engine tool is shown
  }
})

test("X-ASK f — the RAW toggle is byte-reproducible (the same query + engine state → identical fact text)", async () => {
  const a = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now: NOW })
  const b = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now: NOW })
  expect(Ask.rawFacts(a.result)).toBe(Ask.rawFacts(b.result)) // identical facts → identical raw text
  expect(JSON.stringify(a.result.facts)).toBe(JSON.stringify(b.result.facts))
})

test("X-ASK — VALIDATION routes to the opt-in Stamp; the Stamp verdict is DISTINCT (never a scorecard verdict)", async () => {
  const a = await Ask.answer("stamp aave-v3 USDC", { register: "pro", now: NOW })
  expect(a.result.tool).toBe("stampFor")
  expect(["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"]).toContain(a.result.meta.stampVerdict as string)
  expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).not.toContain(a.result.meta.stampVerdict as string) // never conflated
})

test("X-ASK — UNSUPPORTED → the safe fallback (an honest 'here's what I can help with', never an invented answer)", async () => {
  const a = await Ask.answer("what is the airspeed of an unladen swallow?", { now: NOW })
  expect(a.intent.kind).toBe("UNSUPPORTED")
  expect(a.result.ok).toBe(false)
  expect(a.result.facts).toEqual([])
  expect(a.text).toMatch(/can help with|check a strategy|what would you like/i)
})

test("X-ASK — COVERAGE returns the total 3×7 matrix; EXPLAIN returns a pinned definition; WORKFLOW a pinned guide", () => {
  const cov = AskTools.coverageMatrix()
  expect(cov.facts).toHaveLength(21) // 3 verticals × 7 axes, total
  const glo = AskTools.glossary("deflation")
  expect(glo.ok).toBe(true)
  expect(glo.facts[0].value).toMatch(/search|overfit|deflation/i)
  const wf = AskTools.workflow()
  expect(wf.facts.length).toBeGreaterThanOrEqual(4)
})
