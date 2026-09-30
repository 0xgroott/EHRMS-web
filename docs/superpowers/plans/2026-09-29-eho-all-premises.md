# EHO All Premises Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a council-scoped EHO premises directory with ten fictional Port Harcourt businesses, top search, filters, sorting, and updated dashboard/navigation copy.

**Architecture:** Extend the shared seed data so directory rows and existing premises-detail routes use one source of truth. Keep pure directory query logic in `eho-premises-search.ts`, while `eho-premises-search-page.tsx` owns control state and responsive rendering. Preserve existing route paths and camera lookup behavior.

**Tech Stack:** React, TypeScript, TanStack Router, shadcn/Base UI components, Tailwind CSS, Vitest.

---

### Task 1: Define directory query behavior

**Files:**
- Modify: `src/features/eho/eho-premises-search.test.ts`
- Modify: `src/features/eho/eho-premises-search.ts`

- [ ] **Step 1: Write failing tests**

Add tests proving that an empty query returns all council premises, search includes business type, filters combine across ward/type/status, and each supported sort produces deterministic output.

- [ ] **Step 2: Verify the tests fail**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts`

Expected: failures because directory filter and sort options do not exist and empty search currently returns no records.

- [ ] **Step 3: Implement the pure directory query**

Add typed filter and sort options and update `searchPremises` to council-scope first, search across all specified text fields, apply optional exact filters, and return a newly sorted array.

- [ ] **Step 4: Verify the tests pass**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts`

Expected: all premises lookup tests pass.

### Task 2: Provide ten Port Harcourt premises

**Files:**
- Modify: `src/data/seeds.ts`
- Modify: `src/features/eho/eho-premises-search.test.ts`

- [ ] **Step 1: Write a failing council-count assertion**

Assert that the empty directory query for council `phc` returns ten premises with ten unique references.

- [ ] **Step 2: Verify the count test fails**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts`

Expected: the count assertion receives four records.

- [ ] **Step 3: Add six fictional shared seed records**

Add varied Port Harcourt premises covering multiple wards, business types, and compliance statuses. Keep references unique and preserve all existing seed records.

- [ ] **Step 4: Verify the count test passes**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts`

Expected: ten unique Port Harcourt premises are returned.

### Task 3: Build the responsive directory page

**Files:**
- Modify: `src/features/eho/eho-premises-search-page.tsx`

- [ ] **Step 1: Replace search-only state with directory controls**

Keep search first, then add ward, business type, status, and sort selects populated from council records. Add result count and reset behavior.

- [ ] **Step 2: Render desktop and mobile result views**

Use the existing Table, Badge/StatusBadge, Button, Card, Input, and Select components. Show the table from the small breakpoint upward and stacked cards below it.

- [ ] **Step 3: Preserve scan and boundary behavior**

Keep code scanning available as a secondary action and show the other-council message only when no local record matches the searched reference.

- [ ] **Step 4: Run focused tests and type checking**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts src/features/eho/eho-pages.test.tsx`

Run: `corepack pnpm typecheck`

Expected: focused tests and type checking pass.

### Task 4: Update navigation and dashboard copy

**Files:**
- Modify: `src/features/eho/eho-shell.tsx`
- Modify: `src/features/eho/eho-pages.tsx`

- [ ] **Step 1: Rename navigation labels**

Change only the visible labels to `Dashboard` and `All Premises`; retain their current href values.

- [ ] **Step 2: Update the personalized title**

Render `Welcome back, Ebi.` from the officer's first name, preserving the current fallback.

- [ ] **Step 3: Verify affected EHO tests**

Run: `corepack pnpm test -- src/features/eho/eho-pages.test.tsx src/features/eho/eho-premises-search.test.ts`

Expected: all selected EHO tests pass.

### Task 5: Final focused verification

**Files:**
- Review all files changed by Tasks 1–4.

- [ ] **Step 1: Review the diff for unrelated edits**

Confirm that pre-existing workspace changes remain intact and only requested EHO files plus internal design artifacts were added or modified.

- [ ] **Step 2: Run the final focused checks**

Run: `corepack pnpm test -- src/features/eho/eho-premises-search.test.ts src/features/eho/eho-pages.test.tsx`

Run: `corepack pnpm typecheck`

Expected: commands exit successfully with no test failures or type errors.

- [ ] **Step 3: Inspect responsive behavior without screenshots**

Use the saved headless Playwright suite or DOM inspection at desktop and 390px widths. Confirm search and controls are visible, ten results appear by default, mobile uses cards, desktop uses the table, and no page or console errors occur.
