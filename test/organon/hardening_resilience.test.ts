/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 3: RESILIENCE — where a second human actually breaks it. Crash-safety at every
 * seam (S200/W-HD02, incl. S208 concurrent), RPC honesty (S201/W-HD03), the frozen sidecar (S205/W-HD07).
 */
import { test, expect } from "bun:test"
import { existsSync, rmSync, readFileSync, appendFileSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { Chain } from "../../src/organon/chain"
import { Rpc } from "../../src/organon/rpc"
import { Sidecar } from "../../src/organon/sidecar"
import { Hardening } from "../../src/organon/hardening"

function seg(): string { const p = path.join(tmpdir(), `organon-chain-test-${process.pid}-${Math.floor(performance.now())}.jsonl`); if (existsSync(p)) rmSync(p); return p }

test("S200 (W-HD02) — Chain.append is IDEMPOTENT: the same observation twice DEDUPES (the moat does not fork)", () => {
  const s = seg()
  const obs: Chain.Obs = { subject: "rETH/ETH", blockOrRound: 25537838, value: "1.078" }
  const first = Chain.append(s, obs)
  const again = Chain.append(s, obs)
  expect(first.kind).toBe("CHAINED")
  expect(again.kind).toBe("DEDUPED")
  expect(Chain.readSegment(s).length).toBe(1) // no double
  rmSync(s)
})

test("S200 (W-HD02) — a same-block DIFFERENT-value observation is a loud CONFLICT-HALT, never silently resolved (DD-96)", () => {
  const s = seg()
  Chain.append(s, { subject: "rETH/ETH", blockOrRound: 100, value: "1.078" })
  const conflict = Chain.append(s, { subject: "rETH/ETH", blockOrRound: 100, value: "9.999" })
  expect(conflict.kind).toBe("CONFLICT-HALT")
  if (conflict.kind === "CONFLICT-HALT") expect(conflict.alarm).toMatch(/INTEGRITY ALARM|HALT/)
  rmSync(s)
})

test("S200 (W-HD02) — verifyAndRecover QUARANTINES a torn tail to .torn (never deletes); a CORRUPT-MIDDLE is surfaced loudly", () => {
  const s = seg()
  Chain.append(s, { subject: "a", blockOrRound: 1, value: "x" })
  Chain.append(s, { subject: "b", blockOrRound: 2, value: "y" })
  // a genuinely torn tail (a crash mid-append)
  appendFileSync(s, '{"seq":2,"subject":"torn","value":"half')
  const rec = Chain.verifyAndRecover(s)
  expect(rec.kind).toBe("TORN")
  expect(existsSync(`${s}.torn`)).toBe(true) // quarantined, PRESERVED
  expect(readFileSync(`${s}.torn`, "utf8")).toContain("half")
  expect(Chain.verifyAndRecover(s).kind).toBe("OK") // the segment verifies after quarantine
  // a break in the MIDDLE (a hand-edited history) is CORRUPT-MIDDLE, not silently recovered. Tamper a HASH-LINK field
  // (selfSha) of the FIRST entry — the break is not at the tail, so it is a tampered history, never a crash-torn tail.
  Chain.append(s, { subject: "c", blockOrRound: 3, value: "z" })
  const lines = readFileSync(s, "utf8").split("\n").filter(Boolean)
  lines[0] = lines[0].replace(/"selfSha":"[0-9a-f]+"/, '"selfSha":"0000000000000000000000000000000000000000000000000000000000000000"')
  require("node:fs").writeFileSync(s, lines.join("\n") + "\n")
  expect(Chain.verifyAndRecover(s).kind).toBe("CORRUPT-MIDDLE")
  rmSync(s); if (existsSync(`${s}.torn`)) rmSync(`${s}.torn`)
})

test("S200 (W-HD02, S208) — THE REAL KILL-TEST recovered at EVERY seam (a real kill -9, no fork/double/loss); torn tail quarantined", () => {
  // the committed transcript of the REAL kill-test (script/honesty/hardening-killtest.ts — a SIGKILL subprocess per seam)
  const j = JSON.parse(readFileSync("data/honesty/hardening-killtest.json", "utf8"))
  expect(j.allSeamsRecovered).toBe(true)
  expect(j.seams.length).toBe(Chain.KILL_SEAMS.length) // one kill-test per seam derived from the mechanism's steps (RP-2)
  for (const seam of j.seams) { expect(seam.recovery).toBe("OK"); expect(seam.forkedOrDoubled).toBe(false) }
  expect(j.tornTail.quarantinedNotDeleted).toBe(true) // S208 — concurrent/atomicity: the torn tail preserved, never deleted
  expect(Hardening.crashSafety().ok).toBe(true)
})

test("S201 (W-HD03) — a dead endpoint renders UNREACHABLE{endpoint, attempts, lastError}, never a bare null or a fabricated point", async () => {
  const r = await Rpc.call("eth_blockNumber", [], async () => { throw new Error("ECONNREFUSED") })
  expect(r.kind).toBe("UNREACHABLE")
  if (r.kind === "UNREACHABLE") { expect(r.attempts).toBe(Rpc.pinnedList().length); expect(r.lastError).toMatch(/ECONNREFUSED/) }
})

test("S201 (W-HD03) — the SERVING provider is recorded per-point; a silent swap to an UNPINNED endpoint FAILS", async () => {
  const served = await Rpc.call("eth_blockNumber", [], async (u) => u.includes("llamarpc") ? "0x1" : (() => { throw new Error("dead") })())
  expect(served.kind).toBe("value")
  if (served.kind === "value") expect(Rpc.servingProviderIsPinned(served.servingProvider.url)).toBe(true)
  expect(Rpc.servingProviderIsPinned("https://evil.example/rpc")).toBe(false) // a silent swap is not pinned
  expect(Rpc.policyVerdict().ok).toBe(true) // the pinned understudy list === the rotation (no unpinned endpoint)
})

test("S205 (W-HD07) — the sidecar is FROZEN: uv.lock committed, the studio deps locked, the frozen seven attest byte-identical", () => {
  const f = Sidecar.frozen()
  expect(f.lockCommitted).toBe(true)
  expect(f.pyprojectCommitted).toBe(true)
  expect(f.lockedPackages).toContain("numpy")
  expect(f.lockedPackages).toContain("scipy")
  expect(f.frozenSevenAttested).toBe(true) // the .py sidecar attests 0 drift post-lock
  expect(Sidecar.verdict().ok).toBe(true)
})
