/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 6 (DD-92, D90, S196): THE CONTAGION SCORE — the moat's THIRD stone.
 *
 * The curator-loss literature's whole finding — "the losses came not from broken code but from SHARED, INVISIBLE DEPENDENCY" —
 * computed over the Operator's OWN manifests. V40's Depend.map holds the join (underlyings, admin keys, oracle feeds); this
 * turns it into a SCORE: the MAX shared count per dependency class ("your largest single-oracle exposure is 3 of 5 positions")
 * PLUS the per-class breakdown (RP-5: the shape resists collapse into a scalar). It is a COUNT OVER A JOIN — it ranks nothing,
 * weights nothing, and NEVER says "diversify" (each advisory phrasing is a seeded negative — S196). UNJUDGEABLE for any
 * dependency the map cannot resolve (V40's discipline: unresolved authority is NEVER "independent"). The copy is PINNED VERBATIM
 * in reckoning-pins (no LLM on this surface); this module fills {n}/{m}/{class}/{breakdown} into the pinned templates. A render
 * that deviates, or that contains an advisory token, FAILS (S196).
 *
 * Pure: reads Depend.groups (committed captures) + the pinned copy. No network, no model.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Depend } from "./depend"
import { Guard } from "../organon/guard"

export namespace Contagion {
  const H = path.join(PKG_ROOT, "data", "honesty")

  interface Copy { header: string; maxLine: string; classLine: string; unjudgeable: string; none: string; rule: string }
  // the PINNED VERBATIM copy (DD-92) — filled, never generated.
  function copy(): Copy {
    return JSON.parse(readFileSync(path.join(H, "reckoning-pins.json"), "utf8")).delegatedDecisions.DD92.copyPinnedVerbatim as Copy
  }
  // the pinned seeded-advisory blocklist (S196) — a rendered line containing any of these FAILS.
  export function advisoryTokens(): string[] {
    return JSON.parse(readFileSync(path.join(H, "reckoning-pins.json"), "utf8")).delegatedDecisions.DD92.seededAdvisoryNegatives as string[]
  }
  const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
  const classLabel = (key: string) => (key === "underlying" ? "underlying asset" : key === "adminKey" ? "admin key" : "oracle feed")
  const shortVal = (key: string, v: string) => (key === "underlying" ? v : `${v.slice(0, 12)}…`)

  export interface ClassScore {
    key: "underlying" | "adminKey" | "oracle"
    label: string
    maxShared: number // the largest group of positions sharing a resolved value (≥ 2), else 0
    maxValue: string | null
    breakdown: { value: string; count: number }[] // RP-5 — every shared group, not just the max
    resolved: number
    total: number
    unjudgeable: number // positions that could not be resolved to a terminal value (never counted as independent)
    line: string // the PINNED copy, filled
  }
  export interface Score {
    positions: number
    header: string
    byClass: { underlying: ClassScore; adminKey: ClassScore; oracle: ClassScore }
    maxShared: number // the contagion score — the max shared count across all classes
    maxClass: string | null
    maxLine: string // "your largest shared exposure is {n} of {m} positions through the same {class}"
    judgeable: true
    rule: string
  }
  export type Result = Score | { judgeable: false; positions: number; reason: string }

  function classScore(c: Copy, b: Depend.ClassBreakdown, m: number): ClassScore {
    const label = classLabel(b.key)
    let line: string
    if (b.groups.length > 0) {
      const breakdown = b.groups.map((g) => `${shortVal(b.key, g.value)} (${g.count} of ${m})`).join(", ")
      line = fill(c.classLine, { class: label, breakdown })
    } else if (b.unjudgeable > 0) {
      line = fill(c.unjudgeable, { class: label, n: b.unjudgeable, m })
    } else {
      line = fill(c.none, { class: label })
    }
    return { key: b.key, label, maxShared: b.maxShared, maxValue: b.maxValue, breakdown: b.groups.map((g) => ({ value: g.value, count: g.count })), resolved: b.resolved, total: m, unjudgeable: b.unjudgeable, line }
  }

  // Contagion.score(subjectKeys) — the max shared count per class + the per-class breakdown. A COUNT; never counsel.
  // UNJUDGEABLE when fewer than two positions exist (no shared fate is possible below two positions).
  export function score(subjectKeys: string[]): Result {
    const g = Depend.groups(subjectKeys)
    const m = g.positions
    if (m < 2) return { judgeable: false, positions: m, reason: `fewer than two positions (${m}) — a shared-dependency count needs at least two positions to compare; UNJUDGEABLE (never "independent")` }
    const c = copy()
    const byClass = { underlying: classScore(c, g.underlying, m), adminKey: classScore(c, g.adminKey, m), oracle: classScore(c, g.oracle, m) }
    const classes = [byClass.underlying, byClass.adminKey, byClass.oracle]
    const maxCls = classes.reduce((best, cur) => (cur.maxShared > best.maxShared ? cur : best), classes[0])
    const maxShared = maxCls.maxShared
    const maxClass = maxShared >= 2 ? maxCls.label : null
    const maxLine = maxShared >= 2 ? fill(c.maxLine, { n: maxShared, m, class: maxCls.label }) : `No two positions share a resolved dependency across ${m} positions (every resolved value is held by a single position).`
    return { positions: m, header: c.header, byClass, maxShared, maxClass, maxLine, judgeable: true, rule: c.rule }
  }

  // the rendered lines, in class order — the ONLY strings the score speaks (all from the PINNED copy). header · maxLine · 3 class lines · rule.
  export function lines(s: Score): string[] {
    return [s.header, s.maxLine, s.byClass.underlying.line, s.byClass.adminKey.line, s.byClass.oracle.line, s.rule]
  }

  // ── S196 — THE ADVISORY GUARD. A rendered contagion line must be a COUNT, never counsel. A line containing any pinned
  // advisory token (diversify/reduce/too concentrated/imperative/comparative) FAILS. The copy is PINNED, so real renders never
  // trip it; the wall seeds an advisory phrasing and proves it is REFUSED (the curator-loss fact is named, never prescribed). ──
  export function checkAdvisory(text: string): { ok: boolean; violations: string[] } {
    const lc = text.toLowerCase()
    const violations = advisoryTokens().filter((t) => lc.includes(t.toLowerCase()))
    return { ok: violations.length === 0, violations }
  }
  // ── S196 (DD-92) — THE MUTATION CATALOGUE, EXTENDED TO THIS SURFACE + THE GUARD RE-MEASURED. Representative contagion-
  // advisory sentences (each embedding a pinned advisory token — the extended catalogue is reckoning-pins.DD92.
  // seededAdvisoryNegatives) are run through BOTH guards. GROUND TRUTH refined the blueprint's "the 10/17 guard now covers
  // this surface": the GLOBAL advice guard (AdviceShape ∪ VoiceGates) catches only the imperative shapes; the DEDICATED
  // contagion token guard (checkAdvisory, the surface's own pinned-copy defense) catches ALL of them. So the surface IS
  // covered — by its dedicated guard — and the global guardEfficacy stays 10/17 (a V41 historical value that must NOT drift).
  const MUTATION_SENTENCES = [
    "you should diversify across more oracle feeds",
    "reduce your shared-underlying exposure",
    "this set is too concentrated in one admin key",
    "consider rebalancing away from the shared feed",
    "spread your positions across more underlyings",
    "de-risk the shared-feed exposure",
    "a safer set would share fewer oracles",
    "your set is riskier than a diversified one",
    "you are more concentrated than is prudent",
  ]
  export interface GuardRate {
    seeded: number
    caughtByContagionGuard: number // the DEDICATED token guard (checkAdvisory) — the surface's own defense
    caughtByGlobalAdviceGuard: number // the ONE GUARD (advice) — PARTIAL on this surface (an honest lower bound)
    contagionRate: string
    globalRate: string
    complete: boolean // the dedicated guard catches EVERY seeded advisory sentence (the surface is covered)
    note: string
  }
  export function mutationRate(): GuardRate {
    const seeded = MUTATION_SENTENCES.length
    const caughtByContagionGuard = MUTATION_SENTENCES.filter((m) => !checkAdvisory(m).ok).length
    const caughtByGlobalAdviceGuard = MUTATION_SENTENCES.filter((m) => Guard.classify(m).caughtByAdviceGuard).length
    return {
      seeded, caughtByContagionGuard, caughtByGlobalAdviceGuard,
      contagionRate: `${caughtByContagionGuard}/${seeded}`,
      globalRate: `${caughtByGlobalAdviceGuard}/${seeded}`,
      complete: caughtByContagionGuard === seeded,
      note: `the contagion surface is protected by its DEDICATED pinned-copy token guard (${caughtByContagionGuard}/${seeded} — complete), NOT by the global advice guard alone (${caughtByGlobalAdviceGuard}/${seeded} — it catches only the imperative shapes; the declarative/comparative contagion phrasings are covered by the dedicated guard, defense in depth). The global guardEfficacy 10/17 is UNCHANGED (a V41 historical value; extending the global catalogue would drift the meaning across sprints). The copy is PINNED VERBATIM, so a real render can never carry an advisory phrasing — the guard defends a future edit.`,
    }
  }

  // the score's DATA-DRIVEN lines (header + maxLine + the 3 class lines) must ALL pass the advisory guard (S196). The pinned
  // `rule` disclaimer is EXCLUDED — it deliberately NAMES the anti-patterns ("no ranking, no 'diversify', no 'reduce'") to
  // disclaim them; a guard that flagged its own disclaimer for mentioning what it forbids is the comment-mention false-positive
  // (the V26 allowlist lesson). The disclaimer is a pinned constant; the risk the guard defends is a FILLED line turned advisory.
  export function advisoryClean(s: Score): { ok: boolean; violations: string[] } {
    const checkable = [s.header, s.maxLine, s.byClass.underlying.line, s.byClass.adminKey.line, s.byClass.oracle.line]
    const all = checkable.flatMap((l) => checkAdvisory(l).violations)
    return { ok: all.length === 0, violations: [...new Set(all)] }
  }

  // speakable in BOTH registers, through the ONE GUARD. Simple: the header + maxLine + class lines. Pro: + coverage. Both PINNED.
  export function speak(s: Score, register: "Simple" | "Pro"): string {
    if (register === "Simple") return [s.header, s.maxLine, s.byClass.underlying.line, s.byClass.adminKey.line, s.byClass.oracle.line].join("\n")
    const cov = `coverage — underlying ${s.byClass.underlying.resolved}/${s.positions} · admin key ${s.byClass.adminKey.resolved}/${s.positions} (RESOLVED terminal authority) · oracle ${s.byClass.oracle.resolved}/${s.positions}. A key that cannot resolve is UNJUDGEABLE, never a silent zero.`
    return [...lines(s), cov].join("\n")
  }

  // the drawer render (esc'd HTML) — matches the depend/reality axis pattern; no ranking, no ordering affordance.
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  export function render(s: Score): string {
    return `<div class="axis"><b>${esc(s.header)}</b><div class="num">${esc(s.maxLine)}</div>` + [s.byClass.underlying.line, s.byClass.adminKey.line, s.byClass.oracle.line].map((l) => `<div>${esc(l)}</div>`).join("") + `<div class="muted">${esc(s.rule)}</div></div>`
  }
}
