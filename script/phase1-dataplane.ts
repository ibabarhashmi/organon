/**
 * ORGΛNON — Data-Plane Phase 1 evidence (Rules D-SEAM, D-LABEL, A′#3, A′#5). Gathers the STORE-TRUE evidence: the leak
 * wall clean (zero leaks in src/dataplane), the provenance chain verified (≥3 lending snapshots, nonce-anchored), the
 * RWA path BLOCKED-on-credential, and the FRED-key grep-wall (no key literal anywhere in the committed tree). Run:
 *   bun run script/phase1-dataplane.ts
 */
import { spawnSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Seams } from "../src/dataplane/seams"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneCapture } from "../src/dataplane/capture"

const D = path.join(PKG_ROOT, "data", "studio")

// leak wall — zero leaks in the data-plane source (D-SEAM)
const leak = Seams.scanDataplane()

// provenance chain — verified, ≥3 lending snapshots (D-LABEL, L-TICK)
const chain = DataPlane.verifyProvenanceChain()
const lendingKeys = Object.keys(chain.keys).filter((k) => k.startsWith("lending:"))

// RWA path — BLOCKED-on-credential (A′#5)
const rwa = DataPlaneCapture.rwaSnapshotState()

// FRED-key grep-wall — assert no key literal is committed anywhere (credential hygiene; the key is an Operator env var)
// grep the tracked tree for a key-assignment literal; a match is a leaked credential (Halt)
const grep = spawnSync("git", ["grep", "-InE", "FRED[_-]?API[_-]?KEY[\"']?\\s*[:=]\\s*[\"'][0-9a-zA-Z]{16,}"], { cwd: PKG_ROOT, encoding: "utf8" })
const credentialLeak = (grep.stdout ?? "").trim() // empty = clean (git grep exits 1 with no match)

const storeTrue = leak.leaks.length === 0 && chain.ok && lendingKeys.length >= 3 && rwa.reality === "BLOCKED" && credentialLeak === ""
const out = {
  protocol: "phase1-store-true-v9",
  at: "2026-07-04",
  gate: "STORE-TRUE",
  leakWall: { dataplaneFiles: leak.files.length, leaks: leak.leaks, clean: leak.leaks.length === 0 },
  provenanceChain: { present: chain.present, verified: chain.ok, lendingKeys: lendingKeys.length, keys: chain.keys },
  gapHonest: "asOf carries the prior real observation across a missing day; no interpolation code path (proven in test/organon/dataplane_store.test.ts)",
  rwa,
  credentialGrepWall: { pattern: "FRED_API_KEY = \"<literal>\"", matchesInCommittedTree: credentialLeak === "" ? 0 : credentialLeak.split("\n").length, clean: credentialLeak === "" },
  storeTrue,
}
writeFileSync(path.join(D, "phase1-store-true-v9.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`leak wall: ${leak.files.length} dataplane files, ${leak.leaks.length} leaks`)
console.log(`provenance: chain verified=${chain.ok}, lending keys=${lendingKeys.length}`)
console.log(`RWA: ${rwa.reality}`)
console.log(`credential grep-wall: ${credentialLeak === "" ? "CLEAN (no key literal committed)" : "LEAK — " + credentialLeak}`)
console.log(`STORE-TRUE: ${storeTrue}; written data/studio/phase1-store-true-v9.json`)
process.exit(storeTrue ? 0 : 1)
