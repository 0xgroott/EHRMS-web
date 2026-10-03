# Global Light and Dark Theme Design

## Goal

Add a persistent Light/Dark preference that applies to every EHRCMS page and can be changed from each authenticated user's profile menu.

## Design

- A root-level React provider owns the explicit `light | dark` preference.
- The preference is stored under one application-wide local-storage key and represented by a `dark` class on the root `html` element.
- A small inline bootstrap script applies the saved class before React renders, preventing a light-theme flash when Dark is selected.
- A reusable profile-menu group presents Light and Dark as exclusive radio options using the installed shadcn/Base UI dropdown-menu components.
- Business and MOH reuse their existing avatar menus.
- Admin turns its existing sidebar account area into a profile menu.
- EHO turns its existing sidebar profile area into a profile menu while retaining an explicit View profile action and sign-out action.
- Public, sign-in, onboarding, receipt, and certificate pages inherit the stored theme even though the control only appears in authenticated profile menus.

## Accessibility and interaction

- Light and Dark are exposed as an accessible radio group with a visible Theme label.
- Profile triggers remain keyboard accessible and have role-specific accessible names.
- Theme changes are immediate and do not navigate or reload the page.
- No decorative theme animation is added; existing semantic colors update together.

## Testing

- Unit tests cover persisted theme initialization, root-class updates, and the reusable menu control.
- Existing Business, MOH, EHO, and Admin shell tests verify the Theme options are reachable from their profile trigger.
- A focused browser test verifies persistence across navigation/reload, the dark root class, and both desktop and 390px layouts without page or console errors.
