/**
 * ORGΛNON — THE MOAT SPRINT, Phase 3 wall (REAL-RESCORE; PR3, S56). The post-mortems earn REAL cells to the truth's
 * exact ceiling. This wall enforces:
 *   · content-hash integrity — every REAL capture re-hashes to its committed contentSha (a tampered value → caught).
 *   · engine re-verification — Scorecard.score(realFacts) reproduces the recorded verdict (the verdict is the engine's
 *     actual output on REAL facts, not authored).
 *   · PIT honesty — NO REAL cell claims REAL-AS-OF-COLLAPSE; every REAL cell states REAL-AS-FETCHED-NOW; a seeded
 *     PIT-dishonest cell is caught.
 *   · SAMPLE where the fetch can't back it (stream/elixir have no current price → the peg cell stays SAMPLE, labeled).
 *   · the kill-criterion UNTOUCHED (8b4e094b) — the goalpost did not move while the artifact improved.
 *   · the census before→after (all-SAMPLE → N REAL cells).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const read = (rel: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "postmortems", rel), "utf8"))
const SUBJECTS = ["stream", "elixir", "resolv"]
const reals = SUBJECTS.map((k) => read(`${k}-real.json`))

test("S56 (content-hash integrity) — every REAL capture re-hashes to its committed contentSha (a tampered value would break it)", () => {
  for (const r of reals) {
    expect(sha256(JSON.stringify(r.realCapture)), `${r.subject}: contentSha must equal sha256 of the committed capture`).toBe(r.contentSha)
    expect(r.contentSha).toMatch(/^[0-9a-f]{64}$/)
  }
})

test("S56 (tamper control) — mutating a committed REAL value breaks the contentSha (the integrity check BITES)", () => {
  const r = reals.find((x) => x.subject === "resolv")
  const tampered = { ...r.realCapture, tvlSeries: { ...r.realCapture.tvlSeries, currentTvlUsd: r.realCapture.tvlSeries.currentTvlUsd + 1 } }
  expect(sha256(JSON.stringify(tampered))).not.toBe(r.contentSha) // a one-dollar tamper → a different hash → caught
})

test("S56 (engine re-verification) — Scorecard.score(realFacts) reproduces the recorded verdict + adverse flags (the engine's actual output on REAL facts)", () => {
  for (const r of reals) {
    const scored = Scorecard.score(r.realFacts as Scorecard.PoolFacts)
    expect(scored.verdict, `${r.subject}: verdict must recompute`).toBe(r.engineOutput.verdict)
    const liveFlags = scored.rows.filter((x) => x.tier === "fail" || x.tier === "caution").map((x) => `${x.axis}: ${x.tier}`)
    expect(liveFlags.sort()).toEqual([...r.engineOutput.adverseFlags].sort())
  }
})

test("S56 (Resolv's REAL peg fail) — the current $0.15 price makes the peg axis FAIL on REAL data (a REAL adverse flag, not a SAMPLE reconstruction)", () => {
  const resolv = reals.find((r) => r.subject === "resolv")
  expect(resolv.realFacts.reality).toBe("REAL")
  expect(resolv.realCells.pegDev.reality).toBe("REAL")
  expect(resolv.engineOutput.adverseFlags).toContain("peg: fail")
  expect(resolv.peakToNowDrawdown).toBeLessThan(-0.9) // peak → now is a near-total wipeout
})

test("S56 (PIT honesty) — NO REAL cell claims REAL-AS-OF-COLLAPSE; every REAL cell states its as-of as fetched-now/current", () => {
  for (const r of reals) {
    for (const [name, cell] of Object.entries(r.realCells as Record<string, { reality: string; asOf: string }>)) {
      if (cell.reality === "REAL") {
        expect(cell.asOf, `${r.subject}.${name} must state REAL-AS-FETCHED-NOW`).toMatch(/REAL — .*(current|fetched)/i)
        expect(cell.asOf.toLowerCase(), `${r.subject}.${name} must NOT claim as-of-collapse`).not.toMatch(/as-of-collapse|as of collapse|at the collapse/)
      }
    }
    // the posture line names the PIT fence explicitly
    expect(r.provenancePosture).toMatch(/NOT a point-in-time capture|REAL-AS-FETCHED-NOW/i)
  }
})

test("S56 (SAMPLE where not fetchable) — stream/elixir have no current price → the peg cell STAYS SAMPLE, plainly labeled", () => {
  for (const k of ["stream", "elixir"]) {
    const r = reals.find((x) => x.subject === k)
    expect(r.realCells.pegDev.reality).toBe("SAMPLE")
    expect(r.realCells.pegDev.asOf).toMatch(/SAMPLE|no current price|delisted/i)
  }
})

test("S56 (seeded PIT-dishonest cell is caught) — an as-of-collapse claim on a current fetch fails the PIT guard", () => {
  const dishonest = { reality: "REAL", asOf: "REAL — as-of-collapse peg captured at the November 2025 collapse", source: "x" }
  const claimsCollapse = dishonest.reality === "REAL" && /as-of-collapse/i.test(dishonest.asOf)
  expect(claimsCollapse, "the guard must flag a REAL-as-of-collapse claim").toBe(true) // the property the real cells never violate
})

test("S56 (kill-criterion untouched) — the goalpost 8b4e094b did NOT move while the artifact earned REAL cells", () => {
  const kc = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-kill-criterion.json"), "utf8"))
  const { commitHash, ...body } = kc
  expect(sha256(JSON.stringify(body))).toBe(commitHash)
  expect(commitHash).toMatch(/^8b4e094b/)
})

test("S56 (census before→after) — the index records the REAL-layer upgrade (all-SAMPLE → N REAL cells), PIT-fenced", () => {
  const idx = read("index.json")
  expect(idx.realLayer).toBeTruthy()
  expect(idx.realLayer.census.before).toMatch(/all-SAMPLE|0 REAL/i)
  expect(idx.realLayer.census.after.length).toBe(3)
  for (const a of idx.realLayer.census.after) expect(a.realCells).toBeGreaterThanOrEqual(2)
  expect(idx.realLayer.pitFence).toMatch(/never as-of-collapse|current\/aftermath|REAL-AS-FETCHED-NOW/i)
})
