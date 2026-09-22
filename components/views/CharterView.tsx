"use client";

import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserChip } from "@/components/shared/UserChip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";

export function CharterView() {
  const charter = useProjectStore((s) => s.charter);
  const project = useProjectStore((s) => s.project);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Project Charter &amp; Canvas</h2>
        <p className="text-sm text-slate-500">
          The authorizing document for {project.name} —{" "}
          <InfoTooltip text="Project Charter: a document issued by the sponsor that formally authorizes the existence of a project and provides the PM with authority to apply resources.">
            PMBOK Project Charter
          </InfoTooltip>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Business Case</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700 leading-relaxed">{charter.businessCase}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Strategic Alignment</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700 leading-relaxed">{charter.strategicAlignment}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Measurable Success Criteria</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {charter.successCriteria.map((sc) => (
              <div key={sc.id} className="flex items-center justify-between gap-4 py-2.5">
                <div className="flex items-center gap-2">
                  {sc.isMet ? <CheckCircle2 className="h-4 w-4 flex-none text-emerald-500" /> : <Circle className="h-4 w-4 flex-none text-slate-300" />}
                  <span className="text-sm text-slate-700">{sc.description}</span>
                </div>
                <div className="flex-none text-right">
                  <p className="text-sm font-medium text-slate-800">{sc.target}</p>
                  <p className="text-xs text-slate-400">{sc.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Exit Criteria</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-slate-700">
              {charter.exitCriteria.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Assumptions &amp; Constraints</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Assumptions</p>
            <ul className="mb-3 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {charter.assumptions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Constraints</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
              {charter.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Authorization</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Authorized Budget</p>
            <p className="text-base font-semibold text-slate-900">{formatCurrency(charter.authorizedBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Approved Date</p>
            <p className="text-base font-semibold text-slate-900">{formatDate(charter.approvedDate)}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Project Manager</p>
            <UserChip userId={charter.projectManagerId} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-400">Sponsor</p>
            <UserChip userId={charter.sponsorId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
