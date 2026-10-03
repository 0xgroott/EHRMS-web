# MOH Health Approval Pre-Decision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MOH Health Approval worklist, eligibility review, inspection scheduling, and inspection tracking screens that lead into the existing decision review.

**Architecture:** Add one focused MOH workflow module for case data and transitions and one page module for the worklist/detail UI. Extend the existing account-scoped MOH session for persisted schedules, reuse shared and EHO/Business patterns, and connect decision-ready cases to the existing review route.

**Tech Stack:** React, TypeScript, TanStack Router, Base UI/shadcn, Tailwind CSS, Vitest, Testing Library, Playwright.

---

### Task 1: Record the reuse-first repository rule

**Files:**

- Modify: `AGENTS.md`

- [x] Add the rule requiring Business and EHO pattern inspection before new screens and shadcn components or blocks when no reusable pattern exists.

### Task 2: Model the pre-decision Health Approval workflow

**Files:**

- Create: `src/features/moh/moh-health-approval-worklist.ts`
- Create: `src/features/moh/moh-health-approval-worklist.test.ts`

- [x] Write failing tests for seeded stages, filtering, sorting, and inspection scheduling validation.
- [x] Run the focused tests and confirm the expected failures.
- [x] Implement the case types, fictional seed data, selectors, and pure scheduling transition.
- [x] Run the focused tests and confirm they pass.

### Task 3: Persist MOH inspection schedules

**Files:**

- Modify: `src/features/moh/moh-session.tsx`
- Modify: `src/features/moh/moh-session.test.tsx`

- [x] Write failing tests for MOH-account-scoped schedule persistence and malformed-data recovery.
- [x] Run the focused tests and confirm the expected failures.
- [x] Extend the provider with scheduled inspection state and a scheduling action.
- [x] Run the focused tests and confirm they pass.

### Task 4: Build the worklist and detail screens from existing patterns

**Files:**

- Create: `src/features/moh/moh-health-approval-pages.tsx`
- Create: `src/features/moh/moh-health-approval-pages.test.tsx`
- Modify: `src/features/moh/moh-pages.tsx`

- [x] Write failing component tests for the three-stage worklist, eligibility evidence, scheduling validation, and inspection tracking.
- [x] Run the focused tests and confirm the expected failures.
- [x] Compose the existing page header, scrollable tabs, table, avatar, badges, cards, fields, dialog, select, input, and empty-state patterns.
- [x] Add responsive cards for 390px layouts.
- [x] Run the focused component tests and confirm they pass.

### Task 5: Add navigation and routes

**Files:**

- Modify: `src/features/moh/moh-navigation.ts`
- Modify: `src/features/moh/moh-sidebar.tsx`
- Create: `src/routes/moh.health-approvals.tsx`
- Create: `src/routes/moh.health-approvals_.$caseId.tsx`

- [x] Write failing navigation tests for the new item and route activity.
- [x] Run the focused tests and confirm the expected failures.
- [x] Add the navigation item, worklist route, and case-detail route.
- [x] Regenerate TanStack Router route types through the existing Vite workflow.
- [x] Run the focused tests and confirm they pass.

### Task 6: Verify the end-to-end flow

**Files:**

- Create: `e2e/moh-health-approval-worklist.spec.ts`

- [x] Add a focused flow that signs in, schedules an eligible premises, verifies the inspection tab, and opens a decision-ready case.
- [x] Run the focused unit/component tests.
- [x] Run ESLint, Prettier, and TypeScript checks for affected files.
- [x] Run the focused Playwright test at desktop and 390px and confirm there are no console, page, or horizontal-overflow errors.

### Task 7: Clarify MOH navigation and add the business register

**Files:**

- Modify: `src/features/moh/moh-navigation.ts`
- Modify: `src/features/moh/moh-approval-pages.tsx`
- Modify: `src/features/moh/moh-health-approval-pages.tsx`
- Create: `src/features/moh/moh-businesses.tsx`
- Create: `src/features/moh/moh-businesses.test.tsx`
- Modify/Create: `src/routes/moh.*.tsx`

- [x] Rename the decision dashboard to Health Approvals.
- [x] Rename the pre-decision worklist to Inspections and remove the duplicated decision tab.
- [x] Add the council-scoped Businesses directory with simplified status and journey-stage columns.
- [x] Move the screens to semantic routes while retaining `/moh/home` as a compatibility redirect.
- [x] Add focused unit, component, and browser coverage for the revised information architecture.
