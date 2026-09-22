"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  actions as seedActions,
  activities as seedActivities,
  approvals as seedApprovals,
  assumptions as seedAssumptions,
  baselines as seedBaselines,
  changeRequests as seedChangeRequests,
  charter as seedCharter,
  communicationRecords as seedCommunicationRecords,
  decisions as seedDecisions,
  dependencies as seedDependencies,
  issues as seedIssues,
  lessonsLearned as seedLessonsLearned,
  phases as seedPhases,
  portfolio as seedPortfolio,
  program as seedProgram,
  project as seedProject,
  raciEntries as seedRaciEntries,
  resourceAllocations as seedResourceAllocations,
  risks as seedRisks,
  stakeholders as seedStakeholders,
  statusReports as seedStatusReports,
  users as seedUsers,
  wbsDictionary as seedWbsDictionary,
  wbsNodes as seedWbsNodes,
} from "@/lib/mock-data/seed";
import type {
  Action,
  ActionStatus,
  Activity,
  Approval,
  ApprovalStatus,
  Assumption,
  Baseline,
  ChangeCategory,
  ChangeRequest,
  ChangeStatus,
  CommunicationRecord,
  Decision,
  FocusArea,
  Issue,
  LessonLearned,
  Phase,
  Portfolio,
  Program,
  Project,
  ProjectCharter,
  RaciEntry,
  RaciRole,
  ResourceAllocation,
  Risk,
  Stakeholder,
  StatusReport,
  User,
  WbsDictionaryEntry,
  WbsNode,
} from "@/lib/types";

export type ViewId =
  | "assistant"
  | "charter"
  | "board"
  | "wbs"
  | "gantt"
  | "governance"
  | "evm"
  | "risk"
  | "raid"
  | "raci"
  | "decisions"
  | "resources"
  | "lessons"
  | "statusReports";

export interface PendingLockedEdit {
  activityId: string;
  field: "plannedDates" | "budget";
  attemptedLabel: string;
}

interface ProjectStoreState {
  // Reference data
  portfolio: Portfolio;
  program: Program;
  project: Project;
  charter: ProjectCharter;
  phases: Phase[];
  users: User[];

  // Scope
  wbsNodes: WbsNode[];
  wbsDictionary: WbsDictionaryEntry[];

  // Schedule
  activities: Activity[];
  dependencies: typeof seedDependencies;

  // Baselines
  baselines: Baseline[];

  // Change control
  changeRequests: ChangeRequest[];

  // Risk
  risks: Risk[];

  // Stakeholders / RACI
  stakeholders: Stakeholder[];
  raciEntries: RaciEntry[];

  // RAID — Issues & Assumptions
  issues: Issue[];
  assumptions: Assumption[];

  // Decisions & Actions
  decisions: Decision[];
  actionsLog: Action[];

  // Governance — Approvals
  approvals: Approval[];

  // Resources
  resourceAllocations: ResourceAllocation[];

  // Knowledge management
  lessonsLearned: LessonLearned[];

  // Status reports & communications
  statusReports: StatusReport[];
  communicationRecords: CommunicationRecord[];

  // UI state
  activeView: ViewId;
  focusAreaFilter: FocusArea | null;
  pendingLockedEdit: PendingLockedEdit | null;

  // Actions
  setActiveView: (view: ViewId) => void;
  setFocusAreaFilter: (area: FocusArea | null) => void;

  updateActivityStatus: (id: string, status: Activity["status"]) => void;
  updateActivityProgress: (id: string, percentComplete: number) => void;

  /** Returns true if the edit was applied directly; false if it was intercepted (baseline locked). */
  attemptUpdateBaselinedField: (
    id: string,
    field: "plannedDates" | "budget",
    patch: Partial<Pick<Activity, "plannedStart" | "plannedFinish" | "budget">>
  ) => boolean;

  clearPendingLockedEdit: () => void;

  submitChangeRequest: (input: {
    title: string;
    description: string;
    category: ChangeCategory;
    requestedById: string;
    targetEntityType: ChangeRequest["targetEntityType"];
    targetEntityId: string;
    costImpact: number;
    scheduleImpactDays: number;
    riskImpact: string;
    scopeImpact: string;
  }) => void;

  updateChangeRequestStatus: (
    id: string,
    status: ChangeStatus,
    actorId: string,
    note: string
  ) => void;

  lockNewBaseline: (name: string, actorId: string, notes: string) => void;

  updateRisk: (id: string, patch: Partial<Risk>) => void;

  setRaciRole: (wbsNodeId: string, stakeholderId: string, role: RaciRole) => void;

  addIssue: (input: Omit<Issue, "id" | "projectId">) => void;
  updateIssue: (id: string, patch: Partial<Issue>) => void;

  addAssumption: (input: Omit<Assumption, "id" | "projectId">) => void;
  updateAssumption: (id: string, patch: Partial<Assumption>) => void;

  addDecision: (input: Omit<Decision, "id" | "projectId" | "actionIds">) => void;
  updateDecisionStatus: (id: string, status: Decision["status"]) => void;

  addAction: (input: Omit<Action, "id" | "projectId" | "completedDate">) => void;
  updateActionStatus: (id: string, status: ActionStatus) => void;

  decideApproval: (id: string, status: ApprovalStatus, notes: string) => void;

  updateResourceAllocation: (id: string, patch: Partial<ResourceAllocation>) => void;

  addLessonLearned: (input: Omit<LessonLearned, "id" | "projectId" | "date">) => void;

  addCommunicationRecord: (input: Omit<CommunicationRecord, "id" | "projectId" | "date">) => void;

  resetToSeed: () => void;
}

function activeBaseline(baselines: Baseline[]): Baseline | undefined {
  return baselines.find((b) => b.isActive);
}

function nextChangeId(existing: ChangeRequest[]): string {
  const max = existing.reduce((m, cr) => {
    const n = parseInt(cr.id.replace("CR-", ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `CR-${String(max + 1).padStart(3, "0")}`;
}

function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((m, item) => {
    const n = parseInt(item.id.replace(`${prefix}-`, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `${prefix}-${max + 1}`;
}

function nextBaselineVersion(existing: Baseline[]): string {
  const versions = existing.map((b) => b.version.replace("v", ""));
  const max = versions.reduce((m, v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `v${(max + 0.1).toFixed(1)}`;
}

const initialState = {
  portfolio: seedPortfolio,
  program: seedProgram,
  project: seedProject,
  charter: seedCharter,
  phases: seedPhases,
  users: seedUsers,
  wbsNodes: seedWbsNodes,
  wbsDictionary: seedWbsDictionary,
  activities: seedActivities,
  dependencies: seedDependencies,
  baselines: seedBaselines,
  changeRequests: seedChangeRequests,
  risks: seedRisks,
  stakeholders: seedStakeholders,
  raciEntries: seedRaciEntries,
  issues: seedIssues,
  assumptions: seedAssumptions,
  decisions: seedDecisions,
  actionsLog: seedActions,
  approvals: seedApprovals,
  resourceAllocations: seedResourceAllocations,
  lessonsLearned: seedLessonsLearned,
  statusReports: seedStatusReports,
  communicationRecords: seedCommunicationRecords,
  activeView: "board" as ViewId,
  focusAreaFilter: null as FocusArea | null,
  pendingLockedEdit: null as PendingLockedEdit | null,
};

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveView: (view) => set({ activeView: view }),
      setFocusAreaFilter: (area) => set({ focusAreaFilter: area }),

      updateActivityStatus: (id, status) =>
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      updateActivityProgress: (id, percentComplete) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, percentComplete: Math.max(0, Math.min(100, percentComplete)) } : a
          ),
        })),

      attemptUpdateBaselinedField: (id, field, patch) => {
        const baseline = activeBaseline(get().baselines);
        const isBaselined = !!baseline?.activitySnapshots.some((snap) => snap.activityId === id);
        if (isBaselined) {
          const activity = get().activities.find((a) => a.id === id);
          set({
            pendingLockedEdit: {
              activityId: id,
              field,
              attemptedLabel: activity?.name ?? id,
            },
          });
          return false;
        }
        set((s) => ({
          activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        }));
        return true;
      },

      clearPendingLockedEdit: () => set({ pendingLockedEdit: null }),

      submitChangeRequest: (input) =>
        set((s) => {
          const id = nextChangeId(s.changeRequests);
          const now = new Date().toISOString();
          const cr: ChangeRequest = {
            id,
            projectId: s.project.id,
            title: input.title,
            description: input.description,
            category: input.category,
            status: "Submitted",
            requestedById: input.requestedById,
            requestedDate: now.slice(0, 10),
            targetEntityType: input.targetEntityType,
            targetEntityId: input.targetEntityId,
            impact: {
              costImpact: input.costImpact,
              scheduleImpactDays: input.scheduleImpactDays,
              riskImpact: input.riskImpact,
              scopeImpact: input.scopeImpact,
            },
            ccbDecisionDate: null,
            ccbDecisionById: null,
            ccbNotes: "",
            changeLog: [
              {
                id: `cl-${id}-1`,
                timestamp: now,
                actorId: input.requestedById,
                action: "Submitted",
                note: "Change request submitted for CCB review.",
              },
            ],
          };
          return { changeRequests: [cr, ...s.changeRequests], pendingLockedEdit: null };
        }),

      updateChangeRequestStatus: (id, status, actorId, note) =>
        set((s) => {
          const now = new Date().toISOString();
          const changeRequests = s.changeRequests.map((cr) => {
            if (cr.id !== id) return cr;
            return {
              ...cr,
              status,
              ccbDecisionDate: status === "Approved" || status === "Rejected" || status === "Deferred" ? now.slice(0, 10) : cr.ccbDecisionDate,
              ccbDecisionById: status === "Approved" || status === "Rejected" || status === "Deferred" ? actorId : cr.ccbDecisionById,
              ccbNotes: note || cr.ccbNotes,
              changeLog: [
                ...cr.changeLog,
                {
                  id: `cl-${id}-${cr.changeLog.length + 1}`,
                  timestamp: now,
                  actorId,
                  action: `Status changed to ${status}`,
                  note: note || `CCB updated status to ${status}.`,
                },
              ],
            };
          });

          // On approval, apply the change's impact to the target activity.
          const approvedCr = changeRequests.find((cr) => cr.id === id && status === "Approved");
          let activities = s.activities;
          if (approvedCr && approvedCr.targetEntityType === "Activity") {
            activities = s.activities.map((a) => {
              if (a.id !== approvedCr.targetEntityId) return a;
              const newFinish = shiftDate(a.plannedFinish, approvedCr.impact.scheduleImpactDays);
              return {
                ...a,
                budget: a.budget + approvedCr.impact.costImpact,
                plannedFinish: newFinish,
              };
            });
          }

          return { changeRequests, activities };
        }),

      lockNewBaseline: (name, actorId, notes) =>
        set((s) => {
          const version = nextBaselineVersion(s.baselines);
          const newBaseline: Baseline = {
            id: `bl-${version}`,
            projectId: s.project.id,
            version,
            name,
            lockedAt: new Date().toISOString(),
            lockedById: actorId,
            isActive: true,
            totalScopeBudget: s.activities.reduce((sum, a) => sum + a.budget, 0),
            activitySnapshots: s.activities.map((a) => ({
              activityId: a.id,
              plannedStart: a.plannedStart,
              plannedFinish: a.plannedFinish,
              budget: a.budget,
            })),
            notes,
          };
          return {
            baselines: [...s.baselines.map((b) => ({ ...b, isActive: false })), newBaseline],
          };
        }),

      updateRisk: (id, patch) =>
        set((s) => ({
          risks: s.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      setRaciRole: (wbsNodeId, stakeholderId, role) =>
        set((s) => {
          let entries = s.raciEntries.filter(
            (e) => !(e.wbsNodeId === wbsNodeId && e.stakeholderId === stakeholderId)
          );
          // Enforce exactly one Accountable per WBS node.
          if (role === "A") {
            entries = entries.map((e) => (e.wbsNodeId === wbsNodeId && e.role === "A" ? { ...e, role: null } : e));
          }
          if (role !== null) {
            entries = [...entries, { wbsNodeId, stakeholderId, role }];
          }
          return { raciEntries: entries };
        }),

      addIssue: (input) =>
        set((s) => ({
          issues: [{ ...input, id: nextId("iss", s.issues), projectId: s.project.id }, ...s.issues],
        })),

      updateIssue: (id, patch) =>
        set((s) => ({
          issues: s.issues.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      addAssumption: (input) =>
        set((s) => ({
          assumptions: [{ ...input, id: nextId("asm", s.assumptions), projectId: s.project.id }, ...s.assumptions],
        })),

      updateAssumption: (id, patch) =>
        set((s) => ({
          assumptions: s.assumptions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      addDecision: (input) =>
        set((s) => ({
          decisions: [{ ...input, id: nextId("dec", s.decisions), projectId: s.project.id, actionIds: [] }, ...s.decisions],
        })),

      updateDecisionStatus: (id, status) =>
        set((s) => ({
          decisions: s.decisions.map((d) => (d.id === id ? { ...d, status } : d)),
        })),

      addAction: (input) =>
        set((s) => {
          const id = nextId("act-item", s.actionsLog);
          const action: Action = { ...input, id, projectId: s.project.id, completedDate: null };
          const decisions =
            input.sourceType === "Decision" && input.sourceId
              ? s.decisions.map((d) => (d.id === input.sourceId ? { ...d, actionIds: [...d.actionIds, id] } : d))
              : s.decisions;
          return { actionsLog: [action, ...s.actionsLog], decisions };
        }),

      updateActionStatus: (id, status) =>
        set((s) => ({
          actionsLog: s.actionsLog.map((a) =>
            a.id === id ? { ...a, status, completedDate: status === "Done" ? new Date().toISOString().slice(0, 10) : a.completedDate } : a
          ),
        })),

      decideApproval: (id, status, notes) =>
        set((s) => ({
          approvals: s.approvals.map((a) =>
            a.id === id ? { ...a, status, notes: notes || a.notes, decisionDate: new Date().toISOString().slice(0, 10) } : a
          ),
        })),

      updateResourceAllocation: (id, patch) =>
        set((s) => ({
          resourceAllocations: s.resourceAllocations.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      addLessonLearned: (input) =>
        set((s) => ({
          lessonsLearned: [
            { ...input, id: nextId("ll", s.lessonsLearned), projectId: s.project.id, date: new Date().toISOString().slice(0, 10) },
            ...s.lessonsLearned,
          ],
        })),

      addCommunicationRecord: (input) =>
        set((s) => ({
          communicationRecords: [
            { ...input, id: nextId("comm", s.communicationRecords), projectId: s.project.id, date: new Date().toISOString().slice(0, 10) },
            ...s.communicationRecords,
          ],
        })),

      resetToSeed: () => set({ ...initialState }),
    }),
    {
      name: "pmi-work-management-store",
      version: 2,
    }
  )
);

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
