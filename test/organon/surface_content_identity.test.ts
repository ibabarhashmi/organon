/**
 * ORGΛNON — THE SURFACE SPRINT, Phase 3 wall S36 (the honesty-preserving restyle; X-SURFACE e) + V4 (the rendered
 * ANALYSIS label). The gravest risk of a restyle is silently moving a fact — so the visible TEXT CONTENT of every screen
 * must be BYTE-IDENTICAL before/after the restyle (the golden was captured pre-restyle). A rounding / reorder / truncation
 * / dropped label / hidden SAMPLE mark changes the text signature and fails the wall. V4: the ANALYSIS label is RENDERED
 * adjacent in the REASONING block (a screenshot carries it), and a REASONING block never wears the FACT treatment.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { VoiceContract } from "../../src/ask/contract"
import { renderAllScreens, contentSig, sha256 } from "../../script/honesty/surface-content-golden"

const golden = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surface-content-golden.json"), "utf8")).golden as Record<string, { sha: string; len: number }>

test("S36 — the restyle is HONESTY-PRESERVING: every screen's visible text content is BYTE-IDENTICAL to the pre-restyle golden (no number/label/tier/verdict/mark moved)", () => {
  const screens = renderAllScreens()
  // every golden screen is still rendered + still content-identical
  for (const [name, g] of Object.entries(golden)) {
    expect(screens[name]).toBeDefined()
    const sig = contentSig(screens[name])
    expect({ name, sha: sha256(sig) }).toEqual({ name, sha: g.sha }) // byte-identical content, per screen
  }
})

test("S36 — the restyle changed PRESENTATION (the stylesheet is now the token-built one), proving it is a restyle, not a no-op", () => {
  // the rendered HTML now embeds the pinned token stylesheet (custom properties) — a real restyle
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toContain("--bg:") // the token custom properties are inlined (the new system)
  expect(shelf).toContain("--v-SOLID:") // the semantic tokens are present
  expect(shelf).not.toContain("border-left:3px") // the old side-tab is gone from the shipped surface
})

test("V4 — the ANALYSIS label is RENDERED adjacent in the REASONING block (screenshot-durable), and a REASONING block never wears the FACT treatment", () => {
  const html = Reality.renderAsk({
    query: "is aave-v3 USDC safe?", register: "pro", raw: false, aiStatus: { keyed: false, provider: null },
    blocks: [
      { tier: "FACT", text: "FACTBODY-durable base yield." },
      { tier: "REASONING", text: "REASONBODY-the catch is tail risk.", label: VoiceContract.ANALYSIS_LABEL },
      { tier: "BOUNDARY", text: "BOUNDBODY-not financial advice." },
    ],
    residual: VoiceContract.RESIDUAL_DISCLOSURE,
  })
  // the REASONING block renders with the ANALYSIS eyebrow adjacent to its body (both inside the analysis block)
  const analysisBlock = html.match(/<div class="blk analysis">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? ""
  expect(analysisBlock).toContain(VoiceContract.ANALYSIS_LABEL) // the visible label text is in the rendered output
  expect(analysisBlock).toContain("analysis-label") // rendered as the eyebrow, adjacent
  expect(analysisBlock).toContain("REASONBODY") // the label sits with the reasoning body
  // the FACT block carries ONLY the FACT body — a REASONING block in FACT clothing (the V4 threat) is a Halt
  const factBlock = html.match(/<div class="blk fact">(.*?)<\/div>/s)?.[1] ?? ""
  expect(factBlock).toContain("FACTBODY")
  expect(factBlock).not.toContain("REASONBODY")
  // the residual disclosure renders where a REASONING block appears (a distinctive substring — the full text is HTML-escaped)
  expect(html).toContain("the reasoning is not a verdict")
  expect(html).toMatch(/class="muted residual"/)
})

test("S36 — the SAMPLE mark and the verdict word survive the restyle (present in the rendered content, not hidden by a theme)", () => {
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toContain("SAMPLE") // the REAL/SAMPLE distinction is not dropped
  expect(shelf).toMatch(/class="badge SAMPLE"/) // still the semantic class (which carries the dashed-border + glyph cue)
  expect(shelf).toMatch(/class="pill (SOLID|CAUTION|AVOID|UNVERIFIED)"/) // the verdict pill still carries its semantic class
})
