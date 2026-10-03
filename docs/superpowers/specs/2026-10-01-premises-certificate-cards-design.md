# Premises Certificate Cards Design

## Goal

Present the certificates recorded against a premises as clear, individual cards on both the EHO and MOH premises detail pages, using the established visual language from the Business Certificates page.

## Scope

- Replace the certificate rows inside the shared premises-detail experience with a responsive card grid.
- Show one card per Fitness, Fumigation, or Health Approval certificate.
- Each card shows a certificate-specific icon, certificate type, status, digital reference, and expiry date.
- Preserve existing role behavior: EHO users keep the current **View certificate** action when a digital reference exists; MOH users remain read-only because the current page has no certificate destination.
- Keep the EHO paper-certificate panel beneath the digital certificate cards.
- Preserve the existing empty state when no certificate records exist.

## Component Design

Create a focused shared `PremisesCertificateCards` component. It accepts the premises certificate summaries and an optional function that returns a view URL for a certificate. This keeps the layout and status treatment identical across roles while allowing the EHO page to supply its existing role-specific link.

The component uses the installed shadcn `Card`, `Badge`, and `Button` conventions, semantic colour tokens, and Lucide icons already used by the Business Certificates page. Cards form a one-column grid on small screens and a two-column grid from the medium breakpoint. The visual hierarchy mirrors the reference page without copying its business-only application and eligibility logic.

## Accessibility and Responsive Behavior

- Each card is an accessible region named after its certificate type.
- Decorative icons are hidden from assistive technology.
- Dates use semantic `time` elements and Nigerian English formatting.
- Actions retain descriptive accessible labels.
- At 390px cards stack without horizontal scrolling or clipped content.

## Verification

- Component tests cover individual card rendering, status, reference, expiry, optional actions, and the empty state.
- EHO and MOH feature tests confirm both pages use the shared cards and preserve their role-specific behavior.
- Focused Playwright checks exercise the EHO and MOH premises routes at desktop and 390px.
- Run task-scoped colour lint, ESLint, formatting, and TypeScript checks.
