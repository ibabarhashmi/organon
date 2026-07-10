/**
 * ORGΛNON — THE SCRUBBED LOGGER (Alpha Phase 4; X-STRANGER, S49). A key literal can NEVER print: every log/error
 * string that could carry ambient secrets passes through `redact`, which replaces the VALUE of every secret-shaped
 * env var (name matching KEY/TOKEN/SECRET/PASSWORD, value long enough to be a credential) with `<redacted:NAME>`.
 * Pure over an injectable env (the wall test seeds keys and proves the scrub bites). This is a REDACTION layer, not
 * a detector — it removes known secrets from output; it never logs what it removed.
 */
export namespace Scrub {
  const SECRET_NAME = /(KEY|TOKEN|SECRET|PASSWORD)/i
  const MIN_LEN = 8 // shorter values are not credentials (and replacing them would shred ordinary text)

  export function secretValues(env: Record<string, string | undefined> = process.env): Map<string, string> {
    const out = new Map<string, string>()
    for (const [name, value] of Object.entries(env)) {
      if (value && value.length >= MIN_LEN && SECRET_NAME.test(name)) out.set(name, value)
    }
    return out
  }

  export function redact(text: string, env: Record<string, string | undefined> = process.env): string {
    let out = text
    for (const [name, value] of secretValues(env)) {
      // split-join, not regex — a key value is untrusted text and must never be compiled into a pattern
      out = out.split(value).join(`<redacted:${name}>`)
    }
    return out
  }

  // the scrubbed console — for serve/CLI paths that print ambient strings (URLs, error messages) a key could ride
  export function log(...parts: unknown[]): void {
    console.log(...parts.map((p) => (typeof p === "string" ? redact(p) : p)))
  }
  export function error(...parts: unknown[]): void {
    console.error(...parts.map((p) => (typeof p === "string" ? redact(p) : p)))
  }
}
