/**
 * ORGΛNON — THE SCRUBBED LOCAL-FIRST STORE (Probe Phase 2; X-TELEMETRY). The one primitive both telemetry AND feedback
 * use (PART CLEAN's second caller): scrub-then-append to a gitignored local file, plus the tester's full sight + control
 * (show / export / purge). LOCAL-FIRST — nothing here ever performs network egress; sharing is a separate, second-consent
 * act (see telemetry.ts share()). The scrub REUSES the Alpha scrubber (Scrub.redact — ambient env-secret VALUES) and
 * EXTENDS it for telemetry: eth-address-shaped (0x·40), txhash-shaped (0x·64), and bearer-shaped tokens are masked in any
 * string field. Imports ONLY node stdlib + Scrub — a verdict-path-forbidden consumer (no scored module).
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Scrub } from "../util/scrub"

export namespace TelemetryStore {
  export const DIR = path.join(PKG_ROOT, "data", "telemetry") // gitignored — local-first, never committed

  // scrub ANY string value: ambient secrets (Scrub.redact) + address/txhash/bearer masking. Non-strings pass through.
  export function scrubValue(v: unknown, env: Record<string, string | undefined> = process.env): unknown {
    if (typeof v !== "string") return v
    let s = Scrub.redact(v, env) // env-secret VALUES → <redacted:NAME>
    s = s.replace(/0x[a-fA-F0-9]{64}/g, "<txhash>") // 32-byte hashes first (longer match)
    s = s.replace(/0x[a-fA-F0-9]{40}/g, "<address>") // eth addresses — a typed pool/wallet address is never stored raw
    s = s.replace(/\b(sk|gsk|xai|pk)[-_][A-Za-z0-9]{16,}\b/g, "<token>") // provider-key-shaped literals, belt-and-suspenders
    return s
  }

  function scrubRecord(rec: Record<string, unknown>, env: Record<string, string | undefined>): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rec)) out[k] = scrubValue(v, env)
    return out
  }

  export function appendLocal(file: string, record: Record<string, unknown>, env: Record<string, string | undefined> = process.env): void {
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
    appendFileSync(path.join(DIR, file), JSON.stringify(scrubRecord(record, env)) + "\n")
  }

  export function readLocal(file: string): Record<string, unknown>[] {
    const p = path.join(DIR, file)
    if (!existsSync(p)) return []
    return readFileSync(p, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>)
  }

  export function purge(file: string): void {
    const p = path.join(DIR, file)
    if (existsSync(p)) rmSync(p)
  }

  // export = the scrubbed local records, re-scrubbed at the boundary (belt-and-suspenders: an export never leaks even if a
  // future field bypassed capture-time scrubbing). This IS the payload that a second-consent share() would send.
  export function exportScrubbed(file: string, env: Record<string, string | undefined> = process.env): Record<string, unknown>[] {
    return readLocal(file).map((r) => scrubRecord(r, env))
  }
}
