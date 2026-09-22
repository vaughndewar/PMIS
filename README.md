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

## Structure

```
lib/types/       Domain model (WBS, Baseline, Change Control, EVM, Risk, RACI, ...)
lib/engine/      Pure calculation engines: CPM (cpm.ts), EVM (evm.ts), S-curve (timeseries.ts)
lib/mock-data/   Seed dataset — "Global Customer Portal Digital Transformation"
lib/store/       Zustand store + derived selectors (CPM-enriched activities, EVM metrics, WBS rollup)
components/ui/   Base primitives (Button, Dialog, Select, Tabs, Tooltip, ...)
components/views/ Feature views: Charter, WBS Explorer, Board, Gantt, Governance, EVM, Risk, RACI
```

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

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
