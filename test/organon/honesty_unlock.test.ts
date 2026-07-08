/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 3 walls (UNLOCK-TRUE; Rules X-COVER, X-HONEST). The NEW unlock-overhang axis —
 * imminent token dilution is structured supply risk — positive-controlled: a large near-term unlock → fail; a tiny one →
 * pass; a moderate one → caution; NO reward-token schedule → `not-applicable` (never a fabricated pass); a schedule with
 * an unconfirmable size → UNVERIFIED. S12 (imminent-unlock trap) → not SOLID. The pure `nextUnlockFraction` extractor is
 * exact. And the honesty of the data path: DeFiLlama's unlocks feed went keyless→paid (HTTP 402, deviation D4) — the
 * client probe DEGRADES to SAMPLE, never scraping or faking a fraction.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { Scorecard } from "../../src/analytics/scorecard"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Evidence } from "../../src/studio/evidence"

const DAY = 86_400_000
const withUnlock = (o: Partial<Scorecard.PoolFacts> = {}): Scorecard.PoolFacts => ({ name: "rewarded-pool", vertical: "lending", apyBase: 8, apyReward: 2, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", hasUnlockSchedule: true, unlockPct30d: 0.2, ageDays: 900, sizeUsd: 240_000_000, ...o })

test("POSITIVE CONTROL — the unlock-overhang axis: heavy → fail · benign → pass · moderate → caution", () => {
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: 0.2 })).tier).toBe("fail") // 20% of mcap in 30d
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: 0.005 })).tier).toBe("pass") // <1%
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: 0.03 })).tier).toBe("caution") // 3%
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: null })).tier).toBe("unverified") // schedule exists, size unconfirmable
})

test("X-COVER — no reward-token schedule → `not-applicable`, NEVER a fabricated pass", () => {
  const noSchedule = Scorecard.unlockOverhangRow(withUnlock({ hasUnlockSchedule: false }))
  expect(noSchedule.tier).toBe("not-applicable")
  expect(noSchedule.material).toBe(false) // never counts toward SOLID
  expect(noSchedule.plainReason).toMatch(/no reward token|no imminent|no.*schedule/i)
})

test("S12 — an imminent large unlock → unlock FAIL → not SOLID (CAUTION/AVOID)", () => {
  const s = Scorecard.score(withUnlock({ unlockPct30d: 0.2 })) // 20% dilution in 30d, everything else clean
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("pass") // durable base — would read SOLID on yield alone
  expect(s.rows.find((r) => r.axis === "unlock-overhang")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.summary).toMatch(/unlock|dilut|supply/i) // the failing axis is NAMED
  // a benign unlock leaves it SOLID (the axis only bites when the overhang is real)
  expect(Scorecard.score(withUnlock({ unlockPct30d: 0.005 })).verdict).toBe("SOLID")
})

test("a blue-chip stable lending pool with no token overhang scores exactly as before (unlock n/a doesn't perturb it)", () => {
  const bluechip: Scorecard.PoolFacts = { name: "aave-v3 USDC", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000 }
  expect(Scorecard.score(bluechip).rows.find((r) => r.axis === "unlock-overhang")!.tier).toBe("not-applicable")
  expect(Scorecard.score(bluechip).verdict).toBe("SOLID")
})

test("the pure nextUnlockFraction extractor is exact: only future in-window events count; unknown mcap → null", () => {
  const sched: DefiLlama.UnlockSchedule = { mcap: 1_000_000, tPrice: 2, events: [{ ts: 5 * DAY, tokens: 50_000 }, { ts: 40 * DAY, tokens: 100_000 }, { ts: -1 * DAY, tokens: 999_999 }] }
  // only the +5d event (50_000 tokens × $2) falls in the [now, now+30d] window: 100_000 / 1_000_000 = 0.1
  expect(DefiLlama.nextUnlockFraction(sched, 0, 30)).toBeCloseTo(0.1, 6)
  expect(DefiLlama.nextUnlockFraction({ ...sched, mcap: null }, 0, 30)).toBeNull() // unknown mcap → null, never a fabricated fraction
  expect(DefiLlama.nextUnlockFraction({ mcap: 1_000_000, tPrice: 2, events: [] }, 0, 30)).toBe(0) // no events → 0 (benign)
})

test("X-HONEST (D4) — the DeFiLlama unlocks probe DEGRADES on the 402 paywall to SAMPLE (never scraped, never faked)", async () => {
  const paywalled: DefiLlama.FetchImpl = async () => ({ ok: false, status: 402, json: async () => ({}) })
  const r = await DefiLlama.unlocks("aave", 0, paywalled)
  expect(r.reality).toBe("SAMPLE")
  expect(r.status).toBe(402)
  expect(r.note).toMatch(/402|paywall|D4/i)
  expect(r.body).toBeNull() // nothing fabricated
  // a real 200 body → REAL (the wiring point is honest, ARMED for a keyless source)
  const okBody: DefiLlama.FetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ metadata: { token: "x" } }) })
  expect((await DefiLlama.unlocks("aave", 0, okBody)).reality).toBe("REAL")
  // a network error → SAMPLE, never a throw to the caller
  const threw: DefiLlama.FetchImpl = async () => { throw new Error("no network") }
  expect((await DefiLlama.unlocks("aave", 0, threw)).reality).toBe("SAMPLE")
})

// ── THE CROWN-JEWEL SPRINT — Phase 2 (UNLOCK-LIVE): the D6 signed scope-cut, evidenced (X-UNLOCK-LIVE) ──
test("UNLOCK-LIVE (Crown-Jewel Phase 2, D6) — the signed scope-cut is in the live ledger, with the four fields + the resolution", () => {
  const led = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "deviations.json"), "utf8")) as { deviations: { id: string; blueprintLine: string; whatWasDone: string; why: string; lawAuthority: string }[] }
  const d6 = led.deviations.find((d) => d.id === "D6")
  expect(d6, "D6 must be recorded in the live deviations ledger (a silent scope-cut is a Halt)").toBeTruthy()
  for (const f of ["blueprintLine", "whatWasDone", "why", "lawAuthority"] as const) expect(d6![f].trim().length).toBeGreaterThan(0)
  expect(d6!.whatWasDone).toMatch(/scope-cut|SCOPE-CUT/i)
  expect(d6!.whatWasDone).toMatch(/402|paywall/i) // the paywall is the reason, evidenced
  expect(d6!.whatWasDone).toMatch(/ARMED|never scraped|never faked/i) // the axis stays honest + armed
  expect(d6!.lawAuthority).toMatch(/X-UNLOCK-LIVE/)
})

test("UNLOCK-LIVE (Crown-Jewel Phase 2, D6) — the paywall is EVIDENCED, not asserted: the committed probe capture is manifested + reproduces (clone-robust)", () => {
  const probe = Evidence.readArtifact<{ status: number | null; paywalled: boolean | null; keyless: boolean; resolution: string }>("vlive-unlock-probe.json")
  if (!probe) { console.log("  (honesty_unlock) vlive-unlock-probe.json absent — run `bun run script/build-evidence.ts`"); return }
  expect(probe.keyless).toBe(false) // the source is not keyless (paid)
  expect(probe.resolution).toMatch(/D6/) // the artifact names the signed scope-cut
  // when the probe reached the network, it is the honest 402 (never a fabricated 200/schedule); offline → status null, disclosed
  if (probe.status !== null) expect(probe.status).not.toBe(200) // a keyless 200 would REOPEN the source (then D6 would be wrong) — honest either way
  // the probe capture is covered by the capture-manifest — its committed content-hash reproduces (S18)
  const v = Evidence.verifyCaptureManifest()
  expect(v.ok, v.problems.join("; ")).toBe(true)
  const m = Evidence.readArtifact<{ entries: { capture: string }[] }>("capture-manifest.json")
  if (m) expect(m.entries.some((e) => e.capture === "vlive-unlock-probe.json")).toBe(true)
})

test("UNLOCK-LIVE (Crown-Jewel Phase 2, D6) — the axis stays ARMED: a REAL keyless schedule would still score (the cut is scope, not capability)", () => {
  // the pure extractor + the row are UNCHANGED — the moment a keyless source returns a schedule, the axis scores it
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: 0.2 })).tier).toBe("fail") // ARMED: a heavy overhang still fails
  expect(Scorecard.unlockOverhangRow(withUnlock({ unlockPct30d: 0.005 })).tier).toBe("pass") // ARMED: a benign one still passes
  // on live keyless data with no resolvable schedule → not-applicable/UNVERIFIED, never a fabricated fraction (the D6 honesty)
  expect(Scorecard.unlockOverhangRow(withUnlock({ hasUnlockSchedule: false })).tier).toBe("not-applicable")
})
