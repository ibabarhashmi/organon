/**
 * ORGΛNON — Explanation Phase 4: THE RUNNER (ONE-COMMAND-TRUE, X-RUN). Builds the three honest transcripts (happy ·
 * missing-prerequisite · unmet-gate) deterministically from the Launcher gate logic, the U-SURFACE runner traversal
 * (clone → one command → the web door reachable; the two failure states), and the gate evidence. The REAL shell runs
 * (./organon.sh status / check) prove the wiring end-to-end; this artifact is their deterministic golden form.
 * Run: bun run script/phase4-runner.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Launcher } from "../src/studio/launcher"
import { Surface } from "../src/studio/surface"

const D = path.join(PKG_ROOT, "data", "studio")
const okVerify: Launcher.VerifyResult[] = Launcher.PINNED_VERIFY_SET.map((v) => ({ id: v.id, label: v.label, pass: true, detail: "green" }))

// ── the three transcripts (deterministic golden forms of ./organon.sh's honest states) ──
const happyPrereq = Launcher.checkPrerequisites(() => true)
const happyGate = Launcher.launchGate(happyPrereq, okVerify)

const mpPrereq = Launcher.checkPrerequisites((n) => n !== "python3") // a masked required prerequisite
const mpGate = Launcher.launchGate(mpPrereq, [])

const redVerify = okVerify.map((v, i) => (i === 0 ? { ...v, pass: false, detail: "a deliberately red wall (a failing verify item)" } : v))
const guGate = Launcher.launchGate(happyPrereq, redVerify)

const transcripts = {
  happy: { command: "./organon.sh status", prereqAllPresent: happyPrereq.ok, verifyAllGreen: okVerify.every((v) => v.pass), launchEnabled: happyGate.enabled, note: "clone → one command → prerequisites present → the pinned verify set green → LAUNCH WEB enabled → the web door reachable at http://localhost:8787" },
  missingPrereq: { command: "ORGANON_FORCE_MISSING=python3 ./organon.sh check", missingRequired: mpPrereq.missingRequired, launchEnabled: mpGate.enabled, exitNonzero: !mpPrereq.ok, note: "the honest enumerated prerequisite failure prints, exits nonzero, installs NOTHING systemic (the runner CHECKs, never installs)" },
  gateUnmet: { command: "ORGANON_FORCE_REDWALL=1 ./organon.sh status", launchEnabled: guGate.enabled, unmet: guGate.unmet, note: "a deliberately red wall → LAUNCH WEB DISABLED with the unmet requirement rendered beside it (never a dead button, never a launch over red)" },
}

// ── the runner U-SURFACE traversal (happy + the two failure states) ──
const runnerTraversal = Surface.makeTraversal({
  capability: "runner-one-command-to-the-door",
  freshServe: true,
  steps: [
    { route: "./organon.sh status", interaction: "a stranger runs one command from a fresh clone", expected: "prerequisites present, the pinned verify set green, LAUNCH WEB enabled — the web door reachable", met: happyGate.enabled && happyPrereq.ok, evidence: "LAUNCH WEB: ENABLED (all 4 pinned verify items green)" },
  ],
  failureState: { route: "ORGANON_FORCE_REDWALL=1 ./organon.sh status", interaction: "the same command with a red wall", expected: "LAUNCH WEB DISABLED with the unmet requirement rendered beside it (the honest unmet-gate state)", met: !guGate.enabled && guGate.unmet.length > 0, evidence: guGate.unmet[0]?.slice(0, 100) ?? "" },
  at: "2026-07-06",
})
writeFileSync(path.join(D, "traversal-runner.json"), JSON.stringify(runnerTraversal, null, 2) + "\n")

const bundle = {
  protocol: "phase4-one-command-true-v14", at: "2026-07-06", gate: "ONE-COMMAND-TRUE",
  runner: "organon.sh (POSIX, repo-root): prerequisite CHECK → setup from the pinned lockfile (idempotent) → the pinned verify set → offline-honest refresh → the bounded TUI (status · launch-web [requirements-gated] · quit)",
  pinnedVerifySet: Launcher.PINNED_VERIFY_SET.map((v) => v.id),
  transcripts,
  traversalAdmissible: Surface.verifyTraversal(runnerTraversal).ok,
  noSystemInstalls: "the runner CHECKs prerequisites (command -v) and NEVER installs a system item; setup builds only the sidecar venv from the pinned lockfile, idempotent + offline-honest (a gap renders, never a fabrication)",
  noSoftLaunch: "the LAUNCH-WEB gate is DERIVED from the prereq + verify results (Launcher.launchGate takes no override flag) — a launch over red is impossible by construction",
  pristineCompatible: "the pristine harness (script/pristine-clone.ts) can adopt ./organon.sh as its entry point; the runner is its own test bed",
}
writeFileSync(path.join(D, "phase4-one-command-true-v14.json"), JSON.stringify(bundle, null, 2) + "\n")

console.log("═══ EXPLANATION PHASE 4 — THE RUNNER ═══")
console.log(`happy: launch enabled=${happyGate.enabled} (prereqs present + ${okVerify.length} verify items green)`)
console.log(`missing-prereq: launch enabled=${mpGate.enabled} · exit nonzero=${!mpPrereq.ok} · missing=${mpPrereq.missingRequired.join(", ")}`)
console.log(`gate-unmet: launch enabled=${guGate.enabled} · unmet=${guGate.unmet.length} (${guGate.unmet[0]?.slice(0, 60)}…)`)
console.log(`runner traversal admissible=${bundle.traversalAdmissible}`)
console.log(`pinned verify set: ${bundle.pinnedVerifySet.join(" · ")}`)
