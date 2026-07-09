/**
 * ORGΛNON — THE EVIDENCE BUNDLE (Deepening Phase 1; Rule X-PROVE). The validation report's #1 finding — the BuildLog's
 * headline numbers were self-attested — answered at the root: every claimed number is backed by a REGENERABLE artifact,
 * and `./organon.sh verify` reproduces the bundle and diffs it against the committed copy (a mismatch exits non-zero).
 * The sprint's credibility no longer rests on trust; it rests on a command a stranger can run.
 *
 * This module is the ONE shared regeneration of the DETERMINISTIC, environment-independent core (the pieces that must
 * reproduce byte-for-byte on a fresh clone): the scorecard's determinism proof, the frozen-seven git-clean status, and
 * the verdict differential (lending fp-set + funding NO-GO). `script/build-evidence.ts` writes it; `verify` regenerates
 * + diffs it; `evidence_bundle.test.ts` reproduces it — one implementation, no drift. The battery count (a subprocess)
 * and the V-LIVE captures (network) are handled by the driver, NOT here, so this stays fast + offline + non-recursive.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { PKG_ROOT, REPO_ROOT, FROZEN_PY, FROZEN_TS } from "../organon/frozen"
import { VerdictDifferential } from "./differential"
import { Console } from "./console"
import { Scorecard } from "../analytics/scorecard"

export namespace Evidence {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export const DIR = path.join(PKG_ROOT, "data", "honesty", "evidence")

  // the frozen seven — the 6 computational-core .py + loop.ts (their real repo-relative paths; the module-boundary check).
  // SORTED — the path order is semantically irrelevant (it is a SET of files to git-check), and the evidence bundle's
  // canonical sha must be order-INDEPENDENT so `verify` reproduces regardless of module-load ordering (finding W-D01).
  export const FROZEN_PATHS = [...Object.keys(FROZEN_PY).map((n) => `src/backtest/py/${n}`), ...Object.keys(FROZEN_TS)].sort()

  // ── the DETERMINISM PROOF — a fixed fact-set scored twice in-process is byte-identical; the committed outputSha, diffed
  // by `verify` in a FRESH process, proves cross-run determinism (identical inputs → byte-identical scorecard, S10). ──
  // NOTE: the fixture uses the axis fields present at each committed state; the bundle is regenerated at every phase gate
  // (the cadence), so the committed outputSha tracks the scorecard as the new axes land — determinism is proven each time.
  export const DETERMINISM_FIXTURE: Scorecard.PoolFacts[] = [
    { name: "det-solid", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "det", ageDays: 900, sizeUsd: 240_000_000 },
    { name: "det-mercenary", vertical: "lending", apyBase: 0.5, apyReward: 9.5, tvlSlope30d: 0.0, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "det", ageDays: 900, sizeUsd: 240_000_000 },
    { name: "det-collapse", vertical: "lending", apyBase: 3.0, apyReward: 0.2, tvlSlope30d: -0.5, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "det", ageDays: 900, sizeUsd: 240_000_000 },
    { name: "det-funding", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "det", deltaNeutral: true, fundingBand: { p10: 5, median: 8, p90: 12 } },
    { name: "det-stable-lp", vertical: "stablecoin-yield", apyBase: 4.0, apyReward: 0.3, tvlSlope30d: 0.02, pegDev: 0.002, isStablecoin: true, reality: "REAL", provenanceRef: "det", ageDays: 500, sizeUsd: 30_000_000, liqUsd: 2_000_000 },
    { name: "det-sample", vertical: "lending", apyBase: 3.0, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, ageDays: 900, sizeUsd: 240_000_000 },
  ]
  export function determinismProof(): { inputSha: string; outputSha: string; identical: boolean; verdicts: string[] } {
    const run = () => JSON.stringify(Evidence.DETERMINISM_FIXTURE.map((f) => Scorecard.score(f).verdict + "|" + Scorecard.score(f).plain))
    const a = run(), b = run()
    return { inputSha: sha256(JSON.stringify(Evidence.DETERMINISM_FIXTURE)), outputSha: sha256(a), identical: a === b, verdicts: Evidence.DETERMINISM_FIXTURE.map((f) => Scorecard.score(f).verdict) }
  }

  // ── the FROZEN-SEVEN git-clean status — the crown jewels byte-untouched on disk (X-KEEP; module-boundary) ──
  export function frozenGitStatus(): { paths: string[]; dirty: string[]; clean: boolean } {
    const r = Bun.spawnSync(["git", "status", "--porcelain", "--", ...FROZEN_PATHS], { cwd: REPO_ROOT })
    const dirty = r.stdout.toString().trim().split("\n").filter(Boolean)
    return { paths: FROZEN_PATHS, dirty, clean: dirty.length === 0 }
  }

  // ── the VERDICT DIFFERENTIAL — the frozen attest engine's verdicts (lending fp-set + funding NO-GO), reproduced ──
  export async function verdictDifferential(): Promise<{ lendingFpSetSha: string; fundingState: string; fundingVerdict: string; fundingReality: string | null; fundingReproHash: string | null }> {
    const lendingFpSetSha = await VerdictDifferential.fingerprintSetSha()
    const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
    const f = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)
    return { lendingFpSetSha, fundingState: f.state, fundingVerdict: f.verdict, fundingReality: f.artifact?.reality ?? null, fundingReproHash: f.artifact?.verdictReproHash ?? null }
  }

  // the DETERMINISTIC bundle (no battery, no network) — the environment-independent core `verify` diffs + the test reproduces
  export interface DeterministicBundle { determinism: ReturnType<typeof determinismProof>; frozen: ReturnType<typeof frozenGitStatus>; differential: Awaited<ReturnType<typeof verdictDifferential>> }
  export async function regenerate(): Promise<DeterministicBundle> {
    return { determinism: determinismProof(), frozen: frozenGitStatus(), differential: await verdictDifferential() }
  }

  // the canonical sha over the deterministic bundle — the single number `verify` compares (a mismatch anywhere → non-zero)
  export function canonicalSha(b: DeterministicBundle): string {
    return sha256(JSON.stringify({
      determinism: { inputSha: b.determinism.inputSha, outputSha: b.determinism.outputSha, identical: b.determinism.identical },
      frozen: { clean: b.frozen.clean, paths: b.frozen.paths },
      differential: b.differential,
    }))
  }

  // read a committed evidence artifact (null if absent — a fresh clone before any build, or a transient first-write)
  export function readArtifact<T = unknown>(file: string): T | null {
    const p = path.join(Evidence.DIR, file)
    if (!existsSync(p)) return null
    try { return JSON.parse(readFileSync(p, "utf8")) as T } catch { return null }
  }

  // ── THE CAPTURE-MANIFEST (Crown-Jewel Phase 1; Rule X-LIVE, F4, S18) — every cited LIVE number resolves to a committed
  // content-hash `verify` recomputes. Each V-LIVE capture (defillama/gecko/hyperliquid/gemini) is content-hashed; a live
  // number that changes without a re-pin, or a manifest whose hash no longer reproduces its capture, fails verify. The
  // committed capture + its hash is the DURABLE record — environment-independent (the re-fetch is network-gated). ──
  export const CAPTURE_BACKS: Record<string, string> = {
    "vlive-defillama.json": "the DeFiLlama /pools keyless HTTP-200 live number (poolCount)",
    "vlive-geckoterminal.json": "the GeckoTerminal reserve_in_usd keyless HTTP-200 live number (deepest-pool reserve)",
    "vlive-hyperliquid.json": "the Hyperliquid funding keyless HTTP-200 live number (points)",
    "vlive-unlock-probe.json": "the DeFiLlama /emission keyless probe status (HTTP 402 paywalled) — the EVIDENCE for the unlock D6 signed scope-cut (X-UNLOCK-LIVE)",
    "vlive-gemini.json": "the Google AI Studio (Gemini) endpoint V-LIVE reachability (status; NO key committed — X-BYOK key-safety)",
    "ask-live-groq.json": "the LIVE Groq round-trip — a real-model grounded PASS + a forced-fabrication REJECT (V2/S24; REDACTED, NO key committed — X-BYOK key-safety)",
  }
  // the sha256 of a committed capture's bytes (null if absent — a capture not yet built, e.g. gemini before Phase 7)
  export function captureSha(file: string): string | null {
    const p = path.join(Evidence.DIR, file)
    if (!existsSync(p)) return null
    return sha256(readFileSync(p, "utf8"))
  }
  export interface CaptureEntry { capture: string; sha256: string; backs: string }
  // the manifest entries over the PRESENT captures (a capture absent at build time — gemini pre-Phase-7 — is simply not listed)
  export function captureManifestEntries(): CaptureEntry[] {
    const out: CaptureEntry[] = []
    for (const f of Object.keys(CAPTURE_BACKS)) { const h = captureSha(f); if (h) out.push({ capture: f, sha256: h, backs: CAPTURE_BACKS[f] }) }
    return out
  }

  // ── THE CONTRACT-REGISTRY DIGEST (Voice B1) — the committed REAL contract registry (data/honesty/contract-registry.json)
  // lives OUTSIDE the deterministic bundle (determinism + frozen + differential): it is per-entry content-addressed
  // (contentSha == sha256(facts), proven by contract_registry_real), which is WHY landing it did not move the bundle sha
  // 9c1e7bd8…. To make a future registry change VISIBLE to `verify`, a whole-file DIGEST is committed into the manifest;
  // `verify` recomputes it and diffs it — the next registry edit IS caught. Absent (a clone before any capture) → null. ──
  export interface RegistryDigest { file: string; sha256: string; captures: number; realCount: number; inBundle: false }
  export function contractRegistryDigest(): RegistryDigest | null {
    const p = path.join(PKG_ROOT, "data", "honesty", "contract-registry.json")
    if (!existsSync(p)) return null
    const bytes = readFileSync(p, "utf8")
    let captures = 0, realCount = 0
    try {
      const j = JSON.parse(bytes) as { captures?: Record<string, { provenance?: string }> }
      const caps = j.captures ?? {}
      captures = Object.keys(caps).length
      realCount = Object.values(caps).filter((c) => c.provenance === "REAL").length
    } catch { /* a malformed registry still hashes — the digest catches the change regardless */ }
    return { file: "data/honesty/contract-registry.json", sha256: sha256(bytes), captures, realCount, inBundle: false }
  }

  // verify the committed manifest against the committed captures — each entry's hash must reproduce its capture (S18);
  // AND the committed registry digest must recompute (B1 — a registry change without a manifest rebuild is caught).
  export function verifyCaptureManifest(): { ok: boolean; problems: string[] } {
    const m = readArtifact<{ entries: CaptureEntry[]; registryDigest?: RegistryDigest }>("capture-manifest.json")
    if (!m) return { ok: false, problems: ["capture-manifest.json is ABSENT — the live-number manifest is missing (run: bun run script/build-evidence.ts)"] }
    const problems: string[] = []
    for (const e of m.entries) {
      const h = captureSha(e.capture)
      if (h === null) problems.push(`capture ${e.capture} is ABSENT but the manifest cites it (a cited live number lost its backing artifact)`)
      else if (h !== e.sha256) problems.push(`capture ${e.capture} content-hash ${h.slice(0, 12)}… ≠ manifest ${e.sha256.slice(0, 12)}… (a cited live number changed without a re-pin — X-LIVE)`)
    }
    // B1 — the contract-registry digest: recompute + diff (the registry is OUTSIDE the bundle; this is its integrity line)
    if (m.registryDigest) {
      const d = contractRegistryDigest()
      if (d === null) problems.push(`the manifest cites a contract-registry digest but the registry is ABSENT (the REAL tiers lost their backing file — B1)`)
      else if (d.sha256 !== m.registryDigest.sha256) problems.push(`contract-registry digest ${d.sha256.slice(0, 12)}… ≠ manifest ${m.registryDigest.sha256.slice(0, 12)}… (the REAL registry changed without a re-pin — B1)`)
    }
    return { ok: problems.length === 0, problems }
  }
}
