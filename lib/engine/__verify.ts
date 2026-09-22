// Standalone verification asserts for the CPM and EVM engines.
// Run with: npx tsx lib/engine/__verify.ts
import { runCpm, CpmCycleError } from "./cpm";
import { computeEvm } from "./evm";
import type { Dependency } from "@/lib/types";

function assertClose(actual: number, expected: number, label: string) {
  if (Math.abs(actual - expected) > 1e-6) {
    throw new Error(`FAIL ${label}: expected ${expected}, got ${actual}`);
  }
  console.log(`OK   ${label} = ${actual}`);
}

// --- CPM: classic textbook network ---
// A(3) -FS-> B(4) -FS-> D(2)
// A(3) -FS-> C(2) -FS-> D(2)
// Critical path is A-B-D (3+4+2=9); A-C-D is 3+2+2=7, float=2
{
  const activities = [
    { id: "A", durationDays: 3 },
    { id: "B", durationDays: 4 },
    { id: "C", durationDays: 2 },
    { id: "D", durationDays: 2 },
  ];
  const deps: Dependency[] = [
    { id: "d1", predecessorId: "A", successorId: "B", type: "FS", lagDays: 0 },
    { id: "d2", predecessorId: "A", successorId: "C", type: "FS", lagDays: 0 },
    { id: "d3", predecessorId: "B", successorId: "D", type: "FS", lagDays: 0 },
    { id: "d4", predecessorId: "C", successorId: "D", type: "FS", lagDays: 0 },
  ];
  const results = runCpm(activities, deps);
  assertClose(results.get("A")!.earlyStart, 0, "CPM A.ES");
  assertClose(results.get("B")!.earlyStart, 3, "CPM B.ES");
  assertClose(results.get("D")!.earlyFinish, 9, "CPM D.EF (project duration)");
  assertClose(results.get("C")!.totalFloat, 2, "CPM C.totalFloat");
  if (!results.get("A")!.isCritical) throw new Error("FAIL: A should be critical");
  if (!results.get("B")!.isCritical) throw new Error("FAIL: B should be critical");
  if (!results.get("D")!.isCritical) throw new Error("FAIL: D should be critical");
  if (results.get("C")!.isCritical) throw new Error("FAIL: C should not be critical");
  console.log("OK   CPM critical path = A-B-D");
}

// --- CPM: SS/FF with lag ---
{
  const activities = [
    { id: "X", durationDays: 5 },
    { id: "Y", durationDays: 5 },
  ];
  // Y starts 2 days after X starts (SS+2)
  const deps: Dependency[] = [
    { id: "d1", predecessorId: "X", successorId: "Y", type: "SS", lagDays: 2 },
  ];
  const results = runCpm(activities, deps);
  assertClose(results.get("Y")!.earlyStart, 2, "CPM SS+2 Y.ES");
}

// --- CPM: cycle detection ---
{
  const activities = [
    { id: "P", durationDays: 1 },
    { id: "Q", durationDays: 1 },
  ];
  const deps: Dependency[] = [
    { id: "d1", predecessorId: "P", successorId: "Q", type: "FS", lagDays: 0 },
    { id: "d2", predecessorId: "Q", successorId: "P", type: "FS", lagDays: 0 },
  ];
  try {
    runCpm(activities, deps);
    throw new Error("FAIL: expected CpmCycleError");
  } catch (e) {
    if (!(e instanceof CpmCycleError)) throw e;
    console.log("OK   CPM cycle detection throws CpmCycleError");
  }
}

// --- EVM: on-plan project ---
{
  const m = computeEvm({ pv: 100, ev: 100, ac: 100, bac: 1000 });
  assertClose(m.cv, 0, "EVM on-plan CV");
  assertClose(m.sv, 0, "EVM on-plan SV");
  assertClose(m.cpi, 1, "EVM on-plan CPI");
  assertClose(m.spi, 1, "EVM on-plan SPI");
  assertClose(m.eac, 1000, "EVM on-plan EAC");
}

// --- EVM: over budget, behind schedule ---
{
  const m = computeEvm({ pv: 200, ev: 150, ac: 180, bac: 1000 });
  assertClose(m.cv, -30, "EVM CV");
  assertClose(m.sv, -50, "EVM SV");
  assertClose(m.cpi, 150 / 180, "EVM CPI");
  assertClose(m.spi, 150 / 200, "EVM SPI");
  assertClose(m.eac, 1000 / (150 / 180), "EVM EAC");
  assertClose(m.etc, 1000 / (150 / 180) - 180, "EVM ETC");
  assertClose(m.vac, 1000 - 1000 / (150 / 180), "EVM VAC");
  assertClose(m.tcpi, (1000 - 150) / (1000 - 180), "EVM TCPI");
}

console.log("\nAll CPM and EVM engine verifications passed.");
