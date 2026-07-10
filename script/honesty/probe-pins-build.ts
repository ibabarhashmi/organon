/**
 * ORGΛNON — THE PROBE SPRINT, Phase 0 (PINS-LOCKED). Builds `data/honesty/probe-pins.json`: the X-TELEMETRY posture +
 * the pinned capture manifest (the exact captured-field set + the never-captured set), the feedback contract, the
 * re-score honesty contract (REAL-or-labeled-SAMPLE, content-hashed), the kill-criterion schema (concrete/numeric/
 * pre-committed), the verdict-path-forbidden extension (telemetry/feedback added beside the 7 modules), the AF
 * resolutions AF1–AF7, D24/D25, and S52–S54 — pinned BEFORE any instrumentation lands. The dual-repo sprint runs
 * identically in ibabarhashmi/organon-studio AND ibabarhashmi/organon (byte-identical 34d20e7 bases).
 * Convention follows alpha-pins-build.ts: pinsSha = sha256(JSON.stringify(pins-without-sha)).
 * Run: bun run script/honesty/probe-pins-build.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const fileSha = (rel: string) => sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))

const VERDICT_PATH = [
  "src/analytics/scorecard.ts",
  "src/studio/stamp.ts",
  "src/studio/decay.ts",
  "src/studio/icir.ts",
  "src/studio/mintrl.ts",
  "src/studio/lineage.ts",
  "src/ask/gates.ts",
]

const pins: Record<string, unknown> = {
  protocol: "probe-pins",
  sprint:
    "THE PROBE SPRINT — X-PROBE resolves ARMED→RUNNING: instrument Stage-0 demand validation (off-by-default/scrubbed/double-consent telemetry · a feedback surface · the Stream/Elixir/Resolv re-score post-mortems REAL-or-labeled) · a pre-registered kill-criterion · close every Alpha finding across BOTH repos · then red-team the whole. The closed alpha IS the probe's vehicle; the invites go out after this sprint.",
  at: "2026-07-10",
  continues:
    "THE ALPHA SPRINT (VALIDATED PASS both repos; 1014 pass / 2 skip / 0 fail across 152 files / 1016 tests; ALPHA VERDICT READY-PENDING-OPERATOR)",
  carriedFromPinsSha: "3b9f98bcba4307774326be132871798a6ff72b0a29d638e973bb65321ae9309b",
  dualRepo: {
    repos: ["ibabarhashmi/organon-studio", "ibabarhashmi/organon"],
    rule: "one blueprint, two trees (byte-identical 34d20e7 Alpha bases); every gate re-proven in EACH; a per-repo delta is recorded (the DISC pattern), never silently reconciled — the tree wins in both trees",
  },
  telemetryPosture: {
    law: "X-TELEMETRY — NO COVERT ANYTHING",
    offByDefault: "ships DISABLED; no capture without ORGANON_TELEMETRY=1 AND an accepted first-run disclosure (a local consent marker)",
    manifested: "the tester sees EXACTLY what is captured; a captured field ABSENT from the pinned manifest is a Halt",
    scrubbed: "every event passes the Alpha scrubber EXTENDED (secret/address/prompt masking); a seeded secret/strategy/address in any field is dropped (S52 positive control)",
    localFirst: "captured to the tester's machine (data/telemetry/, gitignored); telemetry --show/--export/--purge gives full sight + control",
    doubleConsentToShare: "nothing leaves the machine without a SECOND explicit ORGANON_TELEMETRY_SHARE=1; the shared payload is the scrubbed local one, nothing more",
    haltIf: "on-by-default · covert · un-manifested · unscrubbed · single-consent-shared",
  },
  captureManifest: {
    captured: ["at", "screen", "intent", "verdictWord", "latencyMs", "degradeEvent", "door", "sampleRatio"],
    neverCaptured: ["keys/secrets", "strategy inputs", "typed pool addresses", "prompt text", "PII", "IP", "free-text the tester typed"],
    fieldNote: "captured === this exact set (a test asserts the event field set === this manifest, exactly; an extra field fails — A′#9/S52); verdictWord is the ENGINE'S verdict word reached (SOLID/CAUTION/AVOID/UNVERIFIED/GO/NO-GO/INSUFFICIENT/UNAVAILABLE), never the pool it was about",
  },
  feedbackContract: {
    surface: "/feedback (POST) + ./organon.sh feedback",
    posture: "structured, in-band, scrubbed, local-first, export-on-consent — the SAME posture as telemetry",
    fields: ["at", "screen", "useful", "trusted", "missing"],
    scrub: "the free-text 'missing' field is scrubbed (secrets/addresses masked) before local append; export/share obey the double-consent rule",
  },
  rescoreHonestyContract: {
    subjects: ["stream", "elixir", "resolv"],
    rule: "run the EXISTING deterministic engine (Scorecard.score — zero new scoring) against each collapse's subject; every fact cell REAL-and-content-hashed where fetchable, else labeled SAMPLE; the recorded verdict IS the engine's actual recomputed output (a test recomputes and asserts equality)",
    haltIf: "a fabricated cell · an unlabeled SAMPLE · a verdict the engine does not reproduce · a certainty the SAMPLE data does not support",
    lawAuthority: "X-HONEST governs the artifact absolutely (the artifact most tempted to lie)",
  },
  killCriterionSchema: {
    fields: ["metric", "continueThreshold", "pivotThreshold", "stopThreshold", "window", "measurement"],
    rule: "concrete + numeric + continue/pivot/stop, ledger-committed BEFORE any invite; immutable-once-committed (a later edit is a conscious, disclosed re-pin, never silent) — the anti-goalpost-move discipline (the Stamp's anti-overfitting, applied to the tool's own thesis)",
    haltIf: "vague/unfalsifiable · editable-without-a-disclosed-re-pin · graded on a goalpost moved after the throw",
  },
  verdictPathForbidden: {
    modules: VERDICT_PATH,
    extension: "telemetry + feedback are VERDICT-PATH-FORBIDDEN consumers — src/telemetry/* and the feedback module import NO scored module (a grep wall asserts it); instrumenting the probe may not weaken a wall the probe exists to prove",
  },
  verdictPathHashes: Object.fromEntries(VERDICT_PATH.map((rel) => [rel, fileSha(rel)])),
  parityContract: {
    profiles: ["zero-key", "free-key", "paid-key"],
    liveProfile: "AF4 — the parity guarantee is exercised ONCE against a real paid model key + a real DeFiLlama-Pro key under the Operator's hand (byte-identical vs keyless, or the honest gap recorded)",
    differentialBaseline: {
      lendingSetSha: "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54",
      fundingNoGoReproHash: "0a63151b",
    },
  },
  afResolutions: {
    AF1: "IN2 (Operator real-screen session) — DISCHARGED on a real screen as the Operator's own, or the honest STOP; agent-executed → recorded OWED-OPERATOR-GATED, never simulated (LN5)",
    AF2: "IN4 (browser/AT/viewport a11y pass) — same: the Operator's own eyes, or the honest STOP",
    AF3: "D23 countersign PREPARED — the parity proof it rests on is green in both repos; operatorSigned stays false until the Operator signs (an agent must not sign as the Operator)",
    AF4: "live paid-key parity — exercised once under the Operator's real keys, or the honest gap recorded; the 7-module freeze + parity differential run UNCHANGED under the live paid profile",
    AF5: "pristine.ts's hardcoded 'v0' → the SOURCE repo's current branch (robust per-repo: staging in organon/organon-studio, v0 in the standalone dev tree); a conscious script change, old/new behavior recorded",
    AF6: "two-repo provenance durability — a durable base-identity record committed to organon (34d20e7=34d20e7 + the f53284c cherry-pick origin), self-contained (not 'trust organon-studio'); the alpha-pins 'organon-studio' label carried honestly (DISC-B), this BUILDLOG the record",
    AF7: "the evidence bundle regenerated + committed at the settled count; the reconciliation ITEMIZED (the continuity-fixture + register-shape deltas enumerated, not folded)",
    LN1: "familyN=1 legible-not-stronger; the attempts-ledger→N linkage PARKED in writing (carried verbatim)",
    LN2: "the frozen-prose '1.000' residual, parked under X-KEEP (carried verbatim)",
  },
  deviations: {
    reserved: ["D24 (telemetry/feedback privacy posture, Operator-signed)", "D25 (probe kill-criterion + re-score artifact scope, Operator-signed)"],
  },
  stressCatalog: {
    carried: "S1–S51 first-class, re-run under the three capability profiles in BOTH repos",
    S52: "telemetry integrity — OFF by default (no capture without env + disclosure); captured set === the pinned manifest; every field scrubbed (seeded secret/strategy/address dropped); double-consent to share; export scrubbed; telemetry/feedback verdict-path-forbidden",
    S53: "re-score honesty — every post-mortem cell REAL-and-content-hashed or labeled-SAMPLE; the verdicts are the engine's actual recomputed output; no fabricated cell; no unsupported certainty",
    S54: "kill-criterion + live parity — the criterion pre-registered/concrete/numeric/immutable-without-disclosure; the live paid-key parity byte-identical vs keyless (or the honest gap)",
  },
  screens: { count: 3, note: "the conscious 3 on :4444; telemetry/feedback/re-score are DISPOSITIONED doors, hardened like the rest — never a fourth screen" },
  massPathDeps: ["hono", "zod"],
  massPathDepsNote: "telemetry + feedback are Bun-stdlib + zod; no analytics SDK, ever (an analytics SDK is a covert-capture vector and a Halt)",
}

const pinsSha = sha256(JSON.stringify(pins))
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-pins.json"), JSON.stringify({ ...pins, pinsSha }, null, 1) + "\n")
console.log("probe-pins.json written · PINS_SHA", pinsSha, "· carried", pins.carriedFromPinsSha)
