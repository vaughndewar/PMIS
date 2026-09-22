"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useCpmActivities } from "@/lib/store/selectors";
import { Avatar } from "@/components/shared/UserChip";
import { Badge } from "@/components/ui/badge";
import { ActivityDetailDialog } from "@/components/shared/ActivityDetailDialog";
import { cn, formatShortDate } from "@/lib/utils";
import type { Activity, ActivityStatus } from "@/lib/types";
import { Flame } from "lucide-react";

const COLUMNS: { id: ActivityStatus; label: string }[] = [
  { id: "NotStarted", label: "Not Started" },
  { id: "InProgress", label: "In Progress" },
  { id: "Blocked", label: "Blocked" },
  { id: "Complete", label: "Complete" },
];

const FOCUS_BADGE: Record<Activity["focusArea"], "violet" | "blue" | "green" | "amber" | "default"> = {
  Initiating: "blue",
  Planning: "violet",
  Executing: "green",
  MonitoringControlling: "amber",
  Closing: "default",
};

export function BoardView() {
  const activities = useCpmActivities();
  const focusAreaFilter = useProjectStore((s) => s.focusAreaFilter);
  const updateActivityStatus = useProjectStore((s) => s.updateActivityStatus);
  const [dragId, setDragId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = focusAreaFilter ? activities.filter((a) => a.focusArea === focusAreaFilter) : activities;

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-6">
      {COLUMNS.map((col) => {
        const items = filtered.filter((a) => a.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) updateActivityStatus(dragId, col.id);
              setDragId(null);
            }}
            className="flex w-72 flex-none flex-col rounded-xl bg-slate-50"
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{items.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
              {items.map((a) => (
                <div
                  key={a.id}
                  draggable
                  onDragStart={() => setDragId(a.id)}
                  onClick={() => setDetailId(a.id)}
                  className={cn(
                    "cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                    a.isCritical && "border-l-4 border-l-red-500"
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Badge variant={FOCUS_BADGE[a.focusArea]}>{a.focusArea.replace("MonitoringControlling", "M&C")}</Badge>
                    {a.isCritical && (
                      <span title="On critical path">
                        <Flame className="h-3.5 w-3.5 flex-none text-red-500" />
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-sm font-medium text-slate-800">{a.name}</p>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${a.percentComplete}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Avatar userId={a.assigneeId} />
                    <span className="text-[11px] text-slate-400">{formatShortDate(a.plannedFinish)}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="px-1 py-6 text-center text-xs text-slate-400">No activities</p>}
            </div>
          </div>
        );
      })}
      <ActivityDetailDialog activityId={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
    </div>
  );
}
