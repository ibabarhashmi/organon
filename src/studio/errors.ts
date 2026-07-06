/**
 * ORGΛNON STUDIO — the ERROR-STATE CATALOG (Convergence Phase 2; Rule S-HONEST-UX). Every failure a user can reach
 * renders a PLAIN-LANGUAGE, TWO-SIDED, NON-PRIMING state — it says what happened, what you can do, and what it does
 * NOT mean (so a refusal is never read as "you did something wrong" and never nudges you toward paying/enrolling).
 * A dead-end or a raw stack is the dishonesty this product exists to refuse; an honest error is the product working.
 */
export namespace StudioErrors {
  export interface ErrorState {
    code: string
    plain: string // what happened, in plain language
    whatYouCanDo: string // the constructive next step (never "buy"/"upgrade")
    whatItDoesNotMean: string // the two-sided guard against mis-reading the refusal
  }

  export const CATALOG: Record<string, ErrorState> = {
    "malformed-json": {
      code: "malformed-json",
      plain: "The request body was not valid JSON, so nothing was registered or adjudicated.",
      whatYouCanDo: "Check the JSON syntax (matching braces, quoted keys) and resend the same request.",
      whatItDoesNotMean: "It does not mean your strategy is bad — nothing about the strategy was evaluated.",
    },
    "bad-spec": {
      code: "bad-spec",
      plain: "The spec did not match the schema (an RWA allocation with legs that sum to 1, a policy, and a rebalance trigger), so it was withheld — never adjudicated malformed.",
      whatYouCanDo: "Fix the spec against src/strategy/spec.ts and resubmit; a valid spec always gets a verdict.",
      whatItDoesNotMean: "A rejected spec is not a NO-GO — it was never scored; the door is still open.",
    },
    "payload-too-large": {
      code: "payload-too-large",
      plain: "The request exceeded the size cap, so it was not processed.",
      whatYouCanDo: "Trim the payload (fewer return points per request, or a smaller panel) and resend.",
      whatItDoesNotMean: "The cap is a resource guard, not a judgment on the strategy.",
    },
    "unauthorized": {
      code: "unauthorized",
      plain: "This served instance requires a credential on mutating routes and none (or a wrong one) was supplied.",
      whatYouCanDo: "Add the Authorization: Bearer <token> header the operator gave you and resend.",
      whatItDoesNotMean: "It is not a verdict; read-only views (dashboard, /trust) remain open to everyone.",
    },
    "rate-limited": {
      code: "rate-limited",
      plain: "You sent requests faster than the per-caller limit allows, so this one was declined.",
      whatYouCanDo: "Wait for the window to reset and resend; the limit exists so the ledger stays fair to everyone.",
      whatItDoesNotMean: "It does not mean your submissions were rejected on their merits — none were scored.",
    },
    "ledger-bypass": {
      code: "ledger-bypass",
      plain: "You asked for a verdict on a spec that was never registered. There is no verdict without a counted trial (that is the one rule).",
      whatYouCanDo: "Submit through submit_spec (which registers then adjudicates atomically), then read the verdict.",
      whatItDoesNotMean: "The refusal is not a bug and not a NO-GO — it is the ledger refusing a back door.",
    },
    "clock-not-ticking": {
      code: "clock-not-ticking",
      plain: "This forward domain has no fresh capture stamps, so its clock reads NOT TICKING (an honest gap, not a fabricated number).",
      whatYouCanDo: "Run the capture scheduler; stamps will accrue and the clock will read TICKING with its stamp ages.",
      whatItDoesNotMean: "A gap is disclosed, never interpolated — a missing point is shown as missing, not smoothed over.",
    },
    "sidecar-not-setup": {
      code: "sidecar-not-setup",
      plain: "The adjudication engine (a Python sidecar that runs the frozen rigor math) is not set up in this clone, so no verdict could be produced.",
      whatYouCanDo: "Run the one-time setup: `cd src/backtest/py && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` (or `./organon-setup.sh`), then resubmit.",
      whatItDoesNotMean: "It is an environment/setup gap, not a verdict — nothing about your strategy was judged, and no result was faked to cover the gap.",
    },
    "model-endpoint-down": {
      code: "model-endpoint-down",
      plain: "The free model endpoint did not respond, so no proposal was generated (and none was faked).",
      whatYouCanDo: "Start the local endpoint (Ollama) or retry later; the verdict path never depended on the model anyway.",
      whatItDoesNotMean: "A model outage cannot change any verdict — the model only proposes; the frozen core disposes.",
    },
    "internal": {
      code: "internal",
      plain: "Something unexpected went wrong on the server; it returned an honest error envelope instead of a raw stack.",
      whatYouCanDo: "Retry; if it persists, the detail field and the logs point to the cause — this is a bug to file.",
      whatItDoesNotMean: "An internal error is never a verdict and never a GO or NO-GO about your strategy.",
    },
  }

  export function state(code: string): ErrorState | null {
    return CATALOG[code] ?? null
  }
  // enrich a terse error envelope with the plain-language, two-sided state (for the served surface + reports)
  export function enrich(code: string, detail?: string): { ok: false; error: string; detail?: string; message?: ErrorState } {
    const s = state(code)
    return { ok: false, error: code, ...(detail ? { detail } : {}), ...(s ? { message: s } : {}) }
  }
}
