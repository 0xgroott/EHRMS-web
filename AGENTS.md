# Project rules

- Check the project rules before working in this repository. Global skills live in `/Users/admin/.codex/skills`.

## Scope and behavior

- Read the relevant screen specification in `docs/` and the current code before changing a workflow. Follow existing React, TanStack Router, and Base UI/shadcn patterns; keep edits focused and preserve unrelated work in the working tree.
- Make the frontend look and read like a real public health service. Do not add "demo", "simulation", or similar prototype disclaimers to user-facing UI copy. Keep mock behavior and integration limits in code and developer documentation, not in the interface. Use fictional test data; do not add real external integrations unless requested.
- Preserve role boundaries, direct links, browser navigation, validation, and saved draft behavior when changing flows. Keep controls accessible and check desktop and 390px mobile layouts for UI changes.
- Do not store passwords, OTP values, or uploaded document contents in browser storage. Keep persisted state scoped to the correct account or role.

## Skills and workflow

- Use the global `frontend-design` and `emil-design-eng` skills for frontend design and UI improvements where relevant. Follow the established design context in `.impeccable.md` while honoring the product copy rule above.
- Use `find-animation-opportunities` to identify worthwhile motion in UI work and `improve-animations` to audit and plan improvements to existing motion. These skills are advisory and read-only; implement requested UI changes through the appropriate implementation workflow.
- Use the global `git-pr` skill whenever performing Git activity, including inspecting branch state or diffs, staging, committing, pushing, merging, and pull request work. Keep unrelated working-tree changes out of requested Git operations.

## Verification

- Run focused unit and component tests while iterating. Run `corepack pnpm test` separately from browser tests.
- Use the saved headless Playwright Test CLI suite for browser checks: `corepack pnpm test:e2e`. During iteration, run the relevant spec or filter test titles with `--grep`; assert the changed element with Playwright locators instead of reading a whole-page snapshot. `--grep` filters tests, not page content. For exploratory page inspection, search the relevant element or region; use a full snapshot only when the structure is unknown.
- Add focused tests under `e2e/` for browser-visible flow changes. Check rendered state plus console and page errors. Run the full suite before handoff. Keep runs headless; do not open a browser window or capture screenshots.
- Before handing off code changes, run `corepack pnpm check`, `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`, and `corepack pnpm test:e2e`. Report any failing check and its cause.
