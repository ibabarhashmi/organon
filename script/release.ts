/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 5 (DD-21): `organon.sh release` — the release in ONE COMMAND.
 *
 * bun build --compile the SAME code into a single-file binary → compute its SHA-256 → write a committed manifest with a
 * documented one-line install → print the COMPUTED (red) D50 checkboxes. The binary lands in dist/ (gitignored): it is
 * BUILT, not committed — distribution is not capability (X-REACH(f), D49). The checkbox stays red until a human publishes.
 *
 * Run: bun run script/release.ts   (or ./organon.sh release)
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Release } from "../src/organon/release"

const dist = path.join(PKG_ROOT, "dist")
const outfile = path.join(dist, "organon")

const noBuild = process.argv.includes("--no-build") // manifest-only refresh (keeps the last build's sha)

let built: Release.Manifest["built"]
if (!noBuild) {
  mkdirSync(dist, { recursive: true })
  console.log("○ release: bun build --compile script/organon-cli.ts → dist/organon (the same code, a single keyless binary)…")
  const r = Bun.spawnSync(["bun", "build", "--compile", "script/organon-cli.ts", "--outfile", outfile], { cwd: PKG_ROOT, stdout: "pipe", stderr: "pipe" })
  if (r.exitCode !== 0) {
    console.error("✗ release: the compile failed —", r.stderr.toString().trim().split("\n").pop())
    process.exit(1)
  }
  const bytes = readFileSync(outfile)
  built = { ran: true, binaryPath: "dist/organon", sha256: createHash("sha256").update(bytes).digest("hex"), sizeBytes: statSync(outfile).size, note: "bun build --compile of script/organon-cli.ts — the SAME code, keyless, offline on first run, console behind --studio (V34-sealed)" }
} else {
  const prev = Release.manifest()
  built = prev?.built ?? { ran: false, binaryPath: "dist/organon", sha256: null, sizeBytes: null, note: "not yet built" }
}

const manifest: Release.Manifest = {
  protocol: "release-manifest",
  built,
  committedArtifactPath: null, // dist/ is gitignored — the binary is BUILT, not committed (distribution is not capability)
  installLine: "clone + Bun ≥ 1.3 + ./organon.sh — or, once published, download the checksummed single-file binary + `chmod +x organon && ./organon`",
  reproducibilityUnverified: true,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "release-manifest.json"), JSON.stringify({
  ...manifest,
  at: "2026-07-14",
  rule: "S105 / DD-21 — the release is one command; the D50 checkboxes COMPUTE (E-3). The binary is BUILT (organon.sh release) but dist/ is gitignored, so it is NOT a committed/published artifact — D50(i) computes RED. The reproducibility of bun build --compile is UNVERIFIED (attack #8). Distribution is not capability (X-REACH(f)); the checkbox stays red until a human pushes.",
}, null, 2) + "\n")

const d = Release.d50()
console.log("── DERIVE — the release (S105) ─────────────────────────────")
console.log(`  built      : ${built.ran ? `${built.sizeBytes} bytes · sha256 ${built.sha256?.slice(0, 16)}…` : "not built (--no-build)"}`)
console.log(`  artifact   : ${Release.artifact() === "ABSENT" ? "ABSENT (dist/ gitignored — built, not committed)" : "committed"}`)
console.log(`  install    : ${manifest.installLine}`)
console.log("  D50 (computed — RED until a human publishes):")
console.log(`    (i)   binary committed : ${d.i_binaryCommitted.value}   — ${d.i_binaryCommitted.detail.slice(0, 80)}`)
console.log(`    (ii)  install docs     : ${d.ii_installDocumented.value}`)
console.log(`    (iii) published        : ${d.iii_published.value}`)
console.log(`    (iv)  window elapsed   : ${d.iv_windowElapsed.value}`)
console.log(`    canFire (all four)     : ${d.canFire}  ← the door is built, and still locked from outside`)
console.log("  manifest written: data/honesty/release-manifest.json")
