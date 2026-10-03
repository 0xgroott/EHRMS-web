# Business Settings Profile Layout Design

## Goal

Turn the Business Settings page into a two-column profile workspace inspired by the supplied reference: a stable business summary on the left and the existing settings tabs on the right.

## Layout

- Desktop uses a narrow left summary column and a flexible right settings column.
- The summary shows the business logo or initials, registered name, premises type and location, contact details, and optional public links.
- The right column retains Business profile, Account, Security, Notifications, and Advanced tabs and all existing behavior.
- At 390px the summary appears above the horizontally scrollable tab list; no content is clipped and controls retain 44px touch targets.
- The existing `/business/profile` redirect and `/business/settings#kyb` workflow remain unchanged.

## Editable public links

The Business profile form adds optional fields for Website, Instagram, Facebook, and X. Values are stored with the business profile, accept only absolute `http://` or `https://` URLs, and are omitted from the summary when empty. External links open in a new tab with safe rel attributes.

## Components and data

- Add a focused `BusinessSettingsProfileCard` presentation component rather than growing the already-large settings page further.
- Extend `BusinessProfile` with an optional `links` object and extend the existing profile-details input with the four flat form values.
- Reuse the existing repository and storage pipeline so edits persist for the current business and for the returning seeded account.
- Reuse shadcn Avatar, Badge, Button, Field, Input, and Tabs primitives and existing semantic colour tokens. No colour-system changes are required.

## Accessibility and states

- The summary is an `aside` with a descriptive heading relationship.
- Contact and public links have visible text, icons remain decorative, and long URLs truncate without losing their accessible name.
- Empty public-link values render no placeholder rows.
- Invalid URLs produce inline field errors and prevent saving.
- The tab interaction remains immediate; no decorative motion is added to this high-frequency settings surface.

## Verification

- Repository tests cover URL persistence and rejection of invalid public links.
- Component tests cover the two-column summary, conditional links, editing, persistence, and existing tab behavior.
- Run focused tests and task lint for every touched TypeScript/TSX file.
