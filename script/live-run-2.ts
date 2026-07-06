/**
 * ORGΛNON STUDIO — the SECOND recorded LIVE free-model trial (Convergence Phase 0; V5 debt item). The first live trial
 * (V5) showed one live proposal → CONDITIONAL at a search of 1. This one shows the OTHER half of the honesty: the
 * demo's OWN search deflates its OWN score. A live open-weight model (Ollama, keyless/free) is asked to ITERATE on the
 * SAME goal — proposing several distinct allocations, a genuine model-driven search. Each proposal is a registered
 * trial in one lineage family; the registered family size feeds the frozen core's deflation as declaredNTrials. So the
 * verdict that was CONDITIONAL when the model had "tried once" becomes NO-GO once the ledger counts how many times it
 * actually tried. The model iterating to look better makes the bar HARDER — the anti-PBO mechanism, on live output.
 *
 * The returns are a fixed, disclosed illustrative backtest series (deterministic) — NOT a real track record; the LIVE
 * element is the model turning a sentence into N registered, adjudicated specs. CI never runs this (S-FREE).
 *
 * Run:  bun run script/live-run-2.ts
 */
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { PKG_ROOT, REPO_ROOT } from "../src/organon/frozen"
import { Ollama } from "../src/studio/ollama"
import { StudioAgents } from "../src/studio/agents"
import { Durable } from "../src/studio/durable"
import { Studio } from "../src/studio/adjudicate"
import { StudioReport } from "../src/studio/report"
import { Ledger } from "../src/ledger/ledger"

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")
const goal = "earn a stable, low-risk yield on USDC with limited exposure to any single issuer"
const NEED = 8 // the family size at which the borderline series flips CONDITIONAL→NO-GO (probed: flip at family=8)
const MAX_ATTEMPTS = 25
const T = 1_700_000_000_000

// the same borderline illustrative series the scripted demo uses: CONDITIONAL at a search of 1, NO-GO by family=8.
function seededNormalSeries(seed: number, drift: number, vol: number, n: number): number[] {
  let s = seed >>> 0
  const u = () => ((s = (s + 0x6d2b79f5) | 0), ((t) => ((t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296))(s))
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(u(), 1e-12), u2 = u()
    out.push(drift + vol * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2))
  }
  return out
}
const R = seededNormalSeries(1, 0.125, 0.9, 260)

const SCHEMA = `You are a DeFi strategy composer. Output ONLY a single JSON object (no prose) for an RWA allocation strategy matching EXACTLY this schema:
{"family":"rwa-allocation","legs":[{"id":"<string>","weight":<0..1>}],"rebalance":{"trigger":"monthly|quarterly|drift","driftBps":<optional number>},"policy":"static|yield-rotation|constrained-carry|barbell|peg-defensive","constraints":{"maxWeightPerLeg":<optional 0..1>,"maxWeightPerIssuer":<optional 0..1>}}
Leg weights must sum to 1. Output JSON only.`

async function completeWithTimeout(provider: Ollama.OllamaProvider, messages: StudioAgents.ChatMessage[], ms: number): Promise<string | null> {
  return Promise.race([provider.complete(messages), new Promise<null>((r) => setTimeout(() => r(null), ms))])
}

async function main() {
  const provider = new Ollama.OllamaProvider()
  console.log(`\nSECOND LIVE TRIAL · model=${provider.id}\nGOAL: "${goal}"\nasking the model to ITERATE — a genuine live search over the same goal (temp=0, so each ask varies the prompt with prior tries)…\n`)

  // collect NEED distinct, schema-valid specs from live model iteration
  const specs: any[] = []
  const transcripts: string[] = []
  const seen = new Set<string>()
  let attempts = 0
  while (specs.length < NEED && attempts < MAX_ATTEMPTS) {
    attempts++
    const priorDesc = specs.map((s, i) => `#${i + 1}: policy=${s.policy}, weights=[${s.legs.map((l: any) => l.weight).join(",")}]`).join("; ") || "(none yet)"
    const ask = specs.length === 0
      ? `Goal: ${goal}`
      : `Goal: ${goal}\nYou have ALREADY proposed these allocations: ${priorDesc}.\nPropose a genuinely DIFFERENT allocation for the same goal (different policy and/or clearly different weights). Output JSON only.`
    const t = await completeWithTimeout(provider, [{ role: "system", content: SCHEMA }, { role: "user", content: ask }], 45_000)
    if (t === null) { console.log(`  attempt ${attempts}: (timeout — skipped)`); continue }
    const spec = StudioAgents.composeSpec(Ollama.extractJson(t))
    if (!spec) { console.log(`  attempt ${attempts}: proposal did NOT validate — withheld (S-PROPOSE)`); continue }
    const h = Ledger.hashSpec(spec)
    if (seen.has(h)) { console.log(`  attempt ${attempts}: duplicate spec — not a new trial, re-asking`); continue }
    seen.add(h); specs.push(spec); transcripts.push(t)
    console.log(`  ✓ proposal ${specs.length}/${NEED}: policy=${(spec as any).policy}, legs=${(spec as any).legs.length}  (spec ${h.slice(0, 10)}…)`)
  }

  if (specs.length < NEED) {
    console.log(`\n✗ the live model produced only ${specs.length}/${NEED} distinct valid specs in ${attempts} attempts — NOT claiming the flip. Honest shortfall recorded; re-run when the endpoint is cooperative.`)
    process.exit(2)
  }

  // fresh durable ledger for this trial (its own committed artifact; does not touch the V5 live-ledger)
  const ledgerFile = path.join(PKG_ROOT, "data", "studio", "live-run-2.jsonl")
  if (existsSync(ledgerFile)) rmSync(ledgerFile) // this script is the sole author of this file; reproducible from scratch
  mkdirSync(path.dirname(ledgerFile), { recursive: true })
  const durable = Durable.DurableStore.open(ledgerFile, { epochLabel: "2026-07-04" })

  // (1) the model's FIRST idea, adjudicated when the ledger has counted a search of ONE
  durable.register({ spec: specs[0], authorClass: "agent", authorId: "live-search", domain: "rwa", parentSeq: null, timestamp: T })
  const v1 = await Studio.adjudicateRegistered(durable.store, specs[0], { returns: R, barsPerYear: 365 })
  console.log(`\nfamily=1  · DSR@${v1.familyDeclaredNTrials}=${v1.attestation.dsrAtDeclared?.toFixed(3)} · verdict=${v1.attestation.verdict}   ← the model, having "tried once"`)

  // (2) register the rest of the model's search as ONE lineage family, then adjudicate the last at the true search size
  let parent = durable.store.get(durable.store.length - 1)!.seq
  for (let i = 1; i < specs.length; i++) parent = durable.register({ spec: specs[i], authorClass: "agent", authorId: "live-search", domain: "rwa", parentSeq: parent, timestamp: T + i }).seq
  const vN = await Studio.adjudicateRegistered(durable.store, specs[specs.length - 1], { returns: R, barsPerYear: 365 })
  console.log(`family=${vN.family.size}  · DSR@${vN.familyDeclaredNTrials}=${vN.attestation.dsrAtDeclared?.toFixed(3)} · verdict=${vN.attestation.verdict}   ← the SAME model, once the ledger counts how many times it actually tried`)

  const flipped = v1.attestation.verdict !== vN.attestation.verdict && vN.attestation.verdict === "NO-GO"
  console.log(`\n→ the demo's own live search deflated its own score: ${v1.attestation.verdict} @1  ⇒  ${vN.attestation.verdict} @${vN.family.size}.  ${flipped ? "The bar got HARDER because the model iterated." : "(no flip — see numbers)"}`)
  console.log(`  chain intact: ${durable.verifyChain().ok}  ·  family reproducible from ledger alone: ${Ledger.Store.fromJSONL(durable.store.toJSONL()).familySize(Ledger.hashSpec(specs[0])) === specs.length}`)
  console.log(`\nPLAIN-LANGUAGE REPORT (what a non-expert sees at family=${vN.family.size}):\n`)
  console.log(StudioReport.render(vN))

  const artifact = {
    protocol: "live-run-2 (second live trial — the demo's own search deflates its own score)",
    model: provider.id,
    endpoint: Ollama.ENDPOINT,
    goal,
    liveSearch: { distinctProposals: specs.length, attempts, specs, transcriptHashes: transcripts.map(sha256) },
    atSearchOfOne: { familySize: 1, declaredNTrials: v1.familyDeclaredNTrials, dsr: v1.attestation.dsrAtDeclared, verdict: v1.attestation.verdict, reproHash: v1.attestation.reproHash },
    atTrueSearch: { familySize: vN.family.size, declaredNTrials: vN.familyDeclaredNTrials, dsr: vN.attestation.dsrAtDeclared, verdict: vN.attestation.verdict, reproHash: vN.attestation.reproHash },
    flippedConditionalToNoGo: flipped,
    chainIntact: durable.verifyChain().ok,
    durableLatestHash: durable.latestHash(),
    returnsDisclosure: "returns are a FIXED illustrative backtest series (deterministic), NOT a real track record; the LIVE element is the model iterating a sentence into N registered, adjudicated specs, and the ledger counting that search.",
  }
  const outPath = path.join(PKG_ROOT, "data", "studio", "live-run-2-artifact.json")
  writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n")
  console.log(`\nartifact committed-ready: ${path.relative(REPO_ROOT, outPath)}`)
}
main()
