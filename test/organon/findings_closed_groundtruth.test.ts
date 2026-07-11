/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 1 wall (FINDINGS-CLOSED). The record items: AL1 the Aligrithm filing
 * (inspiration-only, nothing integrates); AL3/AL5 the primary-citations pin (papers, never the blog) rendered into the
 * Stamp docs surface (renderStamp) AND ALPHA.md; AL4/AL6 the PBO/CSCV trigger pinned + the implementation-ABSENT grep
 * wall (no cscv/pbo computation module on the path); PC1 the precise discrimination wording landed everywhere it renders
 * today (governance-claim.json · /postmortems wiring · ALPHA.md — clean-vs-synthetic + the does-NOT-claim sentence, the
 * wording tracking the evidence in BOTH directions — no "would have caught it" today); PC3/PC5 the countersign package
 * refreshed (D23-D31, D27 FIRST + the generosity statement, D29's census-zero note, D30/D31 slots); D30/D31 in the
 * ledger (operatorSigned=false); the verdict-path 7 + frozen-core 2 === the pins (the render edits moved no frozen byte).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const readJ = (rel: string) => JSON.parse(read(rel))
const G = readJ("data/honesty/groundtruth-pins.json")

test("AL1 — the Aligrithm filing is durable + INSPIRATION-ONLY (nothing integrates; not a competitor/data/tech source)", () => {
  const f = readJ("data/honesty/aligrithm-filing.json")
  expect(f.AL1_dueDiligence.classification).toBe("INSPIRATION-ONLY")
  expect(f.AL1_dueDiligence.scope).toMatch(/ZERO DeFi|no.*on-chain/i)
  expect(f.AL1_dueDiligence.why).toMatch(/NOT a competitor|NOT a data source|NOT a technology source/i)
  expect(f.AL1_dueDiligence.integrationForbidden).toMatch(/blog cited as authority|drift the wall catches|PRIMARY papers/i)
})

test("AL3/AL5 — the primary citations are the PAPERS (SSRN/DOI), rendered into the Stamp docs surface (renderStamp) AND ALPHA.md", () => {
  const f = readJ("data/honesty/aligrithm-filing.json")
  const cites = f.AL3_AL5_primaryCitations
  expect(cites.rule).toMatch(/PRIMARY sources.*NEVER a blog/i)
  const all = JSON.stringify(cites.methods)
  expect(all).toMatch(/Deflated Sharpe Ratio/i)
  expect(all).toMatch(/2460551/)
  expect(all).toMatch(/Probability of Backtest Overfitting/i)
  expect(all).toMatch(/2326253/)
  expect(all).toMatch(/10\.1080\/14697688\.2019\.1622311/)
  // the load-bearing method cites its paper in the ACTUAL Stamp render (reality.ts renderStamp)
  const reality = read("src/studio/reality.ts")
  expect(reality).toMatch(/Method — primary sources/)
  expect(reality).toMatch(/Deflated Sharpe Ratio.*2460551/s)
  expect(reality).toMatch(/PBO framework.*2326253/s)
  // and in ALPHA.md (the tester docs surface)
  const alpha = read("ALPHA.md")
  expect(alpha).toMatch(/Methods cite their primary sources/i)
  expect(alpha).toMatch(/SSRN 2460551/)
  expect(alpha).toMatch(/inspiration-only/i)
})

test("AL4/AL6 — the PBO/CSCV trigger is pinned (≥20-50 trials/family) and its implementation is ABSENT (the grep wall bites on a seeded module)", () => {
  const t = readJ("data/honesty/aligrithm-filing.json").AL4_AL6_pboTrigger
  expect(t.pinnedTrigger).toMatch(/≥ 20-50 trials\/family|cannot drift/i)
  expect(t.implementationAbsent).toMatch(/ASSERTED ABSENT|grep wall/i)
  // THE GREP WALL — the frozen rigor.py holds the anti-PBO adjudicator math (López de Prado Appendix B, byte-frozen, INERT
  // on the single-trial Stamp path). What must stay ABSENT is a NEW CSCV/PBO COMPANION module OUTSIDE the frozen core (one
  // that assembles ≥20-50 trials/family and surfaces a live overfitting metric below the trigger). Allowlist the frozen-core
  // .py by their REAL path; assert no companion elsewhere. Comment-stripped + signature-anchored so a MENTION never false-positives.
  const FROZEN_CORE_PY = ["rigor.py", "neutralize.py", "funding_discriminate.py", "effective_n.py", "funding_accrual.py", "funding_crossvenue.py"].map((n) => `src/backtest/py/${n}`)
  const walk = (dir: string): string[] => {
    const o: string[] = []
    for (const e of readdirSync(dir)) {
      if (e === "node_modules" || e === ".git" || e === ".venv" || e === "dist") continue
      const q = path.join(dir, e)
      if (statSync(q).isDirectory()) o.push(...walk(q))
      else if (/\.(ts|mts|py)$/.test(e)) o.push(q)
    }
    return o
  }
  const stripTs = (s: string) => s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
  const stripPy = (s: string) => s.replace(/#[^\n]*/g, "")
  // a PBO/CSCV *implementation* signature — an exported/defined function that COMPUTES the metric (not a mention)
  const IMPL = /\b(?:export\s+)?(?:async\s+)?function\s+(?:pbo|cscv|probabilityOfBacktestOverfitting|combinatoriallySymmetric\w*)\b|\bdef\s+(?:pbo|cscv|probability_of_backtest_overfitting)\b|\bconst\s+(?:pbo|cscv)\s*=\s*(?:async\s*)?\(/i
  const offenders: string[] = []
  for (const abs of [...walk(path.join(PKG_ROOT, "src")), ...walk(path.join(PKG_ROOT, "script"))]) {
    const rel = path.relative(PKG_ROOT, abs)
    if (FROZEN_CORE_PY.includes(rel)) continue // the frozen adjudicator math is exempt — it IS the Stamp core (inert on the single-trial path)
    const body = abs.endsWith(".py") ? stripPy(readFileSync(abs, "utf8")) : stripTs(readFileSync(abs, "utf8"))
    if (IMPL.test(body)) offenders.push(rel)
  }
  expect(offenders, `a NEW PBO/CSCV companion exists outside the frozen core (must stay parked behind the trigger): ${offenders.join(", ")}`).toEqual([])
  // the honest state: the frozen rigor.py DOES hold the (inert) adjudicator math — acknowledged, not pretended absent
  expect(read("src/backtest/py/rigor.py")).toMatch(/def pbo\(/)
  // and it is NOT surfaced as a live companion metric in the Stamp render (the render shows the inert-deflation label, not a pbo number)
  expect(read("src/studio/reality.ts")).not.toMatch(/pbo.*value|surface.*pbo|companion.*metric/i)
})

test("PC1 — the discrimination claim renders precisely (governance-claim.json + ALPHA.md), the does-NOT-claim sentence walled, tracking evidence BOTH directions (no premature 'would have caught it')", () => {
  const gc = readJ("data/honesty/governance-claim.json")
  expect(gc.status).toBe("TODAY") // Phase 4 flips to UPGRADED or GAP
  expect(gc.today).toMatch(/SYNTHETIC rugged control|EXTINCT among survivors|0 of ~50/i)
  expect(gc.doesNotClaim).toMatch(/UPGRADE-KEY SURFACE/i)
  expect(gc.doesNotClaim).toMatch(/does NOT predict depegs|NEVER a verdict of safety/i)
  // BOTH-directions wording guard: TODAY status must NOT carry an upgraded "would have caught it on a real rug" claim yet
  expect(gc.upgraded).toBeNull()
  expect(gc.gap).toBeNull()
  expect(JSON.stringify(gc.today) + JSON.stringify(gc.doesNotClaim)).not.toMatch(/would have caught it|rendered the damning line on a real rug/i)
  // ALPHA.md carries the does-NOT-claim sentence verbatim in spirit
  const alpha = read("ALPHA.md")
  expect(alpha).toMatch(/flags the upgrade-key surface/i)
  expect(alpha).toMatch(/does \*\*not\*\* predict depegs|never\*\* a verdict of safety/i)
  // /postmortems is wired to surface it
  expect(read("script/serve-reality.ts")).toMatch(/governanceClaim/)
  // the pinned wording template tracks evidence both directions (the pin says so)
  expect(G.claimWordings.wordingTracksEvidence).toMatch(/BOTH directions/i)
})

test("PC3/PC5 — the countersign package is refreshed: D23-D31, D27 FIRST, the generosity statement on top, D29 census-zero, D30/D31 slots, IN2 updated; all operatorSigned=false", () => {
  const pkg = readJ("data/honesty/groundtruth-countersign-package.json")
  expect(pkg.generosityStatement).toMatch(/knowingly generous until D27 is signed/i)
  const ids = pkg.deviations.map((d: { id: string }) => d.id)
  expect(ids[0]).toBe("D27") // D27 FIRST (MT1 / PC3)
  for (const id of ["D23", "D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31"]) expect(ids, `missing ${id}`).toContain(id)
  // D29 census-zero note (PC5 — the cheapest signature)
  const d29 = pkg.deviations.find((d: { id: string }) => d.id === "D29")
  expect(d29.censusZeroNote).toMatch(/census is ZERO|cheapest signature|ARMS the tool/i)
  // D30 (IMMUTABLE) + D31 (Aligrithm) present with their proofs
  expect(pkg.deviations.find((d: { id: string }) => d.id === "D30").title).toMatch(/IMMUTABLE/i)
  expect(pkg.deviations.find((d: { id: string }) => d.id === "D31").title).toMatch(/Aligrithm/i)
  // IN2 now includes the immutable line + the implementation-truth findings + the rug artifact/gap
  expect(pkg.gateItems.IN2).toMatch(/immutable line|IMMUTABLE/i)
  expect(pkg.gateItems.IN2).toMatch(/implementation-truth|rug artifact|the gap/i)
  expect(pkg.gateItems.IN2).toMatch(/OWED-OPERATOR-GATED|never simulated|LN5/i)
  // NO agent signature anywhere (LN5)
  for (const d of pkg.deviations) expect(d.operatorSigned, `${d.id} must be unsigned`).toBe(false)
})

test("D30/D31 — the deviations ledger carries both (operatorSigned=false); D30 IMMUTABLE-on-proof, D31 Aligrithm inspiration-only", () => {
  const dev = readJ("data/honesty/deviations.json").deviations
  const d30 = dev.find((d: { id: string }) => d.id === "D30")
  const d31 = dev.find((d: { id: string }) => d.id === "D31")
  expect(d30.whatWasDone).toMatch(/three-condition bytecode-constant proof|all-or-nothing|disguised-mutable/i)
  expect(d30.operatorSigned).toBe(false)
  expect(d31.whatWasDone).toMatch(/INSPIRATION-ONLY|nothing integrates|primary papers/i)
  expect(d31.operatorSigned).toBe(false)
})

test("FROZEN — the render edits (reality.ts renderStamp cite; serve-reality /postmortems; ALPHA.md) moved NO frozen byte: verdict-path 7 + frozen-core 2 === the pins", () => {
  for (const [rel, want] of Object.entries(G.verdictPathHashes as Record<string, string>)) {
    const live = createHash("sha256").update(read(rel)).digest("hex")
    expect(live, `${rel} moved`).toBe(want)
  }
  for (const [rel, want] of Object.entries(G.frozenCoreHashes as Record<string, string>)) {
    const live = createHash("sha256").update(read(rel)).digest("hex")
    expect(live, `${rel} moved`).toBe(want)
  }
})
