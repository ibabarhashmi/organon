/**
 * ORGΛNON SOVEREIGN PLANE — RPC-STATE (Sovereign Spine B, path 3; X-PLANE a,b). Current-state reads over a PINNED
 * rotation of FREE public RPCs — the freshness layer + the honest fallback when a provider dies. Load-bearing:
 *   (a) NARROW + PINNED — exactly the pinned rotation {llamarpc, ankr, publicnode, 1rpc}; a fourth is a re-pin.
 *   (b) SOURCE-HONEST, DEGRADE-NEVER-CRASH — try each RPC in turn; the ACTUAL RPC that answered is RECORDED per read; a
 *       dead provider ROTATES honestly to the next; if ALL are dead → null (SAMPLE/UNVERIFIED), NEVER a fabricated state.
 * Plain fetch via an injectable seam (no SDK) → hermetic tests. A current-state read is a freshness signal, never a
 * history claim (no retro-capture; the state is stamped at read time).
 */
export namespace PlaneRpcState {
  // X-PLANE(a): the PINNED free public RPC rotation — a fourth endpoint is a conscious re-pin.
  export const ROTATION: readonly string[] = [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://ethereum.publicnode.com",
    "https://1rpc.io/eth",
  ] as const

  export interface StateRead { value: string; source: string; tried: string[] }

  // a current-state read over the rotation (X-PLANE b): try each RPC in turn; the FIRST that answers wins and its URL is
  // recorded as `source` (source-honest); a throwing/failed provider is skipped (rotated past), its URL kept in `tried`.
  // ALL dead → null (the caller renders SAMPLE/UNVERIFIED) — never a fabricated state, never a crash.
  export async function read(
    method: string,
    params: unknown[],
    fetchRpc: (url: string, method: string, params: unknown[]) => Promise<string>,
    rotation: readonly string[] = ROTATION,
  ): Promise<StateRead | null> {
    const tried: string[] = []
    for (const url of rotation) {
      tried.push(url)
      try {
        const value = await fetchRpc(url, method, params)
        if (value === null || value === undefined) continue // a non-answer rotates too (never a fabricated null-as-value)
        return { value, source: url, tried } // the ACTUAL source that answered, recorded per read
      } catch {
        // a dead provider rotates honestly to the next
      }
    }
    return null // every provider dead → null (honest), never a fabricated state
  }

  // a plain-fetch JSON-RPC seam (no SDK) — the default live fetcher; the tests inject a fixture fetcher.
  export async function jsonRpc(url: string, method: string, params: unknown[], timeoutMs = 8000): Promise<string> {
    const ctl = new AbortController()
    const to = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal })
      if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
      const body = (await res.json()) as { result?: string; error?: unknown }
      if (body.error || body.result === undefined) throw new Error(`${url} → rpc error`)
      return body.result
    } finally {
      clearTimeout(to)
    }
  }
}
