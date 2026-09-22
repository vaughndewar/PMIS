"use client";

import { useProjectStore } from "@/lib/store/useProjectStore";
import { Badge } from "@/components/ui/badge";
import { FOCUS_AREAS, type FocusArea } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";

const STATUS_STYLE: Record<ProjectStatus, { label: string; variant: "green" | "amber" | "red" | "default" }> = {
  OnTrack: { label: "On Track", variant: "green" },
  AtRisk: { label: "At Risk", variant: "amber" },
  OffTrack: { label: "Off Track", variant: "red" },
  Closed: { label: "Closed", variant: "default" },
};

export function Header() {
  const project = useProjectStore((s) => s.project);
  const focusAreaFilter = useProjectStore((s) => s.focusAreaFilter);
  const setFocusAreaFilter = useProjectStore((s) => s.setFocusAreaFilter);

  const statusStyle = STATUS_STYLE[project.status];

  return (
    <header className="flex-none border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-slate-900">{project.name}</h1>
            <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDate(project.startDate)} &rarr; {formatDate(project.endDate)} &middot; BAC {formatCurrency(project.bac)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-slate-100 px-6 py-2 overflow-x-auto">
        <span className="mr-2 flex-none text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Focus Area
        </span>
        <button
          onClick={() => setFocusAreaFilter(null)}
          className={cn(
            "flex-none rounded-full px-3 py-1 text-xs font-medium transition-colors",
            focusAreaFilter === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          All
        </button>
        {FOCUS_AREAS.map((fa) => (
          <button
            key={fa.id}
            onClick={() => setFocusAreaFilter(focusAreaFilter === fa.id ? null : (fa.id as FocusArea))}
            className={cn(
              "flex-none rounded-full px-3 py-1 text-xs font-medium transition-colors",
              focusAreaFilter === fa.id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {fa.label}
          </button>
        ))}
      </div>
    </header>
  );
}
