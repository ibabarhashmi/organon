/**
 * ORGΛNON STUDIO — FORWARD CLOCKS: verify or honestly RESTART (Phase 1; Rule H-CLOCK; the audit's gravest finding).
 *
 * The forward-capture clock is the ONLY path any strategy has to a powered verdict, so it is the one thing the product
 * may never manufacture. A clock has exactly TWO honest states — there is no third:
 *   • INTACT     — the capture stamp verifies against its pin (the evidence is real and unchanged);
 *   • RESTARTED  — the evidence is lost/unverifiable → the clock counts from NOW, with the discontinuity LOGGED and
 *                  DISPLAYED wherever the clock is shown. Prior time is not credited; a short true track record beats a
 *                  long rebuilt one.
 *
 * FORBIDDEN (a Halt): reconstructing, backfilling, interpolating, or regenerating a forward stamp from historical
 * data. A capture stamp chains from a CAPTURE-TIME signature (a nonce known only at capture), NOT from a recomputation
 * of the data — so a rebuilt stamp cannot reproduce the pin, and `detectReconstruction` refuses it outright. Rebuilding
 * the product's own track record is the sin beneath all others here.
 */
import { createHash } from "node:crypto"

export namespace Clocks {
  export interface ForwardStamp {
    domain: string
    capturedAt: number // ms epoch the forward evidence was captured
    nonce: string // a capture-time secret/nonce — CANNOT be derived from the data; its absence signals a fabrication
    payloadSha: string // hash of the captured payload (this part IS recomputable from data — insufficient alone)
    sha: string // sha256(domain|capturedAt|nonce|payloadSha) — the pinned capture signature
    // an honest reconstruction attempt would set this; a fabricator omitting it still fails the pin check.
    reconstructed?: boolean
  }

  export interface Discontinuity {
    restartedAt: string // a caller-supplied date label (deterministic; not Date.now())
    reason: string
    priorEvidenceUnverifiable: true
  }

  export type ClockState =
    | { domain: string; state: "intact"; verifiedSha: string }
    | { domain: string; state: "restarted"; discontinuity: Discontinuity }

  const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")

  export function stampSha(s: Pick<ForwardStamp, "domain" | "capturedAt" | "nonce" | "payloadSha">): string {
    return sha256(`${s.domain}|${s.capturedAt}|${s.nonce}|${s.payloadSha}`)
  }

  export class ReconstructionHalt extends Error {}

  // The reconstruction detector (H-CLOCK): a stamp is a fabrication if it declares itself reconstructed, OR lacks a
  // capture nonce (the one field a data-recompute cannot supply), OR its self-sha does not match its own fields (a
  // hand-built stamp). Any of these → Halt. Provenance/capability absence is the mechanism, not trust.
  export function detectReconstruction(stamp: ForwardStamp): void {
    if (stamp.reconstructed) throw new ReconstructionHalt(`clock ${stamp.domain}: stamp is self-declared reconstructed — forward evidence may never be rebuilt (H-CLOCK)`)
    if (!stamp.nonce || stamp.nonce.length === 0) throw new ReconstructionHalt(`clock ${stamp.domain}: stamp has no capture nonce — it could only have been recomputed from data (H-CLOCK)`)
    if (stampSha(stamp) !== stamp.sha) throw new ReconstructionHalt(`clock ${stamp.domain}: stamp self-sha mismatch — hand-built/tampered stamp refused (H-CLOCK)`)
  }

  // Verify a clock against its pinned capture sha, or RESTART it. `presentStamp` is null when the evidence is absent
  // (this environment: the gitignored forward captures are unrecoverable) → the ONLY honest outcome is restart.
  export function verifyClock(domain: string, pinnedSha: string | null, presentStamp: ForwardStamp | null, restartLabel: string): ClockState {
    if (!presentStamp || !pinnedSha) {
      return { domain, state: "restarted", discontinuity: { restartedAt: restartLabel, reason: "forward-capture evidence absent/unverifiable in this environment — never reconstructed (H-CLOCK)", priorEvidenceUnverifiable: true } }
    }
    detectReconstruction(presentStamp) // refuses a rebuilt stamp BEFORE it can be honored
    if (presentStamp.sha === pinnedSha) return { domain, state: "intact", verifiedSha: pinnedSha }
    return { domain, state: "restarted", discontinuity: { restartedAt: restartLabel, reason: `stamp did not verify against the pin (${pinnedSha.slice(0, 12)}…) — evidence discontinuous`, priorEvidenceUnverifiable: true } }
  }

  // the first-class DISPLAY string — shown wherever the clock renders (forward_status + reports). Never hidden.
  export function renderState(c: ClockState): string {
    if (c.state === "intact") return `${c.domain}: clock INTACT (capture verified ${c.verifiedSha.slice(0, 12)}…)`
    return `${c.domain}: ⏱ CLOCK RESTARTED ${c.discontinuity.restartedAt} · prior evidence unverifiable · counting from zero — ${c.discontinuity.reason}`
  }
}
