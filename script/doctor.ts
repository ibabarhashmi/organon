/**
 * ORGΛNON — DOCTOR (Alpha Phase 4; X-STRANGER). The standing diagnostic: everything a bug report needs, in one
 * copy-pasteable block — versions · prerequisites · the sidecar venv · node_modules · ports · .env key SHAPE (names
 * and lengths, NEVER values) · pins integrity (the verdict-path hash set vs the tree) · data dirs. One check per
 * function, each printing pass/fail + why (PART CLEAN). Output passes the scrubber — a key literal cannot print.
 * Run: bun run script/doctor.ts   (or ./organon.sh doctor)
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Scrub } from "../src/util/scrub"

interface Check { name: string; ok: boolean | "warn"; detail: string }
const checks: Check[] = []
const add = (name: string, ok: boolean | "warn", detail: string) => checks.push({ name, ok, detail })
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

function checkBun(): void {
  const v = Bun.version
  const [maj, min] = v.split(".").map(Number)
  add("bun", maj > 1 || (maj === 1 && min >= 3), `${v} (need >= 1.3)`)
}
function checkPython(): void {
  const w = Bun.which("python3")
  if (!w) return add("python3", false, "not on PATH — the sidecar (Stamp) needs it; the core TS tool runs without it")
  const r = Bun.spawnSync(["python3", "--version"])
  add("python3", true, `${r.stdout.toString().trim() || r.stderr.toString().trim()} at ${w}`)
}
function checkVenv(): void {
  const py = path.join(PKG_ROOT, "src", "backtest", "py", ".venv", "bin", "python")
  if (!existsSync(py)) return add("sidecar venv", false, "absent — run ./organon.sh setup (Stamp verbs will state BLOCKED until then)")
  const r = Bun.spawnSync([py, "-c", "import numpy, scipy; print(numpy.__version__, scipy.__version__)"])
  const out = r.stdout.toString().trim()
  add("sidecar venv", r.exitCode === 0, r.exitCode === 0 ? `numpy/scipy ${out}` : `present but broken: ${r.stderr.toString().trim().split("\n").pop()}`)
}
function checkNodeModules(): void {
  add("node_modules", existsSync(path.join(PKG_ROOT, "node_modules", "hono")), existsSync(path.join(PKG_ROOT, "node_modules", "hono")) ? "hono + zod installed" : "absent — run ./organon.sh setup (or bun install)")
}
function checkPort(port: number, name: string): void {
  try {
    const srv = Bun.listen({ hostname: "127.0.0.1", port, socket: { data() {} } })
    srv.stop(true)
    add(`port ${port}`, true, `free (${name})`)
  } catch {
    add(`port ${port}`, "warn", `in use — ${name} may already be running, or another app holds it (set PORT to move)`)
  }
}
function checkEnv(): void {
  const envPath = path.join(PKG_ROOT, ".env")
  if (!existsSync(envPath)) return add(".env", "warn", "absent — keyless mode (fully functional, deterministic); run ./organon-setup.sh to add AI keys")
  const mode = (statSync(envPath).mode & 0o777).toString(8)
  add(".env perms", mode === "600", `mode ${mode}${mode === "600" ? "" : " — run: chmod 600 .env (keys should not be world-readable)"}`)
  const KNOWN = ["GROQ_API_KEY", "GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_COMPATIBLE_API_KEY", "DEFILLAMA_PRO_API_KEY", "STUDIO_TOKEN"]
  const set = KNOWN.filter((k) => (process.env[k] ?? "").length > 0)
  // SHAPE only — names + lengths; a value never prints (S49)
  add(".env keys", true, set.length ? set.map((k) => `${k}(len ${process.env[k]!.length})`).join(" · ") : "no keys set — keyless mode (honest, deterministic)")
}
function checkPins(): void {
  const p = path.join(PKG_ROOT, "data", "honesty", "alpha-pins.json")
  if (!existsSync(p)) return add("pins", false, "alpha-pins.json missing — the clone is incomplete")
  const pins = JSON.parse(readFileSync(p, "utf8"))
  const bad: string[] = []
  for (const [rel, want] of Object.entries(pins.verdictPathHashes as Record<string, string>)) {
    if (sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8")) !== want) bad.push(rel)
  }
  add("pins integrity", bad.length === 0, bad.length ? `VERDICT-PATH DRIFT: ${bad.join(", ")} — do not trust verdicts until reconciled` : `verdict-path hash set intact (7 modules) · PINS_SHA ${String(pins.pinsSha).slice(0, 8)}…`)
}
function checkDataDirs(): void {
  const need = ["data/honesty", "data/studio"]
  const missing = need.filter((d) => !existsSync(path.join(PKG_ROOT, d)))
  add("data dirs", missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "committed data dirs present (data/dataplane/snapshots grows with captures — absent on a fresh clone is honest)")
}
function version(): string {
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  const git = Bun.spawnSync(["git", "-C", PKG_ROOT, "rev-parse", "--short", "HEAD"])
  const sha = git.exitCode === 0 ? git.stdout.toString().trim() : "no-git"
  const pins = existsSync(path.join(PKG_ROOT, "data", "honesty", "alpha-pins.json"))
    ? String(JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "alpha-pins.json"), "utf8")).pinsSha).slice(0, 12)
    : "no-pins"
  return `organon ${pkg.version} · git ${sha} · pins ${pins}…`
}

export function report(): { text: string; failures: number } {
  checks.length = 0
  checkBun(); checkPython(); checkVenv(); checkNodeModules()
  checkPort(4444, "the Reality Check"); checkPort(4319, "the Studio")
  checkEnv(); checkPins(); checkDataDirs()
  const failures = checks.filter((c) => c.ok === false).length
  const lines = [
    "──── ORGΛNON doctor · copy-paste this whole block into a bug report ────",
    `  ${version()} · ${process.platform}/${process.arch}`,
    ...checks.map((c) => `  ${c.ok === true ? "✓" : c.ok === "warn" ? "○" : "✗"} ${c.name}: ${c.detail}`),
    failures ? `  → ${failures} failing item${failures === 1 ? "" : "s"} — each line above says the exact cure.` : "  → all clear.",
    "─────────────────────────────────────────────────────────────────────",
  ]
  return { text: Scrub.redact(lines.join("\n")), failures } // the WHOLE block is scrubbed — a key literal cannot print
}

if (import.meta.main) {
  if (process.argv.includes("--version")) { console.log(Scrub.redact(version())); process.exit(0) }
  const r = report()
  console.log(r.text)
  process.exit(r.failures ? 1 : 0)
}
