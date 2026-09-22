"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/UserChip";
import { InfoTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function allocationHealth(pct: number): "green" | "amber" | "red" {
  if (pct <= 85) return "green";
  if (pct <= 100) return "amber";
  return "red";
}

const HEALTH_BAR: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function ResourcesView() {
  const resourceAllocations = useProjectStore((s) => s.resourceAllocations);
  const users = useProjectStore((s) => s.users);
  const activities = useProjectStore((s) => s.activities);

  const activeAssignmentCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of activities) {
      if (a.status === "InProgress" && a.assigneeId) {
        map.set(a.assigneeId, (map.get(a.assigneeId) ?? 0) + 1);
      }
    }
    return map;
  }, [activities]);

  const totalAllocatedHours = resourceAllocations.reduce((sum, r) => sum + r.weeklyCapacityHours * (r.allocationPercent / 100), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Resources &amp; Capacity</h2>
        <p className="text-sm text-slate-500">
          Team roster with{" "}
          <InfoTooltip text="Resource allocation: the percentage of a resource's available capacity dedicated to this project, used to detect over-allocation across concurrent work.">
            skills, capacity, and allocation
          </InfoTooltip>
          . Total committed: {totalAllocatedHours.toFixed(0)} hrs/week.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Team Roster</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {resourceAllocations.map((ra) => {
            const user = users.find((u) => u.id === ra.userId);
            const health = allocationHealth(ra.allocationPercent);
            const activeCount = activeAssignmentCount.get(ra.userId) ?? 0;
            return (
              <div key={ra.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                <Avatar userId={ra.userId} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                    <span className="text-xs text-slate-400">{ra.roleOnProject}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ra.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
                <div className="w-40 flex-none text-right">
                  <p className="text-xs text-slate-400">Allocation</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", HEALTH_BAR[health])} style={{ width: `${Math.min(100, ra.allocationPercent)}%` }} />
                    </div>
                    <span className="w-10 flex-none text-xs font-medium text-slate-600">{ra.allocationPercent}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {(ra.weeklyCapacityHours * (ra.allocationPercent / 100)).toFixed(0)}h / {ra.weeklyCapacityHours}h wk &middot; {activeCount} active task{activeCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
