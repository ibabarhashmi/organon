/**
 * ORGΛNON — THE CADENCE SPRINT (X-CADENCE; X-AUTHOR; the FACT ENVELOPE, S79). The single serialization every consumer of
 * ORGΛNON's facts will ever read — today the composed drawer + the Ask console; tomorrow the Socket (V34), a Cedar exit
 * evaluator, a pure-TS Merkle proof. Pinned ONCE here (canonical, stable key order) so a downstream reader re-shapes
 * NOTHING; V31 pinned the trials schema empty for three sprints before it had a caller — the envelope is the same act.
 *
 * THE ENVELOPE IS SHAPED SO THE HONEST THING IS THE ONLY SERIALIZABLE THING:
 *   · `authored` is structurally `false` — there is NO code path that can set it true (the X-MANIFEST wall, extended);
 *   · `canonical(x)` is DETERMINISTIC ×2 (a recursive key-sort — calling it twice is byte-identical; a wall asserts it);
 *   · the `disclaimer` is pinned text that passes the advice wall (`VoiceGates.advicePattern`);
 *   · NO field may carry a ranking, a weight, an allocation, or a "consider instead" — `serialize` REFUSES one that does,
 *     so a downstream agent physically cannot read an authored recommendation out of an ORGΛNON fact.
 * Pure; no I/O; no model. Pinned shape: cadence-pins.json.factEnvelope.
 */
import { AdviceShape } from "../ask/advice" // the Reckoning SHAPE guard (RP-1/S81) — the envelope's disclaimer must pass it

export namespace FactEnvelope {
  export const KILL_CRITERION = "8b4e094b" // the tool's own test travels with its facts — the discipline is portable

  // the pinned, advice-wall-checked disclaimer that rides EVERY fact — a fact ORGΛNON captured, never advice about it.
  export const DISCLAIMER = "This is a fact ORGΛNON captured — information about a subject, not a recommendation about what to do with it."

  export type Verdict = "SOLID" | "CAUTION" | "AVOID" | "UNVERIFIED" | "UNJUDGEABLE" | "INSUFFICIENT" | null

  export interface Provenance {
    tier: string // REAL★ | REAL@ts | SAMPLE (the two-tier provenance label the engine already speaks)
    contentHash: string | null
    capturedAt: string | null
    source: string | null
  }

  export interface Subject {
    kind: "pool" | "manifest"
    key: string
  }

  // the envelope — `authored` is NOT a constructor argument; `wrap` sets it false and no path sets it true (structural).
  export interface T {
    fact: unknown // the value — NEVER a recommendation (serialize refuses an authored shape)
    verdict: Verdict
    provenance: Provenance
    subject: Subject
    baselineHash: string | null // for cycle deltas (null when no baseline is pinned)
    killCriterion: "8b4e094b"
    disclaimer: string
    authored: false // STRUCTURAL — the X-MANIFEST wall, extended; there is no code path to set it true
  }

  // the fields a fact value must NEVER carry (a downstream reader must not be able to pull an authored recommendation out of
  // an ORGΛNON fact) — the compile-time banned-output shapes, applied to the SERIALIZED fact (keys + string values).
  export const BANNED_FACT_SHAPES = ["suggested weight", "suggested allocation", "rebalance", "ranked alternative", "rankings", "consider instead", "optimal weight", "recommended split", "you should allocate"] as const

  // RP-3 (Reckoning sprint; S85) — USER TEXT IS STRUCTURALLY FIELDED AS UNTRUSTED. The envelope is the artifact built to
  // carry ORGΛNON's facts to a THIRD-PARTY agent; a raw thesis interpolated into a narrative string is a prompt-injection
  // vector, not merely an XSS one. Any user-supplied text (thesis, position identifiers, re-pin reason) that rides an
  // envelope goes through `untrusted()` — it becomes a DEMARCATED data field (`untrustedUserText` + `untrusted:true`), never
  // interpolated into the pinned disclaimer or any narrative. A downstream reader sees it is user data, never an instruction.
  export interface Untrusted {
    untrustedUserText: string
    untrusted: true
  }
  export function untrusted(text: string): Untrusted {
    return { untrustedUserText: text, untrusted: true }
  }

  // WRAP — the ONLY constructor. `authored` is hard-set false (structural). The disclaimer + killCriterion are pinned.
  export function wrap(input: { fact: unknown; verdict: Verdict; provenance: Provenance; subject: Subject; baselineHash?: string | null }): T {
    return {
      fact: input.fact,
      verdict: input.verdict,
      provenance: input.provenance,
      subject: input.subject,
      baselineHash: input.baselineHash ?? null,
      killCriterion: KILL_CRITERION,
      disclaimer: DISCLAIMER,
      authored: false,
    }
  }

  // CANONICAL serialization — a recursive key-sort so the output is deterministic ×2 (byte-identical on repeat) and stable
  // regardless of construction order (the Merkle seam: a later pure-TS layer can hash these without migration).
  export function canonical(x: unknown): string {
    return JSON.stringify(sortKeys(x))
  }

  function sortKeys(x: unknown): unknown {
    if (x === null || typeof x !== "object") return x
    if (Array.isArray(x)) return x.map(sortKeys)
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(x as Record<string, unknown>).sort()) out[k] = sortKeys((x as Record<string, unknown>)[k])
    return out
  }

  // SERIALIZE — canonical + the wall. A serialized envelope whose keys/string-values carry a banned authored shape is
  // REFUSED (never emitted); the disclaimer must pass the advice wall; `authored` must be false. The honest thing is the
  // only serializable thing.
  export function serialize(env: T): { ok: true; json: string } | { ok: false; error: string } {
    if (env.authored !== false) return { ok: false, error: "an envelope with authored !== false cannot be serialized — ORGΛNON did not author this fact (the X-MANIFEST wall, extended)" }
    if (env.killCriterion !== KILL_CRITERION) return { ok: false, error: `the kill-criterion must travel with the fact (expected ${KILL_CRITERION})` }
    const adv = AdviceShape.detect(env.disclaimer)
    if (adv.advice) return { ok: false, error: `the disclaimer is advice-shaped ("${adv.shape}") — a fact's disclaimer must pass the advice wall` }
    const json = canonical(env)
    const lower = json.toLowerCase()
    const banned = BANNED_FACT_SHAPES.find((s) => lower.includes(s))
    if (banned) return { ok: false, error: `the fact carries the banned authored shape "${banned}" — no ORGΛNON fact may serialize a ranking, a weight, or an allocation (S79)` }
    return { ok: true, json }
  }
}
