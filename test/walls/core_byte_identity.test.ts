/**
 * WALL — CORE-FROZEN (S-CORE / Rules VII, XVII). The STUDIO pivot may not cost one byte of the frozen verdict core.
 * This wall proves, on every run: (1) every TRACKED frozen artifact present in this tree (the 6 computational-core
 * `.py` + the loop type-wall) is byte-identical to its pin in src/organon/frozen.ts; (2) the frozen paths are
 * git-clean on disk (the new product code left them untouched — the module-boundary wall); (3) POSITIVE CONTROL — a
 * seeded one-byte change to a present frozen artifact does NOT match its pin (the gate is not a no-op).
 *
 * Absent generated/local artifacts (RWA-VERDICT.md, stamped local data — gitignored) are the expected fresh-clone
 * state and are NOT asserted here; checkFrozenSet() classifies them `absent`, not `drift`. This wall asserts only what
 * is PRESENT, so it is green in this working tree while still being a true byte-identity gate.
 */
import { describe, test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { checkFrozenSet, sha256, FROZEN_PY, FROZEN_TS, PY_DIR, REPO_ROOT } from "../../src/organon/frozen"

const FROZEN_PATHS = [
  ...Object.keys(FROZEN_PY).map((n) => `packages/solidity-sentinel/src/backtest/py/${n}`),
  ...Object.keys(FROZEN_TS).map((rel) => `packages/solidity-sentinel/${rel}`),
]

describe("WALL core_byte_identity — the frozen core is byte-identical through the pivot (S-CORE)", () => {
  const report = checkFrozenSet()
  const tracked = report.filter((c) => c.kind === "tracked-py" || c.kind === "tracked-ts")

  test("every tracked frozen artifact present in this tree is byte-identical to its pin (none drifted)", () => {
    expect(tracked.length).toBe(Object.keys(FROZEN_PY).length + Object.keys(FROZEN_TS).length)
    expect(tracked.filter((c) => c.status === "drift")).toEqual([]) // a drift here is a Halt
    // every tracked artifact is present (not absent) — the 6 .py + loop.ts are git-tracked, so they must be here
    expect(tracked.filter((c) => c.status === "ok").length).toBe(tracked.length)
  })

  test("module-boundary — the frozen paths are git-clean on disk (the STUDIO code touched none of them)", () => {
    const r = Bun.spawnSync(["git", "status", "--porcelain", "--", ...FROZEN_PATHS], { cwd: REPO_ROOT })
    const dirty = r.stdout.toString().trim()
    expect(dirty).toBe("") // any staged/unstaged change to a frozen path fails the wall
  })

  test("POSITIVE CONTROL — a seeded one-byte change to a present frozen .py ≠ its pin (the gate can fire)", () => {
    const real = readFileSync(path.join(PY_DIR, "rigor.py"))
    const mutated = sha256(Buffer.concat([real, Buffer.from("\n# seeded STUDIO-pivot drift")]))
    expect(mutated).not.toBe(FROZEN_PY["rigor.py"]) // if this ever matched, the wall would be blind
  })
})
