# Business profile imagery — design/build brief

## Outcome

The signed-in business user can view its registered business and premises details, upload or replace one business avatar/logo, and upload or replace up to three photos of its premises and kitchen. Each image can be removed. The account avatar updates immediately, the first premises photo appears on the dashboard, and images survive a reload and sign-in on the same browser.

## Interaction and visual direction

Keep the portal's calm, official visual language. The profile page shows business identity first, then account and premises facts, then a three-slot photo gallery. Empty slots invite an upload; filled slots show the image with replace and remove controls. Use the installed shadcn Avatar, Button, Alert, and form primitives. Accept PNG, JPEG, and WebP. Reject invalid types and files over 8 MB with a clear inline error. Keep the existing onboarding, verification, and certificate flows intact.

## State

Store resized WebP images under a profile-scoped browser-storage key separate from the business account record. Limit the encoded avatar and each photo to a bounded size so browser storage remains usable. The media context supplies the current avatar and photo URLs to the profile page, header, and dashboard. Keep the existing contact and premises fields read-only in this pass; changing verified contact or council-linked premises details requires a separate workflow.

## Verification

Test type/size validation, profile-scoped persistence, upload/replace/remove, header and dashboard imagery, reload, and 390 px layout. Run the repository's lint, formatting, typecheck, tests, build, and maintained browser journey. The ongoing playbook remains untouched.
