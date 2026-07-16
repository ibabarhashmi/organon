/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 5: THE GUARD AGGREGATE + THE SOCKET RE-VERIFICATION (S204, P-7/P-8).
 *
 * P-7 (S204): the mutation catalogue re-run across EVERY render surface in ONE pass — the aggregate guardEfficacy + the
 * per-surface breakdown + every uncaught mutation NAMED (the lower-bound caveat carried).
 * P-8: the Socket's protocol negotiation re-verified LIVE — the pinned range exercised against the REAL negotiate() (in-range
 * accepted; out-of-range LOUDLY refused, naming the range), three sprints after the V38 live spec check. The range is re-pinned.
 *
 * Run: bun run script/honesty/hardening-guard.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { GuardAggregate } from "../../src/organon/guardaggregate"
import { Socket } from "../../src/socket/server"

const agg = GuardAggregate.aggregate()

// P-8 — re-verify the protocol negotiation LIVE against the REAL negotiate() over the FULL pinned range + an out-of-range probe.
const inRange = Socket.SUPPORTED_VERSIONS.map((v) => ({ version: v, accepted: Socket.negotiate(v).ok }))
const outOfRange = Socket.negotiate("1999-01-01")
const socketReVerified = {
  supportedVersions: [...Socket.SUPPORTED_VERSIONS],
  liveVerifiedFlag: Socket.PROTOCOL_VERSIONS_VERIFIED,
  everyInRangeAccepted: inRange.every((r) => r.accepted),
  outOfRangeRefused: !outOfRange.ok,
  refusalNamesRange: !outOfRange.ok && (outOfRange as { refusal: string }).refusal.includes(Socket.SUPPORTED_VERSIONS[0]),
  transport: "MCP over stdio only — NO port, NO listener, NO daemon (a subprocess of the user's own agent)",
  rePinned: `the range [${Socket.SUPPORTED_VERSIONS.join(", ")}] re-exercised live against negotiate(); the newest (${Socket.SUPPORTED_VERSIONS[Socket.SUPPORTED_VERSIONS.length - 1]}) is served by default; an out-of-range version is refused LOUDLY, naming the range (S120/RP-5)`,
}

const OUT = {
  protocol: "hardening-guard",
  at: "2026-07-16",
  rule: "S204 (P-7/P-8) — the guard mutation catalogue across EVERY render surface in one pass (aggregate + per-surface + named holes + lower-bound caveat); the Socket protocol negotiation re-verified LIVE against the real negotiate() and the range re-pinned.",
  guardAggregate: agg,
  socketReVerified,
  summary: `guardEfficacy AGGREGATE ${agg.overall.rate} across ${agg.perSurface.length} surfaces [${agg.perSurface.map((s) => `${s.name} ${s.rate}`).join(", ")}], ${agg.uncaught.length} named holes; socket: ${inRange.filter((r) => r.accepted).length}/${inRange.length} in-range accepted, out-of-range refused=${socketReVerified.outOfRangeRefused}`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-guard.json"), JSON.stringify(OUT, null, 2) + "\n")
console.log("── HARDENING GUARD + SOCKET (Phase 5, S204) ──")
console.log("  " + OUT.summary)
console.log(`  doc surface: ${agg.perSurface.find((s) => s.name === "docs/README")!.rate} (a doc-shaped advice bait must be CAUGHT)`)
console.log(`  socket re-verified LIVE: in-range all-accepted=${socketReVerified.everyInRangeAccepted}, out-of-range refused-naming-range=${socketReVerified.refusalNamesRange}`)
console.log("written: data/honesty/hardening-guard.json")
