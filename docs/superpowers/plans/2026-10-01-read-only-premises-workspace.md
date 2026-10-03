# Read-only Premises Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the shared EHO/MOH premises detail view as a read-only two-column workspace with ordered counted tabs, complete profile information, copyable contacts, inspection findings, certificate cards, documents, and business-uploaded photos.

**Architecture:** Extend canonical premises seeds with read-only profile metadata and media summaries, then resolve optional saved business settings/media over those values. Create focused shared presentation components and compose them from the two role pages while retaining only documented role-specific actions.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/Base UI components, Lucide icons, browser storage, Vitest, Playwright.

---

### Task 1: Share the existing copy-value interaction

**Files:**

- Create: `src/components/shared/copy-value-button.tsx`
- Create: `src/components/shared/copy-value-button.test.tsx`
- Modify: `src/features/fitness/fitness-tracker-page.tsx`
- Modify: `src/features/fitness/fitness-application-page.tsx`
- Modify: `src/features/fumigation/fumigation-tracker-page.tsx`
- Delete: `src/features/fitness/copy-value-button.tsx`

- [x] Write a failing shared test for clipboard writing, the Copy-to-Copied icon/name transition, reset timing, and failure feedback.
- [x] Run the focused test and confirm the shared component is missing.
- [x] Move the existing implementation unchanged into the shared layer and update all imports.
- [x] Run the focused copy and existing Fitness/Fumigation tests.

### Task 2: Add complete premises profile and media data

**Files:**

- Modify: `src/domain/types.ts`
- Modify: `src/data/seeds.ts`
- Modify: `src/data/seeds.test.ts`
- Modify: `src/services/storage.ts`
- Create: `src/components/shared/premises-profile-data.ts`
- Create: `src/components/shared/premises-profile-data.test.ts`

- [x] Add failing tests requiring complete seeded profile metadata, three seeded photo summaries, a profile linkage for Riverside, and an incremented mock schema.
- [x] Add resolver tests proving matching saved business settings/media override seeds and malformed or unrelated storage falls back to seeds.
- [x] Add the minimal types, deterministic seed data, schema migration, and read-only resolver.
- [x] Run the focused data and storage tests.

### Task 3: Build the read-only profile and document panels

**Files:**

- Create: `src/components/shared/premises-overview-card.tsx`
- Create: `src/components/shared/premises-overview-card.test.tsx`
- Create: `src/components/shared/premises-documents-panel.tsx`
- Create: `src/components/shared/premises-documents-panel.test.tsx`

- [x] Write failing tests for complete business information, contact copy controls, safe public links, logo fallback, uploaded-media override, photo placeholders, document rows, and absence of edit/upload/remove actions.
- [x] Implement the left profile card using the Business Settings profile-card layout and semantic tokens.
- [x] Implement the read-only supporting-document and photo sections.
- [x] Run the focused component tests.

### Task 4: Recompose MOH and EHO premises pages

**Files:**

- Modify: `src/features/moh/moh-businesses.tsx`
- Modify: `src/features/moh/moh-businesses.test.tsx`
- Modify: `src/features/eho/eho-pages.tsx`
- Modify: `src/features/eho/eho-pages.test.tsx`

- [x] Add failing assertions for the two-column workspace, 40px desktop gap, tab order/counts, removed metric and Findings tabs, findings inside Inspection history, documents/photos, and role-specific actions.
- [x] Replace the banner, metrics, and four-tab layout with the shared profile card and three-tab panel.
- [x] Move EHO assignment controls into Inspection history and preserve EHO paper-certificate actions under Certificates.
- [x] Keep MOH read-only and preserve all direct/back navigation.
- [x] Run focused role tests.

### Task 5: Verify browser behavior and project rules

**Files:**

- Modify: `e2e/premises-profile-header.spec.ts`

- [x] Update route checks for the new profile card, copy controls, counted tab order, certificate cards, document photos, and missing edit controls.
- [x] Verify the MOH desktop view and EHO 390px view without horizontal or vertical tab overflow, console errors, or page errors.
- [x] Run focused unit/component tests, TypeScript, task-scoped ESLint and colour lint, and Prettier on explicit touched files.
