import type { ViewId } from "@/lib/store/useProjectStore";

export type CitationType =
  | "risk"
  | "issue"
  | "assumption"
  | "decision"
  | "action"
  | "changeRequest"
  | "baseline"
  | "approval"
  | "stakeholder"
  | "lessonLearned"
  | "statusReport"
  | "activity"
  | "wbsNode";

export interface Citation {
  type: CitationType;
  id: string;
  label: string;
}

export const CITATION_VIEW: Record<CitationType, ViewId> = {
  risk: "risk",
  issue: "raid",
  assumption: "raid",
  decision: "decisions",
  action: "decisions",
  changeRequest: "governance",
  baseline: "governance",
  approval: "governance",
  stakeholder: "raci",
  lessonLearned: "lessons",
  statusReport: "statusReports",
  activity: "gantt",
  wbsNode: "wbs",
};

export function dedupeCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of citations) {
    const key = `${c.type}:${c.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
