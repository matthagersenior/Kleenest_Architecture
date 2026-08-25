# Mobile Store Readiness Audit

Status: Batch 0 started

## Source of truth
- Repository: Kleenest_Architecture
- Branch: main
- Audit must distinguish the web runtime from native Consumer and Business runtimes.

## Required evidence before release
- exact Git commit powering web deployment
- exact mobile source paths
- Expo SDK / React Native versions
- EAS project/build configuration
- iOS bundle identifier
- Android application ID
- production Supabase project/configuration
- public client key handling
- authentication/session flow
- RLS and server authorization
- location permission and fallback behavior
- maps/routing providers and native configuration
- push notification configuration
- deep-link configuration
- account deletion workflow
- privacy/data inventory
- subscription/entitlement implementation
- crash/error monitoring
- CI/build pipeline
- TestFlight and Play testing configuration

## Critical release blockers
Any issue that can prevent a fresh install, authentication, core map/discovery flow, backend authorization, account deletion, native build, or store compliance is P0.

## Batch execution rule
Audit findings that are safe to fix immediately should be implemented in the same batch. Do not create duplicate implementations merely to satisfy the checklist.
