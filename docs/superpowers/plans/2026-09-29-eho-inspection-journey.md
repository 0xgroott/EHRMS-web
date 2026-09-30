# EHO Inspection Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one transparent, responsive inspection journey guide to every EHO inspection screen.

**Architecture:** A pure journey-state module derives six step states and guidance from existing inspection records. A route-level layout renders the current inspection page beside a shared shadcn-based guide, while the EHO shell gives inspection detail routes the full available width.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, shadcn/Base UI, Vitest, Playwright.

---

### Task 1: Derive inspection journey state

**Files:**
- Create: `src/features/eho/eho-inspection-journey.ts`
- Test: `src/features/eho/eho-inspection-journey.test.ts`

- [ ] Write tests for prepare, inspect, review, submission, findings, and closure states, including inspections without findings.
- [ ] Run `corepack pnpm exec vitest run src/features/eho/eho-inspection-journey.test.ts` and confirm the tests fail because the module is missing.
- [ ] Implement `inspectionJourney()` as a pure function returning step status, availability, destination, completed count, and next-action copy.
- [ ] Run the focused test and confirm it passes.

### Task 2: Build the responsive guide and route shell

**Files:**
- Create: `src/features/eho/eho-inspection-journey-layout.tsx`
- Modify: `src/routes/eho._portal.inspections.$inspectionId.tsx`
- Modify: `src/features/eho/eho-shell.tsx`
- Test: `e2e/eho-notice.spec.ts`

- [ ] Add browser assertions for a visible journey guide, active step, accessible completed links, and no 390px horizontal overflow.
- [ ] Compose the guide from shadcn `Card`, `Badge`, `Button`, and `Separator` patterns with an ordered step list and contextual guidance.
- [ ] Wrap the overview and every nested inspection route in the shared layout without changing URLs.
- [ ] Expand only inspection detail routes to the full main width; retain the existing 900px focused work column.
- [ ] Run TypeScript, focused lint, the journey unit test, and the focused Playwright flow when the local server is available.

### Task 3: Final consistency check

**Files:**
- Modify only files above if corrections are required.

- [ ] Confirm direct links for notice, checklist, issue editing, review, result, findings, and follow-up still render within the journey shell.
- [ ] Confirm upcoming steps cannot bypass notice, checklist, or submission prerequisites.
- [ ] Confirm the mobile progress card communicates the active step and next action.
- [ ] Run `corepack pnpm typecheck` and targeted ESLint checks.
