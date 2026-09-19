# Business Portal Fitness Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking. For this prototype, independent UI blocks may be delegated concurrently after the shared state contract is fixed; each block owns disjoint files.

**Goal:** Demonstrate one complete food-handler-to-issued-Fitness-Certificate journey with clearly simulated payment, facility result, and council decision.

**Architecture:** Reuse existing protected business shell and Slice 1 profile. Add one small, profile-scoped local fitness store with typed handler/application records and pure transitions. Build list/form and application/tracker views against that contract, then connect dashboard summaries and run one real browser journey.

**Tech Stack:** TanStack Start/Router, React, TypeScript, existing shadcn/Base UI primitives, Vitest, browser Playwright script.

**Source:** `docs/superpowers/specs/2026-09-19-business-portal-fitness-slice-design.md`. Frontend-only prototype. Preserve unrelated untracked `docs/Clean_Prototype_Slice_Build_Playbook.md` on main; no backend or Clerk work.

---

## File map and ownership

- `src/features/fitness/fitness-types.ts`: handler, facility, application, certificate types.
- `src/features/fitness/fitness-store.ts`: local persistence and business-profile scoping; no second auth/session framework.
- `src/features/fitness/fitness-rules.ts`: eligibility and guarded pure application transitions.
- `src/features/fitness/fitness-seeds.ts`: deterministic approved facilities.
- `src/features/fitness/fitness-context.tsx`: thin React hook/provider subscribing to store updates; wrap protected portal layout.
- `src/features/fitness/food-handlers-page.tsx`, `food-handler-form.tsx`: staff list/add/edit.
- `src/features/fitness/fitness-application-page.tsx`, `fitness-tracker-page.tsx`, `fitness-certificate-page.tsx`: application wizard, tracking, certificate.
- `src/routes/business._portal.food-handlers.tsx`: replace placeholder. Add sibling routes `business._portal.food-handler.new.tsx`, `business._portal.food-handler.$handlerId.tsx`, `business._portal.fitness.apply.tsx`, `business._portal.fitness.tracker.tsx`, and `business._portal.fitness.certificate.tsx`; no nested Outlet needed in the list page.
- `src/routes/business._portal.applications.tsx`, `src/routes/business._portal.certificates.tsx`: Fitness summaries with Fumigation labelled upcoming.
- `src/components/business/business-dashboard.tsx`, `src/routes/business._portal.dashboard.tsx`: actual fitness status/action and summaries.
- Focused `*.test.ts(x)` beside rules and key flows; `scripts/check-business-portal.py` extended with Slice 2 browser journey.

## Task 1: Shared fitness state and rules

**Files:** Create `src/features/fitness/fitness-types.ts`, `fitness-store.ts`, `fitness-rules.ts`, `fitness-seeds.ts`, `fitness-context.tsx` and focused `fitness-rules.test.ts`, `fitness-store.test.ts`. Modify `src/routes/business._portal.tsx` to wrap `BusinessShell` in the new provider after `BusinessPortalAccess`.

- [ ] Write failing tests for complete handler eligibility, missing consent, zero selection, payment-before-review rejection, two external transitions, reload persistence, and profile isolation. Run `npx vitest run src/features/fitness/fitness-rules.test.ts src/features/fitness/fitness-store.test.ts`; expect failures before implementation.
- [ ] Define these stable shared contracts and implement minimal behavior:

```ts
type FitnessStage = "draft" | "review" | "awaiting-facility" | "result-received" | "issued"
interface FoodHandler { id: string; fullName: string; sex: string; dateOfBirth: string; role: string; identityNumber: string; phone: string; premisesName: string; consent: boolean }
interface FitnessCertificate { id: string; handlerIds: string[]; councilId: string; issuedAt: string; expiresAt: string }
interface FitnessApplication { id: string; handlerIds: string[]; facilityId?: string; stage: FitnessStage; totalNgn?: number; paymentReference?: string; certificate?: FitnessCertificate }
interface FitnessState { handlers: FoodHandler[]; application: FitnessApplication | null }
interface FitnessStore { read(profileId: string): FitnessState; write(profileId: string, state: FitnessState): void; subscribe(profileId: string, listener: () => void): () => void }
```

  `fitness-rules.ts` owns `handlerReadiness`, `beginApplication`, `chooseFacility`, `confirmDemoPayment`, `recordFitResult`, and `issueDemoCertificate`. Invalid transitions return a typed error; no fake real-world approval. `fitness-store.ts` uses profile-scoped `localStorage` key and tiny fallback for missing/invalid demo state. Provider exposes `{ state, addHandler, updateHandler, selectHandlers, chooseFacility, confirmDemoPayment, recordFitResult, issueDemoCertificate }` and never replaces Slice 1 session. Make state available only inside the protected portal layout.
- [ ] Rerun focused tests until green. Run `npm run typecheck`; commit only Task 1 files (`feat: add fitness demo state and rules`).

## Task 2: Food handlers UI

**Depends on:** Task 1 contract. **Owns:** `src/features/fitness/food-handlers-page.tsx`, `food-handler-form.tsx`, their focused tests, `src/routes/business._portal.food-handlers.tsx`, `src/routes/business._portal.food-handler.new.tsx`, and `src/routes/business._portal.food-handler.$handlerId.tsx`. Does not edit application or dashboard files.

- [ ] Write failing list/form tests: empty state, add handler, save and add another, edit existing handler, required fields/consent error retention. Run focused Vitest; expect failures before UI.
- [ ] Build responsive list and form using current business shell, PageHeader, Card, Input/Field, Button, and existing visual tokens. Prefill workplace from current premises. Provide clear `Start Fitness application` link when at least one eligible handler exists; explain blockers otherwise.
- [ ] Wire TanStack routes and real store actions. No search, imports, archive history, or configurable council fields in this slice.
- [ ] Focused tests, typecheck, lint, build; commit Task 2-owned files (`feat: add food handler management demo`).

## Task 3: Fitness application, tracking, and certificate UI

**Depends on:** Task 1 contract. **Owns:** `src/features/fitness/fitness-application-page.tsx`, `fitness-tracker-page.tsx`, `fitness-certificate-page.tsx`, their focused tests, `src/routes/business._portal.fitness.apply.tsx`, `business._portal.fitness.tracker.tsx`, `business._portal.fitness.certificate.tsx`, `src/routes/business._portal.applications.tsx`, and `src/routes/business._portal.certificates.tsx`. Avoid Task 2-owned files; assume handlers enter through shared store.

- [ ] Write failing tests for eligible selection, blocked empty/incomplete selection, seeded facility choice, review summary, clear demo payment disclosure, awaiting-facility state, two separate labelled external simulation steps, and issued certificate details. Run focused Vitest; expect failures.
- [ ] Build compact application wizard (select handlers → facility → review → demo payment), tracking page, and demo certificate view. Seed 2–3 approved facilities with one total price per choice. Payment confirmation sets paid/awaiting-facility but never issues certificate. External controls step result then council decision. Mark certificate as demo, show covered people, premises, council, dates, and application link; no official download.
- [ ] Make `/business/applications` and `/business/certificates` show real Fitness summary and clear Fumigation placeholder. Protected business layout remains parent. No external APIs.
- [ ] Focused tests, typecheck, lint, build; commit Task 3-owned files (`feat: add fitness application demo journey`).

## Task 4: Dashboard and end-to-end integration

**Depends on:** Tasks 2 and 3. **Owns:** `src/components/business/business-dashboard.tsx`, related tests, `src/routes/business._portal.dashboard.tsx`, and `scripts/check-business-portal.py`. Update README only if needed for demo controls. Does not rewrite the existing Slice 1 session.

- [ ] Write failing focused tests for dashboard action progression: no handlers → add; handlers → start; paid/waiting → track; issued → next Fumigation action. Assert one primary CTA and Fitness status reflects state.
- [ ] Pass Fitness state into existing dashboard and use existing `getBusinessNextAction` input instead of hardcoded zero/not-started values. Show real active application and issued demo certificate summaries; leave Fumigation and Health Approval honest.
- [ ] Extend maintained browser script with one full handler → issued certificate journey and one missing-consent/invalid handler case. Use one controlled preview instance; no real payments or new backend.
- [ ] Run `npm test` (worktree only), `npm run lint`, `npm run check`, `npm run typecheck`, `npm run build`, and browser journey. Check 390px layout and console/page errors. Fix only Slice 2 defects. Commit integration (`test: verify fitness demo journey`).

## Final check

- [ ] Review against approved design: no dead visible actions, no private medical details, no business-issued certificate, no real payment claim.
- [ ] Confirm worktree clean, article on main unchanged, and report working local route plus demo steps. Stop after Slice 2; do not push or merge without user instruction.
