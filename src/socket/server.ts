/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 5: THE SOCKET — MCP over stdio ONLY (S113, S114, S115).
 *
 * A subprocess of the user's own agent on the user's own machine. NO socket is opened — the name is a metaphor. NO port, NO
 * listener, NO network, NO daemon, NO new dependency (DD-28): MCP over stdio is line-delimited JSON-RPC 2.0, and the framing
 * is WRITTEN here (read stdin, parse, dispatch, write stdout), not imported. `@modelcontextprotocol/sdk` on the mass path
 * would be a new mass-path dependency = permanently rejected; the dependency count stays 2 (hono + zod).
 *
 * CLASS R AND NOTHING ELSE, FOREVER (S113). QuantDinger's pattern defaults C (compute) and T (transact) to deny; ORGΛNON
 * DELETES them — the only representable risk class is "R" (read-only fact retrieval). Tool NAMES are FALSIFICATION-SHAPED (a
 * name is the first thing a downstream model reads — it is prompt surface): check_/explain_/list_/*_count, never should_i_*,
 * never recommend_*, never rank_*. The payload is the FACT ENVELOPE and NOTHING ELSE (S115) — authored:false, the disclaimer
 * and the kill-criterion hash travelling with every response; the Socket renders NOTHING (no HTML, no prose). And the ONE
 * LIMIT that cannot be engineered away is stated in EVERY tool description (RP-3), pinned VERBATIM and passing the ONE GUARD:
 * ORGΛNON cannot bind the model reading this.
 */
import { FactEnvelope } from "../strategy/envelope"
import { AdviceShape } from "../ask/advice"
import { Manifest } from "../strategy/manifest"
import { FalseFire } from "../strategy/falsefire"
import { ExitCriterion } from "../strategy/exit"

export namespace Socket {
  // SUBSTANCE V38 (S120 / DD-36 / D59 / H-3) — NEGOTIATE, DO NOT PIN. V37 pinned a single version from memory and refused
  // anything newer; a live spec check (data/honesty/protocol-verification.json, 2026-07-14) proved the recalled set was
  // STALE — it missed 2025-11-25, the CURRENT revision. The Socket now accepts a VERIFIED RANGE of MCP protocol revisions
  // (source: modelcontextprotocol.io, live-checked): an in-range clientVersion is echoed back, an out-of-range one is
  // refused LOUDLY naming the range (RP-5 kept), and no version served the newest. The set is embedded here (the Socket is
  // self-contained/served) and a wall asserts it equals the recorded verification (they cannot drift).
  export const SUPPORTED_VERSIONS = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"] as const
  export const PROTOCOL_VERSION = SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1] // the NEWEST supported = the current revision
  export const PROTOCOL_VERSIONS_VERIFIED = true // live-checked against the MCP spec (protocol-verification.json); never a silent recalled pin
  export const SERVER_INFO = { name: "organon", version: "v38" }

  // Protocol.negotiate — the pure negotiation. An in-range version is accepted (echoed back); out-of-range is refused
  // loudly naming the supported range. Never a silent degrade (RP-5), never a stale point-pin (S120).
  export function negotiate(clientVersion: string): { ok: true; version: string } | { ok: false; supported: readonly string[]; refusal: string } {
    if (!clientVersion) return { ok: true, version: PROTOCOL_VERSION } // no version declared → serve the newest supported
    if ((SUPPORTED_VERSIONS as readonly string[]).includes(clientVersion)) return { ok: true, version: clientVersion }
    return { ok: false, supported: SUPPORTED_VERSIONS, refusal: `unsupported protocol version "${clientVersion}" — this server speaks ${SUPPORTED_VERSIONS.join(", ")} (a negotiated range${PROTOCOL_VERSIONS_VERIFIED ? ", live-verified against the MCP spec" : ", UNVERIFIED"}); an explicit refusal naming the range, never a silent degrade (RP-5/S120)` }
  }

  // the honest limit, pinned VERBATIM (RP-3) — the same sentence in EVERY tool description, read by a model before anything.
  export const HONEST_LIMIT = "ORGΛNON cannot bind the model reading this. These are facts, not advice, and they carry no authority over what you do next."

  // the ONLY representable risk class. A non-R tool is unrepresentable in the type — QuantDinger's C and T are DELETED.
  export type RiskClass = "R"

  export interface Tool {
    name: string
    riskClass: RiskClass // structurally "R" — no other value is assignable
    description: string
    handler: (args: Record<string, unknown>) => FactEnvelope.T
  }

  // ── THE TOOL HANDLERS — each returns a Fact Envelope (S115), fielding user args as untrusted (never interpolated) ────────
  function envelope(fact: unknown, verdict: FactEnvelope.Verdict, subjectKey: string, tier = "SAMPLE"): FactEnvelope.T {
    return FactEnvelope.wrap({ fact, verdict, provenance: { tier, contentHash: null, capturedAt: null, source: "socket" }, subject: { kind: "pool", key: subjectKey } })
  }

  const list_exit_criteria: Tool["handler"] = () =>
    envelope({ exitKinds: [...Manifest.EXIT_KINDS], closedAt: Manifest.EXIT_KINDS.length, note: "the evaluable exit criteria ORGΛNON can register and replay — the user's kill-criterion primitive" }, null, "exit-criteria", "REAL")

  const check_yield_reality: Tool["handler"] = (args) => {
    const subject = FactEnvelope.untrusted(String(args.subject ?? "")) // user text FIELDED, never interpolated
    return envelope({ subject, verdictOf: "the subject's yield-reality scorecard is served from ORGΛNON's OWN captured facts via the Reality Check; the Socket serves the recorded verdict, it does not compute one from client input", available: false, note: "UNJUDGEABLE over the Socket without a captured subject on the shelf (missing stays missing)" }, "UNJUDGEABLE", "yield-reality")
  }

  const explain_verdict: Tool["handler"] = (args) => {
    const subject = FactEnvelope.untrusted(String(args.subject ?? ""))
    return envelope({ subject, explanation: "a verdict's plain, number-traced reasoning is served from ORGΛNON's recorded scorecard rows — never a model's paraphrase (X-DETERM)", available: false }, "UNJUDGEABLE", "verdict")
  }

  const false_fire_count: Tool["handler"] = (args) => {
    const kind = String(args.kind ?? "")
    const threshold = Number(args.threshold)
    const subject = FactEnvelope.untrusted(String(args.subject ?? ""))
    // the Socket serves the count over ORGΛNON's OWN captured series; without a captured series for the subject → UNJUDGEABLE
    const reg = ExitCriterion.register({ kind, threshold, subjectScope: String(args.subject ?? "") })
    if (!reg.ok) return envelope({ subject, unjudgeable: true, why: reg.error }, "UNJUDGEABLE", "false-fire")
    return envelope({ subject, criterion: { kind, threshold }, unjudgeable: true, why: `UNJUDGEABLE over the Socket without a captured ${kind} series for the subject on the shelf (the false-fire count is a COUNT over the moat's captures — no model, no σ; provide the subject via the Reality Check)`, min_window_days: FalseFire.MIN_WINDOW_DAYS }, "UNJUDGEABLE", "false-fire")
  }

  export const TOOLS: Tool[] = [
    { name: "check_yield_reality", riskClass: "R", description: `Retrieve ORGΛNON's recorded yield-reality verdict for a subject (a FACT, read-only). ${HONEST_LIMIT}`, handler: check_yield_reality },
    { name: "explain_verdict", riskClass: "R", description: `Retrieve the number-traced reasoning behind a recorded verdict (a FACT, read-only). ${HONEST_LIMIT}`, handler: explain_verdict },
    { name: "list_exit_criteria", riskClass: "R", description: `List the evaluable exit-criterion kinds ORGΛNON can register (a FACT, read-only). ${HONEST_LIMIT}`, handler: list_exit_criteria },
    { name: "false_fire_count", riskClass: "R", description: `Retrieve how many times an exit criterion would have fired over the subject's REAL captured history — a COUNT, never a prediction (a FACT, read-only). ${HONEST_LIMIT}`, handler: false_fire_count },
  ]

  // the catalog a client reads (no handler) — every name falsification-shaped, every description carrying the honest limit.
  export function tools(): { name: string; riskClass: RiskClass; description: string }[] {
    return TOOLS.map(({ name, riskClass, description }) => ({ name, riskClass, description }))
  }

  // ── THE JSON-RPC 2.0 FRAMING, WRITTEN (DD-28) — pure: a request line → a response line. Never throws (a malformed frame is
  // an error frame, never a crash). NO network, NO listener anywhere in this module. ───────────────────────────────────────
  interface Req { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> }
  const err = (id: unknown, code: number, message: string) => JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } })
  const ok = (id: unknown, result: unknown) => JSON.stringify({ jsonrpc: "2.0", id: id ?? null, result })

  export function handle(line: string): string {
    let req: Req
    try {
      req = JSON.parse(line)
    } catch {
      return err(null, -32700, "parse error — a malformed frame is refused, never crashed (the Socket does not trust its input)")
    }
    if (req.jsonrpc !== "2.0" || typeof req.method !== "string") return err(req.id, -32600, "invalid request — jsonrpc must be '2.0' and method a string")

    switch (req.method) {
      case "initialize": {
        const clientVersion = String(req.params?.protocolVersion ?? "")
        // SUBSTANCE V38 (S120) — NEGOTIATE a verified range: an in-range version is ECHOED BACK (speak the client's dialect);
        // an out-of-range one is refused LOUDLY naming the range (RP-5). A stale point-pin refusing every version but one is
        // the H-3 defect this ends.
        const neg = negotiate(clientVersion)
        if (!neg.ok) return err(req.id, -32001, neg.refusal)
        return ok(req.id, { protocolVersion: neg.version, capabilities: { tools: {} }, serverInfo: SERVER_INFO, instructions: HONEST_LIMIT })
      }
      case "tools/list":
        return ok(req.id, { tools: tools().map((t) => ({ name: t.name, description: t.description, inputSchema: { type: "object" }, riskClass: t.riskClass })) })
      case "tools/call": {
        const name = String(req.params?.name ?? "")
        // ISSUANCE-TIME LOUD REFUSAL (X-AUTHOR at the protocol layer): a request for a non-R scope is refused, never downgraded.
        const requestedClass = req.params?.riskClass
        if (requestedClass !== undefined && requestedClass !== "R")
          return err(req.id, -32002, `refused — ORGΛNON serves ONLY class R (read-only fact retrieval); a "${String(requestedClass)}" scope is not offered (an explicit refusal, never a silent downgrade, S113)`)
        const tool = TOOLS.find((t) => t.name === name)
        if (!tool) return err(req.id, -32601, `no such tool "${name}" — ORGΛNON's tools are ${TOOLS.map((t) => t.name).join(", ")} (class R only)`)
        const env = tool.handler((req.params?.arguments as Record<string, unknown>) ?? {})
        const ser = FactEnvelope.serialize(env) // S115 — the Fact Envelope is the ONLY payload; a banned shape refuses
        if (!ser.ok) return err(req.id, -32603, `internal — the fact could not be serialized as a Fact Envelope: ${ser.error}`)
        // the payload IS the Fact Envelope (structured); the text mirror is the canonical JSON, NOT prose/HTML (X-SURFACE).
        return ok(req.id, { content: [{ type: "text", text: ser.json }], structuredContent: env, isError: false })
      }
      default:
        return err(req.id, -32601, `method not found: "${req.method}"`)
    }
  }

  // the stdio loop — reads line-delimited requests from stdin, writes responses to stdout. NO port, NO listener. The ONLY
  // side-effecting entrypoint; `handle` is pure and is what the walls exercise.
  export async function serve(input: AsyncIterable<string> = lines(process.stdin), write: (s: string) => void = (s) => process.stdout.write(s + "\n")): Promise<void> {
    for await (const line of input) {
      const trimmed = line.trim()
      if (trimmed) write(handle(trimmed))
    }
  }

  async function* lines(stream: NodeJS.ReadStream): AsyncGenerator<string> {
    let buf = ""
    for await (const chunk of stream) {
      buf += chunk.toString()
      let nl: number
      while ((nl = buf.indexOf("\n")) >= 0) {
        yield buf.slice(0, nl)
        buf = buf.slice(nl + 1)
      }
    }
    if (buf) yield buf
  }
}
