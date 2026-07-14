/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 4 (D49): the ZERO-CONFIG FIRST RUN + the binary entrypoint.
 *
 * `organon` with NO arguments renders THE EXISTING Reality Check on THE EXISTING committed fixture lineage — offline, in
 * one command. This is not a fourth screen (X-SURFACE: a door reached by a PATH is not a screen; a binary is a path). The
 * fixture has sat committed and unreachable since V31; this opens it. It is the SAME code, compiled — distribution is not
 * capability (X-REACH(f), D49, unsigned against the Halt's letter).
 *
 * HARDENING (DD-13, walled by S96 — the binary lands on a stranger's laptop):
 *   (i)   no API key is embedded or required — the fixture path is deterministic (keys are FORCED empty here)
 *   (ii)  ZERO provider is constructed on the first-run path (RP-3: the honest, provable form of "no egress" — with
 *         ORGANON_OFFLINE=1 no provider is built, and the SBOM shows two leaf deps with zero transitive code that could egress)
 *   (iii) the STUDIO CONSOLE is DISABLED unless `--studio` is passed explicitly (it is an Operator tool and it carries the
 *         V34-sealed sinks; a stranger's machine does not get it by default)
 */
const FIXTURE_ID = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"

// (i) + (ii): force the deterministic, keyless, offline first-run posture BEFORE anything imports a provider factory.
// ORGANON_ROOT anchors PKG_ROOT to the working directory so the compiled binary finds the on-disk committed data/ (D49).
function hardenFirstRun(): void {
  for (const k of ["GROQ_API_KEY", "GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_COMPATIBLE_API_KEY"]) process.env[k] = ""
  process.env.ORGANON_OFFLINE = "1"
  if (!process.env.ORGANON_ROOT) process.env.ORGANON_ROOT = process.cwd()
}

async function firstRun(): Promise<number> {
  hardenFirstRun()
  const { app } = await import("./serve-reality.ts")
  const t0 = performance.now()
  const res = await app.fetch(new Request(`http://localhost/check/manifest:${FIXTURE_ID}`))
  const html = await res.text()
  const seconds = (performance.now() - t0) / 1000

  const { tmpdir } = await import("node:os")
  const { writeFileSync } = await import("node:fs")
  const path = await import("node:path")
  const out = path.join(tmpdir(), "organon-reality-check.html")
  writeFileSync(out, html)

  const { Reach } = await import("../src/organon/reach.ts")
  const fact = Reach.fact({ firstRunSeconds: seconds })

  console.log("ORGΛNON — the Reality Check (committed fixture, offline, deterministic)")
  console.log(`  status ${res.status} · ${html.length} bytes · rendered in ${seconds.toFixed(3)}s · no key · no network`)
  console.log(`  honest posture: values render as SAMPLE offline (never fabricated) — ${/SAMPLE/i.test(html) ? "SAMPLE present" : "no SAMPLE"}`)
  console.log(`  full Reality Check written to: ${out}`)
  console.log(`  reach: ${Reach.reachSentence(fact)}`)
  return seconds
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const wantsStudio = args.includes("--studio") || args[0] === "studio"
  if (wantsStudio) {
    // (iii) the Operator console — only ever reached by an EXPLICIT flag. It carries the sinks; a stranger does not get it.
    console.error("the studio console is an Operator tool (it carries served sinks); it is disabled by default. Run `./organon.sh launch` in a trusted environment to start it.")
    process.exit(2)
  }
  await firstRun()
}

if (import.meta.main) await main()

export { firstRun, FIXTURE_ID }
