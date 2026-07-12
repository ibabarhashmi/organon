/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 2 wall (FILED-HONESTLY). The manifest schema parses valid manifests and REFUSES
 * every garbage class with a SENTENCE (never a crash): unknown keys (strict), an oversized thesis, an empty positions
 * list, an unevaluable exit kind, a recursion (a manifest of manifests), an unknown subject key (named). The store
 * round-trips local-first and the lineage id is stable as the journal fills. Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { existsSync, rmSync } from "node:fs"
import path from "node:path"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyStore } from "../../src/strategy/store"

const valid: unknown = {
  schemaVersion: 1,
  positions: [
    { subjectKey: "defillama:pool:aave-v3-usdc", size: 10000, units: "USDC" },
    { subjectKey: "defillama:pool:sparklend-dai", size: 5000, units: "DAI", assumptions: "held through the next rate cut" },
  ],
  thesis: "Stablecoin lending on blue-chip venues holds its yield through a rate cut; I exit if either depegs.",
  exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" },
}

test("MANIFEST — a valid manifest parses; the typed shape is preserved (positions, thesis, exit)", () => {
  const r = Manifest.parse(valid)
  expect(r.ok).toBe(true)
  if (!r.ok) return
  expect(r.manifest.positions).toHaveLength(2)
  expect(r.manifest.exitCriterion.kind).toBe("peg-floor")
  expect(r.manifest.schemaVersion).toBe(1)
})

test("MANIFEST — an UNKNOWN key is refused with a sentence (strict; never silently dropped)", () => {
  const r = Manifest.parse({ ...(valid as object), suggestedWeights: [0.6, 0.4] })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/unknown field.*suggestedWeights/i)
  expect(r.error).toMatch(/strict/i)
  expect(r.error).toMatch(/Nothing was registered/)
})

test("MANIFEST — an OVERSIZED thesis is refused politely (a decision journal, not a book)", () => {
  const r = Manifest.parse({ ...(valid as object), thesis: "x".repeat(Manifest.THESIS_MAX + 1) })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/too large|not a book/i)
})

test("MANIFEST — an EMPTY positions list is refused (a strategy needs at least one position)", () => {
  const r = Manifest.parse({ ...(valid as object), positions: [] })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/positions/)
  expect(r.error).toMatch(/at least one position|missing or empty/i)
})

test("MANIFEST — an UNEVALUABLE exit kind is refused, naming the allowed kinds (S73 groundwork)", () => {
  const r = Manifest.parse({ ...(valid as object), exitCriterion: { kind: "twitter-sentiment", threshold: 1, subjectScope: "portfolio" } })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/not an evaluable exit kind/i)
  expect(r.error).toMatch(/peg-floor.*funding-flip-count.*tvl-drawdown.*governance-change/)
})

test("MANIFEST — RECURSION is refused: a position that references another manifest (no manifest of manifests)", () => {
  const r = Manifest.parse({ ...(valid as object), positions: [{ subjectKey: "manifest:abc123", size: 1, units: "x" }] })
  expect(r.ok).toBe(false)
  if (r.ok) return
  console.log("  refusal:", r.error)
  expect(r.error).toMatch(/references another manifest/i)
  expect(r.error).toMatch(/no recursion/i)
})

test("MANIFEST — a non-object input is refused, never crashed on (hostile/garbage)", () => {
  for (const bad of [null, 42, "a string", [1, 2, 3]]) {
    const r = Manifest.parse(bad)
    expect(r.ok).toBe(false)
  }
})

test("MANIFEST — an INJECTION-shaped thesis parses as text (the render escapes; parse never executes it)", () => {
  const r = Manifest.parse({ ...(valid as object), thesis: `<script>alert(1)</script> and "; DROP TABLE positions;--` })
  expect(r.ok).toBe(true) // it is just text — the parser does not crash, the render escapes it (S71/S36)
  if (!r.ok) return
  expect(r.manifest.thesis).toContain("<script>")
})

test("MANIFEST — validateSubjects names an UNKNOWN subject key (the resolver is injected)", () => {
  const known = new Set(["defillama:pool:aave-v3-usdc", "defillama:pool:sparklend-dai"])
  const r0 = Manifest.parse(valid)
  expect(r0.ok).toBe(true)
  if (!r0.ok) return
  const ok = Manifest.validateSubjects(r0.manifest, (k) => known.has(k))
  expect(ok.ok).toBe(true)
  const bad = Manifest.validateSubjects({ ...r0.manifest, positions: [{ subjectKey: "defillama:pool:does-not-exist", size: 1, units: "x" }] }, (k) => known.has(k))
  expect(bad.ok).toBe(false)
  if (bad.ok) return
  console.log("  refusal:", bad.error)
  expect(bad.error).toMatch(/does-not-exist/)
  expect(bad.error).toMatch(/the engine does not know/i)
})

test("MANIFEST — the store round-trips local-first; the lineage id is STABLE as the journal fills (no fork)", () => {
  const r = Manifest.parse(valid)
  expect(r.ok).toBe(true)
  if (!r.ok) return
  const dir = path.join(StrategyStore.ROOT, "_test_manifests")
  try {
    const id = StrategyStore.save(r.manifest, dir)
    expect(existsSync(path.join(dir, `${id}.json`))).toBe(true)
    const back = StrategyStore.load(id, dir)
    expect(back).not.toBeNull()
    expect(back!.thesis).toBe(r.manifest.thesis)
    expect(StrategyStore.list(dir)).toContain(id)
    // filling the journal does NOT fork the lineage (the identity hash is unchanged)
    const id2 = StrategyStore.updateJournal(id, { priorIntent: "was going to add a third stable", changedByCompile: true }, dir)
    expect(id2).toBe(id) // SAME lineage id
    const withJournal = StrategyStore.load(id, dir)
    expect(withJournal!.journal?.changedByCompile).toBe(true)
    expect(StrategyStore.lineageId(withJournal!)).toBe(id) // identity hash unchanged by the journal
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("MANIFEST — the store is gitignored (local-first; no accounts, never committed)", () => {
  // the .gitignore-level assertion lives in the red-team; here confirm the runtime dirs live under data/strategies/
  expect(StrategyStore.MANIFEST_DIR).toContain(path.join("data", "strategies", "manifests"))
  expect(StrategyStore.FIXTURE_DIR).toContain(path.join("data", "strategies", "fixtures"))
})
