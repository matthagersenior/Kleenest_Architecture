# Continuous implementation batches — 2026-08-24

Canonical target: `Kleenest_Architecture/main`.

Reference repositories are not implementation targets.

## Batch sequence

### Consumer trust journey
- Removed manual consumer entry of internal location/check-in identifiers from the Visit surface.
- GPS and QR check-ins now preserve canonical location identifiers returned by authoritative check-in services.
- Evidence remains attributed to the canonical location and automatically uses the latest verified check-in when available.

### Evidence UX
- Evidence page resolves and displays the canonical place before contribution.
- Technical identifiers are no longer exposed as editable consumer fields.
- Missing location context routes the user back to the map rather than asking for an internal ID.
- Verified-visit provenance is surfaced before submission.

### Community trust
- Community review cards explicitly show verified-visit provenance with a trust icon.
- Existing one-hour public community delay remains intact.
- Server-authoritative reputation/provenance remains the source of truth.

## Architectural principle
Consumer surfaces should compose canonical domain services and authoritative Supabase contracts. Internal IDs may remain in route/state plumbing, but users should not be required to understand or manually enter them.

## Next continuation boundary
Continue auditing the remaining Map → Place → Visit → Evidence → Review → Reputation/Intelligence chain, then Business/Fleet/Enterprise activation and outstanding authorization/privilege closures. Do not treat a batch boundary as a stopping point.
