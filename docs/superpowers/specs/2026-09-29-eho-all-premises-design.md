# EHO All Premises Directory Design

## Goal

Replace the EHO's search-only premises screen with a council-scoped directory that lets field officers quickly search, filter, sort, and open premises records.

## Navigation and dashboard copy

- Rename the EHO sidebar item `My Work` to `Dashboard` without changing its route.
- Rename the EHO sidebar item `Premises Search` to `All Premises` without changing its route.
- Change the dashboard title to `Welcome back, Ebi.` using the signed-in officer's first name.
- Keep existing route paths so bookmarks and browser navigation continue to work.

## Directory experience

- Show the page title `All Premises` and a short council-directory description.
- Put search at the top of the page. Search matches premises name, trading name, reference, address, ward, and business type.
- Provide filters for ward, business type, and compliance status.
- Provide sorting by business name, ward, business type, or compliance status.
- Show the active result count and a clear-filters action when any control is active.
- Keep QR/barcode lookup as a secondary action.
- Render a compact table on desktop and stacked business cards on narrow screens.
- Each record opens the existing premises compliance route.
- Preserve the existing cross-council lookup message when a searched reference belongs to another council.

## Data and boundaries

- Add six fictional Port Harcourt City premises so Ebi's council has ten test records.
- Keep other councils' premises hidden from Ebi's directory.
- Use the shared seed database so every directory result has a working detail page.
- Do not add backend, database, authentication, or external integration changes.

## Accessibility and responsive behavior

- Give every search, filter, and sort control an explicit accessible name.
- Keep touch targets at least 44px high.
- Preserve keyboard navigation and visible focus behavior from the existing UI components.
- At 390px, stack controls and use cards so no horizontal table scrolling is required.

## Verification

- Unit-test council scoping, empty-query directory behavior, search fields, filters, sorting, and cross-council detection.
- Run the focused EHO premises tests and affected EHO page tests.
- Run a focused type check or build if the component changes expose type-level issues.
