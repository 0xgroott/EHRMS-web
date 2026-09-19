# Building a Clean Prototype Slice with AI

## What I was building

I started by laying the product foundation and building dashboards for the different user types, including admin, super admin, and business users.

Next, I focused on the business-user side. I used the business UX screen specifications and end-to-end UX flow map to identify the screens and pages the portal would need. This produced 22 screens across several workflows.

We divided those workflows into four slices:

1. Account setup and business dashboard
2. Food handlers and business certificate flow
3. Fumigation certificate flow
4. Health approvals, inspections, and corrective actions

The first slice covered account setup and the dashboard.

## How we designed the first slice

Before writing production UI, the AI used its brainstorming process to turn key design decisions into simple visual options. I reviewed choices such as:

- Compact sidebar or a more open dashboard layout
- Focused authentication card or branded split-screen authentication
- Dashboard driven by one recommended action or several equal actions
- Desktop and mobile navigation behavior
- How much onboarding progress should remain visible

This made abstract UX questions easier to answer because I could see the options instead of discussing them only in text.

After those decisions, the AI wrote a design specification for the slice. I reviewed and approved it. It then wrote a detailed implementation plan showing how the slice would be built and tested.

I initially felt that the specification and implementation-plan steps could have been merged. They did serve different purposes: the specification captured what the experience should be, while the implementation plan described how to build it safely. For a fast prototype, those two documents may be combined into one shorter build brief when the workflow is already clear.

I plan to use the Emil design engineering process later for a dedicated UI-polish pass. For now, the priority is building the main product flows.

## How the work was organized

I chose a subagent-driven approach. One orchestrator managed the work while specialized subagents handled implementation, specification review, code-quality review, fixes, and final verification.

This produced clean work, but most tasks ran one after another because they touched shared files or depended on earlier tasks. For future prototype slices, independent screens and test work should run concurrently where safe. Sequential work should remain only where real data, routing, or component dependencies exist.

Important project boundary: this is a frontend prototype. Most behavior should use deterministic local data and browser persistence. Backend integration is unnecessary at this stage except authentication, which can later use Clerk. Core workflows should become testable quickly; deeper hardening and visual polish can follow.

## What Slice 1 became

Slice 1 became a small production-style release rather than a lightweight mockup. It included nine major tasks and many implementation and review steps:

- Business account creation
- Email and phone sign-in
- OTP verification and resend behavior
- Contact correction without losing registration data
- Versioned browser persistence and corruption recovery
- Session hydration and protected route guards
- Business and premises onboarding
- Autosave with race-condition handling
- Saved-registration recovery
- Responsive portal shell and navigation
- Action-first business dashboard
- Future-workflow placeholders
- Automated tests, build checks, and browser verification

The final result contained 136 automated tests and nine full browser journey groups.

## Product decisions made before coding

- Read the UX flow map and screen specifications.
- Identified all expected screens before choosing a build order.
- Split the product into vertical workflow slices.
- Defined the exact boundary of Slice 1.
- Compared visual layout options before implementation.
- Chose branded split-screen onboarding.
- Chose a compact business sidebar.
- Chose an action-first dashboard with one clear next step.
- Limited the prototype to one account and one premises.
- Defined deterministic demo credentials and OTP behavior.
- Kept later workflows visible but clearly marked as upcoming.

These decisions reduced design drift during implementation.

## Architecture foundations

- Created explicit business-domain types.
- Centralized validation rules.
- Separated UI, session, repository, storage, and domain logic.
- Added versioned browser persistence.
- Validated stored data before loading it.
- Recovered safely from missing or corrupted storage.
- Kept query cache and session state synchronized.
- Added hydration guards for browser-only state.
- Created deterministic seed data for repeatable demos.

This structure makes a future move from local prototype data to real APIs easier.

## Data and privacy considerations

- Passwords were never persisted.
- OTP values were never persisted.
- Uploaded document contents were never persisted.
- Only safe document metadata was stored.
- Invalid persisted data was rejected.
- Seeded contacts were reserved from new registration.
- Malformed or external stored links were blocked.
- Prototype limitations were documented.
- Fictional data was recommended for testing.

## Account entry considerations

The account forms covered more than successful submission. Tests checked:

- Email registration
- Phone registration
- Email sign-in
- Phone sign-in
- Demo-account shortcut
- Required-field validation
- Invalid credentials
- Existing-contact errors
- Duplicate submissions while a request was pending
- Recovery after rejected requests
- Input retention after errors
- Confirmation that passwords never entered persistence

## OTP verification considerations

The verification flow included:

- Visible demo OTP: `123456`
- Masked verification destination
- Accessible numeric six-digit input
- Wrong-code feedback
- Successful-code transition
- Five-minute expiry
- Sixty-second resend cooldown
- Maximum of three resends on the screen
- New expiry after resend
- Recovery when browser timers were suspended
- Recovery after rejected verification or resend requests
- Duplicate-submit protection
- Controlled screen-reader announcements
- Contact editing without losing the registration
- Protection against competing redirects after success

## Premises setup and autosave considerations

The setup flow included:

- Sectioned premises form
- Council seed options
- Field validation
- PDF, JPG, and PNG upload restrictions
- Metadata-only document persistence
- Autosave after 500 milliseconds
- Saving, Saved, Error, and Retry states
- Draft recovery after reload
- Save draft and exit
- Visible Continue saved registration action
- Completion into the dashboard
- Duplicate-completion protection

Several subtle autosave problems were also handled:

- Pending autosave cancelled before completion
- Active autosave completed before final submission
- Late draft writes prevented from undoing completed setup
- Older saves prevented from showing a false Saved state
- Form editing locked during terminal actions
- Failed completion restored the editable state
- Failed persistence could be retried

## Session and route considerations

- Waited for session hydration before rendering protected content.
- Redirected each onboarding stage to the correct screen.
- Prevented protected-content flashes.
- Prevented duplicate navigation.
- Prevented stale refreshes from overwriting newer session state.
- Added safe sign-out behavior.
- Recovered when premises data was missing.
- Prevented setup and dashboard redirect loops.
- Protected state updates after component unmount.
- Added a visible route back into saved registration.

## UI and accessibility considerations

- Reused the existing design system.
- Used official shadcn-style primitives.
- Maintained clear visual hierarchy.
- Built responsive desktop and mobile layouts.
- Added mobile drawer navigation.
- Added active navigation states.
- Used semantic headings and page sections.
- Added proper form labels.
- Kept controls keyboard accessible.
- Wrote clear errors and recovery instructions.
- Controlled screen-reader status announcements.
- Used practical touch targets.
- Added honest empty states.
- Verified no horizontal overflow at 390 pixels.
- Kept staff-only navigation out of the business portal.

## Dashboard considerations

- Displayed exactly one primary next action.
- Used deterministic action priority.
- Sorted urgent alerts predictably.
- Added stable tie-breaking.
- Displayed three certificate-status cards.
- Included alerts and reminders.
- Used honest empty states for applications, receipts, and certificates.
- Prevented direct Health Approval action before prerequisites.
- Used safe internal destinations.
- Represented future workflow states without inventing fake records.

## Testing performed

### Domain tests

Validation, phone normalization, next-action priority, tie-breaking, and state rules.

### Repository tests

Persistence, corrupt-data recovery, duplicate contacts, OTP expiry, draft storage, and stage transitions.

### Session tests

Hydration, cache synchronization, sign-in, sign-out, stale requests, and unmount behavior.

### Component tests

Form validation, accessibility, errors, loading states, timers, buttons, and navigation.

### Route integration tests

Real repository and session transitions, correct redirects, and prevention of competing navigation.

### Responsive browser tests

Desktop and 390-pixel mobile layouts, drawers, menus, navigation, and horizontal overflow.

### Full browser journeys

- Registration
- Duplicate-contact recovery
- Contact editing
- Wrong and correct OTP
- OTP expiry and resend
- Premises autosave
- Draft reload
- Save and exit
- Visible resume
- Dashboard completion
- Email sign-in
- Phone sign-in
- Route guards
- Staff-role handoff
- Desktop menus
- Mobile navigation
- Console and page errors

### Build gates

```text
npm test
npm run lint
npm run check
npm run typecheck
npm run build
git diff --check
```

## Review process

Each major task followed this loop:

1. Implement behavior.
2. Run focused tests.
3. Review against approved specification.
4. Review code quality and failure behavior.
5. Fix concrete findings.
6. Re-review fixes.
7. Run the full suite.

A final branch-wide integration review then checked the entire slice.

Reviews found issues happy-path testing would likely miss:

- Competing redirects
- Stale session refreshes
- Autosave and completion races
- Lost edits during pending completion
- Missing draft-resume path
- Contact editing that recreated accounts
- OTP without real expiry
- Missing existing-contact behavior
- Setup and dashboard redirect loop
- Repeated screen-reader countdown announcements

## Skills used

### UI and UX skills

- `brainstorming` — turned design questions into options before coding.
- `frontend-design` — created polished page composition and hierarchy.
- `shadcn` — reused consistent component primitives and patterns.
- `adapt` — handled desktop and mobile behavior.
- `webapp-testing` — verified the real interface in Chromium.

### Engineering and delivery skills

- `writing-plans` — converted the approved design into executable tasks.
- `test-driven-development` — built behavior around tests and regressions.
- `subagent-driven-development` — separated implementation and review roles.
- `requesting-code-review` — ran independent specification and quality reviews.
- `verification-before-completion` — required current evidence before completion claims.
- `using-git-worktrees` — isolated feature development safely.
- `git-pr` — handled verification, push, pull request, merge, and cleanup.

## Delivery discipline

- Built the feature on an isolated branch.
- Used small, descriptive commits.
- Preserved unrelated project files.
- Passed every required gate before push.
- Documented user-visible changes and test evidence in the pull request.
- Merged the pull request into `main`.
- Synchronized local `main` with GitHub.
- Removed the completed feature branch and worktree.
- Committed a repeatable browser-check script.
- Added demo instructions to the README.

## What made the first slice take three hours

The AI treated the slice as a production-quality frontend release. Every component and transition received tests, independent reviews, failure handling, and browser verification. That produced a strong foundation, but it also increased build time.

For the remaining prototype slices, the priority should change:

- Build core workflows first.
- Keep backend behavior simulated except authentication.
- Use Clerk when real authentication becomes necessary.
- Parallelize independent pages and tests.
- Reduce repeated review loops for low-risk placeholder UI.
- Test critical journeys and shared state deeply.
- Use lighter tests for temporary prototype screens.
- Defer final animation and visual polish.
- Run Emil design engineering as a later cleanup pass.

Goal: preserve reliable foundations while reaching the product's main workflows faster.

## Repeatable clean-build formula

```text
Understand flow
→ list screens
→ split vertical slices
→ lock slice scope
→ decide UX
→ define state and boundaries
→ build one complete journey
→ test critical failures and races
→ review against requirements
→ verify in browser
→ pass build gates
→ document demo
→ open PR and merge
```

This process is worth repeating across products. Depth should change based on project stage: stronger validation and review for foundations, faster implementation for temporary prototype flows, then a deliberate hardening and polish pass before production.
