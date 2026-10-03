# Business Settings Profile Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive two-column Business Settings workspace with editable, persisted website and social links.

**Architecture:** Extend the existing business profile model and repository update path, then compose a new summary-card component beside the existing settings tabs. Keep routing, KYB behavior, account/security/notification flows, and semantic colour tokens unchanged.

**Tech Stack:** React 19, TypeScript, TanStack Router, Base UI/shadcn, Tailwind CSS v4, Vitest, Testing Library

---

### Task 1: Define and persist business public links

**Files:**
- Modify: `src/domain/business-types.ts`
- Modify: `src/domain/business-validation.ts`
- Modify: `src/services/business-storage.ts`
- Modify: `src/services/business-repository.ts`
- Modify: `src/services/business-repository.test.ts`

- [ ] Add a failing repository test that submits Website, Instagram, Facebook, and X URLs through `updateProfileDetails`, expects trimmed values under `profile.links`, and confirms they survive returning-account sign-in.
- [ ] Add a failing validation test through the repository that expects a non-HTTP public link to return a field error and leave storage unchanged.
- [ ] Run `npm test -- src/services/business-repository.test.ts` and confirm the new assertions fail because public links are not modeled.
- [ ] Add `BusinessProfileLinks`, the optional `BusinessProfile.links`, and flat optional link fields on `BusinessProfileDetailsInput`.
- [ ] Validate non-empty link fields with `new URL`, accepting only `http:` and `https:` protocols.
- [ ] Teach storage guards to accept the optional links object and saved flat link fields, and update the repository to trim, persist, and restore them.
- [ ] Run `npm test -- src/services/business-repository.test.ts` and confirm the repository tests pass.

### Task 2: Add public-link fields to the profile editor

**Files:**
- Modify: `src/features/business-media/business-profile-form.tsx`
- Modify: `src/components/business/business-settings-page.test.tsx`

- [ ] Add a failing component test that edits all four optional URL fields, saves, and verifies persisted profile links.
- [ ] Run `npm test -- src/components/business/business-settings-page.test.tsx` and confirm it fails because the URL fields do not exist.
- [ ] Extend `detailsFromProfile` and the form field metadata with Website, Instagram, Facebook, and X fields, using `type="url"`, appropriate autocomplete, and full-width grouping under a “Public links” heading.
- [ ] Keep the existing dirty, validation, error, refresh, and save behavior intact.
- [ ] Run the focused settings component test and confirm it passes.

### Task 3: Build the responsive summary-and-tabs layout

**Files:**
- Create: `src/components/business/business-settings-profile-card.tsx`
- Modify: `src/components/business/business-settings-page.tsx`
- Modify: `src/components/business/business-settings-page.test.tsx`

- [ ] Add failing assertions for a complementary business summary, core business details, and conditional public links.
- [ ] Add a focused `BusinessSettingsProfileCard` using the existing business media context, Avatar, Badge, and semantic link styles.
- [ ] Change `SettingsContent` to a responsive grid: sticky summary at desktop widths and stacked content on mobile, with tabs occupying the flexible column.
- [ ] Seed the returning fictional business with representative public links so the populated state is visible while preserving a test for omission when empty.
- [ ] Run `npm test -- src/components/business/business-settings-page.test.tsx` and confirm all settings interactions still pass.

### Task 4: Verify the focused change

**Files:**
- Verify all files touched in Tasks 1–3.

- [ ] Run `npm test -- src/services/business-repository.test.ts src/components/business/business-settings-page.test.tsx` and confirm zero failures.
- [ ] Run `npm run lint:task -- src/domain/business-types.ts src/domain/business-validation.ts src/services/business-storage.ts src/services/business-repository.ts src/services/business-repository.test.ts src/features/business-media/business-profile-form.tsx src/components/business/business-settings-profile-card.tsx src/components/business/business-settings-page.tsx src/components/business/business-settings-page.test.tsx src/data/business-seeds.ts` and fix every finding.
- [ ] Review the final diff for unrelated edits, raw colours, unsafe external links, and regressions to route/hash behavior.
