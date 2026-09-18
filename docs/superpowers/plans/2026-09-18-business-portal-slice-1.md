# Business Portal Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent, accessible Business User journey from account entry through contact verification, single-premises setup, and an action-first Business Dashboard.

**Architecture:** Add a versioned business-domain state boundary beside the existing staff mock repository. Public business routes use a branded onboarding shell; authenticated business routes use a compact role-specific shell. Routes coordinate focused components, while pure validators, storage, and next-action services own behavior and remain independently tested.

**Tech Stack:** TanStack Start/Router, TanStack Query, TanStack Form, React 19, TypeScript, Tailwind CSS v4, shadcn/Base UI, Vitest, Testing Library, Playwright browser checks.

---

## File Map

- `src/domain/business-types.ts`: business account, registration, premises, alert, receipt, certificate, and state contracts.
- `src/domain/business-validation.ts`: pure account, OTP, and premises validation.
- `src/domain/business-next-action.ts`: deterministic Dashboard priority selection.
- `src/data/business-seeds.ts`: returning-user account and new-registration defaults.
- `src/services/business-storage.ts`: versioned browser persistence with malformed-data fallback.
- `src/services/business-repository.ts`: account, verification, setup, and Dashboard operations.
- `src/services/business-query-options.ts`: stable TanStack Query keys and options.
- `src/app/business-session.tsx`: registration/session context and safe client hydration.
- `src/components/business/onboarding-shell.tsx`: branded split layout.
- `src/components/business/business-shell.tsx`: authenticated compact sidebar and mobile shell.
- `src/components/business/account-form.tsx`: Create Account form.
- `src/components/business/sign-in-form.tsx`: seeded Sign In form.
- `src/components/business/verification-form.tsx`: visible OTP interaction.
- `src/components/business/business-setup-form.tsx`: sectioned, autosaving business/premises setup.
- `src/components/business/business-dashboard.tsx`: action-first compliance overview.
- `src/components/business/upcoming-module.tsx`: purposeful Slice 2–4 destinations.
- `src/routes/business*.tsx`: public and authenticated Business Portal routes.
- `src/components/shell/app-header.tsx`: Business User demo-role handoff.

## Task 1: Define Business Domain Contracts and Validation

**Files:**
- Create: `src/domain/business-types.ts`
- Create: `src/domain/business-validation.ts`
- Test: `src/domain/business-validation.test.ts`

- [ ] **Step 1: Write failing validation tests**

```ts
import { describe, expect, it } from "vitest"
import { validateAccount, validateOtp, validatePremises } from "./business-validation"

describe("business onboarding validation", () => {
  it("requires consent and a strong password", () => {
    const errors = validateAccount({ businessName: "Riverside Kitchen", contactName: "Ada Okafor", phone: "08031234567", email: "ada@riverside.ng", password: "short", acceptedTerms: false })
    expect(errors.password).toBeDefined()
    expect(errors.acceptedTerms).toBeDefined()
  })

  it("accepts only the visible demo OTP", () => {
    expect(validateOtp("123456")).toEqual({})
    expect(validateOtp("654321").code).toBe("Enter the demo code 123456")
  })

  it("requires council and premises address", () => {
    const errors = validatePremises({ premisesName: "Riverside Kitchen", businessType: "Restaurant", address: "", ward: "Diobu", councilId: "" })
    expect(errors.address).toBeDefined()
    expect(errors.councilId).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/domain/business-validation.test.ts`

Expected: FAIL because `business-validation.ts` does not exist.

- [ ] **Step 3: Define focused domain contracts**

```ts
export interface BusinessAccountInput { businessName: string; contactName: string; phone: string; email: string; password: string; acceptedTerms: boolean }
export interface BusinessPremisesInput { premisesName: string; businessType: string; registrationNumber?: string; address: string; ward: string; councilId: string }
export interface BusinessDocument { id: string; name: string; size: number; category: string }
export interface BusinessProfile { id: string; businessName: string; contactName: string; phone: string; email: string; acceptedTerms: boolean; verified: boolean; premises?: BusinessPremisesInput; documents: BusinessDocument[] }
export type BusinessOnboardingStage = "account" | "verification" | "setup" | "complete"
export interface BusinessAlert { id: string; kind: "inspection" | "corrective-action"; title: string; dueAt: string; urgent: boolean; href: string }
export interface BusinessPortalState { schemaVersion: 1; stage: BusinessOnboardingStage; profile: BusinessProfile | null; alerts: BusinessAlert[] }
export type ValidationErrors<T> = Partial<Record<keyof T | "code", string>>
```

- [ ] **Step 4: Implement explicit validators**

```ts
import type { BusinessAccountInput, BusinessPremisesInput, ValidationErrors } from "./business-types"

export function validateAccount(value: BusinessAccountInput): ValidationErrors<BusinessAccountInput> {
  const errors: ValidationErrors<BusinessAccountInput> = {}
  if (!value.businessName.trim()) errors.businessName = "Enter the registered business name"
  if (!value.contactName.trim()) errors.contactName = "Enter the contact person's name"
  if (!/^\S+@\S+\.\S+$/.test(value.email)) errors.email = "Enter a valid email address"
  if (!/^[0-9+ ]{10,15}$/.test(value.phone)) errors.phone = "Enter a valid phone number"
  if (value.password.length < 10) errors.password = "Use at least 10 characters"
  if (!value.acceptedTerms) errors.acceptedTerms = "Accept the terms and privacy notice"
  return errors
}

export function validateOtp(code: string) { return code === "123456" ? {} : { code: "Enter the demo code 123456" } }

export function validatePremises(value: BusinessPremisesInput): ValidationErrors<BusinessPremisesInput> {
  const errors: ValidationErrors<BusinessPremisesInput> = {}
  if (!value.premisesName.trim()) errors.premisesName = "Enter the premises name"
  if (!value.businessType) errors.businessType = "Choose a business type"
  if (!value.address.trim()) errors.address = "Enter the premises address"
  if (!value.ward.trim()) errors.ward = "Enter the ward"
  if (!value.councilId) errors.councilId = "Choose a council"
  return errors
}
```

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- src/domain/business-validation.test.ts`

Expected: 3 tests pass.

```bash
git add src/domain/business-*
git commit -m "feat: define business onboarding domain"
```

## Task 2: Add Versioned Business Storage and Repository

**Files:**
- Create: `src/data/business-seeds.ts`
- Create: `src/services/business-storage.ts`
- Create: `src/services/business-repository.ts`
- Create: `src/services/business-query-options.ts`
- Test: `src/services/business-repository.test.ts`

- [ ] **Step 1: Write failing persistence tests**

```ts
import { describe, expect, it } from "vitest"
import { createBusinessRepository } from "./business-repository"
import { createBusinessStorage } from "./business-storage"

describe("business repository", () => {
  it("recovers from malformed persisted state", () => {
    localStorage.setItem("ehrcms:business:v1", "broken")
    expect(createBusinessStorage().read().schemaVersion).toBe(1)
  })

  it("persists verified onboarding progress", async () => {
    const repository = createBusinessRepository(createBusinessStorage())
    await repository.createAccount({ businessName: "Riverside Kitchen", contactName: "Ada Okafor", phone: "08031234567", email: "ada@riverside.ng", password: "secure-demo", acceptedTerms: true })
    await repository.verifyContact("123456")
    expect((await repository.getState()).stage).toBe("setup")
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/services/business-repository.test.ts`

Expected: FAIL because business services do not exist.

- [ ] **Step 3: Add seeded returning user and blank state**

```ts
import type { BusinessPortalState } from "@/domain/business-types"

export const emptyBusinessState: BusinessPortalState = { schemaVersion: 1, stage: "account", profile: null, alerts: [] }
export const DEMO_BUSINESS_CREDENTIALS = { contact: "ada@riverside.ng", password: "riverside-demo" } as const
export const returningBusinessState: BusinessPortalState = {
  schemaVersion: 1,
  stage: "complete",
  profile: { id: "BUS-001", businessName: "Riverside Kitchen & Foods", contactName: "Ada Okafor", phone: "08031234567", email: "ada@riverside.ng", acceptedTerms: true, verified: true, premises: { premisesName: "Riverside Kitchen", businessType: "Restaurant", address: "12 Abonnema Wharf Road", ward: "Diobu", councilId: "phc" }, documents: [] },
  alerts: [],
}
```

- [ ] **Step 4: Implement validated storage and repository operations**

```ts
const STORAGE_KEY = "ehrcms:business:v1"
export function createBusinessStorage(storage: Storage = window.localStorage) {
  return {
    read() { try { const value = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null"); return value?.schemaVersion === 1 ? value : structuredClone(emptyBusinessState) } catch { return structuredClone(emptyBusinessState) } },
    write(value: BusinessPortalState) { storage.setItem(STORAGE_KEY, JSON.stringify(value)) },
    reset() { storage.removeItem(STORAGE_KEY) },
  }
}
```

Repository methods: `getState`, `signInDemo`, `createAccount`, `verifyContact`, `updateContact`, `savePremisesDraft`, `completeSetup`, and `reset`. Each writes one complete immutable state value. `createAccount` explicitly drops the password before persistence; `signInDemo` compares against `DEMO_BUSINESS_CREDENTIALS` in memory. No password or OTP is stored in browser storage.

- [ ] **Step 5: Add stable query factories**

```ts
export const businessQueryKeys = { state: ["business", "state"] as const, dashboard: ["business", "dashboard"] as const }
export const businessStateOptions = () => queryOptions({ queryKey: businessQueryKeys.state, queryFn: () => createBusinessRepository(createBusinessStorage()).getState() })
```

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/services/business-repository.test.ts`

Expected: 2 tests pass.

```bash
git add src/data/business-seeds.ts src/services/business-*
git commit -m "feat: add persistent business portal state"
```

## Task 3: Add Business Session and Route Guards

**Files:**
- Create: `src/app/business-session.tsx`
- Create: `src/app/business-session.test.tsx`
- Modify: `src/app/providers.tsx`
- Modify: `src/components/shell/app-header.tsx`

- [ ] **Step 1: Write failing session test**

Render a harness, call `signInDemo`, and assert `isAuthenticated`, business name, and onboarding stage become available.

```tsx
expect(screen.getByTestId("auth-state")).toHaveTextContent("signed-out")
await user.click(screen.getByRole("button", { name: "Use demo account" }))
expect(screen.getByTestId("auth-state")).toHaveTextContent("Riverside Kitchen & Foods")
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/app/business-session.test.tsx`

Expected: FAIL because `BusinessSessionProvider` does not exist.

- [ ] **Step 3: Implement provider with safe client hydration**

Expose `state`, `isAuthenticated`, `signInDemo`, `signOut`, and `refresh`. Load storage inside `useEffect`, not during server render. Wrap it inside `Providers` beneath `QueryClientProvider`.

- [ ] **Step 4: Route demo Business User selection**

In `AppHeader`, when the selected role becomes `business-user`, call `navigate({ to: "/business/dashboard" })`; other role selections keep existing staff behavior.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/app/business-session.test.tsx src/app/demo-session.test.tsx`

Expected: both session suites pass.

```bash
git add src/app src/components/shell/app-header.tsx
git commit -m "feat: add business portal session"
```

## Task 4: Build Branded Public Entry and Account Forms

**Files:**
- Create: `src/components/business/onboarding-shell.tsx`
- Create: `src/components/business/sign-in-form.tsx`
- Create: `src/components/business/account-form.tsx`
- Create: `src/components/business/account-form.test.tsx`
- Create: `src/routes/business.tsx`
- Create: `src/routes/business.index.tsx`
- Create: `src/routes/business.sign-in.tsx`
- Create: `src/routes/business.register.tsx`

- [ ] **Step 1: Write failing account-flow test**

Render `AccountForm` with a submit spy. Submit empty values and assert named inline errors. Fill valid values, accept consent, submit, and assert the exact account payload.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/components/business/account-form.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Build responsive onboarding shell**

Use semantic `<main>` and two regions. Brand panel contains EHRCMS name, public-health purpose, and three short benefits. Form panel contains a step indicator, page title, description, and children. Hide only the long benefit copy below `md`, never form content.

- [ ] **Step 4: Implement forms with TanStack Form**

`AccountForm` uses `validateAccount`, field-level messages, visible password guidance, and required consent. `SignInForm` accepts contact/password, shows an inline invalid-credentials state, and provides `Use demo account` using seeded credentials.

- [ ] **Step 5: Add public routes**

`/business` redirects to `/business/sign-in`. Successful Create Account navigates to `/business/verify`; successful Sign In navigates to `/business/dashboard`. Cross-links connect both forms.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/components/business/account-form.test.tsx && npm run build`

Expected: tests and route generation pass.

```bash
git add src/components/business src/routes/business*
git commit -m "feat: add business portal account entry"
```

## Task 5: Build Contact Verification

**Files:**
- Create: `src/components/business/verification-form.tsx`
- Create: `src/components/business/verification-form.test.tsx`
- Create: `src/routes/business.verify.tsx`

- [ ] **Step 1: Write failing OTP behavior tests**

Assert visible demo hint, wrong-code error, successful callback for `123456`, masked contact, resend countdown reset, and change-contact action.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/components/business/verification-form.test.tsx`

Expected: FAIL because `VerificationForm` does not exist.

- [ ] **Step 3: Implement deterministic verification state**

Use six numeric inputs or one accessible `inputMode="numeric"` field with `maxLength={6}`. Announce errors and resend feedback with `aria-live="polite"`. Keep the demo hint `Use code 123456` visible. A 60-second countdown is display-only; resend resets it and increments a maximum-three counter.

- [ ] **Step 4: Wire verification route**

Guard missing registration state by redirecting to `/business/register`. Successful verification persists stage `setup` and navigates to `/business/setup`.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/components/business/verification-form.test.tsx`

```bash
git add src/components/business/verification-form* src/routes/business.verify.tsx
git commit -m "feat: add demo contact verification"
```

## Task 6: Build Autosaving Business and Premises Setup

**Files:**
- Create: `src/components/business/business-setup-form.tsx`
- Create: `src/components/business/business-setup-form.test.tsx`
- Create: `src/components/business/autosave-status.tsx`
- Create: `src/routes/business.setup.tsx`

- [ ] **Step 1: Write failing setup tests**

Test required address/council errors, document metadata display, `Saving…` then `Saved`, draft preservation, and successful completion callback.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/components/business/business-setup-form.test.tsx`

- [ ] **Step 3: Implement sectioned setup form**

Use TanStack Form and four fieldsets: business details, registration, premises/address, council/contact. Populate councils from existing seeds. Accept PDF/JPG/PNG selections and store only `{ id, name, size, category }`.

- [ ] **Step 4: Add debounced autosave**

After 500 ms without changes, call `savePremisesDraft`. Set status `saving`, then `saved`; on rejection show `Couldn't save. Retry` without discarding field values. Announce status through a polite live region.

- [ ] **Step 5: Wire setup route**

Redirect unverified sessions to `/business/verify`. `Save draft and exit` returns to Sign In. `Save and continue` validates, completes onboarding, and navigates to `/business/dashboard`.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/components/business/business-setup-form.test.tsx && npm run typecheck`

```bash
git add src/components/business/business-setup* src/components/business/autosave-status.tsx src/routes/business.setup.tsx
git commit -m "feat: add autosaving business setup"
```

## Task 7: Build Compact Business Shell and Upcoming Destinations

**Files:**
- Create: `src/components/business/business-shell.tsx`
- Create: `src/components/business/business-sidebar.tsx`
- Create: `src/components/business/business-header.tsx`
- Create: `src/components/business/business-navigation.ts`
- Create: `src/components/business/upcoming-module.tsx`
- Create: `src/routes/business._portal.tsx`
- Create: `src/routes/business._portal.food-handlers.tsx`
- Create: `src/routes/business._portal.applications.tsx`
- Create: `src/routes/business._portal.certificates.tsx`
- Create: `src/routes/business._portal.inspections.tsx`
- Create: `src/routes/business._portal.profile.tsx`

- [ ] **Step 1: Write failing navigation test**

Assert exact labels `Home`, `Food handlers`, `Applications`, `Certificates`, `Inspections`, `Business profile`; assert staff-only `Finance`, `Users`, and `Council administration` are absent.

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/components/business/business-shell.test.tsx`

- [ ] **Step 3: Compose the shell from existing shadcn primitives**

Reuse `SidebarProvider`, `Sidebar`, `Sheet`, `Avatar`, `Button`, and tooltip primitives. Desktop sidebar is persistent/collapsible. Mobile uses the existing sidebar sheet behavior. Header shows business name, notifications, and account menu only.

- [ ] **Step 4: Add purposeful upcoming screens**

Each later route names its delivery slice, summarizes what users will do there, and offers `Return to dashboard`. No CTA is visually enabled without a working route.

- [ ] **Step 5: Add authenticated layout guard**

`business._portal.tsx` redirects incomplete sessions to the correct stage and renders `<BusinessShell />` only when onboarding stage is `complete`.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/components/business/business-shell.test.tsx && npm run build`

```bash
git add src/components/business src/routes/business._portal*
git commit -m "feat: add compact business portal shell"
```

## Task 8: Build Action-First Business Dashboard

**Files:**
- Create: `src/domain/business-next-action.ts`
- Create: `src/domain/business-next-action.test.ts`
- Create: `src/components/business/business-dashboard.tsx`
- Create: `src/components/business/business-dashboard.test.tsx`
- Create: `src/routes/business._portal.dashboard.tsx`

- [ ] **Step 1: Write failing priority tests**

```ts
expect(getBusinessNextAction({ profileComplete: false, urgentAlerts: [], foodHandlerCount: 0 })).toMatchObject({ id: "complete-profile" })
expect(getBusinessNextAction({ profileComplete: true, urgentAlerts: [{ id: "a" }], foodHandlerCount: 0 })).toMatchObject({ id: "urgent-alert" })
expect(getBusinessNextAction({ profileComplete: true, urgentAlerts: [], foodHandlerCount: 0 })).toMatchObject({ id: "add-food-handlers" })
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/domain/business-next-action.test.ts`

- [ ] **Step 3: Implement deterministic priority**

Priority is incomplete profile, urgent inspection/corrective action, add food handlers, start Fitness, start Fumigation, complete missing Health Approval requirement, then monitor compliance. Return `{ id, title, description, href, label }`.

- [ ] **Step 4: Write failing Dashboard component test**

Assert one prominent `Next required action`, three certificate cards, no direct `Apply for Health Approval`, empty application/receipt/certificate copy, and working food-handler placeholder link.

- [ ] **Step 5: Implement Dashboard**

Use existing `PageHeader`, `Card`, `Badge`, and status patterns. Put urgent alert before the next-action card. Follow with Fitness, Fumigation, and Health Approval cards, then compact sections for active applications, reminders, recent receipts, and certificates.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/domain/business-next-action.test.ts src/components/business/business-dashboard.test.tsx && npm run build`

```bash
git add src/domain/business-next-action* src/components/business/business-dashboard* src/routes/business._portal.dashboard.tsx
git commit -m "feat: add action-first business dashboard"
```

## Task 9: Complete Accessibility and End-to-End Verification

**Files:**
- Create: `scripts/check-business-portal.py`
- Modify: `README.md`

- [ ] **Step 1: Add documented demo credentials and routes**

Document `ada@riverside.ng`, password `riverside-demo`, OTP `123456`, and `/business/sign-in`. State clearly that authentication, OTP, and uploads are simulated.

- [ ] **Step 2: Run complete automated gates**

```bash
npm run lint
npm run check
npm test
npm run typecheck
npm run build
```

Expected: zero lint errors/warnings, formatting clean, all tests pass, typecheck exits 0, build exits 0.

- [ ] **Step 3: Run browser journey checks**

The Playwright script must verify:

1. Create Account → visible OTP → setup → Dashboard.
2. Wrong OTP keeps user on verification screen with inline error.
3. Draft setup survives reload.
4. Seeded Sign In opens Dashboard.
5. Business role selector redirects from staff shell.
6. Sidebar excludes staff-only modules.
7. Mobile widths show no horizontal overflow and expose menu button.
8. Browser console contains no errors.

Run: `python3 /Users/admin/.codex/skills/webapp-testing/scripts/with_server.py --server "npm run dev" --port 3000 -- python3 scripts/check-business-portal.py`

Expected: printed summary shows every journey `ok`.

- [ ] **Step 4: Review scope and working tree**

Run: `git diff --check && git status --short`

Expected: only intended README and verification script changes remain.

- [ ] **Step 5: Commit verification assets**

```bash
git add README.md scripts/check-business-portal.py
git commit -m "test: verify business portal onboarding"
```

- [ ] **Step 6: Push only after all gates remain green**

Run the complete automated gate command once more, then follow the repository's normal branch/PR workflow. Do not push with a failing gate.
