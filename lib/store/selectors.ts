"use client";

import { useMemo } from "react";
import { useProjectStore } from "./useProjectStore";
import { applyCpmToActivities } from "@/lib/engine/cpm";
import { computeEvm, type EvmMetrics } from "@/lib/engine/evm";
import { buildEvmTimeSeries } from "@/lib/engine/timeseries";
import type { Activity, WbsNode } from "@/lib/types";

/** Activities enriched with CPM (ES/EF/LS/LF/float/critical) fields. */
export function useCpmActivities(): Activity[] {
  const activities = useProjectStore((s) => s.activities);
  const dependencies = useProjectStore((s) => s.dependencies);
  return useMemo(() => applyCpmToActivities(activities, dependencies), [activities, dependencies]);
}

export function useActiveBaseline() {
  const baselines = useProjectStore((s) => s.baselines);
  return useMemo(() => baselines.find((b) => b.isActive) ?? null, [baselines]);
}

const TODAY = "2025-04-14"; // fixed "as of" date so the prototype's EVM story is stable

export function useEvmMetrics(): EvmMetrics {
  const activities = useProjectStore((s) => s.activities);
  const project = useProjectStore((s) => s.project);
  return useMemo(() => {
    const pv = activities.reduce((sum, a) => {
      if (a.plannedFinish <= TODAY) return sum + a.budget;
      if (a.plannedStart >= TODAY) return sum;
      const totalDays = Math.max(1, dayDiff(a.plannedStart, a.plannedFinish));
      const elapsed = Math.max(0, dayDiff(a.plannedStart, TODAY));
      return sum + a.budget * (elapsed / totalDays);
    }, 0);
    const ev = activities.reduce((sum, a) => sum + a.budget * (a.percentComplete / 100), 0);
    const ac = activities.reduce((sum, a) => sum + a.actualCost, 0);
    return computeEvm({ pv, ev, ac, bac: project.bac });
  }, [activities, project.bac]);
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
}

export function useEvmTimeSeries() {
  const activities = useProjectStore((s) => s.activities);
  const baseline = useActiveBaseline();
  return useMemo(() => {
    if (!baseline) return [];
    return buildEvmTimeSeries(activities, baseline, TODAY);
  }, [activities, baseline]);
}

export const EVM_AS_OF_DATE = TODAY;

export interface WbsRollupNode extends WbsNode {
  children: WbsRollupNode[];
  rolledUpBudget: number;
  rolledUpPercentComplete: number;
}

/** Builds the WBS tree with 100%-rule rollup: a parent's % complete is the budget-weighted average of children. */
export function useWbsTree(): WbsRollupNode[] {
  const wbsNodes = useProjectStore((s) => s.wbsNodes);
  return useMemo(() => buildWbsTree(wbsNodes), [wbsNodes]);
}

function buildWbsTree(nodes: WbsNode[]): WbsRollupNode[] {
  const byParent = new Map<string | null, WbsNode[]>();
  for (const node of nodes) {
    const key = node.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(node);
  }

  function build(node: WbsNode): WbsRollupNode {
    const childNodes = (byParent.get(node.id) ?? []).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    if (childNodes.length === 0) {
      return { ...node, children: [], rolledUpBudget: node.budget, rolledUpPercentComplete: node.percentComplete };
    }
    const children = childNodes.map(build);
    const rolledUpBudget = children.reduce((sum, c) => sum + c.rolledUpBudget, 0);
    const weightedComplete = children.reduce((sum, c) => sum + c.rolledUpPercentComplete * c.rolledUpBudget, 0);
    const rolledUpPercentComplete = rolledUpBudget > 0 ? weightedComplete / rolledUpBudget : 0;
    return { ...node, children, rolledUpBudget, rolledUpPercentComplete };
  }

  return (byParent.get(null) ?? [])
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    .map(build);
}

/** Verifies the 100% rule: sum of top-level control account budgets equals total scope budget. */
export function verifyHundredPercentRule(nodes: WbsNode[], totalBudget: number): boolean {
  const topLevel = nodes.filter((n) => n.parentId === null);
  const sum = topLevel.reduce((s, n) => s + n.budget, 0);
  return Math.abs(sum - totalBudget) < 0.01;
}
