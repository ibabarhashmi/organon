/**
 * WALL — the DIFFERENTIAL ORACLE can JUDGE (Data-Plane Phase 0; Rules D-DIFF, A′#9). Before the port trusts the oracle,
 * the oracle must prove it judges a KNOWN, hand-verified fixture correctly, touching the old tree by nothing. Where the
 * frozen monorepo is absent (a fresh clone), the oracle is BLOCKED — an honest state, disclosed, never faked green
 * (the same discipline as the gitignored local-immutable data: absent ⇒ skip-and-disclose, present-but-wrong ⇒ fail).
 */
import { test, expect } from "bun:test"
import { runOracle, ORACLE_ROOT } from "../../script/oracle"

test("oracle: judges the hand-verified lending fixture correctly, leaving the old tree UNCHANGED", () => {
  const res = runOracle()
  if (res.blocked) {
    // fresh clone / no monorepo — disclose and pass (absence is honest; a faked pass would be a Halt)
    console.log(`oracle BLOCKED (disclosed): ${res.detail} [root ${ORACLE_ROOT}]`)
    expect(res.blocked).toBe(true)
    return
  }
  // present oracle: it MUST reproduce the hand computation AND leave the old tree byte-for-byte unchanged
  expect(res.statusBefore).toBe(res.statusAfter as string)
  expect(res.ok).toBe(true)
})
