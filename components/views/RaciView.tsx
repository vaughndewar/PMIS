"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { useWbsTree } from "@/lib/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, UserChip } from "@/components/shared/UserChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { raciParticipantIds } from "@/lib/mock-data/seed";
import { cn, formatDate } from "@/lib/utils";
import type { RaciRole } from "@/lib/types";
import { InfoTooltip } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";

const ROLE_STYLE: Record<Exclude<RaciRole, null>, string> = {
  R: "bg-sky-100 text-sky-700 border-sky-200",
  A: "bg-violet-600 text-white border-violet-600",
  C: "bg-amber-100 text-amber-700 border-amber-200",
  I: "bg-slate-100 text-slate-500 border-slate-200",
};

const ROLE_LABEL: Record<Exclude<RaciRole, null>, string> = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
};

const ENGAGEMENT_VARIANT: Record<string, "default" | "red" | "amber" | "green" | "blue"> = {
  Unaware: "default",
  Resistant: "red",
  Neutral: "amber",
  Supportive: "blue",
  Leading: "green",
};

export function RaciView() {
  const wbsTree = useWbsTree();
  const users = useProjectStore((s) => s.users);
  const raciEntries = useProjectStore((s) => s.raciEntries);
  const setRaciRole = useProjectStore((s) => s.setRaciRole);
  const stakeholders = useProjectStore((s) => s.stakeholders);
  const communicationRecords = useProjectStore((s) => s.communicationRecords);
  const addCommunicationRecord = useProjectStore((s) => s.addCommunicationRecord);
  const [commForm, setCommForm] = useState({ channel: "", audience: "", summary: "" });

  const workPackages = wbsTree.flatMap((ca) => ca.children.filter((n) => n.type === "WorkPackage"));
  const participants = raciParticipantIds.map((id) => users.find((u) => u.id === id)!).filter(Boolean);

  function roleFor(wbsNodeId: string, participantId: string): RaciRole {
    return raciEntries.find((e) => e.wbsNodeId === wbsNodeId && e.stakeholderId === participantId)?.role ?? null;
  }

  function accountableCount(wbsNodeId: string): number {
    return raciEntries.filter((e) => e.wbsNodeId === wbsNodeId && e.role === "A").length;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Stakeholders &amp; RACI</h2>
        <p className="text-sm text-slate-500">
          <InfoTooltip text="RACI: Responsible, Accountable, Consulted, Informed — a common responsibility assignment matrix used to clarify roles for each deliverable.">
            RACI Matrix
          </InfoTooltip>{" "}
          across Work Packages. Exactly one Accountable is enforced per row.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Stakeholder Register</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stakeholders.map((sh) => (
              <div key={sh.id} className="rounded-lg border border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-800">{sh.name}</p>
                <p className="text-xs text-slate-400">{sh.role} &middot; {sh.organization}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{sh.directionOfInfluence} influence</Badge>
                  <Badge variant={ENGAGEMENT_VARIANT[sh.currentEngagement]}>{sh.currentEngagement}</Badge>
                  {sh.currentEngagement !== sh.desiredEngagement && (
                    <Badge variant="outline">&rarr; {sh.desiredEngagement} desired</Badge>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-[11px] text-slate-400">
                  <span>Power: {sh.powerLevel}/5</span>
                  <span>Interest: {sh.interestLevel}/5</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>RACI Matrix</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Deliverable</th>
                  {participants.map((p) => (
                    <th key={p.id} className="p-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar userId={p.id} />
                        <span className="max-w-[64px] truncate text-[10px] font-medium text-slate-500">{p.name.split(" ")[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workPackages.map((wp) => {
                  const aCount = accountableCount(wp.id);
                  return (
                    <tr key={wp.id} className="border-t border-slate-100">
                      <td className="sticky left-0 bg-white py-1.5 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-400">{wp.code}</span>
                          <span className="text-sm font-medium text-slate-700">{wp.name}</span>
                          {aCount === 1 ? (
                            <span title="Exactly one Accountable">
                              <CheckCircle2 className="h-3.5 w-3.5 flex-none text-emerald-500" />
                            </span>
                          ) : (
                            <span title={`${aCount} Accountable assigned`}>
                              <AlertCircle className="h-3.5 w-3.5 flex-none text-red-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      {participants.map((p) => {
                        const role = roleFor(wp.id, p.id);
                        return (
                          <td key={p.id} className="p-1 text-center">
                            <Select value={role ?? "none"} onValueChange={(v) => setRaciRole(wp.id, p.id, v === "none" ? null : (v as RaciRole))}>
                              <SelectTrigger
                                className={cn(
                                  "mx-auto h-7 w-14 justify-center border font-semibold",
                                  role ? ROLE_STYLE[role] : "border-slate-200 bg-white text-slate-300"
                                )}
                              >
                                <SelectValue placeholder="–">{role ?? "–"}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">—</SelectItem>
                                {(["R", "A", "C", "I"] as const).map((r) => (
                                  <SelectItem key={r} value={r}>{r} &middot; {ROLE_LABEL[r]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Communications Log</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input placeholder="Channel (e.g. Status Email)" value={commForm.channel} onChange={(e) => setCommForm((f) => ({ ...f, channel: e.target.value }))} />
            <Input placeholder="Audience" value={commForm.audience} onChange={(e) => setCommForm((f) => ({ ...f, audience: e.target.value }))} />
            <div className="flex gap-2">
              <Input placeholder="Summary" value={commForm.summary} onChange={(e) => setCommForm((f) => ({ ...f, summary: e.target.value }))} />
              <Button
                size="sm"
                disabled={!commForm.channel.trim() || !commForm.summary.trim()}
                onClick={() => {
                  addCommunicationRecord({ channel: commForm.channel, audience: commForm.audience, summary: commForm.summary, authorId: "u-pm", relatedDecisionId: null });
                  setCommForm({ channel: "", audience: "", summary: "" });
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            {[...communicationRecords].reverse().map((record) => (
              <div key={record.id} className="flex items-start justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700">{record.channel} <span className="text-xs font-normal text-slate-400">&middot; {record.audience}</span></p>
                  <p className="text-xs text-slate-500">{record.summary}</p>
                </div>
                <div className="flex flex-none items-center gap-2 text-xs text-slate-400">
                  <span>{formatDate(record.date)}</span>
                  <UserChip userId={record.authorId} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
