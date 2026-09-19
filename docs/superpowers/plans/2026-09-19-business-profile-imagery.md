# Business Profile Imagery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a business avatar/logo and three premises photos with browser persistence and visible use across the portal.

**Architecture:** A profile-scoped media store keeps bounded image data separate from account metadata. A small context shares it across the shell, profile page, and dashboard. Upload processing validates and resizes files before storing them.

**Tech Stack:** TanStack Start, React, Base UI shadcn components, browser canvas/localStorage, Vitest, Playwright.

---

### Task 1: Media rules and storage

**Files:** Create `src/features/business-media/business-media-store.ts`, `src/features/business-media/business-media-rules.ts`, and focused tests.

- [x] Define one avatar and three photo slots keyed by business profile ID.
- [x] Validate PNG/JPEG/WebP and an 8 MB input cap. Resize to bounded WebP data URLs before writing.
- [x] Read malformed records safely, replace a slot, remove a slot, and surface quota failures.

### Task 2: Shared media state

**Files:** Create `src/features/business-media/business-media-context.tsx`; modify `src/routes/business._portal.tsx`.

- [x] Hydrate media for the active business profile and expose avatar/photo setters.
- [x] Update views immediately after a successful write and keep records separate across profile IDs.

### Task 3: Profile page and portal imagery

**Files:** Create `src/features/business-media/business-profile-page.tsx`; modify `src/routes/business._portal.profile.tsx`, `src/components/business/business-header.tsx`, `src/components/business/business-dashboard.tsx`, and `src/routes/business._portal.dashboard.tsx`.

- [x] Show registered account and premises facts with clear avatar/logo upload, replace, and remove controls.
- [x] Show three photo slots with upload, replace, and remove actions and inline validation errors.
- [x] Show the avatar in the account menu and the first photo in the dashboard business area.

### Task 4: Browser and repository verification

**Files:** Modify `scripts/check-business-portal.py` and `README.md`.

- [x] Exercise invalid type, upload, replace, remove, reload, header avatar, and dashboard photo in a fresh browser context.
- [x] Check 390 px layout, lint, formatting, typecheck, tests, build, and the maintained end-to-end journey.
- [x] Review the diff and confirm the ongoing playbook is untouched.
