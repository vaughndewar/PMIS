// Domain model for the PMI-aligned Enterprise Work Management Platform.
// Terminology follows PMBOK Guide - 8th Edition and ANSI/PMI 99-001-2025.

// ---------------------------------------------------------------------------
// 1. System hierarchy
// ---------------------------------------------------------------------------

export type HierarchyLevel =
  | "Portfolio"
  | "Program"
  | "Project"
  | "Phase"
  | "ControlAccount"
  | "WorkPackage"
  | "Activity";

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  programIds: string[];
  projectIds: string[];
}

export interface Program {
  id: string;
  portfolioId: string;
  name: string;
  description: string;
  projectIds: string[];
}

// ---------------------------------------------------------------------------
// 2. Project Charter
// ---------------------------------------------------------------------------

export interface SuccessCriterion {
  id: string;
  description: string;
  metric: string;
  target: string;
  isMet: boolean;
}

export interface ProjectCharter {
  projectId: string;
  businessCase: string;
  strategicAlignment: string;
  successCriteria: SuccessCriterion[];
  exitCriteria: string[];
  authorizedBudget: number;
  assumptions: string[];
  constraints: string[];
  projectManagerId: string;
  sponsorId: string;
  approvedDate: string;
}

export type FocusArea =
  | "Initiating"
  | "Planning"
  | "Executing"
  | "MonitoringControlling"
  | "Closing";

export const FOCUS_AREAS: { id: FocusArea; label: string }[] = [
  { id: "Initiating", label: "Initiating" },
  { id: "Planning", label: "Planning" },
  { id: "Executing", label: "Executing" },
  { id: "MonitoringControlling", label: "Monitoring & Controlling" },
  { id: "Closing", label: "Closing" },
];

export type ProjectStatus = "OnTrack" | "AtRisk" | "OffTrack" | "Closed";

export interface Project {
  id: string;
  programId: string | null;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  projectManagerId: string;
  sponsorId: string;
  bac: number; // Budget at Completion
  currentFocusArea: FocusArea;
}

export interface Phase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// 3. Scope & WBS
// ---------------------------------------------------------------------------

export type WbsNodeType = "ControlAccount" | "WorkPackage" | "Activity";

export interface WbsDictionaryEntry {
  wbsNodeId: string;
  statementOfWork: string;
  responsibleOwnerId: string;
  acceptanceCriteria: string;
  resourcesRequired: string;
  costEstimate: number;
}

export interface WbsNode {
  id: string;
  projectId: string;
  parentId: string | null;
  code: string; // e.g. 1.1, 1.1.1
  name: string;
  type: WbsNodeType;
  percentComplete: number; // 0-100, rolled up for parents
  budget: number;
  controlAccountId?: string | null; // for WorkPackage / Activity: owning control account
}

// ---------------------------------------------------------------------------
// 4. Schedule & Dependencies (PDM)
// ---------------------------------------------------------------------------

export type DependencyType = "FS" | "SS" | "FF" | "SF";

export interface Dependency {
  id: string;
  predecessorId: string; // Activity id
  successorId: string; // Activity id
  type: DependencyType;
  lagDays: number; // negative = lead, positive = lag
}

export type ActivityStatus =
  | "NotStarted"
  | "InProgress"
  | "Complete"
  | "Blocked";

export interface Activity {
  id: string;
  projectId: string;
  wbsNodeId: string; // link to WBS (Activity-level node)
  name: string;
  focusArea: FocusArea;
  status: ActivityStatus;
  assigneeId: string | null;
  tags: string[];
  durationDays: number;
  plannedStart: string; // ISO date - baseline
  plannedFinish: string; // ISO date - baseline
  actualStart: string | null;
  actualFinish: string | null;
  percentComplete: number;
  budget: number; // planned cost for this activity (feeds PV)
  actualCost: number; // AC accrued to date

  // CPM outputs (computed, not authoritative input)
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  totalFloat?: number;
  freeFloat?: number;
  isCritical?: boolean;
}

// ---------------------------------------------------------------------------
// 5. Performance Measurement Baseline (PMB)
// ---------------------------------------------------------------------------

export interface BaselineActivitySnapshot {
  activityId: string;
  plannedStart: string;
  plannedFinish: string;
  budget: number;
}

export interface Baseline {
  id: string;
  projectId: string;
  version: string; // e.g. "v1.0"
  name: string;
  lockedAt: string; // ISO datetime
  lockedById: string;
  isActive: boolean;
  totalScopeBudget: number;
  activitySnapshots: BaselineActivitySnapshot[];
  notes: string;
}

// ---------------------------------------------------------------------------
// 6. Integrated Change Control
// ---------------------------------------------------------------------------

export type ChangeCategory =
  | "CorrectiveAction"
  | "PreventiveAction"
  | "DefectRepair"
  | "ScopeChange";

export type ChangeStatus =
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Deferred";

export interface ChangeImpactAnalysis {
  costImpact: number; // dollar delta
  scheduleImpactDays: number;
  riskImpact: string;
  scopeImpact: string;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  action: string; // e.g. "Submitted", "Moved to Under Review", "Approved by CCB"
  note: string;
}

export interface ChangeRequest {
  id: string; // Change ID, e.g. CR-004
  projectId: string;
  title: string;
  description: string;
  category: ChangeCategory;
  status: ChangeStatus;
  requestedById: string;
  requestedDate: string;
  targetEntityType: "Activity" | "WbsNode" | "Baseline" | "Charter";
  targetEntityId: string;
  impact: ChangeImpactAnalysis;
  ccbDecisionDate: string | null;
  ccbDecisionById: string | null;
  ccbNotes: string;
  changeLog: ChangeLogEntry[];
}

// ---------------------------------------------------------------------------
// 7. Earned Value Management (raw inputs live on Activity: budget/AC/% complete)
// ---------------------------------------------------------------------------

export interface EvmSnapshot {
  asOfDate: string;
  pv: number;
  ev: number;
  ac: number;
  bac: number;
}

export interface EvmTimeSeriesPoint {
  date: string;
  cumulativePV: number;
  cumulativeEV: number;
  cumulativeAC: number;
}

// ---------------------------------------------------------------------------
// 8. Risk Register
// ---------------------------------------------------------------------------

export type RiskClassification = "Threat" | "Opportunity";

export type RiskResponseStrategy =
  | "Avoid"
  | "Mitigate"
  | "Transfer"
  | "Accept"
  | "Exploit"
  | "Enhance"
  | "Share";

export interface Risk {
  id: string;
  projectId: string;
  cause: string;
  event: string;
  consequence: string;
  classification: RiskClassification;
  probability: number; // 1-5
  impact: number; // 1-5
  responseStrategy: RiskResponseStrategy;
  triggerCondition: string;
  ownerId: string;
  status: "Open" | "Mitigated" | "Closed" | "Occurred";
}

// ---------------------------------------------------------------------------
// 9. Stakeholders & RACI
// ---------------------------------------------------------------------------

export type DirectionOfInfluence = "Upward" | "Downward" | "Outward" | "Sideward";

export type EngagementLevel =
  | "Unaware"
  | "Resistant"
  | "Neutral"
  | "Supportive"
  | "Leading";

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  organization: string;
  directionOfInfluence: DirectionOfInfluence;
  currentEngagement: EngagementLevel;
  desiredEngagement: EngagementLevel;
  powerLevel: number; // 1-5
  interestLevel: number; // 1-5
}

export type RaciRole = "R" | "A" | "C" | "I" | null;

export interface RaciEntry {
  wbsNodeId: string;
  stakeholderId: string;
  role: RaciRole;
}

// ---------------------------------------------------------------------------
// Users (resources / assignees / PMs)
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  initials: string;
}
