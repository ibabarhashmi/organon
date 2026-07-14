/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 3 walls: S121 (census two-directional), S122 (D53's ledger hash), S126 (prose
 * names a producer, never restates a value). The unpaid debts — never sheds, owed twice, not a third time.
 *
 * S121 (H-5): the census wall may only fail in one direction — a fifth bucket `reclassified:1` appeared in prose with no wall
 * named, and the failure was only "a negative residual." If reclassified is DERIVED from the residual it is an identity, a
 * plug. FIX: reclassified is a NAMED wall (S94, git-verified) and the check is TWO-DIRECTIONAL (named === residual; a plug
 * FAILS, an unnamed drop FAILS).
 * S122 (H-6): D53's price was rendered ("Halt lifts: 1") but the ledger HASH was absent. FIX: the SEARCH (halt-lifts.json) is
 * committed and HASH-CHAINED in record/ (a real immutable hash); the honest correction — the strategy-trial ledger is not a
 * coherent site for a meta-event, so the log stops claiming it was appended there.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Consistency } from "../../src/organon/consistency"
import { Prose } from "../../src/organon/prose"
import { existsSync } from "node:fs"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── S121 — the census wall fails in BOTH directions ───────────────────────────────────────────────────────────────────
test("S121 (W-SU06, H-5) — reclassified is a NAMED wall (S94, git-verified moved buckets), not a residual plug", () => {
  expect(Consistency.NAMED_RECLASSIFIED.length).toBe(1)
  const s94 = Consistency.NAMED_RECLASSIFIED[0]
  expect(s94.id).toBe("S94")
  expect(s94.from).toMatch(/ORIGIN_UNRECORDED/i) // it WAS unrecorded in V35
  expect(s94.to).toMatch(/DEMONSTRATED/i) // it IS demonstrated now
  expect(s94.via).toMatch(/incidental|not the DD-20 reFounding/i) // by an incidental reference, not the treatment
  // the live census reconciles: named-reclassified === residual
  const cr = Consistency.censusReconciliation()
  expect(cr.namedReclassified).toBe(cr.reclassified)
  expect(cr.contradiction).toBeNull()
})

test("S121 (H-5) — the check is TWO-DIRECTIONAL: a plug (named > residual) FAILS and an unnamed drop (named < residual) FAILS", () => {
  // the correct reconciliation (named 1 === residual 1) passes
  expect(Consistency.reconcileCensus(83, 70, 0, 12, 0, 1).contradiction).toBeNull()
  // SEEDED NEGATIVE — a PLUG: naming 2 walls when only 1 moved (named > residual) FAILS
  expect(Consistency.reconcileCensus(83, 70, 0, 12, 0, 2).contradiction).not.toBeNull()
  // SEEDED NEGATIVE — an UNNAMED drop: naming 0 when 1 moved (named < residual) FAILS
  expect(Consistency.reconcileCensus(83, 70, 0, 12, 0, 0).contradiction).not.toBeNull()
  // SEEDED NEGATIVE — a treatment that over-claims the OU drop (negative residual) FAILS
  expect(Consistency.reconcileCensus(83, 70, 0, 20, 0, 1).contradiction).not.toBeNull()
})

// ── S122 — D53's SEARCH carries a ledger hash ─────────────────────────────────────────────────────────────────────────
test("S122 (W-SU07, H-6) — the D53 SEARCH (halt-lifts.json) is committed and HASH-CHAINED in record/ (a real immutable hash), not a bare sentence", () => {
  const chain = JSON.parse(readFileSync(path.join(PKG_ROOT, "record", "chain.json"), "utf8"))
  const entry = chain.chain.find((e: { name: string }) => e.name === "halt-lifts.json")
  expect(entry).toBeTruthy() // the SEARCH record is IN the chain
  // the ledger hash is real and equals the entry's chain link
  expect(chain.d53SearchLedgerHash).toBe(entry.selfSha)
  expect(chain.d53SearchLedgerHash).toMatch(/^[0-9a-f]{64}$/)
  // tamper-evident: the committed halt-lifts.json content matches its contentSha in the chain
  const haltContent = readFileSync(path.join(PKG_ROOT, "record", "halt-lifts.json"), "utf8")
  expect(sha256(haltContent)).toBe(entry.contentSha)
  // and the chain link is valid (selfSha = sha256(prevSha + contentSha))
  expect(sha256(entry.prevSha + entry.contentSha)).toBe(entry.selfSha)
})

test("S122 (H-6) — the honest correction: the strategy-trial ledger is NOT the site (a meta-event is not a manifest); the price is paid in the record", () => {
  const chain = JSON.parse(readFileSync(path.join(PKG_ROOT, "record", "chain.json"), "utf8"))
  expect(chain.d53Note).toMatch(/META-event|not a strategy manifest/i)
  expect(chain.d53Note).toMatch(/no coherent (append )?site/i)
  // the halt-lifts record itself carries the SEARCH act + the count
  const halt = JSON.parse(readFileSync(path.join(H, "halt-lifts.json"), "utf8"))
  expect(halt.act).toBe("SEARCH")
  expect(halt.lifts).toBe(1)
  // the substance pins record the honest resolution
  const sp = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))
  expect(sp.d53Price_S122.resolution).toMatch(/hash-chain/i)
  expect(sp.d53Price_S122.rule).toMatch(/NOT.*strategy manifest|no coherent/i)
})

// ── S126 — prose names a producer, never restates a value ─────────────────────────────────────────────────────────────
test("S126 (W-SU09, H-9/MR16) — a claim line that RESTATES a producer's value FAILS; a line that NAMES the producer passes", () => {
  const producerNumbers = [1668, 70, 43] // battery pass · census OU · demonstrated (producer outputs)
  // SEEDED NEGATIVE — restating the battery producer's value inline (the exact V37 defect)
  expect(Prose.restatesValue("the battery passed 1668 tests", producerNumbers).restated).toBe(true)
  expect(Prose.restatesValue("census OU dropped to 70", producerNumbers).restated).toBe(true)
  // NAMING the producer is allowed (the value is single-sourced, computed) — never restated
  expect(Prose.restatesValue("the battery producer's pass count reconciles with the census producer", producerNumbers).restated).toBe(false)
  expect(Prose.restatesValue("the census producer computes the OU count", producerNumbers).restated).toBe(false)
})

test("S126 — STRUCTURAL numbers do not false-flag: dates, wall ids (S116), sprint tags (V38), deviations (D53), method numbers", () => {
  const producerNumbers = [1668, 70, 43]
  // these carry structural numbers that are NOT producer-claims — they must pass
  for (const line of [
    "S116 makes D33's test valid; S121 is two-directional (built 2026-07-14)",
    "D53 lifted the Halt; V38 mints no law; RP-1 and DD-33 pin the power argument",
    "the tolerance stays 0.02, the theory 0.5, the window 180 days, S=16 over 200 seeds",
    "SUBSTANCE PINS_SHA 153628a9 carried from ab4900ee",
  ]) expect(Prose.check(line, producerNumbers).ok).toBe(true)
})

test("S126 — the generated build log (when present) restates NO producer value on its claim lines", () => {
  // the live producer numbers this sprint (the build log must NAME these producers, never restate the digits inline)
  const producerNumbers = [1668, 70, 43, 12]
  for (const rel of ["record/BUILDLOG-SUBSTANCE.md", "sprint/sprint-result/BUILDLOG-SUBSTANCE.md"]) {
    const p = path.join(PKG_ROOT, rel)
    if (!existsSync(p)) continue // written at the sprint's close; the seeded core above always runs
    const body = readFileSync(p, "utf8")
    // check ALL the PROSE narrative — strip every fenced (```) GENERATED block (header/gate/marker are producer-sourced by
    // construction); what remains is the agent's prose, and it must NAME producers, never restate their values (V37's defect
    // was in the PHASE prose, so the check covers the whole document, not just the intro).
    const prose = body.replace(/```[\s\S]*?```/g, " ")
    const r = Prose.check(prose, producerNumbers)
    expect(r.ok).toBe(true)
  }
})

// ── S123 — the corpus grows against the three new surfaces, from a different author (RP-6/RP-7) ────────────────────────
test("S123 (W-SU08, RP-6) — the corpus grew against the THREE NEW SURFACES, authored by a DIFFERENT LAB (not V35's Meta / V36's OpenAI)", () => {
  const fx = JSON.parse(readFileSync(path.join(H, "ask-transcripts.json"), "utf8"))
  const g = fx.grownV38
  expect(g).toBeTruthy()
  expect(g.surfaces.sort()).toEqual(["concentration-share", "false-fire-count", "socket-tool-description"])
  expect(g.author).toMatch(/qwen/i) // a genuinely different lab (Alibaba)
  const baits = fx.transcripts.filter((t: { kind: string }) => t.kind === "substance-surface")
  expect(baits.length).toBeGreaterThanOrEqual(5)
  // each bait records its surface, author, enumerated flag, and whether the guard caught it (structural provenance)
  for (const b of baits) {
    expect(typeof b.guardCaught).toBe("boolean")
    expect(typeof b.enumerated).toBe("boolean")
    expect(typeof b.qualifies).toBe("boolean")
    expect(b.author).toMatch(/qwen/i)
  }
})

test("S123 (RP-7) — guardEfficacy is COMPUTED on the PROVENANCE of the catch; a qualifying catch needs a different author AND an un-enumerated angle", () => {
  const fx = JSON.parse(readFileSync(path.join(H, "ask-transcripts.json"), "utf8"))
  const g = fx.grownV38
  // guardEfficacy is a COMPUTED member of the honest set (not asserted — this sprint it is UNJUDGEABLE, the 5th zero)
  expect(["DEMONSTRATED-THIS-SPRINT", "NOT-YET-DEMONSTRATED", "UNJUDGEABLE"]).toContain(g.guardEfficacy)
  // the RP-7 rule holds in the data: a bait qualifies IFF the guard caught it AND its angle was un-enumerated
  const baits = fx.transcripts.filter((t: { kind: string }) => t.kind === "substance-surface")
  for (const b of baits) expect(b.qualifies).toBe(b.guardCaught && !b.enumerated)
  // the terminal clause: a FIFTH consecutive zero → UNJUDGEABLE names the CORPUS the weak wall (said out loud)
  if (g.guardEfficacy === "UNJUDGEABLE") {
    expect(g.consecutiveZeroSprints).toBeGreaterThanOrEqual(5)
    expect(g.terminalClause).toMatch(/CORPUS.*weak wall/i)
  }
  // the honest limit is stated (a corpus grading its own homework is a weak wall)
  expect(g.honestLimit).toMatch(/weak wall|self-grad|same provider/i)
})
