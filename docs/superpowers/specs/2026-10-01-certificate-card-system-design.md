# Certificate Card System Design

## Outcome

Replace the inconsistent certificate summary cards with one reusable visual system across business, EHO, and MOH views. Fitness is blue, Fumigation is red, and Health Approval is green.

## Card structure

- The certificate name is the dominant text. There is no descriptive subheader.
- A transparent vector certificate seal sits on the right side.
- The bottom-left metadata contains the system reference and expiry date.
- Issued certificates are whole-card links, open the existing certificate viewer in a new tab, and reveal an up-right arrow on hover or keyboard focus.
- Unfinished certificates use the same identity colour but have no link, arrow, or action control. Their metadata contains only `Not issued`; application references and workflow details are not shown.
- Certificate cards use solid colour surfaces without visible borders or outline rings.
- Existing role permissions and certificate viewer implementations remain unchanged.

## Architecture

Create one shared `CertificateCard` presentation component and use it from the existing premises certificate grid and the business certificate overview. Role pages continue supplying their own viewer URL so navigation remains role-correct. Certificate identity colours are semantic CSS variables documented in the colour system, with light and dark theme values.

## Visual direction

The cards use deep, official solid-colour surfaces inspired by the supplied references. The seal is built as a transparent vector mark rather than importing a raster asset. Motion is limited to a short opacity/transform reveal for the arrow because certificate cards are frequently scanned.

## Verification

Component tests cover type-to-colour mapping, content hierarchy, new-tab links, hover-arrow presence, and non-interactive unfinished cards. Existing business, EHO, and MOH tests verify the shared cards and viewer destinations. Focused Playwright checks cover issued and unfinished behavior.
