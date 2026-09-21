"use client";

import { useEvmMetrics, useEvmTimeSeries, EVM_AS_OF_DATE } from "@/lib/store/selectors";
import { indexHealth, varianceHealth, type HealthStatus } from "@/lib/engine/evm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/tooltip";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProjectStore } from "@/lib/store/useProjectStore";

const HEALTH_RING: Record<HealthStatus, string> = {
  green: "ring-emerald-400 bg-emerald-50 text-emerald-700",
  amber: "ring-amber-400 bg-amber-50 text-amber-700",
  red: "ring-red-400 bg-red-50 text-red-700",
};

const HEALTH_DOT: Record<HealthStatus, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

const ACRONYMS: Record<string, string> = {
  PV: "Planned Value: the authorized budget assigned to scheduled work.",
  EV: "Earned Value: the measure of work performed expressed as the authorized budget for that work.",
  AC: "Actual Cost: the realized cost incurred for work performed.",
  CPI: "Cost Performance Index = EV / AC. A measure of cost efficiency (>1 is under budget).",
  SPI: "Schedule Performance Index = EV / PV. A measure of schedule efficiency (>1 is ahead of schedule).",
  EAC: "Estimate at Completion = BAC / CPI. The expected total cost of the project.",
  TCPI: "To-Complete Performance Index = (BAC - EV) / (BAC - AC). The efficiency required on remaining work to meet BAC.",
};

function MetricCard({ label, value, health, sub }: { label: string; value: string; health: HealthStatus; sub?: string }) {
  return (
    <Card className={cn("ring-1", HEALTH_RING[health])}>
      <CardContent className="pt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <InfoTooltip text={ACRONYMS[label] ?? label}>{label}</InfoTooltip>
          </span>
          <span className={cn("h-2 w-2 rounded-full", HEALTH_DOT[health])} />
        </div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function EvmDashboardView() {
  const metrics = useEvmMetrics();
  const series = useEvmTimeSeries();
  const project = useProjectStore((s) => s.project);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Finance &amp; EVM Telemetry</h2>
        <p className="text-sm text-slate-500">
          <InfoTooltip text="Earned Value Management: a methodology combining scope, schedule, and cost measures to assess project performance and progress.">
            Earned Value Management
          </InfoTooltip>{" "}
          as of {formatDate(EVM_AS_OF_DATE)}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <MetricCard label="PV" value={formatCurrency(metrics.pv)} health="green" />
        <MetricCard label="EV" value={formatCurrency(metrics.ev)} health="green" />
        <MetricCard label="AC" value={formatCurrency(metrics.ac)} health="green" />
        <MetricCard label="CPI" value={metrics.cpi.toFixed(2)} health={indexHealth(metrics.cpi)} sub={metrics.cv >= 0 ? `+${formatCurrency(metrics.cv)} CV` : `${formatCurrency(metrics.cv)} CV`} />
        <MetricCard label="SPI" value={metrics.spi.toFixed(2)} health={indexHealth(metrics.spi)} sub={metrics.sv >= 0 ? `+${formatCurrency(metrics.sv)} SV` : `${formatCurrency(metrics.sv)} SV`} />
        <MetricCard label="EAC" value={formatCurrency(metrics.eac)} health={varianceHealth(metrics.vac, project.bac)} sub={`VAC ${formatCurrency(metrics.vac)}`} />
        <MetricCard label="TCPI" value={metrics.tcpi.toFixed(2)} health={metrics.tcpi <= metrics.cpi ? "green" : metrics.tcpi <= 1.1 ? "amber" : "red"} />
      </div>

      <Card>
        <CardHeader><CardTitle>Cumulative S-Curve: PV vs. EV vs. AC</CardTitle></CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} tick={{ fontSize: 11 }} minTickGap={30} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={56} />
              <RechartsTooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(d) => formatDate(d as string)}
              />
              <Legend />
              <ReferenceLine x={EVM_AS_OF_DATE} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Today", position: "top", fontSize: 11, fill: "#64748b" }} />
              <Line type="monotone" dataKey="cumulativePV" name="Planned Value (PV)" stroke="#64748b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cumulativeEV" name="Earned Value (EV)" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cumulativeAC" name="Actual Cost (AC)" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
