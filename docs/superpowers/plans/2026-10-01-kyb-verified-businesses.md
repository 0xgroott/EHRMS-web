# KYB-verified Businesses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display one consistent KYB verification check beside verified business names throughout the MOH and EHO experience.

**Architecture:** Store verification on canonical `Premises` records, expose a small seed lookup for mock worklists, and render a shared accessible name component. Keep KYB identity verification separate from compliance status.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn conventions, Lucide icons, Vitest, Playwright.

---

### Task 1: Add canonical verification data

**Files:**

- Modify: `src/domain/types.ts`
- Modify: `src/data/seeds.ts`
- Modify: `src/services/storage.ts`
- Test: `src/data/seeds.test.ts`
- Test: `src/services/storage.test.ts`

- [x] Add failing assertions that every premises has a boolean `kybVerified`, verified records span all five compliance statuses, and older cached schemas reload seeds.
- [x] Run `npx vitest run src/data/seeds.test.ts src/services/storage.test.ts` and confirm the missing field/version failures.
- [x] Add `kybVerified: boolean`, assign the fixed seed subset, export a business-name verification lookup, and increment the schema version.
- [x] Rerun the focused tests and confirm they pass.

### Task 2: Create the shared verified-name component

**Files:**

- Create: `src/components/shared/verified-business-name.tsx`
- Create: `src/components/shared/verified-business-name.test.tsx`

- [x] Write failing tests for an accessible `BadgeCheck` after verified names and no icon for unverified names.
- [x] Run `npx vitest run src/components/shared/verified-business-name.test.tsx` and confirm the component is missing.
- [x] Implement an inline-flex name component using `text-primary`, `BadgeCheck`, `aria-label="KYB verified"`, and an SVG `<title>`.
- [x] Rerun the focused test and confirm it passes.

### Task 3: Reuse the component across premises surfaces

**Files:**

- Modify: `src/components/shared/premises-profile-header.tsx`
- Modify: `src/components/shared/premises-profile-header.test.tsx`
- Modify: `src/features/moh/moh-businesses.tsx`
- Modify: `src/features/moh/moh-businesses.test.tsx`
- Modify: `src/features/eho/eho-premises-search-page.tsx`
- Modify: `src/features/eho/eho-pages.tsx`
- Modify: `src/features/moh/moh-approval-pages.tsx`
- Modify: `src/features/moh/moh-health-approval-pages.tsx`
- Test: `src/features/eho/eho-pages.test.tsx`
- Test: `src/features/moh/moh-approvals.test.tsx`
- Test: `src/features/moh/moh-health-approval-pages.test.tsx`
- Test: `e2e/premises-profile-header.spec.ts`

- [x] Add failing assertions for badges in the profile header, desktop tables, and mobile cards while confirming unverified names have none.
- [x] Run the focused tests and confirm they fail because raw business-name text is still used.
- [x] Replace raw name output with `VerifiedBusinessName`, propagate `kybVerified` through MOH directory entries, and use the seed lookup only for independent prototype work-list records.
- [x] Rerun focused component and feature tests.
- [x] Run the two profile-header Playwright checks at desktop and 390px mobile widths.

### Task 4: Verify the complete change

**Files:** all files explicitly changed by Tasks 1–3.

- [x] Run `npm run typecheck`.
- [x] Run `npm run lint:task -- src/domain/types.ts src/data/seeds.ts src/data/seeds.test.ts src/services/storage.ts src/services/storage.test.ts src/components/shared/verified-business-name.tsx src/components/shared/verified-business-name.test.tsx src/components/shared/premises-profile-header.tsx src/components/shared/premises-profile-header.test.tsx src/features/moh/moh-businesses.tsx src/features/moh/moh-businesses.test.tsx src/features/eho/eho-premises-search-page.tsx src/features/eho/eho-pages.tsx src/features/eho/eho-pages.test.tsx src/features/moh/moh-approval-pages.tsx src/features/moh/moh-approvals.test.tsx src/features/moh/moh-health-approval-pages.tsx src/features/moh/moh-health-approval-pages.test.tsx e2e/premises-profile-header.spec.ts`.
- [x] Run Prettier check on the explicit touched files.
- [x] Report the verified/unverified seed behavior and all check results.
