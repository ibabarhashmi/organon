/**
 * ORGΛNON — Warranty Phase 3 (walk fix W1): render the CAPABILITY MATRIX into the README between the markers, VERBATIM
 * from Matrix.renderMarkdown() — so the advertised matrix can never drift from the code-derived truth (the doc-lie the
 * walk found: an abbreviated hand-written table). Deterministic + idempotent. Run: bun run script/render-matrix-readme.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Matrix } from "../src/studio/matrix"
import { Publication } from "../src/studio/publication"

const README = path.join(PKG_ROOT, "README.md")
const START = Publication.README_MATRIX_MARKER // <!-- CAPABILITY-MATRIX:START -->
const END = "<!-- CAPABILITY-MATRIX:END -->"
const src = readFileSync(README, "utf8")
const i = src.indexOf(START), j = src.indexOf(END)
if (i < 0 || j < 0) throw new Error("README matrix markers not found")
const block = `${START}\n${Matrix.renderMarkdown()}\n${END}`
const out = src.slice(0, i) + block + src.slice(j + END.length)
writeFileSync(README, out)
console.log(`README matrix rendered verbatim from Matrix.renderMarkdown() (${Matrix.rows().length} rows)`)
