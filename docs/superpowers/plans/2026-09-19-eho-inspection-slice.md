# EHO Assigned Sign-In and Inspection Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an assigned EHO sign in, complete a noticed inspection, save and resume a draft, and submit a local prototype result.

**Architecture:** EHO routes have an independent session and fieldwork repository. Seeded staff assignments refer to existing premises IDs. Pure rules validate notice, checklist, contraventions, and submission; browser storage holds only a session marker and versioned fieldwork state. UI reuses shared primitives and adapts business portal shell patterns.

**Tech Stack:** TanStack Router, React, TypeScript, Base UI/shadcn primitives, localStorage, Vitest, Testing Library.

---

## File map

- `src/features/eho/eho-model.ts`: account, assignment, finding, and status contracts plus seeds.
- `src/features/eho/eho-state.ts`: pure transitions, validation, persistence, and account sign-in.
- `src/features/eho/eho-state.test.ts`: behavioral tests for guardrails, draft, submission, and recovery.
- `src/features/eho/eho-session.tsx`: hydration, sign-in/out, and state updates for the portal.
- `src/features/eho/eho-shell.tsx`: three-area responsive navigation, account header, and session guard.
- `src/features/eho/eho-pages.tsx`: sign-in, work list, overview, compliance, checklist, issue editor, review, result, and profile surfaces.
- `src/routes/eho*.tsx`: typed public and protected route entry points.
- `src/components/shell/app-header.tsx`: role selector handoff to assigned EHO sign-in.
- `README.md`: prototype credentials and journey.

## Task 1: Domain rules and persistence

- [x] Write failing tests in `src/features/eho/eho-state.test.ts` for unserved notice rejection, incomplete checklist/issue rejection, draft reload, duplicate submission, and corrupt storage recovery. Run `npm test -- src/features/eho/eho-state.test.ts` and confirm failure because the module does not exist.
- [x] Create the model and pure state API: `signInOfficer(contact, password)`, `readFieldwork(storage)`, `saveFieldwork(storage, state)`, `canStart(assignment)`, `saveAnswer(state, id, answer)`, `saveIssue(state, issue)`, `reviewErrors(state)`, and `submitInspection(state)`. Keep passwords out of storage and fail closed on malformed data.
- [x] Re-run the focused tests and confirm all scenarios pass.

## Task 2: Portal entry and shell

- [x] Test assigned-account sign-in and absence of registration in a component, and verify the guarded direct route in the browser; observe failing sign-in/route assertions before implementation.
- [x] Build `/eho/sign-in` and protected `/eho/*` routes with session hydration. The role selector sends EHO to `/eho/sign-in`, preserving the staff role selector for other roles. Add responsive navigation for My Work, Premises Search, and Profile / Sync. The search destination shows an honest later-slice state.
- [x] Run focused tests and typecheck; resolve route generation via the repository build process.

## Task 3: Inspection journey

- [x] Test the notice-blocked overview as a component, validate answers/issues/drafts/duplicate submission in domain tests, and check the complete route journey in the browser; observe failing tests before implementation.
- [x] Build the work dashboard/list, inspection overview, contextual compliance view, checklist, issue editor, review, result, and status/profile. Preserve links through deep routes and show prototype/local queue language. Make controls keyboard accessible and at least 44px high on touch surfaces.
- [x] Run focused domain and component tests and correct failures.

## Task 4: Verification and demo

- [x] Add README instructions for assigned credentials, notice-blocked and ready records, and browser persistence limits.
- [x] Run `npm test`, `npm run lint`, `npm run check`, `npm run typecheck`, `npm run build`, and `git diff --check`; address failures introduced by this slice without overwriting existing Business Portal edits.
- [x] Browser-check sign-in, blocked and ready inspections, draft reload, submission, and 390px navigation. Inspect the final diff against the approved design.
