#!/usr/bin/env bash
# ORGΛNON · run — CONSCIOUSLY GATED for the alpha (D22 door inventory, AH7).
# This wrapper belonged to the parked RWA pipeline (P0-1): the scripts it invoked
# (scripts/snapshot.ts · script/rwa-verdict.ts) do not exist in this tree — running the old wrapper crashed
# unconditionally. It now refuses honestly instead of crashing (a sentence, never a stack trace).
echo "✗ run: the RWA pipeline this wrapped is PARKED (P0-1) and its scripts are not in this tree."
echo "  The alpha tool lives behind ./organon.sh — try:"
echo "    ./organon.sh setup    (the wizard: deps · venv · BYOK keys · doctor)"
echo "    ./organon.sh launch   (the Reality Check → http://127.0.0.1:4444)"
echo "    ./organon.sh doctor   (the diagnostic block for bug reports)"
exit 1
