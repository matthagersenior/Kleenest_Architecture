export function normalizePlace(row = {}) {
  const locationId = row.location_id ?? null;
  const placeId = row.place_id ?? null;
  const id = row.id ?? placeId ?? locationId ?? null;
  const hasCanonicalLocation = Boolean(locationId || (!placeId && row.id));
  const canonicalLocationId = locationId || (!placeId ? row.id ?? null : null);
  const bathroomVerificationStatus = row.bathroom_verification_status ?? row.bathroomVerificationStatus ?? null;
  const locationVerificationStatus = row.verification_status ?? row.location_verification_status ?? row.locationVerificationStatus ?? null;
  const isVerified = bathroomVerificationStatus === 'verified' || bathroomVerificationStatus === 'has_bathroom' || locationVerificationStatus === 'verified';

  return Object.freeze({
    ...row,
    id,
    place_id: placeId,
    location_id: canonicalLocationId,
    has_canonical_location: hasCanonicalLocation,
    name: row.name ?? 'Unknown location',
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    bathroom_verification_status: bathroomVerificationStatus,
    location_verification_status: locationVerificationStatus,
    is_verified: isVerified,
    verified: isVerified,
    bathroom_verification_count: row.bathroom_verification_count ?? null,
    bathroom_positive_count: row.bathroom_positive_count ?? null,
    bathroom_negative_count: row.bathroom_negative_count ?? null,
    verification_observation_count: row.verification_observation_count ?? null,
    verification_positive_count: row.verification_positive_count ?? null,
    verification_negative_count: row.verification_negative_count ?? null,
    verification_confidence: row.verification_confidence ?? null,
    location_confidence_score: row.location_confidence_score ?? null,
    location_confidence_level: row.location_confidence_level ?? null,
    intelligence_score: row.intelligence_score ?? null,
    weighted_community_agreement: row.weighted_community_agreement ?? null,
    has_recent_conflict: row.has_recent_conflict ?? false,
    last_observed_at: row.last_observed_at ?? null
  });
}

export function requireCanonicalLocationId(place = {}) {
  const locationId = place.location_id ?? null;
  if (!locationId) throw new Error('Canonical location identity is required for this capability.');
  return locationId;
}
