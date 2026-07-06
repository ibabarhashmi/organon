/**
 * ORGΛNON DATA-PLANE — capture transforms + the RWA BLOCKED-on-credential path (Data-Plane Phase 1; Rules D-LABEL,
 * A′#5, H-CLOCK). The parse is a PURE transform (raw provider JSON → an immutable SnapshotFile) — the network fetch
 * lives in the capture script, never on a verdict path (the determinism wall). A missed point is a GAP, never
 * interpolated; there is no smoothing code path. The RWA snapshot path is built and wired to FRED_API_KEY as an
 * Operator env var (a grep-wall keeps the key out of the tree); a keyless RWA read returns the BLOCKED state — never a
 * stale or fabricated payload.
 */
import { existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { DataPlane } from "./store"

export namespace DataPlaneCapture {
  // ── DefiLlama yields chart (credential-free): raw → SnapshotFile ──────────────────────────────────────────────────
  // shape: { status:"success", data:[ {timestamp:"ISO", tvlUsd, apy, apyBase, apyReward, ...}, ... ] }
  export interface DefiLlamaChart { status: string; data: Array<{ timestamp: string; tvlUsd: number | null; apyBase: number | null; apyReward: number | null }> }
  export function parseDefiLlamaChart(raw: DefiLlamaChart, key: string, url: string, capturedAt: number): DataPlane.SnapshotFile {
    if (raw.status !== "success" || !Array.isArray(raw.data)) throw new Error(`defillama chart for ${key}: unexpected shape (status=${raw.status})`)
    const points: DataPlane.SeriesPoint[] = raw.data
      .map((d) => ({ ts: Date.parse(d.timestamp), apyBase: d.apyBase, apyReward: d.apyReward, tvlUsd: d.tvlUsd }))
      .filter((p) => Number.isFinite(p.ts))
      .sort((a, b) => a.ts - b.ts)
    // GAP-HONEST: points are exactly what the source returned, de-duplicated by ts (keep the last), NEVER interpolated.
    // A missing day stays missing — the daily grid downstream simply has no step that day (H-CLOCK, extended).
    const byTs = new Map<number, DataPlane.SeriesPoint>()
    for (const p of points) byTs.set(p.ts, p)
    return { key, kind: "yield", source: "defillama:yields.llama.fi/chart", url, capturedAt, points: [...byTs.values()].sort((a, b) => a.ts - b.ts) }
  }

  // ── the RWA snapshot path — BLOCKED-on-credential (A′#5, D-LABEL, D-TWOWAY) ──────────────────────────────────────
  // The RWA discovery snapshot (data/snapshot) is FRED-gated at capture (the DGS3MO benchmark). We NEVER commit the key,
  // NEVER fabricate a payload, and NEVER return a stale one. If the key + snapshot are both present the path is READY;
  // otherwise it renders BLOCKED with the one-line Operator unblock. The pin STAYS NOT-YET regardless (zero re-pins).
  export interface RwaState { ready: boolean; reality: "REAL-PIT" | "BLOCKED"; reason: string; unblock: string }
  export function rwaSnapshotState(): RwaState {
    const hasKey = !!process.env.FRED_API_KEY && process.env.FRED_API_KEY.length > 0
    const snapshotDir = path.join(PKG_ROOT, "data", "snapshot")
    const hasSnapshot = existsSync(path.join(snapshotDir, "MANIFEST.json"))
    if (hasKey && hasSnapshot) {
      return { ready: true, reality: "REAL-PIT", reason: "FRED_API_KEY present AND data/snapshot present — the RWA path is READY (the two-way door can be walked)", unblock: "(none — ready)" }
    }
    const missing = [!hasKey ? "FRED_API_KEY (Operator env var, never committed)" : null, !hasSnapshot ? "data/snapshot/MANIFEST.json (the pinned discovery snapshot, gitignored)" : null].filter(Boolean)
    return {
      ready: false,
      reality: "BLOCKED",
      reason: `RWA BLOCKED-on-credential — missing: ${missing.join(" + ")}. The pin STAYS NOT-YET (zero re-pins). Never a stale or fabricated payload.`,
      unblock: "Operator: export FRED_API_KEY=<free key from fredaccount.stlouisfed.org>, then run the snapshot regeneration + the two-way-door byte-regen (Phase 3).",
    }
  }

  // a grep-wall helper: assert an FRED key literal never appears in a committed file (the driver + the wall use this)
  export const FRED_KEY_PATTERN = /FRED[_-]?API[_-]?KEY\s*[:=]\s*["'][0-9a-zA-Z]{16,}["']/
}
