/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 6 (S149 / D72): THE LINEAGE VIEW — *sheds second.*
 *
 * Your manifests in this family, side by side. The thinnest ice in the sprint (A4): a comparison is a ranking with the sort
 * button removed unless it is disciplined hard. So:
 *   · CHRONOLOGICAL, mechanically pinned — a seeded score-ordering FAILS. No aggregate, no "best", no total order.
 *   · each variant carries its OWN independent ternary Stamp (a classification, never an ordering).
 *   · the SEARCH COUNT renders prominently beside them — "you have filed N variants in this family. That is N searches." The
 *     comparison is permitted BECAUSE it carries its own price tag (X-RECKON: each variant is a hypothesis, and a hypothesis
 *     filed is a SEARCH).
 *   · RP-5 (F-5): the copy is PINNED VERBATIM in family-pins.json — NO generated prose, NO LLM phrasing on this surface at
 *     all (the one place the meter is dark is the one place a phrasing model would find the forbidden sentence). It renders a
 *     count and a list. Nothing else.
 *   · a PATH, not a screen — the screen count stays 3.
 *
 * Pure: reads the pinned copy templates. No LLM, no model, no network.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace LineageView {
  export type Stamp = "GO" | "NO-GO" | "INSUFFICIENT" // the independent ternary classification (never an ordering)

  export interface Variant {
    lineageId: string
    filedAt: number // the filing timestamp — the ONLY ordering key (chronological, mechanically pinned)
    stamp: Stamp // this variant's OWN independent verdict
  }

  // the PINNED copy (RP-5) — read from family-pins.json, never generated. A summarization moves the pins sha (a Halt).
  function copy(): { header: string; searchCount: string; perVariant: string; noAggregate: string } {
    const fp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "family-pins.json"), "utf8"))
    return fp.phase6_lineageView.dd60_chronological.copyVerbatim
  }

  export interface View {
    header: string
    searchCountLine: string // "you have filed N variants in this family. That is N searches."
    lines: string[] // chronological — one per variant: "{when} · {stampWord}"
    noAggregateLine: string
    ordering: "CHRONOLOGICAL"
    variantCount: number
    searchCount: number // === variantCount (each variant is a SEARCH under X-RECKON)
  }

  // fill the pinned templates with the count + the chronological list. NO generated prose — every string is a pinned
  // template with {placeholders} substituted (a count and a date, never an LLM sentence).
  export function view(variants: Variant[]): View {
    const c = copy()
    // MECHANICAL chronological ordering — the ONLY sort key is filedAt (ascending). A seeded score-ordering does not happen here.
    const ordered = [...variants].sort((a, b) => a.filedAt - b.filedAt)
    const n = ordered.length
    const plural = (s: string) => (n === 1 ? "" : s)
    const searchCountLine = c.searchCount
      .replace(/\{n\}/g, String(n))
      .replace(/\{s\}/g, plural("s"))
      .replace(/\{es\}/g, plural("es"))
    const lines = ordered.map((v) => c.perVariant.replace("{when}", new Date(v.filedAt).toISOString().slice(0, 10)).replace("{stampWord}", v.stamp))
    return { header: c.header, searchCountLine, lines, noAggregateLine: c.noAggregate, ordering: "CHRONOLOGICAL", variantCount: n, searchCount: n }
  }

  // S149 — the ordering is CHRONOLOGICAL, mechanically. Given the rendered order, is it sorted by filedAt ascending? A
  // seeded score-ordering (by stamp rank / any aggregate) is NOT chronological and FAILS this predicate.
  export function isChronological(orderedVariants: Variant[]): boolean {
    for (let i = 1; i < orderedVariants.length; i++) if (orderedVariants[i].filedAt < orderedVariants[i - 1].filedAt) return false
    return true
  }

  // a seeded ADVERSARIAL ordering (by stamp rank — GO best) that A4 warns about. Used by the wall to prove the view REFUSES it.
  export function seededScoreOrdering(variants: Variant[]): Variant[] {
    const rank: Record<Stamp, number> = { "GO": 0, "INSUFFICIENT": 1, "NO-GO": 2 }
    return [...variants].sort((a, b) => rank[a.stamp] - rank[b.stamp])
  }
}
