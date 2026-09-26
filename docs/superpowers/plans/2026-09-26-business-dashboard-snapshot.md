# Business Dashboard Snapshot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a business-focused dashboard summary with adaptive certificate actions and a safe settings reset for application progress.

**Architecture:** Keep dashboard state derivation inside `BusinessDashboard`, using a small local presentation component for the certificate chooser. Expose narrow reset methods from the Fitness, Fumigation, and Inspection providers, then coordinate them from settings without accessing storage directly.

**Tech Stack:** React 19, TypeScript, TanStack Router, Base UI-backed shadcn components, Tailwind CSS v4, Vitest, Testing Library.

---

### Task 1: Add the certificate chooser and dashboard snapshot

**Files:**

- Modify: `src/components/business/business-dashboard.test.tsx`
- Modify: `src/components/business/business-dashboard.tsx`
- Create through shadcn CLI: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Write failing component tests**

Add assertions that the dashboard displays Kitchen staff and Certificates telemetry, opens a dialog with exactly the Health Fitness and Fumigation choices, adapts choice labels and destinations to state, and displays the Health Approval requirements banner.

- [ ] **Step 2: Verify the new tests fail**

Run: `corepack pnpm test -- src/components/business/business-dashboard.test.tsx`

Expected: FAIL because the snapshot metrics, dialog trigger, and requirement banner do not exist.

- [ ] **Step 3: Install and inspect the shadcn Dialog component**

Run `corepack pnpm dlx shadcn@latest docs dialog`, review the Base UI API, then run `corepack pnpm dlx shadcn@latest add dialog`. Read the generated file and correct any composition or icon-library mismatch.

- [ ] **Step 4: Implement the dashboard snapshot**

Replace the dominant next-action card with a responsive business-and-certification hero, add the two telemetry cards and Health Approval Alert, and use the dialog for adaptive certificate choices. Preserve urgent alerts and the lower Activity and Records content.

- [ ] **Step 5: Verify the dashboard tests pass**

Run: `corepack pnpm test -- src/components/business/business-dashboard.test.tsx`

Expected: PASS with no warnings.

### Task 2: Add feature-owned reset operations

**Files:**

- Modify: `src/features/fitness/fitness-context.tsx`
- Modify: `src/features/fumigation/fumigation-context.tsx`
- Modify: `src/features/inspection/inspection-context.tsx`
- Modify: the closest existing provider tests for each feature

- [ ] **Step 1: Write failing provider tests**

Assert that Fitness reset preserves `handlers` but clears `application` and `history`; Fumigation reset clears application and history; Inspection reset clears the current inspection.

- [ ] **Step 2: Verify provider tests fail**

Run the three focused context/provider test files with `corepack pnpm test -- <paths>`.

Expected: FAIL because no reset methods are exposed.

- [ ] **Step 3: Implement minimal reset methods**

Add `resetApplications()` to Fitness and Fumigation context values and `resetInspection()` to Inspection. Reuse each feature's existing `save` and empty-state helpers so subscribers update immediately.

- [ ] **Step 4: Verify provider tests pass**

Run the same focused provider tests.

Expected: PASS.

### Task 3: Add the settings reset confirmation

**Files:**

- Modify: `src/components/business/business-settings-page.test.tsx`
- Modify: `src/components/business/business-settings-page.tsx`

- [ ] **Step 1: Write a failing interaction test**

Assert that the Account tab exposes a discreet reset action, opens an AlertDialog explaining what is preserved, calls all three reset operations after confirmation, and reports success.

- [ ] **Step 2: Verify the settings test fails**

Run: `corepack pnpm test -- src/components/business/business-settings-page.test.tsx`

Expected: FAIL because the reset action is absent.

- [ ] **Step 3: Implement the reset control**

Compose the installed AlertDialog and Button components, call the three feature reset methods only after confirmation, and show the existing success toast.

- [ ] **Step 4: Verify the settings test passes**

Run: `corepack pnpm test -- src/components/business/business-settings-page.test.tsx`

Expected: PASS.

### Task 4: Focused quality verification

**Files:**

- Review: all files changed in Tasks 1–3

- [ ] **Step 1: Run focused tests**

Run the dashboard, settings, and provider test files together. Expected: PASS.

- [ ] **Step 2: Run TypeScript and formatting checks on affected code**

Run `corepack pnpm typecheck` and `corepack pnpm exec prettier --check` for the changed TypeScript and TSX files. Expected: PASS.

- [ ] **Step 3: Inspect the rendered route at desktop and 390px**

Use the saved headless Playwright suite to assert the certification trigger, metrics, dialog choices, and reset confirmation. Check console and page errors without capturing screenshots. Expected: no console or page errors.
