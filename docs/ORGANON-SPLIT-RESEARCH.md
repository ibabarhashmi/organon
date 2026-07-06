# ORGΛNON — Split-from-Sentinel Research (RESEARCH ONLY — for a FUTURE sprint)

> **A plan, not an action.** Per the Breadth-Rename sprint (Rule A-SPLIT), **nothing is split, extracted, or
> restructured** toward independence this sprint. This document maps the coupling, the seams, the standalone options,
> the risks, and a phased plan for a *future* split sprint. Grep-proven: no code was moved toward independence (§6).

---

## 1. The finding, in one line

**Organon is already ~95% independent of Sentinel.** The frozen validator, the Python sidecar, the DataProvider port
+ providers, the whole verdict path, and every gate built this engagement (grounding, firewall, signal library,
breadth pre-flight, two-failure-mode classifier) import **only `node:*` + each other** — *zero* Sentinel infra. The
**entire** coupling to Sentinel is a **single function**, and half of it is already Sentinel-free.

---

## 2. Coupling map — what Organon uses from Sentinel / OpenCode today

Measured by `grep "^import" src/organon/*.ts` and inspecting the generation path:

| Component | Depends on Sentinel? | Evidence |
|---|---|---|
| Frozen validator (6 `.py`) + sidecar | **No** | pure Python (numpy/scipy); invoked via `spawnSync(python)` |
| Verdict path (`funding_discriminate`, `neutralize`, `effective_n`, `rigor`) | **No** | Python; no Sentinel import |
| `src/organon/*` (frozen, grounding, firewall, signals, preflight) | **No** | import only `node:path`/`node:fs`/`node:crypto` + each other |
| `failure_mode.py`, `preflight.py`, `breadth_map.py` | **No** | import only the frozen sidecar |
| DataProvider port + providers (`src/data/`, freepit) | **No** | a self-contained port; the capture tier |
| **Generation front-end** (`Generator.invoke`) | **PARTIAL** | the **single** coupling — see below |

### The one coupling: `Generator.invoke` (`src/organon/generator.ts`)
```ts
if (model.startsWith("ollama/"))  return spawnSync(["ollama","run", …])          // ← NO Sentinel dependency (direct)
return spawnSync(["bun","run","…src/index.ts","run","--model", model, …])         // ← Sentinel CLI (opencode/* free models)
```
- **`ollama/*` branch** (local `qwen3-coder:480b-cloud`, $0): a **direct** `ollama run` — already Sentinel-free.
- **`opencode/*` branch** (hosted free tier `big-pickle`, `*-free`, $0): the only true coupling — it shells to the
  Sentinel CLI's `run` command, which routes through Sentinel/OpenCode's provider system (OpenCode Zen gateway).

That is the whole surface. Nothing else in Organon touches Sentinel.

---

## 3. Extraction seam — where a clean split cuts

There is **one** seam: the generation front-end. Abstract it behind a port:

```ts
interface Generator { generate(prompt: string, model: string): string }   // returns raw model text (parse-or-reject downstream)
```

Organon already treats generation as fire-and-forget text (parse-or-reject in `Generator.parse`, then the grounding
gate + firewall). So the port is trivial: **one method, string→string.** The verdict path never sees the model or the
generator — it receives only `{carry, forward, loadings, tier}` (the confabulation firewall). So the seam is clean by
construction: replacing the generation impl cannot touch the verdict path.

---

## 4. Standalone Organon + embedded free models — the options

| Option | What it is | Sentinel dependency | Effort |
|---|---|---|---|
| **A. Ollama-only** | ship the `ollama/*` branch only; local free models | **NONE** (already works today) | ~0 — it already runs |
| **B. Direct free-tier HTTP** | a small HTTP client to OpenCode Zen / OpenRouter-free, replacing the CLI shell-out | none (a ~50-line fetch client) | low |
| **C. Embed OpenCode runtime** | vendor OpenCode's model-routing as a library | heavy; licensing to check | high |

**Recommendation: A + B.** Ship ollama-only as the zero-dependency baseline (works now), and add a direct
free-tier HTTP client (Option B) for hosted breadth — both behind the `Generator` port. **Option C is unnecessary**
(the value is the free *models*, not OpenCode's whole stack).

- **Free-model routing without Sentinel:** Ollama exposes a local HTTP API (`/api/generate`) and a CLI (`ollama run`);
  OpenRouter and OpenCode Zen expose OpenAI-compatible `/chat/completions` with free-tier model ids. A ~50-line
  `fetch` client covers both — no OpenCode stack needed.
- **Packaging / licensing:** Organon's own code + the frozen sidecar are self-owned. Ollama is MIT + local. The
  hosted free tiers (OpenCode Zen / OpenRouter-free) are used over HTTP under their ToS (no redistribution of their
  models). Vendoring OpenCode (Option C) would require checking OpenCode's license — avoid it.

---

## 5. Risks + invariants the split MUST preserve

The split is **safe because the verdict path is already walled.** It must preserve, and a split proposal that breaks
any of these is flagged, not proposed:

1. **Frozen set byte-identical** — the 6 `.py` + loop wall move unchanged; their pinned shas travel with them.
2. **The determinism wall** — no live/model call in the verdict path. Today the generation front-end is the ONLY live
   call and it is *already* outside the verdict path (the firewall). The split preserves this by construction.
3. **The confabulation firewall** — the validator receives `{signal, data, tier}` only; the `Generator` port returns
   text that the grounding gate + firewall filter *before* any data reaches the engine. Unchanged by the split.
4. **The capture-tier / PIT boundary** — the DataProvider port + checksum-anchored capture move as-is (no Sentinel
   coupling).

**Why it's low-risk:** the split touches ONE function (`Generator.invoke`) behind ONE port. The 41-test suite + the
bar-calibration verdict hash (`37c1ca43c926`, `76ab941862fb`) are the byte-identical acceptance check — they must
reproduce in standalone Organon exactly.

---

## 6. Proposed phased plan for the FUTURE split sprint

- **Phase A — Seam.** Introduce the `Generator` port (`generate(prompt, model) → text`); refactor `Generator.invoke`
  to implement it (behavior-identical). Prove the 41 tests + verdict hashes unchanged. *(name-only-style refactor.)*
- **Phase B — Embed.** Add a standalone `Generator` impl: Ollama (local, works now) + a direct free-tier HTTP client
  (OpenCode Zen / OpenRouter-free). Config selects the impl; the Sentinel-CLI impl stays as one option.
- **Phase C — Package.** Extract Organon (`src/organon/`, `src/backtest/py/`, `src/data/`, the `.sh` scripts, `docs/`)
  into a standalone distributable with the frozen sidecar embedded and the free-model runtime optional. The verdict
  path is copied byte-for-byte.
- **Phase D — Verify.** Frozen set byte-identical; determinism wall + firewall intact; **the bar-calibration verdict
  hashes reproduce byte-for-byte** in standalone Organon (the acceptance gate); pre-flight + breadth map unchanged.

- **Estimated risk:** LOW. **Biggest unknown:** the hosted free-tier ToS/latency (mitigated by the ollama-only
  baseline that needs no hosted tier). **What makes it safe:** the verdict path is already 100% independent — only the
  generation front-end (one function, one port, half of it already Sentinel-free) is being de-coupled.

---

## 7. Nothing split this sprint (A-SPLIT, grep-proven)

No code was moved, extracted, or restructured toward independence: no new package, no `src/organon/` files relocated,
no `Generator` port introduced. This document is the sole deliverable. (`git status` shows only additions under
`src/organon/`, `src/backtest/py/`, `docs/`, tests, and the name-only rename — no extraction.)
