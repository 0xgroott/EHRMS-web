---
title: "Business portal form drawers — design"
---

# Business portal form drawers — design

## Scope

Convert signed-in business forms to route-backed drawers: add/edit food handler, Fitness and Fumigation applications, and inspection correction entry. Registration, verification, and initial business setup stay full-page. Business avatar/logo and up to three premises or kitchen photos belong to the later Profile and Settings work.

## Interaction

Use the existing shadcn Base UI `Sheet` on the right at desktop width, with a full-width panel on phones. Each existing food-handler and application form URL remains addressable. Behind those drawers, show Food Handlers or Applications. The inspection correction drawer opens from its finding row and keeps the Inspections page behind it. A visible close action returns to the parent view; Escape and backdrop dismissal do the same. Form content scrolls within the panel, with a clear title and sufficient room for the existing multi-step application flow. Successful saves and payments keep their existing destinations.

## Content and state

Keep the current application transitions, validation, payment disclosure, and browser persistence. The drawer changes presentation and navigation, not domain rules. A correction form edits one finding at a time and keeps the findings notice visible behind it. The header retains the existing initials avatar until Profile and Settings adds image uploads.

## Verification

Check direct URL entry, close/back navigation, form validation, successful save/payment, and 390 px layout. Run lint, formatting, typecheck, tests, build, and the maintained browser journey.
