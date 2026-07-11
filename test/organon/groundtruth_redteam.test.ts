/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, PART E wall. The red-team artifact (groundtruth-redteam.json) records the full
 * first-class catalog S1-S63 all PASS (S1-S60 carried + re-run; S61 implementation-truth realized, S62 the IMMUTABLE proof
 * wall, S63 the archive-truth wall), the new walls broken-on-purpose + biting, the whole Operator gate OWED-OPERATOR-GATED
 * (an agent signs nothing — LN5), and the frozen invariants byte-unchanged. This wall re-verifies the artifact + re-runs the
 * gravest new controls live (the mask gate bites, the IMMUTABLE disguise → UNRESOLVED, the archive capture re-classifies).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"
import { BytecodeMatch } from "../../src/contract/bytecodematch"

const RT = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "groundtruth-redteam.json"), "utf8"))
const readJ = (rel: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, rel), "utf8"))

test("RED-TEAM — the artifact re-hashes + every probe PASSED (S1-S63, zero failures)", () => {
  const { contentSha, ...body } = RT
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(contentSha)
  expect(RT.catalog).toBe("S1-S63")
  expect(RT.summary.failed).toBe(0)
  expect(RT.summary.passed).toBe(RT.summary.total)
  for (const pr of RT.probes) expect(pr.ok, `probe failed: ${pr.name} · ${pr.detail}`).toBe(true)
})

test("RED-TEAM — the gravest new walls BITE live (S61 mask gate · S62 disguise → UNRESOLVED · S63 re-classify → EOA)", () => {
  // S61 — a one-byte-off in a logic region → MISMATCH (the screen never sees unmatched source)
  const imm: BytecodeMatch.ImmutableRefs = { "1": [{ start: 6, length: 4 }] }
  const a = "60".repeat(6) + "00".repeat(4) + "52".repeat(5) + "a2aabb" + "0003"
  const b = "60".repeat(5) + "61" + "00".repeat(4) + "52".repeat(5) + "a2aabb" + "0003"
  expect(BytecodeMatch.bytecodeMatches(a, b, imm).match).toBe(false)
  // S62 — the disguise (embedded constant + live SSTORE-to-1967) → NOT immutable
  const d = readJ("data/honesty/governance/fixtures/disguised-mutable.json")
  expect(Governance.proveImmutable(Governance.probeImmutability(d.proxyCode, d.resolvedImpl, d.implSlotZero)).immutable).toBe(false)
  // S63 — the archive capture re-classifies to EOA on the committed probe
  const rug = readJ("data/honesty/governance/archive-rug.json")
  if (rug.status === "CAPTURED") {
    const re = Governance.classifyAdmin({ adminAddr: rug.reads.adminAddr, adminCodePresent: true, isSafe: false, isTimelock: false, ownerAddr: rug.reads.ownerAddr, ownerCodePresent: !rug.reads.ownerIsEoa, ownerIsSafe: false, ownerIsTimelock: false })
    expect(re.adminClass).toBe("EOA")
  }
})

test("RED-TEAM — the whole gate is OWED-OPERATOR-GATED (D23-D31, D27 first, ALL unsigned — an agent signs nothing, LN5)", () => {
  expect(RT.gate).toMatch(/OWED-OPERATOR-GATED|operatorSigned=false/i)
  const gate = readJ("data/honesty/groundtruth-countersign-package.json")
  expect(gate.deviations.every((x: { operatorSigned: boolean }) => x.operatorSigned === false)).toBe(true)
})

test("RED-TEAM — the frozen invariants held at the gate (verdict-path unchanged · mass path {hono,zod} · differential + kill-criterion + bundle byte-stable)", () => {
  expect(RT.frozen.verdictPathUnchanged).toBe(true)
  expect(RT.frozen.massPath.sort()).toEqual(["hono", "zod"])
  expect(RT.frozen.differentialBaseline.lendingSetSha).toMatch(/^70c7912f/)
  expect(RT.frozen.killCriterion).toMatch(/8b4e094b/)
  expect(RT.frozen.bundle).toMatch(/9c1e7bd8/)
})
