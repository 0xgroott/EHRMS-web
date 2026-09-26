# Dashboard staff design

## Goal

Make staff management visible from the business dashboard and simplify the staff model to two employment statuses: Active and Archived.

## Design

- Add Branches to the dashboard metrics using the registered premises count supported by the current data model.
- Simplify the business summary card to show the business name, profile status, and a View profile action.
- Keep the certificate-card guidance beside its illustration and immediately above a state-aware Get started or Continue process action. Once both certificate requirements are valid, replace this content with a My Health Approval status card linked to the Health Approval page. Preserve that status card while an inspection journey exists.
- Show the issued-certificate count as a single number and omit the Health Approval guidance banner.
- Add a compact, flat Staff table as the first dashboard tab with ten records per page, Active and Archived badges, and independent Fitness test status. Do not wrap this table in an additional card or repeat the active tab name above its table. Place View all staff at the right edge of the tab bar and show it only while Staff is active.
- Rename Records to Certificates and show one flat table of certificate applications and issued documents without a repeated content heading. Issued or expired rows link to the certificate document with View certificate; in-progress rows link to the relevant tracker with View status.
- Keep Activity as one flat table of dated certificate and inspection events without a repeated content heading, sorted newest first. Do not mix deadlines or undated application state into the activity history.
- Rename business-facing Food handlers language to Staff on navigation, the management page, and the add/edit form while retaining existing route and internal domain identifiers for compatibility.
- Replace readiness on the Staff page with Status and Fitness test columns. Status has exactly Active or Archived.
- Present the new-staff form in a centered shadcn Dialog. Keep editing in the established drawer because the requested change is specific to creation.
- Mark Full name, Sex, Job role, Identity number, Phone number, and Branch as required. Date of birth is optional. A single branch is selected automatically and locked; multiple branches remain selectable. Consent remains a required acknowledgement and is presented in a soft warning Alert.

## Responsive and accessibility behavior

- Dashboard records use an overflow-safe table on larger screens and retain accessible table semantics on mobile.
- Pagination controls expose their current page and have 44px touch targets.
- Required labels include visible and screen-readable asterisks; optional fields are identified as optional.
- The Add staff dialog is centered at a 456px maximum width and 600px desktop height. It remains constrained to the viewport, keeps the header fixed, and scrolls only the inset form area with a subtle scrollbar that does not interrupt the consistently rounded shell.
- Shared business-portal content includes generous bottom padding so page content does not end against the viewport edge.
