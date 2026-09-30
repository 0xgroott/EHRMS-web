# MOH Dashboard Sidebar and Table Design

## Goal

Bring the MOH decision workspace in line with the business portal conventions by adding a responsive sidebar shell and presenting submitted businesses in a scalable table.

## Design

- Reuse the existing `SidebarProvider`, `Sidebar`, `SidebarInset`, `SidebarTrigger`, and table components.
- Keep the current MOH authentication, decision state, direct links, and approval workflow unchanged.
- Add focused MOH shell components for the sidebar and header instead of refactoring the established business shell.
- Limit navigation to the implemented MOH destination: Decisions (`/moh/home`).
- Show each submission in a row with business identity, type and location, inspection details, completion date, decision status, and a review action.
- Preserve the table on narrow screens using the shared horizontal-scroll container; keep the sidebar available through its mobile sheet.
- Use the existing calm, official visual language with no decorative motion added to the information-dense decision table.

## Accessibility and Verification

- Retain a keyboard-accessible skip link and labelled navigation.
- Use semantic table headings and status badges.
- Keep controls at least 44px tall on mobile.
- Add focused component assertions for the table and shell, then run the MOH unit test and focused Playwright flow at desktop and 390px mobile widths.
