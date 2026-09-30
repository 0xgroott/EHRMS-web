# MOH Approved Certificate View Design

## Goal

Let an MOH / Director open an issued Health Approval Certificate in a separate browser tab immediately after approving a business.

## Experience

- The recorded-decision card continues to show the approval status and certificate number.
- Approved decisions add a secondary **View certificate** link. It opens a dedicated certificate URL in a new tab without changing the review page.
- Denied and undecided submissions never show the certificate link.
- The certificate page uses the existing authenticated MOH workspace and supports direct navigation, refresh, and browser history.

## Certificate document

The document presents an official, restrained certificate layout containing:

- Health Approval Certificate title and issued status
- Certificate number
- Registered business and trading name
- Premises identifier and address
- Inspection reference
- Issuing council
- Issue date
- A deterministic, decorative QR-style mark derived from the certificate number; it is intentionally non-functional and does not expose a verification action

The certificate remains readable at desktop widths and at 390px. No motion is added because this is a frequently accessed legal record and animation would not clarify a state change.

## State and routing

Add `/moh/businesses/$businessId/certificate` as the dedicated route. A new tab creates a separate React document, so approved decisions must be stored in local storage under the signed-in MOH account rather than only in component memory. The persisted value contains the decision result only; credentials, passwords, and verification codes remain unpersisted.

The certificate route resolves the submission and its approved decision. Missing, denied, or unknown records show a clear unavailable state with a link back to the MOH decision queue.

## Verification

- Component tests cover link visibility, new-tab attributes, certificate number, premises details, and QR-style mark.
- Session tests cover account-scoped decision persistence and rehydration.
- A focused Playwright test approves a submission, opens the new tab, checks the certificate document, verifies 390px layout, and checks page and console errors.
