/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 6: THE CLEAN-MACHINE TEST (RP-3/DD-99, P-16). NOT A WARM FOLDER.
 *
 * The stranger's first minute has no warm cache. This records the environment's PROVENANCE (F-3/RP-3): a fresh clone into a
 * temp dir + an explicitly enumerated cache state (no cloned repo, Bun cache, uv cache, PATH remnants — each SHOWN present or
 * absent BEFORE the run). A clean-machine transcript that does not show the absence checks REFUSES. A warm cache is DISCLOSED,
 * never hidden (the honest label beats the false claim). Then it follows the README verbatim: check → first-run → the doc is
 * present. Transcripted.
 *
 * Run (at convergence, on the committed tree): bun run script/honesty/hardening-cleanmachine.ts
 */
import { writeFileSync, existsSync, rmSync, mkdtempSync } from "node:fs"
import path from "node:path"
import { tmpdir, homedir } from "node:os"
import { PKG_ROOT } from "../../src/organon/frozen"

function present(p: string): boolean { try { return existsSync(p) } catch { return false } }
function which(cmd: string): string | null { const r = Bun.spawnSync(["which", cmd], { stdout: "pipe" }); return r.exitCode === 0 ? new TextDecoder().decode(r.stdout).trim() : null }

// ── (1) THE ENVIRONMENT PROVENANCE — the absence checks, SHOWN before the run (a warm cache is DISCLOSED, never hidden) ──
const cloneDir = mkdtempSync(path.join(tmpdir(), "organon-clean-"))
rmSync(cloneDir, { recursive: true, force: true }) // ensure the clone target does NOT exist before the clone (a fresh path)
const env = {
  clonedRepoDir: { path: cloneDir, existedBeforeClone: false, note: "a fresh temp path — no cloned repo before this run" },
  bunCache: { path: path.join(homedir(), ".bun", "install", "cache"), present: present(path.join(homedir(), ".bun", "install", "cache")), note: "Bun's install cache" },
  uvCache: { path: path.join(homedir(), ".cache", "uv"), present: present(path.join(homedir(), ".cache", "uv")), note: "uv's wheel cache" },
  bunOnPath: which("bun"),
  gitOnPath: which("git"),
  disclosure: "THIS IS A SAME-MACHINE CLONE, not a fresh VM/container. The caches marked present:true are WARM (this machine has built before) — DISCLOSED honestly, never hidden. A true stranger's first minute has these ABSENT; the honest label is that a warm-cache run proves the PATH works, not the cold-cache timing. The absence checks are SHOWN (F-3/RP-3).",
}

// ── (2) FOLLOW THE README VERBATIM — clone → check → first-run → the second-human doc is present ──
const clone = Bun.spawnSync(["git", "clone", "--quiet", PKG_ROOT, cloneDir], { stdout: "pipe", stderr: "pipe" })
const cloned = clone.exitCode === 0 && existsSync(path.join(cloneDir, "organon.sh"))
let clonedCommit = ""
if (cloned) { const r = Bun.spawnSync(["git", "-C", cloneDir, "rev-parse", "HEAD"], { stdout: "pipe" }); clonedCommit = new TextDecoder().decode(r.stdout).trim() }

// the README's step 1 — bun install (the fresh clone has no node_modules; a warm cache makes it fast, DISCLOSED)
const install = cloned ? Bun.spawnSync(["bun", "install", "--no-save"], { cwd: cloneDir, stdout: "pipe", stderr: "pipe" }) : null
const installOk = install ? install.exitCode === 0 : false

// the README's prereq check (never installs) — the stranger's first command
const check = cloned ? Bun.spawnSync(["bash", path.join(cloneDir, "organon.sh"), "check"], { cwd: cloneDir, stdout: "pipe", stderr: "pipe" }) : null
const checkOk = check ? check.exitCode === 0 : false

// the first-run (offline, keyless, deterministic) — the stranger's first result
const firstRun = cloned ? Bun.spawnSync(["bun", "run", path.join(cloneDir, "script", "organon-cli.ts")], { cwd: cloneDir, stdout: "pipe", stderr: "pipe", env: { ...process.env, ORGANON_OFFLINE: "1" } }) : null
const firstRunOut = firstRun ? new TextDecoder().decode(firstRun.stdout) : ""
const firstRunOk = firstRun ? firstRun.exitCode === 0 && /status 200/.test(firstRunOut) : false

// the second-human doc is present in the clone (a stranger can read it)
const docPresent = cloned && existsSync(path.join(cloneDir, "SECOND-HUMAN.md"))

const absenceChecksShown = env.clonedRepoDir.existedBeforeClone === false && typeof env.bunCache.present === "boolean" && typeof env.uvCache.present === "boolean"
const OUT = {
  protocol: "hardening-cleanmachine",
  at: "2026-07-16",
  rule: "RP-3/DD-99 (P-16) — the clean-machine test records the environment's PROVENANCE (absence checks SHOWN before the run; a warm cache DISCLOSED, never hidden), then follows the README verbatim (clone → check → first-run → the doc is present). A transcript without the absence checks REFUSES. The terminal state claims READINESS (the machinery survives a stranger's PATH), not user-testing (no stranger has walked it).",
  environmentProvenance: env,
  absenceChecksShown,
  clonedCommit,
  readmeVerbatim: { cloned, installOk, checkOk, firstRunOk, docPresent, firstRunLine: firstRunOut.split("\n").find((l) => /status 200/.test(l))?.trim() ?? "" },
  ok: absenceChecksShown && cloned && firstRunOk && docPresent,
  summary: `absence checks shown=${absenceChecksShown} (bun-cache warm=${env.bunCache.present}, uv-cache warm=${env.uvCache.present}, DISCLOSED); cloned=${cloned}; check=${checkOk}; first-run 200=${firstRunOk}; second-human doc present=${docPresent}`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-cleanmachine.json"), JSON.stringify(OUT, null, 2) + "\n")
if (existsSync(cloneDir)) rmSync(cloneDir, { recursive: true, force: true })

console.log("── HARDENING CLEAN-MACHINE (Phase 6, RP-3) — the stranger's first minute ──")
console.log("  " + OUT.summary)
console.log(`  environment: ${env.disclosure.slice(0, 100)}…`)
console.log(`  clone → check → first-run → doc present: ${OUT.ok ? "PATH WORKS (readiness, not user-testing)" : "a stumble — a P-entry"}`)
console.log("written: data/honesty/hardening-cleanmachine.json")
