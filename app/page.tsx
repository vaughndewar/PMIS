"use client";

import { useProjectStore } from "@/lib/store/useProjectStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CharterView } from "@/components/views/CharterView";
import { WbsExplorerView } from "@/components/views/WbsExplorerView";
import { BoardView } from "@/components/views/BoardView";
import { GanttView } from "@/components/views/GanttView";
import { GovernanceView } from "@/components/views/GovernanceView";
import { EvmDashboardView } from "@/components/views/EvmDashboardView";
import { RiskHeatmapView } from "@/components/views/RiskHeatmapView";
import { RaidLogView } from "@/components/views/RaidLogView";
import { RaciView } from "@/components/views/RaciView";
import { DecisionsActionsView } from "@/components/views/DecisionsActionsView";
import { ResourcesView } from "@/components/views/ResourcesView";
import { LessonsLearnedView } from "@/components/views/LessonsLearnedView";
import { StatusReportsView } from "@/components/views/StatusReportsView";
import { LockedEditIntercept } from "@/components/shared/LockedEditIntercept";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Home() {
  const activeView = useProjectStore((s) => s.activeView);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">

            {activeView === "charter" && <CharterView />}
            {activeView === "wbs" && <WbsExplorerView />}
            {activeView === "board" && <BoardView />}
            {activeView === "gantt" && <GanttView />}
            {activeView === "governance" && <GovernanceView />}
            {activeView === "evm" && <EvmDashboardView />}
            {activeView === "risk" && <RiskHeatmapView />}
            {activeView === "raid" && <RaidLogView />}
            {activeView === "raci" && <RaciView />}
            {activeView === "decisions" && <DecisionsActionsView />}
            {activeView === "resources" && <ResourcesView />}
            {activeView === "lessons" && <LessonsLearnedView />}
            {activeView === "statusReports" && <StatusReportsView />}
          </main>
        </div>
      </div>
      <LockedEditIntercept />
    </TooltipProvider>
  );
}
