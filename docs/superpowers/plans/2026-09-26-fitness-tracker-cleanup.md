# Fitness Tracker Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make submitted Fitness applications easy to scan by fixing sidebar context, consolidating status, tabulating staff, and clarifying completed/current/pending progress.

**Architecture:** Keep existing application state and actions intact. Add route grouping at the business sidebar boundary, then compose the existing shadcn Alert, Card, Badge, Separator, and Table primitives inside the Fitness tracker. Validate behavior through the existing shell and Fitness journey component tests.

**Tech Stack:** React 19, TypeScript, TanStack Router, Base UI/shadcn, Tailwind CSS 4, Vitest, Testing Library

---

### Task 1: Group application workflow routes in the sidebar

**Files:**

- Modify: `src/components/business/business-sidebar.tsx`
- Test: `src/components/business/business-shell.test.tsx`

- [ ] Add a failing shell test that opens `/business/fitness/tracker` and expects the Applications link to have `aria-current="page"` while Home does not.
- [ ] Run `corepack pnpm test -- src/components/business/business-shell.test.tsx` and confirm the new assertion fails.
- [ ] Add a focused route matcher that maps `/business/fitness/*` and `/business/fumigation/*` to Applications while retaining exact/prefix matching for the other navigation entries.
- [ ] Rerun the shell test and confirm it passes.

### Task 2: Clarify the Fitness tracker hierarchy

**Files:**

- Modify: `src/features/fitness/fitness-tracker-page.tsx`
- Test: `src/features/fitness/fitness-application-page.test.tsx`

- [ ] Extend the submitted-application journey test to assert one status alert, a staff table containing the selected handler, and the four exact progress labels and statuses.
- [ ] Run `corepack pnpm test -- src/features/fitness/fitness-application-page.test.tsx` and confirm the new assertions fail.
- [ ] Replace the repeated status badges with an Alert that uses the stage label as its title and stage-specific ownership guidance as its description.
- [ ] Render selected handlers with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell` using Name and Role columns.
- [ ] Rename progress steps to Submit application, Confirm payment, Facility test results, and Council decision. Derive complete/current/pending display without changing domain stages.
- [ ] Tighten page and grid spacing, keep the issued certificate action primary, and retain the payment record as a secondary action.
- [ ] Rerun the Fitness test and confirm it passes.

### Task 3: Verify the focused change

**Files:**

- Verify: `AGENTS.md`
- Verify: `src/components/business/business-sidebar.tsx`
- Verify: `src/features/fitness/fitness-tracker-page.tsx`

- [ ] Run `corepack pnpm test -- src/components/business/business-shell.test.tsx src/features/fitness/fitness-application-page.test.tsx` and confirm both files pass.
- [ ] Run `corepack pnpm typecheck` and report any in-scope or pre-existing failures accurately.
- [ ] Inspect the final focused diff without altering unrelated working-tree changes.
