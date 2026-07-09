/**
 * ORGΛNON — THE SURFACE SPRINT, Phase 1 walls (FINDINGS-CLOSED, the VOICE validation findings V1–V5). Record hygiene
 * before any restyle; documentation + ledger only (no engine/render change — the frozen seven stay git-clean).
 *   V1 — the intent-count deviation restated PLAINLY as a caught blueprint-arithmetic error (COMPARE pre-existed → 4
 *        net-new; RECORD_HISTORY back-filled to the pinned 13), not a mechanical "enum interpretation".
 *   V2 — the single battery-reconciliation line: 703 → 768 (+65 pass, +9 files, +1 skip → {ask_live, eval_live}).
 *   V3 — the eval scope honest: only Groq measured LIVE; the other four covered by shared-gate ARCHITECTURE, not live
 *        sampling; live per-provider sampling flagged NEXT-sprint (stated in D12 + surface-pins).
 *   V5 — the eval attempt-rate DENOMINATORS: the fixed 12-case battery (8 intents + 4 attacks); every rate is k/12.
 * (V4 — the rendered-ANALYSIS-label assertion — lands in Phase 3's surface_content_identity, per the blueprint.)
 * NB: the file is findings_closed_VOICE (not _v) — findings_closed_v.test.ts already exists (Build-Provenance's V1–V4);
 * a caught blueprint naming collision (surface-pins.deviations.namingCorrection), not a silent overwrite.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { VoiceEval } from "../../src/ask/eval"

const H = path.join(PKG_ROOT, "data", "honesty")
const su = JSON.parse(readFileSync(path.join(H, "surface-pins.json"), "utf8"))
const dev = JSON.parse(readFileSync(path.join(H, "deviations.json"), "utf8"))
const vById = (id: string) => su.findingResolutions.find((v: { id: string }) => v.id === id)
const dById = (id: string) => dev.deviations.find((d: { id: string }) => d.id === id)

test("V1 — the intent lineage is restated PLAINLY as a caught blueprint-arithmetic error (COMPARE pre-existed; RECORD_HISTORY the fifth), not a mechanical enum note", () => {
  const r = vById("V1").resolution
  expect(r).toMatch(/COMPARE PRE-EXISTED/i)
  expect(r).toMatch(/4 (were )?net-new|only 4/i)
  expect(r).toMatch(/RECORD_HISTORY/)
  expect(r).toMatch(/caught blueprint-arithmetic correction/i)
  expect(r).not.toMatch(/mechanical enum note as the framing/i)
  // D11 (the original ledger entry) carries the same lineage — the record is consistent, not contradictory
  expect(dById("D11").whatWasDone).toMatch(/COMPARE pre-exists/i)
  expect(dById("D11").whatWasDone).toMatch(/RECORD_HISTORY/)
})

test("V2 — the single battery-reconciliation line is stated once (703 → 768, +65 pass / +9 files / +1 skip → the named skip set)", () => {
  const r = vById("V2").resolution
  expect(r).toMatch(/703 → 768/)
  expect(r).toMatch(/\+65 pass/)
  expect(r).toMatch(/\+9 files/)
  expect(r).toMatch(/\+1 skip/)
  expect(r).toMatch(/\{ask_live, eval_live\}/)
})

test("V3 — the eval scope is honest: only Groq measured LIVE, the other four by shared-gate architecture (not live sampling), live sampling flagged next-sprint — in D12 AND surface-pins", () => {
  const r = vById("V3").resolution
  expect(r).toMatch(/only Groq was measured LIVE/i)
  expect(r).toMatch(/SHARED-GATE ARCHITECTURE/i)
  expect(r).toMatch(/NOT.*live per-provider sampling|not by live/i)
  expect(r).toMatch(/NEXT-sprint/i)
  // the same honest scope now lives in the D12 ledger entry (the blueprint: "state in D12 + the eval docs")
  expect(dById("D12").whatWasDone).toMatch(/ONLY Groq was measured LIVE/i)
  expect(dById("D12").whatWasDone).toMatch(/SHARED-GATE ARCHITECTURE/i)
})

test("V5 — the eval attempt-rate DENOMINATORS are stated: the fixed 12-case battery (8 intents + 4 seeded attacks); every rate is k/12", () => {
  // the actual battery is 12 (8 intent + 4 attack) — the denominator the rates are computed over (metricsFor: outcomes.length)
  expect(VoiceEval.BATTERY).toHaveLength(12)
  expect(VoiceEval.BATTERY.filter((c) => c.kind !== "intent")).toHaveLength(4) // the seeded attack set
  expect(VoiceEval.BATTERY.filter((c) => c.kind === "intent")).toHaveLength(8)
  expect(VoiceEval.ATTACK_KINDS).toEqual(["injection", "advice-bait", "number-bait", "comparison-trap"])
  // D12 states the denominators so the committed rates (0.5, 0.167, …) carry their n
  const d12 = dById("D12").whatWasDone
  expect(d12).toMatch(/12-case battery/i)
  expect(d12).toMatch(/k\/12/)
  expect(d12).toMatch(/6\/12|8\/12/) // an explicit k/12 pairing
})

test("V4 — recorded as landing in the surface work (Phase 3): the ANALYSIS label RENDERED adjacent, asserted by the render, not only the markup", () => {
  // V4 is closed by Phase 3's surface_content_identity (a rendered-label assertion); here we assert the resolution is PINNED
  const r = vById("V4").resolution
  expect(r).toMatch(/RENDERED.*adjacent/i)
  expect(r).toMatch(/render assertion|surface_content_identity/i)
  expect(r).toMatch(/never renders in the FACT treatment/i)
})

test("FINDINGS-CLOSED — all five Voice findings V1–V5 are pinned RESOLVED (record hygiene complete before the restyle)", () => {
  expect(su.findingResolutions.map((v: { id: string }) => v.id)).toEqual(["V1", "V2", "V3", "V4", "V5"])
  for (const v of su.findingResolutions) expect(v.status).toBe("RESOLVED")
})
