---
title: "Business Portal Form Drawers Implementation Plan"
---

# Business Portal Form Drawers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present signed-in business forms in accessible, route-backed drawers while preserving direct links and existing workflow rules.

**Architecture:** Add a shared route drawer wrapper using the installed shadcn Base UI Sheet. Form routes render their parent page as background and the existing form inside the sheet. Move correction entry into a sheet on the Inspections page. Keep onboarding routes unchanged.

**Tech Stack:** TanStack Start, React, Base UI shadcn Sheet, Vitest, Playwright.

---

### Task 1: Shared route drawer

**Files:** Create `src/components/business/business-form-drawer.tsx`; test `src/components/business/business-form-drawer.test.tsx`.

- [x] Build a controlled `Sheet` with `SheetContent`, `SheetHeader`, and `SheetTitle`. It accepts `title`, `description`, `onClose`, and `children`. The route supplies its return destination through `onClose`.
- [x] Set a full-width phone panel and a wider desktop maximum for the multi-step applications. Make its body independently scrollable.
- [x] Verify visible title, accessible dialog behavior, and close destination.

### Task 2: Food handler forms

**Files:** Modify `src/routes/business._portal.food-handler.new.tsx`, `src/routes/business._portal.food-handler.$handlerId.tsx`, `src/features/fitness/food-handler-form.tsx`, and focused tests.

- [x] Render `FoodHandlersPage` behind the add/edit sheet while retaining the same URLs.
- [x] Keep save, save-and-add-another, validation, and cancel behavior. Remove redundant page heading in the drawer.
- [x] Verify entry from the list, direct URL, validation, save, and close.

### Task 3: Application forms

**Files:** Modify `src/routes/business._portal.fitness.apply.tsx`, `src/routes/business._portal.fumigation.apply.tsx`, `src/features/fitness/fitness-application-page.tsx`, `src/features/fumigation/fumigation-application-page.tsx`, and focused tests.

- [x] Render `BusinessApplicationsPage` behind each application sheet. Keep all existing steps, validation, and payment disclosure inside the panel.
- [x] Preserve the tracker destination after payment and the current draft behavior on close.
- [x] Verify a direct form URL, step progression, payment, and closing on desktop and phone.

### Task 4: Inspection correction form

**Files:** Modify `src/features/inspection/inspection-page.tsx` and `src/features/inspection/inspection-page.test.tsx`.

- [x] Replace inline correction textareas with one selected-finding sheet. Keep each finding's status and saved correction visible in the list.
- [x] Retain the nonempty correction rule and clear feedback when saving succeeds.
- [x] Verify blank-note validation and recording each finding.

### Task 5: Repository verification

**Files:** Modify `scripts/check-business-portal.py` if selectors or dismissal behavior change.

- [x] Run formatting, `npm run check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- [x] Run `python3 scripts/check-business-portal.py --start-server` and check the form drawer at 390 px.
- [x] Review `git diff --check` and confirm the ongoing playbook is untouched.
