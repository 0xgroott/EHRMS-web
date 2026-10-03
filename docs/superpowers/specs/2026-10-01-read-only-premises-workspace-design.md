# Read-only Premises Workspace Design

## Goal

Reorganize the shared EHO and MOH premises detail experience around the officer's review order, remove duplicate summary cards, and expose the complete business profile and uploaded media without granting profile-editing permissions.

## Layout

After the role-specific back action, the page uses the same structural pattern as Business Settings: a profile summary card on the left and a bordered tab panel on the right. The desktop columns have a 40px gap. On small screens the profile card stacks above the panel.

The profile card replaces the large premises banner. It presents the business logo, verified business name, compliance status, business type, ward, system reference, premises name, owner/contact name, registration number, council, address, email, phone, and safe public links. Email and phone retain their direct links and add the existing animated copy behavior beside each value.

The page is read-only for both EHO and MOH. The only exceptions are existing actions explicitly permitted by role specifications: EHO may claim or open an inspection job and record that a paper certificate was seen. MOH receives no profile or document editing controls.

## Information Order

The right panel has three tabs:

1. **Inspection history · count** — inspection records appear first. Open findings move into this tab as a secondary summary card beside the history at desktop widths. EHO inspection-assignment controls also live in this tab because they are part of fieldwork rather than the business profile.
2. **Certificates · count** — retains the individual certificate cards. EHO retains certificate viewing and the paper-certificate observation panel; MOH remains read-only on this page.
3. **Documents · count** — combines supporting documents with a read-only premises and kitchen photo gallery. The count is the number of document records plus the number of available photos.

The separate Findings tab and the three large Open findings, Certificates, and Documents metric cards are removed.

## Data

Every seeded premises receives complete prototype profile metadata and seeded photo summaries. A premises may declare a `businessProfileId`. When a saved business profile with that ID matches the premises, its settings and uploaded media override the seeded profile metadata and photo summaries. Missing or unreadable saved browser data falls back safely to seeds.

The media reader is read-only and does not expose upload, replace, remove, or save actions. Prototype image placeholders use existing semantic colours and clear filenames when no real uploaded image data exists.

## Shared Components

- Move the existing animated copy control into the shared component layer and update existing Fitness and Fumigation consumers to use it.
- Add a shared read-only premises profile card derived from the Business Settings profile-card structure.
- Add a shared documents-and-photos panel.
- Keep the existing shared certificate-card component.
- Keep role-specific inspection and paper-certificate actions in their feature layers.

## Accessibility and Responsive Behavior

- Copy controls have descriptive accessible names and announce copied/failed states using the existing behavior.
- Profile links remain keyboard accessible and safe external links open with `rel="noreferrer"`.
- Counts are visible text inside tab labels and do not replace the label.
- Tab overflow is horizontal only.
- Images have useful business/premises alt text; placeholders are labelled without pretending to be actual photographs.
- Desktop and 390px layouts must not introduce horizontal page overflow.

## Verification

Tests cover seeded and saved-profile resolution, the shared copy control, read-only profile content, tab order and counts, findings placement, role-specific actions, documents and photos, absence of editing controls, dark/light semantic colour lint, and both role routes at desktop and 390px.
