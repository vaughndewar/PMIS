# PMI WorkHub — Enterprise Work Management Platform

A functional prototype of a PMI-compliant Enterprise Work Management Platform, aligned with
PMBOK® Guide – 8th Edition and ANSI/PMI 99-001-2025 terminology. It bridges the collaborative
UX of tools like Asana with PMI governance concepts: Focus Areas, Performance Domains,
Baselines, EVM, CPM, and Integrated Change Control.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Radix UI primitives (hand-wrapped, shadcn-style) + Lucide icons
- Zustand for state, persisted to `localStorage`
- Recharts for the EVM S-curve
- `@anthropic-ai/sdk` for the AI Assistant (server-side only, via a Next.js route handler)

## Structure

```
lib/types/       Domain model (WBS, Baseline, Change Control, EVM, Risk, RACI, ...)
lib/engine/      Pure calculation engines: CPM (cpm.ts), EVM (evm.ts), S-curve (timeseries.ts)
lib/mock-data/   Seed dataset — "Global Customer Portal Digital Transformation"
lib/store/       Zustand store + derived selectors (CPM-enriched activities, EVM metrics, WBS rollup)
lib/ai/          AI Assistant: project snapshot serializer, read-only tools, governance-gap
                 detector, system prompt
app/api/assistant/ Route handler that runs the Claude tool-use loop against a client-supplied snapshot
components/ui/   Base primitives (Button, Dialog, Select, Tabs, Tooltip, ...)
components/views/ Feature views: Charter, WBS Explorer, Board, Gantt, Governance, EVM, Risk, RACI, AI Assistant
```

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Enabling the AI Assistant

The AI Assistant view calls the real Claude API from a server route — it needs your own key:

```bash
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Without a key set, the Assistant view shows a setup prompt instead of erroring. See
**AI Assistant guardrails** below for how it's restricted.

## Verifying the calculation engines

```bash
npx tsx lib/engine/__verify.ts
```

Runs a set of assert-based checks against the CPM engine (forward/backward pass, float,
critical path, cycle detection) and the EVM engine (CV/SV/CPI/SPI/EAC/ETC/VAC/TCPI).

## Notable behaviors

- **Locked baseline intercept**: editing a budget or planned-finish date on an activity that is
  part of the active (locked) Performance Measurement Baseline opens a formal Change Request
  instead of applying the edit directly.
- **CPM-driven Gantt**: the Gantt view recomputes Early/Late Start/Finish and Total Float from
  the current activities + PDM dependencies on every render, and highlights the critical path.
- **100% Rule check**: the WBS Explorer verifies that top-level Control Account budgets sum to
  the project's authorized budget.

## AI Assistant guardrails

The assistant (`lib/ai/`) is deliberately constrained, in code rather than only by prompt:

- **No mutation tools exist.** `lib/ai/tools.ts` only defines read/search/analysis tools
  (`get_project_overview`, `get_evm_metrics`, `get_critical_path`, `search_records`,
  `flag_governance_gaps`). There is no tool that can approve a change request, lock a baseline,
  edit a RACI role, or change any stored data — those actions only exist as UI buttons a human
  clicks, wired to the Zustand store directly.
- **Gaps are computed, not guessed.** `lib/ai/governance-flags.ts` deterministically checks for
  stale assumptions past their validate-by date, overdue actions, approvals/change requests open
  too long, Work Packages without exactly one RACI Accountable, high-severity open risks, and
  cost baseline drift. The system prompt instructs the model to report this tool's output
  verbatim rather than forming its own opinion about what's "stale" or "missing".
- **Every answer is grounded in the current client-side state.** The browser sends a fresh
  snapshot of the Zustand store with every question, so the assistant always reasons over what's
  actually on screen — not a stale server-side copy.
- **Citations are real record IDs**, collected from tool results and rendered as clickable chips
  that jump to the view where that record lives.
