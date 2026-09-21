"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useCpmActivities } from "@/lib/store/selectors";
import { addDays, cn, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/tooltip";
import type { Activity, Dependency, DependencyType } from "@/lib/types";

const PX_PER_DAY = 9;
const ROW_HEIGHT = 34;
const LABEL_WIDTH = 260;

const DEP_COLOR: Record<DependencyType, string> = {
  FS: "#64748b",
  SS: "#0ea5e9",
  FF: "#f59e0b",
  SF: "#a855f7",
};

function laneY(index: number) {
  return index * ROW_HEIGHT + ROW_HEIGHT / 2;
}

export function GanttView() {
  const activities = useCpmActivities();
  const dependencies = useProjectStore((s) => s.dependencies);
  const focusAreaFilter = useProjectStore((s) => s.focusAreaFilter);
  const [hoveredDep, setHoveredDep] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...activities].sort((a, b) => (a.earlyStart ?? 0) - (b.earlyStart ?? 0)),
    [activities]
  );
  const visible = focusAreaFilter ? sorted.filter((a) => a.focusArea === focusAreaFilter) : sorted;
  const indexOf = useMemo(() => new Map(visible.map((a, i) => [a.id, i])), [visible]);

  const projectStart = useMemo(
    () => activities.reduce((min, a) => (a.plannedStart < min ? a.plannedStart : min), activities[0]?.plannedStart ?? ""),
    [activities]
  );

  const maxDay = useMemo(() => Math.max(1, ...activities.map((a) => a.earlyFinish ?? 0)), [activities]);
  const totalWeeks = Math.ceil(maxDay / 7) + 1;
  const chartWidth = totalWeeks * 7 * PX_PER_DAY;
  const chartHeight = visible.length * ROW_HEIGHT;

  const byId = useMemo(() => new Map(activities.map((a) => [a.id, a])), [activities]);

  function depPoints(dep: Dependency) {
    const pred = byId.get(dep.predecessorId);
    const succ = byId.get(dep.successorId);
    const predIdx = indexOf.get(dep.predecessorId);
    const succIdx = indexOf.get(dep.successorId);
    if (!pred || !succ || predIdx === undefined || succIdx === undefined) return null;

    const predES = pred.earlyStart ?? 0;
    const predEF = pred.earlyFinish ?? 0;
    const succES = succ.earlyStart ?? 0;
    const succEF = succ.earlyFinish ?? 0;

    const x1 = (dep.type === "SS" || dep.type === "SF" ? predES : predEF) * PX_PER_DAY;
    const x2 = (dep.type === "FS" || dep.type === "SS" ? succES : succEF) * PX_PER_DAY;
    const y1 = laneY(predIdx);
    const y2 = laneY(succIdx);
    return { x1, y1, x2, y2 };
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Schedule &amp; CPM Gantt</h2>
          <p className="text-sm text-slate-500">
            <InfoTooltip text="Critical Path Method: the sequence of activities with zero total float that determines the shortest possible project duration.">
              Critical Path
            </InfoTooltip>{" "}
            highlighted in red. Non-critical activities show{" "}
            <InfoTooltip text="Total Float (TF = LS - ES): the amount of time an activity can be delayed without delaying the project finish date.">
              Total Float
            </InfoTooltip>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <LegendDot color="#dc2626" label="Critical" />
          <LegendDot color="#8b5cf6" label="Non-critical" />
          {(Object.keys(DEP_COLOR) as DependencyType[]).map((t) => (
            <LegendDot key={t} color={DEP_COLOR[t]} label={t} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
        <div className="flex" style={{ minWidth: LABEL_WIDTH + chartWidth }}>
          {/* Sticky label column */}
          <div className="sticky left-0 z-10 flex-none border-r border-slate-200 bg-white" style={{ width: LABEL_WIDTH }}>
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400" style={{ height: 32 }}>
              Activity
            </div>
            {visible.map((a) => (
              <ActivityLabelRow key={a.id} activity={a} />
            ))}
          </div>

          {/* Scrollable timeline */}
          <div className="relative flex-1" style={{ width: chartWidth }}>
            {/* Week ruler */}
            <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50" style={{ height: 32, width: chartWidth }}>
              {Array.from({ length: totalWeeks }).map((_, w) => (
                <div
                  key={w}
                  className="flex-none border-r border-slate-200 px-1.5 text-[10px] leading-8 text-slate-400"
                  style={{ width: 7 * PX_PER_DAY }}
                >
                  {formatShortDate(addDays(projectStart, w * 7))}
                </div>
              ))}
            </div>

            <div className="relative" style={{ width: chartWidth, height: chartHeight }}>
              {/* Gridlines */}
              {Array.from({ length: totalWeeks }).map((_, w) => (
                <div key={w} className="absolute top-0 bottom-0 border-r border-slate-100" style={{ left: w * 7 * PX_PER_DAY }} />
              ))}

              {/* Dependency arrows */}
              <svg className="absolute left-0 top-0 overflow-visible" width={chartWidth} height={chartHeight}>
                <defs>
                  {(Object.keys(DEP_COLOR) as DependencyType[]).map((t) => (
                    <marker key={t} id={`arrow-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M0,0 L10,5 L0,10 z" fill={DEP_COLOR[t]} />
                    </marker>
                  ))}
                </defs>
                {dependencies.map((dep) => {
                  const pts = depPoints(dep);
                  if (!pts) return null;
                  const { x1, y1, x2, y2 } = pts;
                  const active = hoveredDep === dep.id;
                  return (
                    <path
                      key={dep.id}
                      d={`M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`}
                      fill="none"
                      stroke={DEP_COLOR[dep.type]}
                      strokeWidth={active ? 2.5 : 1.5}
                      strokeOpacity={active ? 1 : 0.55}
                      markerEnd={`url(#arrow-${dep.type})`}
                      onMouseEnter={() => setHoveredDep(dep.id)}
                      onMouseLeave={() => setHoveredDep(null)}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    />
                  );
                })}
              </svg>

              {/* Activity bars */}
              {visible.map((a, i) => {
                const es = a.earlyStart ?? 0;
                const ef = a.earlyFinish ?? 0;
                const tf = a.totalFloat ?? 0;
                const barLeft = es * PX_PER_DAY;
                const barWidth = Math.max(4, (ef - es) * PX_PER_DAY);
                return (
                  <div key={a.id} className="absolute" style={{ top: i * ROW_HEIGHT, left: 0, height: ROW_HEIGHT, width: chartWidth }}>
                    <div
                      title={`${a.name}\nES ${es} / EF ${ef}\nTotal Float: ${tf}d`}
                      className={cn(
                        "absolute flex items-center rounded-md text-[11px] font-medium text-white shadow-sm",
                        a.isCritical ? "bg-red-500" : "bg-violet-400"
                      )}
                      style={{ left: barLeft, width: barWidth, top: 7, height: ROW_HEIGHT - 14 }}
                    >
                      <div
                        className="h-full rounded-l-md bg-black/25"
                        style={{ width: `${a.percentComplete}%`, maxWidth: "100%" }}
                      />
                    </div>
                    {!a.isCritical && tf > 0 && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-300"
                        style={{ left: barLeft + barWidth, width: tf * PX_PER_DAY, height: 0 }}
                        title={`Total Float: ${tf} day(s)`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityLabelRow({ activity }: { activity: Activity }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-3" style={{ height: ROW_HEIGHT }}>
      {activity.isCritical && <span className="h-1.5 w-1.5 flex-none rounded-full bg-red-500" title="Critical path" />}
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{activity.name}</span>
      {!activity.isCritical && (activity.totalFloat ?? 0) > 0 && (
        <Badge variant="outline" className="flex-none text-[10px]">TF {activity.totalFloat}d</Badge>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
