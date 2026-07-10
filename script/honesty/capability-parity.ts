/**
 * ORGΛNON — THE CAPABILITY-PARITY DIFFERENTIAL (Alpha Phase 3; X-CAPABILITY c, S48 — the sprint's flagship wall).
 * The full verdict surface computed under the THREE key profiles — zero-key · free-key · paid-key (model paid tier +
 * DeFiLlama Pro, fake keys, hermetic: nothing goes live) — must be BYTE-IDENTICAL: the shelf's scorecard verdicts,
 * the Stamp verdict for the pinned shelf subject, and the pinned verdict differential (lending fingerprint-set sha +
 * funding NO-GO reproHash). A capability that moves ONE verdict word is the two-tier-truth breach — a paid user
 * learning a DIFFERENT TRUTH than a free user — and is a Halt. Deterministic: a fixed timestamp, the recorded/sample
 * data plane, no network. Run: bun run script/honesty/capability-parity.ts → data/honesty/capability-parity.json
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { VerdictDifferential } from "../../src/studio/differential"
import { Console } from "../../src/studio/console"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
export const FIXED_NOW = Date.parse("2026-07-05T00:00:00Z") // the differential's own pinned base — deterministic
const STAMP_SUBJECT = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501" // the pinned shelf flagship (aave-v3 USDC)

// the AI/model + paid-data env surface — EVERYTHING a profile may vary; all else is held fixed
const PROFILE_KEYS = [
  "GROQ_API_KEY", "GROQ_MODEL", "GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL", "OPENAI_COMPATIBLE_BASE_URL", "OPENAI_COMPATIBLE_API_KEY", "OPENAI_COMPATIBLE_MODEL",
  "AI_PAID_TIER", "DEFILLAMA_PRO_API_KEY", "PAID_RPC_URL",
] as const

export const PROFILES: Record<string, Record<string, string>> = {
  "zero-key": {},
  "free-key": { GROQ_API_KEY: "organon-parity-fake-free-key" },
  "paid-key": { GROQ_API_KEY: "organon-parity-fake-paid-key", AI_PAID_TIER: "1", DEFILLAMA_PRO_API_KEY: "organon-parity-fake-pro-key", PAID_RPC_URL: "http://127.0.0.1:1/parity-fake" },
}

export interface ProfileResult { profile: string; shelfVerdicts: Record<string, string>; stampVerdict: string; lendingSetSha: string; fundingVerdict: string; fundingReproHash: string | null }

async function computeUnder(profile: string): Promise<ProfileResult> {
  const saved: Record<string, string | undefined> = {}
  for (const k of PROFILE_KEYS) { saved[k] = process.env[k]; delete process.env[k] }
  for (const [k, v] of Object.entries(PROFILES[profile])) process.env[k] = v
  try {
    // (1) the shelf's scorecard verdicts — the record where present, the honest SAMPLE shelf where not (deterministic either way)
    let cards = Reality.shelfFromRecord(FIXED_NOW)
    if (!cards.length) cards = Reality.shelfSample()
    const shelfVerdicts = Object.fromEntries(cards.map((c) => [c.poolKey, c.verdict]))
    // (2) the Stamp verdict for the pinned subject (GO/NO-GO/INSUFFICIENT/UNAVAILABLE — whatever this clone's record yields,
    // it must be the SAME WORD under every profile)
    const { Stamp } = await import("../../src/studio/stamp")
    const stampVerdict = (await Stamp.stampFor(STAMP_SUBJECT)).verdict
    // (3) the pinned verdict differential — the frozen goldens recomputed under this profile
    const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
    const funding = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FIXED_NOW)
    return { profile, shelfVerdicts, stampVerdict, lendingSetSha, fundingVerdict: funding.verdict, fundingReproHash: funding.artifact?.verdictReproHash ?? null }
  } finally {
    for (const k of PROFILE_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k] }
  }
}

export function fingerprint(r: ProfileResult): string {
  const { profile: _p, ...verdictSurface } = r // the PROFILE NAME is excluded — only the verdict surface is compared
  return sha256(JSON.stringify(verdictSurface))
}

export async function computeParity(): Promise<{ results: ProfileResult[]; fingerprints: Record<string, string>; identical: boolean }> {
  const results: ProfileResult[] = []
  for (const p of Object.keys(PROFILES)) results.push(await computeUnder(p))
  const fingerprints = Object.fromEntries(results.map((r) => [r.profile, fingerprint(r)]))
  const identical = new Set(Object.values(fingerprints)).size === 1
  return { results, fingerprints, identical }
}

if (import.meta.main) {
  const { results, fingerprints, identical } = await computeParity()
  const artifact = {
    protocol: "capability-parity",
    at: new Date().toISOString(),
    rule: "S48 — zero-key, free-key, and paid-key profiles MUST yield byte-identical scorecard + Stamp verdicts and the pinned differential; a moved verdict is the two-tier-truth breach (Halt).",
    profiles: Object.keys(PROFILES),
    fingerprints,
    identical,
    verdictSurface: results[0],
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "capability-parity.json"), JSON.stringify(artifact, null, 1) + "\n")
  console.log(`capability-parity: ${identical ? "BYTE-IDENTICAL across all three profiles" : "PARITY BREACH — HALT"}`)
  for (const [p, f] of Object.entries(fingerprints)) console.log(`  ${p}: ${f.slice(0, 16)}…`)
  if (!identical) process.exit(1)
}
