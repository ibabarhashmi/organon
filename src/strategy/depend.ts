/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 4: THE SHARED-DEPENDENCY MAP (S159, D77). NO NEW LAW (a fifth sprint).
 *
 * The curator-loss literature's founding sentence — "the losses came not from broken code but from configuration and
 * operational context" — is a statement about SHARED, INVISIBLE DEPENDENCY. ORGΛNON now holds every input: underlyings
 * (pool metadata), admin keys (the governance screen), oracle feeds (V39's latestRoundData capture). Depend.map is a COUNT
 * OVER A JOIN on THREE keys, degrading gracefully — "3 of your 5 positions read the same oracle feed. 4 share the same
 * underlying. 2 answer to the same admin key." PER-KEY COVERAGE IS EMITTED; a key that cannot resolve renders UNJUDGEABLE,
 * never a silent zero. It ranks nothing, weights nothing, suggests nothing, and it NEVER says "diversify".
 *
 * RP-4 (the map's asymmetric confidence): the admin-key join matches ONLY on the RESOLVED TERMINAL AUTHORITY (the eth_call'd
 * admin address). Where the resolution is ambiguous (UNRESOLVED / a proxy / an unverified contract), the position is
 * UNJUDGEABLE for that key — NEVER a match. The map may say "these two DEFINITELY share X"; it may NEVER say "these two
 * DEFINITELY do NOT" — absence of a resolved match is UNJUDGEABLE, not independence. The dangerous dependencies are the
 * invisible ones; claiming an independence you cannot prove is the exact failure the tool exists to prevent.
 *
 * The copy is PINNED VERBATIM in ship-pins (no LLM on this surface); this module fills {n}/{m}/{value} into the pinned
 * templates. A render that deviates FAILS (S159). Pure: reads committed captures (shelf-attributes, governance, oracle-feeds).
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace Depend {
  const H = path.join(PKG_ROOT, "data", "honesty")

  // the PINNED VERBATIM copy (RP-5) — filled, never generated.
  function copy(): Record<string, string> {
    return JSON.parse(readFileSync(path.join(H, "ship-pins.json"), "utf8")).phase4_dependencyMap.copyVerbatim
  }
  const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))

  // normalise a subjectKey to a bare pool uuid (positions may carry "defillama:pool:<uuid>" or just "<uuid>").
  function uuid(subjectKey: string): string {
    const m = subjectKey.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
    return m ? m[1] : subjectKey
  }

  // ── the three resolvers (each returns a value or null; null → UNJUDGEABLE for that key, never a silent zero) ──
  interface Resolved { subjectKey: string; underlying: string | null; adminAuthority: string | null; adminClass: string | null; oracleFeed: string | null }

  function shelf(): { pool: string; asset: string | null }[] {
    return JSON.parse(readFileSync(path.join(H, "shelf-attributes.json"), "utf8")).members.map((m: { pool: string; asset: string | null }) => ({ pool: m.pool, asset: m.asset }))
  }
  // scan the governance captures with a poolKeys array; return each pool's resolved terminal authority (adminAddr) + class.
  function governance(): { pool: string; adminAddr: string | null; adminClass: string | null }[] {
    const out: { pool: string; adminAddr: string | null; adminClass: string | null }[] = []
    for (const f of readdirSync(path.join(H, "governance")).filter((x) => x.endsWith(".json"))) {
      let j: { poolKeys?: string[]; adminAddr?: string | null; adminClass?: string | null }
      try { j = JSON.parse(readFileSync(path.join(H, "governance", f), "utf8")) } catch { continue }
      if (!Array.isArray(j.poolKeys)) continue
      for (const pk of j.poolKeys) out.push({ pool: uuid(pk), adminAddr: j.adminAddr ?? null, adminClass: j.adminClass ?? null })
    }
    return out
  }
  function oracle(): { feeds: Record<string, { aggregator: string }>; coverage: { resolvableOracleFeeds: number; totalPoolUniverse: number } } {
    const j = JSON.parse(readFileSync(path.join(H, "oracle-feeds.json"), "utf8"))
    return { feeds: j.feeds, coverage: j.coverage }
  }

  function resolve(subjectKeys: string[]): { resolved: Resolved[]; shelfWideOracle: { resolvableOracleFeeds: number; totalPoolUniverse: number } } {
    const sh = shelf()
    const gov = governance()
    const orc = oracle()
    const resolved = subjectKeys.map((sk): Resolved => {
      const u = uuid(sk)
      const shelfHit = sh.find((s) => s.pool.startsWith(u) || u.startsWith(s.pool.slice(0, 8)))
      const asset = shelfHit?.asset ?? null
      const govHit = gov.find((g) => g.pool.startsWith(u.slice(0, 8)))
      // RP-4 — the admin key is the RESOLVED terminal authority ONLY; UNRESOLVED / null → null (UNJUDGEABLE, never a match)
      const adminAuthority = govHit && govHit.adminAddr && govHit.adminClass !== "UNRESOLVED" ? govHit.adminAddr : null
      const oracleFeed = asset && orc.feeds[`${asset}/USD`] ? orc.feeds[`${asset}/USD`].aggregator : null
      return { subjectKey: sk, underlying: asset, adminAuthority, adminClass: govHit?.adminClass ?? null, oracleFeed }
    })
    return { resolved, shelfWideOracle: orc.coverage }
  }

  export interface KeyResult {
    key: "underlying" | "adminKey" | "oracle"
    sharedCount: number // the largest group of positions sharing a resolved value (≥ 2), else 0
    sharedValue: string | null
    line: string // rendered from the PINNED copy — either a shared-count line or the coverage/UNJUDGEABLE line
    coverage: { resolved: number; total: number; unjudgeable: number }
  }
  export interface Result {
    positions: number
    header: string
    byUnderlying: KeyResult
    byAdminKey: KeyResult
    byOracle: KeyResult
    rule: string
    shelfWideOracleCoverage: string
  }

  // group the resolved positions by a key's value; the largest group of size ≥ 2 is the "definitely share" claim.
  function largestGroup(values: (string | null)[]): { count: number; value: string | null } {
    const groups = new Map<string, number>()
    for (const v of values) if (v) groups.set(v, (groups.get(v) ?? 0) + 1)
    let best = { count: 0, value: null as string | null }
    for (const [v, c] of groups) if (c > best.count) best = { count: c, value: v }
    return best.count >= 2 ? best : { count: 0, value: null }
  }

  function keyResult(key: KeyResult["key"], values: (string | null)[], m: number, c: Record<string, string>, valueLabel: (v: string) => string, tpl: string, unjReason: string): KeyResult {
    const resolvedN = values.filter((v) => v !== null).length
    const unjudgeable = m - resolvedN
    const grp = largestGroup(values)
    const keyLabel = key === "underlying" ? "underlying asset" : key === "adminKey" ? "admin key" : "oracle feed"
    let line: string
    if (grp.count >= 2) line = fill(tpl, { n: grp.count, m, value: valueLabel(grp.value!) })
    else if (unjudgeable > 0) line = fill(c.unjudgeable, { key: keyLabel, n: unjudgeable, m, reason: unjReason })
    else line = fill(c.singleton, { key: keyLabel })
    return { key, sharedCount: grp.count, sharedValue: grp.value, line, coverage: { resolved: resolvedN, total: m, unjudgeable } }
  }

  // Depend.map(subjectKeys) — a COUNT over a join. Ranks nothing, suggests nothing, never says "diversify".
  export function map(subjectKeys: string[]): Result {
    const c = copy()
    const { resolved, shelfWideOracle } = resolve(subjectKeys)
    const m = resolved.length
    const byUnderlying = keyResult("underlying", resolved.map((r) => r.underlying), m, c, (v) => v, c.byUnderlying, "no captured underlying for these subjects")
    const byAdminKey = keyResult("adminKey", resolved.map((r) => r.adminAuthority), m, c, (v) => `${v.slice(0, 12)}…`, c.byAdminKey, "the terminal authority is UNRESOLVED (a proxy / unverified contract) — never a match (RP-4)")
    const byOracle = keyResult("oracle", resolved.map((r) => r.oracleFeed), m, c, (v) => `${v.slice(0, 12)}…`, c.byOracle, "no captured oracle feed for these assets")
    return {
      positions: m,
      header: c.header,
      byUnderlying,
      byAdminKey,
      byOracle,
      rule: c.rule,
      shelfWideOracleCoverage: `oracle-feed resolution is ${shelfWideOracle.resolvableOracleFeeds}/${shelfWideOracle.totalPoolUniverse} shelf-wide (a PROXY); within THIS manifest, coverage is ${byOracle.coverage.resolved}/${m}. A key that cannot resolve is UNJUDGEABLE, never a silent zero.`,
    }
  }

  // the three rendered lines, in join order — the ONLY strings the map speaks (all from the PINNED copy).
  export function lines(r: Result): string[] {
    return [r.byUnderlying.line, r.byAdminKey.line, r.byOracle.line]
  }

  // speakable in BOTH registers, through the ONE GUARD. Simple: the counts, plain. Pro: the counts + per-key coverage +
  // the shelf-wide oracle proxy. Both are the PINNED copy filled — never generated prose (S159/RP-5).
  export function speak(r: Result, register: "Simple" | "Pro"): string {
    if (register === "Simple") return `${r.header}\n${lines(r).join("\n")}`
    return `${r.header}\n${lines(r).join("\n")}\ncoverage — underlying ${r.byUnderlying.coverage.resolved}/${r.positions} · admin key ${r.byAdminKey.coverage.resolved}/${r.positions} (RESOLVED terminal authority) · oracle ${r.byOracle.coverage.resolved}/${r.positions}. ${r.shelfWideOracleCoverage}`
  }

  // the drawer render (esc'd HTML) — matches the reality.ts axis pattern; no ranking, no ordering affordance.
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  export function render(r: Result): string {
    return `<div class="axis"><b>${esc(r.header)}</b>` + lines(r).map((l) => `<div>${esc(l)}</div>`).join("") + `<div class="muted">${esc(r.shelfWideOracleCoverage)}</div></div>`
  }
}
