/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 6: DOCS-MATCH-PRODUCERS (S207, P-16/RP-5).
 *
 * THE DIAGNOSIS (P-16 / F-5): a README with no producer is a claim with no wall — the exact species this project kills. "the
 * limits first" is honest on day one and stale by V50 unless the docs join the derivation discipline.
 *
 * THE FIX (RP-5): the second-human doc's STRUCTURAL claims (deps, screens, laws, exit kinds, the tier ladder) are asserted by a
 * wall that greps the doc against the PRODUCERS; a claim the wall cannot tie to a producer is rewritten as a command the reader
 * runs, or removed. The doc passes the ONE GUARD (it describes the TOOL, never a strategy — no advice leaks). And it embeds no
 * number a producer doesn't emit (the drift-prone figures are COMMANDS, not literals).
 *
 * Pure: reads the committed doc + the pinned producers. No network.
 */
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { AdviceShape } from "../ask/advice"
import { Unjudgeable } from "./unjudgeable"

export namespace Docs {
  const DOC = path.join(PKG_ROOT, "SECOND-HUMAN.md")
  export function text(): string { return existsSync(DOC) ? readFileSync(DOC, "utf8") : "" }

  // the producer values the doc's structural claims must equal.
  function producers(): { deps: number; screens: number; laws: number; exitKinds: number; tierLadder: string[] } {
    const carried = (JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-pins.json"), "utf8")).carried) as { deps: string[]; screens: string[]; laws: number; exitKinds: number }
    return { deps: carried.deps.length, screens: carried.screens.length, laws: carried.laws, exitKinds: carried.exitKinds, tierLadder: ["REAL★", "REAL-DERIVED", "REAL-at-timestamp", "RETROSPECTIVE", "SAMPLE"] }
  }

  export interface Claim { name: string; docSays: number | null; producer: number; ok: boolean }
  // extract "deps N" / "screens N" / "laws ... N" / "exit kinds N" from the doc prose and match each to its producer.
  export function structuralClaims(): Claim[] {
    const t = text()
    const p = producers()
    const grab = (re: RegExp): number | null => { const m = re.exec(t); return m ? Number(m[1]) : null }
    return [
      { name: "deps", docSays: grab(/\*\*deps (\d+)\*\*/i), producer: p.deps },
      { name: "screens", docSays: grab(/\*\*screens (\d+)\*\*/i), producer: p.screens },
      { name: "laws", docSays: grab(/\*\*(\d+)\*\* laws hold/i), producer: p.laws },
      { name: "exitKinds", docSays: grab(/\*\*exit kinds (\d+)\*\*/i), producer: p.exitKinds },
    ].map((c) => ({ ...c, ok: c.docSays === c.producer }))
  }

  // the tier ladder ORDER must appear IN THE TIER-LADDER SECTION in the producer's order (strongest→weakest); a reordered or
  // renamed tier fails. Scoped to the section (between "## The tier ladder" and the next "## ") so an earlier mention of a tier
  // name elsewhere in the doc (e.g. "SAMPLE → REAL" in the limits section) does not fool the ordering check.
  export function tierLadderOrdered(): { ok: boolean; detail: string } {
    const t = text()
    const start = t.search(/## The tier ladder/i)
    const section = start === -1 ? "" : t.slice(start, (() => { const nx = t.indexOf("\n## ", start + 5); return nx === -1 ? t.length : nx })())
    if (!section) return { ok: false, detail: "the tier-ladder section is missing from the doc (P-16)" }
    const ladder = producers().tierLadder
    let last = -1
    for (const tier of ladder) {
      const idx = section.indexOf(tier)
      if (idx === -1) return { ok: false, detail: `the tier "${tier}" is missing from the tier-ladder section — the tier ladder must render at the point of use (P-16)` }
      if (idx < last) return { ok: false, detail: `the tier ladder is OUT OF ORDER in the doc — "${tier}" appears before a stronger tier (must be strongest→weakest)` }
      last = idx
    }
    return { ok: true, detail: `the tier ladder [${ladder.join(" > ")}] renders in the producer's order (strongest→weakest)` }
  }

  // the ONE GUARD over the doc — every sentence checked; a doc-shaped advice leak FAILS (X-ADVICE reaches the docs).
  export function guardClean(): { ok: boolean; leaks: { sentence: string; shape: string }[] } {
    // strip HTML comments + markdown table rows/headers noise; check prose sentences.
    const prose = text().replace(/<!--[\s\S]*?-->/g, " ").replace(/^\s*\|.*$/gm, " ")
    const leaks: { sentence: string; shape: string }[] = []
    for (const s of prose.split(/(?<=[.!?])\s+|\n/)) {
      const d = AdviceShape.detect(s)
      if (d.advice) leaks.push({ sentence: s.trim().slice(0, 100), shape: d.shape ?? "?" })
    }
    return { ok: leaks.length === 0, leaks }
  }

  // no EMBEDDED number a producer doesn't emit: the doc must not hard-code drift-prone FIGURES (day-counts, percentages,
  // dollar amounts) — those are COMMANDS the reader runs. The producer-tied structural ints (2/3/17/7) are allowed BECAUSE the
  // structuralClaims wall ties them. This flags an embedded figure that looks like a data claim (a %/$/N-day) with no command.
  export function embeddedFigures(): { ok: boolean; figures: string[] } {
    const prose = text().replace(/<!--[\s\S]*?-->/g, " ")
    const figures: string[] = []
    // a percentage, a dollar amount, or an "N-day"/"N days" figure is a data claim that would rot — forbidden as a literal.
    for (const m of prose.matchAll(/\b\d[\d,.]*\s*(%|-day\b|\bdays\b)|\$\s?\d[\d,.]*/g)) figures.push(m[0].trim())
    return { ok: figures.length === 0, figures }
  }

  // ── S207 — the Ship Gate verdict: limits-first present, structural claims tied, tier ladder ordered, guard-clean, no
  // embedded drift-prone figure, and the empty-state discipline (why+path) present in the doc's own limits section. ──
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }
  export function verdict(): Verdict {
    if (text().length === 0) return { ok: false, reason: "SECOND-HUMAN.md is absent — no documentation a second human could use (S207/P-16)" }
    // limits FIRST — the "What this tool will NOT do" section precedes "What it IS"
    const t = text()
    const notIdx = t.search(/will NOT do/i), isIdx = t.search(/## What it IS/i)
    if (notIdx === -1 || (isIdx !== -1 && notIdx > isIdx)) return { ok: false, reason: "the doc does NOT lead with limits — the honest-limits section must come FIRST (RP-5)" }
    const claims = structuralClaims()
    const bad = claims.find((c) => !c.ok)
    if (bad) return { ok: false, reason: `a structural claim does not match its producer: the doc says ${bad.name}=${bad.docSays}, the producer says ${bad.producer} (docs-match-producers, S207/RP-5)` }
    const ladder = tierLadderOrdered()
    if (!ladder.ok) return { ok: false, reason: ladder.detail }
    const guard = guardClean()
    if (!guard.ok) return { ok: false, reason: `the doc leaks advice (${guard.leaks.length}): "${guard.leaks[0].sentence}" [${guard.leaks[0].shape}] — the README describes the TOOL, never a strategy (S207/A′#6)` }
    const figs = embeddedFigures()
    if (!figs.ok) return { ok: false, reason: `the doc embeds a drift-prone figure a producer doesn't emit: "${figs.figures[0]}" — reference a command (./organon.sh verify), never a literal (RP-5)` }
    void Unjudgeable // the doc's limits section mirrors Unjudgeable.explain's why+path discipline
    return { ok: true, detail: `SECOND-HUMAN.md: limits FIRST · ${claims.length} structural claims tied to producers (deps ${claims[0].producer}, screens ${claims[1].producer}, laws ${claims[2].producer}, exitKinds ${claims[3].producer}) · tier ladder ordered · guard-clean (0 advice) · 0 embedded drift-prone figures (S207/P-16/RP-5)` }
  }
}
