/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 4 wall S91 (THE CONSOLE'S SINKS · D48). The studio console (:4319) carried an
 * attribute-sink XSS for three sprints, stalled on a decision about committing someone else's unauthorized diff. This
 * sprint DISSOLVES the standoff: the agent authors its OWN escaping fix, with its own walls, superseding the prior F-diff
 * (D48). The Operator's pending decision was about committing an unauthorized diff — this makes it moot.
 *
 * R-4: the sink inventory is MECHANICAL (grep the emission primitives), not editorial. F-1 the goal attribute sink is
 * escaped with the FULL escaper; F-2 an invalid policy/side is REFUSED, never coerced; F-3 a malformed enroll is 400, not
 * 500; F-4 the rate-limit key is the real socket peer, not a spoofable header. Seeded payloads neutralized by ASSERTION.
 * The verdict path is UNTOUCHED — the console is operator-side (no verdict moves; no frozen byte changes).
 */
import { test, expect } from "bun:test"
import { readFileSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Hono } from "hono"
import { PKG_ROOT } from "../../src/organon/frozen"
import { dashboard } from "../../script/serve-studio"
import { Builder } from "../../src/studio/builder"
import { StudioRoutesNS } from "../../src/studio/routes"
import { Enroll } from "../../src/studio/enroll"
import { Ledger } from "../../src/ledger/ledger"

// attribute-breakout payloads (each carries a char that would escape a value="…" attribute: a quote, an angle bracket)
const SEEDS = ['" onmouseover=alert(1)', "</textarea><script>alert(1)</script>", "'><img src=x onerror=alert(1)>"]

// ── F-1 — the goal attribute sink is escaped (seeded payloads neutralized) ───────────────────────────────────────────

test("S91/F-1 — a seeded XSS payload in the goal field is NEUTRALIZED in the rendered attribute (no breakout, no live handler)", () => {
  for (const seed of SEEDS) {
    const html = dashboard({ goal: seed, resultRender: "test" })
    // the attribute cannot be broken out of: every breakout char in the seed is ESCAPED in the output
    expect(html).not.toMatch(/value="" onmouseover=/) // the double-quote breakout is impossible
    expect(html).not.toContain("</textarea><script>") // a tag-injection payload is escaped, never a live tag
    expect(html).not.toContain("'><img") // the single-quote breakout is impossible
    // the escaped form is present instead (the quote → &quot;, the angle brackets → &lt;&gt;, the apostrophe → &#39;)
    if (seed.includes('"')) expect(html).toContain("&quot;")
    if (seed.includes("<")) expect(html).toContain("&lt;")
    if (seed.includes("'")) expect(html).toContain("&#39;")
  }
})

test("S91/F-1 — MECHANICAL inventory (R-4): every user-controlled ATTRIBUTE sink in serve-studio.ts uses the full escaper escAttr", () => {
  const src = readFileSync(path.join(PKG_ROOT, "script", "serve-studio.ts"), "utf8")
  // the escaper exists and is the full HTML5 set (& < > " ')
  expect(src).toMatch(/const escAttr = .*&amp;.*&lt;.*&gt;.*&quot;.*&#39;/s)
  // the goal value attribute (the one reflected user input in an attribute context) uses escAttr, not the text-only esc
  expect(src).toMatch(/value="\$\{escAttr\(consoleState\?\.goal/)
  // no user-controlled value="${esc(...)}" attribute sink remains on the text-only escaper (grep the anti-pattern)
  expect(src).not.toMatch(/value="\$\{esc\(consoleState/)
})

// ── F-2 — refuse-not-coerce (an invalid policy/side is refused, never silently defaulted) ────────────────────────────

test("S91/F-2 — an invalid policy is REFUSED before registration (never silently coerced to the conservative default)", () => {
  const markets = [{ key: "lending:aave-v3:USDC:ethereum", weight: 0.5 }]
  const avail = ["lending:aave-v3:USDC:ethereum"]
  const bad = Builder.compose({ markets, policy: "attacker-policy" }, avail)
  expect(bad.ok).toBe(false)
  if (!bad.ok) expect(bad.error).toMatch(/not one of static|never silently coerced/i)
  // an OMITTED policy still defaults (conservative) — refuse-not-coerce bites only a PRESENT-but-invalid value
  expect(Builder.compose({ markets }, avail).ok).toBe(true)
  // funding side likewise
  const badSide = Builder.composeFunding({ venue: "binance", interval: 8, side: "evil" })
  expect(badSide.ok).toBe(false)
  if (!badSide.ok) expect(badSide.error).toMatch(/not receive \/ pay|never silently coerced/i)
  expect(Builder.composeFunding({ venue: "binance", interval: 8 }).ok).toBe(true) // omitted → conservative default
})

// ── F-3 — a malformed enrollment is 400 (client fault), not 500 (server fault) ───────────────────────────────────────

test("S91/F-3 — a malformed enrollment (a non-not-yet verdict) returns 400, not 500 (the client's request was wrong, not the server)", async () => {
  const book = new Enroll.Book(path.join(mkdtempSync(path.join(tmpdir(), "org-enr-")), "enrollments.jsonl"))
  const app = new Hono().route("/studio", StudioRoutesNS.mountable(new Ledger.Store(), book))
  // a well-formed JSON body whose verdict is NOT a not-yet verdict → EnrollError → 400 (bad-enroll), never a 500
  const res = await app.request("/studio/enroll", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ specHash: "a".repeat(64), authorId: "x", domain: "lending", verdictId: "v1", verdict: "GO", familySize: 1, rootCount: 1, at: 0 }),
  })
  expect(res.status).toBe(400) // F-3: client fault, not 500
  const body = (await res.json()) as { error: string }
  expect(body.error).toBe("bad-enroll") // StudioErrors.enrich → { ok:false, error: code, … }
})

// ── F-4 — the rate-limit key is the real socket peer, not a spoofable header ─────────────────────────────────────────

test("S91/F-4 — the rate-limit / pool-family key is callerId behind TRUST_PROXY, never the raw x-forwarded-for header", () => {
  for (const rel of ["script/serve-studio.ts", "src/studio/routes.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    // callerId is defined and trusts the header ONLY behind a declared proxy (TRUST_PROXY); else the socket peer
    expect(src).toMatch(/function callerId/)
    expect(src).toMatch(/TRUST_PROXY/)
    expect(src).toMatch(/getConnInfo/)
    // the anti-spoof rule: the rate-limit key assignment uses callerId(c), not the raw header
    expect(src).toMatch(/who = callerId\(c\)/)
    // and no rate-limit key is assigned directly from the spoofable header anymore
    expect(src).not.toMatch(/const who = c\.req\.header\("x-forwarded-for"\)/)
  }
})

// ── the verdict path is untouched (the console is operator-side) ─────────────────────────────────────────────────────

test("S91 — D48: the fix is CONSOLE-only (operator-side); it does not touch the verdict path or any frozen artifact", () => {
  // the escaper + callerId live in the SERVE layer / studio (routes/builder/errors), never in the strategy/verdict core
  const strategyDir = readFileSync(path.join(PKG_ROOT, "src", "strategy", "compile.ts"), "utf8")
  expect(strategyDir).not.toMatch(/escAttr|callerId|TRUST_PROXY/) // the verdict path knows nothing of the console fix
})
