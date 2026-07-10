/**
 * ORGΛNON — THE FEEDBACK SURFACE (Probe Phase 2; X-TELEMETRY, same posture). The qualitative half of the probe the
 * telemetry counts can't give: a tester's structured verdict ON a verdict — was it useful, did you trust it, what was
 * missing. Submitting IS the opt-in act (a deliberate tester action), so a submission is captured LOCALLY; the free-text
 * `missing` field is scrubbed (secrets/addresses masked) before it ever touches disk. Nothing leaves the machine without
 * the SAME second-consent share rule. Imports ONLY zod + the store — a verdict-path-forbidden consumer.
 */
import { z } from "zod"
import { TelemetryStore } from "./store"

export namespace Feedback {
  const FILE = "feedback.jsonl"
  export type Env = Record<string, string | undefined>

  export const SCREENS = ["shelf", "reality", "ask", "stamp", "other"] as const

  export const Schema = z
    .object({
      at: z.number().int().nonnegative(),
      screen: z.enum(SCREENS),
      useful: z.boolean(), // "was this useful?"
      trusted: z.boolean(), // "did you trust it?"
      missing: z.string().max(500), // "what was missing?" — free text, SCRUBBED before append (the one free field)
    })
    .strict()

  export type Entry = z.infer<typeof Schema>

  export interface SubmitResult { captured: boolean; reason?: string }

  // submit(): a deliberate tester action → captured locally, the free-text field scrubbed. No secret env-gate (submitting
  // is the consent); egress is still the second-consent share() below.
  export function submit(entry: unknown, env: Env = process.env): SubmitResult {
    const parsed = Schema.safeParse(entry)
    if (!parsed.success) return { captured: false, reason: "feedback REJECTED — malformed or an unlisted field" }
    TelemetryStore.appendLocal(FILE, parsed.data as Record<string, unknown>, env) // the store scrubs every string field
    return { captured: true }
  }

  export function show(env: Env = process.env): Record<string, unknown>[] {
    return TelemetryStore.exportScrubbed(FILE, env)
  }
  export function purge(): void {
    TelemetryStore.purge(FILE)
  }

  export interface ShareResult { shared: boolean; payload?: Record<string, unknown>[]; reason?: string }
  export function share(env: Env = process.env): ShareResult {
    if (env.ORGANON_TELEMETRY_SHARE !== "1")
      return { shared: false, reason: "sharing feedback requires a SECOND explicit consent (ORGANON_TELEMETRY_SHARE=1)" }
    return { shared: true, payload: TelemetryStore.exportScrubbed(FILE, env) }
  }
}
