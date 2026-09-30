# MOH Dashboard Sidebar and Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the business-portal sidebar conventions to the MOH workspace and render submitted businesses as a responsive table.

**Architecture:** Introduce focused MOH sidebar and header components that compose the existing shared sidebar primitives. Update `MohWorkspace` to provide the shell and update `MohDashboard` to use the shared semantic table while preserving all existing decision data and routes.

**Tech Stack:** React 19, TanStack Router, Base UI-backed local components, Tailwind CSS, Vitest, Testing Library, Playwright

---

### Task 1: Lock the dashboard table behavior

**Files:**

- Modify: `src/features/moh/moh-approvals.test.tsx`
- Modify: `src/features/moh/moh-approval-pages.tsx`

- [ ] Add assertions that the submissions are rendered in a table with the expected column headings and row actions.
- [ ] Run `corepack pnpm test src/features/moh/moh-approvals.test.tsx` and confirm the new assertion fails because no table exists.
- [ ] Replace the card list with the shared table components, preserving statuses and review links.
- [ ] Rerun the focused test and confirm it passes.

### Task 2: Add the MOH portal shell

**Files:**

- Create: `src/features/moh/moh-navigation.ts`
- Create: `src/features/moh/moh-sidebar.tsx`
- Create: `src/features/moh/moh-header.tsx`
- Modify: `src/features/moh/moh-pages.tsx`
- Test: `src/features/moh/moh-shell.test.tsx`

- [ ] Add a focused shell test that expects labelled MOH navigation and the sidebar trigger.
- [ ] Run `corepack pnpm test src/features/moh/moh-shell.test.tsx` and confirm it fails because the shell components do not exist.
- [ ] Implement the Decisions navigation, collapsible sidebar, account header, sign-out menu, skip link, and responsive content inset using existing shared primitives.
- [ ] Rerun the shell test and confirm it passes.

### Task 3: Verify the browser-visible flow

**Files:**

- Modify: `e2e/moh-health-approval.spec.ts`

- [ ] Add focused assertions for the table and mobile navigation trigger while preserving the existing review-and-denial flow.
- [ ] Run `corepack pnpm test src/features/moh/moh-approvals.test.tsx src/features/moh/moh-shell.test.tsx`.
- [ ] Run `corepack pnpm test:e2e e2e/moh-health-approval.spec.ts` and verify the changed elements plus console and page errors.
- [ ] Run `corepack pnpm typecheck` to verify the new component boundaries.
