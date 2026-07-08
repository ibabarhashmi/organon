/**
 * ORGΛNON — BUILD / VERIFY THE EVIDENCE BUNDLE (Deepening Phase 1; Rule X-PROVE). One driver, two modes:
 *   · (default)  regenerate every committed artifact under data/honesty/evidence/ — the deterministic core (determinism ·
 *                frozen-seven git-clean · verdict differential), the V-LIVE captures (keyless, best-effort), the battery
 *                summary (a subprocess), and claims.json (the manifest: every headline number → its backing artifact).
 *   · --check    regenerate the DETERMINISTIC core in-memory, recompute its canonical sha, and DIFF it against the
 *                committed claims.json bundleSha + resolve every claim against its artifact — a mismatch exits non-zero.
 *                Fast, offline, non-recursive (no battery) — the piece `./organon.sh verify` calls.
 *
 * A claimed number with no backing artifact, or a --check that does not reproduce, is a Halt. The bundle's diff-checked
 * core is environment-INDEPENDENT (it reproduces on a fresh clone); the V-LIVE re-fetch is network-gated + disclosed.
 *
 * Run:  bun run script/build-evidence.ts            # regenerate + write (runs the battery)
 *       bun run script/build-evidence.ts --no-battery # regenerate the deterministic + vlive + claims only (fast)
 *       bun run script/build-evidence.ts --check     # verify against the committed copy (exit 1 on mismatch)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Evidence } from "../src/studio/evidence"
import { DefiLlama } from "../src/dataplane/providers/defillama"
import { Hyperliquid } from "../src/dataplane/hyperliquid"

const HONESTY = path.join(PKG_ROOT, "data", "honesty")
const DIR = Evidence.DIR
const args = process.argv.slice(2)
const CHECK = args.includes("--check")
const NO_BATTERY = args.includes("--no-battery")
const write = (file: string, obj: unknown) => writeFileSync(path.join(DIR, file), JSON.stringify(obj, null, 2) + "\n")

// resolve a dot-path (e.g. "canonical.pass") against a JSON object
function dig(o: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), o)
}
// resolve a claim's artifact (relative to data/honesty/) → its field value
function resolveClaim(c: { artifact: string; field: string }): unknown {
  const p = path.join(HONESTY, c.artifact)
  if (!existsSync(p)) return undefined
  return dig(JSON.parse(readFileSync(p, "utf8")), c.field)
}

// ── V-LIVE (keyless, best-effort) — a real HTTP-200 + shape today; offline → disclosed, the committed capture retained ──
async function vliveDefiLlama(now: number): Promise<Record<string, unknown>> {
  try {
    const r = await fetch(`${DefiLlama.BASE}/pools`)
    const body = (await r.json()) as { data?: unknown[] }
    const n = Array.isArray(body?.data) ? body.data.length : 0
    return { provider: "defillama", url: `${DefiLlama.BASE}/pools`, status: r.status, ok: r.ok, poolCount: n, keyless: true, at: now }
  } catch (e) { return { provider: "defillama", ok: false, note: `offline — ${(e as Error).message}`, at: now } }
}
async function vliveGecko(now: number): Promise<Record<string, unknown>> {
  try {
    const { GeckoTerminal } = await import("../src/dataplane/providers/geckoterminal")
    GeckoTerminal.resetCache()
    const t = await GeckoTerminal.topPools("eth", now)
    if (t.reality !== "REAL") return { provider: "geckoterminal", ok: false, note: t.note ?? "offline", at: now }
    const deepest = [...t.value].sort((a, b) => (b.reserveUsd ?? 0) - (a.reserveUsd ?? 0))[0]
    return { provider: "geckoterminal", url: `${GeckoTerminal.BASE}/networks/eth/pools`, status: 200, ok: true, poolCount: t.value.length, sampleName: deepest?.name ?? null, sampleReserveUsd: deepest?.reserveUsd ?? null, keyless: true, at: now }
  } catch (e) { return { provider: "geckoterminal", ok: false, note: `offline — ${(e as Error).message}`, at: now } }
}
async function vliveHyperliquid(now: number): Promise<Record<string, unknown>> {
  try {
    const raw = await Hyperliquid.fetchFunding("BTC", now - 7 * 86_400_000, 15000)
    return { provider: "hyperliquid", url: Hyperliquid.ENDPOINT, status: 200, ok: true, points: raw.length, keyless: true, at: now }
  } catch (e) { return { provider: "hyperliquid", ok: false, note: `offline — ${(e as Error).message}`, at: now } }
}

// ── the battery summary (a subprocess; the count is a headline number) ──
function batterySummary(): { pass: number; fail: number; files: number } {
  const r = Bun.spawnSync(["bash", "organon-studio-test.sh"], { cwd: PKG_ROOT })
  const out = r.stdout.toString() + r.stderr.toString()
  const m = out.match(/(\d+)\s+pass\s+(\d+)\s+fail/)
  const fm = out.match(/across\s+(\d+)\s+files/)
  return { pass: m ? Number(m[1]) : -1, fail: m ? Number(m[2]) : -1, files: fm ? Number(fm[1]) : -1 }
}

async function main() {
  const now = Date.parse("2026-07-08T00:00:00Z") // a fixed stamp keeps the committed artifacts diff-stable across a re-run
  const bundle = await Evidence.regenerate()
  const bundleSha = Evidence.canonicalSha(bundle)

  if (CHECK) {
    // ── VERIFY: diff the deterministic core against the committed copy; resolve every claim ──
    const claims = Evidence.readArtifact<{ bundleSha: string; claims: { number: string; value: unknown; artifact: string; field: string }[] }>("claims.json")
    const problems: string[] = []
    if (!claims) problems.push("claims.json is ABSENT — the committed evidence bundle is missing (run: bun run script/build-evidence.ts)")
    else {
      if (claims.bundleSha !== bundleSha) problems.push(`deterministic bundle sha DIFFERS — committed ${claims.bundleSha.slice(0, 16)}… ≠ regenerated ${bundleSha.slice(0, 16)}… (a claimed number changed without a re-pin)`)
      for (const c of claims.claims) {
        const got = resolveClaim(c)
        if (JSON.stringify(got) !== JSON.stringify(c.value)) problems.push(`claim "${c.number}" = ${JSON.stringify(c.value)} does NOT resolve to ${c.artifact}#${c.field} (got ${JSON.stringify(got)})`)
      }
    }
    if (!bundle.frozen.clean) problems.push(`the frozen seven are NOT git-clean: ${bundle.frozen.dirty.join(", ")}`)
    if (problems.length) { console.error("✗ EVIDENCE VERIFY FAILED:\n  - " + problems.join("\n  - ")); process.exit(1) }
    console.log(`✓ evidence verify: deterministic bundle reproduces (sha ${bundleSha.slice(0, 16)}…) · every claim resolves · frozen seven git-clean`)
    return
  }

  // ── BUILD: write every committed artifact. ORDER MATTERS — the deterministic core + claims are written FIRST so the
  // battery subprocess runs against a CONSISTENT, FRESH evidence set (else evidence_bundle's reproduce-test fails against
  // the pre-regeneration copy and poisons the count). The true battery count then overwrites the provisional one. ──
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
  write("determinism.json", { protocol: "evidence-determinism", canonical: bundle.determinism, note: "identical inputs → byte-identical scorecard; the committed outputSha, diffed by `verify` in a fresh process, proves cross-run determinism (S10)", at: now })
  write("frozen-git-status.json", { protocol: "evidence-frozen", canonical: { clean: bundle.frozen.clean, paths: bundle.frozen.paths }, dirty: bundle.frozen.dirty, note: "the 6 computational-core .py + loop.ts byte-untouched on disk (X-KEEP; module-boundary)", at: now })
  write("verdict-differential.json", { protocol: "evidence-differential", canonical: bundle.differential, note: "the frozen attest engine's verdicts — lending fp-set + funding NO-GO/ILLUSTRATIVE — reproduced; zero verdicts moved (X-KEEP)", at: now })

  const [vd, vg, vh] = await Promise.all([vliveDefiLlama(now), vliveGecko(now), vliveHyperliquid(now)])
  write("vlive-defillama.json", vd)
  write("vlive-geckoterminal.json", vg)
  write("vlive-hyperliquid.json", vh)

  // the claims manifest (battery numbers filled from the given summary) + a writer for both battery-summary + claims
  const claimsFor = (b: { pass: number; fail: number; files: number }) => [
    { number: "battery-pass", value: b.pass, artifact: "evidence/battery-summary.json", field: "canonical.pass" },
    { number: "battery-fail", value: b.fail, artifact: "evidence/battery-summary.json", field: "canonical.fail" },
    { number: "battery-files", value: b.files, artifact: "evidence/battery-summary.json", field: "canonical.files" },
    { number: "determinism-identical", value: bundle.determinism.identical, artifact: "evidence/determinism.json", field: "canonical.identical" },
    { number: "scorecard-output-sha", value: bundle.determinism.outputSha, artifact: "evidence/determinism.json", field: "canonical.outputSha" },
    { number: "frozen-seven-clean", value: bundle.frozen.clean, artifact: "evidence/frozen-git-status.json", field: "canonical.clean" },
    { number: "lending-fpset-sha", value: bundle.differential.lendingFpSetSha, artifact: "evidence/verdict-differential.json", field: "canonical.lendingFpSetSha" },
    { number: "funding-verdict", value: bundle.differential.fundingVerdict, artifact: "evidence/verdict-differential.json", field: "canonical.fundingVerdict" },
    { number: "funding-repro-hash", value: bundle.differential.fundingReproHash, artifact: "evidence/verdict-differential.json", field: "canonical.fundingReproHash" },
    { number: "deepening-pins-sha", value: "d66f4613e0a4055eb7a1fbc2b3b9b47b58a0eb63b743f4d0b787e531470558b1", artifact: "deepening-pins.json", field: "pinsSha" },
  ]
  const writeSummaryAndClaims = (b: { pass: number; fail: number; files: number }) => {
    write("battery-summary.json", { protocol: "evidence-battery", canonical: b, note: "the full studio trust battery (walls + capability-floor tests) — the headline count", at: now })
    write("claims.json", { protocol: "honesty-evidence-claims", note: "every headline number the handoff cites resolves to a backing artifact + value; `./organon.sh verify` reproduces the deterministic bundle (X-PROVE). A number with no artifact is a Halt.", bundleSha, claims: claimsFor(b), at: now })
  }

  // provisional (the previous committed count) → the battery runs against a fully-consistent fresh evidence set
  const prev = Evidence.readArtifact<{ canonical: { pass: number; fail: number; files: number } }>("battery-summary.json")
  let battery = prev?.canonical ?? { pass: -1, fail: -1, files: -1 }
  writeSummaryAndClaims(battery)
  if (!NO_BATTERY) { battery = batterySummary(); writeSummaryAndClaims(battery) } // overwrite with the TRUE count
  const claims = claimsFor(battery)

  console.log("── EVIDENCE BUNDLE (built) ───────────────────────────────────")
  console.log(`battery              : ${battery.pass}/${battery.fail} across ${battery.files} files${NO_BATTERY ? " (carried — --no-battery)" : ""}`)
  console.log(`determinism outputSha: ${bundle.determinism.outputSha.slice(0, 16)}… (identical=${bundle.determinism.identical})`)
  console.log(`frozen seven clean   : ${bundle.frozen.clean}`)
  console.log(`lending fp-set sha   : ${bundle.differential.lendingFpSetSha.slice(0, 16)}…`)
  console.log(`funding verdict      : ${bundle.differential.fundingVerdict} (${bundle.differential.fundingReality}) ${String(bundle.differential.fundingReproHash).slice(0, 12)}…`)
  console.log(`V-LIVE               : defillama ${vd.ok ? "200/" + vd.poolCount : vd.note} · gecko ${vg.ok ? "200/" + vg.poolCount : vg.note} · hyperliquid ${vh.ok ? "200/" + vh.points : vh.note}`)
  console.log(`bundle sha           : ${bundleSha.slice(0, 16)}…`)
  console.log(`written              : data/honesty/evidence/ (${claims.length} claims)`)
}

await main()
