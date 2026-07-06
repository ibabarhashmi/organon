/**
 * ORGΛNON STUDIO — the SIX SCREENS (Phase 6; Rules S-EMPTY-OK, S-HONEST-UX; audit A′#10 closed set). Display-only
 * renderers over the surface JSON — they DISPLAY, they never DERIVE a number. Detachable-by-deletion: pure functions
 * that import no core and hold no state; deleting this file leaves the API/TUI whole. A CLOSED set of exactly six; a
 * seventh screen is refused by construction (SCREENS.length === 6), so "just one more for the demo" cannot slip in.
 *
 * The screens the doors open onto: Verdict Card · Rigor Panel (family AND root count) · Breadth Map · Forward Clocks
 * (discontinuities rendered) · Leaderboard (tier-before-performance, empty-of-GO proud) · the rendered Report.
 */
import type { Studio } from "./adjudicate"
import type { StudioSurfaces } from "./surfaces"
import type { Preflight } from "../organon/preflight"
import type { Clocks } from "./clocks"
import { StudioReport } from "./report"

export namespace StudioScreens {
  // 1 — Verdict Card
  export function verdictCard(v: Studio.StudioVerdict): string {
    const banner = v.attestation.synthetic ? "⚠ SYNTHETIC — test fixture · " : ""
    return `${banner}[ VERDICT: ${v.attestation.verdict} ]  tier=${v.attestation.verifiability}/${v.attestation.searchHonesty}  (never a GO unless earned)`
  }

  // 2 — Rigor Panel: family size AND the author's root count in the domain (H-SCOPE — the search is visible)
  export function rigorPanel(v: Studio.StudioVerdict): string {
    const dsr = v.attestation.dsrAtDeclared
    return `RIGOR · family=${v.family.size} · author-roots=${v.rootCount} · deflated-n=${v.familyDeclaredNTrials} · DSR@n=${dsr === null || dsr === undefined ? "n/a" : dsr.toFixed(3)} (bar 0.95)`
  }

  // 3 — Breadth Map (the pre-flight, hedged)
  export function breadthMap(r: Preflight.Result): string {
    return `BREADTH · ${r.label || "panel"} · M_eff=${r.effectiveBreadth.toFixed(2)} · floor=${r.floorEffectivePeriodsNeeded} · ${r.reachable ? "reachable" : "STRUCTURALLY UN-POWERED"} — pending floor audit`
  }

  // 4 — Forward Clocks (a restarted clock's discontinuity is rendered, never hidden — H-CLOCK)
  export function forwardClocks(states: Clocks.ClockState[]): string {
    return "FORWARD CLOCKS\n" + states.map((c) => (c.state === "intact" ? `  ✓ ${c.domain}: intact` : `  ⏱ ${c.domain}: RESTARTED ${c.discontinuity.restartedAt} · prior evidence unverifiable · counting from zero`)).join("\n")
  }

  // 5 — Leaderboard (tier before performance; empty-of-GO is a proud, correct launch state)
  export function leaderboard(b: StudioSurfaces.Board): string {
    const head = `LEADERBOARD · ${b.emptyOfGo ? "EMPTY OF GO (correct launch state)" : `${b.goCount} GO`}`
    // K-LEGIBLE (Ensemble): each row shows the n its bar was deflated against (its author-roots — the search accounted
    // for); a higher n is a harder bar. Display-only; a NEUTRAL note, no shaming, no rankings-by-virtue.
    const rows = b.rows.map((r, i) => `  ${i + 1}. ${r.id} — ${r.attestation.verdict}/${r.attestation.verifiability}${r.synthetic ? " (SYNTHETIC)" : ""} · roots=${r.rootCount ?? "?"} · bar set at n=${r.rootCount ?? "?"} (deflation basis)`)
    return [head, ...rows, "  deflation basis: a higher n means a harder bar (more search was accounted for) — compare two rows only at equal n; this states how hard each bar was set, it is not a judgement."].join("\n")
  }

  // 6 — the rendered Report (delegates to the honest renderer; display-only). The PRO-DISCLOSURE toggle (Spine Phase 1,
  // R-ADVISORY, A′#8) is an EXTENSION of this existing screen, NOT a ninth: when `pro` is on and a pre-rendered
  // disclosure is supplied (the caller computes it via Breadth.proDisclosure — a pure formatter that derives nothing),
  // the raw panels (IC/BR/TC · DSR/PBO · CPCV-when-present) are appended. Toggling changes VISIBILITY, never a value.
  export function report(v: Studio.StudioVerdict, opts?: { pro?: boolean; disclosure?: string | null }): string {
    return StudioReport.render(v) + proToggle(opts?.disclosure ?? null, opts?.pro ?? false)
  }

  // the toggle itself — a pure visibility switch. OFF (or no disclosure) shows nothing new; ON reveals the ALREADY-
  // COMPUTED disclosure verbatim. It DERIVES NOTHING and adds no screen (SCREENS stays 8). This is progressive
  // disclosure over one shared representation: the non-expert reads the report; the pro flips this to see the raw panels.
  export function proToggle(disclosure: string | null, pro: boolean): string {
    return pro && disclosure ? "\n\n" + disclosure : ""
  }

  // 7 — the TRUST PANEL (Convergence: the set is amended once six → SEVEN, then closed). The system's honesty rendered
  // as a screen: walls status, clock stamp-ages + gaps, ledger head hash, battery state, parks count, independence
  // state. Display-only like its siblings — it DISPLAYS the raw state assembled by the caller, it DERIVES nothing (a
  // panel that computed its own "green" could flatter; it must only mirror raw sources — a mirror that flatters is an
  // INTEGRITY issue, caught by cross-checking the panel against those sources, C-TENSE).
  export interface TrustState {
    walls: { green: number; total: number }
    clocks: { render: string }[] // each already-rendered by Capture.status (includes GAP + origin)
    ledgerHead: string
    battery: { pass: number; fail: number; files: number; scope: string }
    inventory: { anchor: string; capabilities: number; regressions: number }
    parks: { count: number; ids: string[] }
    independence: string // "PENDING — no non-author has acted (L-2P)" until a genuine stranger does
    matrix?: string // pre-rendered CAPABILITY MATRIX (Matrix.renderPanel()) — advertised == actual (F-IDENTITY); display-only
  }
  export function trustPanel(s: TrustState): string {
    const wallLine = `walls: ${s.walls.green}/${s.walls.total} green`
    const clockLines = s.clocks.map((c) => `    ${c.render}`)
    return [
      "TRUST PANEL — the system's honesty, rendered (display-only; mirrors raw sources)",
      `  ${wallLine}`,
      `  clocks:`,
      ...clockLines,
      `  ledger head: ${s.ledgerHead.slice(0, 16)}…`,
      `  battery (${s.battery.scope}): ${s.battery.pass} pass / ${s.battery.fail} fail across ${s.battery.files} files`,
      `  capability floor: ${s.inventory.capabilities} capabilities, anchor ${s.inventory.anchor.slice(0, 12)}…, regressions=${s.inventory.regressions}`,
      ...(s.matrix ? [s.matrix] : []),
      `  parks: ${s.parks.count}${s.parks.count ? ` (${s.parks.ids.join(", ")})` : ""}`,
      `  independence: ${s.independence}`,
    ].join("\n")
  }

  // 8 — the GOAL CONSOLE (End-User ratification: the closed set amended SEVEN → EIGHT, once, explicitly, then closed
  // again — E-CONSOLE). The one interactive door: a person types a plain-English goal, the free-model agent path
  // proposes a strategy, the frozen core adjudicates it on REAL data, and this screen shows the verdict card + the
  // plain-language report + the enroll action. Display-only like its siblings: it FRAMES the goal + a PRE-RENDERED
  // result (Console.renderResult) — it collects input and renders the API response VERBATIM, it DERIVES nothing, it
  // imports no core (the joined-loop engine lives in console.ts). The verdict it shows is the core's, untouched.
  export function goalConsole(state: { goal: string | null; resultRender: string | null }): string {
    const L = ["GOAL CONSOLE — type a plain-English goal; the system proposes a strategy, runs it on real data, and shows the honest verdict."]
    L.push(`  [ your goal: ${state.goal ?? "(none yet — e.g. 'Earn steady stablecoin lending carry with honest costs')"} ]`)
    if (!state.resultRender) L.push("  (submit a goal to see a verdict card + the plain-language report)")
    else L.push("", ...state.resultRender.split("\n").map((x) => "  " + x))
    return L.join("\n")
  }

  // 9 — the GUIDED BUILDER (Reachability: the closed set amended EIGHT → NINE, once, explicitly, then closed again —
  // U-AMEND). The missing middle door: compose the spec yourself, field by field, understanding each choice — over the
  // same representation the presets click and the goals generate. Display-only like its siblings: it FRAMES the field
  // schema (Builder.FIELDS) + a PRE-RENDERED result (Console.renderResult) — it collects input and renders the API
  // response VERBATIM, it DERIVES NOTHING (validation comes from the same schema the API enforces). Born under U-SURFACE.
  export function guidedBuilder(state: { fields: { label: string; help: string; options?: string[] }[]; resultRender: string | null }): string {
    const L = ["GUIDED BUILDER — compose a strategy yourself, field by field. Conservative defaults; nothing primes toward risk or a GO; editing + resubmitting counts as another attempt (the bar stiffens)."]
    for (const f of state.fields) L.push(`  • ${f.label}${f.options ? ` [${f.options.join(" / ")}]` : ""}\n      ${f.help}`)
    if (!state.resultRender) L.push("  (compose a valid spec and submit to see a verdict card + the plain-language report + the 'why not yet · when' panels)")
    else L.push("", ...state.resultRender.split("\n").map((x) => "  " + x))
    return L.join("\n")
  }

  // 10 — the POOL COMPOSER (Ensemble: the closed set amended NINE → TEN, once, explicitly, then closed again —
  // U-AMEND-2). The park protocol's first delivered capability: compose a depth-1 pool of adjudicated member strategies;
  // the pool registers as a trial at the union's K_eff charge; the frozen core adjudicates the pooled series. Display-only
  // like its siblings: it FRAMES the composition + a PRE-RENDERED pool result (Console.runComposedPool) — it derives
  // NOTHING (the K_eff, the charge, the verdict are the analytics/core's). Every pool report carries the mandatory stress
  // caveat + the legible deflation basis (n · scoping · a neutral comparability note). K_eff≈1 renders "adds nothing".
  export function poolComposer(state: { resultRender: string | null }): string {
    const L = ["POOL COMPOSER — pool a portfolio of adjudicated strategies. The pool pays the UNION's bill: it is charged at the effective number of INDEPENDENT members (K_eff), not the raw count — the only way to look diversified is to be diversified. Editing the pool (swapping a member) counts as another attempt; the bar stiffens. Every pool carries its stress caveat and the n it was tested against."]
    if (!state.resultRender) L.push("  (compose a pool of ≥2 member strategies and submit to see a verdict + K_eff + the union family + the stress caveat + the legible deflation basis)")
    else L.push("", ...state.resultRender.split("\n").map((x) => "  " + x))
    return L.join("\n")
  }

  // the CLOSED set — amended SIX→SEVEN (Trust Panel), SEVEN→EIGHT (Goal Console), EIGHT→NINE (Guided Builder, U-AMEND),
  // then NINE→TEN (Pool Composer, U-AMEND-2), each once and closed again. An eleventh entry is refused by construction
  // (SCREENS.length === 10); "just one more for the demo" cannot slip in (A′#5/#11). The sin was never amendment — it was silence.
  export const SCREENS = ["verdictCard", "rigorPanel", "breadthMap", "forwardClocks", "leaderboard", "report", "trustPanel", "goalConsole", "guidedBuilder", "poolComposer"] as const
}
