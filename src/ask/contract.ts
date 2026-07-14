/**
 * ORGΛNON — THE ASK CONSOLE, THE THREE-TIER ANSWER CONTRACT (Voice Phase 2; Rule X-VOICE b, X-ASK-as-amended D11). Every
 * Ask answer is a typed `Block[]`: FACT (an engine value, near-verbatim, high-trust) / REASONING (AI analysis OVER backed
 * facts, VISIBLY LABELED "ANALYSIS — not an engine fact" in markup that survives a screenshot) / BOUNDARY (a deterministic
 * template for what the engine cannot support). The tier lives in the DATA MODEL (this typed field) AND the render (the
 * style/label) — a REASONING block can NEVER wear a FACT block's clothes.
 *
 * The X-ASK amendment (D11): the old whole-answer rejection becomes TYPED PER-BLOCK rejection. A REASONING block runs the
 * five deterministic gates (VoiceGates) DOWNSTREAM of the model; a gated violation replaces THAT block with the intent's
 * deterministic template (fail-closed, never fail-open) — the FACT block was engine-produced and cannot violate. An advice
 * shape routes to the ADVICE boundary (X-ADVICE, law). Deterministic parity (X-VOICE e): no AI → a single FACT/BOUNDARY
 * block whose render is byte-identical to the deterministic answer; the mass path never requires a model.
 */
import { z } from "zod"
import type { Ask } from "./answer"
import type { Explain } from "../analytics/explain"
import { VoiceGates } from "./gates"
import { AdviceShape } from "./advice" // THE SHOWING SPRINT (S87, DD-1) — the ONE shape guard, composed onto the Ask output path
import { AskRegister } from "./register"

export namespace VoiceContract {
  export type BlockTier = "FACT" | "REASONING" | "BOUNDARY"
  export const ANALYSIS_LABEL = "ANALYSIS — not an engine fact" // carried inline so a screenshot of the reasoning keeps it
  // the standing residual disclosure (X-VOICE g) — shown in Simple + Pro WHEREVER a REASONING block appears (the residual
  // that no deterministic gate closes: qualitative error inside labeled analysis — scoped, labeled, measured, DISCLOSED)
  export const RESIDUAL_DISCLOSURE = "Analysis blocks are AI reasoning over the engine's facts — the facts are checkable; the reasoning is not a verdict."
  // the ADVICE boundary (X-ADVICE, law) — a deterministic template; the AI never recommends, so this is engine-authored text
  export const ADVICE_BOUNDARY = "I can't tell you whether to invest — that would be personalized financial advice, and ORGΛNON is a researcher, not an advisor (a regulated-activity boundary, not a brand choice). What I can give you is above: the engine's facts and the honest risk framing. What you do with them is your decision."

  // ── X-INTERPRET(a) — THE WIDENED REASONING LANE (D18). A REASONING block may now INTERPRET the engine's facts —
  // comparative framing, risk synthesis, the "so what" / what-this-means-for-the-catch, clearly-labeled conditional
  // structure — rather than merely re-print them. Crucially the lane widened by RE-PINNING THE PERSONA (instruction),
  // NOT by touching one gate: the block TYPE is unchanged, the five VoiceGates + the FACT groundedness gate are
  // BYTE-IDENTICAL and run on the wider output exactly as before (verified — an interpretive block PASSES; a smuggled
  // derived number, a soft recommendation under "what this means", a moved verdict each STILL reject/route — S44). The
  // lane widens for interpreting FACTS, never for asserting non-facts; a wall lowered to let an explanation through is a
  // Halt. This constant is the pinned, documented record of the latitude (interpret-pins.lane.interpretiveLatitude).
  export const INTERPRETIVE_LATITUDE = ["comparative framing", "risk synthesis", "the so-what / what this means for the catch", "clearly-labeled conditional structure"] as const

  export interface Block { tier: BlockTier; text: string; label?: string }
  export const BlockSchema = z.object({ tier: z.enum(["FACT", "REASONING", "BOUNDARY"]), text: z.string().min(1), label: z.string().optional() })
  export const AnswerSchema = z.array(BlockSchema)

  export const fact = (text: string): Block => ({ tier: "FACT", text })
  export const reasoning = (text: string): Block => ({ tier: "REASONING", text, label: ANALYSIS_LABEL })
  export const boundary = (text: string): Block => ({ tier: "BOUNDARY", text })

  // render Block[] → plain text. PARITY (X-VOICE e): a single FACT/BOUNDARY block renders to its text byte-for-byte (so the
  // deterministic composition equals the deterministic answer). A REASONING block carries its ANALYSIS label inline.
  export function renderText(blocks: Block[]): string {
    return blocks.map((b) => (b.tier === "REASONING" ? `[${b.label}]\n${b.text}` : b.text)).join("\n\n").trim()
  }
  export const hasReasoning = (blocks: Block[]): boolean => blocks.some((b) => b.tier === "REASONING")

  // the intents whose deterministic answer is a FACT block (an engine value); the rest (guides / boundaries) are BOUNDARY.
  const FACT_BEARING = new Set(["STRATEGY_LOOKUP", "DATA_QUERY", "VALIDATION", "COMPARE", "OUTLOOK", "SCENARIO", "GENERAL", "RECORD_HISTORY"])
  const deterministicBlock = (a: Ask.AskAnswer): Block => (FACT_BEARING.has(a.intent.kind) && a.result.ok ? fact(a.text) : boundary(a.text))

  // the grounding table = the engine facts + the strategy NAME(s) (so a digit inside a pool name is grounded)
  function groundingRows(a: Ask.AskAnswer): Explain.FactRow[] {
    const extra: Explain.FactRow[] = []
    for (const k of ["name", "aName", "bName"]) { const v = a.result.meta[k]; if (typeof v === "string") extra.push({ id: `name-${k}`, name: "strategy name", value: v, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: null }) }
    return [...a.result.facts, ...extra]
  }
  const GUARDED_INTENTS = new Set(["STRATEGY_LOOKUP", "COMPARE", "VALIDATION", "OUTLOOK", "GENERAL", "ADVICE_BOUNDARY"])
  export function factSetOf(a: Ask.AskAnswer, comparisons?: VoiceGates.FactSet["comparisons"]): VoiceGates.FactSet {
    const verdicts: string[] = []
    for (const k of ["verdict", "aVerdict", "bVerdict", "stampVerdict", "contractTier"]) { const v = a.result.meta[k]; if (typeof v === "string") verdicts.push(v) }
    return { rows: groundingRows(a), verdicts, guarded: GUARDED_INTENTS.has(a.intent.kind), comparisons }
  }

  // the comparison-direction ground truth for the COMPARE intent — the entities + their verdict severities (a higher value
  // = riskier/worse → higherIsBetter=false, so "A is riskier/safer than B" is checkable). Undefined for non-COMPARE (the
  // gate is inert). Shared by the phrasing layer + the eval harness so both drive the gate identically.
  const VERDICT_SEVERITY: Record<string, number> = { AVOID: 3, UNVERIFIED: 2.5, CAUTION: 2, SOLID: 1 }
  export function comparisonsFor(a: Ask.AskAnswer): VoiceGates.FactSet["comparisons"] {
    if (a.intent.kind !== "COMPARE") return undefined
    const sev = (v: string) => VERDICT_SEVERITY[v] ?? 2.5
    const names = a.result.meta.names, verdicts = a.result.meta.verdicts
    if (Array.isArray(names) && Array.isArray(verdicts) && names.length === verdicts.length && names.length >= 2)
      return [{ metric: "risk severity (verdict)", higherIsBetter: false, ordering: names.map((n, i) => ({ entity: String(n), value: sev(String(verdicts[i])) })) }]
    return undefined
  }

  export interface Composed { blocks: Block[]; aiUsed: boolean; rejected: boolean; adviceBoundary: boolean; reasons: string[] }

  // ── COMPOSE — the deterministic FACT/BOUNDARY block + (iff an AI draft passes the five gates) a labeled REASONING block.
  // Typed per-block rejection (D11): a gated violation drops the REASONING block (the deterministic block stands, fail-
  // closed); an advice shape routes to the ADVICE boundary (never lets the recommendation flow). `comparisons` is the
  // comparison-direction ground truth the tool supplies (COMPARE); undefined → the comparison gate is inert. ──
  export function compose(a: Ask.AskAnswer, aiText: string | null, comparisons?: VoiceGates.FactSet["comparisons"]): Composed {
    const base = deterministicBlock(a)
    if (!aiText || !aiText.trim()) return { blocks: [base], aiUsed: false, rejected: false, adviceBoundary: false, reasons: [] }
    const g = VoiceGates.runReasoningGates(aiText.trim(), factSetOf(a, comparisons))
    // THE SHOWING SPRINT — ONE GUARD (S87, DD-1). The five VoiceGates route advice via VoiceGates.advicePattern, a SUBSTRING
    // matcher (src/ask/gates.ts, a frozen verdict-path member) that misses token-free advice — "size into it", "trim the
    // position", "you may want to wait" — the exact failure mode of an LLM phrasing a cadence delta at runtime. We compose
    // AdviceShape.detect (the SHAPE guard) DOWNSTREAM of the gates, HERE at the single call site where the model's output
    // becomes a REASONING block (contract.ts is NOT frozen — zero frozen bytes moved; D46 unneeded). Refusals COMPOSE: this
    // second check can only refuse MORE, never less, and a voice-path check can never move a verdict. One definition of
    // advice now reaches every emitted line, including the path where the LLM writes the words. (DD-1's preferred outcome.)
    const shape = AdviceShape.detect(aiText.trim())
    if (g.advice || shape.advice) return { blocks: [base, boundary(ADVICE_BOUNDARY)], aiUsed: false, rejected: true, adviceBoundary: true, reasons: [`advice shape "${g.adviceShape ?? shape.shape}" → the ADVICE boundary (X-ADVICE${g.advice ? "" : "; caught by the shape guard, not the substring matcher"})`, ...g.reasons] }
    if (!g.ok) return { blocks: [base], aiUsed: false, rejected: true, adviceBoundary: false, reasons: g.reasons } // fail-closed: the deterministic block stands
    // the REGISTER-DIFFERENTIATION wall (X-INTERPRET b, S42) — DOWNSTREAM of the five gates: a mis-registered REASONING
    // block (a Simple that reads Pro — jargon / a raw decimal / over-band; a Pro with no metric-literacy — no axis / too
    // short) rejects to the correctly-registered deterministic template (fail-closed — a plain template beats a faked
    // register). The RUNTIME gate enforces the always-legitimate register DISTINCTION (never false-rejecting a real
    // answer); the proxy-caveat / divergence / provenance bars are the full pinned rubric (AskRegister.conforms ctx),
    // positive-controlled in ask_register and applied by a caller that demands stricter conformance.
    const reg = AskRegister.conforms(aiText.trim(), a.register)
    if (!reg.ok) return { blocks: [base], aiUsed: false, rejected: true, adviceBoundary: false, reasons: reg.reasons }
    return { blocks: [base, reasoning(aiText.trim())], aiUsed: true, rejected: false, adviceBoundary: false, reasons: [] }
  }
}
