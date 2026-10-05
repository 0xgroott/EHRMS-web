# LGA Council Oversight Implementation Plan

> Execute tasks in this session, using subagent-driven-development for the isolated data task and review. User approved the scope and assigned-account flow; no further design approval is needed.

**Goal:** Deliver a read-only LGA workspace scoped to its assigned council.
**Architecture:** Role-specific routes and session compose existing MOH/shared presentation components. Pure selectors scope all data before aggregation and export.
**Tech Stack:** React, TanStack Router, Base UI/shadcn, Vitest, Playwright.

- [x] Add `src/features/lga/lga-data.ts` and tests: joined council scope, date/ward/service filters, approval/inspection selectors, finance totals and CSV exports; separate ledger fixtures in `lga-finance-data.ts`.
- [x] Add assigned account/session tests, run red, implement `lga-account.ts` and `lga-session.tsx`. Match credentials exactly, normalize account identifier, reconstruct canonical account from stored ID, catch storage errors.
- [x] Extract reusable assigned-account sign-in presentation from `moh-pages.tsx`; preserve MOH wrappers and existing credential flow. Parameterize MOH header/sidebar and premises link roots with unchanged defaults.
- [x] Add `lga-shell.tsx`, `lga-pages.tsx`, dashboard, finance, reports and record lists using existing primitives; no write controls. Add LGA routes and welcome option. All detail lookups operate on council-scoped data.
- [x] Add `e2e/lga-oversight.spec.ts`: successful/invalid credentials, verification, quick access, reload, sign-out, foreign ID rejection, ward/service/date filters, exports, links, theme/mobile navigation and width.
- [x] Review spec coverage then code quality; correct findings. Run focused unit tests with `corepack pnpm test <files>`, `npm run typecheck`, `npm run build`, `npm run test:e2e -- e2e/lga-oversight.spec.ts e2e/moh-premises.spec.ts`, and task lint for explicit touched files. Update this checklist with evidence.

Task files are tracked explicitly during execution. Existing MOH tests are regression coverage for reused components. No commit/push is requested.

## Verification evidence

- Task-file lint: passed for the explicit code-file inventory below; no global color/token changes.
- Typecheck: passed.
- Production build: passed (existing Base UI module-directive bundler warnings).
- Focused Vitest: 6 files, 20 tests passed (LGA data/account/read-only decision bridge plus reused MOH sign-in/shell/premises).
- Saved headless Playwright: 11 tests passed across LGA oversight, MOH premises, MOH approvals and shared themes. Includes desktop and 390px, console/page errors, sign-in errors, refresh/sign-out, foreign/legacy direct links, reports/exports, financial filters and malformed decision handling.
- Spec and code review: no remaining high/medium blockers. Activity explicitly stays council-wide; ledger conforms to SRS paid services (Fitness/Fumigation only).
- No commits or external integrations.

## Explicit task code files

- `src/features/lga/lga-data.test.ts`
- `src/features/lga/lga-reports.tsx`
- `src/features/lga/use-lga-data.ts`
- `src/features/lga/lga-account.test.tsx`
- `src/features/lga/lga-data.ts`
- `src/features/lga/lga-shell.tsx`
- `src/features/lga/lga-session.tsx`
- `src/features/lga/lga-finance-data.ts`
- `src/features/lga/lga-pages.tsx`
- `src/features/lga/lga-dashboard.tsx`
- `src/features/lga/lga-account.ts`
- `src/features/lga/lga-finance.tsx`
- `src/features/lga/lga-ui.tsx`
- `src/routes/lga.tsx`
- `src/routes/lga._portal.inspections_.$inspectionId.tsx`
- `src/routes/lga._portal.tsx`
- `src/routes/lga._portal.health-approvals.tsx`
- `src/routes/lga._portal.finance.tsx`
- `src/routes/lga.sign-in.tsx`
- `src/routes/lga._portal.health-approvals_.$caseId.tsx`
- `src/routes/lga._portal.dashboard.tsx`
- `src/routes/lga._portal.premises_.$premisesId.tsx`
- `src/routes/lga._portal.reports.tsx`
- `src/routes/lga._portal.premises.tsx`
- `src/routes/lga._portal.inspections.tsx`
- `src/routes/lga.index.tsx`
- `src/components/shared/assigned-account-sign-in.tsx`
- `src/components/welcome-page.tsx`
- `src/features/moh/moh-pages.tsx`
- `src/features/moh/moh-header.tsx`
- `src/features/moh/moh-sidebar.tsx`
- `src/features/moh/moh-businesses.tsx`
- `src/routeTree.gen.ts`
- `e2e/lga-oversight.spec.ts`
- `src/features/lga/use-lga-data.test.tsx`
- `src/components/shell/app-shell.tsx`
