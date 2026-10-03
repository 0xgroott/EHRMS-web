# EHRCMS Colour System Design

## Goal

Create an explicit semantic colour system for light and dark themes, retain the existing teal as the light brand colour, and use `#99C417` as the dark brand colour.

## Architecture

- Primitive brand tokens define `brand-light` and `brand-dark` once.
- Semantic tokens describe usage rather than hue: text, background, surface, border, and icon.
- Each category includes neutral emphasis levels plus brand, disabled, error, warning, success, and information roles.
- Existing shadcn variables alias the semantic tokens, so current components inherit the system without feature-level rewrites.
- Light and dark values are documented in separate sections in `docs/Colour_System.md`.

## Application rules

- Light theme continues to use the existing teal, represented as `#00786F`.
- Dark theme uses `#99C417` for primary actions, selected navigation, focus rings, and brand emphasis.
- Lime is not used for success; success retains its own green family.
- Strong semantic colours communicate status, while weak semantic colours provide backgrounds and quiet surfaces.
- Neutral weaker text and icons are reserved for tertiary metadata and disabled content where contrast requirements allow.

## Verification

- A focused browser test verifies the primitive tokens and confirms that `primary` resolves to `#99C417` in dark mode.
- Existing theme persistence, mobile, typecheck, lint, formatting, and build gates remain green.
