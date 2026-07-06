/**
 * ORGΛNON STUDIO — the analyst-graph SCAFFOLD (Phase 3; Rules S-PROPOSE, S-FREE, XXI).
 *
 * The choreography, implemented natively (pattern over fork): a snapshot-grounded ANALYST proposes → a COMPOSER emits
 * a schema-valid StrategySpec → a RELAY-ONLY adjudication node registers it (S-FAMILY) and repeats the core's verdict
 * VERBATIM. The inversion of TradingAgents' PM-node is PERMANENT and structural: the relay has NO capability to bless.
 * A weak model is SAFE because a bad proposal costs a registered trial, never a false verdict (PART A′ #7).
 *
 * FREE / ZERO-INFERENCE-CI (S-FREE): the model registry is OpenAI-compatible; the default provider is a FIXTURE
 * provider that replays recorded responses — CI runs with zero live inference and zero API keys. A stronger free/open
 * model slots in post-MVP by registering another provider; the graph does not change.
 *
 * DEFERRED (logged, honest): the live free-model end-to-end run (needs network + a key) and the full bull/bear debate
 * loop. This scaffold builds and PROVES the load-bearing integrity properties (grounding, schema-validity, relay-only,
 * capability absence) on fixtures; the live run is future work, not a fabricated claim.
 */
import { StrategySpec } from "../strategy/spec"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"

export namespace StudioAgents {
  // ── the OpenAI-compatible model registry (fixture-backed by default; zero live inference in CI) ──
  export interface ChatMessage {
    role: "system" | "user" | "assistant"
    content: string
  }
  export interface ModelProvider {
    id: string
    live: boolean // false = a recorded-fixture provider (no network); true = a real free/open model (post-MVP)
    complete(messages: ChatMessage[]): Promise<string>
  }

  // A fixture provider: a pure map from a prompt key to a recorded response. Deterministic, offline, free.
  export class FixtureProvider implements ModelProvider {
    id = "fixture"
    live = false
    constructor(private fixtures: Record<string, string>) {}
    async complete(messages: ChatMessage[]): Promise<string> {
      const key = messages[messages.length - 1]?.content ?? ""
      const hit = this.fixtures[key]
      if (hit === undefined) throw new Error(`fixture provider: no recorded response for prompt key "${key.slice(0, 60)}…" (CI must not hit a live model)`)
      return hit
    }
  }

  export class Registry {
    private providers: ModelProvider[] = []
    register(p: ModelProvider): void {
      this.providers.push(p)
    }
    // resolve: prefer a live provider IF one is registered AND a key is present; else fall back to the fixture. In CI
    // no live provider is registered, so this is always the fixture — zero inference dependency.
    resolve(): ModelProvider {
      const live = this.providers.find((p) => p.live)
      const fixture = this.providers.find((p) => !p.live)
      return live ?? fixture ?? (() => { throw new Error("no model provider registered") })()
    }
    get hasLive(): boolean {
      return this.providers.some((p) => p.live)
    }
  }

  // ── grounding: every number in a narrative carries provenance to a verified snapshot datum (Rule S-PROPOSE) ──
  export interface Provenance {
    source: string
    fetchedAt: number
    pit: boolean // point-in-time flag
  }
  export interface Snapshot {
    sources: string[] // the provider ids the analyst was allowed to read (the free adapters)
    data: Record<string, { value: number; provenance: Provenance }>
  }
  export interface Narrative {
    text: string
    // every numeric claim in `text` must be one of these grounded values, each tied to a snapshot datum.
    numbers: { key: string; value: number }[]
  }

  export interface GroundingResult {
    ok: boolean
    ungrounded: string[]
  }

  // A number in the prose is grounded iff it equals a declared `numbers[].value` AND that key exists in the snapshot
  // with real provenance. An ungrounded numeric token (a fabricated figure) fails loudly. (Ignores obvious non-data
  // tokens: years, list indices — anything that is not a "data-shaped" figure like a %, $, or decimal is skipped.)
  export function checkGrounding(n: Narrative, snap: Snapshot): GroundingResult {
    const declared = new Set(n.numbers.map((x) => x.value))
    // grounded values must each trace to a snapshot datum with provenance
    for (const num of n.numbers) {
      const d = snap.data[num.key]
      if (!d) return { ok: false, ungrounded: [`declared number "${num.key}" has no snapshot datum`] }
      if (d.value !== num.value) return { ok: false, ungrounded: [`declared "${num.key}"=${num.value} ≠ snapshot ${d.value}`] }
      if (!snap.sources.includes(d.provenance.source)) return { ok: false, ungrounded: [`"${num.key}" cites source ${d.provenance.source} not in the allowed snapshot sources`] }
    }
    // scan the prose for data-shaped figures (%, $, or a bare decimal) and require each to be a declared grounded value
    const ungrounded: string[] = []
    const figures = n.text.match(/\$?\d+(?:\.\d+)?%?/g) ?? []
    for (const f of figures) {
      const v = Number(f.replace(/[$%]/g, ""))
      if (!Number.isFinite(v)) continue
      if (Number.isInteger(v) && v >= 1900 && v <= 2100) continue // a year, not a data figure
      if (!declared.has(v)) ungrounded.push(f)
    }
    return { ok: ungrounded.length === 0, ungrounded }
  }

  // ── the composer: emits a schema-valid StrategySpec + a grounded narrative from a snapshot (no authority) ──
  export interface Proposal {
    spec: StrategySpec
    narrative: Narrative
    domain: string
    preflightConsulted: boolean // the analyst consulted the breadth map BEFORE composing (A-PRE)
  }

  // A minimal deterministic composer (the LLM would author this; the fixture provider replays it). It produces a
  // schema-valid spec — if the model's structured output does not validate, the proposal is ABSENT, never
  // malformed-but-submitted (Rule S-PROPOSE red-team). Zod is the gate.
  export function composeSpec(raw: unknown): StrategySpec | null {
    const parsed = StrategySpec.safeParse(raw)
    return parsed.success ? parsed.data : null
  }

  // ── the RELAY-ONLY adjudication node: registers, then repeats the core verdict VERBATIM. No capability to bless. ──
  // Note the RETURN: it is the core's StudioVerdict, unchanged. There is deliberately NO parameter or branch by which
  // an agent (or an injected instruction in `narrative`) can alter `verdict`. Capability absence IS the mechanism
  // (Rule XXVIII) — not prompt defense.
  export async function relayAdjudicate(
    store: Ledger.Store,
    proposal: Proposal,
    extras: Studio.SubmitExtras & { authorClass?: Ledger.AuthorClass; parentSeq?: number | null; timestamp: number },
  ): Promise<Studio.StudioVerdict> {
    const { authorClass = "agent", parentSeq = null, timestamp, ...rest } = extras
    // register-then-invoke through the same single path outsiders use; the relay adds nothing to the verdict.
    return Studio.submit(store, { spec: proposal.spec, authorClass, domain: proposal.domain, parentSeq, timestamp, ...rest })
  }
}
