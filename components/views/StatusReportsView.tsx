"use client";

import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserChip } from "@/components/shared/UserChip";
import { formatDate } from "@/lib/utils";
import type { HealthRating } from "@/lib/types";

const HEALTH_VARIANT: Record<HealthRating, "green" | "amber" | "red"> = {
  Green: "green",
  Amber: "amber",
  Red: "red",
};

function HealthPill({ label, health }: { label: string; health: HealthRating }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-slate-400">{label}</span>
      <Badge variant={HEALTH_VARIANT[health]}>{health}</Badge>
    </div>
  );
}

export function StatusReportsView() {
  const statusReports = useProjectStore((s) => s.statusReports);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Status Reports</h2>
        <p className="text-sm text-slate-500">Periodic decision-ready reporting distributed to stakeholders, distinct from raw performance data.</p>
      </div>

      <div className="space-y-4">
        {[...statusReports].reverse().map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-800">
                {formatDate(report.periodStart)} &ndash; {formatDate(report.periodEnd)}
              </CardTitle>
              <div className="flex items-center gap-3">
                <HealthPill label="Overall" health={report.overallHealth} />
                <HealthPill label="Schedule" health={report.scheduleHealth} />
                <HealthPill label="Cost" health={report.costHealth} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{report.summary}</p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Accomplishments</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {report.accomplishments.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Upcoming</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {report.upcoming.map((u, i) => <li key={i}>{u}</li>)}
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                <span>Published {formatDate(report.date)}</span>
                <UserChip userId={report.authorId} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
