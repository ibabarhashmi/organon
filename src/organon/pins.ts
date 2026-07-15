/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 1 (S169, D84): THE PINS IDENTITY ANCHOR — a hash compared to its own source.
 *
 * THE DIAGNOSIS (M-1): V41's header emitted a pinsSha that was a PARENT'S. The cause: claim.ts's currentPins() iterated a
 * FIXED list [family-pins, substance-pins, socket-pins] that was never advanced past V39 — so the pinsSha claim resolved to
 * family-pins.json (2c299b9e) for EVERY sprint since Family. The Ship Gate proved a real 40-hex hash (S143) but never that it
 * was THIS sprint's. X-REACH(a): a hash never compared to its own source file cannot fail on a stale value — a shape check
 * wearing an identity check's clothes.
 *
 * THE FIX: ONE head pointer (HEAD_FILE), and a self-hash. Pins.selfHash() recomputes sha256 of the pins file content MINUS its
 * pinsSha field — the exact quantity the pins builder wrote as the pinsSha field. So `matches` is TRUE iff the file is
 * self-consistent (unedited after Phase 0 — F-1/RP-1's freshness anchor), and the STORED value is THIS sprint's identity.
 * S169 (in Ship.gate) compares the EMITTED header pins-sha to selfHash().recomputed via TWO INDEPENDENT paths (the header via
 * currentPins→HEAD_FILE; the gate via a direct file read), so a stale head cannot make both agree on a wrong value. A
 * parent-pin emission (a prior head's sha) or a post-Phase-0 edit REFUSES the log — proven on the real emit path (RP-1).
 *
 * Pure: one file read, one hash. No network. No I/O beyond the read.
 */
import { readFileSync, readdirSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

export namespace Pins {
  const H = path.join(PKG_ROOT, "data", "honesty")

  // THE CURRENT HEAD — this sprint's pins file, PINNED. Advancing the arc moves this ONE constant. The fragility that caused
  // M-1 (a fixed list never advanced) is now STRUCTURALLY CAUGHT: even a stale HEAD_FILE cannot pass S169, because the gate
  // compares the emitted value to sha256 of THIS sprint's pins file read directly — two independent paths to the value.
  export const HEAD_FILE = "backfill-pins.json"

  export interface SelfHash { file: string; recomputed: string; stored: string; matches: boolean }

  // sha256 of the file content minus the pinsSha field — the self-consistency the pins builder wrote. `matches` iff the file
  // is self-consistent (unedited after it was pinned at Phase 0). This is BOTH the identity anchor (WHICH sprint's pins) and
  // the freshness anchor (UNEDITED since it was pinned).
  export function selfHash(fileName: string = HEAD_FILE): SelfHash {
    const j = JSON.parse(readFileSync(path.join(H, fileName), "utf8")) as Record<string, unknown> & { pinsSha: string }
    const { pinsSha, ...rest } = j
    const recomputed = sha256(JSON.stringify(rest))
    return { file: fileName, recomputed, stored: pinsSha, matches: recomputed === pinsSha }
  }

  // the head pins — this sprint's own pins file (pinsSha + carried + laws). Falls back to a chain of prior heads ONLY for a
  // pre-V42 checkout (clone stability); on THIS tree HEAD_FILE always exists and is returned first.
  export interface Head { pinsSha: string; carriedFromPinsSha?: string; carried: { newProductCapability: number; lawsThisSprint: string } }
  export function head(): Head | null {
    for (const f of [HEAD_FILE, "provenance-pins.json", "variant-pins.json", "ship-pins.json", "family-pins.json", "substance-pins.json", "socket-pins.json"]) {
      try { return JSON.parse(readFileSync(path.join(H, f), "utf8")) } catch { /* try the next */ }
    }
    return null
  }

  // S169 HARDENING (red-team) — HEAD_FILE must be the CHAIN TIP: no other pins file carries from it. This structurally
  // catches the M-1 RECURRENCE one sprint later — if a successor pins a new head but forgets to advance HEAD_FILE, the new
  // file's carriedFromPinsSha equals HEAD's pinsSha, so HEAD is no longer the tip and S169 refuses. Without this, a stale
  // HEAD_FILE would make BOTH the header and the gate read the same wrong file and agree on a stale pin (the exact defect).
  export function headIsChainTip(fileName: string = HEAD_FILE): { tip: boolean; supersededBy: string | null } {
    const head = JSON.parse(readFileSync(path.join(H, fileName), "utf8")) as { pinsSha: string }
    for (const f of readdirSync(H)) {
      if (!f.endsWith("-pins.json") || f === fileName) continue
      try {
        const j = JSON.parse(readFileSync(path.join(H, f), "utf8")) as { carriedFromPinsSha?: string }
        if (j.carriedFromPinsSha === head.pinsSha) return { tip: false, supersededBy: f }
      } catch { /* an unreadable pins file is skipped */ }
    }
    return { tip: true, supersededBy: null }
  }

  // S169 — the identity verdict for an EMITTED pins-sha (from the marker/header). It must equal sha256 of THIS sprint's pins
  // file, the file must be self-consistent (freshness), AND HEAD_FILE must be the chain tip (no stale head). A parent-pin
  // emission fails identity; a post-Phase-0 edit fails freshness; a not-advanced HEAD_FILE fails the tip check.
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }
  export function verifyEmitted(emitted: string, fileName: string = HEAD_FILE): Verdict {
    const sh = selfHash(fileName)
    if (!sh.matches) return { ok: false, reason: `${fileName} is NOT self-consistent — recomputed ${sh.recomputed.slice(0, 12)}… ≠ stored ${sh.stored.slice(0, 12)}…; the pins file was edited after Phase 0 without re-pinning (F-1/RP-1)` }
    const tip = headIsChainTip(fileName)
    if (!tip.tip) return { ok: false, reason: `${fileName} is NOT the chain tip — ${tip.supersededBy} carries from it; HEAD_FILE was not advanced to this sprint's head (the M-1 recurrence, caught structurally — X-REACH(a))` }
    if (emitted !== sh.recomputed) return { ok: false, reason: `the emitted pins-sha ${String(emitted).slice(0, 12)}… ≠ sha256(${fileName}) ${sh.recomputed.slice(0, 12)}… — a STALE (parent) pin; the header must carry THIS sprint's pins (M-1, S169/X-SHOWN(c))` }
    return { ok: true, detail: `emitted ${emitted.slice(0, 12)}… === sha256(${fileName}) ${sh.recomputed.slice(0, 12)}… (self-consistent, chain tip — this sprint's identity)` }
  }
}
