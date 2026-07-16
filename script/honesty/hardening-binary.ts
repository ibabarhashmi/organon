/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 5: BINARY PARITY, PROVEN (S206, P-15/RP-4).
 *
 * Builds the single-file binary (bun build --compile script/organon-cli.ts), runs its first-run, runs the SOURCE first-run
 * under bun, and asserts the two HTML outputs are BYTE-EQUAL after the PINNED normalization (Binary.normalize — timestamps +
 * path prefixes, nothing else). Then a SEEDED real divergence (a mutated verdict word) must STILL be caught through the
 * normalization — proving the comparison can fail (X-REACH(a)). dist/ is gitignored; this transcript is the record.
 *
 * Run: bun run script/honesty/hardening-binary.ts
 */
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Binary } from "../../src/organon/binary"

const OUT_HTML = path.join(tmpdir(), "organon-reality-check.html")
const dist = path.join(PKG_ROOT, "dist")
if (!existsSync(dist)) mkdirSync(dist, { recursive: true })
const bin = path.join(dist, "organon")

console.log("── HARDENING BINARY PARITY (Phase 5, S206) — the binary IS the source, byte-for-byte ──")

// 1) BUILD the single-file binary
console.log("  building the single-file binary (bun build --compile)…")
const build = Bun.spawnSync(["bun", "build", "--compile", path.join(PKG_ROOT, "script", "organon-cli.ts"), "--outfile", bin], { cwd: PKG_ROOT, stdout: "pipe", stderr: "pipe" })
const built = build.exitCode === 0 && existsSync(bin)
if (!built) { console.error("  BUILD FAILED:", new TextDecoder().decode(build.stderr).slice(0, 400)); process.exit(1) }

// 2) run the SOURCE first-run under bun → capture its HTML
if (existsSync(OUT_HTML)) rmSync(OUT_HTML)
Bun.spawnSync(["bun", "run", path.join(PKG_ROOT, "script", "organon-cli.ts")], { cwd: PKG_ROOT, stdout: "pipe", stderr: "pipe" })
const sourceHtml = existsSync(OUT_HTML) ? readFileSync(OUT_HTML, "utf8") : ""

// 3) run the BINARY first-run → capture its HTML
if (existsSync(OUT_HTML)) rmSync(OUT_HTML)
Bun.spawnSync([bin], { cwd: PKG_ROOT, stdout: "pipe", stderr: "pipe" })
const binaryHtml = existsSync(OUT_HTML) ? readFileSync(OUT_HTML, "utf8") : ""

// 4) NORMALIZE both (the pinned normalization) and compare byte-equal
const sNorm = Binary.normalize(sourceHtml)
const bNorm = Binary.normalize(binaryHtml)
const equalAfterNorm = sNorm.length > 0 && sNorm === bNorm

// 5) SEEDED DIVERGENCE — mutate a verdict word in the source and confirm the comparison CATCHES it after normalization
const mutated = sourceHtml.replace(/UNVERIFIED/, "TOTALLY-FINE") // a real content change (not a timestamp/path)
const seededDivergenceCaught = Binary.normalize(mutated) !== bNorm

const OUT: Binary.Parity = {
  ok: equalAfterNorm && seededDivergenceCaught,
  sourceLen: sourceHtml.length,
  binaryLen: binaryHtml.length,
  equalAfterNorm,
  seededDivergenceCaught,
  note: equalAfterNorm ? "byte-equal after the pinned normalization (timestamps + path prefixes, nothing else)" : `NOT equal — source ${sNorm.length}b vs binary ${bNorm.length}b after normalization (first diff at ${firstDiff(sNorm, bNorm)})`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-binary.json"), JSON.stringify(OUT, null, 2) + "\n")
// leave dist/ (gitignored) — the transcript is the record; clean the tmp html
if (existsSync(OUT_HTML)) rmSync(OUT_HTML)

console.log(`  source ${sourceHtml.length}b · binary ${binaryHtml.length}b`)
console.log(`  byte-equal after pinned normalization: ${equalAfterNorm}`)
console.log(`  seeded divergence CAUGHT through normalization: ${seededDivergenceCaught}`)
console.log(`  parity: ${OUT.ok ? "PROVEN — the binary is the source, byte-for-byte" : "FAILED — " + OUT.note}`)
console.log("written: data/honesty/hardening-binary.json")

function firstDiff(a: string, b: string): number { const n = Math.min(a.length, b.length); for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i; return n }
