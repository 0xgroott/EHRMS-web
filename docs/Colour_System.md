# EHRMS Colour System

This document is the source of truth for colour use across EHRMS. The same semantic token name is used in both themes; its value changes when the `.dark` theme is active.

Token names follow `--<category>-<intent>-<emphasis>`. Use semantic tokens instead of raw hex values in product code. `strong`, `weak`, and `weaker` describe visual emphasis within a category, not opacity.

## Brand primitives

| Token           | Hex       | Purpose                            |
| --------------- | --------- | ---------------------------------- |
| `--brand-light` | `#00786F` | Primary brand colour in light mode |
| `--brand-dark`  | `#99C417` | Primary brand colour in dark mode  |

Brand and success are intentionally different. Brand identifies navigation, actions, selected state, and focus. Success communicates a completed or compliant outcome.

## Light mode

### Text

| Token                   | Hex       | Usage                                 |
| ----------------------- | --------- | ------------------------------------- |
| `--text-neutral-strong` | `#172022` | Headings and primary body text        |
| `--text-neutral-weak`   | `#526367` | Supporting text and labels            |
| `--text-neutral-weaker` | `#758487` | Secondary metadata                    |
| `--text-brand-strong`   | `#006B63` | Brand links and emphasized brand text |
| `--text-brand-weak`     | `#338F88` | Supporting brand text                 |
| `--text-on-brand`       | `#F0FDFA` | Text on a strong brand fill           |
| `--text-disabled`       | `#98A4A6` | Unavailable text                      |
| `--text-error`          | `#B42318` | Error messages                        |
| `--text-warning`        | `#8A4B08` | Warning messages                      |
| `--text-success`        | `#067647` | Success messages                      |
| `--text-information`    | `#175CD3` | Informational messages                |

### Backgrounds

| Token                         | Hex       | Usage                              |
| ----------------------------- | --------- | ---------------------------------- |
| `--background-neutral-strong` | `#172022` | High-contrast neutral fill         |
| `--background-neutral-weak`   | `#F0F5F3` | Muted regions and controls         |
| `--background-neutral-weaker` | `#F8FBFA` | Page canvas                        |
| `--background-brand-strong`   | `#00786F` | Primary actions and selected fills |
| `--background-brand-weak`     | `#E4F3F1` | Subtle brand state                 |
| `--background-disabled`       | `#E5EBE9` | Disabled controls                  |
| `--background-error`          | `#FEF3F2` | Error state fill                   |
| `--background-warning`        | `#FFFAEB` | Warning state fill                 |
| `--background-success`        | `#ECFDF3` | Success state fill                 |
| `--background-information`    | `#EFF8FF` | Informational state fill           |

### Surfaces

| Token                      | Hex       | Usage                        |
| -------------------------- | --------- | ---------------------------- |
| `--surface-neutral-strong` | `#FFFFFF` | Cards, menus, and dialogs    |
| `--surface-neutral-weak`   | `#F4F8F7` | Inset and secondary surfaces |
| `--surface-neutral-weaker` | `#F9FBFA` | Lowest-emphasis surface      |
| `--surface-brand-strong`   | `#00786F` | Strong brand surface         |
| `--surface-brand-weak`     | `#EAF6F4` | Subtle brand surface         |
| `--surface-disabled`       | `#EDF1F0` | Disabled surface             |
| `--surface-error`          | `#FFF7F6` | Error surface                |
| `--surface-warning`        | `#FFFCF2` | Warning surface              |
| `--surface-success`        | `#F3FFF7` | Success surface              |
| `--surface-information`    | `#F5FAFF` | Informational surface        |

### Lines and borders

| Token                     | Hex       | Usage                         |
| ------------------------- | --------- | ----------------------------- |
| `--border-neutral-strong` | `#718488` | High-emphasis boundary        |
| `--border-neutral-weak`   | `#CED8D5` | Inputs and control boundaries |
| `--border-neutral-weaker` | `#E6ECEA` | Dividers and card boundaries  |
| `--border-brand-strong`   | `#00786F` | Focus and selected boundary   |
| `--border-brand-weak`     | `#80BBB7` | Subtle brand boundary         |
| `--border-disabled`       | `#DCE3E1` | Disabled boundary             |
| `--border-error`          | `#D92D20` | Error boundary                |
| `--border-warning`        | `#DC6803` | Warning boundary              |
| `--border-success`        | `#079455` | Success boundary              |
| `--border-information`    | `#1570EF` | Informational boundary        |

### Icons

| Token                   | Hex       | Usage                   |
| ----------------------- | --------- | ----------------------- |
| `--icon-neutral-strong` | `#34474A` | Primary interface icons |
| `--icon-neutral-weak`   | `#607477` | Supporting icons        |
| `--icon-neutral-weaker` | `#879597` | Low-emphasis icons      |
| `--icon-brand-strong`   | `#00786F` | Primary brand icons     |
| `--icon-brand-weak`     | `#338F88` | Supporting brand icons  |
| `--icon-disabled`       | `#A5B0B1` | Disabled icons          |
| `--icon-error`          | `#D92D20` | Error icons             |
| `--icon-warning`        | `#B54708` | Warning icons           |
| `--icon-success`        | `#079455` | Success icons           |
| `--icon-information`    | `#1570EF` | Informational icons     |

### Certificate identities

| Certificate     | Surface token                           | Surface   | Strong text token                           | Strong text | Weak text token                           | Weak text | Icon token                           | Icon      | Border token                           | Border    |
| --------------- | --------------------------------------- | --------- | ------------------------------------------- | ----------- | ----------------------------------------- | --------- | ------------------------------------ | --------- | -------------------------------------- | --------- |
| Fitness         | `--surface-certificate-fitness`         | `#164D67` | `--text-certificate-fitness-strong`         | `#F4FBFE`   | `--text-certificate-fitness-weak`         | `#C2DCE7` | `--icon-certificate-fitness`         | `#70C3E3` | `--border-certificate-fitness`         | `#2B6780` |
| Fumigation      | `--surface-certificate-fumigation`      | `#681224` | `--text-certificate-fumigation-strong`      | `#FFF7F8`   | `--text-certificate-fumigation-weak`      | `#F0C0CA` | `--icon-certificate-fumigation`      | `#FF91A7` | `--border-certificate-fumigation`      | `#8D2B3F` |
| Health Approval | `--surface-certificate-health-approval` | `#165A4A` | `--text-certificate-health-approval-strong` | `#F4FCF9`   | `--text-certificate-health-approval-weak` | `#C2E1D8` | `--icon-certificate-health-approval` | `#69D2B5` | `--border-certificate-health-approval` | `#2D7966` |

## Dark mode

### Text

| Token                   | Hex       | Usage                                 |
| ----------------------- | --------- | ------------------------------------- |
| `--text-neutral-strong` | `#F2F7F5` | Headings and primary body text        |
| `--text-neutral-weak`   | `#B4C1BE` | Supporting text and labels            |
| `--text-neutral-weaker` | `#899895` | Secondary metadata                    |
| `--text-brand-strong`   | `#99C417` | Brand links and emphasized brand text |
| `--text-brand-weak`     | `#B7D95A` | Supporting brand text                 |
| `--text-on-brand`       | `#202800` | Text on a strong brand fill           |
| `--text-disabled`       | `#62716E` | Unavailable text                      |
| `--text-error`          | `#FF8A80` | Error messages                        |
| `--text-warning`        | `#F6C453` | Warning messages                      |
| `--text-success`        | `#5FD39A` | Success messages                      |
| `--text-information`    | `#7EB6FF` | Informational messages                |

### Backgrounds

| Token                         | Hex       | Usage                              |
| ----------------------------- | --------- | ---------------------------------- |
| `--background-neutral-strong` | `#F2F7F5` | High-contrast neutral fill         |
| `--background-neutral-weak`   | `#222B2B` | Muted regions and controls         |
| `--background-neutral-weaker` | `#151B1C` | Page canvas                        |
| `--background-brand-strong`   | `#99C417` | Primary actions and selected fills |
| `--background-brand-weak`     | `#293313` | Subtle brand state                 |
| `--background-disabled`       | `#2D3736` | Disabled controls                  |
| `--background-error`          | `#3B2020` | Error state fill                   |
| `--background-warning`        | `#382D18` | Warning state fill                 |
| `--background-success`        | `#173527` | Success state fill                 |
| `--background-information`    | `#172D42` | Informational state fill           |

### Surfaces

| Token                      | Hex       | Usage                        |
| -------------------------- | --------- | ---------------------------- |
| `--surface-neutral-strong` | `#202829` | Cards, menus, and dialogs    |
| `--surface-neutral-weak`   | `#1B2324` | Inset and secondary surfaces |
| `--surface-neutral-weaker` | `#171E1F` | Lowest-emphasis surface      |
| `--surface-brand-strong`   | `#99C417` | Strong brand surface         |
| `--surface-brand-weak`     | `#252F13` | Subtle brand surface         |
| `--surface-disabled`       | `#283130` | Disabled surface             |
| `--surface-error`          | `#332121` | Error surface                |
| `--surface-warning`        | `#322A1B` | Warning surface              |
| `--surface-success`        | `#193026` | Success surface              |
| `--surface-information`    | `#1A2A39` | Informational surface        |

### Lines and borders

| Token                     | Hex       | Usage                         |
| ------------------------- | --------- | ----------------------------- |
| `--border-neutral-strong` | `#687774` | High-emphasis boundary        |
| `--border-neutral-weak`   | `#3D4847` | Inputs and control boundaries |
| `--border-neutral-weaker` | `#303A39` | Dividers and card boundaries  |
| `--border-brand-strong`   | `#99C417` | Focus and selected boundary   |
| `--border-brand-weak`     | `#647F18` | Subtle brand boundary         |
| `--border-disabled`       | `#333D3C` | Disabled boundary             |
| `--border-error`          | `#F97066` | Error boundary                |
| `--border-warning`        | `#F4B740` | Warning boundary              |
| `--border-success`        | `#47CD89` | Success boundary              |
| `--border-information`    | `#53A3FF` | Informational boundary        |

### Icons

| Token                   | Hex       | Usage                   |
| ----------------------- | --------- | ----------------------- |
| `--icon-neutral-strong` | `#E2E8E6` | Primary interface icons |
| `--icon-neutral-weak`   | `#A0AEAB` | Supporting icons        |
| `--icon-neutral-weaker` | `#73817E` | Low-emphasis icons      |
| `--icon-brand-strong`   | `#99C417` | Primary brand icons     |
| `--icon-brand-weak`     | `#B7D95A` | Supporting brand icons  |
| `--icon-disabled`       | `#5D6B68` | Disabled icons          |
| `--icon-error`          | `#FF8A80` | Error icons             |
| `--icon-warning`        | `#F6C453` | Warning icons           |
| `--icon-success`        | `#5FD39A` | Success icons           |
| `--icon-information`    | `#7EB6FF` | Informational icons     |

### Certificate identities

| Certificate     | Surface token                           | Surface   | Strong text token                           | Strong text | Weak text token                           | Weak text | Icon token                           | Icon      | Border token                           | Border    |
| --------------- | --------------------------------------- | --------- | ------------------------------------------- | ----------- | ----------------------------------------- | --------- | ------------------------------------ | --------- | -------------------------------------- | --------- |
| Fitness         | `--surface-certificate-fitness`         | `#123F54` | `--text-certificate-fitness-strong`         | `#F4FBFE`   | `--text-certificate-fitness-weak`         | `#B8D4DF` | `--icon-certificate-fitness`         | `#75C9E9` | `--border-certificate-fitness`         | `#2B6C87` |
| Fumigation      | `--surface-certificate-fumigation`      | `#541220` | `--text-certificate-fumigation-strong`      | `#FFF7F8`   | `--text-certificate-fumigation-weak`      | `#E8B5C0` | `--icon-certificate-fumigation`      | `#FF9BAE` | `--border-certificate-fumigation`      | `#7C2A3B` |
| Health Approval | `--surface-certificate-health-approval` | `#124A3E` | `--text-certificate-health-approval-strong` | `#F4FCF9`   | `--text-certificate-health-approval-weak` | `#B8D8CF` | `--icon-certificate-health-approval` | `#74D8BC` | `--border-certificate-health-approval` | `#2B6D5C` |

## Application rules

- Use `strong` for primary content or boundaries, `weak` for supporting content, and `weaker` for metadata, separators, or the lowest-emphasis layer.
- Do not use weak or weaker text for essential instructions, form values, or error recovery guidance.
- Pair strong brand backgrounds and surfaces with `--text-on-brand`; never assume white text in both themes.
- Use the matching status family for text, fill, border, and icon when building alerts, badges, or validation states.
- Use `--border-brand-strong` for focus indication so keyboard focus follows the active theme brand.
- Existing shadcn roles (`--primary`, `--muted`, `--border`, `--ring`, and related sidebar roles) are aliases of this semantic system in `src/styles.css`.

## Enforcement

- `shadcn/no-raw-colors` runs at error severity. It rejects raw Tailwind palette colours, undeclared colour utilities, and literal SVG colours while suggesting declared theme tokens.
- `npm run lint:colours` rejects raw hex values, raw Tailwind palette utilities, and feature-level `dark:` colour overrides in application source, including cases outside the official rule's scope.
- `npm run lint` runs the project colour check and then ESLint with `shadcn/no-raw-colors`, so the normal lint gate enforces this document.
- `AGENTS.md` requires contributors and coding agents to consult this document for every UI change.
- `src/styles.css` is the only place where product colour values may be defined. Any new or changed token must also be recorded in this document.
- `src/domain/business-document-downloads.ts` is exempt because it creates a standalone HTML download that cannot inherit the application theme. shadcn-owned primitives under `src/components/ui/` may retain upstream semantic `dark:` state variants, but they may not use raw palette colours.
