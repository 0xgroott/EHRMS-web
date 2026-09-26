# Fitness Tracker Cleanup Design

## Scope

Refine the submitted Fitness application tracker and business sidebar without changing application state transitions, persistence, or external-step controls. The Fumigation tracker remains unchanged in this pass except that its application routes participate in the sidebar's Applications active state.

## Navigation

The Applications sidebar item is active for the Applications page and for Fitness and Fumigation application, tracker, and related workflow routes. The active link retains `aria-current="page"` and the existing shadcn sidebar treatment in expanded, collapsed, and mobile navigation.

## Tracker hierarchy

The page uses a compact three-part hierarchy:

1. The existing page header identifies the Fitness tracker.
2. A single semantic status banner communicates the current application state, next owner, and next action. It replaces the repeated submitted/payment badges and avoids success wording for unfinished steps.
3. The content area contains application details and a progress rail. Spacing is reduced so the next action and current state are visible without excessive scrolling.

The issued state keeps the primary certificate action. Payment-record download remains a secondary action. Existing developer-only facility and council progression controls remain available below the business-facing tracker and keep their current state guards.

## Application details and staff

Application details retain the premises, approved facility, contact, payment total, payment reference, and payment-record download. Selected food handlers move from a free-form list into a shadcn `Table` with Name and Role columns. The table is allowed to grow vertically for long application lists and remains horizontally usable on a 390px viewport.

## Progress semantics

The four Fitness steps are:

1. `Submit application` — Complete after submission.
2. `Confirm payment` — Complete on the tracker.
3. `Facility test results` — active and Pending while awaiting the facility; Complete once results are received.
4. `Council decision` — Pending until issuance; active after facility results arrive; Complete when issued.

Completed steps use the primary completed treatment, the current incomplete step receives the strongest active treatment while still reading `Pending`, and future steps remain muted. The rail uses these states instead of embedding outcomes such as “Fit” or “issued” in step titles.

## Responsive and accessibility requirements

- Preserve heading order, landmark labels, keyboard navigation, and visible focus states.
- Keep the status message programmatically identifiable without announcing it as an urgent error.
- Stack the details and progress rail on narrow screens without hiding actions or table content.
- Verify the sidebar active state and Fitness tracker content through focused component tests.
- Check the rendered flow at desktop width and 390px using the saved headless Playwright setup when a focused browser test is available.

## Out of scope

- Fumigation tracker content redesign.
- Changes to Fitness stages, persistence, payment behavior, or certificate issuance rules.
- New integrations or changes to fictional test data.
