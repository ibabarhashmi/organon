/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 1 walls (EVIDENCE-TRUE; Rule X-PROVE). The validation report's #1 finding —
 * self-attested numbers — answered before any feature: every headline number the handoff cites resolves to a committed,
 * regenerable artifact under data/honesty/evidence/, and the DETERMINISTIC core reproduces byte-for-byte (a stranger's
 * `./organon.sh verify` reruns it). A cited number with no backing artifact is CAUGHT (the positive control). The
 * deviations ledger (D1/D2/D3) renders verbatim. Clone-robust: the committed evidence reproduces; only the very first
 * local generation (before claims.json is written) discloses + skips.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Evidence } from "../../src/studio/evidence"

const HONESTY = path.join(PKG_ROOT, "data", "honesty")
const claims = Evidence.readArtifact<{ bundleSha: string; claims: { number: string; value: unknown; artifact: string; field: string }[] }>("claims.json")

// resolve a dot-path against a JSON object (the same resolution build-evidence uses)
const dig = (o: unknown, dp: string): unknown => dp.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), o)
function resolveClaim(c: { artifact: string; field: string }): unknown {
  const p = path.join(HONESTY, c.artifact)
  if (!existsSync(p)) return undefined
  return dig(JSON.parse(readFileSync(p, "utf8")), c.field)
}

test("EVIDENCE-TRUE — the deterministic bundle reproduces (a stranger's `verify` reruns it byte-for-byte)", async () => {
  if (!claims) { console.log("  (evidence_bundle) claims.json absent — run `bun run script/build-evidence.ts` (first local generation discloses + skips)"); return }
  const bundle = await Evidence.regenerate()
  expect(Evidence.canonicalSha(bundle)).toBe(claims.bundleSha) // the committed sha == the freshly regenerated sha
  expect(bundle.determinism.identical).toBe(true) // identical inputs → byte-identical scorecard (S10)
  expect(bundle.frozen.clean).toBe(true) // the frozen seven git-clean (X-KEEP)
  expect(bundle.differential.lendingFpSetSha).toBe("70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54") // the cross-sprint golden — no verdict moved
  expect(bundle.differential.fundingVerdict).toBe("NO-GO")
})

test("EVIDENCE-TRUE — every claimed number resolves to its backing artifact (the manifest is total)", () => {
  if (!claims) { console.log("  (evidence_bundle) claims.json absent — skipped"); return }
  expect(claims.claims.length).toBeGreaterThanOrEqual(8)
  for (const c of claims.claims) {
    const got = resolveClaim(c)
    expect(got, `claim "${c.number}" must resolve to ${c.artifact}#${c.field}`).toEqual(c.value as never)
  }
  // the load-bearing numbers are present in the manifest
  const numbers = claims.claims.map((c) => c.number)
  for (const n of ["battery-pass", "battery-fail", "frozen-seven-clean", "lending-fpset-sha", "funding-verdict", "deepening-pins-sha"]) expect(numbers).toContain(n)
})

test("POSITIVE CONTROL — a fabricated claim (a number with no backing artifact) is CAUGHT", () => {
  // a number that points at a field that does not exist → the resolver returns undefined ≠ the claimed value (a Halt)
  const fabricated = { number: "fake-number", value: 999999, artifact: "evidence/determinism.json", field: "canonical.thisFieldDoesNotExist" }
  expect(resolveClaim(fabricated)).toBeUndefined()
  expect(resolveClaim(fabricated)).not.toEqual(fabricated.value as never)
  // and a claim pointing at a missing artifact resolves to undefined (never a silent pass)
  expect(resolveClaim({ number: "x", value: 1, artifact: "evidence/does-not-exist.json", field: "a" })).toBeUndefined()
})

test("EVIDENCE-TRUE — the frozen-seven git-clean artifact matches a live re-check (X-KEEP)", () => {
  const art = Evidence.readArtifact<{ canonical: { clean: boolean; paths: string[] } }>("frozen-git-status.json")
  if (!art) { console.log("  (evidence_bundle) frozen-git-status.json absent — skipped"); return }
  expect(art.canonical.clean).toBe(true)
  const live = Evidence.frozenGitStatus()
  expect(live.clean).toBe(true) // the crown jewels are byte-untouched on disk, right now
  expect(live.paths.sort()).toEqual([...art.canonical.paths].sort())
})

test("EVIDENCE-TRUE — the verdict-differential artifact reproduces (lending fp-set + funding NO-GO)", async () => {
  const art = Evidence.readArtifact<{ canonical: { lendingFpSetSha: string; fundingVerdict: string; fundingReproHash: string } }>("verdict-differential.json")
  if (!art) { console.log("  (evidence_bundle) verdict-differential.json absent — skipped"); return }
  const live = await Evidence.verdictDifferential()
  expect(live.lendingFpSetSha).toBe(art.canonical.lendingFpSetSha)
  expect(live.fundingVerdict).toBe(art.canonical.fundingVerdict)
  expect(live.fundingReproHash).toBe(art.canonical.fundingReproHash)
})

test("X-DEVLEDGER — the deviations ledger surfaces D1/D2/D3, each with its four fields (a silent deviation is a Halt)", () => {
  const led = JSON.parse(readFileSync(path.join(HONESTY, "deviations.json"), "utf8")) as { deviations: { id: string; blueprintLine: string; whatWasDone: string; why: string; lawAuthority: string }[] }
  const ids = led.deviations.map((d) => d.id)
  for (const seed of ["D1", "D2", "D3"]) expect(ids).toContain(seed) // the pinned seed; discovered deviations (D4+) may follow
  for (const d of led.deviations) {
    for (const f of ["blueprintLine", "whatWasDone", "why", "lawAuthority"] as const) expect(d[f].trim().length).toBeGreaterThan(0)
  }
  expect(led.deviations.find((d) => d.id === "D1")!.whatWasDone).toMatch(/RETAINED/)
  expect(led.deviations.find((d) => d.id === "D1")!.lawAuthority).toMatch(/X-KEEP/)
  expect(led.deviations.find((d) => d.id === "D3")!.whatWasDone).toMatch(/RESOLVED|wired/i)
})
