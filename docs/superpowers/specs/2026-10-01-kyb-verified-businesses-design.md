# KYB-verified business names

## Purpose

Show that a registered business has completed Know Your Business verification without implying anything about its public-health compliance status.

## Data model

Each `Premises` record gains a required `kybVerified` boolean. A fixed fictional subset of seeded premises is verified, including at least one business in each of the five compliance states. The prototype schema version increments so cached premises records cannot omit the new field.

## Presentation

A shared `VerifiedBusinessName` component renders the supplied name followed by the Lucide `BadgeCheck` icon used by the shadcn component system when `verified` is true. The icon uses the semantic brand colour, has the accessible label `KYB verified`, and includes a native title for pointer users. Unverified names render without an empty placeholder.

The shared component appears in the premises profile header, MOH Businesses directory, EHO premises directory, EHO assignment lists, and MOH approval/work lists where a registered seed business can be matched. Compliance badges remain separate.

## Verification

Tests cover verified and unverified rendering, seed coverage across all compliance states, propagation through directory entries, profile rendering, and desktop/mobile route behavior. Task-scoped colour lint, TypeScript, and formatting remain required.
