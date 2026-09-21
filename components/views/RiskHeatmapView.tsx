"use client";

import { useMemo, useState } from "react";
import { useProjectStore } from "@/lib/store/useProjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserChip } from "@/components/shared/UserChip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Risk, RiskResponseStrategy } from "@/lib/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { InfoTooltip } from "@/components/ui/tooltip";

const RESPONSES: RiskResponseStrategy[] = ["Avoid", "Mitigate", "Transfer", "Accept", "Exploit", "Enhance", "Share"];

function cellColor(score: number) {
  if (score >= 20) return "bg-red-600 text-white";
  if (score >= 12) return "bg-red-400 text-white";
  if (score >= 8) return "bg-amber-400 text-white";
  if (score >= 4) return "bg-amber-200 text-amber-900";
  return "bg-emerald-200 text-emerald-900";
}

export function RiskHeatmapView() {
  const risks = useProjectStore((s) => s.risks);
  const updateRisk = useProjectStore((s) => s.updateRisk);
  const [selectedCell, setSelectedCell] = useState<{ probability: number; impact: number } | null>(null);

  const grid = useMemo(() => {
    const map = new Map<string, Risk[]>();
    for (const r of risks) {
      const key = `${r.probability}-${r.impact}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [risks]);

  const threatExposure = risks.filter((r) => r.classification === "Threat" && r.status === "Open").reduce((s, r) => s + r.probability * r.impact, 0);
  const opportunityExposure = risks.filter((r) => r.classification === "Opportunity" && r.status === "Open").reduce((s, r) => s + r.probability * r.impact, 0);

  const filtered = selectedCell
    ? risks.filter((r) => r.probability === selectedCell.probability && r.impact === selectedCell.impact)
    : risks;

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Risk Heatmap &amp; Register</h2>
          <p className="text-sm text-slate-500">
            <InfoTooltip text="Probability and Impact Matrix: a grid mapping the probability of occurrence of each risk against its impact if it occurs, used to sort risks into priority groups.">
              5x5 Probability–Impact Matrix
            </InfoTooltip>
            . Click a cell to filter the register.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
            <TrendingDown className="h-3.5 w-3.5" /> Threat Exposure: {threatExposure}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" /> Opportunity Exposure: {opportunityExposure}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-2 pt-5">
          <div className="flex">
            <div className="flex flex-col justify-around pr-2 text-right text-xs font-medium text-slate-500" style={{ height: 5 * 56 }}>
              {[5, 4, 3, 2, 1].map((p) => <div key={p} className="flex h-14 items-center justify-end">{p}</div>)}
            </div>
            <div>
              <div className="grid grid-cols-5 gap-1">
                {[5, 4, 3, 2, 1].map((probability) =>
                  [1, 2, 3, 4, 5].map((impact) => {
                    const key = `${probability}-${impact}`;
                    const cellRisks = grid.get(key) ?? [];
                    const score = probability * impact;
                    const isSelected = selectedCell?.probability === probability && selectedCell?.impact === impact;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCell(isSelected ? null : { probability, impact })}
                        className={cn(
                          "flex h-14 w-14 flex-col items-center justify-center rounded-md text-xs font-semibold transition-transform hover:scale-105",
                          cellColor(score),
                          isSelected && "ring-2 ring-offset-2 ring-slate-900"
                        )}
                      >
                        <span>{score}</span>
                        {cellRisks.length > 0 && <span className="text-[10px] opacity-90">{cellRisks.length} risk{cellRisks.length > 1 ? "s" : ""}</span>}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="mt-1 grid grid-cols-5 gap-1 text-center text-xs font-medium text-slate-500">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="w-14">{i}</div>)}
              </div>
              <p className="mt-1 text-center text-xs text-slate-400">Impact &rarr;</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">&uarr; Probability</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Risk Register {selectedCell && <span className="font-normal text-slate-400">— filtered to P{selectedCell.probability} / I{selectedCell.impact}</span>}
          </CardTitle>
          {selectedCell && (
            <button onClick={() => setSelectedCell(null)} className="text-xs font-medium text-violet-600 hover:underline">
              Clear filter
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((risk) => (
            <div key={risk.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Badge variant={risk.classification === "Threat" ? "red" : "green"}>{risk.classification}</Badge>
                <div className="flex items-center gap-2">
                  <SelectField
                    value={risk.probability}
                    onChange={(v) => updateRisk(risk.id, { probability: v })}
                    label="P"
                  />
                  <SelectField
                    value={risk.impact}
                    onChange={(v) => updateRisk(risk.id, { impact: v })}
                    label="I"
                  />
                  <Badge className={cn(cellColor(risk.probability * risk.impact))}>{risk.probability * risk.impact}</Badge>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                <span className="font-medium">Cause:</span> {risk.cause}
              </p>
              <p className="text-sm text-slate-700"><span className="font-medium">Event:</span> {risk.event}</p>
              <p className="text-sm text-slate-700"><span className="font-medium">Consequence:</span> {risk.consequence}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Response:</span>
                  <Select value={risk.responseStrategy} onValueChange={(v) => updateRisk(risk.id, { responseStrategy: v as RiskResponseStrategy })}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RESPONSES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-xs text-slate-400">Trigger: {risk.triggerCondition}</span>
                <div className="ml-auto"><UserChip userId={risk.ownerId} /></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-4 text-center text-sm text-slate-400">No risks in this cell.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function SelectField({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-7 w-14 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
