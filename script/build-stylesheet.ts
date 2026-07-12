/**
 * ORGΛNON — THE STYLESHEET BUILDER (Surface sprint; X-SURFACE a,e · Redesign sprint; X-REDESIGN — the cool-graphite +
 * signal-cyan identity, composition rebuilt ABOVE the primitives). Reads the PINNED design tokens
 * (data/honesty/design-tokens.json) and emits the SINGLE committed stylesheet (public/organon.css) DETERMINISTICALLY —
 * a pure function of the tokens: same tokens ⇒ byte-identical CSS; a changed token ⇒ a changed stylesheet (surface_system).
 * Plain CSS custom properties + classes; NO framework, NO CSS-in-JS, NO runtime dependency. The semantic classes carry
 * their NON-COLOR cues here (a glyph via ::before, a border-style, a weight) keyed on the existing HTML classes — so the
 * HTML CONTENT is byte-untouched by the surface (S36). No side-tab accent borders; a real type scale; ease-out motion with
 * a reduced-motion collapse; :focus-visible rings; responsive to the mobile breakpoint. `--check` diffs without writing.
 *
 * Run:  bun run script/build-stylesheet.ts            # regenerate + write public/organon.css
 *       bun run script/build-stylesheet.ts --check     # exit non-zero if the committed CSS differs from a regen
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

const T = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "design-tokens.json"), "utf8"))

// ── build the CSS as a pure function of the tokens ──────────────────────────────────────────────────────────────────
function buildCss(): string {
  const c = T.color, ty = T.type, sc = ty.scale, sp = T.space, r = T.radius, m = T.motion, lay = T.layout
  const sem = T.semantic
  // CSS custom properties (the token layer)
  const vars = [
    `--bg:${c.bg}`, `--surface:${c.surface}`, `--surface2:${c.surface2}`, `--border:${c.border}`, `--border-strong:${c.borderStrong}`,
    `--ink:${c.ink}`, `--ink-muted:${c.inkMuted}`, `--ink-faint:${c.inkFaint}`, `--accent:${c.accent}`, `--accent-ink:${c.accentInk}`,
    `--font:${ty.fontStack}`, `--mono:${ty.monoStack}`,
    `--sp1:${sp["1"]}`, `--sp2:${sp["2"]}`, `--sp3:${sp["3"]}`, `--sp4:${sp["4"]}`, `--sp5:${sp["5"]}`, `--sp6:${sp["6"]}`, `--sp7:${sp["7"]}`,
    `--r-sm:${r.sm}`, `--r-md:${r.md}`, `--r-lg:${r.lg}`, `--r-pill:${r.pill}`,
    `--dur-fast:${m.durationFast}`, `--dur:${m.durationBase}`, `--ease:${m.easing}`,
    `--wrap-max:${lay.wrapMax}`, `--wrap-pad:${lay.wrapPad}`,
    // semantic z-index scale (never arbitrary 999/9999): base < sticky-topbar < details-drawer
    `--z-topbar:20`,
  ]
  // semantic color vars (verdict / stamp / reality / trust tiers)
  for (const [k, v] of Object.entries(sem.verdict as Record<string, { color: string; tint: string }>)) vars.push(`--v-${k}:${v.color}`, `--v-${k}-t:${v.tint}`)
  for (const [k, v] of Object.entries(sem.stamp as Record<string, { color: string; tint: string }>)) vars.push(`--s-${k}:${v.color}`, `--s-${k}-t:${v.tint}`)
  vars.push(`--real:${sem.reality.REAL.color}`, `--real-t:${sem.reality.REAL.tint}`, `--sample:${sem.reality.SAMPLE.color}`, `--sample-t:${sem.reality.SAMPLE.tint}`)
  vars.push(`--fact:${sem.trustTier.FACT.color}`, `--fact-t:${sem.trustTier.FACT.tint}`, `--reasoning:${sem.trustTier.REASONING.color}`, `--reasoning-t:${sem.trustTier.REASONING.tint}`, `--boundary:${sem.trustTier.BOUNDARY.color}`, `--boundary-t:${sem.trustTier.BOUNDARY.tint}`)

  const glyph = (g: string) => `"${g}\\00a0"` // the glyph + a non-breaking space (the non-color cue prefix)

  return `/* ORGΛNON — the single committed stylesheet. GENERATED from data/honesty/design-tokens.json by
   script/build-stylesheet.ts — DO NOT hand-edit (a token change regenerates it; surface_system asserts determinism).
   Identity: COOL GRAPHITE + SIGNAL CYAN — a precision instrument, not a repo. Every semantic distinction carries a
   NON-COLOR cue (a ::before glyph, a border-style, or a weight) — never color alone. The facts are the loudest thing. */
:root{${vars.join(";")}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);font-size:${sc.body.size};line-height:${sc.body.lineHeight};font-weight:${sc.body.weight};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.wrap{max-width:var(--wrap-max);margin:0 auto;padding:var(--sp6) var(--wrap-pad) var(--sp7)}
a{color:var(--accent);text-decoration:none;transition:color var(--dur-fast) var(--ease)}
a:hover{color:var(--ink);text-decoration:underline;text-underline-offset:3px}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:var(--r-sm)}
::selection{background:var(--accent);color:var(--accent-ink)}

/* ── the persistent chrome: a slim instrument bar carrying the ORGΛNON Λ wordmark (a TEXT-FREE svg, so the content
   signature is byte-untouched — S36; the accessible name rides an aria-label attribute the signature strips). ── */
.topbar{position:sticky;top:0;z-index:var(--z-topbar);background:var(--bg);border-bottom:1px solid var(--border)}
.bar-inner{max-width:var(--wrap-max);margin:0 auto;height:52px;display:flex;align-items:center;padding:0 var(--wrap-pad)}
.brand{display:inline-flex;align-items:center;color:var(--ink)}
.brand:hover{color:var(--ink);text-decoration:none}
.brand .mark{width:24px;height:24px;display:block}
.brand:hover .mark{transform:translateY(-1px);transition:transform var(--dur) var(--ease)}

/* type scale — a real hierarchy, no flat type; the mono carries every figure */
h1{font-size:${sc.h1.size};font-weight:${sc.h1.weight};line-height:${sc.h1.lineHeight};letter-spacing:${sc.h1.letterSpacing};text-wrap:balance;margin:0 0 var(--sp3);display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp2) var(--sp3)}
h2{font-size:${sc.h2.size};font-weight:${sc.h2.weight};line-height:${sc.h2.lineHeight};letter-spacing:${sc.h2.letterSpacing};text-wrap:balance;margin:var(--sp6) 0 var(--sp3);padding-bottom:var(--sp2);border-bottom:1px solid var(--border)}
h3{font-size:${sc.h3.size};font-weight:${sc.h3.weight};line-height:${sc.h3.lineHeight};margin:var(--sp4) 0 var(--sp2)}
p,li{max-width:${ty.maxLineLength}}
code,pre,.mono{font-family:var(--mono)}
pre{white-space:pre-wrap;overflow-x:auto;font-size:${sc.small.size};background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp3);color:var(--ink-muted)}
.muted{color:var(--ink-muted);font-size:${sc.small.size}}
/* the FACTS are the loudest thing on the screen: a live figure is set in mono + full --ink + body size + tabular
   numerals, so the number pops OUT of the muted context that frames it. A markup-class change only — the number's text
   bytes are untouched (S36); the wrap makes the fact loud, it does not alter the fact. */
.num{font-family:var(--mono);color:var(--ink);font-weight:600;font-size:${sc.body.size};font-variant-numeric:tabular-nums;letter-spacing:-0.01em}
.eyebrow{font-size:${sc.eyebrow.size};font-weight:${sc.eyebrow.weight};letter-spacing:${sc.eyebrow.letterSpacing};text-transform:${sc.eyebrow.transform};color:var(--ink-faint)}

/* card — a single-level container; NO nested cards, NO side-tab accent. The answer surface FLOWS: long content wraps
   (overflow-wrap) and the page scrolls vertically — it is NEVER clipped by a fixed height (truncation fix; S43). */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:var(--sp4);margin:var(--sp3) 0;overflow-wrap:anywhere}
.card h3{margin:0 0 var(--sp1)}
/* the lead statement (the one-liner verdict summary) reads as the loudest prose on the Reality Check */
.card.lead{background:var(--surface2);border-color:var(--border-strong);font-size:${sc.h3.size};line-height:1.45}

/* ── THE SHELF as a triage board: each card is a scannable row — the strategy name + its verdict pill + REAL/SAMPLE
   badge on the header line, the facts loud below. The verdict class tints the whole row's frame (a FULL border, never a
   side-tab) so the board scans by state; the honest UNVERIFIED majority stays quiet, AVOID/CAUTION lift forward. ── */
.card.srow{padding:var(--sp3) var(--sp4)}
.card.srow h3{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp2) var(--sp3);font-size:${sc.h3.size}}
.card.srow h3 a{font-weight:640}
.card.srow:hover{border-color:var(--border-strong)}
.card.srow.v-AVOID{border-color:color-mix(in srgb,var(--v-AVOID) 42%,var(--border))}
.card.srow.v-CAUTION{border-color:color-mix(in srgb,var(--v-CAUTION) 34%,var(--border))}
.card.srow.v-SOLID{border-color:color-mix(in srgb,var(--v-SOLID) 30%,var(--border))}

/* verdict pill — a tinted chip; the WORD (in the HTML) + a ::before glyph + a weight = the non-color cue */
.pill{display:inline-flex;align-items:center;padding:var(--sp1) var(--sp3);border-radius:var(--r-pill);font-weight:700;font-size:${sc.micro.size};letter-spacing:${sc.micro.letterSpacing};border:1px solid currentColor;white-space:nowrap;flex:none}
.pill.SOLID{color:var(--v-SOLID);background:var(--v-SOLID-t)}.pill.SOLID::before{content:${glyph(sem.verdict.SOLID.glyph)}}
.pill.CAUTION{color:var(--v-CAUTION);background:var(--v-CAUTION-t)}.pill.CAUTION::before{content:${glyph(sem.verdict.CAUTION.glyph)}}
.pill.AVOID{color:var(--v-AVOID);background:var(--v-AVOID-t)}.pill.AVOID::before{content:${glyph(sem.verdict.AVOID.glyph)}}
.pill.UNVERIFIED{color:var(--v-UNVERIFIED);background:var(--v-UNVERIFIED-t)}.pill.UNVERIFIED::before{content:${glyph(sem.verdict.UNVERIFIED.glyph)}}
/* stamp pill — a distinct word-space from the verdict; its own glyphs */
.pill.GO{color:var(--s-GO);background:var(--s-GO-t)}.pill.GO::before{content:${glyph(sem.stamp.GO.glyph)}}
.pill.NOGO{color:var(--s-NO-GO);background:var(--s-NO-GO-t)}.pill.NOGO::before{content:${glyph(sem.stamp["NO-GO"].glyph)}}
.pill.INSUFFICIENT{color:var(--s-INSUFFICIENT);background:var(--s-INSUFFICIENT-t)}.pill.INSUFFICIENT::before{content:${glyph(sem.stamp.INSUFFICIENT.glyph)}}
.pill.UNAVAILABLE{color:var(--s-UNAVAILABLE);background:var(--s-UNAVAILABLE-t)}.pill.UNAVAILABLE::before{content:${glyph(sem.stamp.UNAVAILABLE.glyph)}}
/* contract sub-axis tier pill (categorical — was an inline style) */
.pill.FLAGGED{color:var(--v-CAUTION);background:var(--v-CAUTION-t)}.pill.FLAGGED::before{content:"!\\00a0"}
.pill.CLEANSTRUCTURE{color:var(--v-SOLID);background:var(--v-SOLID-t)}.pill.CLEANSTRUCTURE::before{content:${glyph(sem.verdict.SOLID.glyph)}}
.pill.tier-UNVERIFIED{color:var(--v-UNVERIFIED);background:var(--v-UNVERIFIED-t)}.pill.tier-UNVERIFIED::before{content:${glyph(sem.verdict.UNVERIFIED.glyph)}}
/* depth sub-score pills (decay / ICIR tiers — the tier WORD is the cue; a sub-score, not a verdict, so no glyph) */
.pill.good{color:var(--v-SOLID);background:var(--v-SOLID-t)}
.pill.warn{color:var(--v-CAUTION);background:var(--v-CAUTION-t)}
.pill.neutral{color:var(--v-UNVERIFIED);background:var(--v-UNVERIFIED-t)}

/* REAL / SAMPLE badge — a ::before mark + a BORDER-STYLE cue (solid vs dashed) + the word */
.badge{display:inline-flex;align-items:center;font-size:${sc.micro.size};padding:var(--sp1) var(--sp2);border-radius:var(--r-sm);border:1px solid var(--border);font-weight:600;white-space:nowrap;flex:none}
.badge.REAL{color:var(--real);border-color:var(--real);border-style:solid}.badge.REAL::before{content:${glyph("●")}}
.badge.SAMPLE{color:var(--sample);border-color:var(--sample);border-style:dashed}.badge.SAMPLE::before{content:${glyph("○")}}

/* the split bar + confidence band (data viz — the widths stay inline, they encode data) */
.bar{display:flex;height:14px;border-radius:var(--r-sm);overflow:hidden;margin:var(--sp2) 0;border:1px solid var(--border)}
.bar .base{background:var(--real)}.bar .reward{background:var(--sample)}
.band{display:flex;align-items:center;gap:var(--sp2);margin:var(--sp2) 0}
/* the band's range track is a NEUTRAL rail: in a system whose thesis is "the only colors carry meaning", the range
   track carries no data (the anchor labels carry the values) — so it recedes to a neutral rule and the meaning-bearing
   color stays with the figures beside it (.num). */
.band .rng{flex:1;height:6px;background:var(--border-strong);border-radius:var(--r-sm);min-width:40px}

/* ── the scorecard axis rows: a scannable rail — the tier glyph is the left scan column (its SHAPE cue survives
   greyscale), the axis name leads, the plain reason sits below. Reads top-to-bottom as a column of pass/unknown marks. ── */
.axis{padding:var(--sp3) 0;border-top:1px solid var(--border)}
.axis:first-of-type{border-top:none}
.axis b{font-weight:620}
/* the per-axis tier glyph KEEPS its shape cue AND gains a verdict color + weight, so the scorecard SCANS as a vertical
   rail of pass/unknown marks. Every color pairing clears WCAG-AA on the ground (surface_a11y + the axis-tier assertion). */
.axis-tier{font-weight:700;margin-left:var(--sp1);font-family:var(--mono)}
.axis-tier.pass{color:var(--v-SOLID)}
.axis-tier.caution{color:var(--v-CAUTION)}
.axis-tier.fail{color:var(--v-AVOID)}
.axis-tier.unverified{color:var(--v-UNVERIFIED)}

/* the trust tiers (FACT / REASONING / BOUNDARY) — full borders (NO side-tab); the ANALYSIS eyebrow is REASONING's cue;
   BOUNDARY's dashed border is a non-color pattern cue */
.blk{margin:var(--sp2) 0;padding:var(--sp3) var(--sp3);border-radius:var(--r-md);border:1px solid var(--border);overflow-wrap:anywhere}
.blk.fact{background:var(--fact-t);border-color:var(--border-strong);font-weight:450}
.blk.fact::before{content:"✓\\00a0FACT";display:block;font-size:${sc.eyebrow.size};font-weight:${sc.eyebrow.weight};letter-spacing:${sc.eyebrow.letterSpacing};text-transform:uppercase;color:var(--fact);opacity:.7;margin-bottom:var(--sp1)}
.blk.analysis{background:var(--reasoning-t);border-color:var(--reasoning)}
.blk.boundary{background:var(--boundary-t);border-style:dashed;color:var(--ink-muted)}
.analysis-label{font-size:${sc.eyebrow.size};font-weight:${sc.eyebrow.weight};letter-spacing:${sc.eyebrow.letterSpacing};color:var(--reasoning);margin-bottom:var(--sp1);text-transform:uppercase}
.residual{margin-top:var(--sp2);font-size:${sc.small.size};font-style:italic;color:var(--ink-muted)}

/* controls — buttons + form fields (was inline); touch targets ≥ 40px */
.btn{display:inline-flex;align-items:center;min-height:40px;padding:var(--sp2) var(--sp4);border-radius:var(--r-md);border:1px solid var(--border-strong);background:var(--surface2);color:var(--ink);font-weight:600;font-size:${sc.body.size};cursor:pointer;transition:background var(--dur-fast) var(--ease),border-color var(--dur-fast) var(--ease)}
.btn:hover{background:var(--border);border-color:var(--ink-faint)}
.btn.primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn.primary:hover{background:var(--ink);border-color:var(--ink)}
.field{min-height:40px;padding:var(--sp2) var(--sp3);border-radius:var(--r-md);border:1px solid var(--border);background:var(--bg);color:var(--ink);font-size:${sc.body.size};transition:border-color var(--dur-fast) var(--ease)}
.field:focus{border-color:var(--accent);outline:none}
.field.grow{width:70%}
.field::placeholder{color:var(--ink-faint)}
.form{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp2);margin:var(--sp4) 0}
.reg-wrap{margin-left:var(--sp2);color:var(--ink-muted);font-size:${sc.small.size}}
.mt-sm{margin-top:var(--sp2)}

/* the filters row (a chip rail) + trust footer */
.filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--sp2) var(--sp3);margin:var(--sp4) 0;font-size:${sc.small.size};color:var(--ink-faint)}
.filters a{color:var(--ink-muted);padding:var(--sp1) var(--sp3);border:1px solid var(--border);border-radius:var(--r-pill);transition:border-color var(--dur-fast) var(--ease),color var(--dur-fast) var(--ease)}
.filters a:hover{color:var(--ink);border-color:var(--border-strong);text-decoration:none}
.trust{margin-top:var(--sp6);padding-top:var(--sp3);border-top:1px solid var(--border);color:var(--ink-faint);font-size:${sc.small.size};line-height:1.5}
details{margin-top:var(--sp2)}
details summary{cursor:pointer;color:var(--accent)}
details[open] summary{margin-bottom:var(--sp2)}

/* the provenance ledger — the timestamped moat rendered as an aligned mono ledger with a quiet left rule (a timeline),
   not a raw dump; the record is the product's spine, so it reads legibly. */
.prov ul{list-style:none;margin:var(--sp2) 0 0;padding:0 0 0 var(--sp3);border-left:1px solid var(--border)}
.prov li{max-width:none;font-family:var(--mono);font-size:${sc.small.size};color:var(--ink-muted);padding:var(--sp1) 0;position:relative}
.prov li::marker{content:""}

/* the Simple / Pro register toggle */
.pro{display:none}.pro-on .pro{display:block}
.reg-active{font-weight:700;color:var(--ink)}

/* motion — a reduced-motion collapse (never gate content on a transition) */
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}

/* responsive — fluid to the mobile breakpoint; a single column, no horizontal scroll */
@media (max-width:${lay.mobileBreakpoint}){
  .wrap{padding:var(--sp5) ${lay.wrapPadMobile} var(--sp6)}
  .bar-inner{padding:0 ${lay.wrapPadMobile}}
  h1{font-size:1.45rem}
  .field.grow{width:100%}
  .form{gap:var(--sp2)}
  .band{flex-wrap:wrap}
}
`
}

const css = buildCss()
const OUT_REL = "public/organon.css"
const outPath = path.join(PKG_ROOT, OUT_REL)
const CHECK = process.argv.includes("--check")

if (CHECK) {
  const committed = existsSync(outPath) ? readFileSync(outPath, "utf8") : ""
  if (committed !== css) { console.error(`✗ ${OUT_REL} is STALE — regenerate: bun run script/build-stylesheet.ts`); process.exit(1) }
  console.log(`✓ ${OUT_REL} reproduces from the pinned tokens (byte-identical)`)
} else {
  writeFileSync(outPath, css)
  console.log(`✓ wrote ${OUT_REL} (${css.length} bytes) from data/honesty/design-tokens.json`)
}
