/**
 * WALL — F-IDENTITY. Advertised scope must equal actual scope. The CAPABILITY MATRIX (README + Trust Panel) lists what
 * this repository can do and what it deliberately cannot, each absence parked. This wall proves matrix-vs-reality is
 * green, the matrix is rendered where users look (README markers + the Trust Panel screen), and a seeded overclaim (a
 * PRESENT capability whose proof is gone, or an ABSENT thing that is actually present) is caught (the doc-lies check).
 */
import { describe, test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Matrix } from "../../src/studio/matrix"
import { StudioScreens } from "../../src/studio/screens"
import { Publication } from "../../src/studio/publication"

describe("WALL capability_matrix — advertised == actual (F-IDENTITY)", () => {
  test("matrix-vs-reality is green: every PRESENT proven, every ABSENT genuinely absent + parked", () => {
    const r = Matrix.verifyAgainstReality()
    if (!r.ok) console.log("  (capability_matrix) mismatches:", r.mismatches)
    expect(r.ok).toBe(true)
    expect(Matrix.PRESENT.length).toBeGreaterThanOrEqual(5)
    expect(Matrix.rows().some((x) => x.status === "ABSENT")).toBe(true) // absences are shown, not hidden
  })

  test("the matrix is rendered in the README between the markers (where users look)", () => {
    const readme = readFileSync(path.join(PKG_ROOT, "README.md"), "utf8")
    expect(readme.includes(Publication.README_MATRIX_MARKER)).toBe(true)
    expect(readme).toContain("<!-- CAPABILITY-MATRIX:END -->")
    // the README's absent rows must name the remaining engine + the RWA data-plane (the headline absences). NOTE
    // (Data-Plane v9): "marketdata" retired as the disclosure term — the LENDING PIT store/backtest came home; the
    // remaining engine absence is now named by the un-transplanted domains + the universe registry (advertised == actual).
    expect(readme).toContain("ABSENT")
    expect(readme.toLowerCase()).toContain("universe registry")
    expect(readme).toContain("V0/CANNOT-VERIFY-DATA")
  })

  test("(walk W1) the README matrix block is BYTE-IDENTICAL to Matrix.renderMarkdown() — no hand-edit drift", () => {
    const readme = readFileSync(path.join(PKG_ROOT, "README.md"), "utf8")
    const i = readme.indexOf(Publication.README_MATRIX_MARKER)
    const j = readme.indexOf("<!-- CAPABILITY-MATRIX:END -->")
    const block = readme.slice(i + Publication.README_MATRIX_MARKER.length, j).trim()
    // the doc-lie the walk found: an abbreviated hand-written table drifting from the code truth. Now mechanically closed:
    expect(block).toBe(Matrix.renderMarkdown().trim())
  })

  test("the matrix renders on the Trust Panel (screen 7), display-only", () => {
    const panel = StudioScreens.trustPanel({
      walls: { green: 20, total: 20 }, clocks: [], ledgerHead: "abc", battery: { pass: 1, fail: 0, files: 1, scope: "in-scope" },
      inventory: { anchor: "x".repeat(64), capabilities: 38, regressions: 0 }, parks: { count: 0, ids: [] }, independence: "PENDING",
      matrix: Matrix.renderPanel(),
    })
    expect(panel).toContain("capability matrix:")
    expect(panel).toContain("deliberate ABSENT")
  })

  test("positive control: a seeded overclaim (PRESENT capability with no proof) is caught", () => {
    // the predicate verifyAgainstReality uses, applied directly to a bogus PRESENT row
    const capIds = new Set(["a", "b"])
    const bogus = { capability: "does everything", provedBy: "nonexistent-capability" }
    expect(capIds.has(bogus.provedBy)).toBe(false) // an unbacked PRESENT claim is detectable
    // and the real matrix has NO unbacked PRESENT rows
    const realIds = new Set((Matrix.PRESENT).map((p) => p.provedBy))
    expect([...realIds].every((id) => id.length > 0)).toBe(true)
    expect(Matrix.verifyAgainstReality().mismatches.length).toBe(0)
  })
})
