# Global Light and Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent application-wide Light/Dark preference controlled from every authenticated profile menu.

**Architecture:** A root provider synchronizes a typed theme preference to local storage and the `html.dark` class. A reusable dropdown radio group consumes that provider and is composed into the existing Business and MOH menus plus profile menus for Admin and EHO.

**Tech Stack:** React 19, TanStack Start, TypeScript, Tailwind CSS v4, shadcn/Base UI dropdown menus, Vitest, Testing Library, Playwright.

---

### Task 1: Global theme state

**Files:**
- Create: `src/app/theme.tsx`
- Create: `src/app/theme.test.tsx`
- Modify: `src/app/providers.tsx`
- Modify: `src/routes/__root.tsx`

- [ ] Write tests asserting the default Light theme, persisted Dark initialization, preference persistence, and root-class synchronization.
- [ ] Run `corepack pnpm exec vitest run src/app/theme.test.tsx` and confirm failure because the theme module does not exist.
- [ ] Implement the typed provider, storage adapter, hook, and pre-render bootstrap script.
- [ ] Wrap the root provider tree and add the bootstrap script to the root document.
- [ ] Rerun the focused test and confirm it passes.

### Task 2: Reusable profile-menu theme control

**Files:**
- Create: `src/components/shared/theme-menu-group.tsx`
- Create: `src/components/shared/theme-menu-group.test.tsx`

- [ ] Write a component test that opens a host dropdown, sees Light and Dark radio options, and changes the active theme.
- [ ] Run the focused test and confirm failure because the component does not exist.
- [ ] Implement the shared Theme label and dropdown radio group using the existing dropdown-menu primitives.
- [ ] Rerun the focused test and confirm it passes.

### Task 3: Integrate authenticated profile menus

**Files:**
- Modify: `src/components/business/business-header.tsx`
- Modify: `src/features/moh/moh-header.tsx`
- Modify: `src/components/shell/app-sidebar.tsx`
- Modify: `src/features/eho/eho-shell.tsx`
- Modify existing shell tests near each component.

- [ ] Add failing shell assertions proving each profile menu exposes Light and Dark.
- [ ] Run the focused shell tests and confirm they fail for the missing options.
- [ ] Compose the shared theme menu into Business and MOH account dropdowns.
- [ ] Convert the Admin account footer and EHO profile footer into accessible account dropdowns, retaining their existing profile/sign-out behavior.
- [ ] Rerun the focused shell tests and confirm they pass.

### Task 4: Verify the cross-page experience

**Files:**
- Create or modify: `e2e/theme-switching.spec.ts`

- [ ] Add a browser test that selects Dark from a profile menu, verifies the root class and stored value, reloads/navigates, switches back to Light, and checks 390px overflow plus page/console errors.
- [ ] Run the focused Playwright test and confirm it passes.
- [ ] Run focused unit/component tests, typecheck, focused lint, formatting, build, and `git diff --check`.
