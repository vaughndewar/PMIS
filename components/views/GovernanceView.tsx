"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeRequestModal } from "@/components/shared/ChangeRequestModal";
import { UserChip } from "@/components/shared/UserChip";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApprovalStatus, ChangeRequest, ChangeStatus } from "@/lib/types";
import { Lock, Plus, Search, Check, X, Clock3, Stamp } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";

const STATUS_VARIANT: Record<ChangeStatus, "default" | "amber" | "green" | "red" | "blue"> = {
  Submitted: "blue",
  UnderReview: "amber",
  Approved: "green",
  Rejected: "red",
  Deferred: "default",
};

const APPROVAL_VARIANT: Record<ApprovalStatus, "amber" | "green" | "red"> = {
  Pending: "amber",
  Approved: "green",
  Rejected: "red",
};

const CATEGORY_LABEL: Record<ChangeRequest["category"], string> = {
  CorrectiveAction: "Corrective Action",
  PreventiveAction: "Preventive Action",
  DefectRepair: "Defect Repair",
  ScopeChange: "Scope Change",
};

export function GovernanceView() {
  const baselines = useProjectStore((s) => s.baselines);
  const changeRequests = useProjectStore((s) => s.changeRequests);
  const activities = useProjectStore((s) => s.activities);
  const approvals = useProjectStore((s) => s.approvals);
  const decideApproval = useProjectStore((s) => s.decideApproval);
  const lockNewBaseline = useProjectStore((s) => s.lockNewBaseline);
  const updateChangeRequestStatus = useProjectStore((s) => s.updateChangeRequestStatus);

  const [crModalOpen, setCrModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [decisionNote, setDecisionNote] = useState<Record<string, string>>({});

  const activeBaseline = baselines.find((b) => b.isActive);
  const currentTotalBudget = activities.reduce((s, a) => s + a.budget, 0);
  const hasDrift = activeBaseline ? currentTotalBudget !== activeBaseline.totalScopeBudget : false;

  const allLogEntries = useMemo(
    () =>
      changeRequests
        .flatMap((cr) => cr.changeLog.map((entry) => ({ ...entry, crId: cr.id, crTitle: cr.title })))
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [changeRequests]
  );
  const filteredLog = allLogEntries.filter(
    (e) =>
      !search ||
      e.crId.toLowerCase().includes(search.toLowerCase()) ||
      e.crTitle.toLowerCase().includes(search.toLowerCase()) ||
      e.note.toLowerCase().includes(search.toLowerCase())
  );

  function decide(cr: ChangeRequest, status: ChangeStatus) {
    updateChangeRequestStatus(cr.id, status, "u-pm", decisionNote[cr.id] ?? "");
    setDecisionNote((d) => ({ ...d, [cr.id]: "" }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Governance &amp; Change Control</h2>
          <p className="text-sm text-slate-500">
            <InfoTooltip text="Integrated Change Control: the process of reviewing all change requests, approving changes, and managing changes to deliverables and the Performance Measurement Baseline.">
              Integrated Change Control
            </InfoTooltip>{" "}
            &mdash; baseline governance and the CCB review queue.
          </p>
        </div>
        <Button onClick={() => setCrModalOpen(true)}><Plus className="h-4 w-4" /> New Change Request</Button>
      </div>

      {/* Baseline manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />{" "}
            <InfoTooltip text="Performance Measurement Baseline (PMB): the approved integrated scope, schedule, and cost baseline used to compare against actual performance.">
              Performance Measurement Baseline
            </InfoTooltip>
          </CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => lockNewBaseline(`Baseline ${activeBaseline ? "re-lock" : "lock"} — ${new Date().toLocaleDateString()}`, "u-pm", "Snapshot captured from current schedule and cost data.")}
          >
            <Lock className="h-3.5 w-3.5" /> Lock New Baseline Snapshot
          </Button>
        </CardHeader>
        <CardContent>
          {activeBaseline && (
            <div className="mb-3 rounded-lg border border-violet-100 bg-violet-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-violet-800">Active: {activeBaseline.version} — {activeBaseline.name}</p>
                <Badge variant="violet">Locked {formatDate(activeBaseline.lockedAt.slice(0, 10))}</Badge>
              </div>
              <p className="mt-1 text-xs text-violet-700">{activeBaseline.notes}</p>
              <div className="mt-2 flex gap-6 text-xs text-violet-700">
                <span>Scope Budget: <strong>{formatCurrency(activeBaseline.totalScopeBudget)}</strong></span>
                <span>Activities Snapshotted: <strong>{activeBaseline.activitySnapshots.length}</strong></span>
              </div>
              {hasDrift && (
                <p className="mt-2 text-xs font-medium text-amber-700">
                  Current committed cost ({formatCurrency(currentTotalBudget)}) has drifted from this baseline — approved changes are pending a new lock.
                </p>
              )}
            </div>
          )}
          <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Version History</p>
          <div className="space-y-1.5">
            {[...baselines].reverse().map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{b.version} &middot; {b.name}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatDate(b.lockedAt.slice(0, 10))}</span>
                  {b.isActive && <Badge variant="green">Active</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CCB review queue */}
      <Card>
        <CardHeader><CardTitle>Change Control Board — Review Queue</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {changeRequests.filter((cr) => cr.status === "Submitted" || cr.status === "UnderReview").length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">No change requests awaiting CCB decision.</p>
          )}
          {changeRequests
            .filter((cr) => cr.status === "Submitted" || cr.status === "UnderReview")
            .map((cr) => (
              <div key={cr.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{cr.id}</span>
                    <p className="text-sm font-semibold text-slate-800">{cr.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline">{CATEGORY_LABEL[cr.category]}</Badge>
                    <Badge variant={STATUS_VARIANT[cr.status]}>{cr.status.replace(/([A-Z])/g, " $1").trim()}</Badge>
                  </div>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">{cr.description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
                  <span>Cost Impact: <strong className={cr.impact.costImpact > 0 ? "text-red-600" : "text-emerald-600"}>{formatCurrency(cr.impact.costImpact)}</strong></span>
                  <span>Schedule Impact: <strong>{cr.impact.scheduleImpactDays}d</strong></span>
                  <span className="col-span-2">Risk: {cr.impact.riskImpact || "—"}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <Input
                    placeholder="CCB decision note..."
                    value={decisionNote[cr.id] ?? ""}
                    onChange={(e) => setDecisionNote((d) => ({ ...d, [cr.id]: e.target.value }))}
                    className="h-8"
                  />
                  {cr.status === "Submitted" && (
                    <Button size="sm" variant="secondary" onClick={() => decide(cr, "UnderReview")}>
                      <Clock3 className="h-3.5 w-3.5" /> Review
                    </Button>
                  )}
                  <Button size="sm" variant="default" onClick={() => decide(cr, "Approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => decide(cr, "Rejected")}><X className="h-3.5 w-3.5" /> Reject</Button>
                  <Button size="sm" variant="outline" onClick={() => decide(cr, "Deferred")}>Defer</Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Decided change requests */}
      <Card>
        <CardHeader><CardTitle>Decided Change Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {changeRequests.filter((cr) => !["Submitted", "UnderReview"].includes(cr.status)).map((cr) => (
            <div key={cr.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{cr.id}</span>
                <span className="font-medium text-slate-700">{cr.title}</span>
              </div>
              <Badge variant={STATUS_VARIANT[cr.status]}>{cr.status}</Badge>
            </div>
          ))}
          {changeRequests.filter((cr) => !["Submitted", "UnderReview"].includes(cr.status)).length === 0 && (
            <p className="py-2 text-center text-sm text-slate-400">No decided change requests yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Stamp className="h-3.5 w-3.5" /> Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {approvals.map((approval) => (
            <div key={approval.id} className="flex items-center gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-700">{approval.title}</p>
                <p className="text-xs text-slate-400">
                  {approval.entityType} &middot; {approval.entityId} &middot; Requested {formatDate(approval.requestedDate)}
                  {approval.decisionDate && ` · Decided ${formatDate(approval.decisionDate)}`}
                </p>
              </div>
              <UserChip userId={approval.approverId} />
              {approval.status === "Pending" ? (
                <div className="flex flex-none gap-1.5">
                  <Button size="sm" variant="default" onClick={() => decideApproval(approval.id, "Approved", "")}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => decideApproval(approval.id, "Rejected", "")}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              ) : (
                <Badge variant={APPROVAL_VARIANT[approval.status]} className="flex-none">{approval.status}</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Change log */}
      <Card>
        <CardHeader><CardTitle>Change Log</CardTitle></CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-300" />
            <Input placeholder="Search change log by CR ID, title, or note..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {filteredLog.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-slate-50 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="text-slate-700"><span className="font-mono text-slate-400">{entry.crId}</span> — {entry.action}</p>
                  <p className="truncate text-slate-400">{entry.note}</p>
                </div>
                <span className="flex-none text-slate-400">{formatDate(entry.timestamp.slice(0, 10))}</span>
              </div>
            ))}
            {filteredLog.length === 0 && <p className="py-4 text-center text-slate-400">No matching log entries.</p>}
          </div>
        </CardContent>
      </Card>

      <ChangeRequestModal open={crModalOpen} onOpenChange={setCrModalOpen} targetEntityType="Baseline" targetEntityId={activeBaseline?.id ?? ""} />
    </div>
  );
}
