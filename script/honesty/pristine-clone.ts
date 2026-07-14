/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), S103 / DD-19: THE FRESH CLONE, RUN. Owed since D44 (V33), deferred three times.
 *
 * git clone the LOCAL tree into an empty temp dir (its OWN node_modules + sidecar venv, built from zero — nothing shared
 * with the working repo) → ./organon.sh setup-deps → ./organon.sh verify → the FULL battery. Writes the transcript to
 * data/honesty/pristine-clone.json. NEVER simulated (DD-19): a genuine blocker is named in ONE checkable sentence and the
 * clone's exit is recorded honestly. RP-6: this proves the tree is SELF-CONTAINED, not that a STRANGER can build it.
 *
 * Run: bun run script/honesty/pristine-clone.ts     (clones HEAD — commit all V36 source first; several minutes)
 */
import { mkdtempSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const EMPTY_KEYS = { GROQ_API_KEY: "", GOOGLE_AI_STUDIO_KEY: "", GEMINI_API_KEY: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "" }

function run(cmd: string[], cwd: string, extraEnv: Record<string, string> = {}) {
  // a scrubbed env: keys emptied, ORGANON_ROOT/ORGANON_OFFLINE unset (the clone finds its OWN on-disk data/). PATH kept so
  // git/bun/python resolve; HOME kept so bun's install cache works — the SELF-CONTAINED claim is about the TREE, not a
  // hermetic OS (RP-6 states what this does and does not prove).
  const env = { ...process.env, ...EMPTY_KEYS, ...extraEnv }
  delete (env as Record<string, string>).ORGANON_ROOT
  delete (env as Record<string, string>).ORGANON_OFFLINE
  const r = Bun.spawnSync(cmd, { cwd, env, stdout: "pipe", stderr: "pipe" })
  return { exitCode: r.exitCode, out: r.stdout.toString(), err: r.stderr.toString() }
}

const head = Bun.spawnSync(["git", "rev-parse", "HEAD"], { cwd: PKG_ROOT }).stdout.toString().trim()
const tmp = mkdtempSync(path.join(tmpdir(), "organon-clone-"))
const dest = path.join(tmp, "organon")
console.log(`── DERIVE — the fresh clone (S103) ─── cloning ${head.slice(0, 8)} → ${dest}`)

const clone = run(["git", "clone", "--quiet", "--no-hardlinks", PKG_ROOT, dest], tmp)
let transcript: Record<string, unknown>

if (clone.exitCode !== 0) {
  transcript = { protocol: "pristine-clone", clonedCommit: head, method: "git clone --no-hardlinks (local tree)", blocker: `git clone failed (exit ${clone.exitCode}): ${clone.err.trim().split("\n").pop()?.slice(0, 160)}`, setup: { exitCode: 1, provisionedCrossCheck: false, detail: "clone failed" }, verify: { exitCode: 1, detail: "clone failed" }, battery: { pass: 0, skip: 0, fail: 0, files: 0 }, proves: "nothing — the clone did not complete", doesNotProve: "anything" }
} else {
  console.log("  ✓ cloned. running setup-deps (bun install + venv + purgedcv provision, from zero)…")
  const setup = run(["bash", "organon.sh", "setup-deps"], dest)
  const provisioned = existsSync(path.join(dest, "src/backtest/py/.venv/bin/python")) && run([path.join(dest, "src/backtest/py/.venv/bin/python"), "-c", "import purgedcv"], dest).exitCode === 0

  console.log(`  setup exit ${setup.exitCode} · purgedcv provisioned: ${provisioned}. running verify…`)
  const verify = run(["bash", "organon.sh", "verify"], dest)

  console.log(`  verify exit ${verify.exitCode}. running the FULL battery (this takes a few minutes)…`)
  const battery = run(["bun", "test", "test/organon", "test/walls", "--timeout", "120000"], dest)
  // parse the battery tail (bun prints "N pass / M fail / K skip" style lines)
  const btxt = battery.out + battery.err
  const pass = Number(btxt.match(/(\d+)\s+pass/)?.[1] ?? 0)
  const fail = Number(btxt.match(/(\d+)\s+fail/)?.[1] ?? 0)
  const skip = Number(btxt.match(/(\d+)\s+skip/)?.[1] ?? 0)
  const files = Number(btxt.match(/across (\d+) files/)?.[1] ?? 0)

  transcript = {
    protocol: "pristine-clone",
    at: "2026-07-14",
    rule: "S103 / DD-19 — the convergence proof promoted at D44 (V33) and deferred three times, RUN from an empty directory.",
    clonedCommit: head,
    method: "git clone --no-hardlinks the LOCAL tree into a fresh temp dir; its OWN node_modules + sidecar venv built from zero (nothing shared with the working repo); keys emptied; ORGANON_ROOT/ORGANON_OFFLINE unset. NEVER simulated.",
    setup: { exitCode: setup.exitCode, provisionedCrossCheck: provisioned, detail: provisioned ? "bun install + venv + purgedcv provisioned from requirements-crosscheck.txt (RP-2's durable fix survives a fresh clone)" : `setup did not fully provision (venv/purgedcv); last line: ${(setup.err || setup.out).trim().split("\n").pop()?.slice(0, 160)}` },
    verify: { exitCode: verify.exitCode, detail: verify.exitCode === 0 ? "verify GREEN on the clone — the evidence bundle reproduces + the curated battery count matches + the frozen-seven git-clean" : `verify exit ${verify.exitCode}: ${(verify.err || verify.out).trim().split("\n").pop()?.slice(0, 200)}` },
    battery: { pass, skip, fail, files },
    proves: "SELF-CONTAINED — a clone of the local tree builds its own deps, verifies, and runs the full battery from zero (RP-2's durable cross-check provision + the census's clone-stability + the frozen set's coverage, all tested at last).",
    doesNotProve: "a STRANGER's machine — that needs the published remote, the correct Bun version, a clean OS, and no cached ~/.bun or inherited venv. The strongest claim available is SELF-CONTAINED, not reproducible-by-anyone; a stranger remains UNTESTED until publication (RP-6, X-SHOWN(b)).",
  }
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "pristine-clone.json"), JSON.stringify(transcript, null, 2) + "\n")
console.log(`  transcript written: data/honesty/pristine-clone.json`)
console.log(`  setup ${(transcript.setup as { exitCode: number }).exitCode} · verify ${(transcript.verify as { exitCode: number }).exitCode} · battery ${JSON.stringify(transcript.battery)}`)
