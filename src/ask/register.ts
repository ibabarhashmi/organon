/**
 * ORGΛNON — THE ASK CONSOLE, THE REGISTER-DIFFERENTIATION WALL (Interpreter Phase 3; Rule X-INTERPRET b, S42). The
 * register split (Simple / Pro) was a persona HOPE; this makes it a deterministic WALL. Pure functions over the rendered
 * REASONING text + a PINNED rubric — no model self-check, no I/O in the hot path:
 *
 *   · conforms(reasoning, register, ctx) — does THIS register's REASONING fit its band?
 *       Simple: carries NO pinned-jargon token, NO raw decimal, ≤ the Simple band (a depositor register — plain, short).
 *       Pro:    names ≥1 AXIS term, ≥ the Pro band, + (where the fact set carries it) the proxy-surface caveat / the
 *               own-vs-rented divergence. (The full rubric also names provenance-citation — enforced via ctx.requireProvenance,
 *               positive-controlled; the RUNTIME gate uses the always-legitimate subset so a real Pro answer is never
 *               false-rejected, while the pure contract carries the whole rubric.)
 *   · differ(simpleReasoning, proReasoning, ctx) — the two REASONING blocks for the SAME query must DIFFER (identical →
 *       a faked split) AND each conform to its register.
 *
 * Wired into VoiceContract.compose as a GATE downstream of the five VoiceGates: a mis-registered REASONING block rejects
 * to the correctly-registered deterministic template (fail-closed — a plain template beats a faked register). The RUBRIC
 * is the pinned single source of truth (asserted === interpret-pins.register in ask_register / honesty_pins).
 */
export namespace AskRegister {
  export interface Rubric {
    jargonList: readonly string[]
    axisTerms: readonly string[]
    provenanceTerms: readonly string[]
    simpleMaxChars: number
    proMinChars: number
  }

  // THE PINNED RUBRIC (=== interpret-pins.register; a test asserts the equality so this constant cannot silently drift)
  export const RUBRIC: Rubric = {
    jargonList: ["ICIR", "deflated", "deflation", "MinTRL", "apyBase", "apyReward", "proxy-surface", "proxy surface", "storage-clash", "storage clash", "storage-layout", "annualized", "Sharpe", "half-life", "autocorrelation", "basis point", "deflated-Sharpe", "K_eff", "microstructure", "PBO"],
    axisTerms: ["base", "reward", "emission", "durable", "counterparty", "contract", "proxy", "upgrade", "peg", "depeg", "funding", "carry", "decay", "consistency", "persistence", "liquidity", "unlock", "dependency"],
    provenanceTerms: ["REAL", "SAMPLE", "provenance", "as-of", "as of", "captured", "capture", "recorded"],
    simpleMaxChars: 360,
    proMinChars: 80,
  }

  export interface Ctx { proxyCaveat?: boolean; divergence?: boolean; requireProvenance?: boolean }
  export interface RegisterVerdict { ok: boolean; reasons: string[] }

  const RAW_DECIMAL = /\d+\.\d/ // a raw decimal like 5.2 — the plain register names the catch in words, not raw decimals
  const hasAny = (text: string, tokens: readonly string[]): boolean => { const l = text.toLowerCase(); return tokens.some((t) => l.includes(t.toLowerCase())) }
  const jargonIn = (text: string, rubric: Rubric): string[] => { const l = text.toLowerCase(); return rubric.jargonList.filter((t) => l.includes(t.toLowerCase())) }

  // ── conforms — is ONE rendered REASONING block in-register? (the pinned bands + the ctx-gated specificity) ──
  export function conforms(reasoning: string, register: "simple" | "pro", ctx: Ctx = {}, rubric: Rubric = RUBRIC): RegisterVerdict {
    const text = reasoning.trim()
    const reasons: string[] = []
    if (register === "simple") {
      const jargon = jargonIn(text, rubric)
      if (jargon.length) reasons.push(`Simple carries jargon (${jargon.join(", ")}) — the depositor register must be plain, no metric jargon`)
      if (RAW_DECIMAL.test(text)) reasons.push(`Simple carries a raw decimal — the plain register names the catch in words, not raw decimals`)
      if (text.length > rubric.simpleMaxChars) reasons.push(`Simple is ${text.length} chars > the ${rubric.simpleMaxChars} band — say less (a short true answer beats a padded one)`)
    } else {
      if (!hasAny(text, rubric.axisTerms)) reasons.push(`Pro names no axis (${rubric.axisTerms.slice(0, 6).join("/")}/…) — the metric-literate register must name the axis`)
      if (text.length < rubric.proMinChars) reasons.push(`Pro is ${text.length} chars < the ${rubric.proMinChars} band — a Pro answer carries the specificity, not a Simple one-liner`)
      if (ctx.requireProvenance && !hasAny(text, rubric.provenanceTerms)) reasons.push(`Pro cites no provenance (REAL/SAMPLE/as-of/…) — a Pro answer states its data reality`)
      if (ctx.proxyCaveat && !/\bscreen\b|not an? (full )?audit|proxy/i.test(text)) reasons.push(`the fact set carries a proxy-surface caveat the Pro answer omits (a REAL tier is a structural screen over verified source, not an audit)`)
      if (ctx.divergence && !/divergen|own-plane|rented/i.test(text)) reasons.push(`the fact set carries an own-vs-rented divergence the Pro answer omits`)
    }
    return { ok: reasons.length === 0, reasons }
  }

  // ── differ — the two REASONING blocks for the SAME query must NOT be identical (a faked split) + each conform ──
  const norm = (s: string): string => s.trim().toLowerCase().replace(/\s+/g, " ")
  export function differ(simpleReasoning: string, proReasoning: string, ctx: Ctx = {}, rubric: Rubric = RUBRIC): RegisterVerdict {
    const reasons: string[] = []
    if (norm(simpleReasoning) === norm(proReasoning)) reasons.push("Simple and Pro are identical — the register split is faked, not real")
    reasons.push(...conforms(simpleReasoning, "simple", ctx, rubric).reasons)
    reasons.push(...conforms(proReasoning, "pro", ctx, rubric).reasons)
    return { ok: reasons.length === 0, reasons }
  }
}
