/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 4 wall (REAL-RUG-AT-HEIGHT; X-GROUNDTRUTH c, S63). ONE pinned subject, ONE
 * pinned pre-collapse height, THREE reads, over FREE archive-capable endpoints — content-hashed + re-verifiable against its
 * named endpoints+height, OR the honest gap. The capture LANDED: PAID Network's V1 token proxy at block 11975000, its
 * ProxyAdmin owned by a single EOA one hop out → the axis rendered the DAMNING EOA line on the real rug's REAL pre-collapse
 * state (cross-checked across 3 free endpoints). The discrimination claim upgrades to EXACTLY what was proven; the wording
 * tracks the evidence in BOTH directions; the boundedness wall holds (no range-scan, no second rug — the archive-node scope
 * stays PARKED); a simulated pre-collapse state dressed REAL is the cardinal sin.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"

const A = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "governance", "archive-rug.json"), "utf8"))
const GC = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "governance-claim.json"), "utf8"))

test("S63 — the capture re-hashes from its own body (content-addressed, re-verifiable against its named endpoints + height)", () => {
  const { contentSha, ...body } = A
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(contentSha)
  expect(["CAPTURED", "HONEST-GAP"]).toContain(A.status)
})

test("S63 — the pinned subject + pre-collapse height are recorded (PAID Network V1, block 11975000) — the anti-cherry-pick pin", () => {
  expect(A.subject.address.toLowerCase()).toBe("0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df")
  expect(A.block).toBe(11975000)
})

test("S63 (the capture LANDED) — cross-checked across ≥2 FREE archive endpoints; the classifier RE-RUNS on the captured probe → EOA (the damning line)", () => {
  if (A.status !== "CAPTURED") return // the honest-gap branch is covered by the wording-tracks-evidence test below
  expect(A.crossChecked).toBe(true)
  expect(A.endpoints.length).toBeGreaterThanOrEqual(2)
  // free-only — no paid/BYOK archive endpoint (the moat stays sovereign; a paid key is a cut)
  for (const e of A.endpoints) expect(e).not.toMatch(/apikey|\/v[0-9]+\/[A-Za-z0-9_-]{20,}|infura|alchemy/i)
  // the classifier re-runs on the committed probe → the SAME class (re-verifiable, not a stored assertion)
  const reclassified = Governance.classifyAdmin(A.reads ? { adminAddr: A.reads.adminAddr, adminCodePresent: true, isSafe: false, isTimelock: false, ownerAddr: A.reads.ownerAddr, ownerCodePresent: !A.reads.ownerIsEoa, ownerIsSafe: false, ownerIsTimelock: false } : (A as never))
  expect(reclassified.adminClass).toBe("EOA") // a single key one hop out (the ProxyAdmin's EOA owner)
  expect(A.adminClass).toBe("EOA")
  expect(A.reads.ownerIsEoa).toBe(true)
  expect(A.governanceLine).toMatch(/A single key can replace this contract's logic/)
})

test("S63 (boundedness) — ONE subject, ONE height, THREE reads — NO range-scan / NO second rug (the archive-node scope stays PARKED)", () => {
  expect(typeof A.block).toBe("number") // a single height, never a range
  expect(A.range ?? A.blocks ?? A.subjects).toBeUndefined() // no range-scan / no multi-subject sweep
  // exactly the three governance reads (admin slot · implementation · admin code + the owner-hop) — the live path's reads
  if (A.status === "CAPTURED") expect(Object.keys(A.reads).sort()).toEqual(["adminAddr", "adminSlot", "implementation", "ownerAddr", "ownerIsEoa"])
})

test("S63 (wording tracks the evidence in BOTH directions) — governance-claim.json matches the capture outcome exactly", () => {
  if (A.status === "CAPTURED") {
    expect(GC.status).toBe("UPGRADED") // a today-wording DESPITE a landed capture is a Halt
    expect(GC.upgraded.contentHash).toBe(A.contentSha) // an upgraded wording WITHOUT the capture hash is a Halt
    expect(GC.upgraded.height).toBe(A.block)
    expect(GC.upgraded.claim).toMatch(/real rug's real chain state|pre-collapse/i)
    expect(GC.gap).toBeNull()
  } else {
    expect(GC.status).toBe("GAP") // no capture → the claim HELD, the gap recorded, nothing simulated
    expect(GC.upgraded).toBeNull()
  }
  // the does-NOT-claim ceiling rides with it in every case
  expect(GC.doesNotClaim).toMatch(/upgrade-key surface/i)
  expect(GC.doesNotClaim).toMatch(/NOT predict depegs|not a prediction/i)
})

test("S63 (not simulated) — the mechanism is the real, documented PAID exploit (a compromised deployer key drove the upgrade), never a fabricated state", () => {
  expect(A.rug ?? A.status).toBeTruthy()
  if (A.status === "CAPTURED") {
    expect(A.rug).toMatch(/compromised deployer key|upgrade function|59,?471,?745 PAID/i)
    // the owner-hop EOA is a REAL captured address (not a placeholder / not a synthetic 0x111…111)
    expect(A.reads.ownerAddr).toMatch(/^0x[0-9a-f]{40}$/i)
    expect(A.reads.ownerAddr).not.toMatch(/^0x(0+|1+|2+|deadbeef)/i)
  }
})
