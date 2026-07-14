/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 1 walls: S116 (the D33 power fix), S119 (published narrowed), S120 (the Socket
 * negotiates). "The three that shipped wrong." Each V37 capability passed its wall and was materially wrong underneath; this
 * makes each one TRUE. Never sheds.
 *
 * S116 — DD-33/RP-1: D33's theory test was a 0.02 point-tolerance against an estimator whose sampling SE at S=8 is ~0.06 — a
 * point test on a random variable, failing by ordinary noise (X-REACH(a) read backwards). The empirical SE is COMPUTED over
 * a pinned null distribution and SHOWN; the z is a NUMBER; the S=8 result is PRESERVED; raising S (a call param, not frozen)
 * incurs no search; and D33 recomputes on a VALID test.
 * S119 — DD-35/H-8: `published` could be satisfied by a PRIVATE repo; a token/credential remote now derives false, and
 * publication requires an unauthenticated public artifact a private repo cannot fake.
 * S120 — DD-36/H-3: the Socket pinned a version from memory; it now NEGOTIATES a live-verified range and the recalled set
 * was proven stale.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Power, CrossCheck, Signability, Correctness } from "../../src/backtest/crosscheck"
import { Published } from "../../src/organon/published"
import { Socket } from "../../src/socket/server"

const H = path.join(PKG_ROOT, "data", "honesty")
const sp = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))

// ── S116 — the D33 power fix ──────────────────────────────────────────────────────────────────────────────────────────
test("S116 (W-SU01, DD-33/RP-1) — Power.se is the a-priori estimator SE: S=8 SE > the 0.02 tolerance (the test could never succeed); S=16 SE < 0.02", () => {
  expect(Power.combinations(8)).toBe(70)
  expect(Power.combinations(16)).toBe(12870)
  const se8 = Power.se(8, 1000, 504)
  const se16 = Power.se(16, 1000, 504)
  expect(se8).toBeGreaterThan(0.02) // ~0.06 — a point-tolerance test at 0.02 on this estimator CANNOT succeed
  expect(se16).toBeLessThan(0.02) // ~0.004 — adequate power
  expect(Power.testCanSucceed(0.02, se8)).toBe(false) // X-REACH(a) read backwards: a check that cannot succeed is not a check
  expect(Power.testCanSucceed(0.02, se16)).toBe(true)
})

test("S116 (RP-1) — S is NOT inside the frozen set: rigor.pbo takes n_splits as a call param; raising it edits the HARNESS, not rigor.py (sha unmoved)", () => {
  // the frozen rigor.py exposes pbo(matrix, n_splits=...) — S=8 is a call default, never a frozen constant of the procedure
  const rigorPy = readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "rigor.py"), "utf8")
  expect(rigorPy).toMatch(/def pbo\(matrix,\s*n_splits/) // n_splits is a PARAMETER
  expect(sp.powerCalc_S116.sIsInsideFrozenSet).toBe(false)
  // the null distribution runs in crosscheck.py (the harness), which is NOT in the frozen set
  const frozen = readFileSync(path.join(PKG_ROOT, "src", "organon", "frozen.ts"), "utf8")
  expect(frozen).toMatch(/"rigor\.py"/) // rigor.py IS frozen
  expect(frozen).not.toMatch(/"crosscheck\.py"/) // crosscheck.py is NOT frozen — the harness is editable
})

test("S116 (DD-33) — the empirical SE is COMPUTED and SHOWN, the z is a NUMBER, the S=8 result is PRESERVED, and D33 recomputes on a VALID test", () => {
  const rec = JSON.parse(readFileSync(path.join(H, "rigor-crosscheck.json"), "utf8"))
  const pf = rec.crossCheck?.s116PowerFix
  expect(pf).toBeTruthy()
  // the S=8 failed result is PRESERVED forever (RP-1) — you do not delete the test you failed
  expect(pf.s8Legacy.pbo).toBeGreaterThan(0) // the single-seed S=8 PBO, kept
  expect(pf.s8Legacy.note).toMatch(/PRESERVED/i)
  // the empirical SE at S=8 (the null-distribution SD) is SHOWN and is >> the 0.02 tolerance — the invalidity, measured
  expect(pf.nullDistS8.empiricalSe).toBeGreaterThan(0.02)
  expect(pf.nullDistS8.nSeeds).toBeGreaterThanOrEqual(200)
  // the empirical SE at S=16 collapses (adequate power)
  expect(pf.nullDistS16.empiricalSe).toBeLessThan(pf.nullDistS8.empiricalSe)
  // the z is a NUMBER (the distance), not a boolean (RP-2)
  expect(typeof pf.nullDistS16.z).toBe("number")
  // a seeded tolerance NARROWER than the estimator's own SE cannot succeed (the S116 invariant)
  expect(Power.testCanSucceed(0.01, pf.nullDistS8.empiricalSe)).toBe(false)
})

// ── S119 — published narrowed ─────────────────────────────────────────────────────────────────────────────────────────
test("S119 (W-SU04, DD-35/H-8) — a private/authenticated remote derives published:false; a credential/token URL is not a public URL", () => {
  // the seeded negative — an authenticated/token remote is NOT stranger-reachable
  expect(Published.isPublicRemoteUrl("https://ghp_AAAAAAAAAAAAAAAAAAAAAAAA@github.com/owner/private.git")).toBe(false)
  expect(Published.isPublicRemoteUrl("https://user:password@github.com/owner/repo.git")).toBe(false)
  expect(Published.isPublicRemoteUrl("https://oauth2:x-access-token@gitlab.com/owner/repo.git")).toBe(false)
  // a clean public remote is still public (no over-tightening); a local path is still not
  expect(Published.isPublicRemoteUrl("https://github.com/ibabarhashmi/organon.git")).toBe(true)
  expect(Published.isPublicRemoteUrl("git@github.com:ibabarhashmi/organon.git")).toBe(true)
  expect(Published.isPublicRemoteUrl("/Users/babar/Projects/organon")).toBe(false)
})

test("S119 (DD-35) — publication additionally requires an UNAUTHENTICATED public artifact a private repo cannot fake; absent → published false (correct)", () => {
  const art = Published.hasUnauthenticatedPublicArtifact()
  expect(art.ok).toBe(false) // no committed public artifact yet — a human's push
  const d = Published.derive()
  expect(d.published).toBe(false) // still false (stricter) — the safe direction
  expect(d.detail).toMatch(/DERIVED/) // every branch is DERIVED (S96/reach_fact invariant preserved)
})

// ── S120 — the Socket negotiates a live-verified range ────────────────────────────────────────────────────────────────
test("S120 (W-SU05, DD-36/H-3) — the Socket NEGOTIATES a range: an in-range clientVersion is echoed back, an out-of-range one refused loudly naming the range", () => {
  const j = (o: unknown) => JSON.stringify(o)
  const call = (o: unknown) => JSON.parse(Socket.handle(j(o)))
  // an in-range version is ACCEPTED and echoed back (speak the client's dialect) — the H-3 fix
  const inRange = call({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } })
  expect(inRange.result.protocolVersion).toBe("2025-06-18")
  // the CURRENT revision (which the recalled point-pin would have refused) is accepted
  const current = call({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "2025-11-25" } })
  expect(current.result.protocolVersion).toBe("2025-11-25")
  // no version → serve the newest supported
  const none = call({ jsonrpc: "2.0", id: 3, method: "initialize", params: {} })
  expect(none.result.protocolVersion).toBe(Socket.PROTOCOL_VERSION)
  // out-of-range → refused LOUDLY naming the range (RP-5)
  const out = call({ jsonrpc: "2.0", id: 4, method: "initialize", params: { protocolVersion: "1999-01-01" } })
  expect(out.error.code).toBe(-32001)
  for (const v of Socket.SUPPORTED_VERSIONS) expect(out.error.message).toContain(v)
})

test("S120 (DD-36) — the supported set is the LIVE-VERIFIED range (protocol-verification.json), and the recalled pin was proven STALE (H-3, live)", () => {
  const pv = JSON.parse(readFileSync(path.join(H, "protocol-verification.json"), "utf8"))
  expect(pv.verified).toBe(true)
  expect(pv.recalledWasStale).toBe(true)
  expect(pv.missedByRecall).toContain("2025-11-25") // the recalled set missed the CURRENT revision — H-3 proven live
  // the Socket's embedded set === the verified range (they cannot drift)
  expect([...Socket.SUPPORTED_VERSIONS]).toEqual(pv.verifiedRange)
  expect(Socket.PROTOCOL_VERSION).toBe(pv.currentVersion) // the newest supported = the current revision
  expect(Socket.PROTOCOL_VERSIONS_VERIFIED).toBe(true)
  // Protocol.negotiate is pure and correct
  expect(Socket.negotiate("2025-11-25")).toEqual({ ok: true, version: "2025-11-25" })
  expect(Socket.negotiate("").ok).toBe(true) // no version → newest
  expect(Socket.negotiate("2099-01-01").ok).toBe(false)
})
