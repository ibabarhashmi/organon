/**
 * ORGΛNON — THE PROBE SPRINT, Phase 3 walls (S53 — re-score honesty; X-HONEST governs absolutely, positive-controlled).
 * The Stream/Elixir/Resolv post-mortems: every fact cell REAL-and-content-hashed OR labeled SAMPLE; the recorded verdict
 * IS the engine's actual RECOMPUTED output (not authored); no fabricated cell; no unsupported certainty. The positive
 * control: a tampered verdict does NOT match the engine → the recompute wall bites.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"

const dir = path.join(PKG_ROOT, "data", "postmortems")
const load = (f: string) => JSON.parse(readFileSync(path.join(dir, f), "utf8"))
const SUBJECTS = ["stream", "elixir", "resolv"]

test("S53 — the three re-score post-mortems exist + are indexed; the index states the zero-new-scoring rule", () => {
  const idx = load("index.json")
  expect(idx.subjects.map((s: { subject: string }) => s.subject).sort()).toEqual([...SUBJECTS].sort())
  expect(idx.rule).toMatch(/existing deterministic engine|zero new scoring/i)
  expect(idx.allSample).toBe(true) // we did not re-fetch the delisted pools — every cell is honestly SAMPLE
})

test("S53 — the recorded verdict IS the engine's actual recomputed output (Scorecard.score on the recorded facts)", () => {
  for (const s of SUBJECTS) {
    const pm = load(`${s}.json`)
    const live = Scorecard.score(pm.facts)
    expect(live.verdict, `${s} verdict drifted from the engine`).toBe(pm.engineOutput.verdict)
    expect(live.rows.map((r) => `${r.axis}:${r.tier}`)).toEqual(pm.engineOutput.rows.map((r: { axis: string; tier: string }) => `${r.axis}:${r.tier}`))
  }
})

test("S53 — every fact cell is REAL-and-content-hashed OR labeled SAMPLE (no unlabeled cell)", () => {
  for (const s of SUBJECTS) {
    const pm = load(`${s}.json`)
    for (const [k, cell] of Object.entries(pm.factProvenance as Record<string, { reality: string; source: string }>)) {
      expect(["REAL", "SAMPLE"], `${s}.${k} unlabeled`).toContain(cell.reality)
      expect(cell.source, `${s}.${k} has no provenance`).toBeTruthy()
    }
    // the headline honestly reflects SAMPLE provenance (the engine will not bless unverifiable data)
    expect(pm.provenancePosture).toMatch(/SAMPLE/)
  }
})

test("S53 POSITIVE CONTROL — a tampered verdict does NOT match the engine (the recompute wall bites, not a no-op)", () => {
  const pm = load("stream.json")
  const tampered = { ...pm, engineOutput: { ...pm.engineOutput, verdict: "SOLID" } } // the flattering fabrication
  const live = Scorecard.score(tampered.facts)
  expect(live.verdict).not.toBe(tampered.engineOutput.verdict) // the engine says UNVERIFIED, never SOLID on SAMPLE data
})

test("S53 — no post-mortem asserts a REAL cell we did not fetch; the persuasion is the engine's actual adverse flags", () => {
  for (const s of SUBJECTS) {
    const pm = load(`${s}.json`)
    // every provenance cell is SAMPLE (we did not re-fetch) — no cell claims a REAL content-hash it can't back
    const anyReal = Object.values(pm.factProvenance as Record<string, { reality: string }>).some((c) => c.reality === "REAL")
    expect(anyReal).toBe(false)
    // the adverseFlags are DERIVED from the engine's actual rows (fail/caution tiers), not authored prose
    const engineAdverse = pm.engineOutput.rows.filter((r: { tier: string }) => r.tier === "fail" || r.tier === "caution").map((r: { axis: string; tier: string }) => `${r.axis}: ${r.tier}`)
    expect(pm.adverseFlags).toEqual(engineAdverse)
  }
})
