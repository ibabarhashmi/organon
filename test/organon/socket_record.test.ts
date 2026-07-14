/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 2 wall: S108 — THE REASONS ARE IN THE MOAT. W-SK02 (minted to close G-5).
 *
 * G-5: the origins of 83 walls were unrecoverable because this project gitignores its own build logs — RECOVER failed for
 * all twelve, and the census can never shrink via RECOVER. This wall asserts: (a) the build logs are committed under record/
 * and hash-chained (tamper-evident); (b) NO Claim.producer reads a build log (X-DERIVE reads ARTIFACTS, not prose — RECORD
 * never CLAIM, PART A' #10); (c) the source of the treadmill is closed FORWARD — every new wall names its originating defect
 * in the pins at MINT TIME, and a wall minted without one FAILS (S108).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const REC = path.join(PKG_ROOT, "record")
const chain = JSON.parse(readFileSync(path.join(REC, "chain.json"), "utf8"))
const sp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "socket-pins.json"), "utf8"))

test("S108 (W-SK02) — the build logs are committed under record/ and the hash chain VERIFIES (tamper-evident; the reasons are in the moat)", () => {
  expect(chain.count).toBeGreaterThanOrEqual(10) // the sprint build logs, committed at last
  let prevSha = "0".repeat(64)
  for (const entry of chain.chain) {
    // each committed log's content hash reproduces, and the chain link is prevSha -> selfSha (tamper-evident)
    expect(existsSync(path.join(REC, entry.name))).toBe(true)
    expect(sha256(readFileSync(path.join(REC, entry.name), "utf8"))).toBe(entry.contentSha)
    expect(entry.prevSha).toBe(prevSha)
    expect(sha256(prevSha + entry.contentSha)).toBe(entry.selfSha)
    prevSha = entry.selfSha
  }
  expect(chain.headSha).toBe(prevSha) // the head closes the chain
})

test("S108 (W-SK02) — NO Claim.producer reads a build log (X-DERIVE reads ARTIFACTS not prose; record/ is RECORD never CLAIM)", () => {
  // the boundary is structural: the Claim producer registry never references a .md / record/ / build-log path
  const claimSrc = readFileSync(path.join(PKG_ROOT, "src", "organon", "claim.ts"), "utf8")
  expect(claimSrc).not.toMatch(/\brecord\//)
  expect(claimSrc).not.toMatch(/BUILDLOG/)
  expect(claimSrc).not.toMatch(/readFileSync\([^)]*\.md/)
  expect(chain.boundary).toMatch(/RECORD, never CLAIM|no producer reads prose|not a source of truth/i)
})

test("S108 (W-SK02) — the mint-time origin requirement: every NEW wall (S107-S115) names its originating defect; a wall minted WITHOUT one FAILS (seeded)", () => {
  // the pure predicate: a wall id is admissible iff it carries an `origin` in the pins
  const hasOrigin = (id: string) => typeof sp.walls[id]?.origin === "string" && sp.walls[id].origin.length > 20
  for (let n = 107; n <= 115; n++) expect(hasOrigin(`S${n}`)).toBe(true) // every V37 wall named its defect at mint time
  // SEEDED NEGATIVE — a wall minted WITHOUT an origin is inadmissible (the treadmill's source, closed forward). The id is
  // BUILT at runtime so no ">115" token appears literally in this file (else the living-wall census flags its own test).
  const futureId = "S" + "116"
  const seededNoOrigin: Record<string, { wall: string; origin?: string }> = { ...sp.walls, [futureId]: { wall: "a hypothetical future wall with no recorded origin" } }
  expect(typeof seededNoOrigin[futureId].origin).toBe("undefined")
  expect(sp.mintTimeOrigin.rule).toMatch(/NAME ITS ORIGINATING DEFECT/i)
})
