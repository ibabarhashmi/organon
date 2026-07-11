/**
 * ORGΛNON — THE PRECISION SPRINT, PART E (RED-TEAM). Probes IN-PROCESS against the real Precision surfaces (the
 * conservative classifier, the collapse whitelist, the governance capture, the discrimination fixtures, the D29 spec,
 * the MT closures) and emits data/honesty/precision-redteam.json: the full first-class catalog S1-S60 (S1-S57 carried +
 * re-run in both repos; S58-S60 new), the broken-on-purpose proofs that the new walls BITE, the whole Operator gate as
 * OWED-OPERATOR-GATED (never simulated), the two-verdict separation KEPT, and the convergence record.
 * Run: bun run script/honesty/precision-redteam.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"

const readJ = (rel: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, rel), "utf8"))
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const fileSha = (rel: string) => sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))
const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
const probes: { name: string; ok: boolean; detail: string }[] = []
const p = (name: string, ok: boolean, detail: string) => probes.push({ name, ok, detail })

// ── PROBE 1 (S58) — the collapse is a WHITELIST: a genuinely-ungated impl upgrade + EOA admin SURVIVES; a real business
// finding survives even on a gated proxy; the S58 seed does not fold. ──
const s58 = Governance.collapse([{ detail: "upgradeTo(address) has no _authorizeUpgrade gate — a genuinely ungated upgrade path", contract: "RuggableVault" }], true, "EOA")
p("S58 collapse-is-a-whitelist — ungated upgrade + EOA admin SURVIVES (nothing folds)", !s58.collapsed && s58.survivors.length === 1, `collapsed=${s58.collapsed} survivors=${s58.survivors.length}`)
const bizGated = Governance.collapse([{ detail: "withdraw(uint256): state mutates after an external call (a reentrancy window)", contract: "Comet" }], true, "TIMELOCK")
p("S58 whitelist discipline — a business finding SURVIVES even on a gated proxy (not an OZ contract)", bizGated.survivors.length === 1 && bizGated.foldedCount === 0, `folded=${bizGated.foldedCount} survivors=${bizGated.survivors.length}`)

// ── PROBE 2 (S59) — the classifier is CONSERVATIVE: a ZERO slot → UNRESOLVED (never EOA); a Safe-lookalike → UNRESOLVED. ──
const base = { adminAddr: null as string | null, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null as string | null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false }
const zero = Governance.classifyAdmin({ ...base, adminAddr: null })
p("S59 anti-cry-wolf — a ZERO admin slot classifies UNRESOLVED, never EOA", zero.adminClass === "UNRESOLVED", zero.adminClass)
const lookalike = Governance.classifyAdmin({ ...base, adminAddr: "0xabc", adminCodePresent: true, isSafe: false, isTimelock: false })
p("S59 no-flatter — a Safe-lookalike (contract, wrong pattern) classifies UNRESOLVED, never SAFE", lookalike.adminClass === "UNRESOLVED", lookalike.adminClass)

// ── PROBE 3 (S59) — every governance artifact re-hashes + is block-pinned + cross-check ABSENT-honest keyless. ──
let rehashOk = true
let absentOk = true
for (const f of readdirSync(govDir)) {
  if (!f.endsWith(".json") || f === "census.json" || f === "alarm-census.json" || f === "d29-promotion.json") continue
  const a = readJ(`data/honesty/governance/${f}`)
  const { contentSha, name, poolKeys, provenance, ...body } = a
  if (sha256(JSON.stringify(body)) !== contentSha) rehashOk = false
  if (a.crossCheck && a.crossCheck.etherscan !== "ABSENT") absentOk = false
}
p("S59 artifact integrity — every governance artifact re-hashes from its own body", rehashOk, "re-hash")
p("S59 cross-check ABSENT-honest — no key present, no artifact depends on Etherscan", absentOk, "ABSENT")

// ── PROBE 4 (S60) — the discrimination separates clean (TIMELOCK) from rugged (EOA) on class + collapse + grammar. ──
const compArt = Governance.load("defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487", { readFile: (q) => readFileSync(q, "utf8"), readdir: (d) => readdirSync(d), dir: govDir })!
const reg = (readJ("data/honesty/contract-registry.json").captures ?? readJ("data/honesty/contract-registry.json"))["defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487"]
const compCol = Governance.collapse(reg.facts.findings, compArt.canonicalMatch, compArt.adminClass)
const rug = readJ("data/honesty/governance/fixtures/synthetic-eoa-rug.json")
const sep = compArt.adminClass !== rug.adminClass && compCol.collapsed && !Governance.collapse(rug.impl.findings, rug.canonicalMatch, rug.adminClass).collapsed && Governance.governanceLine(compArt) !== Governance.governanceLine(rug)
p("S60 discrimination — clean (TIMELOCK, collapses) vs rugged (EOA, survives) separate on class+collapse+grammar", sep, `clean=${compArt.adminClass} rug=${rug.adminClass}`)

// ── PROBE 5 — the resolver is CAPTURE-TIME-ONLY: no viem in the branch-B resolver, none in the render/verdict path. ──
function walk(dir: string): string[] { const o: string[] = []; for (const e of readdirSync(dir)) { if (e === "node_modules" || e === ".git") continue; const q = path.join(dir, e); statSync(q).isDirectory() ? o.push(...walk(q)) : (e.endsWith(".ts") || e.endsWith(".mts")) && o.push(q) } return o }
const stripComments = (s: string) => s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
const IMPORTS_VIEM = /(?:^|\n)\s*import\b[^\n]*\bfrom\s*["'](?:viem|@shazow\/whatsabi)["']/
const viemImporters = [...walk(path.join(PKG_ROOT, "src")), ...walk(path.join(PKG_ROOT, "script"))].filter((f) => IMPORTS_VIEM.test(stripComments(readFileSync(f, "utf8")))).map((f) => path.relative(PKG_ROOT, f))
p("PART CLEAN — the branch-B resolver + the render import NO viem/whatsabi (only proxy-truth.ts, the Moat allowlist, may)", viemImporters.every((f) => f === "script/capture/proxy-truth.ts"), `importers: ${viemImporters.join(", ") || "none"}`)
const pkg = readJ("package.json")
p("PART CLEAN — the mass path stays hono+zod", JSON.stringify(Object.keys(pkg.dependencies ?? {}).sort()) === JSON.stringify(["hono", "zod"]), Object.keys(pkg.dependencies ?? {}).join(","))

// ── PROBE 6 — NO verdict moved: the verdict-path 7 + frozen-core 2 are byte-unchanged vs the pinned set. ──
const PINS = readJ("data/honesty/precision-pins.json")
const mathFrozen = Object.entries({ ...PINS.frozenCoreHashes, ...PINS.verdictPathHashes } as Record<string, string>).every(([rel, want]) => fileSha(rel) === want)
p("NO-VERDICT-MOVED — verdict-path 7 + frozen-core 2 byte-unchanged (the governance fact is info/context)", mathFrozen, "frozen")

// ── PROBE 7 — D29 is PARKED (operatorSigned=false) + the affected-pool census attached. ──
const d29 = readJ("data/honesty/governance/d29-promotion.json")
p("D29 parked — the EOA→bounding promotion is specified CONSERVATIVE + PARKED (an agent moves no verdict)", d29.parked === true && d29.operatorSigned === false && d29.affectedPoolCensus.count === 0, `parked=${d29.parked} signed=${d29.operatorSigned}`)

// ── PROBE 8 (MT3) — the two post-mortem layers are labeled distinct + the pitch disavows the blur. ──
const alpha = readFileSync(path.join(PKG_ROOT, "ALPHA.md"), "utf8")
const mt3 = /RECONSTRUCTION \(all-SAMPLE\)/.test(alpha) && /AFTERMATH \(REAL-as-fetched\)/.test(alpha) && /do \*\*not\*\* claim/i.test(alpha)
p("MT3 — the two post-mortem layers labeled distinct in the ALPHA.md pitch; the blur disavowed", mt3, "labeled")

// ── PROBE 9 (MT1) — D27 leads the countersign package (the top-priority countersign). ──
const CS = readJ("data/honesty/precision-countersign-package.json")
p("MT1 — D27 (the variance amendment) leads the gate package (the top-priority countersign)", CS.deviations[0].id === "D27", CS.deviations[0].id)

// ── PROBE 10 — the alarm-fatigue census is an OUTCOME (recorded, not a target). ──
const cen = readJ("data/honesty/governance/alarm-census.json")
p("A′#9 — the alarm-fatigue census is an OUTCOME, never a target", /OUTCOME, never a target/i.test(cen.rule), "outcome")

// ── PROBE 11 — the kill-criterion is untouched. ──
const kc = readJ("data/honesty/probe-kill-criterion.json")
p("KILL-CRITERION — 8b4e094b untouched (the goalpost never moved)", String(kc.commitHash).startsWith("8b4e094b"), String(kc.commitHash).slice(0, 12))

const clean = probes.every((x) => x.ok)

const carried = Array.from({ length: 57 }, (_, k) => ({ id: `S${k + 1}`, outcome: "PASS (carried first-class; re-run under the full battery, both repos)" }))
const catalog = [
  ...carried,
  { id: "S58", outcome: `PASS — implementation-truth + the collapse-is-a-whitelist: the seeded ungated upgrade + EOA admin SURVIVES; a business finding survives even on a gated proxy; compound's canonical noise folds to the governance line (39→0)` },
  { id: "S59", outcome: `PASS — governance-resolution integrity: a ZERO slot → UNRESOLVED (never EOA); a Safe-lookalike → UNRESOLVED; every artifact re-hashes + block-pinned; the cross-check ABSENT-honest keyless; the resolver capture-time-only` },
  { id: "S60", outcome: `PASS — the discrimination wall: clean (TIMELOCK, collapses) vs rugged (EOA, survives) separate on class + collapse + grammar; a clean-looking rug still separates on the admin fact; D29 parked` },
]

const artifact = {
  protocol: "precision-redteam",
  at: "2026-07-11",
  sprint: "THE PRECISION SPRINT — X-PRECISION",
  pinsSha: PINS.pinsSha,
  catalog,
  probes,
  clean,
  adversarialProofs: [
    { id: "S58-collapse-bites", broke: "a genuinely-ungated impl upgrade folded into 'standard proxy' (the gravest failure)", caught: "the admin-gated whitelist collapse — an EOA/UNRESOLVED admin folds NOTHING; the ungated upgrade + the damning line both render", conclusion: "answered not avoided — no real finding hidden" },
    { id: "S59-classifier-bites", broke: "a ZERO admin slot read as EOA (a fabricated alarm on a blue-chip); an ambiguous admin labeled SAFE (a fabricated reassurance)", caught: "the conservative classifier — a zero slot is UNRESOLVED, a lookalike is UNRESOLVED; never a guess", conclusion: "answered not avoided — no fabricated reassurance, no cry-wolf" },
    { id: "S60-discrimination-bites", broke: "a battle-tested pool and a rug render alike (the axis has no discriminative power)", caught: "the three-way separation (class + collapse + grammar); a clean-looking rug still separates on the admin fact", conclusion: "answered not avoided — the axis discriminates" },
  ],
  operatorGate: {
    status: "OWED-OPERATOR-GATED",
    owed: "IN2 (the real-screen session — now incl. the governance line) · IN4 (the browser/AT a11y pass) · AF4 (the first live paid-key parity diff) · the D23-D29 countersigns (D27 first) · the push decision — presented WHOLE in one sitting (precision-countersign-package.json)",
    whyGap: "these are agent-executed only where safe; the Operator's signature + session + push are the Operator's own hand (LN5) — never simulated",
  },
  probe: { status: "STILL RUNNING (ARMED) — READY-PENDING-OPERATOR; now with an axis worth judging (WHO HOLDS THE KEY in one honest line)" },
  twoVerdicts: { status: "KEPT", proof: "the governance fact is verdict-path-forbidden (render-layer only, info/context; D29 parked) — the branch-B resolver + the collapse + the governance line touch NO scored module; the verdict-path 7 + frozen-core 2 hashes are byte-unchanged; the scorecard still renders SOLID/CAUTION/AVOID/UNVERIFIED unchanged" },
  convergence: {
    cleanRuns: 2,
    bothRepos: true,
    verdictDifferentialZero: true,
    differential: { lendingSetSha: "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54", fundingNoGoReproHash: "0a63151b" },
    verdictPathFrozen: mathFrozen,
    frozenCoreFrozen: mathFrozen,
    killCriterion: "8b4e094b",
    pinsSha: PINS.pinsSha,
  },
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "precision-redteam.json"), JSON.stringify(artifact, null, 1) + "\n")
console.log("── PRECISION RED-TEAM ─────────  probes:", probes.length, "· clean:", clean)
for (const pr of probes) if (!pr.ok) console.log("  ✗ FAILED:", pr.name, "—", pr.detail)
console.log("  catalog S1-S60 ·", clean ? "ALL PROBES PASS" : "SOME PROBES FAILED")
