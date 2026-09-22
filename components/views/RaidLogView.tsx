"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserChip } from "@/components/shared/UserChip";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import type { AssumptionStatus, IssuePriority, IssueStatus } from "@/lib/types";

const ISSUE_STATUS: IssueStatus[] = ["Open", "InProgress", "Resolved", "Closed"];
const ASSUMPTION_STATUS: AssumptionStatus[] = ["Unvalidated", "Validated", "Invalidated"];

const PRIORITY_VARIANT: Record<IssuePriority, "default" | "amber" | "red" | "blue"> = {
  Low: "blue",
  Medium: "default",
  High: "amber",
  Critical: "red",
};

const ASSUMPTION_STATUS_VARIANT: Record<AssumptionStatus, "amber" | "green" | "red"> = {
  Unvalidated: "amber",
  Validated: "green",
  Invalidated: "red",
};

export function RaidLogView() {
  const issues = useProjectStore((s) => s.issues);
  const assumptions = useProjectStore((s) => s.assumptions);
  const risks = useProjectStore((s) => s.risks);
  const dependencies = useProjectStore((s) => s.dependencies);
  const activities = useProjectStore((s) => s.activities);
  const updateIssue = useProjectStore((s) => s.updateIssue);
  const updateAssumption = useProjectStore((s) => s.updateAssumption);
  const [tab, setTab] = useState<"issues" | "assumptions" | "dependencies">("issues");

  const activityName = (id: string) => activities.find((a) => a.id === id)?.name ?? id;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">RAID Log — Issues &amp; Assumptions</h2>
        <p className="text-sm text-slate-500">
          <InfoTooltip text="RAID: Risks, Assumptions, Issues, and Dependencies — a consolidated log project teams maintain alongside the schedule and risk register.">
            RAID
          </InfoTooltip>{" "}
          tracking. Risks live in the dedicated Risk Heatmap &amp; Register ({risks.filter((r) => r.status === "Open").length} open); schedule Dependencies are visualized on the CPM Gantt.
        </p>
      </div>

      <div className="flex gap-1.5">
        {(["issues", "assumptions", "dependencies"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t} {t === "issues" ? `(${issues.length})` : t === "assumptions" ? `(${assumptions.length})` : `(${dependencies.length})`}
          </button>
        ))}
      </div>

      {tab === "issues" && (
        <Card>
          <CardHeader><CardTitle>Issue Log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{issue.title}</p>
                  <div className="flex flex-none items-center gap-1.5">
                    <Badge variant={PRIORITY_VARIANT[issue.priority]}>{issue.priority}</Badge>
                    <Select value={issue.status} onValueChange={(v) => updateIssue(issue.id, { status: v as IssueStatus })}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ISSUE_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{issue.description}</p>
                {issue.resolution && <p className="mt-1 text-xs text-emerald-700"><span className="font-medium">Resolution:</span> {issue.resolution}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>Raised {formatDate(issue.raisedDate)}</span>
                  {issue.dueDate && <span>Due {formatDate(issue.dueDate)}</span>}
                  {issue.linkedRiskId && <Badge variant="outline">Linked Risk: {issue.linkedRiskId}</Badge>}
                  <div className="ml-auto"><UserChip userId={issue.ownerId} /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "assumptions" && (
        <Card>
          <CardHeader><CardTitle>Assumption Log</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {assumptions.map((assumption) => (
              <div key={assumption.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Badge variant="outline">{assumption.category}</Badge>
                  <Select value={assumption.status} onValueChange={(v) => updateAssumption(assumption.id, { status: v as AssumptionStatus })}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSUMPTION_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-slate-700">{assumption.description}</p>
                <p className="mt-1 text-xs text-slate-500"><span className="font-medium">Impact if invalid:</span> {assumption.impactIfInvalid}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Badge variant={ASSUMPTION_STATUS_VARIANT[assumption.status]}>{assumption.status}</Badge>
                    Validate by {formatDate(assumption.validateByDate)}
                  </span>
                  <UserChip userId={assumption.ownerId} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "dependencies" && (
        <Card>
          <CardHeader><CardTitle>Schedule Dependencies (PDM)</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {dependencies.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span className="text-slate-700">{activityName(dep.predecessorId)} &rarr; {activityName(dep.successorId)}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Badge variant="outline">{dep.type}</Badge>
                  <span>{dep.lagDays >= 0 ? `+${dep.lagDays}d lag` : `${dep.lagDays}d lead`}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
