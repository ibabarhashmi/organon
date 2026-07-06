# First-contact runbook — the ten-minute operator step (Transplant Phase 2; L-2P, T-SERVE)

> **For the Operator.** DOORS-OPEN needs exactly one thing the agent cannot supply: a **genuine non-author second
> party**. This runbook makes that a ten-minute step. Tier-A walks never claim independence; a stranger acting here is
> the only key (L-2P). Their first contact is now **preservable before it happens** (served submissions survive a
> restart — see `SERVED-PERSISTENCE-MEMO.md`), so nothing they do evaporates.

## 0. One-time setup (2 min)

```
./organon-setup.sh                 # checks Bun + the sidecar venv
# sidecar venv (studio needs only numpy + scipy):
python3 -m venv src/backtest/py/.venv && src/backtest/py/.venv/bin/python -m pip install numpy scipy
bun install                        # hono, zod
```

## 1. Serve, behind a credential (1 min)

```
STUDIO_TOKEN="$(openssl rand -hex 12)"   # a fresh Bearer credential; hand it to the stranger out-of-band
STUDIO_TOKEN="$STUDIO_TOKEN" PORT=4321 bun run script/serve-studio.ts
# → ORGΛNON STUDIO served → http://localhost:4321  (mutating routes behind a Bearer credential)
```

Expose it (optional, for a remote stranger): a tunnel (`cloudflared tunnel --url http://localhost:4321` or similar).

## 2. Hand the stranger the ten-minute script (5 min)

1. **Load the URL** and open the **Trust Panel** — walls status, clock stamp-ages, ledger head, parks, and
   `independence: PENDING` (it stays PENDING until you, the stranger, act — the panel cannot flatter).
2. **Verify the frozen core** yourself: `bun -e 'import{checkFrozenSet}from"./src/organon/frozen";console.log(checkFrozenSet())'`
   — the six `.py` + `loop.ts` are byte-identical to the pins (you do not have to trust the builder's word).
3. **Submit a spec** via the SKILL.md quickstart (Bearer credential required):
   ```
   curl -X POST http://localhost:4321/studio/submit_spec \
     -H "Authorization: Bearer $STUDIO_TOKEN" -H "content-type: application/json" \
     -d '{"spec":{"family":"rwa-allocation","policy":"static","rebalance":{"trigger":"monthly"},
          "legs":[{"id":"usdc-t","weight":0.6},{"id":"usdc-c","weight":0.4}]},
          "authorClass":"human","authorId":"<your-name>","domain":"rwa","timestamp":1700000000000,
          "returns":[...your series...],"barsPerYear":365}'
   ```
   Read the **tier** in the response (`attestation.verdict` / `verifiability`). A refusal-shaped verdict
   (INSUFFICIENT-EVIDENCE / NO-GO) is the **expected, correct** state — zero powered verdicts, displayed with pride.
4. **Cross-check** the ledger: `curl http://localhost:4321/studio/export` — your submission is there, hash-chained.

## 3. Evidence capture — where it persists (2 min)

Served submissions persist to `data/studio/served-submissions.jsonl` (isolated from the authored ledger) and **survive
a restart** — verified in this sprint's rehearsal (below). To keep an out-of-band copy regardless:

```
curl -s http://localhost:4321/studio/export > first-contact-$(date +%F).json
```

Then, IF the stranger also ran `verify-v3` and submitted at an earned tier from a non-author environment, DOORS-OPEN's
sub-claims (EARNED-INDEPENDENT, EXTERNAL-TRUE) can be attested by you — the agent records them PENDING until then.

## Author rehearsal (Tier-A — NOT first contact)

This runbook was executed once by the author as a labeled Tier-A **rehearsal** (never a stand-in for the stranger,
L-2P). Evidence: `data/studio/phase2-runbook-rehearsal.json`. Result: submit → verdict `INSUFFICIENT-EVIDENCE`
(zero-powered, correct) → **process restart → `/studio/export` returned `count:1, chainOk:true` with the same spec hash
`b11ac6f8…`** — first contact survived the restart. The **W3-01 ↔ DOORS-OPEN intersection** is named in the operator
lane: first contact is preservable BEFORE it happens (T-SERVE), which is exactly what unblocks a truthful DOORS-OPEN.
