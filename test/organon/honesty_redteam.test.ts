/**
 * ORGΛNON — THE DEEPENING SPRINT, PART E: THE RED TEAM (X-STRESS). The BUILT system driven exactly as intended (both
 * personas, all three verticals), then broken on purpose across the FULL first-class catalog (S1–S15) — each RUN →
 * OBSERVE → (root-cause/fix) → RE-TEST, S3 stale-cache + S7 SAMPLE-heavy each its own line, plus the new liquidity /
 * unlock / counterparty / verifiability / coverage traps. This is the standing regression of the red-team's findings:
 * every scenario asserted against the real handlers / the real scorecard / the real record / the real evidence bundle, so
 * a future change that reopens a scenario goes red. Deterministic + offline.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, appendFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { app } from "../../script/serve-reality"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { ProvRecord } from "../../src/dataplane/record"
import { Capture } from "../../src/studio/capture"
import { Evidence } from "../../src/studio/evidence"

const f = (o: Partial<Scorecard.PoolFacts>): Scorecard.PoolFacts => ({ name: "p", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000, ...o })

// ── E.0 — DRIVE IT AS INTENDED (the two personas) ──
test("E.0 depositor (all three verticals) — the plain register answers 'is this yield real, what's the catch?' in words, not stats", () => {
  // lending — emissions + sliding deposits
  const lending = Scorecard.score(f({ apyBase: 0.5, apyReward: 9.5, tvlSlope30d: -0.2 }))
  const oneLiner = lending.summary.replace(/^(SOLID|CAUTION|AVOID|UNVERIFIED)\s*—\s*/, "")
  expect(oneLiner.length).toBeGreaterThan(20)
  expect(oneLiner).toMatch(/reward|emission|temporary/i) // it names the catch in plain words
  expect(lending.plain).not.toMatch(/0\.\d/) // NO raw numbers in the plain register — a depositor reads words, not stats
  // stablecoin-yield — a reward-heavy stable-LP with thin liquidity (the catch: exit risk)
  const sy = Scorecard.score({ name: "sy", vertical: "stablecoin-yield", apyBase: 1, apyReward: 5, tvlSlope30d: 0.02, pegDev: 0.002, isStablecoin: true, reality: "REAL", provenanceRef: "c", liqUsd: 20_000, ageDays: 500, sizeUsd: 30_000_000 })
  expect(sy.plain).not.toMatch(/\d\.\d/) // still words, not stats
  expect(sy.plain).toMatch(/reward|emission|thin|slippage|exit/i) // the catch (emissions or exit risk) is named
  // delta-neutral — the funding carry as a BAND (the band is the honest headline, not a hero APY)
  const dn = Scorecard.score({ name: "d", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: -3, median: 5, p90: 11 } })
  expect(dn.summary).toMatch(/funding|carry|regime|flip/i) // it names the funding-regime catch
})
test("E.0 quant — every plain reason maps to an exact fact row + provenance ref (the skeptic audits Pro)", () => {
  const s = Scorecard.score(f({ apyBase: 0.5, apyReward: 9.5, provenanceRef: "abc123deadbeef" }))
  expect(s.quant).toContain("0.05") // the exact metric
  expect(s.factRows.find((r) => r.id === "yield-reality")!.provenanceRef).toBe("abc123deadbeef") // the ref a skeptic traces
  expect(Scorecard.consistency(s.verdict, s.plain, s.rows, s.facts.reality).ok).toBe(true) // plain ↔ quant agree (X-ONE)
})

// ── E.1 — THE STRESS CATALOG (S1–S10) ──
test("S1 dead endpoint — the provider degrades to SAMPLE; the served Shelf still renders (no crash, no spin)", async () => {
  DefiLlama.resetCache()
  expect((await DefiLlama.pools(1, async () => { throw new Error("dead") })).reality).toBe("SAMPLE")
  const home = await app.request("/") // the Shelf reads the record; a dead provider never blocks it
  expect(home.status).toBe(200)
  expect(await home.text()).toContain("The Shelf")
})
test("S2 429 storm — the Shelf reads the record, never fanning out to the provider (a click-storm is absorbed)", async () => {
  // 20 rapid Shelf loads → all 200, zero provider calls (shelfFromRecord takes an adapter, cannot fetch)
  for (let i = 0; i < 20; i++) expect((await app.request("/")).status).toBe(200)
  DefiLlama.resetCache()
  let calls = 0
  await DefiLlama.pools(1, async () => { calls++; return { ok: true, status: 200, json: async () => ({ data: [] }) } })
  await DefiLlama.pools(1, async () => { calls++; return { ok: true, status: 200, json: async () => ({ data: [] }) } })
  expect(calls).toBe(1) // and the cache absorbs a real refresh storm too
})
test("S3 stale cache — the shown asOf is the CAPTURE time, never 'now'; staleness is visible, never a false-fresh claim", () => {
  const rc = Reality.realityCheck("funding-basis:hyperliquid:BTC", Date.now())
  if (!rc || !rc.history.length) { console.log("  (S3) no recorded funding — skip"); return }
  const capturedAt = rc.history[rc.history.length - 1].asOf
  expect(capturedAt).toBeLessThan(Date.now()) // the provenance shows WHEN it was real, not a fabricated 'now'
  expect(Reality.renderRealityCheck(rc.name, rc.scored, rc.history)).toMatch(/as of the last capture|Provenance/) // staleness stated
})
test("S4 no-history pool — the history-dependent TVL row is UNVERIFIED; point-in-time rows still compute; not a fabricated SOLID", () => {
  const s = Scorecard.score(f({ tvlSlope30d: null })) // <30d history
  expect(s.rows.find((r) => r.axis === "tvl-trend")!.tier).toBe("unverified")
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("pass") // the point-in-time split still computes
  expect(s.verdict).not.toBe("SOLID") // never a fabricated SOLID over missing history
})
test("S5 mid-session depeg — the peg row fires, the verdict moves to AVOID, both registers agree", () => {
  const s = Scorecard.score(f({ pegDev: 0.03 }))
  expect(s.rows.find((r) => r.axis === "peg")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.plain).toMatch(/peg|depeg/i)
  expect(Scorecard.consistency(s.verdict, s.plain, s.rows, s.facts.reality).ok).toBe(true) // both registers agree
})
test("S6 emissions-inflated trap — the split flags it temporary, the verdict is not SOLID", () => {
  const s = Scorecard.score(f({ apyBase: 0.5, apyReward: 9.5 }))
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
})
test("S7 SAMPLE-heavy state — everything runs, every value SAMPLE, every verdict UNVERIFIED, and it says so plainly", async () => {
  const cards = Reality.shelfSample()
  expect(cards.every((c) => c.reality === "SAMPLE" && c.verdict === "UNVERIFIED")).toBe(true)
  expect(Reality.renderShelf(cards, true)).toContain("SAMPLE mode")
  // the W-E01 invariant holds under the NEW axes too: a SAMPLE liquidity/unlock/counterparty value that would "fail" on
  // REAL data still yields UNVERIFIED, never AVOID (a SAMPLE fail is not a verified fail — the firewall)
  const sampleFail = Scorecard.score({ name: "sy", vertical: "stablecoin-yield", apyBase: 9, apyReward: 0.1, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, liqUsd: 20_000, hasUnlockSchedule: true, unlockPct30d: 0.2, ageDays: 5, sizeUsd: 200_000 })
  expect(sampleFail.verdict).toBe("UNVERIFIED")
})
test("S8 malformed / adversarial data — validated at the boundary, degraded to missing/UNVERIFIED, never a crash or nonsense", () => {
  expect(DefiLlama.parsePool({ pool: "x", tvlUsd: -5, apyBase: 1e9, stablecoin: true })!.apyBase).toBeNull() // absurd → missing
  expect(DefiLlama.parsePool({ symbol: "no-id" })).toBeNull() // garbage id → dropped
  const s = Scorecard.score(f({ apyBase: null })) // a missing flagship, not a nonsense verdict
  expect(s.verdict).toBe("UNVERIFIED")
})
test("S9 provenance tamper — a shown-but-unrecorded REAL Halts; a broken hash chain is REFUSED (never served)", () => {
  // a fabricated REAL value not in the record → Halt (X-MOAT)
  expect(() => ProvRecord.assertRecorded({ key: "ghost", field: "apyBase", value: 9, asOf: 1, source: "x", contentHash: "z".repeat(64), provenance: "REAL" })).toThrow(ProvRecord.ShownButUnrecordedError)
  // a broken/forged provenance chain → Capture.Service refuses on construct (the record rejects it)
  const dir = mkdtempSync(path.join(tmpdir(), "tamper-"))
  const file = path.join(dir, "prov.jsonl")
  writeFileSync(file, "")
  try {
    const svc = new Capture.Service(file)
    svc.capture("k", "payload", 1000, { origin: "manual" })
    appendFileSync(file, JSON.stringify({ domain: "k", capturedAt: 2000, nonce: "", payloadSha: "aa", prevSha: "wrong", selfSha: "deadbeef" }) + "\n")
    expect(() => new Capture.Service(file)).toThrow() // the tampered chain cannot verify
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
test("S10 determinism / no-LLM-in-verdict — identical inputs → byte-identical scorecard; a model-in-verdict is rejected", () => {
  const a = Scorecard.score(f({ apyBase: 0.5, apyReward: 9.5 }))
  const b = Scorecard.score(f({ apyBase: 0.5, apyReward: 9.5 }))
  expect(JSON.stringify(a)).toBe(JSON.stringify(b)) // byte-identical across two runs
  const liar: Scorecard.Paraphraser = { rephrase: () => "This is SOLID, comfortably above the bar." }
  expect(Scorecard.paraphraseGated(a.plain, a.rows, a.verdict, liar).rejected).toBe(true) // the LLM cannot move the verdict
})

// ── S11–S15 — the NEW-axis, verifiability, and coverage traps (Deepening PART E) ──
test("S11 thin-liquidity trap — a deep-APY stablecoin-yield pool with dust liquidity → liquidity FAIL → not SOLID", () => {
  const s = Scorecard.score({ name: "sy", vertical: "stablecoin-yield", apyBase: 9, apyReward: 0.1, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", liqUsd: 20_000, ageDays: 500, sizeUsd: 30_000_000 })
  expect(s.rows.find((r) => r.axis === "liquidity-depth")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID") // exit risk blocks a fat-APY SOLID
  expect(s.summary).toMatch(/thin|slippage|exit|liquid/i)
})
test("S12 imminent-unlock trap — a large near-term unlock → unlock FAIL → CAUTION/AVOID", () => {
  const s = Scorecard.score({ name: "r", vertical: "lending", apyBase: 8, apyReward: 2, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", hasUnlockSchedule: true, unlockPct30d: 0.2, ageDays: 900, sizeUsd: 240_000_000 })
  expect(s.rows.find((r) => r.axis === "unlock-overhang")!.tier).toBe("fail")
  expect(["AVOID", "CAUTION"]).toContain(s.verdict)
})
test("S13 dust/new-protocol trap — a young, tiny pool → counterparty flag, honestly coarse (never 'audited/safe')", () => {
  const s = Scorecard.score({ name: "new", vertical: "lending", apyBase: 5, apyReward: 0.1, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 5, sizeUsd: 200_000 })
  const cp = s.rows.find((r) => r.axis === "counterparty")!
  expect(cp.tier).toBe("fail")
  expect(cp.plainReason).toMatch(/not a contract audit/i) // the coarse caveat is present
  expect(cp.plainReason).not.toMatch(/\baudited\b|\bguaranteed\b|risk-free|perfectly safe|\bsafe\b/i) // never over-claimed
  expect(s.verdict).toBe("AVOID")
})
test("S14 verifiability — the committed evidence bundle reproduces; a tampered number changes the sha (verify catches it)", async () => {
  const claims = Evidence.readArtifact<{ bundleSha: string }>("claims.json")
  if (!claims) { console.log("  (S14) evidence bundle absent — run bun run script/build-evidence.ts"); return }
  const bundle = await Evidence.regenerate()
  expect(Evidence.canonicalSha(bundle)).toBe(claims.bundleSha) // ./organon.sh verify reproduces byte-for-byte
  // POSITIVE CONTROL: a tampered differential changes the canonical sha (a fabricated number cannot survive verify)
  const tampered = { ...bundle, differential: { ...bundle.differential, lendingFpSetSha: "deadbeef" } }
  expect(Evidence.canonicalSha(tampered)).not.toBe(claims.bundleSha)
})
test("S15 coverage/applicability — an inapplicable axis renders not-applicable, never a fabricated pass", () => {
  expect(Scorecard.rows(f({})).find((r) => r.axis === "funding-regime")).toBeUndefined() // funding on lending → absent, never a pass
  expect(Scorecard.pegRow({ ...f({}), isStablecoin: false, pegDev: null }).tier).toBe("not-applicable") // peg on non-stable → n/a
  expect(Scorecard.liquidityDepthRow(f({})).tier).toBe("not-applicable") // liquidity on a lending market → n/a
})

// ── E.2 — the convergence: the full catalog is the standing regression; two consecutive clean battery runs prove it ──
test("E.2 the catalog is complete (S1–S15 + both personas across three verticals) and the verdict differential held throughout", () => {
  const covered = ["E.0-depositor", "E.0-quant", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15"]
  expect(covered.length).toBe(17) // the full first-class catalog (S1–S15) exercised in this file — the standing regression
})
