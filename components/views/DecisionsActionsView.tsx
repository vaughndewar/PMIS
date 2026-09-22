"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserChip } from "@/components/shared/UserChip";
import { cn, formatDate } from "@/lib/utils";
import type { ActionStatus, DecisionStatus } from "@/lib/types";
import { CheckCircle2, Circle, CircleDot, AlertTriangle } from "lucide-react";

const DECISION_STATUS_VARIANT: Record<DecisionStatus, "amber" | "green" | "default"> = {
  Proposed: "amber",
  Decided: "green",
  Superseded: "default",
};

const ACTION_STATUS_ICON: Record<ActionStatus, React.ComponentType<{ className?: string }>> = {
  Open: Circle,
  InProgress: CircleDot,
  Done: CheckCircle2,
};

const ACTION_STATUSES: ActionStatus[] = ["Open", "InProgress", "Done"];

function isOverdue(dueDate: string, status: ActionStatus): boolean {
  return status !== "Done" && dueDate < new Date().toISOString().slice(0, 10);
}

export function DecisionsActionsView() {
  const decisions = useProjectStore((s) => s.decisions);
  const actionsLog = useProjectStore((s) => s.actionsLog);
  const updateActionStatus = useProjectStore((s) => s.updateActionStatus);

  const actionsByDecision = useMemo(() => {
    const map = new Map<string, typeof actionsLog>();
    for (const action of actionsLog) {
      if (action.sourceType !== "Decision" || !action.sourceId) continue;
      if (!map.has(action.sourceId)) map.set(action.sourceId, []);
      map.get(action.sourceId)!.push(action);
    }
    return map;
  }, [actionsLog]);

  const overdueCount = actionsLog.filter((a) => isOverdue(a.dueDate, a.status)).length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Decisions &amp; Actions Log</h2>
          <p className="text-sm text-slate-500">
            Records the decision owner, rationale, affected artifacts, and follow-up actions for each governance decision.
          </p>
        </div>
        {overdueCount > 0 && (
          <Badge variant="red"><AlertTriangle className="h-3.5 w-3.5" /> {overdueCount} overdue action{overdueCount > 1 ? "s" : ""}</Badge>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Decision Log</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {decisions.map((decision) => {
            const linkedActions = actionsByDecision.get(decision.id) ?? [];
            return (
              <div key={decision.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{decision.title}</p>
                  <Badge variant={DECISION_STATUS_VARIANT[decision.status]}>{decision.status}</Badge>
                </div>
                <p className="text-sm text-slate-600">{decision.description}</p>
                <p className="mt-1.5 text-xs text-slate-500"><span className="font-medium">Rationale:</span> {decision.rationale}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                  <span>{formatDate(decision.decisionDate)}</span>
                  <Badge variant="outline">{decision.affectedEntityType}{decision.affectedEntityId ? `: ${decision.affectedEntityId}` : ""}</Badge>
                  <div className="ml-auto"><UserChip userId={decision.decisionOwnerId} /></div>
                </div>
                {linkedActions.length > 0 && (
                  <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Follow-up actions</p>
                    {linkedActions.map((action) => {
                      const Icon = ACTION_STATUS_ICON[action.status];
                      return (
                        <div key={action.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <Icon className={cn("h-3.5 w-3.5 flex-none", action.status === "Done" ? "text-emerald-500" : "text-slate-400")} />
                          <span className={cn("flex-1", action.status === "Done" && "text-slate-400 line-through")}>{action.title}</span>
                          <span className={cn(isOverdue(action.dueDate, action.status) && "font-medium text-red-600")}>{formatDate(action.dueDate)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Actions</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {actionsLog.map((action) => (
            <div key={action.id} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm">
              <span className="flex-1 text-slate-700">{action.title}</span>
              <Badge variant="outline">{action.sourceType}</Badge>
              <span className={cn("w-20 flex-none text-xs", isOverdue(action.dueDate, action.status) ? "font-semibold text-red-600" : "text-slate-400")}>
                {formatDate(action.dueDate)}
              </span>
              <div className="w-28 flex-none"><UserChip userId={action.ownerId} /></div>
              <Select value={action.status} onValueChange={(v) => updateActionStatus(action.id, v as ActionStatus)}>
                <SelectTrigger className="h-7 w-28 flex-none text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
