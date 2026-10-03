# EHRCMS Colour System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add theme-aware semantic colour tokens, use `#99C417` as the dark brand colour, and document every token separately for light and dark mode.

**Architecture:** Primitive brand variables feed semantic CSS variables for text, backgrounds, surfaces, borders, and icons. Existing shadcn variables alias those semantics so all current components adopt the system automatically.

**Tech Stack:** Tailwind CSS v4, CSS custom properties, shadcn semantic variables, Markdown, Playwright.

---

### Task 1: Brand regression

**Files:**

- Modify: `e2e/theme-switching.spec.ts`

- [ ] Assert that light mode exposes `--brand-light: #00786F`.
- [ ] Assert that dark mode exposes `--brand-dark: #99C417` and resolves `--primary` to `rgb(153, 196, 23)`.
- [ ] Run the focused test and confirm it fails before the tokens exist.

### Task 2: Semantic token implementation

**Files:**

- Modify: `src/styles.css`

- [ ] Define the two primitive brand tokens.
- [ ] Define separate light and dark semantic values for text, background, surface, border, and icon categories.
- [ ] Alias the existing shadcn background, foreground, primary, secondary, muted, accent, destructive, input, ring, and sidebar variables to the new semantic system.
- [ ] Rerun the focused browser test and confirm the brand assertions pass.

### Task 3: Colour system documentation

**Files:**

- Create: `docs/Colour_System.md`

- [ ] Document primitive brand tokens and naming rules.
- [ ] Add separate light-mode tables for text, background, surface, border, and icon tokens.
- [ ] Add separate dark-mode tables for the same categories.
- [ ] State usage and accessibility rules for strong, weak, weaker, disabled, and semantic status colours.

### Task 4: Verification

**Files:**

- Verify: `src/styles.css`
- Verify: `docs/Colour_System.md`
- Verify: `e2e/theme-switching.spec.ts`

- [ ] Run the focused theme component and browser tests.
- [ ] Run typecheck, focused lint, formatting, build, and `git diff --check`.
