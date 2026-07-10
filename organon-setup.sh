#!/usr/bin/env bash
# ORGΛNON · setup — THE WIZARD (Alpha Phase 4; X-STRANGER, S49). One command from a fresh clone to a working tool:
#   prerequisites (bun ≥ 1.3 · python3 · the sidecar venv, built here) → JS deps → the BYOK key wizard (masked paste,
#   per-provider live validation with an offline opt-out, the trains-on-prompts privacy flag shown where it applies,
#   .env written chmod 600) → doctor → launch offered. Skipping every key = keyless mode, which is FULLY functional
#   (deterministic answers; every verdict is the engine's either way — a key buys phrasing, never a different verdict).
# KEY SAFETY: pastes are masked (read -s), never echoed, never logged; validation calls never log bodies; .env is 600.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/organon-common.sh"

banner "setup — the alpha wizard"

# ── 1 · prerequisites ────────────────────────────────────────────────────────────────────────────────────────────
need bun
BUN_V="$(bun --version)"
case "$BUN_V" in
  1.[3-9]*|1.[1-9][0-9]*|[2-9]*) ok "Bun $BUN_V (>= 1.3)";;
  *) die "Bun $BUN_V is too old — need >= 1.3 (https://bun.sh)";;
esac

if command -v python3 >/dev/null 2>&1; then ok "python3 present ($(python3 --version 2>&1))"; else
  warn "python3 is not on PATH — the opt-in Stamp needs it; the core tool runs without it"
fi

# ── 2 · JS deps + the sidecar venv (delegated to the runner's setup — one implementation, AB3/AB4-fixed) ─────────
step "JS deps + the sidecar venv (idempotent)"
( cd "$REPO_ROOT" && bash organon.sh setup-deps ) || warn "setup step reported a gap above — doctor will restate it"

# ── 3 · the BYOK key wizard (all optional — Enter to skip any provider; skip all = keyless mode, fully functional) ──
ENV_FILE="$REPO_ROOT/.env"
step "AI keys (BYOK, optional). Pastes are MASKED and never logged. Enter to skip a provider."
[ -f "$ENV_FILE" ] && warn ".env exists — the wizard APPENDS only keys you paste now (existing lines are kept)"

OFFLINE=""
printf "  validate keys live against their providers? [Y/n] (n = offline opt-out, keys are saved unvalidated): "
read -r V || V="n"
case "$V" in n|N) OFFLINE=1; warn "offline opt-out — keys will be saved without a live check";; *) ok "live validation on (one minimal call per pasted key; bodies never logged)";; esac

ask_key() { # ask_key ENV_NAME "label" "privacy note (empty = none)"
  local name="$1" label="$2" privacy="$3" val=""
  printf "  %s — paste key (masked, Enter to skip): " "$label"
  read -rs val || val=""
  printf "\n"
  [ -z "$val" ] && { echo "    · skipped"; return 0; }
  if [ -n "$privacy" ]; then echo "    ⚠ privacy: $privacy"; fi
  printf "%s=%s\n" "$name" "$val" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  if [ -z "$OFFLINE" ]; then
    ( cd "$REPO_ROOT" && env "$name=$val" bun run script/validate-key.ts "$name" ) || warn "validation did not pass — the key is saved; doctor + the Ask console will state the honest degrade"
  else
    echo "    · saved unvalidated (offline opt-out)"
  fi
}

ask_key GROQ_API_KEY        "Groq (free tier, the wired default — llama-3.1-8b-instant)" ""
ask_key GOOGLE_AI_STUDIO_KEY "Google AI Studio (free)" "Google's FREE AI-Studio tier may use prompts for product improvement (trains-on-prompts). Prefer a paid/no-training route for anything sensitive — disclosed per the capability descriptor."
ask_key OPENAI_API_KEY      "OpenAI" ""
ask_key ANTHROPIC_API_KEY   "Anthropic (also set ANTHROPIC_MODEL in .env)" ""
ask_key DEFILLAMA_PRO_API_KEY "DeFiLlama Pro (paid DATA — deeper REAL facts, tier-stamped; never a different verdict)" ""

if [ -f "$ENV_FILE" ]; then
  chmod 600 "$ENV_FILE"
  ok ".env present · chmod 600 (keys are yours alone; gitignored; server-side env-only)"
else
  ok "no keys pasted — KEYLESS MODE: fully functional, deterministic; a paid key buys deeper facts and better phrasing, NEVER a different verdict"
fi

# ── 4 · doctor — the standing diagnostic (copy-pasteable into a bug report) ──────────────────────────────────────
step "doctor"
( cd "$REPO_ROOT" && bun run script/doctor.ts ) || warn "doctor found gaps — each line above states the exact cure"

banner "setup complete"
step "launch:  ./organon.sh launch     (the Reality Check → http://127.0.0.1:4444 — localhost by default)"
step "verify:  ./organon.sh verify     (the evidence bundle reproduces itself)"
step "battery: ./organon-studio-test.sh   (the CANONICAL battery)"
step "doctor:  ./organon.sh doctor     (re-run the diagnostic any time)"
