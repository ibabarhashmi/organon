/**
 * ORGΛNON — THE SOVEREIGN SPRINT, Phase 4 wall (PLANE-RPC-STATE; Spine B path 3 · X-PLANE a,b). Current-state reads over
 * the PINNED free public RPC rotation, HERMETIC + positive-controlled: the ACTUAL RPC that answered is RECORDED per read
 * (source-honest); a dead provider ROTATES honestly to the next; if ALL are dead the read is null (SAMPLE/UNVERIFIED),
 * NEVER a fabricated state. A committed LIVE probe (data/honesty/plane-rpcstate-probe.json) proves the path is real.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { PlaneRpcState } from "../../src/plane/rpcstate"

test("PLANE-RPC — the rotation is the pinned four free public RPCs (a fourth added / one removed is a re-pin, X-PLANE a)", () => {
  expect(PlaneRpcState.ROTATION.length).toBe(4)
  expect(PlaneRpcState.ROTATION.some((u) => /llamarpc/.test(u))).toBe(true)
  expect(PlaneRpcState.ROTATION.some((u) => /ankr/.test(u))).toBe(true)
  expect(PlaneRpcState.ROTATION.some((u) => /publicnode/.test(u))).toBe(true)
  expect(PlaneRpcState.ROTATION.some((u) => /1rpc/.test(u))).toBe(true)
})

test("PLANE-RPC — source-honest: the ACTUAL RPC that answered is recorded per read (the first live provider wins)", async () => {
  const fetchRpc = async (url: string) => `answer-from-${url}`
  const read = await PlaneRpcState.read("eth_blockNumber", [], fetchRpc)
  expect(read).not.toBeNull()
  expect(read!.source).toBe(PlaneRpcState.ROTATION[0]) // the first provider answered → it is the recorded source
  expect(read!.value).toBe(`answer-from-${PlaneRpcState.ROTATION[0]}`)
  expect(read!.tried).toEqual([PlaneRpcState.ROTATION[0]])
})

test("PLANE-RPC — a dead provider ROTATES honestly to the next; the recorded source is the one that actually answered (degrade-never-crash)", async () => {
  const dead = new Set([PlaneRpcState.ROTATION[0], PlaneRpcState.ROTATION[1]])
  const fetchRpc = async (url: string) => { if (dead.has(url)) throw new Error(`${url} down`); return `ok-${url}` }
  const read = await PlaneRpcState.read("eth_chainId", [], fetchRpc)
  expect(read).not.toBeNull()
  expect(read!.source).toBe(PlaneRpcState.ROTATION[2]) // the third answered — the true source, honestly recorded
  expect(read!.tried).toEqual([PlaneRpcState.ROTATION[0], PlaneRpcState.ROTATION[1], PlaneRpcState.ROTATION[2]]) // the dead ones are named in `tried`
})

test("PLANE-RPC — ALL providers dead → null (SAMPLE/UNVERIFIED), NEVER a fabricated state, NEVER a crash", async () => {
  const read = await PlaneRpcState.read("eth_blockNumber", [], async (url) => { throw new Error(`${url} down`) })
  expect(read).toBeNull() // every provider dead → null, honest — the caller renders SAMPLE, never a fabricated block
})

test("PLANE-RPC — a non-answer (undefined) rotates too (a null-as-value is never stamped as a real state)", async () => {
  let calls = 0
  const fetchRpc = async (url: string): Promise<string> => { calls++; return (url === PlaneRpcState.ROTATION[0] ? (undefined as unknown as string) : `ok-${url}`) }
  const read = await PlaneRpcState.read("eth_blockNumber", [], fetchRpc)
  expect(read!.source).toBe(PlaneRpcState.ROTATION[1]) // the undefined non-answer rotated past
  expect(calls).toBeGreaterThanOrEqual(2)
})

test("PLANE-RPC — the LIVE probe (if present) is REAL + source-honest: the recorded source is IN the rotation, `tried` is a rotation prefix, the block is a real number", () => {
  const rel = "data/honesty/plane-rpcstate-probe.json"
  if (!existsSync(path.join(PKG_ROOT, rel))) { console.log("  (plane_rpcstate) live probe absent (offline capture) — the hermetic rotation is the gate"); return }
  const p = JSON.parse(readFileSync(path.join(PKG_ROOT, rel), "utf8"))
  expect(PlaneRpcState.ROTATION).toContain(p.source) // the actual source is one of the pinned rotation
  // `tried` is a genuine prefix of the rotation, ending at the source that answered (the rotation order is honest)
  expect(p.tried[p.tried.length - 1]).toBe(p.source)
  for (let i = 0; i < p.tried.length; i++) expect(p.tried[i]).toBe(PlaneRpcState.ROTATION[i])
  expect(p.method).toBe("eth_blockNumber")
  expect(typeof p.blockNumber).toBe("number")
  expect(p.blockNumber).toBeGreaterThan(0) // a real current-state read, stamped at read time (a freshness signal, not a history claim)
})
