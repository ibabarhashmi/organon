/**
 * ORGΛNON — THE REDESIGN SPRINT, the pins builder (X-REDESIGN). Continues from the COMPLETE GroundTruth pins
 * (data/honesty/groundtruth-pins.json) — carried forward, never rebuilt. This pins the CONSCIOUS RE-PIN of the design
 * identity (cool graphite + signal cyan) via a SUPERSESSION (U-RESUPERSEDE), the exact pattern the Interpreter sprint
 * used for the persona re-pin:
 *   · the LIVE token + DESIGN.md hash-lock MOVES here (a changed token ⇒ a changed tokens sha ⇒ a changed pins sha);
 *   · the Surface record (surface-pins.json) KEEPS its historical Surface-era sha — superseded, NOT rewritten — so the
 *     8-sprint carry chain is untouched and the Sovereign/Interpret "tokensStayFrozen" records stay accurate history;
 *   · the SEMANTIC colors (verdict/Stamp/REAL-SAMPLE/axis-tier) are BYTE-UNCHANGED (honesty-load-bearing) — only the
 *     ground + brand accent moved; every pairing re-cleared WCAG-AA (surface_a11y), the content stayed byte-identical
 *     (S36), the 45-rule detector stayed clean (S38);
 *   · the composition was rebuilt ABOVE the primitives (build-stylesheet.ts + the markup classes in reality.ts) WITHOUT
 *     touching the type/space/radius/motion token VALUES.
 * Deterministic; no network. The live shas are read from the artifacts; the superseded shas are read from the Surface pin.
 *
 * Run: bun run script/honesty/redesign-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const readSha = (rel: string) => sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))

// ── the CARRIED-FORWARD GroundTruth pins (the completed state this sprint continues from) ──
const GROUNDTRUTH = JSON.parse(readFileSync(path.join(H, "groundtruth-pins.json"), "utf8"))
const CARRIED_FROM = GROUNDTRUTH.pinsSha as string

// ── the SUPERSEDED Surface record (its historical tokens + DESIGN.md sha — the baseline this re-pin supersedes) ──
const SURFACE = JSON.parse(readFileSync(path.join(H, "surface-pins.json"), "utf8"))

// ── the LIVE (re-pinned) artifact shas ──
const TOKENS_REL = "data/honesty/design-tokens.json"
const DESIGN_MD_REL = "DESIGN.md"
const liveTokensSha = readSha(TOKENS_REL)
const liveDesignMdSha = readSha(DESIGN_MD_REL)

const PINS = {
  protocol: "redesign-pins",
  sprint: "THE REDESIGN SPRINT (the cool-graphite + signal-cyan identity re-pinned via supersession; the composition rebuilt ABOVE the primitives — a persistent Λ chrome, the Shelf as a triage board, a masthead + scannable scorecard rail, a provenance ledger, refined controls/motion/states; content byte-identical S36, WCAG-AA re-cleared S37, the 45-rule detector clean S38, deps still hono+zod)",
  at: "2026-07-12",
  continues: "THE GROUNDTRUTH SPRINT",
  carriedFromPinsSha: CARRIED_FROM, // the GroundTruth pins sha — carried forward; the engine/voice/contract unchanged, this is a SURFACE re-pin

  // ── THE TOKEN RE-PIN (X-REDESIGN a) — the live hash-lock moves here; the Surface record is superseded, not rewritten ──
  tokensRepin: {
    rel: TOKENS_REL,
    tokens: { sha: liveTokensSha }, // the LIVE design-tokens.json now hashes to THIS (the live lock moved — U-RESUPERSEDE)
    designMd: { rel: DESIGN_MD_REL, sha: liveDesignMdSha }, // DESIGN.md re-pinned too (the human/agent spec matches the new identity)
    stylesheet: { rel: "public/organon.css", builtFrom: TOKENS_REL, note: "BUILT deterministically from the re-pinned tokens (script/build-stylesheet.ts); not byte-pinned — surface_system --check proves determinism (same tokens ⇒ byte-identical css)" },
    supersedes: {
      tokens: SURFACE.tokens.sha, // the Surface-era tokens sha this re-pin supersedes (read from the historical record)
      designMd: SURFACE.tokens.designMd.sha,
      pinsSha: SURFACE.pinsSha, // b0179998 — the Surface identity pin
    },
    identity: "cool graphite + signal cyan — a truer neutral near-black ground (chroma ~0, not GitHub's blue-tinted #0d1117) + one restrained signal-cyan accent (#38d6c8) for links/focus/primary actions; a precision instrument, not a repo",
    semanticsUnchanged: "the verdict / Stamp / REAL-SAMPLE / axis-tier COLORS are BYTE-UNCHANGED (honesty-load-bearing — green verified, amber caution, red avoid, slate unverified); only bg/surface/surface2/border/borderStrong/ink/inkMuted/inkFaint/accent/accentInk moved, plus the FACT color + the FACT/BOUNDARY tints tracking the new surfaces; EVERY pairing re-verified WCAG-AA (surface_a11y GREEN on the live tokens, computed not claimed)",
    contentByteIdentical: "S36 surface_content_identity GREEN on the live tokens — every screen's visible text is byte-identical to the PRE-restyle golden (the restyle moved pixels, never a fact); the persistent ORGΛNON Λ wordmark is a TEXT-FREE svg (path + node only) whose accessible name rides an aria-label the content signature strips",
    resupersede: "U-RESUPERSEDE — the live token + DESIGN.md hash-lock MOVED here; surface-pins.json retains its historical Surface-era sha (superseded, not rewritten), so the carry chain is untouched and the Sovereign/Interpret 'tokensStayFrozen' / 'designSystemUnchangedInTokens' records stay ACCURATE HISTORY (they described Surface→Sovereign→Interpret truth; this is a LATER conscious re-pin). NO cascade — voice/engine/contract pins untouched.",
    consciousRePin: "a changed token ⇒ a changed tokens sha ⇒ a changed pins sha — surfaced with its sha delta; NEVER a silent restyle",
  },

  // ── THE COMPOSITION (X-REDESIGN b) — rebuilt ABOVE the primitives; the type/space/radius/motion token VALUES untouched ──
  composition: {
    aboveThePrimitives: "the composition / hierarchy / spacing rhythm / motion / component-design / states were rebuilt in script/build-stylesheet.ts + the markup CLASSES in src/studio/reality.ts, WITHOUT changing the type/space/radius/motion token VALUES — the identity re-pin is the palette; the craft uplift rides the existing scale used differently (build-stylesheet.ts is not hash-pinned; it is asserted a pure function of the tokens + the a11y/cue/detector walls)",
    chrome: "a persistent slim instrument topbar carrying the ORGΛNON Λ wordmark (a text-free svg, the apex signal-cyan) across every screen — the one persistent brand anchor",
    shelf: "a triage board — verdict-tinted row frames (a FULL border, never a side-tab), chip filters, the facts loud in mono tabular figures",
    realityCheck: "a masthead (name + verdict pill + REAL/SAMPLE badge) + a raised lead statement + a scannable axis-tier rail + a provenance ledger with a quiet timeline rule",
    ask: "a filled console with a designed empty state + the cyan primary action + the intentional AI-off badge",
    deps: ["hono", "zod"],
  },

  // ── THE WALLS (X-REDESIGN c) — the honesty locks the re-pin held ──
  walls: {
    s36: "content byte-identical per screen (surface_content_identity GREEN on the live tokens)",
    s37: "WCAG-AA computed from the live token file (surface_a11y GREEN — every core-text-on-ground, REAL/SAMPLE-on-ground-and-card, and verdict/Stamp/tier color-on-tint pairing clears 4.5:1)",
    s38: "the deterministic 45-rule impeccable detector clean over the new css + the three rendered screens (surface_detector GREEN; skips honestly when the dev-harness is absent)",
    designpass: "the Sovereign design-pass invariant is preserved as HISTORY (designpass-critique.json crit.tokensChanged=false — that pass changed no token); the palette re-pin is recorded HERE as the later conscious supersession",
    determinism: "public/organon.css reproduces byte-identically from the re-pinned tokens (surface_system --check GREEN)",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "redesign-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── REDESIGN — the identity re-pin (supersession) ───────────────")
console.log(`  carried from GroundTruth : ${CARRIED_FROM.slice(0, 16)}…`)
console.log(`  tokens  live → ${liveTokensSha.slice(0, 16)}…  (supersedes ${SURFACE.tokens.sha.slice(0, 16)}…)`)
console.log(`  DESIGN  live → ${liveDesignMdSha.slice(0, 16)}…  (supersedes ${SURFACE.tokens.designMd.sha.slice(0, 16)}…)`)
console.log(`  REDESIGN PINS_SHA        : ${pinsSha}`)
console.log("written: data/honesty/redesign-pins.json")
