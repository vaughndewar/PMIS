// Serializes the current project state into a plain-data snapshot the assistant's
// tools can query. The client sends this with every request so the assistant always
// reasons over the same data the user is looking at — never a stale server-side copy.

import { useProjectStore } from "@/lib/store/useProjectStore";
import { applyCpmToActivities, getCriticalPath, runCpm } from "@/lib/engine/cpm";
import { computeEvm } from "@/lib/engine/evm";
import type {
  Action,
  Approval,
  Assumption,
  Baseline,
  ChangeRequest,
  CommunicationRecord,
  Decision,
  Issue,
  LessonLearned,
  Project,
  ProjectCharter,
  RaciEntry,
  ResourceAllocation,
  Risk,
  Stakeholder,
  StatusReport,
  User,
  WbsNode,
} from "@/lib/types";

export interface ProjectSnapshot {
  asOfDate: string;
  project: Project;
  charter: ProjectCharter;
  users: User[];
  wbsNodes: WbsNode[];
  activities: ReturnType<typeof applyCpmToActivities>;
  criticalActivityIds: string[];
  evm: ReturnType<typeof computeEvm>;
  baselines: Baseline[];
  changeRequests: ChangeRequest[];
  risks: Risk[];
  issues: Issue[];
  assumptions: Assumption[];
  decisions: Decision[];
  actions: Action[];
  approvals: Approval[];
  resourceAllocations: ResourceAllocation[];
  lessonsLearned: LessonLearned[];
  statusReports: StatusReport[];
  communicationRecords: CommunicationRecord[];
  stakeholders: Stakeholder[];
  raciEntries: RaciEntry[];
}

const TODAY = "2025-04-14"; // matches the fixed EVM "as of" date used across the app

export function buildProjectSnapshot(): ProjectSnapshot {
  const s = useProjectStore.getState();

  const activities = applyCpmToActivities(s.activities, s.dependencies);
  const cpmResults = runCpm(
    s.activities.map((a) => ({ id: a.id, durationDays: a.durationDays })),
    s.dependencies
  );
  const criticalActivityIds = getCriticalPath(cpmResults);

  const pv = s.activities.reduce((sum, a) => {
    if (a.plannedFinish <= TODAY) return sum + a.budget;
    if (a.plannedStart >= TODAY) return sum;
    const totalDays = Math.max(1, dayDiff(a.plannedStart, a.plannedFinish));
    const elapsed = Math.max(0, dayDiff(a.plannedStart, TODAY));
    return sum + a.budget * (elapsed / totalDays);
  }, 0);
  const ev = s.activities.reduce((sum, a) => sum + a.budget * (a.percentComplete / 100), 0);
  const ac = s.activities.reduce((sum, a) => sum + a.actualCost, 0);
  const evm = computeEvm({ pv, ev, ac, bac: s.project.bac });

  return {
    asOfDate: TODAY,
    project: s.project,
    charter: s.charter,
    users: s.users,
    wbsNodes: s.wbsNodes,
    activities,
    criticalActivityIds,
    evm,
    baselines: s.baselines,
    changeRequests: s.changeRequests,
    risks: s.risks,
    issues: s.issues,
    assumptions: s.assumptions,
    decisions: s.decisions,
    actions: s.actionsLog,
    approvals: s.approvals,
    resourceAllocations: s.resourceAllocations,
    lessonsLearned: s.lessonsLearned,
    statusReports: s.statusReports,
    communicationRecords: s.communicationRecords,
    stakeholders: s.stakeholders,
    raciEntries: s.raciEntries,
  };
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000);
}
