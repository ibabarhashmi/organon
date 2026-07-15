/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 3: THE ON-CHAIN BACKFILL ENGINE (S184–S186). The moat's second stone.
 *
 * Backfill.round walks a rate feed's historical rounds (Chainlink getRoundData) and chains them REAL-DERIVED: re-derivable at
 * each round, third-party-sourced. Validated against a REAL, re-derivable known-answer round captured live before design
 * (rETH/ETH, phaseId 2, aggRound 700 — finalized/immutable). No new mass-path dep; the plausibility gate is structural-only.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Backfill } from "../../src/plane/backfill"

const KA = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "backfill-known-answer.json"), "utf8"))
const reth = Backfill.feed("reth-eth-exchange-rate")!

// ── S184 (W-BF05) — a REAL-DERIVED point is re-derivable at its round; garbage is REJECTED, not chained ──

test("S184 (W-BF05) — the KNOWN-ANSWER round decodes + re-derives: a REAL, immutable Chainlink round (captured live before design)", () => {
  const dec = Backfill.decodeRound(KA.rawReturn)!
  expect(dec.roundId.toString()).toBe(KA.roundId)
  expect(dec.answer.toString()).toBe(KA.answer)
  expect(Number(dec.updatedAt)).toBe(KA.updatedAt)
  // phase decomposition (F-3): roundId = (phaseId << 64) | aggregatorRoundId
  const d = Backfill.decomposeRoundId(dec.roundId)
  expect(d.phaseId).toBe(KA.phaseId)
  expect(d.aggregatorRoundId.toString()).toBe(KA.aggregatorRoundId)
  // the round() builder produces a REAL-DERIVED observation matching the fixture
  const r = Backfill.round(reth, { roundId: BigInt(KA.roundId), rawReturn: KA.rawReturn, feedCodeHash: KA.feedCodeHash, providerAtCapture: "test", capturedAt: KA.capturedAt })
  expect(r.ok).toBe(true)
  if (r.ok) {
    expect(r.obs.tier).toBe("REAL-DERIVED")
    expect(r.obs.observableType).toBe("exchange-rate") // rate-space, NOT a USD price
    expect(Math.abs(r.obs.decoded - KA.decoded)).toBeLessThan(1e-12)
  }
})

test("S184 (W-BF05) — the composition round-trips: composeRoundId(decompose(r)) === r", () => {
  const rid = BigInt(KA.roundId)
  const d = Backfill.decomposeRoundId(rid)
  expect(Backfill.composeRoundId(d.phaseId, d.aggregatorRoundId)).toBe(rid)
})

test("S184 (W-BF05) — SEEDED NEGATIVE: a NON-re-derivable point (the feed returned a different round) is REJECTED, not chained", () => {
  // we asked for roundId+1 but the feed returned roundId (KA) — the point does not re-derive → REJECT
  const r = Backfill.round(reth, { roundId: BigInt(KA.roundId) + 1n, rawReturn: KA.rawReturn, providerAtCapture: "t", capturedAt: 0 })
  expect(r.ok).toBe(false)
  if (!r.ok) { expect(r.reason).toMatch(/does not re-derive/); expect(r.wall).toBe("S184") }
})

test("S184 (W-BF05) — SEEDED NEGATIVE: a garbage decode (a mis-sliced word) is REJECTED (structural-only plausibility)", () => {
  // an all-0xff return decodes to an enormous fraction → structurally impossible for a rate → REJECT
  const garbage = Backfill.round(reth, { roundId: 1n, rawReturn: "0x" + "ff".repeat(160), providerAtCapture: "t", capturedAt: 0 })
  expect(garbage.ok).toBe(false)
  // but an economically-EXTREME real value is CHAINED (the gate tests the ENCODING, never the ECONOMICS): a plausible band admits it
  expect(Backfill.plausibleFraction(1n, 18).ok).toBe(true) // a tiny rate is fine
  expect(Backfill.plausibleFraction(10n ** 30n, 18).ok).toBe(false) // an address-scale word is a mis-slice
})

test("S184 (W-BF05) — SEEDED NEGATIVE: an UNWRITTEN round (updatedAt 0) is REJECTED (not a point-in-time observation)", () => {
  const empty = "0x" + "00".repeat(160) // roundId 0, answer 0, updatedAt 0
  const r = Backfill.round(reth, { roundId: 0n, rawReturn: empty, providerAtCapture: "t", capturedAt: 0 })
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.reason).toMatch(/updatedAt 0|unwritten|does not re-derive/)
})

// ── S185 (W-BF06) — the REAL-DERIVED chain integrity; tiers never mix ──

test("S185 (W-BF06) — the committed REAL-DERIVED chain is intact (prevHash links, every entry REAL-DERIVED + round-pinned)", () => {
  const led = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "observe-ledger.json"), "utf8"))
  const rd = led.realDerived as Backfill.Observation[]
  expect(rd.length).toBeGreaterThan(0)
  const chk = Backfill.chainOk(rd)
  expect(chk.ok).toBe(true)
  // every entry is REAL-DERIVED, round-pinned, and NOT block-pinned (that would masquerade as REAL★)
  for (const e of rd) { expect(e.tier).toBe("REAL-DERIVED"); expect(e.roundId).toMatch(/^\d+$/) }
})

test("S185 (W-BF06) — SEEDED NEGATIVE: a REAL★-tier point spliced into the REAL-DERIVED chain BREAKS it", () => {
  const led = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "observe-ledger.json"), "utf8"))
  const rd = (led.realDerived as Backfill.Observation[]).slice(0, 3)
  const spliced = [...rd, { ...rd[0], tier: "REAL★" as never, prevHash: rd[2].sha }]
  const chk = Backfill.chainOk(spliced as Backfill.Observation[])
  expect(chk.ok).toBe(false)
  if (!chk.ok) expect(chk.reason).toMatch(/≠ REAL-DERIVED|cross-tier/)
})

// ── S186 (W-BF07) — no mass-path dependency ──

test("S186 (W-BF07) — deps stay 2 (hono, zod); no ethers/viem/web3/graph-client in package.json", () => {
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
  const forbidden = /ethers|viem|web3|@graphprotocol|graph-client|graphql-request/
  for (const d of Object.keys(pkg.dependencies)) expect(forbidden.test(d)).toBe(false)
})

test("S186 (W-BF07) — SEEDED NEGATIVE: the backfill engine imports NO ABI/graph library (hand-encoded getRoundData only)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "plane", "backfill.ts"), "utf8")
  const imports = src.split("\n").filter((l) => /^\s*import\b/.test(l)).join("\n")
  expect(/ethers|viem|web3|graph-client|@graphprotocol/.test(imports)).toBe(false)
  // the getRoundData selector is hand-encoded (the public selector, no ABI library)
  expect(Backfill.GET_ROUND_DATA_SELECTOR).toBe("0x9a6fc8f5")
  expect(Backfill.encodeGetRoundData(700n)).toBe("0x9a6fc8f5" + (700).toString(16).padStart(64, "0"))
})

test("S186 (W-BF07) — no scheduler/daemon in the backfill verb (a VERB, not a service)", () => {
  const verb = readFileSync(path.join(PKG_ROOT, "script", "honesty", "backfill.ts"), "utf8")
  // match actual scheduling CODE constructs, not honest prose ("no cron, no daemon" is the disclaimer, not a scheduler)
  expect(/setInterval\(|setTimeout\(|new CronJob|cron\.schedule|\.listen\(|createServer\(/.test(verb)).toBe(false)
  expect(verb).toMatch(/ORGΛNON SCHEDULES NOTHING/)
})
