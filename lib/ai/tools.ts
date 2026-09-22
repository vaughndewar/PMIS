// Read-only tool definitions for the AI assistant. There is deliberately no
// mutation tool anywhere in this module — the assistant can look, but every
// action that changes project state (approving a CR, locking a baseline,
// setting a RACI role, etc.) stays behind the human clicking a button in the
// UI. That is the guardrail, enforced in code rather than by prompt alone.

import type Anthropic from "@anthropic-ai/sdk";
import type { ProjectSnapshot } from "./snapshot";
import { computeGovernanceFlags } from "./governance-flags";
import { dedupeCitations, type Citation } from "./citations";

export const ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_project_overview",
    description:
      "Get the project's charter summary, status, focus area, budget, and active Performance Measurement Baseline. Use this first for any general status question.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_evm_metrics",
    description:
      "Get current Earned Value Management metrics: PV, EV, AC, CPI, SPI, EAC, ETC, VAC, TCPI. Use this for cost or schedule performance questions.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_critical_path",
    description:
      "Get the activities currently on the critical path (zero total float), with their planned dates. Use this for schedule risk or 'what could delay the project' questions.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "search_records",
    description:
      "Search a specific category of project records, optionally filtered by status and/or a keyword. Categories: risks, issues, assumptions, decisions, actions, changeRequests, approvals, lessonsLearned, statusReports, stakeholders. Always use this rather than inventing record details.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: [
            "risks",
            "issues",
            "assumptions",
            "decisions",
            "actions",
            "changeRequests",
            "approvals",
            "lessonsLearned",
            "statusReports",
            "stakeholders",
          ],
        },
        status: { type: "string", description: "Optional exact status filter, e.g. 'Open', 'Pending', 'Submitted'." },
        keyword: { type: "string", description: "Optional case-insensitive keyword to match against titles/descriptions." },
      },
      required: ["category"],
    },
  },
  {
    name: "flag_governance_gaps",
    description:
      "Run deterministic checks for stale assumptions past their validate-by date, overdue actions, approvals pending more than 5 days, change requests open more than 7 days, Work Packages without exactly one RACI Accountable, high-severity open risks, and cost baseline drift. These are computed facts, not opinions — always call this instead of guessing whether something is 'stale' or 'missing'.",
    input_schema: { type: "object", properties: {} },
  },
];

interface ToolExecution {
  result: unknown;
  citations: Citation[];
}

export function executeTool(name: string, input: Record<string, unknown>, snapshot: ProjectSnapshot): ToolExecution {
  switch (name) {
    case "get_project_overview": {
      const activeBaseline = snapshot.baselines.find((b) => b.isActive) ?? null;
      return {
        result: {
          name: snapshot.project.name,
          status: snapshot.project.status,
          currentFocusArea: snapshot.project.currentFocusArea,
          startDate: snapshot.project.startDate,
          endDate: snapshot.project.endDate,
          bac: snapshot.project.bac,
          businessCase: snapshot.charter.businessCase,
          successCriteria: snapshot.charter.successCriteria,
          activeBaseline: activeBaseline
            ? { version: activeBaseline.version, lockedAt: activeBaseline.lockedAt, totalScopeBudget: activeBaseline.totalScopeBudget }
            : null,
        },
        citations: activeBaseline ? [{ type: "baseline", id: activeBaseline.id, label: activeBaseline.version }] : [],
      };
    }

    case "get_evm_metrics": {
      return { result: { asOfDate: snapshot.asOfDate, ...snapshot.evm }, citations: [] };
    }

    case "get_critical_path": {
      const critical = snapshot.activities.filter((a) => snapshot.criticalActivityIds.includes(a.id));
      return {
        result: critical.map((a) => ({
          id: a.id,
          name: a.name,
          plannedStart: a.plannedStart,
          plannedFinish: a.plannedFinish,
          status: a.status,
          percentComplete: a.percentComplete,
        })),
        citations: critical.map((a) => ({ type: "activity", id: a.id, label: a.name })),
      };
    }

    case "search_records": {
      const category = String(input.category ?? "");
      const status = typeof input.status === "string" ? input.status : undefined;
      const keyword = typeof input.keyword === "string" ? input.keyword.toLowerCase() : undefined;

      const { items, citationType, labelOf } = getCategoryData(category, snapshot);
      const filtered = items.filter((item) => {
        const record = item as Record<string, unknown>;
        if (status && record.status !== status) return false;
        if (keyword) {
          const haystack = JSON.stringify(record).toLowerCase();
          if (!haystack.includes(keyword)) return false;
        }
        return true;
      });

      return {
        result: filtered,
        citations: filtered.map((item) => ({
          type: citationType,
          id: (item as { id: string }).id,
          label: labelOf(item),
        })),
      };
    }

    case "flag_governance_gaps": {
      const flags = computeGovernanceFlags(snapshot);
      const citations: Citation[] = [
        ...flags.staleAssumptions.map((a) => ({ type: "assumption" as const, id: a.id, label: a.description })),
        ...flags.overdueActions.map((a) => ({ type: "action" as const, id: a.id, label: a.title })),
        ...flags.agingApprovals.map((a) => ({ type: "approval" as const, id: a.id, label: a.title })),
        ...flags.staleChangeRequests.map((a) => ({ type: "changeRequest" as const, id: a.id, label: a.title })),
        ...flags.highSeverityOpenRisks.map((r) => ({ type: "risk" as const, id: r.id, label: r.event })),
        ...flags.raciAccountabilityGaps.map((g) => ({ type: "wbsNode" as const, id: g.wbsNodeId, label: g.name })),
      ];
      return { result: flags, citations: dedupeCitations(citations) };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` }, citations: [] };
  }
}

function getCategoryData(
  category: string,
  snapshot: ProjectSnapshot
): { items: unknown[]; citationType: Citation["type"]; labelOf: (item: unknown) => string } {
  switch (category) {
    case "risks":
      return { items: snapshot.risks, citationType: "risk", labelOf: (i) => (i as { event: string }).event };
    case "issues":
      return { items: snapshot.issues, citationType: "issue", labelOf: (i) => (i as { title: string }).title };
    case "assumptions":
      return { items: snapshot.assumptions, citationType: "assumption", labelOf: (i) => (i as { description: string }).description };
    case "decisions":
      return { items: snapshot.decisions, citationType: "decision", labelOf: (i) => (i as { title: string }).title };
    case "actions":
      return { items: snapshot.actions, citationType: "action", labelOf: (i) => (i as { title: string }).title };
    case "changeRequests":
      return { items: snapshot.changeRequests, citationType: "changeRequest", labelOf: (i) => (i as { title: string }).title };
    case "approvals":
      return { items: snapshot.approvals, citationType: "approval", labelOf: (i) => (i as { title: string }).title };
    case "lessonsLearned":
      return { items: snapshot.lessonsLearned, citationType: "lessonLearned", labelOf: (i) => (i as { situation: string }).situation };
    case "statusReports":
      return {
        items: snapshot.statusReports,
        citationType: "statusReport",
        labelOf: (i) => `${(i as { periodStart: string }).periodStart} status report`,
      };
    case "stakeholders":
      return { items: snapshot.stakeholders, citationType: "stakeholder", labelOf: (i) => (i as { name: string }).name };
    default:
      return { items: [], citationType: "risk", labelOf: () => "" };
  }
}
