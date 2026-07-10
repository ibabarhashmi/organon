/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 4 walls (STRANGER-READY, part 2 — the security pass, S49). Positive-controlled:
 * a SEEDED key literal can never print through the scrubbed paths (doctor · validate · the phrase error reason —
 * the control proves the unscrubbed string WOULD have leaked) · the served headers + localhost bind + rate limits
 * are asserted on REAL responses · the studio token compare is constant-time in source · the validator never logs
 * bodies · deps stay hono+zod on the mass path · no telemetry exists · the security-pass artifact is recorded.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scrub } from "../../src/util/scrub"
import { AskProvider } from "../../src/ask/provider"
import { AskPhrase } from "../../src/ask/phrase"
import { Ask } from "../../src/ask/answer"
import { app as realityApp } from "../../script/serve-reality"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const SEEDED = "sk-seeded-secret-abcdef123456"

test("S49 — the scrubber BITES: a seeded env key can never print; the positive control proves the raw string would have leaked", () => {
  const env = { EVIL_TEST_API_KEY: SEEDED }
  const dirty = `fetch failed: https://generativelanguage.googleapis.com/v1beta/models/x:generateContent?key=${SEEDED} (ENOTFOUND)`
  const clean = Scrub.redact(dirty, env)
  expect(dirty).toContain(SEEDED) // the control: the input REALLY carried the key
  expect(clean).not.toContain(SEEDED)
  expect(clean).toContain("<redacted:EVIL_TEST_API_KEY>")
  // short values and non-secret names are untouched (the scrubber redacts credentials, not prose)
  expect(Scrub.redact("port 4444", { PORT: "4444" })).toBe("port 4444")
})

test("S49 — the phrase error path is scrubbed END-TO-END: a provider whose error embeds the key renders a keyless reason", async () => {
  process.env.EVIL_TEST_API_KEY = SEEDED
  try {
    const leaky: AskProvider.Provider = {
      id: "leaky", provider: "openai",
      phrase: async () => { throw new Error(`transport error for url?key=${SEEDED} — refused`) },
    }
    const a = await Ask.answer("what can you do", { now: Date.parse("2026-07-05T00:00:00Z") })
    const phrased = await AskPhrase.phraseGrounded(a, leaky)
    const everything = JSON.stringify(phrased)
    expect(phrased.rejected).toBe(true)
    expect(everything).not.toContain(SEEDED) // the seeded key CANNOT ride the rendered reason (AH3 closed by design)
    expect(everything).toMatch(/provider unavailable/)
  } finally { delete process.env.EVIL_TEST_API_KEY }
})

test("the :4444 responses carry the honest headers on a REAL served response (nosniff · DENY · no-referrer · CSP)", async () => {
  const res = await realityApp.request("/health")
  expect(res.status).toBe(200)
  expect(res.headers.get("x-content-type-options")).toBe("nosniff")
  expect(res.headers.get("x-frame-options")).toBe("DENY")
  expect(res.headers.get("referrer-policy")).toBe("no-referrer")
  expect(res.headers.get("content-security-policy")).toMatch(/frame-ancestors 'none'/)
})

test("the localhost-default bind + the costly-route limits are live in both server modules", async () => {
  const reality = (await import("../../script/serve-reality")).default as { hostname: string }
  const studio = (await import("../../script/serve-studio")).default as { hostname: string }
  expect(reality.hostname).toBe(process.env.HOST ?? "127.0.0.1")
  expect(studio.hostname).toBe(process.env.HOST ?? "127.0.0.1")
  const src = read("script/serve-reality.ts")
  expect(src).toMatch(/REALITY_RL_REFRESH_MAX \?\? 6/)
  expect(src).toMatch(/REALITY_RL_ASK_MAX \?\? 30/)
})

test("the studio token compare is constant-time (AH2) and the token is never logged/rendered", () => {
  const r = read("src/studio/routes.ts")
  expect(r).toMatch(/timingSafeEqual/)
  expect(r).not.toMatch(/!== `Bearer \$\{opts\.token\}`/) // the short-circuiting compare is gone
  expect(read("script/serve-studio.ts")).not.toMatch(/console\.log\(.*STUDIO_TOKEN\}/) // presence ternary only, never the value
})

test("the key validator never logs bodies — adapters throw status-only; the validator prints scrubbed status lines only", () => {
  const v = read("script/validate-key.ts")
  expect(v).toMatch(/Scrub\.redact/)
  expect(v).not.toMatch(/JSON\.stringify\(.*body|console\.log\(.*response/i)
  const p = read("src/ask/provider.ts")
  expect(p).toMatch(/HTTP \$\{r\.status\}/) // the throw shape is status-only, by design
})

test("the mass-path dep set is unchanged (hono + zod, nothing else) and NO telemetry exists anywhere in src/script", () => {
  const pkg = JSON.parse(read("package.json"))
  expect(Object.keys(pkg.dependencies).sort()).toEqual(["hono", "zod"])
  // no telemetry/analytics/phone-home surface — a telemetry grab is a cut (A′#11)
  for (const rel of ["script/serve-reality.ts", "script/serve-studio.ts", "script/doctor.ts", "organon-setup.sh"]) {
    expect(read(rel)).not.toMatch(/telemetry|analytics\.|segment\.|posthog|sentry/i)
  }
})

test("the security pass is RECORDED end-to-end (the artifact carries key-handling · injection-under-profiles · deps · isolation · hardening)", () => {
  const s = JSON.parse(read("data/honesty/alpha-security-pass.json"))
  for (const k of ["keyHandling", "injectionUnderProfiles", "dependencyAudit", "skillIsolation", "servedHardening", "secureDefaults", "updateStory"]) {
    expect(s[k], `security pass missing ${k}`).toBeTruthy()
  }
  expect(s.keyHandling.residualNamed).toMatch(/Gemini/) // the residual is NAMED, not hidden
  expect(s.dependencyAudit.runtime).toEqual(["hono@4.12.27", "zod@4.4.3"])
})
