"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useWbsTree, verifyHundredPercentRule, type WbsRollupNode } from "@/lib/store/selectors";
import { Badge } from "@/components/ui/badge";
import { UserChip } from "@/components/shared/UserChip";
import { cn, formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";

const TYPE_BADGE = {
  ControlAccount: "violet",
  WorkPackage: "blue",
  Activity: "default",
} as const;

function WbsRow({ node, depth }: { node: WbsRollupNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const wbsDictionary = useProjectStore((s) => s.wbsDictionary);
  const dict = wbsDictionary.find((d) => d.wbsNodeId === node.id);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 border-b border-slate-100 py-2 pr-3 hover:bg-slate-50"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <button
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className={cn("flex h-4 w-4 flex-none items-center justify-center", !hasChildren && "opacity-0")}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </button>
        <span className="w-16 flex-none font-mono text-xs text-slate-400">{node.code}</span>
        <Badge variant={TYPE_BADGE[node.type]} className="flex-none">{node.type === "ControlAccount" ? "CA" : node.type === "WorkPackage" ? "WP" : "Activity"}</Badge>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{node.name}</span>
        <span className="w-24 flex-none text-right text-sm text-slate-600">{formatCurrency(node.rolledUpBudget)}</span>
        <div className="w-32 flex-none">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", node.rolledUpPercentComplete >= 100 ? "bg-emerald-500" : "bg-violet-500")}
                style={{ width: `${node.rolledUpPercentComplete}%` }}
              />
            </div>
            <span className="w-9 flex-none text-right text-xs text-slate-500">{node.rolledUpPercentComplete.toFixed(0)}%</span>
          </div>
        </div>
        <div className="w-40 flex-none">
          {dict && <UserChip userId={dict.responsibleOwnerId} />}
        </div>
      </div>
      {expanded && node.children.map((child) => <WbsRow key={child.id} node={child} depth={depth + 1} />)}
    </>
  );
}

export function WbsExplorerView() {
  const tree = useWbsTree();
  const wbsNodes = useProjectStore((s) => s.wbsNodes);
  const project = useProjectStore((s) => s.project);
  const isValid = verifyHundredPercentRule(wbsNodes, project.bac);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">WBS Explorer</h2>
          <p className="text-sm text-slate-500">
            Control Accounts → Work Packages, with{" "}
            <InfoTooltip text="The 100% Rule: the WBS includes 100% of the work defined by the project scope, and captures all deliverables — internal, external, and interim.">
              100% Rule
            </InfoTooltip>{" "}
            rollup verification.
          </p>
        </div>
        <Badge variant={isValid ? "green" : "red"} className="flex-none">
          {isValid ? <><CheckCircle2 className="h-3.5 w-3.5" /> 100% Rule Verified</> : "100% Rule Violation"}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span className="w-4" />
          <span className="w-16">Code</span>
          <span className="w-11" />
          <span className="min-w-0 flex-1">Name</span>
          <span className="w-24 text-right">Budget</span>
          <span className="w-32">% Complete</span>
          <span className="w-40">Owner</span>
        </div>
        {tree.map((node) => <WbsRow key={node.id} node={node} depth={0} />)}
      </div>
    </div>
  );
}
