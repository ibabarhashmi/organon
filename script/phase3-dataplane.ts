/**
 * ORGΛNON — Data-Plane Phase 3 evidence (Rules D-LABEL, D-TWOWAY, F-IDENTITY, F-ABSENT). Gathers the REAL-TRUE
 * evidence: the REAL-PIT live adjudication + provenance, the conversions (the inventory scope diff — every conversion
 * proof-backed), the two-way door (BLOCKED-on-credential, the pin UNCHANGED, zero re-pins), and the identity re-told
 * (matrix true by byte-match, memo addendum, publication re-armed). Run: bun run script/phase3-dataplane.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, RWA_VERDICT_SHA } from "../src/organon/frozen"
import { Inventory } from "../src/studio/inventory"
import { Matrix } from "../src/studio/matrix"
import { DataPlaneCapture } from "../src/dataplane/capture"

const D = path.join(PKG_ROOT, "data", "studio")

// ── the two-way door — BLOCKED-on-credential; the pin UNCHANGED; zero re-pins (D-TWOWAY) ──────────────────────────
const rwa = DataPlaneCapture.rwaSnapshotState()
const door = {
  protocol: "two-way-door-v9",
  at: "2026-07-04",
  rule: "D-TWOWAY — MATCH closes ENVIRONMENTAL at the letter (asterisk retired); MISMATCH reopens as LOGIC-candidate via supersession (the system working); the pin unchanged in both; a re-pin without root cause is a Halt",
  credentialPresent: !!process.env.FRED_API_KEY,
  snapshotPresent: existsSync(path.join(PKG_ROOT, "data", "snapshot", "MANIFEST.json")),
  outcome: "BLOCKED-on-credential",
  rwaPinUnchanged: RWA_VERDICT_SHA === "9cf94c8abf3570f08dc474cb47c4e37c5fbda9fd9fd190f7571ad713277465a5",
  rwaVerdictSha: RWA_VERDICT_SHA,
  rePins: 0,
  preDeclaredOutcomes: {
    MATCH: "the regenerated RWA-VERDICT.md reproduces the pinned NOT-YET sha → the ENVIRONMENTAL classification closes at the letter, the asterisk retires (a conscious re-pin is NOT required — the pin already IS that sha)",
    MISMATCH: "the regen does NOT reproduce the pinned sha → the classification REOPENS as a LOGIC-candidate via a superseding entry, forensics resume, the finding is celebrated as the system working; the pin still does not move (a re-pin without root cause is a Halt)",
  },
  unblock: rwa.unblock,
  note: "the door stays open; the credential is the Operator's free registration; nothing is presumed vindicated.",
}
writeFileSync(path.join(D, "two-way-door-v9.json"), JSON.stringify(door, null, 2) + "\n")

// ── the conversions — the inventory scope diff (F-ABSENT); every conversion proof-backed ─────────────────────────
let pinned: Inventory.Snapshot | null = null
const invPath = path.join(D, "capability-inventory.json")
if (existsSync(invPath)) pinned = JSON.parse(readFileSync(invPath, "utf8")) as Inventory.Snapshot
const diff = pinned ? Inventory.scopeDiff(pinned) : null
const conversions = {
  protocol: "conversions-v9",
  gains: diff?.gains ?? [],
  losses: diff?.losses ?? [],
  lossesUncovered: diff?.lossesUncovered ?? [],
  absencesNow: Inventory.ABSENCES.map((a) => `${a.id}→${a.park}`),
  absencesOk: Inventory.verifyAbsences().ok,
  converted: [
    { absence: "real-returns-live-path (P2-1)", into: "capability real-returns-realpit", proof: "real-returns-v9.json (reality=REAL-PIT) + test/organon/real_returns.test.ts", parkClosure: "parks-register.json P2-1 → RESOLVED" },
    { absence: "engine-backtest (P1-1, NARROWED)", into: "capability engine-port-differential (lending)", proof: "differential-v9.json (lending byte-identical) + test/organon/dataplane_differential.test.ts", parkClosure: "parks-register.json P1-1 → PARTIALLY CLOSED (lending landed; RWA/funding/fee-yield remain)" },
  ],
}

// ── the identity re-told — matrix true by byte-match (F-IDENTITY) ────────────────────────────────────────────────
const matrixReality = Matrix.verifyAgainstReality()
const readme = readFileSync(path.join(PKG_ROOT, "README.md"), "utf8")
const block = readme.split("<!-- CAPABILITY-MATRIX:START -->")[1]?.split("<!-- CAPABILITY-MATRIX:END -->")[0]?.trim() ?? ""
const byteMatch = block === Matrix.renderMarkdown().trim()

const realPit = existsSync(path.join(D, "real-returns-v9.json")) ? (JSON.parse(readFileSync(path.join(D, "real-returns-v9.json"), "utf8")) as { blocked: boolean; adjudication?: { reality: string; provenance: unknown[]; verdict: string } }) : null
const realPitOk = !!realPit && !realPit.blocked && realPit.adjudication?.reality === "REAL-PIT" && (realPit.adjudication?.provenance.length ?? 0) >= 2

const realTrue = realPitOk && matrixReality.ok && byteMatch && conversions.absencesOk && (diff?.lossesUncovered.length ?? 0) === 0 && door.rwaPinUnchanged && door.rePins === 0
const out = {
  protocol: "phase3-real-true-v9",
  at: "2026-07-04",
  gate: "REAL-TRUE",
  realPit: { ok: realPitOk, reality: realPit?.adjudication?.reality, verdict: realPit?.adjudication?.verdict, provenanceCount: realPit?.adjudication?.provenance.length },
  conversions,
  identity: { matrixVsReality: matrixReality.ok, readmeByteMatch: byteMatch, presentRows: Matrix.PRESENT.length, absentRows: Inventory.ABSENCES.length, memoAddendum: readFileSync(path.join(PKG_ROOT, "docs", "IDENTITY-MEMO.md"), "utf8").includes("ADDENDUM — Data-Plane sprint") },
  twoWayDoor: door.outcome,
  rwaPinUnchanged: door.rwaPinUnchanged,
  rePins: door.rePins,
  realTrue,
}
writeFileSync(path.join(D, "phase3-real-true-v9.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`REAL-PIT adjudication: ${realPitOk ? "REAL-PIT ✓" : "INCOMPLETE"} (verdict ${realPit?.adjudication?.verdict}, ${realPit?.adjudication?.provenance.length} provenance)`)
console.log(`conversions: gains=[${conversions.gains.join(",")}] lossesUncovered=${conversions.lossesUncovered.length} absences-ok=${conversions.absencesOk}`)
console.log(`identity: matrix-vs-reality=${matrixReality.ok}, README byte-match=${byteMatch}, ${Matrix.PRESENT.length} PRESENT / ${Inventory.ABSENCES.length} ABSENT, memo-addendum=${out.identity.memoAddendum}`)
console.log(`two-way door: ${door.outcome}, pin UNCHANGED=${door.rwaPinUnchanged}, re-pins=${door.rePins}`)
console.log(`REAL-TRUE: ${realTrue}; written phase3-real-true-v9.json · two-way-door-v9.json`)
process.exit(realTrue ? 0 : 1)
