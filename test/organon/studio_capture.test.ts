/**
 * ORGΛNON STUDIO — the CAPTURE / ticking-clock battery (Phase 2; Rules L-TICK, H-CLOCK; CLOCKS-TICKING gate). Proves
 * stamps chain + verify, a domain with stamps renders TICKING and one without renders NOT TICKING, and — the point —
 * a retro-captured/tampered stamp cannot verify (nonce + self-sha), so a backfilled point is impossible by construction.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, appendFileSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Capture } from "../../src/studio/capture"

function freshFile(): string {
  return path.join(mkdtempSync(path.join(tmpdir(), "capture-")), "stamps.jsonl")
}
const T = 1_700_000_000_000

describe("capture — clocks tick, chained + nonce-anchored (L-TICK)", () => {
  test("three captures chain + verify; the domain renders TICKING with 3 stamps", () => {
    const svc = new Capture.Service(freshFile())
    for (let i = 0; i < 3; i++) svc.capture("lending", `payload-${i}`, T + i * 1000)
    expect(svc.freshCount("lending")).toBe(3)
    expect(svc.verify().ok).toBe(true)
    const st = svc.status("lending", T + 3000)
    expect(st.ticking).toBe(true)
    expect(st.stamps).toBe(3)
  })

  test("a domain with zero stamps renders NOT TICKING, plainly", () => {
    const svc = new Capture.Service(freshFile())
    expect(svc.status("funding", T).render).toContain("NOT TICKING")
  })

  test("POSITIVE CONTROL — a tampered stamp breaks the chain on load (fabrication caught)", () => {
    const f = freshFile()
    const svc = new Capture.Service(f)
    svc.capture("lending", "p0", T)
    svc.capture("lending", "p1", T + 1000)
    const lines = readFileSync(f, "utf8").split("\n").filter(Boolean)
    const s = JSON.parse(lines[0]); s.payloadSha = "tampered"; lines[0] = JSON.stringify(s) // rewrite a payload
    writeFileSync(f, lines.join("\n") + "\n")
    expect(() => new Capture.Service(f)).toThrow(/chain broken/)
  })

  test("POSITIVE CONTROL — a retro-captured stamp with NO nonce fails verification (never reconstructable)", () => {
    const f = freshFile()
    const svc = new Capture.Service(f)
    svc.capture("lending", "p0", T)
    // append a hand-built "retro" stamp lacking a real nonce
    const forged = { domain: "lending", capturedAt: T - 999999, nonce: "", payloadSha: "x", prevSha: svc.all()[0].selfSha, selfSha: "y" }
    appendFileSync(f, JSON.stringify(forged) + "\n")
    expect(() => new Capture.Service(f)).toThrow() // the retro stamp cannot verify — a backfilled point is impossible
  })
})
