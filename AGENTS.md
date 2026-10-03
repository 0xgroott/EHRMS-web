# Project rules

- Check the project rules before working in this repository. Global skills live in `/Users/admin/.codex/skills`.

## Scope and behavior

- Read the relevant screen specification in `docs/` and the current code before changing a workflow. Follow existing React, TanStack Router, and Base UI/shadcn patterns; keep edits focused and preserve unrelated work in the working tree.
- Before building a new screen, inspect the Business and EHO experiences for components and interaction patterns that can be reused. Prefer existing shared or feature patterns over rebuilding them; when no suitable pattern exists, use the installed shadcn components or blocks before creating custom UI.
- Follow `docs/Colour_System.md` for every UI change. Use shadcn semantic utilities or the documented CSS variables; never add raw hex colours, raw Tailwind palette colours, undeclared colour utilities, or feature-level `dark:` colour overrides. Define or revise colour values only in `src/styles.css`, update the colour-system document in the same change, and run `npm run lint` to satisfy both `shadcn/no-raw-colors` and the project colour lint.
- Once the user explicitly approves a design or says to proceed, treat design specs and implementation plans as internal execution artifacts and continue without requesting another approval or review. Ask again only when a new ambiguity or material scope change requires a user decision.
- Make the frontend look and read like a real public health service. Do not add "demo", "simulation", or similar prototype disclaimers to user-facing UI copy. Keep mock behavior and integration limits in code and developer documentation, not in the interface. Use fictional test data; do not add real external integrations unless requested.
- Preserve role boundaries, direct links, browser navigation, validation, and saved draft behavior when changing flows. Keep controls accessible and check desktop and 390px mobile layouts for UI changes.
- Do not store passwords, OTP values, or uploaded document contents in browser storage. Keep persisted state scoped to the correct account or role.

## Skills and workflow

- Use the global `frontend-design` and `emil-design-eng` skills for frontend design and UI improvements where relevant. Follow the established design context in `.impeccable.md` while honoring the product copy rule above.
- Use `find-animation-opportunities` to identify worthwhile motion in UI work and `improve-animations` to audit and plan improvements to existing motion. These skills are advisory and read-only; implement requested UI changes through the appropriate implementation workflow.
- Use the global `git-pr` skill whenever performing Git activity, including inspecting branch state or diffs, staging, committing, pushing, merging, and pull request work. Keep unrelated working-tree changes out of requested Git operations.

## Verification

- At the end of every task, automatically lint only the code and stylesheet files changed during that task with `npm run lint:task -- <file ...>` and fix all findings before reporting completion. Track the task's touched files explicitly; do not derive this list from the whole dirty worktree, because unrelated user changes may already be present. Run the full `npm run lint` instead when the task changes `src/styles.css`, `eslint.config.js`, the lint scripts, shared design-system configuration, or dependencies that affect linting.
- For simple, focused changes, perform the requested work directly and run only checks relevant to the affected code. Do not run full-repository checks or investigate unrelated failures unless the user asks or the change makes them necessary. Report back promptly.
- Run focused unit and component tests when behavior changes. Keep unit tests separate from browser tests.
- For browser-visible flow changes, add focused tests under `e2e/` when needed and run the relevant spec or test title with the saved headless Playwright Test CLI suite. Check rendered state plus console and page errors. Assert the changed element with Playwright locators instead of reading a whole-page snapshot. `--grep` filters tests, not page content. For exploratory page inspection, search the relevant element or region; use a full snapshot only when the structure is unknown. Do not open a browser window or capture screenshots.
- Run the full `check`, `lint`, `typecheck`, `test`, `build`, and `test:e2e` gates only when the user requests them or the scope and risk of the change warrant them. Run `corepack pnpm test` separately from browser tests. Flag the need for full gates early and report any failing check and its cause.
