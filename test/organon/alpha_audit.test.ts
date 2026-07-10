/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 1 walls (AUDITED). The audit artifact is complete BEFORE any hardening:
 * every pinned subsystem is covered (a finding, or the written audited-clean note), every door carries a
 * disposition, the discrepancy list is present (the tree wins), every BLOCKER carries the full why/risk/
 * complexity/dependencies/roadmap fields, D22 is in the ledger verbatim, and the LN closures render —
 * LN4's result recorded either way (PROVEN or the honest UNPROVEN note both satisfy the wall; silence fails it).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = (f: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", f), "utf8"))
const audit = H("alpha-audit.json")
const pins = H("alpha-pins.json")
const dev = H("deviations.json")

test("every pinned subsystem is covered — a finding OR the written audited-clean note (an empty-findings subsystem without its note fails)", () => {
  const withFindings = new Set(
    [...audit.blockers, ...audit.harden, ...audit.defer].map((f: { subsystem: string }) => f.subsystem),
  )
  const clean = new Set(Object.keys(audit.subsystemsAuditedClean))
  const covered = new Set([...withFindings, ...clean])
  // subsystem aliases: the audit files findings under the concrete surface names the pins list abstracts
  const alias: Record<string, string[]> = {
    frontend: ["frontend"], backend: ["backend"], cli: ["cli"], installer: ["installer"],
    configuration: ["configuration"], onboarding: ["onboarding"], "provider-abstraction": ["provider-abstraction"],
    "api-layer": ["api-layer"], "model-routing": ["model-routing"], "prompt-pipeline": ["prompt-pipeline"],
    "skill-isolation": ["skill-isolation"], caching: ["caching"], concurrency: ["concurrency"],
    "error-handling": ["error-handling"], retries: ["retries"], validation: ["validation"],
    logging: ["logging"], diagnostics: ["diagnostics"], testing: ["testing"],
    "dependency-management": ["dependency-management"], packaging: ["packaging"],
    "update-strategy": ["update-strategy"], portability: ["portability"], performance: ["performance"],
    maintainability: ["maintainability"], dx: ["dx"], ux: ["ux"], security: ["security"],
    architecture: ["architecture"],
  }
  for (const sub of pins.d22Schema.subsystems as string[]) {
    const hit = (alias[sub] ?? [sub]).some((a) => covered.has(a))
    expect(hit, `subsystem '${sub}' has neither a finding nor an audited-clean note`).toBe(true)
  }
  // the audited-clean notes are WRITTEN (each states what was checked), not checkbox-empty
  for (const [sub, note] of Object.entries(audit.subsystemsAuditedClean as Record<string, string>)) {
    expect(note, `audited-clean note for '${sub}' must state what was checked`).toMatch(/checked/)
  }
})

test("every door carries a disposition — HARDEN-FOR-ALPHA or CONSCIOUSLY-GATED, never silently open", () => {
  expect(audit.doorInventory.length).toBeGreaterThanOrEqual(9)
  for (const d of audit.doorInventory) {
    expect(["HARDEN-FOR-ALPHA", "CONSCIOUSLY-GATED"]).toContain(d.disposition)
    expect(d.how.length).toBeGreaterThan(10)
  }
  // the fourth-door probe surfaces are explicitly present
  const doors = audit.doorInventory.map((d: { door: string }) => d.door).join("\n")
  expect(doors).toMatch(/:4319/)
  expect(doors).toMatch(/builder/i)
  expect(doors).toMatch(/pool\/compose/i)
  expect(doors).toMatch(/MCP/i)
})

test("every BLOCKER carries the full fields + a roadmap slot; the discrepancy list is present and the tree wins", () => {
  expect(audit.blockers.length).toBeGreaterThan(0)
  for (const b of audit.blockers) {
    for (const f of ["id", "subsystem", "finding", "file", "why", "riskIfUnaddressed", "complexity", "disposition", "roadmapSlot"]) {
      expect(b[f], `blocker ${b.id} missing ${f}`).toBeTruthy()
    }
    expect(b.disposition).toBe("BLOCKER")
    expect(Array.isArray(b.dependencies)).toBe(true)
  }
  for (const del of audit.defer) expect(del.why, `DEFER ${del.id} needs its written why`).toBeTruthy()
  expect(audit.discrepancies.length).toBeGreaterThanOrEqual(5)
  for (const d of audit.discrepancies) expect(d.treeWins, `${d.id} must state how the tree wins`).toBeTruthy()
})

test("D22 is in the ledger verbatim (referencing the audit artifact) and D23 states its Operator-signature status honestly", () => {
  const d22 = dev.deviations.find((x: { id: string }) => x.id === "D22")
  const d23 = dev.deviations.find((x: { id: string }) => x.id === "D23")
  expect(d22).toBeTruthy()
  expect(d22.whatWasDone).toMatch(/alpha-audit\.json/)
  expect(d22.whatWasDone).toMatch(/git diff -- src\/ was EMPTY/)
  expect(d23).toBeTruthy()
  expect(typeof d23.operatorSigned).toBe("boolean") // stated, never implied — false + AWAITING is the honest state
  if (!d23.operatorSigned) expect(d23.note).toMatch(/AWAITING/i)
})

test("the LN closures render — LN4's result recorded either way (a missing artifact fails; PROVEN or honest-UNPROVEN both pass)", () => {
  for (const k of ["LN1", "LN2", "LN3", "LN4", "LN5"]) expect(audit.lnClosures[k], `${k} missing`).toBeTruthy()
  const ln4 = H("ln4-floor60.json")
  expect(["PROVEN-ON-LIVE-DATA", "UNPROVEN", "FAILED"]).toContain(ln4.status)
  if (ln4.status === "PROVEN-ON-LIVE-DATA") {
    const by = Object.fromEntries(ln4.windows.map((w: { n: number; verdict: string; degraded: boolean }) => [w.n, w]))
    expect(by[59].verdict).toBe("INSUFFICIENT")
    expect(by[59].degraded).toBe(true)
    expect(by[60].verdict).toBe("GO")
    expect(by[61].verdict).toBe("GO")
    expect(ln4.realityControl.verdict).toBe("INSUFFICIENT") // SAMPLE-never-GO is two-clause: length AND reality
  } else {
    expect(ln4.note).toMatch(/unproven on live data/i) // the honest terminal state, recorded not hidden
  }
  // LN5 carried verbatim: the distinction text is present word-for-word
  expect(audit.lnClosures.LN5).toMatch(/cannot SIT the Operator's real-screen session/)
})
