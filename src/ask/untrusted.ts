/**
 * ORGΛNON — THE SHOWING SPRINT (V34, S88 / DD-5). THE UNTRUSTED BOUNDARY, SEALED FOR REAL. The Ask path quotes the user's
 * query toward the model inside a guillemet data-fence (««« … »»») and labels it untrusted. The V34 audit (B-4) named the
 * textbook delimiter-injection: a query containing »»» terminates its OWN data block and escapes into instruction context.
 *
 * The fix is belt-and-braces: (1) STRIP any fence run from the content — the payload cannot carry the fence; (2) wrap in a
 * PER-REQUEST CSPRNG NONCE fence — even a user who knows the format cannot reconstruct the closing token. R-2: the nonce is
 * from a CSPRNG (node:crypto), per request, and appears NOWHERE in user-reachable output; stripping happens HERE, at the
 * Ask-PROMPT boundary ONLY — never in the stored manifest (the stored thesis is always the user's bytes; a silently-altered
 * content-hashed thesis that hashes differently than what the user typed would be an X-HONEST violation).
 *
 * THE HONEST LIMIT, owned (A8): this closes the MECHANICAL injection (a payload terminating its own block). It does NOT
 * close the SEMANTIC one (a model persuaded to ignore its framing). ORGΛNON can FIELD text as untrusted; it cannot make a
 * model HONOR the flag — which is exactly why the deterministic output gates (the ONE advice guard, S87) sit downstream.
 */
import { randomBytes } from "node:crypto"

export namespace Untrusted {
  // any run of 2+ guillemets — the fence tokens ««« »»» (and the shorter «« »» variants). Stripped from user content so a
  // payload cannot smuggle a fence. A lone « or » (legitimate punctuation) is left intact — only fence-length runs are removed.
  const FENCE = /[«»]{2,}/g
  export const OPEN = "«««"
  export const CLOSE = "»»»"

  export function strip(text: string): string {
    return text.replace(FENCE, " ") // collapse any fence run to a space; the content can no longer terminate its own block
  }

  // a per-request CSPRNG nonce (18 hex chars). Not derivable from anything the user controls (R-2) — never a hash of the
  // query or a timestamp. It is used only in the fence tokens, never echoed to the user.
  export function nonce(): string {
    return randomBytes(9).toString("hex")
  }

  // wrap(text, n) → the fenced, nonce-guarded user block. Keeps the leading "«««" (so the S85 untrusted-quoting format
  // holds) and interleaves the nonce, so the closing token is «««n … n»»» — unguessable and unstrippable by the payload.
  export function wrap(text: string, n: string): string {
    return `${OPEN}${n}\n${strip(text)}\n${n}${CLOSE}`
  }
}
