/**
 * ORGΛNON — THE TELEMETRY CAPTURE MANIFEST (Probe Phase 2; X-TELEMETRY). The pinned, verbatim contract of EXACTLY what
 * a telemetry event may carry — and what it may NEVER carry. The event schema is `.strict()`: a field absent from this
 * manifest FAILS the parse (the manifest-drift guard, A′#9 / S52). verdictWord is the ENGINE'S verdict word reached,
 * never the pool it was about. Nothing here is a key, a strategy input, a typed address, prompt text, PII, or an IP.
 * This module imports ONLY zod — it is a verdict-path-forbidden consumer (it touches no scored module).
 */
import { z } from "zod"

export namespace TelemetryManifest {
  // the EXACT captured-field set (a test asserts EventSchema's keys === this, exactly)
  export const CAPTURED = ["at", "screen", "intent", "verdictWord", "latencyMs", "degradeEvent", "door", "sampleRatio"] as const
  // the NEVER-captured set — surfaced verbatim in the disclosure; a capture of any of these is a Halt
  export const NEVER_CAPTURED = [
    "keys / secrets",
    "strategy inputs",
    "typed pool addresses",
    "prompt text",
    "PII",
    "IP address",
    "any free text the tester typed",
  ] as const

  // the closed vocabularies — every captured field is an enum or a bounded number, never free text
  export const SCREENS = ["shelf", "reality", "ask", "stamp", "feedback", "other"] as const
  export const DOORS = [":4444", ":4319", "cli", "mcp"] as const
  // the engine's verdict words (scorecard + Stamp) — the ONLY verdict vocabulary a telemetry event may name
  export const VERDICT_WORDS = ["SOLID", "CAUTION", "AVOID", "UNVERIFIED", "GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE", "none"] as const

  export const EventSchema = z
    .object({
      at: z.number().int().nonnegative(),
      screen: z.enum(SCREENS),
      intent: z.string().max(24), // a closed intent LABEL name (COMPARE/OUTLOOK/…), never the query text — bounded hard
      verdictWord: z.enum(VERDICT_WORDS),
      latencyMs: z.number().int().nonnegative().max(600_000),
      degradeEvent: z.boolean(),
      door: z.enum(DOORS),
      sampleRatio: z.number().min(0).max(1),
    })
    .strict() // ← the manifest-drift guard: an extra field FAILS the parse (S52)

  export type Event = z.infer<typeof EventSchema>

  // the verbatim first-run disclosure — the tester reads this before a single event is captured
  export const DISCLOSURE = [
    "ORGΛNON telemetry is OFF by default. If you enable it (ORGANON_TELEMETRY=1) and accept this disclosure, it captures — LOCALLY, on your machine only — exactly:",
    `  captured: ${CAPTURED.join(" · ")}`,
    `  NEVER captured: ${NEVER_CAPTURED.join(" · ")}`,
    "Every event is scrubbed. Nothing leaves your machine unless you separately opt in to sharing (ORGANON_TELEMETRY_SHARE=1). You can see, export, or purge your own data any time: ./organon.sh telemetry --show/--export/--purge.",
  ].join("\n")
}
