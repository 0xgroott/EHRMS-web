# Premises Certificate Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace certificate rows on EHO and MOH premises detail pages with reusable, responsive certificate cards matching the Business Certificates page.

**Architecture:** Add one presentation-only shared component that renders `CertificateSummary` records and optionally receives a role-specific link resolver. Use it from both premises pages while preserving EHO actions, MOH read-only behavior, paper-certificate content, and existing empty states.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn Card/Badge/Button, Lucide icons, Vitest, Playwright.

---

### Task 1: Build the shared premises certificate cards

**Files:**

- Create: `src/components/shared/premises-certificate-cards.tsx`
- Create: `src/components/shared/premises-certificate-cards.test.tsx`

- [x] Write component tests that render two certificate summaries and assert separate named regions, type-specific icons, status badges, references, formatted expiry dates, and no action without a link resolver.
- [x] Add a test that supplies `getCertificateHref` and asserts a descriptive **View certificate** link.
- [x] Run `npx vitest run src/components/shared/premises-certificate-cards.test.tsx` and confirm the missing-component failure.
- [x] Implement `PremisesCertificateCards({ certificates, getCertificateHref })` with a responsive grid and full shadcn Card composition.
- [x] Rerun the component test and confirm it passes.

### Task 2: Adopt the shared cards in MOH and EHO premises details

**Files:**

- Modify: `src/features/moh/moh-businesses.tsx`
- Modify: `src/features/moh/moh-businesses.test.tsx`
- Modify: `src/features/eho/eho-pages.tsx`
- Modify: `src/features/eho/eho-pages.test.tsx`

- [x] Add failing feature assertions that certificate entries render as individual named cards, MOH remains read-only, and EHO retains its existing certificate link.
- [x] Run the two focused feature test files and confirm the new card assertions fail.
- [x] Replace each inline certificate list with `PremisesCertificateCards`; pass the existing EHO query-string destination through `getCertificateHref` and omit the resolver for MOH.
- [x] Preserve the EHO paper-certificate panel below the shared component and the MOH empty state.
- [x] Rerun the focused feature tests and confirm they pass.

### Task 3: Verify role routes and project rules

**Files:**

- Modify: `e2e/premises-profile-header.spec.ts`

- [x] Add assertions for named certificate cards on the MOH and EHO premises routes, including the EHO view action and 390px layout.
- [x] Run the focused component and feature test suite.
- [x] Run the focused Playwright spec and check page and console errors.
- [x] Run `npm run typecheck`.
- [x] Run `npm run lint:task --` with every changed TypeScript and TSX file.
- [x] Run Prettier check on every changed TypeScript and TSX file.
