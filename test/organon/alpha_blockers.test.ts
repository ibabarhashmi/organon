/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 2 walls (BLOCKERS-CLOSED). Every D22 BLOCKER carries its regression here:
 * AB1 the localhost-default bind (both servers) · AB2 the :4444 per-caller rate limit (bites, positive-controlled)
 * · AB3/AB4 the setup() repairs (the venv path that could never match + the missing bun-install remedy) · AB5's
 * interim honesty (the dead next-steps gone) · AB6 the bash-3.2-safe ask expansion (executed under /bin/bash, not
 * just grepped) · AB7 the continuity resolver (honest recorded absence, never a silent skip). The re-rendered
 * blocker list is EMPTY of unscheduled items or this wall fails the sprint at its own gate.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { PKG_ROOT } from "../../src/organon/frozen"
import { perCallerLimit } from "../../script/serve-reality"
import { continuityLog } from "./fixtures/continuity"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const closed = JSON.parse(read("data/honesty/alpha-blockers-closed.json"))
const audit = JSON.parse(read("data/honesty/alpha-audit.json"))

test("AB1 — both served doors default to localhost (Bun.serve's 0.0.0.0 fallback is unreachable without an explicit HOST opt-in)", async () => {
  const reality = (await import("../../script/serve-reality")).default as { hostname: string }
  const studio = (await import("../../script/serve-studio")).default as { hostname: string }
  expect(reality.hostname).toBe(process.env.HOST ?? "127.0.0.1")
  expect(studio.hostname).toBe(process.env.HOST ?? "127.0.0.1")
})

test("AB2 — the :4444 rate limit BITES: max requests pass, max+1 within the window is a 429 sentence, a new window resets (injected clock)", async () => {
  let t = 0
  const limit = perCallerLimit({ max: 3, windowMs: 60_000, now: () => t })
  const ctx = { req: { header: (n: string) => (n === "x-forwarded-for" ? "tester" : undefined) }, text: (b: string, s: number) => new Response(b, { status: s }) }
  let passed = 0
  const next = async () => { passed++ }
  for (let i = 0; i < 3; i++) { t += 1000; expect(await limit(ctx, next)).toBeUndefined() }
  expect(passed).toBe(3)
  t += 1000
  const refused = (await limit(ctx, next)) as Response
  expect(refused.status).toBe(429)
  const body = await refused.text()
  expect(body).toMatch(/rate-limited/)
  expect(body).not.toMatch(/Error|stack/i) // a sentence, never a crash
  expect(passed).toBe(3) // the refused call never reached the route
  t += 61_000 // the window slides — a patient caller is served again
  expect(await limit(ctx, next)).toBeUndefined()
  expect(passed).toBe(4)
})

test("AB2 — the two costly routes carry their tighter budgets in source (/refresh live capture · /ask possible AI spend)", () => {
  const src = read("script/serve-reality.ts")
  expect(src).toMatch(/app\.use\("\/refresh", perCallerLimit/)
  expect(src).toMatch(/app\.use\("\/ask", perCallerLimit/)
  expect(src).toMatch(/app\.use\("\*", perCallerLimit/)
})

test("AB3/AB4 — setup() checks the venv lockfile WHERE IT LIVES, surfaces the real error, and installs node_modules with the remedy stated", () => {
  const sh = read("organon.sh")
  expect(sh).toMatch(/\$py_dir\/requirements-studio\.txt/) // the sidecar path — the root-path check that could never match is gone
  expect(sh).not.toMatch(/\[ -f "requirements-studio\.txt" \]/)
  expect(sh).toMatch(/never laundered as 'offline'/) // stderr surfaced, not swallowed
  expect(sh).toMatch(/python3-venv/) // the Debian/WSL cure named
  expect(sh).toMatch(/node_modules.*absent.*bun install|bun install/) // AB4: the JS-deps step exists
  expect(sh.indexOf("bun install")).toBeLessThan(sh.indexOf("requirements-studio")) // deps land before the venv step
  // the script still parses (both fixes are live shell, not comments)
  const parse = spawnSync("/bin/bash", ["-n", path.join(PKG_ROOT, "organon.sh")])
  expect(parse.status).toBe(0)
})

test("AB5 (closed by the Phase-4 wizard) — the stale RWA-era pointers stay gone; organon-setup.sh IS the BYOK wizard", () => {
  const sh = read("organon-setup.sh")
  expect(sh).not.toMatch(/next: {2}\.\/organon-run\.sh/)
  expect(sh).not.toMatch(/packages\/solidity-sentinel\/src\/index\.ts/)
  expect(sh).not.toMatch(/FRED_API_KEY/) // the parked-pipeline credential no longer haunts setup
  expect(sh).toMatch(/organon-studio-test\.sh.*CANONICAL/i)
  expect(sh).toMatch(/read -rs val/) // the wizard's masked paste (full contracts asserted in stranger_ready)
  const c = closed.closures.find((x: { id: string }) => x.id === "AB5")
  expect(c.status).toBe("CLOSED") // interim in Phase 2, completed by the Phase-4 wizard
})

test("AB6 — the ask expansion is bash-3.2-safe: the guarded form is in the script AND the exact pattern survives set -u with an empty array under /bin/bash", () => {
  const sh = read("organon.sh")
  expect(sh).toMatch(/\$\{ASK_ARGS\[@\]\+"\$\{ASK_ARGS\[@\]\}"\}/) // the safe expansion
  expect(sh).not.toMatch(/ask\.ts "\$\{ASK_ARGS\[@\]\}"/) // the bare fatal form is gone
  // the behavioral proof, not just the grep: the exact pattern under set -u with an EMPTY array must not error
  const probe = spawnSync("/bin/bash", ["-c", 'set -u; ASK_ARGS=(); echo ok ${ASK_ARGS[@]+"${ASK_ARGS[@]}"}'])
  expect(probe.status).toBe(0)
  expect(probe.stdout.toString()).toMatch(/ok/)
  // and the POSITIVE CONTROL: the OLD bare form is fatal on this shell (the bug was real; the fix is load-bearing)
  const control = spawnSync("/bin/bash", ["-c", 'set -u; ASK_ARGS=(); echo ok "${ASK_ARGS[@]}"'])
  expect(control.status).not.toBe(0)
})

test("AB7 — the continuity resolver: full content where a log exists, RECORDED absence where it does not (never a silent skip)", () => {
  // a present file returns its content verbatim
  expect(continuityLog("PINS.md")).toMatch(/PINS/)
  // the never-committed logs resolve to the recorded-absent state on this clone (DISC-1 is in the audit — asserted inside)
  expect(continuityLog("sprint/sprint-result/BUILDLOG-VERIFY.md")).toBeNull()
})

test("the re-rendered blocker list is EMPTY of unscheduled items — every D22 BLOCKER is CLOSED or INTERIM-with-its-phase-slotted", () => {
  const ids = audit.blockers.map((b: { id: string }) => b.id)
  for (const id of ids) {
    const c = closed.closures.find((x: { id: string }) => x.id === id)
    expect(c, `blocker ${id} has no closure record — the sprint STOPS at this gate`).toBeTruthy()
    expect(c.status === "CLOSED" || /INTERIM.*Phase [0-9]/.test(c.status), `${id} is neither CLOSED nor slotted`).toBe(true)
    expect(c.regressionTest, `${id} closed without a regression test`).toBeTruthy()
  }
  expect(closed.reRenderedBlockerList).toEqual([])
})
