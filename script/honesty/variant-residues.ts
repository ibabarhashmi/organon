/**
 * ORGΛNON — THE VARIANT SPRINT (V41), THE GATE: the residues + the disclosed capability count. NO NEW LAW (sixth sprint).
 * Emits data/honesty/variant-residues.json — the honest sweep: D80–D83 reserved (Operator-signed=false, LN5), MR13
 * (sixth sprint), the TRUE capability count (1 — the variant ledger; the three V40 owings are clean-up, the two dark
 * exercises are proof). NOT the gate itself (the gate is presented in the build log, never signed).
 *
 * Run: bun run script/honesty/variant-residues.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = path.join(PKG_ROOT, "data", "honesty")
const vp = JSON.parse(readFileSync(path.join(H, "variant-pins.json"), "utf8"))

const OUT = {
  protocol: "variant-residues",
  at: "2026-07-15",

  // D80–D83 — RESERVED, Operator-signed=false (LN5 — the agent NEVER signs the gate).
  deviations: {
    D80: { status: "RESERVED (Operator-signed=false)", what: vp.deviations.D80 },
    D81: { status: "RESERVED (Operator-signed=false)", what: vp.deviations.D81 },
    D82: { status: "RESERVED (Operator-signed=false)", what: vp.deviations.D82 },
    D83: { status: "RESERVED (Operator-signed=false)", what: vp.deviations.D83 },
  },

  // MR13 — MR9 carried a SIXTH sprint. Discharged-or-recorded-undischargeable (never silently dropped).
  mr13: {
    status: "RECORDED UNDISCHARGEABLE (not silently dropped)",
    what: "MR9 (the reachability/live-value ceiling) has been carried since V32. It is undischargeable by the AGENT: it turns on the Operator opening the tool (realLineageCount: 0). V41 removes the last remaining REASON not to author a second manifest (the variant ledger makes authoring a second variant produce something the first could not show); the remaining action is a human opening a door, which has never been a Phase. Recorded, not dropped (sixth sprint).",
  },

  // the TRUE capability count — 1 (the variant ledger), reported honestly (not a redefined 0, not an inflated count).
  capability: {
    count: 1,
    disclosed: ["THE VARIANT LEDGER (two authored variants side by side, chronological, each under its own independent Stamp with its own inline evidence, the cumulative search count between them, an authorship breakdown, and a DARK search price — a group-by over the moat that ranks nothing)"],
    cleanup: [
      "the census reconciliation DISPLAYED and folded into the Ship Gate (L-1, S161)",
      "the one open guard hole CLOSED (L-2, S162 — guardEfficacy 8/17 → 10/17)",
      "the degenerate 0.6-vs-0.6 PBO cross-check made INDEPENDENT and proven to DETECT (L-3, S163)",
    ],
    proof: [
      "the rider's enforcement EXERCISED in a DARK dry-run on real data (L-4, S164 — nothing lit)",
      "the capture verb's MARGINAL VALUE rendered (L-5, S165 — in captures)",
    ],
    note: "reported as 1 disclosed capability (the variant ledger); the other five items are the three V40 owings made mechanical + two dark-safety exercises — clean-up and proof, not new scored capability. Honest, not a Halt.",
  },

  // the dark search price — the D63 discipline: the memory is kept, the meter's light is OFF (A′ #2, RP-1).
  darkPrice: {
    lit: false,
    tag: "DARK-COMPUTE, NOT A VERDICT",
    rule: "the deflation for N searches is COMPUTED (the frozen sr0_deflated + the enforced rider) and stored as INGREDIENTS — NOT a rendered verdict — tagged DARK-COMPUTE NOT A VERDICT. familyN === 1 governs every live verdict. The day D63 is reversed, the meter lights over history already computed — zero rework. D63's reversal is the Operator's to make; the agent never makes it (the meter stays dark by the pen's own hand).",
  },

  // the last line — computed and unchanged.
  theNumber: {
    realLineageCount: 0,
    reachableHumans: 1,
    reachableHumansNote: "BY DESIGN under D51 (INSTRUMENT). The variant ledger is the first feature whose VALUE the Operator cannot see without authoring a SECOND manifest — the first feature that is also an INVITATION. The agent cannot open the door; it made the room behind it worth entering. That is the honest limit of what construction can do.",
  },
}

writeFileSync(path.join(H, "variant-residues.json"), JSON.stringify(OUT, null, 2) + "\n")
console.log("── THE RESIDUES ARE SWEPT (V41) ──────────────────────────────────")
console.log(`  D80–D83            : RESERVED (Operator-signed=false — LN5)`)
console.log(`  MR13               : ${OUT.mr13.status}`)
console.log(`  capability         : ${OUT.capability.count} disclosed (the variant ledger) + 3 owings + 2 proofs`)
console.log(`  dark price         : lit ${OUT.darkPrice.lit} (${OUT.darkPrice.tag})`)
console.log(`  realLineageCount   : ${OUT.theNumber.realLineageCount} · reachableHumans ${OUT.theNumber.reachableHumans} (BY DESIGN)`)
console.log("written: data/honesty/variant-residues.json")
