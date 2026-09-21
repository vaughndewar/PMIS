"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  activities as seedActivities,
  baselines as seedBaselines,
  changeRequests as seedChangeRequests,
  charter as seedCharter,
  dependencies as seedDependencies,
  phases as seedPhases,
  portfolio as seedPortfolio,
  program as seedProgram,
  project as seedProject,
  raciEntries as seedRaciEntries,
  risks as seedRisks,
  stakeholders as seedStakeholders,
  users as seedUsers,
  wbsDictionary as seedWbsDictionary,
  wbsNodes as seedWbsNodes,
} from "@/lib/mock-data/seed";
import type {
  Activity,
  Baseline,
  ChangeCategory,
  ChangeRequest,
  ChangeStatus,
  FocusArea,
  Phase,
  Portfolio,
  Program,
  Project,
  ProjectCharter,
  RaciEntry,
  RaciRole,
  Risk,
  Stakeholder,
  User,
  WbsDictionaryEntry,
  WbsNode,
} from "@/lib/types";

export type ViewId =
  | "charter"
  | "board"
  | "wbs"
  | "gantt"
  | "governance"
  | "evm"
  | "risk"
  | "raci";

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

      resetToSeed: () => set({ ...initialState }),
    }),
    {
      name: "pmi-work-management-store",
      version: 1,
    }
  )
);

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
