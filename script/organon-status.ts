/**
 * ORGΛNON — the RUNNER's status computation (Explanation Phase 4; X-RUN). Checks the prerequisites, runs the pinned
 * verify set (or --full), computes the LAUNCH-WEB gate, and renders the status table. Prints a machine-readable final
 * line (ORGANON_LAUNCH_ENABLED=<0|1>) the shell parses to gate the menu. Env controls drive the honest FAILURE transcripts
 * without breaking the real environment: ORGANON_FORCE_MISSING=<name> (a masked prerequisite), ORGANON_FORCE_REDWALL=1
 * (a deliberately red verify item). Deterministic in its logic; the verify results reflect the real battery.
 * Run: bun run script/organon-status.ts [--prereq | --full]
 */
import { Launcher } from "../src/studio/launcher"

const args = process.argv.slice(2)
const prereqOnly = args.includes("--prereq")
const full = args.includes("--full")
const forceMissing = process.env.ORGANON_FORCE_MISSING || ""
const forceRed = process.env.ORGANON_FORCE_REDWALL === "1"

// (1) the prerequisite check — never installs; a masked item (transcript control) reports MISSING honestly.
const present = (name: string): boolean => (forceMissing === name ? false : Bun.which(name) !== null)
const prereq = Launcher.checkPrerequisites(present)

if (prereqOnly) {
  console.log(Launcher.statusTable(prereq, [], null)) // gate not evaluated — only the prerequisites were checked
  console.log(`ORGANON_PREREQ_OK=${prereq.ok ? 1 : 0}`)
  if (!prereq.ok) console.log(`(missing required: ${prereq.missingRequired.join(", ")} — install these system items yourself; the runner NEVER installs system packages)`)
  process.exit(prereq.ok ? 0 : 1)
}

// (2) the pinned verify set (only if prerequisites are met — else the gate is disabled on the prereq)
const verify: Launcher.VerifyResult[] = []
if (prereq.ok) {
  const items = full ? [{ id: "full", label: "the full in-scope battery (organon-studio-test.sh)", target: Launcher.FULL_VERIFY_TARGET }] : Launcher.PINNED_VERIFY_SET
  for (const it of items) {
    if (forceRed && it.id === "walls") { verify.push({ id: it.id, label: it.label, pass: false, detail: "a deliberately red wall (unmet-gate transcript control)" }); continue }
    const cmd = it.target.endsWith(".sh") ? ["bash", it.target] : ["bun", "test", "--timeout", "60000", ...it.target.split(" ")]
    const r = Bun.spawnSync(cmd, { env: { ...process.env, NO_COLOR: "1", XDG_DATA_HOME: process.env.XDG_DATA_HOME ?? "/tmp/organon-verify" }, stdout: "pipe", stderr: "pipe" })
    const out = (r.stdout?.toString() ?? "") + (r.stderr?.toString() ?? "")
    const pass = r.exitCode === 0 && /\b0 fail\b/.test(out)
    const m = out.match(/(\d+) pass[\s\S]*?(\d+) fail/)
    verify.push({ id: it.id, label: it.label, pass, detail: pass ? `green${m ? ` (${m[1]}/${m[2]})` : ""}` : `exit ${r.exitCode}${m ? ` (${m[1]} pass / ${m[2]} fail)` : ""}` })
  }
}

const gate = Launcher.launchGate(prereq, verify)
console.log(Launcher.statusTable(prereq, verify, gate))
console.log(`ORGANON_LAUNCH_ENABLED=${gate.enabled ? 1 : 0}`)
process.exit(prereq.ok ? 0 : 1)
