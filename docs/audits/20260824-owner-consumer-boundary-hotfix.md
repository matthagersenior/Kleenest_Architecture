# Owner / consumer workspace boundary hotfix — 2026-08-24

## Observed production symptom
The supplied GitHub Pages screenshot showed a consumer Home surface rendering an **Owner Control Plan / Control Center** directly beneath the consumer experience. That violates the workspace separation contract: platform-owner administration must be a separate privileged workspace, not consumer Home content.

## Source investigation
- Current `Home.jsx` does not render the Owner Control Plan; its content is consumer-only.
- `OwnerControlCenter.jsx` is already explicitly gated by `isPlatformOwner` and uses the owner workspace shell.
- `CanonicalAppRuntime` already redirected `/` to `/owner` for platform owners, but `/consumer` directly rendered `Home`, creating a bypass of the owner routing decision.
- Direct `/admin/*` and `/owner/*` routes were also made explicit privileged routes.

## Fix
Commit `91f34ddd2746a8099f730a19b06f56e1ddc7d6aa`:
- Added `OwnerAwareHome` as the single consumer-entry decision point.
- `/` and `/consumer` now both use the same owner-aware entry behavior.
- Added `OwnerRoute` to protect `/owner/*` and `/admin/*` routes at the runtime boundary.
- Non-owner access to privileged routes redirects to the canonical root instead of rendering privileged UI.
- Owner access is routed to the dedicated owner workspace rather than mixing privileged controls into consumer Home.

## Deployment
The repository's Pages workflow deploys on every push to `main`; the workflow also validates the React production artifact before deployment. The hotfix was committed directly to `main` so it enters that deployment path.

## Acceptance criteria
1. Consumer Home contains no Owner Control Plan.
2. Platform owners entering `/` or `/consumer` are routed to `/owner`.
3. Non-owners cannot render owner/admin surfaces through direct URL navigation.
4. Owner controls remain available through the dedicated owner workspace.
5. Consumer and privileged workspace navigation remain separate.
