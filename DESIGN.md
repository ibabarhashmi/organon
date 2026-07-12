# ORGΛNON — Design System

> Authored with the `impeccable` skill as a **dev-time-only seam** (Surface sprint; identity re-pinned in the Redesign
> sprint). The machine-readable source of truth is `data/honesty/design-tokens.json` (hash-locked into the pins); this
> file is the human/agent-readable spec. The single stylesheet `public/organon.css` is BUILT from the tokens
> deterministically — never hand-edited.
>
> **Identity — cool graphite + signal cyan (Redesign, X-REDESIGN).** The Surface-era ground was GitHub-dark (`#0d1117`,
> blue accent) — trustworthy but anonymous. The palette was re-pinned to a truer neutral near-black (cool graphite,
> chroma ~0) with a single restrained **signal-cyan** brand accent — a precision instrument, not a repo. This was a
> **conscious re-pin via supersession** (`U-RESUPERSEDE`): the live token hash-lock moved to `redesign-pins.json`, the
> Surface record stays as history, and the **semantic green/amber/red/slate are byte-unchanged** (honesty-load-bearing).
> The content stayed byte-identical (S36), every pairing re-cleared WCAG-AA, the detector stayed clean.

## Product register

A **professional analytical tool**, not a marketing site: design *serves* the facts, it is never the product. The
voice is a senior DeFi quant researcher — security-first, precise, epistemically humble. The face reads the same way:
**serious, precise, trustworthy, quiet.** The name is the brief — ORGΛNON, Aristotle's *instrument of reason* (the Λ a
deliberate mark): an instrument, not a casino. The single loudest thing on every screen is **the facts**; everything
else recedes.

**Anti-references (never ship):** purple→blue gradients · neon "number-go-up" crypto tropes · Inter-for-everything ·
cards-nested-in-cards · side-tab accent borders · bounce/elastic motion · dark glows.

## Atmosphere & color character

A restrained near-monochrome **cool-graphite** ground (an instrument panel, read in a dim room; chroma ~0, not a
blue-tinted dark) with one calm **signal-cyan** brand accent for links/focus/primary actions, and a small number of
**purposeful semantic accents** — the only colors on the screen carry meaning. There is no decorative color. Green
reads verified/durable, amber reads caution/analysis, red reads avoid, slate reads unverified. Every semantic color is
paired with a **non-color cue** (a glyph, a border-style, or a weight) so the meaning survives greyscale and
colorblindness — because in an honesty-first tool, color-alone is both an accessibility failure and an honesty failure.

### Palette (sRGB hex; authored in OKLCH)

| Token | Hex | Use |
|---|---|---|
| bg | `#0b0d10` | page ground — cool graphite (chroma ~0) |
| surface | `#14171c` | cards, panels |
| surface2 | `#191d23` | raised / FACT tier |
| border | `#262b33` | hairlines |
| ink | `#e8ecf1` | primary text |
| inkMuted | `#9aa6b3` | secondary text (AA on bg) |
| accent | `#38d6c8` | links, focus — the one signal-cyan brand accent |

**Semantic (color + non-color cue):**
- **Verdict** — SOLID `#3fb950` ●, CAUTION `#d29922` ◐, AVOID `#f85149` ▲, UNVERIFIED `#9aa5b1` ○.
- **Stamp** — GO `#3fb950` ▲, NO-GO `#f85149` ▼, INSUFFICIENT `#d29922` ◔, UNAVAILABLE `#9aa5b1` —.
- **Reality** — REAL `#3fb950` ● + **solid** border, SAMPLE `#d29922` ○ + **dashed** border.
- **Trust tier** — FACT (ink, solid full border, ✓ eyebrow, heaviest), REASONING (amber, the rendered
  `ANALYSIS — not an engine fact` eyebrow, secondary), BOUNDARY (muted, **dashed** full border — the honest edge).

## Typography

One system sans in multiple weights for prose, paired on a contrast axis with a **mono** for metrics/numbers (a
legitimate sans⊕mono pairing — never two near-identical sans). A clear scale, no flat hierarchy: h1 `1.75rem/650`,
h2 `1.3rem/620`, h3 `1.05rem/620`, body `0.95rem/400` at `1.55` line-height, small `0.8rem`, micro `0.72rem`, eyebrow
`0.68rem/700` uppercase tracked. Prose capped at **72ch**. `text-wrap: balance` on headings.

## Layout & spacing

Single centered column, `max-width 900px`, `24px` pad (`16px` on mobile). A spacing scale (4·8·12·16·24·32·48) for
rhythm. **No cards-in-cards.** Flexbox for 1-D, grid only where 2-D. Fluid to a `560px` mobile breakpoint; touch
targets ≥ 40px; no horizontal scroll.

## Motion

Purposeful + minimal — a state change, never decoration. Durations `120–200ms`, easing `cubic-bezier(0.22,1,0.36,1)`
(ease-out, **no bounce/elastic**). Every transition has a `prefers-reduced-motion` collapse. No reveal gates content
visibility (a headless render must show the same facts).

## The honesty contract (the load-bearing design)

A restyle may change layout, type, color, spacing, and motion. It may **never** change a number, a label, a tier, a
verdict, a provenance mark, or which facts appear — the surface renders the *same* facts more legibly, never a friendlier
version of them. Non-color cues render via CSS keyed on the existing semantic classes, so the HTML **content is
byte-identical** before and after any restyle (S36). The honest degraded states — `UNVERIFIED`, `INSUFFICIENT`,
AI-off, empty shelf — are designed as **intentional** states, because "we can't confirm this" is the product's core
value, not an error to hide.
