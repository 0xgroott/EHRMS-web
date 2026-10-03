# Premises Profile Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated EHO and MOH premises-detail headings with one responsive, identity-led profile header and remove the redundant EHO alert.

**Architecture:** Create a presentation-only shared component that accepts the existing `Premises` record and status badge content. Add optional contact fields to the seeded frontend premises model, then use the shared component from both detail pages without moving any content below the existing header boundary.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/Base UI, Vitest, Testing Library, Playwright.

---

### Task 1: Specify the shared header behavior

**Files:**

- Create: `src/components/shared/premises-profile-header.test.tsx`
- Modify: `src/features/moh/moh-businesses.test.tsx`
- Modify: `src/features/eho/eho-pages.test.tsx`

- [ ] Write failing tests that require a banner/profile region, large labelled avatar, page heading, PR-015 email and phone links, location metadata, and compliance badge.
- [ ] Add an EHO integration assertion that the offline/“Not Found” strip is absent.
- [ ] Run the three focused test files and confirm they fail because the shared header and seeded contacts do not exist yet.

### Task 2: Add optional premises contacts and the shared component

**Files:**

- Modify: `src/domain/types.ts`
- Modify: `src/data/seeds.ts`
- Modify: `src/components/shared/premises-avatar.tsx`
- Create: `src/components/shared/premises-profile-header.tsx`

- [ ] Add optional `email` and `phone` properties to `Premises` and fictional PR-015 contact values to the existing seed.
- [ ] Allow the shared premises avatar to render a profile-header size without changing its existing default use.
- [ ] Build the semantic banner/profile component with a single `h1`, optional contact links, location metadata, reference, and injected status badge.
- [ ] Run the shared component test and confirm it passes.

### Task 3: Adopt the shared header on both pages

**Files:**

- Modify: `src/features/eho/eho-pages.tsx`
- Modify: `src/features/moh/moh-businesses.tsx`

- [ ] Replace each `PageHeader` instance on the premises detail view with `PremisesProfileHeader`.
- [ ] Remove only the EHO stale-document alert and preserve the MOH explanatory alert.
- [ ] Run the focused EHO and MOH component tests and confirm they pass.

### Task 4: Verify the requested routes

**Files:**

- Create or modify: `e2e/premises-profile-header.spec.ts`

- [ ] Add focused checks for `/moh/businesses/PR-015?source=search` and `/eho/premises/PR-015?source=search`.
- [ ] Assert the shared identity header, contacts, tabs, EHO strip removal, no console/page errors, and no horizontal overflow at 390px.
- [ ] Run `npm run lint:task --` with only the code and stylesheet files touched by this task.
- [ ] Run the focused component tests, Playwright spec, TypeScript check, and production build.
