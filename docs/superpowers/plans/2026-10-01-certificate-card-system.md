# Certificate Card System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create one colour-coded certificate card system for business, EHO, and MOH certificate summaries.

**Architecture:** Add semantic certificate identity tokens, build a shared card that owns the presentation and issued-link behavior, and adapt existing grids to supply role-specific viewer URLs. Preserve existing certificate detail pages.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/Base UI, Lucide, Vitest, Playwright.

---

### Task 1: Define certificate identity tokens

**Files:**

- Modify: `src/styles.css`
- Modify: `docs/Colour_System.md`

- [x] Add light and dark semantic surface, text, muted-text, and accent tokens for Fitness, Fumigation, and Health Approval.
- [x] Document every token and value in the colour system.
- [x] Run the project colour lint against the changed files.

### Task 2: Build the shared certificate card

**Files:**

- Create: `src/components/shared/certificate-card.tsx`
- Create: `src/components/shared/certificate-card.test.tsx`

- [x] Write failing tests for colour identity, dominant title, reference, expiry, transparent seal, issued new-tab link, hover arrow, and unfinished non-interactive state.
- [x] Run the focused test and confirm it fails because the component is missing.
- [x] Implement the minimal reusable card and vector seal.
- [x] Run the focused test to green.

### Task 3: Adopt the shared card across role surfaces

**Files:**

- Modify: `src/components/shared/premises-certificate-cards.tsx`
- Modify: `src/components/shared/premises-certificate-cards.test.tsx`
- Modify: `src/features/fitness/fitness-certificate-page.tsx`
- Modify: `src/features/fitness/fitness-summaries.test.tsx`
- Modify: `src/features/moh/moh-businesses.tsx`
- Modify: `src/features/moh/moh-businesses.test.tsx`
- Modify: `src/features/eho/eho-pages.test.tsx`

- [x] Write failing integration assertions for shared coloured cards, issued viewer destinations, new-tab behavior, and unfinished cards without links.
- [x] Replace duplicated summary card markup with the shared component.
- [x] Supply existing business and EHO viewer URLs and add the existing MOH viewer URL where the matching submission exists.
- [x] Run the focused role and business certificate tests.

### Task 4: Verify the browser behavior

**Files:**

- Modify: `e2e/premises-profile-header.spec.ts`

- [x] Assert the certificate identities and issued new-tab links.
- [x] Assert unfinished cards expose no links or arrows.
- [x] Run focused component tests, TypeScript, task-scoped lint and colour lint, formatting, and the affected Playwright spec.
