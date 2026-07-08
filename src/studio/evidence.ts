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
}
