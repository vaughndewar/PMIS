// Critical Path Method (CPM) engine — pure functions, no framework dependencies.
//
// Supports all four Precedence Diagramming Method (PDM) relationship types
// (FS, SS, FF, SF) with lead/lag offsets, cycle detection via topological
// sort, forward/backward pass, and float analysis.

import type { Activity, Dependency } from "@/lib/types";

export interface CpmActivityInput {
  id: string;
  durationDays: number;
}

export interface CpmResult {
  id: string;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalFloat: number;
  freeFloat: number;
  isCritical: boolean;
}

export class CpmCycleError extends Error {
  constructor(message = "Dependency network contains a cycle; CPM requires a DAG.") {
    super(message);
    this.name = "CpmCycleError";
  }
}

/** Topologically sort activity ids given the dependency edges. Throws CpmCycleError on a cycle. */
export function topologicalSort(
  activityIds: string[],
  dependencies: Dependency[]
): string[] {
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const id of activityIds) {
    adjacency.set(id, []);
    inDegree.set(id, 0);
  }
  for (const dep of dependencies) {
    if (!adjacency.has(dep.predecessorId) || !inDegree.has(dep.successorId)) continue;
    adjacency.get(dep.predecessorId)!.push(dep.successorId);
    inDegree.set(dep.successorId, (inDegree.get(dep.successorId) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);

  const order: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    for (const next of adjacency.get(current) ?? []) {
      const remaining = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }

  if (order.length !== activityIds.length) {
    throw new CpmCycleError();
  }
  return order;
}

/**
 * Compute ES/EF for a successor given one predecessor relationship.
 * Returns the constraint that this single edge imposes on the successor's start/finish.
 */
function forwardConstraint(
  dep: Dependency,
  predES: number,
  predEF: number,
  succDuration: number
): { minStart?: number; minFinish?: number } {
  switch (dep.type) {
    case "FS": // successor starts after predecessor finishes (+lag)
      return { minStart: predEF + dep.lagDays };
    case "SS": // successor starts after predecessor starts (+lag)
      return { minStart: predES + dep.lagDays };
    case "FF": // successor finishes after predecessor finishes (+lag)
      return { minFinish: predEF + dep.lagDays };
    case "SF": // successor finishes after predecessor starts (+lag)
      return { minFinish: predES + dep.lagDays };
  }
}

function backwardConstraint(
  dep: Dependency,
  succLS: number,
  succLF: number,
  predDuration: number
): { maxFinish?: number; maxStart?: number } {
  switch (dep.type) {
    case "FS": // predecessor must finish before successor starts (-lag)
      return { maxFinish: succLS - dep.lagDays };
    case "SS": // predecessor must start before successor starts (-lag)
      return { maxStart: succLS - dep.lagDays };
    case "FF": // predecessor must finish before successor finishes (-lag)
      return { maxFinish: succLF - dep.lagDays };
    case "SF": // predecessor must start before successor finishes (-lag)
      return { maxStart: succLF - dep.lagDays };
  }
}

export function runCpm(
  activities: CpmActivityInput[],
  dependencies: Dependency[]
): Map<string, CpmResult> {
  const ids = activities.map((a) => a.id);
  const byId = new Map(activities.map((a) => [a.id, a]));
  const order = topologicalSort(ids, dependencies); // throws CpmCycleError if not a DAG

  const predecessorsOf = new Map<string, Dependency[]>();
  const successorsOf = new Map<string, Dependency[]>();
  for (const id of ids) {
    predecessorsOf.set(id, []);
    successorsOf.set(id, []);
  }
  for (const dep of dependencies) {
    if (!byId.has(dep.predecessorId) || !byId.has(dep.successorId)) continue;
    predecessorsOf.get(dep.successorId)!.push(dep);
    successorsOf.get(dep.predecessorId)!.push(dep);
  }

  // ---- Forward pass: Early Start / Early Finish ----
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  for (const id of order) {
    const duration = byId.get(id)!.durationDays;
    const preds = predecessorsOf.get(id)!;
    let minStart = 0;
    let minFinishForActivity: number | null = null;

    for (const dep of preds) {
      const predES = es.get(dep.predecessorId)!;
      const predEF = ef.get(dep.predecessorId)!;
      const constraint = forwardConstraint(dep, predES, predEF, duration);
      if (constraint.minStart !== undefined) {
        minStart = Math.max(minStart, constraint.minStart);
      }
      if (constraint.minFinish !== undefined) {
        minFinishForActivity =
          minFinishForActivity === null
            ? constraint.minFinish
            : Math.max(minFinishForActivity, constraint.minFinish);
      }
    }

    let activityES = minStart;
    let activityEF = activityES + duration;

    if (minFinishForActivity !== null) {
      activityEF = Math.max(activityEF, minFinishForActivity);
      activityES = Math.max(activityES, activityEF - duration);
      activityEF = activityES + duration;
    }

    es.set(id, activityES);
    ef.set(id, activityEF);
  }

  const projectFinish = Math.max(0, ...Array.from(ef.values()));

  // ---- Backward pass: Late Start / Late Finish ----
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();
  for (const id of [...order].reverse()) {
    const duration = byId.get(id)!.durationDays;
    const succs = successorsOf.get(id)!;

    if (succs.length === 0) {
      // Terminal activity: late finish anchored to project finish.
      lf.set(id, projectFinish);
      ls.set(id, projectFinish - duration);
      continue;
    }

    let maxFinish: number | null = null;
    let maxStartForActivity: number | null = null;

    for (const dep of succs) {
      const succLS = ls.get(dep.successorId)!;
      const succLF = lf.get(dep.successorId)!;
      const constraint = backwardConstraint(dep, succLS, succLF, duration);
      if (constraint.maxFinish !== undefined) {
        maxFinish = maxFinish === null ? constraint.maxFinish : Math.min(maxFinish, constraint.maxFinish);
      }
      if (constraint.maxStart !== undefined) {
        maxStartForActivity =
          maxStartForActivity === null
            ? constraint.maxStart
            : Math.min(maxStartForActivity, constraint.maxStart);
      }
    }

    let activityLF = maxFinish === null ? projectFinish : maxFinish;
    let activityLS = activityLF - duration;

    if (maxStartForActivity !== null) {
      activityLS = Math.min(activityLS, maxStartForActivity);
      activityLF = activityLS + duration;
    }

    lf.set(id, activityLF);
    ls.set(id, activityLS);
  }

  // ---- Float analysis ----
  const results = new Map<string, CpmResult>();
  for (const id of ids) {
    const activityES = es.get(id)!;
    const activityEF = ef.get(id)!;
    const activityLS = ls.get(id)!;
    const activityLF = lf.get(id)!;
    const totalFloat = activityLS - activityES;

    // Free float: how much this activity can slip before delaying the ES of any successor.
    const succs = successorsOf.get(id)!;
    let freeFloat = totalFloat;
    if (succs.length > 0) {
      let minSlack: number | null = null;
      for (const dep of succs) {
        const succES = es.get(dep.successorId)!;
        let slack: number;
        if (dep.type === "FS") slack = succES - activityEF - dep.lagDays;
        else if (dep.type === "SS") slack = succES - activityES - dep.lagDays;
        else slack = totalFloat; // FF/SF measured via finish; approximate with total float
        minSlack = minSlack === null ? slack : Math.min(minSlack, slack);
      }
      freeFloat = minSlack === null ? totalFloat : Math.min(totalFloat, Math.max(0, minSlack));
    }

    results.set(id, {
      id,
      earlyStart: activityES,
      earlyFinish: activityEF,
      lateStart: activityLS,
      lateFinish: activityLF,
      totalFloat,
      freeFloat,
      isCritical: totalFloat <= 0,
    });
  }

  return results;
}

/** Convenience: apply CPM results onto full Activity objects, returning new objects. */
export function applyCpmToActivities(
  activities: Activity[],
  dependencies: Dependency[]
): Activity[] {
  const results = runCpm(
    activities.map((a) => ({ id: a.id, durationDays: a.durationDays })),
    dependencies
  );
  return activities.map((activity) => {
    const r = results.get(activity.id);
    if (!r) return activity;
    return {
      ...activity,
      earlyStart: r.earlyStart,
      earlyFinish: r.earlyFinish,
      lateStart: r.lateStart,
      lateFinish: r.lateFinish,
      totalFloat: r.totalFloat,
      freeFloat: r.freeFloat,
      isCritical: r.isCritical,
    };
  });
}

export function getCriticalPath(results: Map<string, CpmResult>): string[] {
  return Array.from(results.values())
    .filter((r) => r.isCritical)
    .map((r) => r.id);
}
