/**
 * ORGΛNON STUDIO — the ONE recorded LIVE free-model goal→verdict run (Phase 4; Rules S-PROPOSE, S-FREE; LIVE-RUN gate).
 * A non-expert's plain-language goal → a live open-weight model (Ollama, keyless/free) PROPOSES a StrategySpec → the
 * spec is schema-validated (invalid ⇒ withheld, never malformed-but-submitted) → registered on the DURABLE ledger →
 * adjudicated by the frozen core → the verdict is relayed VERBATIM → an honest report. Records a committed artifact
 * (model, transcript hash, spec hash, verdict reproHash, ledger ids) and proves verdict-path determinism in-run. CI
 * NEVER runs this (S-FREE: fixtures forever); it is an artifact, not a dependency.
 *
 * Run:  bun run script/live-run.ts "earn stable yield on USDC with low peg risk"
 */
import { writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { PKG_ROOT, REPO_ROOT } from "../src/organon/frozen"
import { Ollama } from "../src/studio/ollama"
import { StudioAgents } from "../src/studio/agents"
import { Durable } from "../src/studio/durable"
import { Studio } from "../src/studio/adjudicate"
import { StudioReport } from "../src/studio/report"

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")
const goal = process.argv[2] ?? "earn a stable, low-risk yield on USDC with limited exposure to any single issuer"

const SCHEMA_PROMPT = `You are a DeFi strategy composer. Output ONLY a single JSON object (no prose) for an RWA allocation strategy matching EXACTLY this schema:
{"family":"rwa-allocation","legs":[{"id":"<string>","weight":<0..1>}],"rebalance":{"trigger":"monthly|quarterly|drift","driftBps":<optional number>},"policy":"static|yield-rotation|constrained-carry|barbell|peg-defensive","constraints":{"maxWeightPerLeg":<optional 0..1>,"maxWeightPerIssuer":<optional 0..1>}}
Leg weights must sum to 1. Choose a policy and legs that fit the user's goal. Output JSON only.`

async function main() {
  const provider = new Ollama.OllamaProvider()
  const ledgerFile = path.join(PKG_ROOT, "data", "studio", "live-ledger.jsonl")
  mkdirSync(path.dirname(ledgerFile), { recursive: true })
  const durable = Durable.DurableStore.open(ledgerFile, { epochLabel: "2026-07-04" })

  console.log(`\nLIVE RUN · model=${provider.id}\nGOAL: "${goal}"\n`)
  console.log("→ asking the live model to PROPOSE a spec…")
  const transcript = await provider.complete([
    { role: "system", content: SCHEMA_PROMPT },
    { role: "user", content: `Goal: ${goal}` },
  ])
  const raw = Ollama.extractJson(transcript)
  const spec = StudioAgents.composeSpec(raw) // schema gate — null if invalid
  if (!spec) {
    console.log(`\n✗ the model's proposal did NOT validate against the schema — proposal WITHHELD (S-PROPOSE), never malformed-but-submitted.`)
    console.log(`  (raw model output head: ${transcript.slice(0, 200).replace(/\n/g, " ")}…)`)
    process.exit(2)
  }
  console.log(`✓ model proposed a schema-valid spec: policy=${(spec as any).policy}, legs=${(spec as any).legs.length}`)

  // a disclosed, deterministic illustrative backtest series (the LIVE element is the model→spec; the returns are a
  // fixed stand-in for a real backtest, labeled as such in the artifact — no fabricated track record).
  const R = Array.from({ length: 260 }, (_, i) => 0.008 * Math.sin(i / 6) + 0.0015)

  // register on the DURABLE ledger, then adjudicate — verbatim verdict from the frozen core.
  durable.register({ spec, authorClass: "agent", authorId: "live-demo", domain: "rwa", parentSeq: null, timestamp: 1_700_000_000_000 })
  const verdict = await Studio.adjudicateRegistered(durable.store, spec, { returns: R, barsPerYear: 365 })

  // verdict-path DETERMINISM proven in-run: re-adjudicate → identical reproHash (the live model did not perturb it).
  const again = await Studio.adjudicateRegistered(durable.store, spec, { returns: R, barsPerYear: 365 })
  const deterministic = verdict.attestation.reproHash === again.attestation.reproHash

  const report = StudioReport.render(verdict)
  console.log(`\nVERDICT (verbatim from the frozen core): ${verdict.attestation.verdict}`)
  console.log(`verdict-path deterministic in-run: ${deterministic}\n`)
  console.log(report)

  const artifact = {
    protocol: "live-run",
    model: provider.id,
    endpoint: Ollama.ENDPOINT,
    goal,
    transcriptHash: sha256(transcript),
    proposedSpec: spec,
    specHash: verdict.specHash,
    verdictReproHash: verdict.attestation.reproHash,
    verdict: verdict.attestation.verdict,
    verdictPathDeterministic: deterministic,
    ledger: { seq: verdict.ledgerSeq, familySize: verdict.family.size, rootCount: verdict.rootCount, durableLatestHash: durable.latestHash() },
    returnsDisclosure: "the returns are a fixed illustrative backtest series (deterministic), NOT a live/real track record; the LIVE element is the model turning a sentence into a registered, adjudicated spec.",
    honestReport: report,
  }
  const outPath = path.join(PKG_ROOT, "data", "studio", "live-run-artifact.json")
  writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n")
  console.log(`\nartifact committed-ready: ${path.relative(REPO_ROOT, outPath)}  (transcript sha ${artifact.transcriptHash.slice(0, 12)}…)`)
}
main()
