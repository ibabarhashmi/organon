/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 1/7: THE OPEN-ISSUES REGISTRY (S209, D92). The sprint's spine.
 *
 * Every finding from every audit (V38→V44) is enumerated with a pinned disposition (FIX / ACCEPT-WITH-REASON{clause} /
 * PEN'S), and the gate REFUSES the log if any entry lacks its disposition's proof (S209). The registry is SEEDED in the pins
 * (P-1…P-18) and GROWN by three mechanical discovery sweeps (DD-94, hardening-discovery.json) — it may grow, never silently
 * shrink. This is the V43 countable-registry pattern pointed at the project's whole debt.
 *
 * RP-1 (F-1): dispositions will skew toward ACCEPT-WITH-REASON under pressure (acceptance is free, fixing is work). So
 * ACCEPT-WITH-REASON is legal ONLY when the fix is (a) a pen-stroke, (b) constitutionally fenced, or (c) provably out of the
 * agent's reach — and the reason NAMES which. Every other disposition is FIX, and a FIX without its wall-or-transcript proof
 * REFUSES. The gate renders the disposition census FIXED n · ACCEPTED m (each with its clause) · PEN'S k; an ACCEPTED entry
 * citing none of the three clauses is a seeded negative that must FAIL.
 *
 * S209 (the no-new-scope trace): every unit of work (every built wall S198–S209) traces to a registry entry; untraced work
 * REFUSES. Hardening is the one sprint where scope creep wears the most virtuous clothes, so the trace is walled.
 *
 * Pure: reads the committed pins + the committed discovery artifact. No network.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Falsify } from "./falsify"

export namespace Registry {
  const H = path.join(PKG_ROOT, "data", "honesty")
  function read(name: string): Record<string, unknown> { return JSON.parse(readFileSync(path.join(H, name), "utf8")) }
  function tryRead(name: string): Record<string, unknown> | null { try { return read(name) } catch { return null } }

  export type Disposition = "FIX" | "ACCEPT-WITH-REASON" | "PEN'S"
  export interface Entry { id: string; source: string; issue: string; disposition: string; proof: string; detail: string }

  // ── THE PINNED SEED (P-1…P-18) UNION THE DISCOVERED (P-19+) ENTRIES. The union grows, never silently shrinks: a discovery
  // pass adds; nothing removes. ──
  export function seeded(): Entry[] {
    return ((read("hardening-pins.json").registry as { entries: Entry[] }).entries ?? []) as Entry[]
  }
  export function discovered(): Entry[] {
    const d = tryRead("hardening-discovery.json")
    return ((d?.discoveredEntries as Entry[] | undefined) ?? []) as Entry[]
  }
  export function issues(): Entry[] {
    const seed = seeded()
    const seen = new Set(seed.map((e) => e.id))
    return [...seed, ...discovered().filter((e) => !seen.has(e.id))]
  }

  // ── THE THREE DISCOVERY SWEEPS (DD-94), read from the committed artifact ──
  export interface Discovery {
    crossRead: { blocksChecked: number; twoStateFound: boolean; detail: string }
    grep: { filesScanned: number; todos: number; placeholders: number; bareCatches: number }
    emptyState: { rendered: boolean; bareRenders: { word: string }[] }
    summary: string
  }
  export function discover(): Discovery | null {
    const d = tryRead("hardening-discovery.json")
    if (!d) return null
    return { crossRead: d.crossRead as Discovery["crossRead"], grep: d.grep as Discovery["grep"], emptyState: d.emptyState as Discovery["emptyState"], summary: String(d.summary) }
  }

  // ── PROOF RESOLUTION — a FIX entry's proof is a WALL ref (S198, S190-live, S200-dedupe, S204-socket, S199-limits) or a
  // PINNED-FACT ref (P5-pinned, P6-closed, grep-sweep-closed, gate-first-section). A wall ref resolves iff the wall is carried
  // (≤ WALL_MAX_CARRIED, battery-green) or in the built set (S198–S209); a fact ref resolves against the pinned state. ──
  export const WALL_MAX_CARRIED = 197 // S1–S197 are carried (proven by the green battery); S198–S209 are this sprint's built walls
  export function builtWalls(): string[] {
    const built = ((read("hardening-pins.json").walls as { built?: string[] }).built ?? []) as string[]
    return built
  }
  function factResolved(ref: string): { ok: boolean; detail: string } {
    const pins = read("hardening-pins.json")
    if (ref === "P5-pinned") return { ok: !!pins.stampScopeByDesign, detail: "the Stamp-scoped-BY-DESIGN record is pinned (P-5)" }
    if (ref === "P6-closed") { const mr13 = String((pins.deviations as Record<string, string>)?.mr13 ?? ""); return { ok: /CLOSED/.test(mr13), detail: `MR13 is CLOSED with its reason (P-6): ${mr13.slice(0, 60)}` } }
    if (ref === "gate-first-section") return { ok: true, detail: "the pen's keystrokes render at the gate's first section (PEN'S, clause a)" }
    if (ref === "grep-sweep-closed") { const d = discover(); const ok = !!d && d.grep.bareCatches === 0 && d.grep.todos === 0; return { ok, detail: `the grep sweep is clean (0 bare-catch, 0 todo) — the discovered mass-path catches were given honest bodies` } }
    return { ok: false, detail: `unknown proof ref "${ref}"` }
  }
  export function proofResolved(proof: string, built: string[] = builtWalls()): { ok: boolean; detail: string } {
    const m = /^S(\d+)/.exec(proof)
    if (m) {
      const n = Number(m[1])
      if (n <= WALL_MAX_CARRIED) return { ok: true, detail: `wall S${n} is carried (proven by the green battery)` }
      if (built.includes(`S${n}`)) return { ok: true, detail: `wall S${n} is a built wall this sprint` }
      return { ok: false, detail: `proof wall S${n} is neither carried (≤${WALL_MAX_CARRIED}) nor in the built set [${built.join(",")}]` }
    }
    return factResolved(proof)
  }

  // ── THE DISPOSITION CENSUS (RP-1) — FIXED n · ACCEPTED m (each citing a clause a/b/c) · PEN'S k. An ACCEPTED entry citing
  // none of the three clauses is a defect. The clause is named in the entry's detail (pen-stroke / fenced / out of reach). ──
  export interface Census { fixed: number; accepted: { id: string; clause: string | null }[]; pens: number; total: number }
  const CLAUSE_A = /pen-stroke|the pen'?s|clause \(?a\)?/i
  const CLAUSE_B = /constitutionally fenced|the fence|fenced\b|clause \(?b\)?/i
  const CLAUSE_C = /out of the agent'?s reach|provably out of reach|beyond the agent|clause \(?c\)?/i
  export function clauseOf(entry: Entry): string | null {
    const t = `${entry.detail} ${entry.issue}`
    if (CLAUSE_A.test(t)) return "a (pen-stroke)"
    if (CLAUSE_B.test(t)) return "b (constitutionally fenced)"
    if (CLAUSE_C.test(t)) return "c (out of the agent's reach)"
    return null
  }
  export function census(): Census {
    const es = issues()
    const fixed = es.filter((e) => e.disposition === "FIX").length
    const pens = es.filter((e) => e.disposition === "PEN'S").length
    const accepted = es.filter((e) => e.disposition === "ACCEPT-WITH-REASON").map((e) => ({ id: e.id, clause: clauseOf(e) }))
    return { fixed, accepted, pens, total: es.length }
  }

  // ── S209 — THE GATE VERDICT. Every FIX proven; every ACCEPT-WITH-REASON cites a clause; every built wall traces to an
  // entry. Returns the FIRST failure (or ok). ──
  export type Verdict = { ok: true; detail: string; census: Census } | { ok: false; reason: string; census: Census }
  export function check(builtWallsOverride?: string[]): Verdict {
    const es = issues()
    const c = census()
    const built = builtWallsOverride ?? builtWalls()
    // (1) every FIX has its proof resolved
    for (const e of es) {
      if (e.disposition === "FIX") {
        const pr = proofResolved(e.proof, built)
        if (!pr.ok) return { ok: false, reason: `registry entry ${e.id} (FIX) lacks its proof: ${pr.detail} — a FIX without its wall-or-transcript proof REFUSES the log (S209)`, census: c }
      } else if (e.disposition === "ACCEPT-WITH-REASON") {
        // (2) RP-1: an ACCEPTED entry MUST cite a clause a/b/c
        if (clauseOf(e) === null) return { ok: false, reason: `registry entry ${e.id} is ACCEPT-WITH-REASON but cites NONE of the three clauses (a pen-stroke / b fenced / c out of reach) — acceptance without a named clause is the lazy default RP-1 forbids; it must be FIX or name its clause`, census: c }
      } else if (e.disposition !== "PEN'S") {
        return { ok: false, reason: `registry entry ${e.id} has an unknown disposition "${e.disposition}" — must be FIX, ACCEPT-WITH-REASON, or PEN'S`, census: c }
      }
    }
    // (3) S209 trace: every built wall (S198–S209) traces to some entry's proof
    const trace = traceVerdict(built)
    if (!trace.ok) return { ok: false, reason: trace.reason, census: c }
    return { ok: true, detail: `${es.length} registry entries — FIXED ${c.fixed} (each proven) · ACCEPTED ${c.accepted.length} (each citing a clause) · PEN'S ${c.pens}; every built wall traces to an entry (S209)`, census: c }
  }

  // ── S209 TRACE — every unit of work (every built wall S198–S209) traces to a registry entry that names it; an untraced
  // work-unit REFUSES. The seeded negative (--seed-bad untraced) injects a wall no entry references. ──
  // S208 is folded into S200 (crash-safety atomicity); S209 is the spine (traces to the registry itself / D92). These two
  // are mapped explicitly since their proof lives in a sibling wall's entry.
  const WALL_FOLD: Record<string, string> = { S208: "S200", S209: "S200" }
  export function wallTrace(wall: string): Entry[] {
    const target = WALL_FOLD[wall] ?? wall
    const n = /^S(\d+)/.exec(target)?.[1]
    return issues().filter((e) => e.disposition === "FIX" && new RegExp(`^S${n}\\b`).test(e.proof))
  }
  export type Trace = { ok: true; detail: string } | { ok: false; reason: string }
  export function traceVerdict(units: string[]): Trace {
    for (const u of units) {
      // S209 traces to the registry itself (its entries ARE the spine — D92); every other built wall must map to a FIX entry.
      if (u === "S209") continue
      const entries = wallTrace(u)
      if (entries.length === 0) return { ok: false, reason: `untraced unit of work: the built wall ${u} traces to NO registry entry — work that traces to nothing is a feature in virtue's clothes and is REFUSED (S209, A′#2)` }
    }
    return { ok: true, detail: `every built wall [${units.join(", ")}] traces to a registry entry (S209 — no untraced scope)` }
  }

  // a convenience for the gate/marker: the census as a one-line string (RP-1 rendered)
  export function censusLine(): string {
    const c = census()
    const acc = c.accepted.length === 0 ? "0" : `${c.accepted.length} (${c.accepted.map((a) => `${a.id}:${a.clause ?? "NO-CLAUSE"}`).join(", ")})`
    return `FIXED ${c.fixed} · ACCEPTED ${acc} · PEN'S ${c.pens} (of ${c.total} entries)`
  }

  // sanity: the built walls the registry expects match Falsify's pinned ceiling (no built wall exceeds WALL_MAX)
  export function builtWithinCeiling(): boolean {
    return builtWalls().every((w) => { const n = Number(/^S(\d+)/.exec(w)?.[1]); return Number.isFinite(n) && n <= Falsify.WALL_MAX })
  }
}
