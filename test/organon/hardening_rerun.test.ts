/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 4/5/6: the workflow transcripts (S203/W-HD06), the guard aggregate + socket
 * (S204/W-HD08), the binary parity (S206/W-HD09), and the second-human docs + clean-machine (S207/W-HD10).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { GuardAggregate } from "../../src/organon/guardaggregate"
import { Socket } from "../../src/socket/server"
import { Binary } from "../../src/organon/binary"
import { Docs } from "../../src/organon/docs"
import { Hardening } from "../../src/organon/hardening"

test("S203 (W-HD06) — every workflow EXECUTED as a transcript, FAILURE PATHS included, AGENT-labeled, realLineageCount 0", () => {
  const j = JSON.parse(readFileSync("data/honesty/hardening-workflows.json", "utf8"))
  expect(j.allRan).toBe(true)
  expect(j.allFailurePathsExercised).toBe(true) // a workflow without its failure-path transcript is not validated (X-SHOWN(b))
  expect(j.realLineageCount).toBe(0) // the agent proves the door opens, never that a stranger walked it
  expect(j.agentLabeledCount).toBeGreaterThan(0)
  expect(Hardening.workflows().ok).toBe(true)
})

test("S204 (W-HD08) — the guard aggregate across EVERY render surface; the doc-shaped advice bait is CAUGHT; the caveat carried", () => {
  const a = GuardAggregate.aggregate()
  expect(a.perSurface.length).toBeGreaterThanOrEqual(3) // advice + contagion + docs
  const doc = a.perSurface.find((s) => s.name === "docs/README")!
  expect(doc.caught).toBe(doc.seeded) // every doc-shaped advice bait FAILS (is caught) — the README describes the tool, never a strategy
  expect(a.lowerBoundCaveat).toMatch(/LOWER BOUND|lower bound/)
  expect(GuardAggregate.verdict().ok).toBe(true)
})

test("S204 (W-HD08) — the socket protocol negotiation re-verified LIVE: in-range accepted, out-of-range LOUDLY refused naming the range (P-8)", () => {
  for (const v of Socket.SUPPORTED_VERSIONS) expect(Socket.negotiate(v).ok).toBe(true)
  const bad = Socket.negotiate("1999-01-01")
  expect(bad.ok).toBe(false)
  if (!bad.ok) expect(bad.refusal).toContain(Socket.SUPPORTED_VERSIONS[0]) // names the range, never a silent degrade
})

test("S206 (W-HD09) — the binary is BYTE-EQUAL to the source after the pinned normalization; a seeded divergence is CAUGHT", () => {
  const j = JSON.parse(readFileSync("data/honesty/hardening-binary.json", "utf8"))
  expect(j.equalAfterNorm).toBe(true)
  expect(j.seededDivergenceCaught).toBe(true) // the comparison CAN fail (not a rigged always-pass, X-REACH(a))
  expect(Binary.parityVerdict().ok).toBe(true)
  // the normalization touches ONLY named fields: a real content change survives it
  expect(Binary.normalize("verdict UNVERIFIED at 2026-07-16T00:00:00Z")).not.toBe(Binary.normalize("verdict TOTALLY-FINE at 2026-07-16T00:00:00Z"))
  // a timestamp difference is normalized away (equal after normalization)
  expect(Binary.normalize("at 2026-07-16T01:02:03Z")).toBe(Binary.normalize("at 2026-07-16T09:09:09Z"))
})

test("S207 (W-HD10) — the second-human README leads with LIMITS, ties every structural claim to a producer, is guard-clean, embeds no drift-prone figure", () => {
  const claims = Docs.structuralClaims()
  for (const c of claims) expect(c.ok).toBe(true) // deps/screens/laws/exitKinds all === their producers
  expect(Docs.tierLadderOrdered().ok).toBe(true)
  expect(Docs.guardClean().ok).toBe(true) // no advice leaks (the README describes the tool, never a strategy)
  expect(Docs.embeddedFigures().ok).toBe(true) // no %/$/N-day literal a producer doesn't emit
  expect(Docs.verdict().ok).toBe(true)
})

test("S207/RP-3 (W-HD10) — the clean-machine test SHOWED its absence checks (a warm cache disclosed, never hidden)", () => {
  const j = JSON.parse(readFileSync("data/honesty/hardening-cleanmachine.json", "utf8"))
  expect(j.absenceChecksShown).toBe(true) // a transcript without the absence checks REFUSES (F-3/RP-3)
  expect(j.environmentProvenance.disclosure).toMatch(/SAME-MACHINE|WARM|DISCLOSED/)
  expect(j.readmeVerbatim.cloned).toBe(true)
  expect(j.readmeVerbatim.firstRunOk).toBe(true) // the README path works: clone → install → check → first-run
})
