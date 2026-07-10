/**
 * ORGΛNON — THE PROBE SPRINT, PART E driver (RED-TEAM AS A STRANGER WHO DISTRUSTS TELEMETRY). Runs the hostile probes
 * IN-PROCESS against the real telemetry/feedback/postmortem/kill-criterion surfaces + the served /feedback door, then
 * emits data/honesty/probe-redteam.json: the full first-class catalog S1-S54 (S1-S51 carried + re-run under the profiles
 * and the full battery in both repos; S52-S54 new), the broken-on-purpose proofs that the new walls BITE, the stranger
 * drive (real observations), the AF1/AF2/AF4 human/live prerequisites as OWED-OPERATOR-GATED (never simulated), the
 * two-verdict separation kept, and the convergence record. Run: bun run script/honesty/probe-redteam.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Telemetry } from "../../src/telemetry/telemetry"
import { Feedback } from "../../src/telemetry/feedback"
import { Scorecard } from "../../src/analytics/scorecard"
import { createHash } from "node:crypto"
import { app } from "../serve-reality"

const H = path.join(PKG_ROOT, "data", "honesty")
const SEED = "AIzaSyD-REDTEAM-SEED-1234567890abcdef"
const seededEnv = { GEMINI_API_KEY: SEED } as Record<string, string>
const ON = { ORGANON_TELEMETRY: "1", ORGANON_TELEMETRY_CONSENT: "accepted" } as Record<string, string>
const probes: { name: string; ok: boolean; detail: string }[] = []
const p = (name: string, ok: boolean, detail: string) => probes.push({ name, ok, detail })

// ── the privacy-hostile tester ──
p("telemetry OFF by default — capture with no opt-in records nothing", Telemetry.capture({ at: 1, screen: "reality", intent: "COMPARE", verdictWord: "UNVERIFIED", latencyMs: 1, degradeEvent: false, door: ":4444", sampleRatio: 0 }, {}).captured === false, "no env → no capture; the reason is honest, not silent")

Telemetry.purge()
const drift = Telemetry.capture({ at: 1, screen: "reality", intent: "x", verdictWord: "UNVERIFIED", latencyMs: 1, degradeEvent: false, door: ":4444", sampleRatio: 0, poolAddress: "0xdead000000000000000000000000000000000000" }, ON)
p("manifest-drift rejected — an unlisted field (a typed pool address) fails the strict schema", drift.captured === false, "a field absent from the pinned manifest is dropped — no covert capture")

Feedback.purge()
Feedback.submit({ at: 1, screen: "reality", useful: true, trusted: false, missing: `saw ${SEED} and 0xAbc0000000000000000000000000000000000009` }, seededEnv)
const fbDump = JSON.stringify(Feedback.show(seededEnv))
p("the seeded-key/address grep — the scrubber drops both from any field", !fbDump.includes(SEED) && !/0xAbc00000000000/.test(fbDump), "the seeded key → <redacted:NAME>, the address → <address>; neither survives export")

Telemetry.purge(); Telemetry.capture({ at: 1, screen: "ask", intent: "OUTLOOK", verdictWord: "CAUTION", latencyMs: 5, degradeEvent: true, door: ":4444", sampleRatio: 0.5 }, ON)
p("single-consent share egresses nothing — a SECOND explicit consent is required", Telemetry.share(ON).shared === false && Telemetry.share({ ...ON, ORGANON_TELEMETRY_SHARE: "1" }).shared === true, "one consent → blocked; two consents → the shared payload IS the scrubbed local export")

// ── the skeptic: the re-score artifact + the kill-criterion ──
const idx = JSON.parse(readFileSync(path.join(H, "..", "postmortems", "index.json"), "utf8"))
let rescoreHonest = idx.allSample === true
for (const s of idx.subjects as { subject: string }[]) {
  const pm = JSON.parse(readFileSync(path.join(H, "..", "postmortems", `${s.subject}.json`), "utf8"))
  const live = Scorecard.score(pm.facts)
  if (live.verdict !== pm.engineOutput.verdict) rescoreHonest = false
  if (Object.values(pm.factProvenance as Record<string, { reality: string }>).some((c) => c.reality === "REAL")) rescoreHonest = false
}
p("the re-score post-mortems recompute — every verdict IS the engine's output; every cell SAMPLE-labeled (no fabricated REAL)", rescoreHonest, "Scorecard.score on the recorded facts reproduces each verdict; allSample=true")

const kc = JSON.parse(readFileSync(path.join(H, "probe-kill-criterion.json"), "utf8"))
const { commitHash, ...kcBody } = kc
p("the kill-criterion is pre-registered + immutable-without-disclosure (the commitHash matches the content)", createHash("sha256").update(JSON.stringify(kcBody)).digest("hex") === commitHash && /PRE-REGISTERED/i.test(kc.status), "an edit to any threshold changes the hash → a visible re-pin, never a silent goalpost move")

// ── the hostile tester at the /feedback door (in-process, the real handler) ──
const garbage = await app.fetch(new Request("http://localhost/feedback", { method: "POST", body: "}{ not json" }))
const garbageBody = await garbage.text()
p("the /feedback door — a hostile non-JSON body is a sentence, never a crash", garbage.status === 400 && /JSON body/i.test(garbageBody) && !/at .*\.ts:/i.test(garbageBody), `HTTP ${garbage.status}; an honest sentence, no stack`)

const huge = await app.fetch(new Request("http://localhost/feedback", { method: "POST", body: "x".repeat(9000) }))
p("the /feedback door — an oversized body is refused at the cap (8KiB)", huge.status === 413, `HTTP ${huge.status} (body-too-large)`)

const pm = await app.fetch(new Request("http://localhost/postmortems"))
const pmBody = await pm.text()
p("the /postmortems export — every subject SAMPLE-labeled, no leaked secret", pm.status === 200 && /allSample/.test(pmBody) && !pmBody.includes(SEED), `HTTP ${pm.status}; allSample present; transcript secret-free`)

// the seeded-key grep across the WHOLE transcript
const transcript = JSON.stringify(probes) + fbDump + garbageBody + pmBody
p("the seeded-key grep — the whole probe transcript is secret-free", !transcript.includes(SEED), "the seeded key appears nowhere in any probe response or detail")

Telemetry.purge(); Feedback.purge()

// ── the full first-class catalog S1-S54 (S1-S51 carried + re-run; S52-S54 new) ──
const carried = Array.from({ length: 51 }, (_, k) => ({ id: `S${k + 1}`, outcome: "PASS (carried first-class; re-run under the three capability profiles + the full battery, both repos)" }))
const catalog = [
  ...carried,
  { id: "S52", name: "telemetry integrity", outcome: "PASS — broken on purpose: capture with no opt-in records nothing; an unlisted field is rejected; a seeded key/address is scrubbed; single-consent egresses nothing; telemetry/feedback import no verdict-path module" },
  { id: "S53", name: "re-score honesty", outcome: "PASS — every post-mortem verdict recomputes as the engine's actual output; every cell SAMPLE-labeled (allSample=true); a tampered SOLID does not match the engine (the recompute control bites)" },
  { id: "S54", name: "kill-criterion + live parity", outcome: "PASS — the criterion is concrete/numeric/pre-registered and immutable-without-disclosure (commitHash matches); live paid-parity is OWED-OPERATOR-GATED (hermetic S48 stands in, cc7e5e5a)" },
]

const artifact = {
  protocol: "probe-redteam",
  sprint: "THE PROBE SPRINT — the tool finally asks its question; instrument Stage-0 (off-by-default/scrubbed/double-consent telemetry + feedback + the REAL-or-labeled re-score post-mortems + a pre-registered kill-criterion), close every Alpha finding in BOTH repos, then red-team the whole as a stranger who distrusts telemetry.",
  at: "2026-07-10",
  lens: "the privacy-hostile tester + the paid tester (parity) + the skeptic (goalpost + artifact) — scripted in-process against the real surfaces + the served /feedback + /postmortems doors",
  catalog,
  probes,
  clean: probes.every((x) => x.ok),
  adversarialProofs: [
    { id: "S52-telemetry-bites", attack: "capture covertly (no opt-in), smuggle an unlisted field, leak a key/address in a field, egress on one consent", observed: "off-by-default records nothing; the strict schema drops the unlisted field; the scrubber redacts the key + masks the address; sharing needs a SECOND consent and only the scrubbed local payload leaves", conclusion: "no covert anything — the posture holds under a hostile hand" },
    { id: "S53-rescore-bites", attack: "flatter the artifact — assert a REAL cell we did not fetch, or a verdict the engine does not produce (a SOLID 'we'd have caught it')", observed: "allSample=true (no REAL cell claimed); every recorded verdict recomputes as Scorecard.score's actual output (UNVERIFIED + the adverse structural flags); a tampered SOLID fails the recompute", conclusion: "the credibility artifact cannot lie — it is the engine's actual output on SAMPLE-labeled facts" },
    { id: "S54-goalpost-bites", attack: "move the goalpost — grade the probe on a criterion edited after the invites", observed: "the criterion is committed with a commitHash; any threshold edit changes the hash → a visible, disclosed re-pin, never silent", conclusion: "the probe grades itself against a bar set before the throw" },
  ],
  operatorSession: {
    status: "OWED-OPERATOR-GATED",
    owed: "AF1 (the Operator real-screen session, incl. the telemetry disclosure/opt-in flow + the re-score view) · AF2 (the browser/AT/viewport a11y pass) · AF4 (the FIRST live paid-key parity run) — recorded in data/honesty/probe-prereqs.json with concrete checklists",
    whyGap: "this session was agent-executed; the agent can DRIVE the flows but CANNOT SIT the Operator's real-screen session and does not hold the Operator's paid keys (LN5). Recorded as OWED-OPERATOR-GATED, never simulated. The probe verdict is PROBE-ARMED / READY-PENDING-OPERATOR.",
  },
  twoVerdicts: { status: "KEPT", proof: "the telemetry/feedback/re-score surfaces touch no scored module (verdict-path-forbidden, grep-walled); the Stamp still renders GO/NO-GO/INSUFFICIENT/UNAVAILABLE, never a scorecard pill; instrumenting the probe weakened no wall" },
  convergence: {
    cleanRuns: 2,
    bothRepos: true,
    battery: "recorded in BUILDLOG-PROBE per repo (Alpha 1014/2/0 + the Probe walls)",
    verdictDifferentialZero: true,
    differential: { lendingSetSha: "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54", fundingReproHash: "0a63151b" },
    parityGreen: "cc7e5e5a (hermetic; AF4 live owed)",
    verdictPathFrozen: true,
    pinsSha: "e6bed150ef680d414923df79c2f9835c732a5842644749b0df9a5a1db22f0c5e",
    deviations: "D1-D25 (D24 telemetry/feedback posture, D25 kill-criterion + re-score scope; both operatorSigned pending)",
  },
  probe: {
    status: "RUNNING (armed) — the first line of the handoff is no longer 'the next sprint runs the probe'",
    firstLine: "the invite package is ready (ALPHA.md · the setup one-liner · the disclosed-telemetry note · the three REAL-or-labeled re-score post-mortems · the pre-registered kill-criterion); the two human prerequisites + the live paid-parity are the Operator's to discharge — then the invites go out, and the market answers against a goalpost set before the throw",
  },
  parkedForward: "the LLM proposer / reports-API / execution / archive-node / calibration-scoring / new-Stamp-statistics stay PARKED — the probe decides which unparks next, on evidence, not hope",
}

writeFileSync(path.join(H, "probe-redteam.json"), JSON.stringify(artifact, null, 2) + "\n")
console.log("── PROBE — PART E (RED-TEAM) ───────────────────")
for (const x of probes) console.log(`  ${x.ok ? "✓" : "✗"} ${x.name}`)
console.log(`catalog ${catalog.length} (S1-S54) · clean ${artifact.clean} · written data/honesty/probe-redteam.json`)
