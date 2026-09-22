"use client";

import {
  FileSignature,
  KanbanSquare,
  ListTree,
  GanttChartSquare,
  ShieldCheck,
  LineChart,
  Flame,
  Users,
  Boxes,
  ClipboardList,
  Gavel,
  UsersRound,
  BookOpen,
  FileBarChart,
  Sparkles,
} from "lucide-react";
import { useProjectStore, type ViewId } from "@/lib/store/useProjectStore";
import { cn } from "@/lib/utils";

const NAV: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { id: "charter", label: "Charter & Canvas", icon: FileSignature, group: "Initiate & Plan" },
  { id: "wbs", label: "WBS Explorer", icon: ListTree, group: "Initiate & Plan" },
  { id: "resources", label: "Resources & Capacity", icon: UsersRound, group: "Initiate & Plan" },
  { id: "board", label: "Board / List", icon: KanbanSquare, group: "Execute" },
  { id: "gantt", label: "Schedule & CPM Gantt", icon: GanttChartSquare, group: "Execute" },
  { id: "governance", label: "Governance & Change Control", icon: ShieldCheck, group: "Monitor & Control" },
  { id: "evm", label: "Finance & EVM Telemetry", icon: LineChart, group: "Monitor & Control" },
  { id: "risk", label: "Risk Heatmap & Register", icon: Flame, group: "Monitor & Control" },
  { id: "raid", label: "RAID — Issues & Assumptions", icon: ClipboardList, group: "Monitor & Control" },
  { id: "raci", label: "Stakeholders & RACI", icon: Users, group: "Monitor & Control" },
  { id: "decisions", label: "Decisions & Actions", icon: Gavel, group: "Govern & Learn" },
  { id: "statusReports", label: "Status Reports", icon: FileBarChart, group: "Govern & Learn" },
  { id: "lessons", label: "Lessons Learned", icon: BookOpen, group: "Govern & Learn" },
];

const GROUPS = ["Initiate & Plan", "Execute", "Monitor & Control", "Govern & Learn"];

export function Sidebar() {
  const activeView = useProjectStore((s) => s.activeView);
  const setActiveView = useProjectStore((s) => s.setActiveView);
  const portfolio = useProjectStore((s) => s.portfolio);
  const program = useProjectStore((s) => s.program);

  return (
    <aside className="flex h-full w-64 flex-none flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
          <Boxes className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">PMI WorkHub</p>
          <p className="truncate text-[11px] text-slate-400">Enterprise Work Management</p>
        </div>
      </div>

      <div className="border-b border-slate-100 px-4 py-3 text-[11px] leading-tight text-slate-400">
        <p className="truncate">
          Portfolio: <span className="text-slate-600">{portfolio.name}</span>
        </p>
        <p className="truncate">
          Program: <span className="text-slate-600">{program.name}</span>
        </p>
      </div>

      <div className="border-b border-slate-100 px-2 py-2.5">
        <button
          onClick={() => setActiveView("assistant")}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
            activeView === "assistant" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100"
          )}
        >
          <Sparkles className="h-4 w-4 flex-none" />
          AI Assistant
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map((group) => (
          <div key={group} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group}</p>
            <div className="space-y-0.5">
              {NAV.filter((n) => n.group === group).map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors",
                      active ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-none", active ? "text-violet-600" : "text-slate-400")} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
