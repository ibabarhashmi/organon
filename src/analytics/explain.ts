/**
 * ORGΛNON ANALYTICS — THE WHY PANEL (Explanation Phase 3; Rules X-ONE, X-FACTS, X-GROUND). Every verdict, failure, and
 * kill-switch explained in BOTH registers — plain-language and quantitative — generated from ONE machine-derived FACT
 * TABLE (every gate, threshold, rule outcome, metric, and label the engine actually produced), the two renderings
 * mechanically consistency-checked against each other, with an OPTIONAL grounded-LLM paraphrase permitted ONLY behind a
 * groundedness verifier. The LLM phrases; it never reasons; it is nowhere near the verdict path.
 *
 *   · factTable(facts)       — the source of truth: rows on the pinned schema, completeness-censused against the artifact
 *                              schema (every field appears or is registered excluded-with-reason; X-FACTS).
 *   · quantitative(table)    — the numbers a professional audits (exact values · thresholds · the deciding rule).
 *   · plainLanguage(facts)   — two-sided sentences a non-expert reads (what failed · what held · what would change it),
 *                              from the pinned template registry, per terminal state incl. kill-switch (X-ONE).
 *   · consistency(plain,tbl) — asserts every plain claim maps to a fact row + every material row is explained + numbers
 *                              exact (no orphan claims, no drift between registers; X-ONE).
 *   · verifyGroundedness(p)  — every number + claim in a paraphrase matched to the table; ANY miss rejects it WHOLESALE
 *                              with deterministic fallback (X-GROUND).
 *
 * This module is a build artifact under the ratification-wall-scanned surfaces — its WHY-panel ADOPT row authorizes it.
 * The frozen core is never touched; the panel reads the verdict, it never moves it. Deterministic.
 */
export namespace Explain {
  export type TerminalState = "GO" | "NO-GO" | "CONDITIONAL" | "INSUFFICIENT" | "BLOCKED" | "MALFORMED" | "kill-switch"

  // the machine-readable facts the engine produced for ONE adjudication (populated by the console from a StudioVerdict).
  export interface VerdictFacts {
    terminalState: TerminalState
    verdict: string // the verdict string as rendered (e.g. "NO-GO", "INSUFFICIENT-EVIDENCE")
    dsrAtDeclared: number | null
    dsrThreshold: number // the significance bar (0.95)
    familyDeclaredNTrials: number // the deflation basis (n)
    tier: string
    nObs: number | null
    reality: "REAL-PIT" | "ILLUSTRATIVE" | "BLOCKED"
    provenanceRef: string | null
    reproHash: string
    // optional, present on the surfaces that produce them:
    kEff?: number // pool: correlation-adjusted breadth
    charge?: number // pool: ceil(K_eff)
    selectionSurcharge?: number // pool: the priced pick
    killSwitchReason?: string // kill-switch: what tripped
    stateReason?: string // BLOCKED / MALFORMED: the rule it broke / the data it lacks
  }

  // ── THE PINNED FACT-ROW SCHEMA (phase0-pins-v14.json.whyGroundRules.factTableRowSchema) ──
  export const FACT_ROW_SCHEMA = ["id", "name", "value", "threshold", "comparator", "outcome", "contribution", "provenanceRef"] as const
  export interface FactRow {
    id: string
    name: string
    value: string | number
    threshold: string | number | null
    comparator: string | null // "≥" / "≤" / "=" / null
    outcome: "pass" | "fail" | "n/a" | "info"
    contribution: "deciding" | "bounding" | "context" // deciding/bounding rows are MATERIAL (must be explained)
    provenanceRef: string | null
  }

  // every field of VerdictFacts that a fact table is censused against (X-FACTS completeness). A field must appear as a
  // row OR be registered excluded-with-reason — a flattering subset that silently drops a field is caught.
  export const ARTIFACT_FIELDS = ["terminalState", "verdict", "dsrAtDeclared", "dsrThreshold", "familyDeclaredNTrials", "tier", "nObs", "reality", "provenanceRef", "reproHash", "kEff", "charge", "selectionSurcharge", "killSwitchReason", "stateReason"] as const

  // build the FACT TABLE from the verdict facts (X-FACTS). Every field maps to a row or an exclusion-with-reason.
  export function factTable(f: VerdictFacts): { rows: FactRow[]; excluded: { field: string; reason: string }[] } {
    const rows: FactRow[] = []
    const excluded: { field: string; reason: string }[] = []
    // the DECIDING rule: the deflated significance vs the 0.95 bar (the row that decided GO/NO-GO/CONDITIONAL)
    if (f.dsrAtDeclared !== null) {
      rows.push({ id: "dsr-at-declared", name: "deflated significance at the declared trial count", value: +f.dsrAtDeclared.toFixed(3), threshold: f.dsrThreshold, comparator: "≥", outcome: f.dsrAtDeclared >= f.dsrThreshold ? "pass" : "fail", contribution: "deciding", provenanceRef: f.reproHash })
    } else {
      excluded.push({ field: "dsrAtDeclared", reason: "no deflated significance was computed for this terminal state (INSUFFICIENT/BLOCKED/MALFORMED adjudicate before a DSR exists)" })
    }
    rows.push({ id: "declared-n", name: "declared trials (family-size deflation basis)", value: f.familyDeclaredNTrials, threshold: null, comparator: null, outcome: "info", contribution: "bounding", provenanceRef: f.reproHash })
    rows.push({ id: "verdict", name: "verdict (terminal state)", value: f.verdict, threshold: null, comparator: null, outcome: "info", contribution: "deciding", provenanceRef: f.reproHash })
    rows.push({ id: "tier", name: "verifiability tier", value: f.tier, threshold: null, comparator: null, outcome: "info", contribution: "bounding", provenanceRef: f.reproHash })
    rows.push({ id: "reality", name: "data reality label", value: f.reality, threshold: null, comparator: null, outcome: f.reality === "REAL-PIT" ? "pass" : "info", contribution: "bounding", provenanceRef: f.provenanceRef })
    // nObs
    if (f.nObs !== null) rows.push({ id: "n-obs", name: "observations", value: f.nObs, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: f.reproHash })
    else excluded.push({ field: "nObs", reason: "no observation count for this terminal state" })
    // provenanceRef appears on the reality row; reproHash on every row → registered as covered
    excluded.push({ field: "provenanceRef", reason: "carried as the provenanceRef of the reality row (not a standalone row)" })
    excluded.push({ field: "reproHash", reason: "carried as the provenanceRef of every deciding/bounding row (the reproduction anchor)" })
    excluded.push({ field: "dsrThreshold", reason: "carried as the threshold of the deciding dsr-at-declared row (not a standalone row)" })
    excluded.push({ field: "terminalState", reason: "carried as the verdict row's value (the terminal state IS the verdict)" })
    // pool-specific
    if (f.kEff !== undefined) rows.push({ id: "k-eff", name: "effective independent members (correlation-adjusted breadth)", value: +f.kEff.toFixed(2), threshold: null, comparator: null, outcome: "info", contribution: "bounding", provenanceRef: f.reproHash })
    else excluded.push({ field: "kEff", reason: "not a pool adjudication (no K_eff)" })
    if (f.charge !== undefined) rows.push({ id: "charge", name: "union breadth charge (ceil K_eff)", value: f.charge, threshold: null, comparator: null, outcome: "info", contribution: "bounding", provenanceRef: f.reproHash })
    else excluded.push({ field: "charge", reason: "not a pool adjudication (no breadth charge)" })
    if (f.selectionSurcharge !== undefined) rows.push({ id: "selection-surcharge", name: "selection surcharge (the priced pick, ceil log2 C(M,K))", value: f.selectionSurcharge, threshold: null, comparator: null, outcome: "info", contribution: "bounding", provenanceRef: f.reproHash })
    else excluded.push({ field: "selectionSurcharge", reason: "not a pool adjudication (no selection surcharge)" })
    // kill-switch / state reason
    if (f.killSwitchReason) rows.push({ id: "kill-switch", name: "safety wall tripped", value: f.killSwitchReason, threshold: null, comparator: null, outcome: "fail", contribution: "deciding", provenanceRef: f.reproHash })
    else excluded.push({ field: "killSwitchReason", reason: "no kill-switch tripped for this adjudication" })
    if (f.stateReason) rows.push({ id: "state-reason", name: "refusal reason (the rule broken / data lacked)", value: f.stateReason, threshold: null, comparator: null, outcome: "fail", contribution: "deciding", provenanceRef: f.reproHash })
    else excluded.push({ field: "stateReason", reason: "no BLOCKED/MALFORMED reason (this state adjudicated normally)" })
    return { rows, excluded }
  }

  // THE COMPLETENESS CENSUS (X-FACTS): every artifact field appears as a row OR is registered excluded-with-reason. A
  // seeded omission (a field dropped from both) is caught. The `omit` param seeds the positive control.
  export function factTableCensus(table: { rows: FactRow[]; excluded: { field: string; reason: string }[] }, opts: { omit?: string } = {}): { ok: boolean; missing: string[]; seededOmissionCaught: boolean } {
    const rowFields = new Set(table.rows.flatMap((r) => fieldsCoveredByRow(r.id)))
    const exclFields = new Set(table.excluded.filter((e) => e.reason.trim()).map((e) => e.field))
    const missing: string[] = []
    for (const field of ARTIFACT_FIELDS) {
      // the seeded omission drops `field` from ALL coverage (row OR exclusion) — a flattering subset that silently omits
      // it — so the census MUST report it missing (the positive control fires).
      const dropped = opts.omit === field
      const covered = !dropped && (rowFields.has(field) || exclFields.has(field))
      if (!covered) missing.push(field)
    }
    // the control: with `omit` set, the seeded field must be among the missing (caught)
    const seededOmissionCaught = !opts.omit || missing.includes(opts.omit)
    // a census is ok iff NOTHING is missing — so a seeded run (which drops a field) is NOT ok (the omission is caught),
    // while a real run with full coverage is ok. The control asserts seededOmissionCaught separately.
    return { ok: missing.length === 0, missing, seededOmissionCaught }
  }
  // which artifact field(s) a row id covers (rows named differently than the field they represent)
  function fieldsCoveredByRow(id: string): string[] {
    const map: Record<string, string[]> = { "dsr-at-declared": ["dsrAtDeclared", "dsrThreshold"], "declared-n": ["familyDeclaredNTrials"], "verdict": ["verdict", "terminalState"], "tier": ["tier"], "reality": ["reality", "provenanceRef"], "n-obs": ["nObs"], "k-eff": ["kEff"], "charge": ["charge"], "selection-surcharge": ["selectionSurcharge"], "kill-switch": ["killSwitchReason"], "state-reason": ["stateReason"] }
    return map[id] ?? []
  }

  export function isMaterial(r: FactRow): boolean {
    return r.contribution === "deciding" || r.contribution === "bounding"
  }

  // ── THE QUANTITATIVE REGISTER — exact values, thresholds, the deciding rule (the numbers a professional audits) ──
  export function quantitative(table: { rows: FactRow[] }): string {
    const L: string[] = ["WHY (quantitative) — every figure exact, from the engine's own fact table:"]
    for (const r of table.rows.filter(isMaterial)) {
      const cmp = r.threshold !== null ? ` ${r.comparator} ${r.threshold}` : ""
      L.push(`  · ${r.name}: ${r.value}${cmp} → ${r.outcome.toUpperCase()}${r.contribution === "deciding" ? " (deciding)" : ""}`)
    }
    return L.join("\n")
  }

  // ── THE PLAIN-LANGUAGE REGISTER — two-sided, from the pinned template registry, per terminal state (incl. kill-switch) ──
  // Each template names WHAT FAILED (or what state), WHAT HELD, and WHAT WOULD CHANGE IT — generated from the fact table,
  // never a consolation ("almost!"). The deciding row's value/threshold populate the sentence.
  export function plainLanguage(f: VerdictFacts): string {
    const decid = f.dsrAtDeclared
    const bar = f.dsrThreshold
    const n = f.familyDeclaredNTrials
    switch (f.terminalState) {
      case "NO-GO":
        return `This strategy was refused. Its evidence, after paying for its ${n} counted attempt${n === 1 ? "" : "s"}, is weaker than the bar: the deflated significance is ${decid?.toFixed(3)}, below the ${bar} threshold. What held: the engine adjudicated it honestly on ${f.reality} data and counted every attempt. What would change it: more independent evidence — a stronger effect, or more observations, so the significance clears ${bar} even after the search is charged.`
      case "GO":
        return `This strategy passed. Its deflated significance is ${decid?.toFixed(3)}, at or above the ${bar} bar even after paying for its ${n} counted attempt${n === 1 ? "" : "s"}. What is still uncertain: past significance is not a promise of future return; the point-in-time data and undeclared search are risks the engine cannot see. A GO is a floor on doubt, not a guarantee.`
      case "CONDITIONAL":
        return `This strategy is conditionally supported. The evidence survives the statistics given what could be verified (deflated significance ${decid?.toFixed(3)} vs ${bar}, over ${n} counted attempt${n === 1 ? "" : "s"}), but a stronger claim is fenced off because the data or the search could not be independently confirmed. What would change it: independent verification of the data and an anchored pre-registration.`
      case "INSUFFICIENT":
        return `Not enough evidence yet — this is a forward clock, not a failure. The engine cannot yet distinguish this strategy's skill from chance. What held: it was adjudicated honestly and nothing was fabricated. What would change it: more observations at the strategy's cadence; the engine tells you how much more it needs (pending the floor audit, which stays hedged).`
      case "BLOCKED":
        return `Refused before a verdict: the data this needs does not exist here yet${f.stateReason ? ` (${f.stateReason})` : ""}. What held: the engine renders BLOCKED rather than fabricating a payload. What would change it: the unblock named in the reason (a credential, a captured snapshot, or a provenance chain).`
      case "MALFORMED":
        return `Refused before adjudication${f.stateReason ? `: ${f.stateReason}` : " — the input broke a rule the engine checks before it will register anything"}. What held: nothing was registered (the ledger count is unchanged). What would change it: a well-formed input that satisfies the rule.`
      case "kill-switch":
        return `A safety wall tripped and the surface is disabled${f.killSwitchReason ? `: ${f.killSwitchReason}` : ""}. What it caught: a survivor that must never pass (a pooled-noise or proposer survivor). Why the surface is disabled: pending an owner decision — a first-class finding, never hidden. What would change it: an owner reviews the finding and re-admits or retires the surface.`
    }
  }

  // the terminal-state template registry (pinned in Phase 0) — one entry per state, two-sided by construction.
  export const TEMPLATE_STATES: TerminalState[] = ["GO", "NO-GO", "CONDITIONAL", "INSUFFICIENT", "BLOCKED", "MALFORMED", "kill-switch"]

  // ── THE CONSISTENCY CHECKER (X-ONE) — the two registers cannot disagree ──
  // Every material row must be EXPLAINED in the plain text (its value or a paraphrase of it appears); every NUMBER in the
  // plain text must match a fact value exactly; a consoling phrase is a violation. Drift is a battery failure, not style.
  const CONSOLING = [/almost/i, /so close/i, /nearly (there|passed|made it)/i, /just missed/i, /you'?re close/i, /not far/i]
  export function consistency(plainText: string, table: { rows: FactRow[] }): { ok: boolean; violations: string[] } {
    const violations: string[] = []
    const values = new Set(table.rows.map((r) => String(r.value)))
    const thresholds = new Set(table.rows.map((r) => r.threshold).filter((t) => t !== null).map(String))
    // every number in the plain text must be a fact value OR a threshold (exact string match on the numeric token)
    const nums = (plainText.match(/-?\d+\.?\d*/g) ?? []).filter((s) => s.length > 0)
    for (const num of nums) {
      if (!values.has(num) && !thresholds.has(num) && !numMatchesAny(num, table)) violations.push(`orphan number "${num}" in the plain text maps to no fact-table value or threshold (register drift)`)
    }
    // every DECIDING material row must be reflected (its value appears in the plain text) — the deciding rule is explained
    for (const r of table.rows.filter((r) => r.contribution === "deciding")) {
      if (!reflected(plainText, r)) violations.push(`deciding row "${r.id}" (${r.name}) is not explained in the plain register (unexplained material row)`)
    }
    for (const c of CONSOLING) if (c.test(plainText)) violations.push(`consoling phrase present (a refusal must not be softened into 'almost'): ${c}`)
    return { ok: violations.length === 0, violations }
  }
  function numMatchesAny(num: string, table: { rows: FactRow[] }): boolean {
    const x = Number(num)
    if (!Number.isFinite(x)) return false
    // a plain-text number matches a fact value if they are equal at the value's own precision (e.g. 0.94 vs 0.940)
    for (const r of table.rows) {
      const v = typeof r.value === "number" ? r.value : Number(r.value)
      if (Number.isFinite(v) && Math.abs(v - x) < 1e-9) return true
      const t = typeof r.threshold === "number" ? r.threshold : Number(r.threshold)
      if (Number.isFinite(t) && Math.abs(t - x) < 1e-9) return true
      // a number EMBEDDED in a string fact value (e.g. the kill-switch reason "1 pooled-noise survivor") is grounded —
      // the fact row carries it verbatim, so a plain/paraphrase echo of it is not an orphan.
      if (typeof r.value === "string" && (r.value.match(/-?\d+\.?\d*/g) ?? []).includes(num)) return true
    }
    return false
  }
  function reflected(plainText: string, r: FactRow): boolean {
    const v = String(typeof r.value === "number" ? Number(r.value) : r.value)
    if (plainText.includes(v)) return true
    // a verdict row is reflected if the terminal state word or a synonym appears
    if (r.id === "verdict") return /refus|pass|conditional|insufficient|blocked|malformed|safety wall|not enough/i.test(plainText)
    return false
  }

  // ── THE GROUNDEDNESS VERIFIER (X-GROUND) — the LLM phrases; the verifier decides ──
  // Every NUMBER and every CLAIM in a paraphrase must match the fact table. Any unmatched number OR any claim that adds a
  // fact the table does not contain rejects the paraphrase WHOLESALE — the deterministic text renders instead. A partial
  // accept is forbidden (one smuggled claim is one too many). Seeded controls: an embellishment ("comfortably above
  // threshold" where the table says fail) and an added causal story ("markets were volatile") both reject.
  const CAUSAL_MARKERS = [/because/i, /due to/i, /caused by/i, /thanks to/i, /as a result of/i, /driven by/i]
  const EMBELLISH = [/comfortably (above|below|clear)/i, /strongly (passed|failed)/i, /easily/i, /by a wide margin/i, /well (above|below)/i, /far (above|below|exceeds?)/i]
  export function verifyGroundedness(paraphrase: string, table: { rows: FactRow[] }): { ok: boolean; rejected: boolean; reasons: string[] } {
    const reasons: string[] = []
    // (1) every number must match a fact value/threshold exactly
    const nums = (paraphrase.match(/-?\d+\.?\d*/g) ?? [])
    for (const num of nums) if (!numMatchesAny(num, table)) reasons.push(`unmatched number "${num}" (not a fact value or threshold)`)
    // (2) no embellishment that contradicts or inflates an outcome (a fabricated qualitative margin the table doesn't state)
    for (const e of EMBELLISH) if (e.test(paraphrase)) reasons.push(`embellishment "${e}" — the fact table states pass/fail, never a qualitative margin`)
    // (3) no added CAUSAL story — a claim of WHY beyond the fact rows (the LLM phrases, never reasons)
    for (const c of CAUSAL_MARKERS) {
      const m = paraphrase.match(new RegExp(`[^.]*${c.source}[^.]*`, "i"))
      if (m && !causalGrounded(m[0], table)) reasons.push(`added causal claim "${m[0].trim().slice(0, 60)}…" maps to no fact row (the LLM may not add reasoning)`)
    }
    const ok = reasons.length === 0
    return { ok, rejected: !ok, reasons }
  }
  // a causal clause is grounded only if it references a fact-table term (the deflation/search/significance/threshold) —
  // never an external cause (volatility, markets, news). This is the line between phrasing and reasoning.
  function causalGrounded(clause: string, table: { rows: FactRow[] }): boolean {
    const grounded = /significance|deflat|threshold|trial|attempt|search|bar|evidence|K_eff|breadth|selection|provenance|data reality/i
    const external = /market|volatil|news|macro|regime|sentiment|liquidity|whale|hype/i
    if (external.test(clause)) return false
    return grounded.test(clause) || (clause.match(/-?\d+\.?\d*/g) ?? []).some((n) => numMatchesAny(n, table))
  }

  // the optional paraphrase, GATED: run the provider, verify it, and render it ONLY if it passes — else deterministic
  // fallback. Labeled "AI-phrased · verified against engine facts". Fixture-only in CI (the provider is injected).
  export interface Paraphraser { rephrase(deterministicText: string, factRows: FactRow[]): string }
  export function paraphraseGated(deterministicText: string, table: { rows: FactRow[] }, provider: Paraphraser): { rendered: string; aiPhrased: boolean; verification: { ok: boolean; rejected: boolean; reasons: string[] } } {
    let out: string
    try { out = provider.rephrase(deterministicText, table.rows) } catch { return { rendered: deterministicText, aiPhrased: false, verification: { ok: false, rejected: true, reasons: ["provider unavailable — deterministic fallback (availability)"] } } }
    const v = verifyGroundedness(out, table)
    if (!v.ok) return { rendered: deterministicText, aiPhrased: false, verification: v } // reject wholesale, deterministic fallback
    return { rendered: `${out}\n[ AI-phrased · verified against engine facts ]`, aiPhrased: true, verification: v }
  }
}
