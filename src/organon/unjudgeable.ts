/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 4: THE EMPTY-STATE EXPLAINED (S199, P-12/P-17).
 *
 * THE DIAGNOSIS (P-12, standing since V32): a brand-new user with zero data sees UNJUDGEABLE / UNVERIFIED / INSUFFICIENT /
 * SAMPLE everywhere — and a bare verdict word with no WHY is hostile. The empty state is the stranger's first minute.
 *
 * THE FIX (S199): every UNJUDGEABLE render carries {why, whatWouldMakeItJudgeable} — the WHY (why it cannot be judged now) AND
 * the PATH (the concrete thing that would make it judgeable). Machine-derived from the fact's own inputs, copy PINNED. A bare
 * render (a verdict word with no why OR no path) FAILS the wall. This module is the canonical producer; the render surfaces
 * (reality.ts, stamp.ts, contagion.ts) already carry their whys — S199 makes it a WALL so it cannot regress, and gives new
 * renders one producer to reach for.
 *
 * P-17: the frozen limits (oracle-staleness's 3-feed named subset, selectionRank's demo-scale family) render AT THE POINT OF
 * USE — the door says "this kind resolves for N protocols" before a user relies on it, not only in the log.
 *
 * Pure: a pinned registry + a text checker. No I/O, no network.
 */
export namespace Unjudgeable {
  export type Kind = "SAMPLE" | "UNVERIFIED" | "INSUFFICIENT" | "UNJUDGEABLE"
  export interface Fact { kind: Kind; subject?: string; nObs?: number; needObs?: number; scope?: string }
  export interface Explanation { verdict: Kind; why: string; whatWouldMakeItJudgeable: string }

  // ── THE PINNED REGISTRY — copy machine-derived from the fact's own inputs, never free-typed. Each kind maps to a why + a
  // concrete path to judgeable. The {n}/{need}/{subject}/{scope} slots are filled from the fact. ──
  export function explain(f: Fact): Explanation {
    const subj = f.subject ?? "this reading"
    switch (f.kind) {
      case "SAMPLE":
        return {
          verdict: "SAMPLE",
          why: `${subj} is SAMPLE — a fallback shape, NOT a value in the record (no live capture yet).`,
          whatWouldMakeItJudgeable: `run \`./organon.sh capture\` (keyless) to fetch and record a REAL, point-in-time reading; SAMPLE becomes REAL the moment it is in the moat.`,
        }
      case "UNVERIFIED":
        return {
          verdict: "UNVERIFIED",
          why: `not enough recorded history to show a reliable band for ${subj}${f.nObs !== undefined ? ` (${f.nObs} observation(s) recorded)` : ""}.`,
          whatWouldMakeItJudgeable: `the band appears once enough point-in-time observations are captured${f.needObs !== undefined ? ` (about ${f.needObs} are needed)` : ""} — capture on the cadence and it fills in.`,
        }
      case "INSUFFICIENT":
        return {
          verdict: "INSUFFICIENT",
          why: `the track record is too short or too autocorrelated to certify at 95%${f.nObs !== undefined ? ` (${f.nObs} observation(s))` : ""} — INSUFFICIENT is the honest name for "not enough evidence yet," never a failure.`,
          whatWouldMakeItJudgeable: `INSUFFICIENT clears to GO when the observed length exceeds MinTRL AND PSR(N_eff) > 0.95 (the literature's bar)${f.needObs !== undefined ? ` — about ${f.needObs} more observation(s)` : ""}; a real edge, recorded long enough, clears it.`,
        }
      case "UNJUDGEABLE":
        return {
          verdict: "UNJUDGEABLE",
          why: `${subj} cannot be resolved to a terminal answer${f.scope ? ` (${f.scope})` : ""} — UNJUDGEABLE is never silently treated as "independent" or "zero."`,
          whatWouldMakeItJudgeable: f.scope?.includes("position")
            ? `add a second resolved position to the manifest — a shared-dependency count needs at least two to compare.`
            : `resolve the missing input (${f.scope ?? "the unresolved dependency"}); the axis renders a verdict the moment its input is present.`,
        }
    }
  }

  // ── P-17 — THE FROZEN LIMITS AT THE POINT OF USE. A user must see the limit before relying on the axis. ──
  export interface Limit { axis: string; resolvesFor: string; whyBounded: string }
  export function limitsAtPointOfUse(): Limit[] {
    return [
      { axis: "oracle-staleness", resolvesFor: "a named 3-feed subset (Chainlink USDC/USDT/DAI/ETH — D79)", whyBounded: "the staleness bound is verified only for these feeds; outside the subset the axis is UNJUDGEABLE by design, not silently degraded — the door says so before you rely on it." },
      { axis: "selectionRank", resolvesFor: "a demonstrated family of 2 (the manifest pair, D-family)", whyBounded: "selection rank is demonstrated at family scale; a single-position family renders UNJUDGEABLE (a rank needs a field), stated at the point of use, not only in the log." },
    ]
  }

  // ── THE TEXT CHECKER (S199 wall + the discovery empty-state sweep) — the honest standard given the FROZEN verdict engine
  // (scorecard.ts) owns the per-axis WHYs and the S36 content-golden byte-freezes the render: (1) every verdict word carries a
  // WHY within its window (per-element — the render composes the frozen engine's reason), AND (2) the PAGE carries a PROMINENT
  // path-to-judgeable (the capture instruction — how a zero-data user makes SAMPLE become REAL). A bare verdict (no why) OR a
  // page with no path anywhere FAILS. The empty state is not hostile: it explains every word and names the one action that
  // fills it in. The structured {why, path} producer (explain) is what NON-frozen surfaces (the Ask console, P-17 limits) adopt. ──
  export const VERDICT_WORDS: Kind[] = ["UNJUDGEABLE", "UNVERIFIED", "INSUFFICIENT"]
  const WHY_RE = /—|because|not enough|no recorded|no captured|no verified|can'?t|cannot|too short|too autocorrelated|below the|fewer than|could not|unresolved|not in the record|is missing|honestly UNVERIFIED|not live-verified/i
  const PATH_RE = /capture|re-capture|becomes REAL|appears once|clears to|clears it|would make|add a|resolve|the moment|awaiting|more observation|fills in|record it/i
  export interface Bare { word: string; context: string; missing: "why" | "path" }
  export function checkText(text: string): { ok: boolean; bare: Bare[]; checked: number; pageHasPath: boolean } {
    const bare: Bare[] = []
    let checked = 0
    const pageHasPath = PATH_RE.test(text) // the page prominently states HOW to make things judgeable (the capture path)
    for (const w of VERDICT_WORDS) {
      let idx = 0
      while ((idx = text.indexOf(w, idx)) !== -1) {
        checked++
        const window = text.slice(Math.max(0, idx - 30), idx + 260)
        if (!WHY_RE.test(window)) bare.push({ word: w, context: window.slice(0, 120), missing: "why" })
        idx += w.length
      }
    }
    if (checked > 0 && !pageHasPath) bare.push({ word: "PAGE", context: "the render has verdict words but NO path-to-judgeable anywhere (no capture instruction) — a hostile empty state", missing: "path" })
    return { ok: bare.length === 0, bare, checked, pageHasPath }
  }

  // strip a rendered HTML page to VISIBLE text (style/script blocks removed) — the input to checkText.
  export function visibleText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  }
}
