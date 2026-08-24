# Workspace UX / Human-Operated Product Program — 2026-08-24

## Objective

Kleenest must present the same underlying capability system as a polished product, not as a technical capability browser. Membership determines the workspace information architecture, navigation, visual emphasis, and primary workflows.

The requirement is explicitly **not** to build six generic dashboards. The workspaces share a design system and interaction grammar while presenting different information hierarchies.

## Workspace standards

### Consumer

Bright, intuitive, discovery-first. Primary journey:

`Explore → Place → Check-in → Observation → Review → Reputation → Rewards/Community`

Primary UI emphasis: map, place quality, cleanliness evidence, route planning, saved places, rewards, community, notifications, profile.

### Business

Operational growth workspace.

Primary hierarchy:

`Overview → Locations → QR Check-In → Promotions/Campaigns/Events/Contests → Customers/Reviews → Analytics/Intelligence → Plan & Access`

Business Growth-only capabilities remain visibly gated, but navigation must explain what is available rather than producing dead-looking controls.

### Fleet

Operations-first.

Primary hierarchy:

`Command → Routes → Operations → People → Intelligence/Performance → Notifications`

The UI must make vehicles, drivers, service opportunities, maintenance, alerts, metrics, and outcomes understandable without technical database knowledge.

### Enterprise

Network/outcome-first.

Primary hierarchy:

`Command → Networks/Partners → Campaigns → Fleet → Performance & Analytics → Governance`

Enterprise access must remain explicitly authorized by the backend contract.

### Admin

Governance and platform operations. Admin is an operator workspace, but the platform owner receives a dedicated Owner Control presentation.

### Owner

Owner is a platform-control product, not merely an expanded Admin screen.

**Platform CRUD is a first-class, highlighted feature.**

Primary hierarchy:

`Platform Overview → Platform CRUD → People & Access → Businesses → Locations → Campaigns → Capabilities → Security/Maintenance → Audit → Membership Preview`

Platform CRUD must provide human-operated forms, searchable records, validation, authorization feedback, safe confirmation, and authoritative refresh. JSON is only an advanced technical representation for structured fields/diagnostics.

## Implemented in this batch

- Workspace metadata now includes role-specific descriptions.
- Business/Fleet/Enterprise/Owner navigation is grouped by operational purpose rather than one undifferentiated link row.
- Owner navigation explicitly highlights **Platform CRUD**.
- Business navigation destinations that previously had no runtime route now terminate in real routes.
- Owner Control Center was reorganized around a first-class Platform CRUD action and human-readable operational language.
- Owner account inspection presents readable fields first; technical JSON is collapsed into an advanced representation.
- Owner CRUD deep links now honor `?resource=` so platform entity shortcuts actually open the requested entity.
- Platform CRUD remains governed by the Supabase CRUD capability catalog and protected gateway rather than direct table writes.

## UX correctness gate

A workspace feature is not complete merely because the backend capability exists. The implementation must prove:

`Supabase contract → authorization → domain service → AppContext → route → visible control → authoritative action → refresh → telemetry`

and, where applicable:

`offline queue → authoritative replay → idempotency → error retention → sync state`

## No-JSON operator rule

A normal operator must be able to complete the intended workflow without editing JSON. Structured fields that genuinely require JSON remain an advanced field type, but the primary workflow must expose the meaningful business fields as normal controls whenever the underlying schema/capability contract permits it.

## Visual/product requirements

- Bright, professional, engaging presentation.
- Role-specific information hierarchy.
- Clear primary/secondary actions.
- Consistent design system and iconography.
- Responsive desktop/mobile behavior appropriate to each workspace.
- Human-readable loading, empty, success, and error states.
- Search/filter/sort where operational data warrants it.
- Safe destructive-action confirmation.
- Explicit authorization/entitlement feedback.
- Accessible keyboard/touch interactions.
- Technical diagnostics hidden behind explicit advanced/technical affordances.

## Next bulk implementation target

Transform the workspace home/command surfaces themselves so they become true role-specific command centers, then trace every surfaced control to the interoperability matrix. Prioritize Owner and Business first, followed by Fleet, Enterprise, Admin, and Consumer refinement.
