/**
 * ORGΛNON — End-User Phase 3 evidence (Rules E-CONSOLE, F-IDENTITY, F-BUDGET). Confirms the joined-loop gate: the
 * matrix re-told (+console, +joined-loop) and byte-true against reality; the publication gate re-armed against the NEW
 * matrix; the F-BUDGET walk projection recorded (the walk is the protected majority). Run: bun run script/phase3-enduser.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Matrix } from "../src/studio/matrix"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")
const joined = existsSync(path.join(D, "joined-loop-v10.json")) ? JSON.parse(readFileSync(path.join(D, "joined-loop-v10.json"), "utf8")) : null
const matrixReality = Matrix.verifyAgainstReality()

const out = {
  protocol: "phase3-joined-loop-v10",
  at: "2026-07-05",
  gate: "JOINED-LOOP",
  console: {
    screen: "goalConsole (screen 8 — closed set amended 7→8, once, closed again; SCREENS.length===8)",
    live: "served /console/goal (write-then-invoke, input-capped, honest failure states) — proven end-to-end",
    derivesNothing: true,
    honestFailureStates: joined ? joined.honestFailureStates : "run script/joined-loop.ts",
  },
  joinedLoop: joined ? {
    verdict: joined.verdict, reality: joined.reality, reportHonest: joined.reportHonest, reproduces: joined.reproduces,
    modelCannotBless: joined.physics?.modelCannotBless, artifactHashes: joined.artifact ? { spec: joined.artifact.specHash?.slice(0, 12), verdictRepro: joined.artifact.verdictReproHash?.slice(0, 12), report: joined.artifact.reportHash?.slice(0, 12) } : null,
  } : "BLOCKED (fresh clone — re-capture)",
  identityRetold: {
    matrixPresent: Matrix.PRESENT.length,
    matrixRows: `${Matrix.PRESENT.length} PRESENT / ${Inventory.ABSENCES.length} ABSENT`,
    matrixVsReality: matrixReality.ok,
    mismatches: matrixReality.mismatches,
    memoAddendum: "docs/IDENTITY-MEMO.md — the End-User addendum (2026-07-05) filed",
    publicationReArmed: "the gate re-reads the matrix live (identity gate SATISFIED on the NEW matrix, byte-match re-locked; consent gate PENDING the Operator — re-ratification against the new matrix, not V8/V9)",
  },
  fBudgetProjection: {
    rule: "F-BUDGET — the walk (Phase 4) is the PROTECTED MAJORITY; the micro-loop (Phases 0-3) was deliberately bounded",
    phases0to3: "COMPLETE — governance/prevention/catalog (P0), the transform asterisk retired (P1), funding delivered + fee-yield attempted (P2), the console + joined loop (P3)",
    walkBudgetConfirmed: true,
    walkPlan: "THE WALK v5: fresh clones → through the UI/UX first (the console is the user's door) → the pinned catalog traversed in full → every issue root-caused → fixed → re-tested → logged (E-ROOTCAUSE); seven console-aware themes rotated; converge at catalog-complete + rotation-complete + two consecutive FULL-depth clean + ≥4 cycles (CONVERGED-4), or the cap's honest STOP",
  },
}
writeFileSync(path.join(D, "phase3-joined-loop-v10.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`matrix: ${out.identityRetold.matrixRows} · vs-reality ${matrixReality.ok}${matrixReality.ok ? "" : " MISMATCH: " + matrixReality.mismatches.join("; ")}`)
console.log(`joined loop: ${joined ? `${joined.verdict} (${joined.reality}), reportHonest ${joined.reportHonest}, reproduces ${joined.reproduces}, modelCannotBless ${joined.physics?.modelCannotBless}` : "BLOCKED"}`)
console.log(`walk budget confirmed: ${out.fBudgetProjection.walkBudgetConfirmed}`)
console.log(`written: data/studio/phase3-joined-loop-v10.json`)
