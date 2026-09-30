# MOH Approved Certificate View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an authenticated, new-tab Health Approval Certificate view for approved MOH decisions, including its certificate number and a decorative QR-style mark.

**Architecture:** Persist MOH decision records under an account-scoped local-storage key so a separate browser tab can resolve the approval. Keep the certificate document in a focused presentation component and expose it through a TanStack file route nested beneath the existing MOH business path.

**Tech Stack:** React 19, TypeScript, TanStack Router, Base UI/shadcn components, Tailwind CSS, Vitest/Testing Library, Playwright.

---

### Task 1: Preserve approved decisions across tabs

**Files:**

- Modify: `src/features/moh/moh-session.test.tsx`
- Modify: `src/features/moh/moh-session.tsx`

- [ ] **Step 1: Write a failing session test**

Add a test that approves `HA-REV-001`, expects its decision at `ehrcms:moh:MOH-001:decisions:v1`, unmounts, remounts the provider, and confirms that the approved outcome and generated certificate number rehydrate.

- [ ] **Step 2: Run the focused test and verify red**

Run: `corepack pnpm test -- src/features/moh/moh-session.test.tsx`

Expected: FAIL because decisions currently live only in React state.

- [ ] **Step 3: Implement account-scoped persistence**

Read and validate the current account's decision map during provider hydration. Persist the next decision map after approval or denial. Use `ehrcms:moh:${assignedMohAccount.id}:decisions:v1`; do not persist credentials, password values, or verification codes.

- [ ] **Step 4: Run the focused test and verify green**

Run: `corepack pnpm test -- src/features/moh/moh-session.test.tsx`

Expected: PASS.

### Task 2: Add the approved-state certificate link and document

**Files:**

- Modify: `src/features/moh/moh-approvals.test.tsx`
- Modify: `src/features/moh/moh-approval-pages.tsx`
- Create: `src/features/moh/moh-certificate-page.tsx`
- Create: `src/features/moh/moh-certificate-page.test.tsx`

- [ ] **Step 1: Write failing component tests**

Cover these behaviors:

- an approved review shows `View certificate` as a semantic link with `target="_blank"` and `rel="noreferrer"`
- denied and undecided reviews do not show that link
- the certificate document shows the exact certificate number, business, premises, council, issue date, inspection reference, and the decorative QR-style mark
- an unavailable certificate renders a clear return action

- [ ] **Step 2: Run the focused tests and verify red**

Run: `corepack pnpm test -- src/features/moh/moh-approvals.test.tsx src/features/moh/moh-certificate-page.test.tsx`

Expected: FAIL because the link and certificate page do not exist.

- [ ] **Step 3: Implement the approved-state link**

Use `buttonVariants({ variant: "outline" })` on a plain anchor so the control retains link semantics. Build the URL from the submission id and add `ExternalLink` with `data-icon="inline-end"`.

- [ ] **Step 4: Implement the certificate page**

Create a document-like component using existing `Card`, `Badge`, and semantic theme tokens. Generate a stable QR-style SVG grid from the certificate number, keep it decorative with `aria-hidden="true"`, and avoid a false scan/verification promise.

- [ ] **Step 5: Run the focused tests and verify green**

Run: `corepack pnpm test -- src/features/moh/moh-approvals.test.tsx src/features/moh/moh-certificate-page.test.tsx`

Expected: PASS.

### Task 3: Route the certificate through the authenticated MOH workspace

**Files:**

- Create: `src/routes/moh.businesses.$businessId.certificate.tsx`
- Modify: `src/features/moh/moh-pages.tsx`
- Generated: `src/routeTree.gen.ts`

- [ ] **Step 1: Add the route page adapter**

Export `MohCertificatePage` from `moh-pages.tsx`. Resolve the submission and approved decision from the existing MOH session, and pass them to the certificate document component.

- [ ] **Step 2: Add the TanStack file route**

Create `/moh/businesses/$businessId/certificate` and render the page adapter with the route parameter.

- [ ] **Step 3: Regenerate routing and typecheck**

Run: `corepack pnpm build`

Expected: route generation completes and the production build exits 0.

### Task 4: Verify the complete browser flow

**Files:**

- Modify: `e2e/moh-health-approval.spec.ts`

- [ ] **Step 1: Add the focused browser scenario**

Sign in, approve the first submission, assert the certificate number on the decision card, open the `View certificate` link with `page.waitForEvent("popup")`, and verify the new page's heading, certificate number, premises details, QR-style mark, and URL.

- [ ] **Step 2: Check responsive and runtime behavior**

Set the certificate page to 390x844, assert that its document does not overflow horizontally, and confirm there are no page or console errors.

- [ ] **Step 3: Run the focused browser test**

Run: `corepack pnpm test:e2e -- e2e/moh-health-approval.spec.ts`

Expected: PASS.

- [ ] **Step 4: Run final focused verification**

Run: `corepack pnpm test -- src/features/moh/moh-session.test.tsx src/features/moh/moh-approvals.test.tsx src/features/moh/moh-certificate-page.test.tsx`

Run: `corepack pnpm typecheck`

Expected: all focused tests pass and TypeScript exits 0.
