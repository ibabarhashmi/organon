/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 4: THE EMPTY-STATE WALK (S199, P-12/P-17). NOT A MOCK.
 *
 * A brand-new user with ZERO data is the offline fixture Reality Check (all keys empty → SAMPLE dominant). This renders it and
 * asserts, via Unjudgeable.checkText, that EVERY verdict word (UNJUDGEABLE/UNVERIFIED/INSUFFICIENT) in the VISIBLE text carries
 * BOTH a why AND a path-to-judgeable. A bare render is a P-entry. Also renders P-17's frozen limits at the point of use.
 *
 * Run: bun run script/honesty/hardening-emptystate.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Unjudgeable } from "../../src/organon/unjudgeable"

const FIXTURE = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"

process.env.ORGANON_OFFLINE = "1"
const { app } = await import("../serve-reality.ts")
const res = await (app as { fetch: (r: Request) => Promise<Response> }).fetch(new Request(`http://localhost/check/manifest:${FIXTURE}`))
const html = await res.text()
const text = Unjudgeable.visibleText(html)
const check = Unjudgeable.checkText(text)

// a worked example of the producer (proof it renders {why, path} for each kind)
const examples = (["SAMPLE", "UNVERIFIED", "INSUFFICIENT", "UNJUDGEABLE"] as const).map((k) =>
  Unjudgeable.explain({ kind: k, subject: "this pool's APY", nObs: 12, needObs: 30, scope: k === "UNJUDGEABLE" ? "fewer than two positions" : undefined }))

const OUT = {
  protocol: "hardening-emptystate",
  at: "2026-07-16",
  rule: "S199 (P-12/P-17) — the offline fixture Reality Check (a zero-data user's first screen) has NO bare verdict word: every UNJUDGEABLE/UNVERIFIED/INSUFFICIENT in the visible text carries BOTH a why and a path-to-judgeable (Unjudgeable.checkText). The empty state is not hostile — it explains itself and names its path. P-17: the frozen limits render at the point of use.",
  rendered: res.status === 200,
  status: res.status,
  verdictWordsChecked: check.checked,
  bareRenders: check.bare,
  ok: check.ok,
  producerExamples: examples,
  limitsAtPointOfUse: Unjudgeable.limitsAtPointOfUse(),
  summary: `${check.checked} verdict words in the visible empty-state render, ${check.bare.length} bare (each must carry why + path); limits at point of use: ${Unjudgeable.limitsAtPointOfUse().map((l) => l.axis).join(", ")}`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-emptystate.json"), JSON.stringify(OUT, null, 2) + "\n")
console.log("── HARDENING EMPTY-STATE (Phase 4, S199) — the stranger's first screen ──")
console.log("  " + OUT.summary)
if (check.bare.length) check.bare.slice(0, 8).forEach((b) => console.log(`  BARE [${b.word}] missing ${b.missing}: ${b.context}`))
console.log(`  ok (0 bare renders): ${check.ok}`)
console.log("written: data/honesty/hardening-emptystate.json")
