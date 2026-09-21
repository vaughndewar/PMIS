// Seed dataset: "Global Customer Portal Digital Transformation"
// BAC = $450,000, 6-month duration, 15+ activities, 4 PDM dependencies,
// 5 risks, 4 stakeholders, locked Baseline v1.0 with 1 pending Change Request.

import type {
  Action,
  Activity,
  Approval,
  Assumption,
  Baseline,
  ChangeRequest,
  CommunicationRecord,
  Decision,
  Dependency,
  Issue,
  LessonLearned,
  Phase,
  Portfolio,
  Program,
  Project,
  ProjectCharter,
  RaciEntry,
  ResourceAllocation,
  Risk,
  Stakeholder,
  StatusReport,
  User,
  WbsDictionaryEntry,
  WbsNode,
} from "@/lib/types";

export const PROJECT_ID = "proj-cportal";
const START = "2025-01-06"; // project start (Monday)

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const users: User[] = [
  { id: "u-pm", name: "Priya Nair", title: "Project Manager", avatarColor: "bg-violet-500", initials: "PN" },
  { id: "u-sponsor", name: "Marcus Webb", title: "Executive Sponsor / VP Customer Experience", avatarColor: "bg-amber-500", initials: "MW" },
  { id: "u-arch", name: "Elena Torres", title: "Solutions Architect", avatarColor: "bg-sky-500", initials: "ET" },
  { id: "u-lead-fe", name: "Sam Okafor", title: "Frontend Lead", avatarColor: "bg-emerald-500", initials: "SO" },
  { id: "u-lead-be", name: "Jian Wu", title: "Backend Lead", avatarColor: "bg-rose-500", initials: "JW" },
  { id: "u-qa", name: "Grace Kim", title: "QA Lead", avatarColor: "bg-orange-500", initials: "GK" },
  { id: "u-security", name: "David Kaplan", title: "Security & Compliance Officer", avatarColor: "bg-cyan-600", initials: "DK" },
  { id: "u-ux", name: "Lena Fischer", title: "UX Designer", avatarColor: "bg-pink-500", initials: "LF" },
  { id: "u-cx", name: "Aisha Rahman", title: "Customer Support Director", avatarColor: "bg-lime-600", initials: "AR" },
  { id: "u-vendor", name: "Tom Bradley", title: "Vendor Delivery Manager (Contracted Integrator)", avatarColor: "bg-slate-500", initials: "TB" },
];

// ---------------------------------------------------------------------------
// Portfolio / Program / Project
// ---------------------------------------------------------------------------
export const portfolio: Portfolio = {
  id: "port-cx",
  name: "Customer Experience Transformation Portfolio",
  description: "Strategic initiatives modernizing customer-facing digital channels.",
  programIds: ["prog-digital"],
  projectIds: [PROJECT_ID],
};

export const program: Program = {
  id: "prog-digital",
  portfolioId: "port-cx",
  name: "Digital Channels Modernization Program",
  description: "Programs delivering self-service, omni-channel customer capabilities.",
  projectIds: [PROJECT_ID],
};

export const project: Project = {
  id: PROJECT_ID,
  programId: "prog-digital",
  name: "Global Customer Portal Digital Transformation",
  description:
    "Re-platform the global customer self-service portal onto a modern, API-driven architecture with SSO, case management, and multilingual support across 12 markets.",
  status: "AtRisk",
  startDate: START,
  endDate: "2025-07-04",
  projectManagerId: "u-pm",
  sponsorId: "u-sponsor",
  bac: 450000,
  currentFocusArea: "Executing",
};

export const phases: Phase[] = [
  { id: "phase-1", projectId: PROJECT_ID, name: "Initiating & Planning", order: 1, startDate: "2025-01-06", endDate: "2025-02-07" },
  { id: "phase-2", projectId: PROJECT_ID, name: "Design & Architecture", order: 2, startDate: "2025-02-10", endDate: "2025-03-14" },
  { id: "phase-3", projectId: PROJECT_ID, name: "Build & Integration", order: 3, startDate: "2025-03-17", endDate: "2025-05-23" },
  { id: "phase-4", projectId: PROJECT_ID, name: "Test, UAT & Cutover", order: 4, startDate: "2025-05-26", endDate: "2025-06-27" },
  { id: "phase-5", projectId: PROJECT_ID, name: "Closing", order: 5, startDate: "2025-06-30", endDate: "2025-07-04" },
];

// ---------------------------------------------------------------------------
// Project Charter
// ---------------------------------------------------------------------------
export const charter: ProjectCharter = {
  projectId: PROJECT_ID,
  businessCase:
    "Legacy customer portal (est. 2014) drives 38% of support ticket volume due to poor self-service completion rates and lacks SSO / mobile support. Re-platforming is projected to reduce Tier-1 ticket volume by 25% and improve NPS by 15 points within two quarters of launch.",
  strategicAlignment:
    "Directly advances the Customer Experience Transformation Portfolio's FY25 objective to unify digital self-service across all regions ahead of the EMEA retail expansion.",
  successCriteria: [
    { id: "sc-1", description: "Reduce Tier-1 support ticket volume", metric: "Tickets/month", target: "-25% vs. baseline", isMet: false },
    { id: "sc-2", description: "Improve customer Net Promoter Score", metric: "NPS", target: "+15 pts within 2 quarters", isMet: false },
    { id: "sc-3", description: "Portal available in target markets", metric: "Languages live", target: "12 languages at launch", isMet: false },
    { id: "sc-4", description: "SSO adoption at launch", metric: "% of logins via SSO", target: "≥ 90%", isMet: false },
  ],
  exitCriteria: [
    "UAT sign-off received from all 4 regional business owners",
    "Legacy portal traffic fully cut over with zero P1 defects for 2 weeks",
    "Support runbook and knowledge transfer completed to Operations",
  ],
  authorizedBudget: 450000,
  assumptions: [
    "Identity provider (Okta) integration is available and contractually in place",
    "Regional content teams deliver localized copy on schedule",
  ],
  constraints: [
    "Must launch before EMEA retail expansion (July 2025)",
    "Cannot introduce downtime greater than 4 hours during cutover",
  ],
  projectManagerId: "u-pm",
  sponsorId: "u-sponsor",
  approvedDate: "2025-01-08",
};

// ---------------------------------------------------------------------------
// WBS (Control Accounts -> Work Packages -> Activities) + WBS Dictionary
// ---------------------------------------------------------------------------
export const wbsNodes: WbsNode[] = [
  // Control Accounts
  { id: "wbs-1", projectId: PROJECT_ID, parentId: null, code: "1", name: "Project Management", type: "ControlAccount", percentComplete: 55, budget: 45000 },
  { id: "wbs-2", projectId: PROJECT_ID, parentId: null, code: "2", name: "Design & Architecture", type: "ControlAccount", percentComplete: 80, budget: 70000 },
  { id: "wbs-3", projectId: PROJECT_ID, parentId: null, code: "3", name: "Portal Build & Integration", type: "ControlAccount", percentComplete: 40, budget: 220000 },
  { id: "wbs-4", projectId: PROJECT_ID, parentId: null, code: "4", name: "Test, UAT & Cutover", type: "ControlAccount", percentComplete: 5, budget: 90000 },
  { id: "wbs-5", projectId: PROJECT_ID, parentId: null, code: "5", name: "Closing", type: "ControlAccount", percentComplete: 0, budget: 25000 },

  // Work Packages under 1. Project Management
  { id: "wbs-1.1", projectId: PROJECT_ID, parentId: "wbs-1", code: "1.1", name: "Project Governance", type: "WorkPackage", percentComplete: 60, budget: 25000, controlAccountId: "wbs-1" },
  { id: "wbs-1.2", projectId: PROJECT_ID, parentId: "wbs-1", code: "1.2", name: "Stakeholder & Communications Mgmt", type: "WorkPackage", percentComplete: 50, budget: 20000, controlAccountId: "wbs-1" },

  // Work Packages under 2. Design & Architecture
  { id: "wbs-2.1", projectId: PROJECT_ID, parentId: "wbs-2", code: "2.1", name: "Solution Architecture", type: "WorkPackage", percentComplete: 100, budget: 35000, controlAccountId: "wbs-2" },
  { id: "wbs-2.2", projectId: PROJECT_ID, parentId: "wbs-2", code: "2.2", name: "UX Design & Prototyping", type: "WorkPackage", percentComplete: 60, budget: 35000, controlAccountId: "wbs-2" },

  // Work Packages under 3. Portal Build & Integration
  { id: "wbs-3.1", projectId: PROJECT_ID, parentId: "wbs-3", code: "3.1", name: "Identity & SSO Integration", type: "WorkPackage", percentComplete: 65, budget: 60000, controlAccountId: "wbs-3" },
  { id: "wbs-3.2", projectId: PROJECT_ID, parentId: "wbs-3", code: "3.2", name: "Case Management Module", type: "WorkPackage", percentComplete: 45, budget: 80000, controlAccountId: "wbs-3" },
  { id: "wbs-3.3", projectId: PROJECT_ID, parentId: "wbs-3", code: "3.3", name: "Multilingual Content Platform", type: "WorkPackage", percentComplete: 20, budget: 50000, controlAccountId: "wbs-3" },
  { id: "wbs-3.4", projectId: PROJECT_ID, parentId: "wbs-3", code: "3.4", name: "API Gateway & Legacy Integration", type: "WorkPackage", percentComplete: 30, budget: 30000, controlAccountId: "wbs-3" },

  // Work Packages under 4. Test, UAT & Cutover
  { id: "wbs-4.1", projectId: PROJECT_ID, parentId: "wbs-4", code: "4.1", name: "System & Regression Testing", type: "WorkPackage", percentComplete: 10, budget: 35000, controlAccountId: "wbs-4" },
  { id: "wbs-4.2", projectId: PROJECT_ID, parentId: "wbs-4", code: "4.2", name: "UAT with Regional Business Owners", type: "WorkPackage", percentComplete: 0, budget: 30000, controlAccountId: "wbs-4" },
  { id: "wbs-4.3", projectId: PROJECT_ID, parentId: "wbs-4", code: "4.3", name: "Production Cutover", type: "WorkPackage", percentComplete: 0, budget: 25000, controlAccountId: "wbs-4" },

  // Work Packages under 5. Closing
  { id: "wbs-5.1", projectId: PROJECT_ID, parentId: "wbs-5", code: "5.1", name: "Transition to Operations", type: "WorkPackage", percentComplete: 0, budget: 15000, controlAccountId: "wbs-5" },
  { id: "wbs-5.2", projectId: PROJECT_ID, parentId: "wbs-5", code: "5.2", name: "Lessons Learned & Contract Closure", type: "WorkPackage", percentComplete: 0, budget: 10000, controlAccountId: "wbs-5" },
];

export const wbsDictionary: WbsDictionaryEntry[] = [
  { wbsNodeId: "wbs-1.1", statementOfWork: "Establish governance cadence, charter, and reporting rhythm.", responsibleOwnerId: "u-pm", acceptanceCriteria: "Charter approved; steering committee cadence established.", resourcesRequired: "PM, Sponsor", costEstimate: 25000 },
  { wbsNodeId: "wbs-1.2", statementOfWork: "Maintain stakeholder register, engagement plan, and status communications.", responsibleOwnerId: "u-pm", acceptanceCriteria: "Stakeholder register current; comms plan executed weekly.", resourcesRequired: "PM", costEstimate: 20000 },
  { wbsNodeId: "wbs-2.1", statementOfWork: "Define target architecture, integration patterns, and non-functional requirements.", responsibleOwnerId: "u-arch", acceptanceCriteria: "Architecture decision record approved by CCB.", resourcesRequired: "Architect, Security", costEstimate: 35000 },
  { wbsNodeId: "wbs-2.2", statementOfWork: "Produce UX research, wireframes, and clickable prototypes for portal redesign.", responsibleOwnerId: "u-ux", acceptanceCriteria: "Prototype validated with 5 customer usability sessions.", resourcesRequired: "UX Designer, CX Director", costEstimate: 35000 },
  { wbsNodeId: "wbs-3.1", statementOfWork: "Integrate Okta SSO across all portal entry points.", responsibleOwnerId: "u-lead-be", acceptanceCriteria: "SSO login success rate ≥ 99.5% in staging.", resourcesRequired: "Backend Lead, Security", costEstimate: 60000 },
  { wbsNodeId: "wbs-3.2", statementOfWork: "Build case creation, tracking, and agent-assist workflows.", responsibleOwnerId: "u-lead-be", acceptanceCriteria: "Case module passes functional test suite.", resourcesRequired: "Backend Lead, Frontend Lead", costEstimate: 80000 },
  { wbsNodeId: "wbs-3.3", statementOfWork: "Deliver CMS-driven multilingual content pipeline for 12 markets.", responsibleOwnerId: "u-lead-fe", acceptanceCriteria: "All 12 locales render correctly with translated content.", resourcesRequired: "Frontend Lead, Vendor", costEstimate: 50000 },
  { wbsNodeId: "wbs-3.4", statementOfWork: "Build API gateway layer bridging legacy backend systems.", responsibleOwnerId: "u-lead-be", acceptanceCriteria: "Gateway passes load test at 3x expected peak traffic.", resourcesRequired: "Backend Lead, Vendor", costEstimate: 30000 },
  { wbsNodeId: "wbs-4.1", statementOfWork: "Execute system, integration, and regression test cycles.", responsibleOwnerId: "u-qa", acceptanceCriteria: "Zero P1/P2 defects open at exit.", resourcesRequired: "QA Lead", costEstimate: 35000 },
  { wbsNodeId: "wbs-4.2", statementOfWork: "Coordinate UAT sessions with regional business owners.", responsibleOwnerId: "u-cx", acceptanceCriteria: "Sign-off from all 4 regions.", resourcesRequired: "CX Director, QA Lead", costEstimate: 30000 },
  { wbsNodeId: "wbs-4.3", statementOfWork: "Execute production cutover and hypercare.", responsibleOwnerId: "u-arch", acceptanceCriteria: "Cutover completed within 4-hour window; zero P1 for 2 weeks.", resourcesRequired: "Architect, Backend Lead", costEstimate: 25000 },
  { wbsNodeId: "wbs-5.1", statementOfWork: "Transition support runbooks and knowledge to Operations.", responsibleOwnerId: "u-pm", acceptanceCriteria: "Ops team certified on runbook.", resourcesRequired: "PM, Support Director", costEstimate: 15000 },
  { wbsNodeId: "wbs-5.2", statementOfWork: "Facilitate lessons learned session and close vendor contracts.", responsibleOwnerId: "u-pm", acceptanceCriteria: "Lessons learned archived; vendor contract closed.", resourcesRequired: "PM, Procurement", costEstimate: 10000 },
];

// ---------------------------------------------------------------------------
// Activities (Activity-level WBS nodes are implicit via wbsNodeId link to WPs above)
// 16 activities across the 5 control accounts.
// ---------------------------------------------------------------------------
export const activities: Activity[] = [
  { id: "act-01", projectId: PROJECT_ID, wbsNodeId: "wbs-1.1", name: "Charter & Governance Setup", focusArea: "Initiating", status: "Complete", assigneeId: "u-pm", tags: ["governance"], durationDays: 10, plannedStart: "2025-01-06", plannedFinish: "2025-01-17", actualStart: "2025-01-06", actualFinish: "2025-01-16", percentComplete: 100, budget: 15000, actualCost: 14200 },
  { id: "act-02", projectId: PROJECT_ID, wbsNodeId: "wbs-1.2", name: "Stakeholder Register & Comms Plan", focusArea: "Initiating", status: "Complete", assigneeId: "u-pm", tags: ["stakeholders"], durationDays: 8, plannedStart: "2025-01-06", plannedFinish: "2025-01-15", actualStart: "2025-01-06", actualFinish: "2025-01-15", percentComplete: 100, budget: 10000, actualCost: 9500 },
  { id: "act-03", projectId: PROJECT_ID, wbsNodeId: "wbs-2.1", name: "Target Architecture & ADR", focusArea: "Planning", status: "Complete", assigneeId: "u-arch", tags: ["architecture"], durationDays: 15, plannedStart: "2025-01-20", plannedFinish: "2025-02-07", actualStart: "2025-01-20", actualFinish: "2025-02-10", percentComplete: 100, budget: 35000, actualCost: 38500 },
  { id: "act-04", projectId: PROJECT_ID, wbsNodeId: "wbs-2.2", name: "UX Research & Prototyping", focusArea: "Planning", status: "InProgress", assigneeId: "u-ux", tags: ["ux", "design"], durationDays: 20, plannedStart: "2025-02-10", plannedFinish: "2025-03-07", actualStart: "2025-02-10", actualFinish: null, percentComplete: 70, budget: 35000, actualCost: 27000 },
  { id: "act-05", projectId: PROJECT_ID, wbsNodeId: "wbs-3.1", name: "Okta SSO Integration", focusArea: "Executing", status: "InProgress", assigneeId: "u-lead-be", tags: ["security", "integration"], durationDays: 25, plannedStart: "2025-02-10", plannedFinish: "2025-03-14", actualStart: "2025-02-12", actualFinish: null, percentComplete: 65, budget: 60000, actualCost: 44000 },
  { id: "act-06", projectId: PROJECT_ID, wbsNodeId: "wbs-3.4", name: "API Gateway Build", focusArea: "Executing", status: "InProgress", assigneeId: "u-lead-be", tags: ["integration"], durationDays: 20, plannedStart: "2025-03-17", plannedFinish: "2025-04-11", actualStart: "2025-03-17", actualFinish: null, percentComplete: 55, budget: 30000, actualCost: 19000 },
  { id: "act-07", projectId: PROJECT_ID, wbsNodeId: "wbs-3.2", name: "Case Management — Core Workflows", focusArea: "Executing", status: "InProgress", assigneeId: "u-lead-be", tags: ["build"], durationDays: 30, plannedStart: "2025-03-17", plannedFinish: "2025-04-25", actualStart: "2025-03-20", actualFinish: null, percentComplete: 45, budget: 50000, actualCost: 33000 },
  { id: "act-08", projectId: PROJECT_ID, wbsNodeId: "wbs-3.2", name: "Case Management — Agent Assist UI", focusArea: "Executing", status: "NotStarted", assigneeId: "u-lead-fe", tags: ["build", "ui"], durationDays: 20, plannedStart: "2025-04-28", plannedFinish: "2025-05-23", actualStart: null, actualFinish: null, percentComplete: 0, budget: 30000, actualCost: 0 },
  { id: "act-09", projectId: PROJECT_ID, wbsNodeId: "wbs-3.3", name: "Multilingual CMS Pipeline", focusArea: "Executing", status: "InProgress", assigneeId: "u-lead-fe", tags: ["localization"], durationDays: 25, plannedStart: "2025-03-17", plannedFinish: "2025-04-18", actualStart: "2025-03-24", actualFinish: null, percentComplete: 20, budget: 30000, actualCost: 9500 },
  { id: "act-10", projectId: PROJECT_ID, wbsNodeId: "wbs-3.3", name: "Regional Content Localization (12 markets)", focusArea: "Executing", status: "NotStarted", assigneeId: "u-vendor", tags: ["localization", "vendor"], durationDays: 20, plannedStart: "2025-04-21", plannedFinish: "2025-05-16", actualStart: null, actualFinish: null, percentComplete: 0, budget: 20000, actualCost: 0 },
  { id: "act-11", projectId: PROJECT_ID, wbsNodeId: "wbs-4.1", name: "System & Regression Test Cycle 1", focusArea: "MonitoringControlling", status: "NotStarted", assigneeId: "u-qa", tags: ["testing"], durationDays: 15, plannedStart: "2025-05-26", plannedFinish: "2025-06-13", actualStart: null, actualFinish: null, percentComplete: 0, budget: 20000, actualCost: 0 },
  { id: "act-12", projectId: PROJECT_ID, wbsNodeId: "wbs-4.1", name: "Security & Performance Test", focusArea: "MonitoringControlling", status: "NotStarted", assigneeId: "u-security", tags: ["security", "testing"], durationDays: 10, plannedStart: "2025-05-26", plannedFinish: "2025-06-09", actualStart: null, actualFinish: null, percentComplete: 0, budget: 15000, actualCost: 0 },
  { id: "act-13", projectId: PROJECT_ID, wbsNodeId: "wbs-4.2", name: "Regional UAT Sessions", focusArea: "MonitoringControlling", status: "NotStarted", assigneeId: "u-cx", tags: ["uat"], durationDays: 10, plannedStart: "2025-06-16", plannedFinish: "2025-06-27", actualStart: null, actualFinish: null, percentComplete: 0, budget: 30000, actualCost: 0 },
  { id: "act-14", projectId: PROJECT_ID, wbsNodeId: "wbs-4.3", name: "Production Cutover & Hypercare", focusArea: "Executing", status: "NotStarted", assigneeId: "u-arch", tags: ["cutover"], durationDays: 5, plannedStart: "2025-06-30", plannedFinish: "2025-07-04", actualStart: null, actualFinish: null, percentComplete: 0, budget: 25000, actualCost: 0 },
  { id: "act-15", projectId: PROJECT_ID, wbsNodeId: "wbs-5.1", name: "Operations Knowledge Transfer", focusArea: "Closing", status: "NotStarted", assigneeId: "u-pm", tags: ["closing"], durationDays: 5, plannedStart: "2025-06-30", plannedFinish: "2025-07-04", actualStart: null, actualFinish: null, percentComplete: 0, budget: 15000, actualCost: 0 },
  { id: "act-16", projectId: PROJECT_ID, wbsNodeId: "wbs-5.2", name: "Lessons Learned & Vendor Closeout", focusArea: "Closing", status: "NotStarted", assigneeId: "u-pm", tags: ["closing"], durationDays: 5, plannedStart: "2025-06-30", plannedFinish: "2025-07-04", actualStart: null, actualFinish: null, percentComplete: 0, budget: 10000, actualCost: 0 },
];

// ---------------------------------------------------------------------------
// PDM Dependencies (4 required by spec; a few extra to make the network coherent)
// ---------------------------------------------------------------------------
export const dependencies: Dependency[] = [
  { id: "dep-1", predecessorId: "act-03", successorId: "act-05", type: "FS", lagDays: 0 }, // Architecture -> SSO Integration
  { id: "dep-2", predecessorId: "act-04", successorId: "act-08", type: "SS", lagDays: 15 }, // UX -> Agent Assist UI (start after UX well underway)
  { id: "dep-3", predecessorId: "act-05", successorId: "act-06", type: "FF", lagDays: -5 }, // SSO must finish 5 days before Gateway finishes
  { id: "dep-4", predecessorId: "act-07", successorId: "act-08", type: "FS", lagDays: 3 }, // Core workflows -> Agent Assist UI (+3 day lag)
  { id: "dep-5", predecessorId: "act-06", successorId: "act-11", type: "FS", lagDays: 0 },
  { id: "dep-6", predecessorId: "act-08", successorId: "act-11", type: "FS", lagDays: 0 },
  { id: "dep-7", predecessorId: "act-09", successorId: "act-10", type: "FS", lagDays: 0 },
  { id: "dep-8", predecessorId: "act-10", successorId: "act-13", type: "FS", lagDays: 0 },
  { id: "dep-9", predecessorId: "act-11", successorId: "act-13", type: "FS", lagDays: 0 },
  { id: "dep-10", predecessorId: "act-12", successorId: "act-13", type: "FS", lagDays: 0 },
  { id: "dep-11", predecessorId: "act-13", successorId: "act-14", type: "FS", lagDays: 0 },
  { id: "dep-12", predecessorId: "act-14", successorId: "act-15", type: "FS", lagDays: 0 },
  { id: "dep-13", predecessorId: "act-14", successorId: "act-16", type: "FS", lagDays: 0 },
];

// ---------------------------------------------------------------------------
// Performance Measurement Baseline — locked v1.0
// ---------------------------------------------------------------------------
export const baselines: Baseline[] = [
  {
    id: "bl-v1.0",
    projectId: PROJECT_ID,
    version: "v1.0",
    name: "Initial Performance Measurement Baseline",
    lockedAt: "2025-02-10T17:00:00Z",
    lockedById: "u-pm",
    isActive: true,
    totalScopeBudget: 450000,
    activitySnapshots: activities.map((a) => ({
      activityId: a.id,
      plannedStart: a.plannedStart,
      plannedFinish: a.plannedFinish,
      budget: a.budget,
    })),
    notes: "Baseline locked following sponsor approval of the target architecture and WBS.",
  },
];

// ---------------------------------------------------------------------------
// Integrated Change Control — 1 pending Change Request
// ---------------------------------------------------------------------------
export const changeRequests: ChangeRequest[] = [
  {
    id: "CR-001",
    projectId: PROJECT_ID,
    title: "Extend Multilingual Content Platform duration by 10 days",
    description:
      "Vendor localization partner requires additional lead time to onboard 3 new regional linguists for Southeast Asian markets. Requesting schedule extension for Activity act-10 (Regional Content Localization) and associated budget increase for expedited translation services.",
    category: "ScopeChange",
    status: "UnderReview",
    requestedById: "u-lead-fe",
    requestedDate: "2025-04-02",
    targetEntityType: "Activity",
    targetEntityId: "act-10",
    impact: {
      costImpact: 12000,
      scheduleImpactDays: 10,
      riskImpact: "Moderate — compresses UAT window for APAC region by 10 days.",
      scopeImpact: "No change to deliverable scope; timeline and cost only.",
    },
    ccbDecisionDate: null,
    ccbDecisionById: null,
    ccbNotes: "",
    changeLog: [
      { id: "cl-1", timestamp: "2025-04-02T09:15:00Z", actorId: "u-lead-fe", action: "Submitted", note: "Change request submitted for CCB review." },
      { id: "cl-2", timestamp: "2025-04-03T14:00:00Z", actorId: "u-pm", action: "Moved to Under Review", note: "Added to CCB agenda for 2025-04-09 review session." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Risk Register — 5 risks
// ---------------------------------------------------------------------------
export const risks: Risk[] = [
  {
    id: "risk-1",
    projectId: PROJECT_ID,
    cause: "Okta tenant configuration was inherited from a legacy internal-only SSO setup",
    event: "SSO integration fails to scale to external customer traffic volumes",
    consequence: "Portal login outages during peak traffic, damaging launch credibility",
    classification: "Threat",
    probability: 3,
    impact: 5,
    responseStrategy: "Mitigate",
    triggerCondition: "Load test results below 99.5% success rate at 3x peak volume",
    ownerId: "u-lead-be",
    status: "Open",
  },
  {
    id: "risk-2",
    projectId: PROJECT_ID,
    cause: "Regional localization vendor has limited linguist bench strength for APAC languages",
    event: "Translation delivery slips beyond planned localization window",
    consequence: "UAT delayed for 4 of 12 markets, compressing cutover schedule",
    classification: "Threat",
    probability: 4,
    impact: 3,
    responseStrategy: "Mitigate",
    triggerCondition: "Vendor status report shows <80% translation completion 5 days before deadline",
    ownerId: "u-vendor",
    status: "Open",
  },
  {
    id: "risk-3",
    projectId: PROJECT_ID,
    cause: "New case management module reuses a proven pattern from a prior successful project",
    event: "Development velocity on case workflows exceeds estimates",
    consequence: "Opportunity to reallocate freed budget/time to expand Agent Assist AI features",
    classification: "Opportunity",
    probability: 2,
    impact: 3,
    responseStrategy: "Exploit",
    triggerCondition: "Core workflows module reaches 80% complete 2+ weeks ahead of schedule",
    ownerId: "u-lead-be",
    status: "Open",
  },
  {
    id: "risk-4",
    projectId: PROJECT_ID,
    cause: "Security review of case management module not yet scheduled with InfoSec",
    event: "Security & compliance review uncovers a data-residency gap for EU customer data",
    consequence: "Remediation work required before EU markets can launch, risking scope deferral",
    classification: "Threat",
    probability: 2,
    impact: 5,
    responseStrategy: "Avoid",
    triggerCondition: "InfoSec review flags unresolved data residency finding",
    ownerId: "u-security",
    status: "Open",
  },
  {
    id: "risk-5",
    projectId: PROJECT_ID,
    cause: "Executive sponsor has strong existing relationship with Customer Support leadership",
    event: "Early sponsor engagement accelerates cross-department buy-in for change management",
    consequence: "Faster-than-planned adoption and training rollout post-launch",
    classification: "Opportunity",
    probability: 3,
    impact: 2,
    responseStrategy: "Enhance",
    triggerCondition: "Support leadership requests early access to training materials",
    ownerId: "u-cx",
    status: "Open",
  },
];

// ---------------------------------------------------------------------------
// Stakeholders — 4 stakeholders
// ---------------------------------------------------------------------------
export const stakeholders: Stakeholder[] = [
  { id: "sh-1", name: "Marcus Webb", role: "Executive Sponsor", organization: "VP, Customer Experience", directionOfInfluence: "Upward", currentEngagement: "Leading", desiredEngagement: "Leading", powerLevel: 5, interestLevel: 5 },
  { id: "sh-2", name: "Aisha Rahman", role: "Customer Support Director", organization: "Global Support Operations", directionOfInfluence: "Sideward", currentEngagement: "Supportive", desiredEngagement: "Leading", powerLevel: 4, interestLevel: 5 },
  { id: "sh-3", name: "David Kaplan", role: "Security & Compliance Officer", organization: "InfoSec", directionOfInfluence: "Outward", currentEngagement: "Neutral", desiredEngagement: "Supportive", powerLevel: 4, interestLevel: 3 },
  { id: "sh-4", name: "Tom Bradley", role: "Vendor Delivery Manager", organization: "Contracted Integrator (External)", directionOfInfluence: "Downward", currentEngagement: "Supportive", desiredEngagement: "Supportive", powerLevel: 2, interestLevel: 4 },
];

// ---------------------------------------------------------------------------
// RACI — deliverables (Work Packages) x stakeholders + core team roles
// ---------------------------------------------------------------------------
const raciParticipants = ["u-pm", "u-arch", "u-lead-fe", "u-lead-be", "u-qa", "u-security", "u-ux", "u-cx", "u-vendor", "u-sponsor"];

export const raciEntries: RaciEntry[] = [
  // wbs-1.1 Project Governance
  { wbsNodeId: "wbs-1.1", stakeholderId: "u-pm", role: "A" },
  { wbsNodeId: "wbs-1.1", stakeholderId: "u-sponsor", role: "C" },
  { wbsNodeId: "wbs-1.1", stakeholderId: "u-arch", role: "I" },
  // wbs-1.2 Stakeholder & Comms
  { wbsNodeId: "wbs-1.2", stakeholderId: "u-pm", role: "A" },
  { wbsNodeId: "wbs-1.2", stakeholderId: "u-cx", role: "C" },
  // wbs-2.1 Solution Architecture
  { wbsNodeId: "wbs-2.1", stakeholderId: "u-arch", role: "A" },
  { wbsNodeId: "wbs-2.1", stakeholderId: "u-security", role: "C" },
  { wbsNodeId: "wbs-2.1", stakeholderId: "u-pm", role: "I" },
  // wbs-2.2 UX Design
  { wbsNodeId: "wbs-2.2", stakeholderId: "u-ux", role: "A" },
  { wbsNodeId: "wbs-2.2", stakeholderId: "u-cx", role: "C" },
  { wbsNodeId: "wbs-2.2", stakeholderId: "u-lead-fe", role: "R" },
  // wbs-3.1 SSO Integration
  { wbsNodeId: "wbs-3.1", stakeholderId: "u-lead-be", role: "A" },
  { wbsNodeId: "wbs-3.1", stakeholderId: "u-security", role: "R" },
  { wbsNodeId: "wbs-3.1", stakeholderId: "u-arch", role: "C" },
  // wbs-3.2 Case Management
  { wbsNodeId: "wbs-3.2", stakeholderId: "u-lead-be", role: "A" },
  { wbsNodeId: "wbs-3.2", stakeholderId: "u-lead-fe", role: "R" },
  { wbsNodeId: "wbs-3.2", stakeholderId: "u-cx", role: "C" },
  // wbs-3.3 Multilingual Content
  { wbsNodeId: "wbs-3.3", stakeholderId: "u-lead-fe", role: "A" },
  { wbsNodeId: "wbs-3.3", stakeholderId: "u-vendor", role: "R" },
  { wbsNodeId: "wbs-3.3", stakeholderId: "u-cx", role: "I" },
  // wbs-3.4 API Gateway
  { wbsNodeId: "wbs-3.4", stakeholderId: "u-lead-be", role: "A" },
  { wbsNodeId: "wbs-3.4", stakeholderId: "u-vendor", role: "C" },
  // wbs-4.1 System & Regression Test
  { wbsNodeId: "wbs-4.1", stakeholderId: "u-qa", role: "A" },
  { wbsNodeId: "wbs-4.1", stakeholderId: "u-security", role: "C" },
  // wbs-4.2 UAT
  { wbsNodeId: "wbs-4.2", stakeholderId: "u-cx", role: "A" },
  { wbsNodeId: "wbs-4.2", stakeholderId: "u-qa", role: "R" },
  { wbsNodeId: "wbs-4.2", stakeholderId: "u-pm", role: "I" },
  // wbs-4.3 Production Cutover
  { wbsNodeId: "wbs-4.3", stakeholderId: "u-arch", role: "A" },
  { wbsNodeId: "wbs-4.3", stakeholderId: "u-lead-be", role: "R" },
  { wbsNodeId: "wbs-4.3", stakeholderId: "u-sponsor", role: "I" },
  // wbs-5.1 Transition to Ops
  { wbsNodeId: "wbs-5.1", stakeholderId: "u-pm", role: "A" },
  { wbsNodeId: "wbs-5.1", stakeholderId: "u-cx", role: "C" },
  // wbs-5.2 Lessons Learned & Contract Closure
  { wbsNodeId: "wbs-5.2", stakeholderId: "u-pm", role: "A" },
  { wbsNodeId: "wbs-5.2", stakeholderId: "u-vendor", role: "C" },
];

export const raciParticipantIds = raciParticipants;

// ---------------------------------------------------------------------------
// RAID — Issues & Assumptions
// ---------------------------------------------------------------------------
export const issues: Issue[] = [
  {
    id: "iss-1",
    projectId: PROJECT_ID,
    title: "Okta staging tenant rate-limits load test traffic",
    description: "Load testing for SSO integration is being throttled by Okta's staging tenant rate limits, blocking realistic peak-volume validation.",
    priority: "High",
    status: "InProgress",
    ownerId: "u-lead-be",
    raisedById: "u-security",
    raisedDate: "2025-03-10",
    dueDate: "2025-03-28",
    resolution: "Vendor ticket opened to raise staging tenant rate limits for the duration of load testing.",
    linkedRiskId: "risk-1",
  },
  {
    id: "iss-2",
    projectId: PROJECT_ID,
    title: "APAC translation vendor missed first localization milestone",
    description: "Vendor delivered only 40% of Japanese and Korean strings by the agreed checkpoint.",
    priority: "Medium",
    status: "Open",
    ownerId: "u-vendor",
    raisedById: "u-lead-fe",
    raisedDate: "2025-04-01",
    dueDate: "2025-04-15",
    resolution: "",
    linkedRiskId: "risk-2",
  },
  {
    id: "iss-3",
    projectId: PROJECT_ID,
    title: "Case Management UI fails accessibility contrast check",
    description: "Automated a11y scan flagged insufficient contrast ratio on the new agent-assist status badges.",
    priority: "Low",
    status: "Resolved",
    ownerId: "u-ux",
    raisedById: "u-qa",
    raisedDate: "2025-03-18",
    dueDate: "2025-03-25",
    resolution: "Badge color tokens updated to meet WCAG AA; verified by QA on 2025-03-24.",
    linkedRiskId: null,
  },
];

export const assumptions: Assumption[] = [
  {
    id: "asm-1",
    projectId: PROJECT_ID,
    description: "Okta identity provider integration is contractually available for the full project duration at no additional licensing cost.",
    category: "Technical",
    status: "Validated",
    ownerId: "u-arch",
    validateByDate: "2025-02-07",
    impactIfInvalid: "Would require evaluating an alternate IdP mid-project, adding 4-6 weeks to the SSO work package.",
  },
  {
    id: "asm-2",
    projectId: PROJECT_ID,
    description: "Regional content teams will deliver localized copy for all 12 markets on the agreed schedule.",
    category: "Schedule",
    status: "Invalidated",
    ownerId: "u-vendor",
    validateByDate: "2025-04-01",
    impactIfInvalid: "APAC localization milestone slipped; see Issue iss-2 and Change Request CR-001.",
  },
  {
    id: "asm-3",
    projectId: PROJECT_ID,
    description: "Legacy backend systems expose stable REST APIs sufficient for the new API Gateway without deep refactoring.",
    category: "Technical",
    status: "Unvalidated",
    ownerId: "u-lead-be",
    validateByDate: "2025-04-25",
    impactIfInvalid: "Gateway build could require additional adapter work, impacting the Executing focus area schedule.",
  },
];

// ---------------------------------------------------------------------------
// Decisions & Actions
// ---------------------------------------------------------------------------
export const decisions: Decision[] = [
  {
    id: "dec-1",
    projectId: PROJECT_ID,
    title: "Adopt Okta as sole identity provider for the portal re-platform",
    description: "Selected Okta over building a custom auth layer, based on existing enterprise contract and faster time-to-value.",
    rationale: "Okta is already licensed enterprise-wide; avoids 6+ weeks of custom auth development and ongoing security maintenance burden.",
    decisionOwnerId: "u-sponsor",
    decisionDate: "2025-01-22",
    status: "Decided",
    affectedEntityType: "WbsNode",
    affectedEntityId: "wbs-3.1",
    actionIds: ["act-item-1"],
  },
  {
    id: "dec-2",
    projectId: PROJECT_ID,
    title: "Defer AI-assisted case summarization to a post-launch phase 2",
    description: "Agent Assist UI will ship with manual case notes only at launch; AI summarization moves to a future enhancement.",
    rationale: "Keeps the July launch date achievable within authorized budget; AI summarization adds estimated $80k and 6 weeks.",
    decisionOwnerId: "u-pm",
    decisionDate: "2025-03-05",
    status: "Decided",
    affectedEntityType: "WbsNode",
    affectedEntityId: "wbs-3.2",
    actionIds: ["act-item-2"],
  },
  {
    id: "dec-3",
    projectId: PROJECT_ID,
    title: "Approve 10-day schedule extension for APAC localization",
    description: "Pending CCB approval of CR-001; tentatively agreed in principle by the Sponsor and CX Director pending formal sign-off.",
    rationale: "Protects launch quality for 4 of 12 markets rather than launching with incomplete translations.",
    decisionOwnerId: "u-sponsor",
    decisionDate: "2025-04-03",
    status: "Proposed",
    affectedEntityType: "ChangeRequest",
    affectedEntityId: "CR-001",
    actionIds: ["act-item-3"],
  },
];

export const actions: Action[] = [
  {
    id: "act-item-1",
    projectId: PROJECT_ID,
    title: "Provision production Okta tenant and rotate API keys",
    ownerId: "u-lead-be",
    dueDate: "2025-02-14",
    status: "Done",
    sourceType: "Decision",
    sourceId: "dec-1",
    completedDate: "2025-02-12",
  },
  {
    id: "act-item-2",
    projectId: PROJECT_ID,
    title: "Update product roadmap to reflect Phase 2 AI summarization",
    ownerId: "u-pm",
    dueDate: "2025-03-14",
    status: "Done",
    sourceType: "Decision",
    sourceId: "dec-2",
    completedDate: "2025-03-12",
  },
  {
    id: "act-item-3",
    projectId: PROJECT_ID,
    title: "Prepare CCB briefing materials for CR-001 decision",
    ownerId: "u-pm",
    dueDate: "2025-04-09",
    status: "InProgress",
    sourceType: "Decision",
    sourceId: "dec-3",
    completedDate: null,
  },
  {
    id: "act-item-4",
    projectId: PROJECT_ID,
    title: "File vendor ticket to raise Okta staging rate limits",
    ownerId: "u-lead-be",
    dueDate: "2025-03-20",
    status: "Done",
    sourceType: "Issue",
    sourceId: "iss-1",
    completedDate: "2025-03-17",
  },
  {
    id: "act-item-5",
    projectId: PROJECT_ID,
    title: "Escalate APAC translation delay to vendor account manager",
    ownerId: "u-vendor",
    dueDate: "2025-04-08",
    status: "Open",
    sourceType: "Issue",
    sourceId: "iss-2",
    completedDate: null,
  },
  {
    id: "act-item-6",
    projectId: PROJECT_ID,
    title: "Schedule InfoSec data-residency review for case management module",
    ownerId: "u-security",
    dueDate: "2025-04-30",
    status: "Open",
    sourceType: "Risk",
    sourceId: "risk-4",
    completedDate: null,
  },
];

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------
export const approvals: Approval[] = [
  {
    id: "apr-1",
    projectId: PROJECT_ID,
    title: "Project Charter Approval",
    entityType: "Charter",
    entityId: PROJECT_ID,
    approverId: "u-sponsor",
    status: "Approved",
    requestedDate: "2025-01-07",
    decisionDate: "2025-01-08",
    notes: "Approved without changes.",
  },
  {
    id: "apr-2",
    projectId: PROJECT_ID,
    title: "Performance Measurement Baseline v1.0 Lock",
    entityType: "Baseline",
    entityId: "bl-v1.0",
    approverId: "u-sponsor",
    status: "Approved",
    requestedDate: "2025-02-09",
    decisionDate: "2025-02-10",
    notes: "Approved following review of target architecture and WBS.",
  },
  {
    id: "apr-3",
    projectId: PROJECT_ID,
    title: "CR-001 Schedule & Cost Impact Approval",
    entityType: "ChangeRequest",
    entityId: "CR-001",
    approverId: "u-sponsor",
    status: "Pending",
    requestedDate: "2025-04-03",
    decisionDate: null,
    notes: "Awaiting CCB session outcome.",
  },
];

// ---------------------------------------------------------------------------
// Resource Allocations (capacity & responsibility)
// ---------------------------------------------------------------------------
export const resourceAllocations: ResourceAllocation[] = [
  { id: "ra-1", userId: "u-pm", projectId: PROJECT_ID, roleOnProject: "Project Manager", skills: ["Governance", "Stakeholder Mgmt", "Risk Mgmt"], weeklyCapacityHours: 40, allocationPercent: 100 },
  { id: "ra-2", userId: "u-sponsor", projectId: PROJECT_ID, roleOnProject: "Executive Sponsor", skills: ["Strategy", "Funding Decisions"], weeklyCapacityHours: 40, allocationPercent: 10 },
  { id: "ra-3", userId: "u-arch", projectId: PROJECT_ID, roleOnProject: "Solutions Architect", skills: ["System Design", "Security Architecture", "Integration"], weeklyCapacityHours: 40, allocationPercent: 80 },
  { id: "ra-4", userId: "u-lead-fe", projectId: PROJECT_ID, roleOnProject: "Frontend Lead", skills: ["React", "Accessibility", "Localization"], weeklyCapacityHours: 40, allocationPercent: 100 },
  { id: "ra-5", userId: "u-lead-be", projectId: PROJECT_ID, roleOnProject: "Backend Lead", skills: ["Java", "API Design", "Identity & SSO"], weeklyCapacityHours: 40, allocationPercent: 100 },
  { id: "ra-6", userId: "u-qa", projectId: PROJECT_ID, roleOnProject: "QA Lead", skills: ["Test Automation", "Regression", "Accessibility Testing"], weeklyCapacityHours: 40, allocationPercent: 75 },
  { id: "ra-7", userId: "u-security", projectId: PROJECT_ID, roleOnProject: "Security & Compliance Officer", skills: ["InfoSec", "Data Privacy", "Pen Testing"], weeklyCapacityHours: 40, allocationPercent: 30 },
  { id: "ra-8", userId: "u-ux", projectId: PROJECT_ID, roleOnProject: "UX Designer", skills: ["Research", "Prototyping", "Accessibility"], weeklyCapacityHours: 40, allocationPercent: 60 },
  { id: "ra-9", userId: "u-cx", projectId: PROJECT_ID, roleOnProject: "Customer Support Director", skills: ["Support Ops", "Change Management"], weeklyCapacityHours: 40, allocationPercent: 25 },
  { id: "ra-10", userId: "u-vendor", projectId: PROJECT_ID, roleOnProject: "Vendor Delivery Manager", skills: ["Localization Ops", "Vendor Mgmt"], weeklyCapacityHours: 40, allocationPercent: 50 },
];

// ---------------------------------------------------------------------------
// Lessons Learned
// ---------------------------------------------------------------------------
export const lessonsLearned: LessonLearned[] = [
  {
    id: "ll-1",
    projectId: PROJECT_ID,
    category: "Vendor Management",
    situation: "APAC localization vendor under-delivered against the first translation milestone with no early warning.",
    rootCause: "No interim checkpoint was built into the vendor SOW between kickoff and the full-delivery milestone.",
    recommendation: "Add weekly percent-complete checkpoints to future localization SOWs, with an escalation trigger at any checkpoint below 90% of plan.",
    submittedById: "u-lead-fe",
    date: "2025-04-02",
    tags: ["vendor", "localization", "schedule"],
  },
  {
    id: "ll-2",
    projectId: PROJECT_ID,
    category: "Architecture",
    situation: "Target architecture review ran 3 days over plan because security review was scheduled after, not during, the design workshop.",
    rootCause: "Security & Compliance was treated as a downstream reviewer rather than a co-design participant.",
    recommendation: "Include Security as a core participant in architecture design workshops going forward, not a post-hoc gate.",
    submittedById: "u-arch",
    date: "2025-02-11",
    tags: ["architecture", "security", "process"],
  },
  {
    id: "ll-3",
    projectId: PROJECT_ID,
    category: "Testing",
    situation: "Automated accessibility scanning caught a contrast issue late in the build cycle, requiring rework of shipped components.",
    rootCause: "Accessibility checks were run only before UAT, not as part of each feature's definition of done.",
    recommendation: "Add automated a11y scanning to the CI pipeline for every UI pull request, not just pre-UAT.",
    submittedById: "u-qa",
    date: "2025-03-25",
    tags: ["quality", "accessibility", "automation"],
  },
];

// ---------------------------------------------------------------------------
// Status Reports
// ---------------------------------------------------------------------------
export const statusReports: StatusReport[] = [
  {
    id: "sr-1",
    projectId: PROJECT_ID,
    periodStart: "2025-02-01",
    periodEnd: "2025-02-28",
    overallHealth: "Green",
    scheduleHealth: "Green",
    costHealth: "Amber",
    summary: "Architecture and UX work packages progressing well. Architecture finished 3 days late due to a late-added security review, absorbed within float.",
    accomplishments: [
      "Target Architecture & ADR completed and approved by CCB",
      "UX research and prototyping 40% complete",
      "SSO integration kicked off with Okta staging tenant provisioned",
    ],
    upcoming: [
      "Begin Case Management core workflow build",
      "Kick off API Gateway build",
      "Start multilingual CMS pipeline build",
    ],
    authorId: "u-pm",
    date: "2025-03-01",
  },
  {
    id: "sr-2",
    projectId: PROJECT_ID,
    periodStart: "2025-03-01",
    periodEnd: "2025-03-31",
    overallHealth: "Amber",
    scheduleHealth: "Amber",
    costHealth: "Red",
    summary: "Cost performance has slipped below plan (CPI 0.87) driven by SSO integration rework and vendor localization delays. Change Request submitted to protect APAC launch quality.",
    accomplishments: [
      "SSO integration reached 65% complete",
      "Case Management core workflows underway",
      "Case Management UI accessibility issue found and resolved",
    ],
    upcoming: [
      "CCB decision on CR-001 (APAC localization extension)",
      "Continue Case Management and API Gateway build",
      "Begin regional content localization for non-APAC markets",
    ],
    authorId: "u-pm",
    date: "2025-04-01",
  },
];

// ---------------------------------------------------------------------------
// Communication Records
// ---------------------------------------------------------------------------
export const communicationRecords: CommunicationRecord[] = [
  {
    id: "comm-1",
    projectId: PROJECT_ID,
    date: "2025-01-09",
    channel: "Steering Committee Meeting",
    audience: "Sponsor, Regional Business Owners",
    summary: "Kickoff review of charter, success criteria, and governance cadence. Sponsor confirmed monthly steering committee cadence.",
    authorId: "u-pm",
    relatedDecisionId: null,
  },
  {
    id: "comm-2",
    projectId: PROJECT_ID,
    date: "2025-03-01",
    channel: "Status Email",
    audience: "All Stakeholders",
    summary: "Distributed February status report; flagged architecture schedule slip absorbed within float, no impact to overall timeline.",
    authorId: "u-pm",
    relatedDecisionId: null,
  },
  {
    id: "comm-3",
    projectId: PROJECT_ID,
    date: "2025-04-03",
    channel: "Sponsor 1:1",
    audience: "Marcus Webb (Sponsor)",
    summary: "Briefed sponsor on CR-001 rationale ahead of CCB session; sponsor indicated support pending formal review.",
    authorId: "u-pm",
    relatedDecisionId: "dec-3",
  },
];
