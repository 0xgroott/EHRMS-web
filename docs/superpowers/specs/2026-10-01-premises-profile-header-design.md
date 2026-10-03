# Premises Profile Header Design

## Goal

Give EHO and MOH staff the same clear, identity-led premises header while preserving all existing workflow content below it.

## Approved scope

- Replace the duplicated EHO and MOH page headers with one shared profile header.
- Add a shallow semantic-brand banner, a large overlapping premises avatar, the business name, available contact links, location, premises type, ward, reference, and the existing compliance badge.
- Use the existing initials fallback as the business logo when no image is available.
- Add fictional contact details to the seeded PR-015 record so the requested page demonstrates both email and phone. Contact rows remain optional for other records.
- Remove the EHO offline/“Not Found” explanatory alert.
- Preserve the back action, assignment card, metrics, tabs, tab state, and every tab panel.

## Responsive and accessibility behavior

- The avatar and identity block stack naturally on narrow screens; metadata wraps without horizontal scrolling.
- Email and phone are real `mailto:` and `tel:` links with visible icons and text.
- The banner is decorative and hidden from assistive technology; the avatar has an accessible label and the business name remains the page-level heading.
- All colours use the documented semantic colour system and work in light and dark themes.

## Verification

- Component tests cover the identity, contacts, status, optional contacts, and EHO strip removal.
- Focused Playwright checks both requested URLs at desktop and 390px, with console/page-error collection and no screenshots.
- Task-scoped lint checks only the files touched by this work.
