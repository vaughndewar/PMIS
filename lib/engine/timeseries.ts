// Builds a cumulative PV / EV / AC time series (weekly buckets) for the EVM S-curve,
// derived from baselined activity schedule/budget and current actuals.

import type { Activity, Baseline } from "@/lib/types";
import type { EvmTimeSeriesPoint } from "@/lib/types";
import { addDays, daysBetween } from "@/lib/utils";

export function buildEvmTimeSeries(
  activities: Activity[],
  baseline: Baseline,
  asOfDate: string,
  bucketDays = 7
): EvmTimeSeriesPoint[] {
  if (activities.length === 0) return [];

  const snapshotByActivity = new Map(baseline.activitySnapshots.map((s) => [s.activityId, s]));

  const projectStart = activities.reduce((min, a) => (a.plannedStart < min ? a.plannedStart : min), activities[0].plannedStart);
  const projectFinish = activities.reduce((max, a) => (a.plannedFinish > max ? a.plannedFinish : max), activities[0].plannedFinish);
  const totalDays = daysBetween(projectStart, projectFinish);
  const bucketCount = Math.max(1, Math.ceil(totalDays / bucketDays));

  const points: EvmTimeSeriesPoint[] = [];

  for (let b = 0; b <= bucketCount; b++) {
    const date = addDays(projectStart, Math.min(b * bucketDays, totalDays));
    let cumulativePV = 0;
    let cumulativeEV = 0;
    let cumulativeAC = 0;

    for (const activity of activities) {
      const snapshot = snapshotByActivity.get(activity.id);
      const plannedStart = snapshot?.plannedStart ?? activity.plannedStart;
      const plannedFinish = snapshot?.plannedFinish ?? activity.plannedFinish;
      const plannedBudget = snapshot?.budget ?? activity.budget;
      const plannedDuration = Math.max(1, daysBetween(plannedStart, plannedFinish));

      // Planned Value: linear spread of planned budget across the baselined window, up to `date`.
      const elapsedIntoActivity = Math.min(Math.max(daysBetween(plannedStart, date), 0), plannedDuration);
      const pvFraction = elapsedIntoActivity / plannedDuration;
      cumulativePV += plannedBudget * pvFraction;

      // Earned Value and Actual Cost only accrue once we reach "today" (asOfDate);
      // for past buckets they follow the same linear ramp scaled by current % complete / actual cost,
      // approximating how earn/spend accrued historically.
      if (date <= asOfDate) {
        cumulativeEV += plannedBudget * (activity.percentComplete / 100) * pvFraction;
        cumulativeAC += activity.actualCost * pvFraction;
      } else {
        // Beyond "today", EV/AC hold at their current known totals (no future actuals yet).
        cumulativeEV += plannedBudget * (activity.percentComplete / 100);
        cumulativeAC += activity.actualCost;
      }
    }

    points.push({
      date,
      cumulativePV: Math.round(cumulativePV),
      cumulativeEV: Math.round(cumulativeEV),
      cumulativeAC: Math.round(cumulativeAC),
    });
  }

  return points;
}
