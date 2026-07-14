/**
 * ORGΛNON — THE RECKONING SPRINT (X-RECKON / RP-1, S81). THE SHAPE GUARD, delivered as a NEW MODULE. It matches the SHAPE of a
 * recommendation — a second-person prescription + a financial action, the recommend/suggest/advise frame, the "I'd VERB"
 * frame, the euphemism/imperative set, the consider-/worth-VERB frames — each suppressed inside a NEGATION/DISCLAIMER window
 * (never/not/n't/no/'what to'/describes/'a fact'…) and past a NOUN-COMPOUND guard (buy button/order/side). It catches the
 * token-free advice the substring matcher misses ("size into it", "trim the position", "you may want to wait") AND passes
 * honest disclaimers the substring matcher wrongly refused ("…what to buy", "the buy button is on the exchange") WITHOUT a
 * punctuation trick. Every refusal names its shape.
 *
 * WHY A NEW MODULE, NOT AN in-place refactor of VoiceGates.advicePattern (W-RCK01, disclosed): `src/ask/gates.ts` is a member
 * of the pinned, chained verdict-path 7 (moat/precision/groundtruth/alpha/probe pins all assert its byte-hash). Refactoring it
 * in place would move a frozen verdict-path byte and cascade every downstream `pinsSha`/`carriedFromPinsSha`. So the shape
 * guard lives here and is wired into the STRATEGY surfaces the pivot creates (compile self-check · monitor cycle lines · the
 * door-copy/affordance pin checks · the Fact Envelope) — where the token-free advice would leak.
 *
 * THE SHOWING SPRINT (V34, S87/DD-1) CONVERGED IT: the Ask OUTPUT path is now shape-guarded too — AdviceShape.detect is
 * composed DOWNSTREAM of the five VoiceGates at the single call site (VoiceContract.compose in src/ask/contract.ts, NOT a
 * frozen file). gates.ts and its substring VoiceGates.advicePattern stay byte-frozen; the convergence is by COMPOSITION,
 * not by unfreezing the verdict-path member (D46 presented, never implemented — LN5). ONE definition of advice reaches
 * every emitted line, including the path where the LLM writes the words. The token-free hole is closed where it originates.
 */
export namespace AdviceShape {
  const ADVICE_ACTION = "buy|sell|trim|rotate|size|hold|wait|take|add|reduce|hedge|deposit|withdraw|allocate|invest|exit|enter|scale|move|put|get"
  const RULES: readonly (readonly [RegExp, string])[] = [
    [new RegExp(`\\byou (should|ought to|must|need to|may want to|might want to|had better|could|can)\\s+(${ADVICE_ACTION})\\b`), "prescriptive-you"],
    [/\b(i|we)\s+(recommend|suggest|advise)\b/, "recommend"],
    [/\bi'?d\s+(buy|sell|trim|rotate|size|hold|wait|take|add|reduce|hedge|allocate|exit|enter|scale)\b/, "i-would"],
    [/\b(my|our)\s+(recommendation|suggestion|advice)\b/, "my-recommendation"],
    [/\bconsider\s+(buying|selling|trimming|adding|rotating|sizing|taking|reducing|hedging|scaling|moving|allocating)\b/, "consider-verb"],
    [/\bworth\s+(buying|investing|selling|holding)\b/, "worth-verb"],
    [/\b(trim|rotate|reduce|increase|dump|hedge)\s+(the|this|that|your|out|into|some|down|up|position|exposure|holding|it|in|out of)\b/, "imperative-euphemism"],
    [/\bsize\s+(into|in to|out of|up|down)\b/, "size-into"],
    [/\b(scale|move)\s+(in|out|into|out of)\b/, "scale-move"],
    [/\btake\s+(some|profit|profits|money|a little|part)\b/, "take-some"],
    [/\badd\s+to\s+(your|the|this)\b/, "add-to"],
    [/\ballocate\s+\d|\ballocate\s+(some|more|a|to|into|toward|your)\b/, "allocate"],
    [/\b(buy|sell)\s+(the|this|that|some|it|into|more|now|token|tokens|position)\b/, "buy-sell-imperative"],
    [/\bgo (long|short)\b/, "go-long-short"],
    [/\b(enter|exit)\s+(a |your |the )?position\b/, "enter-exit-position"],
    [/\bdeposit into\b|\bput your money\b|\binvest in\b/, "deposit-invest"],
  ] as const
  const NEGATION_CUES = ["never", "not ", "n't", "no ", "nothing", "what to", "cannot", "a fact", "describes", "information about", "instead of telling", "rather than"] as const

  // the enumerated advice corpus (RP-1 a-tightening) — every one of these MUST refuse; the reference the S81 wall reads.
  export const ENUMERATED_ADVICE = [
    "you should deposit into this pool", "I recommend you buy the token", "allocate 20% to this strategy", "you should sell everything immediately", "you could invest in aave", "worth buying this token", "deposit into this pool", "put your money in usdc", "go long eth", "go short", "enter a position", "exit your position",
    "size into it", "trim the position", "I'd rotate out of this", "you may want to wait", "consider taking some off", "take some off the table", "add to your position", "scale out here", "reduce your exposure", "my recommendation is to hold",
  ] as const

  export function detect(text: string): { advice: boolean; shape: string | null } {
    const t = ` ${text.toLowerCase()} `
    for (const [re, label] of RULES) {
      const m = re.exec(t)
      if (!m) continue
      const before = t.slice(Math.max(0, m.index - 40), m.index)
      if (NEGATION_CUES.some((n) => before.includes(n))) continue // a negated/disclaimer frame — honest, not advice
      const around = t.slice(m.index, m.index + m[0].length + 8)
      if (/\b(buy|sell)\s+(button|order|-?side|wall)/.test(around)) continue // a noun compound ("buy button"), not an imperative
      return { advice: true, shape: label }
    }
    return { advice: false, shape: null }
  }
}
