// Deterministic, code-computed governance checks. The assistant is instructed to call
// this instead of guessing at "stale", "missing", or "overdue" — every flag here is a
// plain fact derivable from the snapshot, not a model inference.

import type { ProjectSnapshot } from "./snapshot";

export interface GovernanceFlags {
  asOfDate: string;
  staleAssumptions: { id: string; description: string; validateByDate: string; daysOverdue: number }[];
  overdueActions: { id: string; title: string; ownerId: string; dueDate: string; daysOverdue: number }[];
  agingApprovals: { id: string; title: string; requestedDate: string; daysOpen: number }[];
  staleChangeRequests: { id: string; title: string; status: string; requestedDate: string; daysOpen: number }[];
  raciAccountabilityGaps: { wbsNodeId: string; name: string; accountableCount: number }[];
  highSeverityOpenRisks: { id: string; event: string; score: number }[];
  budgetDrift: { baselineVersion: string; baselineBudget: number; currentBudget: number; deltaAmount: number } | null;
  unresolvedIssuesByPriority: { priority: string; count: number }[];
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
}

export function computeGovernanceFlags(snapshot: ProjectSnapshot): GovernanceFlags {
  const { asOfDate } = snapshot;

  const staleAssumptions = snapshot.assumptions
    .filter((a) => a.status === "Unvalidated" && a.validateByDate < asOfDate)
    .map((a) => ({
      id: a.id,
      description: a.description,
      validateByDate: a.validateByDate,
      daysOverdue: daysBetween(a.validateByDate, asOfDate),
    }));

  const overdueActions = snapshot.actions
    .filter((a) => a.status !== "Done" && a.dueDate < asOfDate)
    .map((a) => ({
      id: a.id,
      title: a.title,
      ownerId: a.ownerId,
      dueDate: a.dueDate,
      daysOverdue: daysBetween(a.dueDate, asOfDate),
    }));

  const agingApprovals = snapshot.approvals
    .filter((a) => a.status === "Pending")
    .map((a) => ({
      id: a.id,
      title: a.title,
      requestedDate: a.requestedDate,
      daysOpen: daysBetween(a.requestedDate, asOfDate),
    }))
    .filter((a) => a.daysOpen > 5);

  const staleChangeRequests = snapshot.changeRequests
    .filter((cr) => cr.status === "Submitted" || cr.status === "UnderReview")
    .map((cr) => ({
      id: cr.id,
      title: cr.title,
      status: cr.status,
      requestedDate: cr.requestedDate,
      daysOpen: daysBetween(cr.requestedDate, asOfDate),
    }))
    .filter((cr) => cr.daysOpen > 7);

  const accountableCounts = new Map<string, number>();
  for (const entry of snapshot.raciEntries) {
    if (entry.role !== "A") continue;
    accountableCounts.set(entry.wbsNodeId, (accountableCounts.get(entry.wbsNodeId) ?? 0) + 1);
  }
  const workPackages = snapshot.wbsNodes.filter((n) => n.type === "WorkPackage");
  const raciAccountabilityGaps = workPackages
    .map((wp) => ({ wbsNodeId: wp.id, name: `${wp.code} ${wp.name}`, accountableCount: accountableCounts.get(wp.id) ?? 0 }))
    .filter((g) => g.accountableCount !== 1);

  const highSeverityOpenRisks = snapshot.risks
    .filter((r) => r.status === "Open" && r.probability * r.impact >= 12)
    .map((r) => ({ id: r.id, event: r.event, score: r.probability * r.impact }))
    .sort((a, b) => b.score - a.score);

  const activeBaseline = snapshot.baselines.find((b) => b.isActive) ?? null;
  const currentBudget = snapshot.activities.reduce((sum, a) => sum + a.budget, 0);
  const budgetDrift = activeBaseline && Math.abs(currentBudget - activeBaseline.totalScopeBudget) > 0.01
    ? {
        baselineVersion: activeBaseline.version,
        baselineBudget: activeBaseline.totalScopeBudget,
        currentBudget,
        deltaAmount: currentBudget - activeBaseline.totalScopeBudget,
      }
    : null;

  const priorityCounts = new Map<string, number>();
  for (const issue of snapshot.issues) {
    if (issue.status === "Resolved" || issue.status === "Closed") continue;
    priorityCounts.set(issue.priority, (priorityCounts.get(issue.priority) ?? 0) + 1);
  }
  const unresolvedIssuesByPriority = Array.from(priorityCounts.entries()).map(([priority, count]) => ({ priority, count }));

  return {
    asOfDate,
    staleAssumptions,
    overdueActions,
    agingApprovals,
    staleChangeRequests,
    raciAccountabilityGaps,
    highSeverityOpenRisks,
    budgetDrift,
    unresolvedIssuesByPriority,
  };
}
