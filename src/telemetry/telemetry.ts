/**
 * ORGΛNON — THE TELEMETRY SEAM (Probe Phase 2; X-TELEMETRY — NO COVERT ANYTHING). OFF by default; capture needs
 * ORGANON_TELEMETRY=1 AND an accepted first-run disclosure (a local consent marker). Every event is validated against
 * the pinned manifest (`.strict()` — an unlisted field FAILS) then scrubbed then appended LOCALLY. The tester has full
 * sight + control (show / export / purge). Nothing leaves the machine without a SECOND explicit ORGANON_TELEMETRY_SHARE=1,
 * and the shared payload IS the scrubbed local one — nothing more. This module imports ONLY the manifest, the store, and
 * node stdlib — a verdict-path-forbidden consumer (it touches no scored module; instrumenting the probe weakens no wall).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { TelemetryManifest } from "./manifest"
import { TelemetryStore } from "./store"

export namespace Telemetry {
  const EVENTS_FILE = "events.jsonl"
  const CONSENT_FILE = path.join(TelemetryStore.DIR, "consent.json")

  export type Env = Record<string, string | undefined>

  // ── consent (the accepted first-run disclosure) ──
  export function consentAccepted(env: Env = process.env): boolean {
    return existsSync(CONSENT_FILE) || env.ORGANON_TELEMETRY_CONSENT === "accepted"
  }
  export function accept(env: Env = process.env): void {
    if (!existsSync(TelemetryStore.DIR)) mkdirSync(TelemetryStore.DIR, { recursive: true })
    writeFileSync(CONSENT_FILE, JSON.stringify({ acceptedDisclosure: true, at: env.ORGANON_TELEMETRY_AT ?? null }, null, 2) + "\n")
  }

  // ── off by default: BOTH the flag AND the accepted disclosure are required ──
  export function isEnabled(env: Env = process.env): boolean {
    return env.ORGANON_TELEMETRY === "1" && consentAccepted(env)
  }

  export interface CaptureResult { captured: boolean; reason?: string }

  // capture(event): the only ingress. Off → no capture (the reason is honest, not silent). Enabled → validate against the
  // pinned manifest (an unlisted field is dropped by the strict schema failing), then scrub, then append locally.
  export function capture(event: unknown, env: Env = process.env): CaptureResult {
    if (env.ORGANON_TELEMETRY !== "1") return { captured: false, reason: "telemetry is OFF (opt in with ORGANON_TELEMETRY=1)" }
    if (!consentAccepted(env)) return { captured: false, reason: "telemetry disclosure not yet accepted (./organon.sh telemetry --accept)" }
    const parsed = TelemetryManifest.EventSchema.safeParse(event)
    if (!parsed.success) return { captured: false, reason: "event REJECTED — a field is absent from the pinned capture manifest (no covert capture)" }
    TelemetryStore.appendLocal(EVENTS_FILE, parsed.data as Record<string, unknown>, env)
    return { captured: true }
  }

  // ── the tester's full sight + control ──
  export function show(env: Env = process.env): Record<string, unknown>[] {
    return TelemetryStore.exportScrubbed(EVENTS_FILE, env)
  }
  export function exportEvents(env: Env = process.env): Record<string, unknown>[] {
    return TelemetryStore.exportScrubbed(EVENTS_FILE, env)
  }
  export function purge(): void {
    TelemetryStore.purge(EVENTS_FILE)
  }

  export interface ShareResult { shared: boolean; payload?: Record<string, unknown>[]; reason?: string }

  // share(): egress requires a SECOND explicit consent. The payload IS the scrubbed local export — nothing more. This
  // function assembles the payload; it performs NO network call itself (the Operator's act to transmit, disclosed).
  export function share(env: Env = process.env): ShareResult {
    if (env.ORGANON_TELEMETRY_SHARE !== "1")
      return { shared: false, reason: "sharing requires a SECOND explicit consent (ORGANON_TELEMETRY_SHARE=1); with a single consent, nothing leaves the machine" }
    return { shared: true, payload: exportEvents(env) }
  }

  export const DISCLOSURE = TelemetryManifest.DISCLOSURE
}
