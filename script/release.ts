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
import { Socket } from "../src/socket/server"

const dist = path.join(PKG_ROOT, "dist")
const outfile = path.join(dist, "organon")
const sha256File = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex")

const noBuild = process.argv.includes("--no-build") // manifest-only refresh (keeps the last build's sha)

// SUBSTANCE V38 (S127) — VERIFY reproducibility instead of asserting UNVERIFIED. Build the SAME code TWICE to the canonical
// (fixed) outfile and compare SHA-256. Empirically byte-identical: the only variation `bun build --compile` carries is the
// EMBEDDED --outfile PATH (a build INPUT), so with the canonical fixed name (dist/organon) the binary is reproducible. V35/V37
// said "UNVERIFIED" and moved on; this verifies it, or — if a future toolchain breaks it — NAMES the non-reproducibility.
let built: Release.Manifest["built"]
let reproducible: { verified: boolean; sha1: string; sha2: string; note: string } | null = null
if (!noBuild) {
  mkdirSync(dist, { recursive: true })
  console.log("○ release: bun build --compile script/organon-cli.ts → dist/organon (TWICE, to verify reproducibility, S127)…")
  const build = () => {
    const r = Bun.spawnSync(["bun", "build", "--compile", "script/organon-cli.ts", "--outfile", outfile], { cwd: PKG_ROOT, stdout: "pipe", stderr: "pipe" })
    if (r.exitCode !== 0) { console.error("✗ release: the compile failed —", r.stderr.toString().trim().split("\n").pop()); process.exit(1) }
    return sha256File(outfile)
  }
  const sha1 = build()
  const sha2 = build() // same canonical outfile → byte-identical when reproducible
  const verified = sha1 === sha2
  reproducible = {
    verified,
    sha1, sha2,
    note: verified
      ? "VERIFIED byte-reproducible: two builds to the canonical dist/organon produced identical SHA-256. The only variation bun build --compile carries is the embedded --outfile path (a build input), held constant here — so V35/V37's 'UNVERIFIED' is resolved (S127)."
      : "NON-REPRODUCIBLE and NAMED (not a silent UNVERIFIED): two builds to the SAME canonical outfile produced DIFFERENT SHA-256 — the toolchain carries nondeterminism beyond the outfile path. Investigate before distribution (S127).",
  }
  built = { ran: true, binaryPath: "dist/organon", sha256: sha2, sizeBytes: statSync(outfile).size, note: "bun build --compile of script/organon-cli.ts — the SAME code, keyless, offline on first run, console behind --studio (V34-sealed)" }
} else {
  const prev = Release.manifest()
  built = prev?.built ?? { ran: false, binaryPath: "dist/organon", sha256: null, sizeBytes: null, note: "not yet built" }
  reproducible = (prev as { reproducible?: typeof reproducible })?.reproducible ?? null
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
  reproducible, // SUBSTANCE V38 (S127) — the verified (or NAMED) reproducibility result: two builds, two shas, a verdict
  reproducibilityUnverified: reproducible ? !reproducible.verified : true, // no longer a blanket true — computed from the two-build check
  protocolRange: { supported: [...Socket.SUPPORTED_VERSIONS], current: Socket.PROTOCOL_VERSION, verified: Socket.PROTOCOL_VERSIONS_VERIFIED }, // S120 — the negotiated MCP range travels with the release
  at: "2026-07-14",
  rule: "S105 / DD-21 + SUBSTANCE V38 (S127) — the release is one command; the D50 checkboxes COMPUTE (E-3). The binary is BUILT (organon.sh release) but dist/ is gitignored, so it is NOT a committed/published artifact — D50(i)/(iii) compute RED. Reproducibility is now VERIFIED by a two-build SHA-256 comparison (or NAMED if it ever breaks), not a blanket UNVERIFIED. The negotiated protocol range travels with the manifest (S120). Distribution is not capability (X-REACH(f)); the checkbox stays red until a human pushes.",
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
