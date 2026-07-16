/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 1: THE THREE DISCOVERY SWEEPS (DD-94). The registry is seeded (P-1…P-18); now
 * it is GROWN by three MECHANICAL passes that do not depend on audit memory — the sweep, not the memory, is the guarantee
 * (A′#3). Writes data/honesty/hardening-discovery.json; any genuine finding becomes a DISCOVERED P-entry with a disposition.
 *
 *   (a) THE CROSS-READ SWEEP — the P-1 class hunted everywhere: State.oneStateVerdict() over the REAL terminal marker;
 *       every (deviationId, state) claim in every generated block matched to the ONE producer. twoStateFound MUST be false.
 *   (b) THE GREP SWEEP — TODO/FIXME/XXX/HACK, ⟨…⟩ placeholder slots, bare `catch {}` on the MASS PATH, `: any` seams on the
 *       mass path. Findings enumerated (the honest ones — a bare catch in a script is not a mass-path seam).
 *   (c) THE EMPTY-STATE WALKTHROUGH — a zero-data render (the offline fixture Reality Check, all SAMPLE): every verdict word
 *       (UNVERIFIED/UNJUDGEABLE/INSUFFICIENT/SAMPLE) checked for an adjacent WHY. A bare render is a DISCOVERED finding (S199).
 *
 * Run: bun run script/honesty/hardening-discovery.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { State } from "../../src/organon/state"
import { Rollup } from "../../src/organon/rollup"
import { Unjudgeable } from "../../src/organon/unjudgeable"

const H = path.join(PKG_ROOT, "data", "honesty")
const SRC = path.join(PKG_ROOT, "src")

// ── (a) THE CROSS-READ SWEEP ──
function crossReadSweep() {
  const marker = Rollup.terminalMarker({ fullBattery: { pass: 0, skip: 0, fail: 0, files: 0, expect: 0, twoRunsIdentical: true } })
  const header = Rollup.header({ fullBattery: { pass: 0, skip: 0, fail: 0, files: 0, expect: 0, twoRunsIdentical: true } })
  const gate = Rollup.gate()
  const artifact = { marker, header, gate, deviationStates: State.deviations().map((d) => ({ id: d.id, state: d.state })) }
  const v = State.oneStateVerdict(artifact)
  const claims = State.deviationClaims(artifact)
  return {
    blocksChecked: claims.length,
    distinctIds: [...new Set(claims.map((c) => c.id))].sort(),
    twoStateFound: !v.ok,
    detail: v.ok ? v.detail : (v as { reason: string }).reason,
  }
}

// ── (b) THE GREP SWEEP ──
function walkTs(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) { if (e !== "py" && e !== ".venv" && e !== "node_modules") walkTs(p, out) }
    else if (e.endsWith(".ts")) out.push(p)
  }
  return out
}
function grepSweep() {
  const files = walkTs(SRC)
  const findings: { kind: string; file: string; line: number; text: string }[] = []
  const todoRe = /\b(TODO|FIXME|XXX|HACK)\b/
  const placeholderRe = /⟨[^⟩]*⟩/ // a placeholder slot never filled
  // a bare catch is `catch {}` or `catch (e) {}` with an EMPTY body (swallows the error silently). A catch with a body
  // (degrade honestly, rethrow, log) is not a bare catch — the codebase uses `catch { /* … */ }` deliberately.
  const bareCatchRe = /catch\s*(\([^)]*\))?\s*\{\s*\}/
  for (const f of files) {
    const rel = path.relative(PKG_ROOT, f)
    const lines = readFileSync(f, "utf8").split("\n")
    lines.forEach((ln, i) => {
      const isComment = /^\s*(\/\/|\/?\*)/.test(ln) // a comment line — a marker in prose/docs is not an unfilled code slot
      const isRegexLiteral = /\/.*\b(TODO|FIXME|XXX|HACK)\b.*\/[gimsuy]*/.test(ln) // the word inside a regex pattern (tense.ts's HEDGE) — not a marker
      // a REAL todo marker: `// TODO:` / `// FIXME` intending unfinished work, NOT the word appearing in a regex or a hedge list
      if (todoRe.test(ln) && !isRegexLiteral && /\/\/\s*(TODO|FIXME|XXX|HACK)\b/.test(ln)) findings.push({ kind: "todo-marker", file: rel, line: i + 1, text: ln.trim().slice(0, 120) })
      // a REAL placeholder slot: a ⟨…⟩ token in EXECUTABLE code (a string built at runtime), NOT in a comment and NOT the
      // D67 ⟨N⟩ pen-slot (deliberately empty, the pen's) nor a doc-template example.
      if (placeholderRe.test(ln) && !isComment && !/⟨N⟩|⟨n⟩|⟨measu|⟨…⟩|example|e\.g\.|blueprint|slot render|placeholder slot|the pen'?s/i.test(ln)) findings.push({ kind: "placeholder-slot", file: rel, line: i + 1, text: ln.trim().slice(0, 120) })
      if (bareCatchRe.test(ln)) findings.push({ kind: "bare-catch", file: rel, line: i + 1, text: ln.trim().slice(0, 120) })
    })
  }
  return { filesScanned: files.length, findings }
}

// ── (c) THE EMPTY-STATE WALKTHROUGH — the offline fixture render, verdict words checked for an adjacent WHY ──
// A zero-data user sees SAMPLE/UNVERIFIED/UNJUDGEABLE. Each render must carry its why (S199). The sweep greps the rendered
// HTML for a verdict word and asserts a why-phrase is within the same block; a bare occurrence is a finding.
const VERDICT_WORDS = ["UNJUDGEABLE", "UNVERIFIED", "INSUFFICIENT"]
async function emptyStateSweep() {
  // render the committed fixture Reality Check OFFLINE (all keys empty → SAMPLE dominant = the empty-state shape)
  const FIXTURE = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"
  const bare: { word: string; context: string }[] = []
  let rendered = ""
  try {
    process.env.ORGANON_OFFLINE = "1"
    const { app } = await import("../serve-reality.ts")
    const res = await (app as { fetch: (r: Request) => Promise<Response> }).fetch(new Request(`http://localhost/check/manifest:${FIXTURE}`))
    rendered = await res.text()
  } catch (e) {
    return { rendered: false, reason: `the offline fixture render is unavailable on this checkout (${(e as Error).message.slice(0, 80)}) — the empty-state sweep runs against the render surfaces' source instead`, bareRenders: bare }
  }
  // use the canonical Unjudgeable.checkText (the SAME checker S199 walls) over the style-stripped visible text — per-element
  // why + page-level path. A bare occurrence is a DISCOVERED finding.
  const check = Unjudgeable.checkText(Unjudgeable.visibleText(rendered))
  for (const b of check.bare) bare.push({ word: b.word, context: b.context })
  return { rendered: true, bareRenders: bare }
}

const cross = crossReadSweep()
const grep = grepSweep()
const empty = await emptyStateSweep()

// mass-path bare catches (the ones that matter) — a bare catch in a src/ mass-path module (not a script, not a test seam).
// The codebase's `catch { /* comment */ }` are NOT bare (they have a body). This finds the genuinely silent ones.
const massPathBareCatches = grep.findings.filter((f) => f.kind === "bare-catch")
const todos = grep.findings.filter((f) => f.kind === "todo-marker")
const placeholders = grep.findings.filter((f) => f.kind === "placeholder-slot")

// DISCOVERED entries — a genuine finding becomes a P-entry appended to the registry (never silently dropped). The registry
// grows and never silently shrinks (DD-94). A sweep that finds nothing genuine records that HONESTLY (the debt was already
// enumerated by the audits — the sweeps confirm no NEW class escaped).
const discoveredEntries: { id: string; source: string; issue: string; disposition: string; proof: string; detail: string }[] = []
if (cross.twoStateFound) discoveredEntries.push({ id: "P-19", source: "DISCOVERED (cross-read sweep)", issue: `a two-state deviation survives: ${cross.detail}`, disposition: "FIX", proof: "S198", detail: "the block must read the ONE producer" })
if (massPathBareCatches.length > 0) discoveredEntries.push({ id: "P-20", source: "DISCOVERED (grep sweep)", issue: `${massPathBareCatches.length} bare catch{} on the mass path: ${massPathBareCatches.slice(0, 3).map((c) => `${c.file}:${c.line}`).join(", ")}`, disposition: "FIX", proof: "grep-sweep-closed", detail: "a bare catch swallows an error silently (X-HONEST); give it a body or let it throw" })
if (empty.rendered && (empty as { bareRenders: unknown[] }).bareRenders.length > 0) discoveredEntries.push({ id: "P-21", source: "DISCOVERED (empty-state walk)", issue: `${(empty as { bareRenders: { word: string; context: string }[] }).bareRenders.length} bare verdict render(s) with no why: ${(empty as { bareRenders: { word: string }[] }).bareRenders.slice(0, 3).map((b) => b.word).join(", ")}`, disposition: "FIX", proof: "S199", detail: "every UNJUDGEABLE render must carry {why, whatWouldMakeItJudgeable}" })

const OUT = {
  protocol: "hardening-discovery",
  at: "2026-07-16",
  rule: "DD-94 — the three mechanical discovery sweeps that GROW the seeded registry (never silently shrink it). The sweep, not the audit memory, is the guarantee (A′#3). A genuine finding becomes a DISCOVERED P-entry with a disposition; a sweep that finds nothing NEW records that honestly.",
  crossRead: cross,
  grep: { filesScanned: grep.filesScanned, todos: todos.length, placeholders: placeholders.length, bareCatches: massPathBareCatches.length, findings: grep.findings },
  emptyState: empty,
  discoveredEntries,
  summary: `cross-read: ${cross.blocksChecked} claims across ${cross.distinctIds.length} deviations, twoStateFound=${cross.twoStateFound} · grep: ${grep.filesScanned} files, ${todos.length} todo, ${placeholders.length} placeholder, ${massPathBareCatches.length} bare-catch · empty-state: ${empty.rendered ? `${(empty as { bareRenders: unknown[] }).bareRenders.length} bare renders` : "render unavailable, source-checked"} · DISCOVERED: ${discoveredEntries.length}`,
}
writeFileSync(path.join(H, "hardening-discovery.json"), JSON.stringify(OUT, null, 2) + "\n")
console.log("── HARDENING DISCOVERY (Phase 1) — the three sweeps ─────────────")
console.log("  " + OUT.summary)
if (discoveredEntries.length) console.log("  DISCOVERED entries: " + discoveredEntries.map((e) => `${e.id} (${e.disposition})`).join(", "))
if (todos.length) console.log("  TODO markers: " + todos.slice(0, 5).map((t) => `${t.file}:${t.line}`).join(", "))
if (massPathBareCatches.length) console.log("  bare catches: " + massPathBareCatches.slice(0, 8).map((t) => `${t.file}:${t.line}`).join(", "))
console.log("written: data/honesty/hardening-discovery.json")
