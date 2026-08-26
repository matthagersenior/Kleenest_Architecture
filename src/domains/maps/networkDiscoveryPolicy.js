export const NETWORK_DISCOVERY_POLICY = Object.freeze({
  defaultRadiusKm: 8,
  maxRadiusKm: 100,
  sources: ['supabase', 'community', 'osm', 'geocache'],
  freshnessMinutes: 15,
  collectOnOpen: true,
  enrichExisting: true,
  shareNetworkEvents: true,
});

export function buildDiscoveryRequest({ latitude, longitude, radiusKm = NETWORK_DISCOVERY_POLICY.defaultRadiusKm } = {}) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) return null;
  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
    radiusKm: Math.min(Math.max(Number(radiusKm) || NETWORK_DISCOVERY_POLICY.defaultRadiusKm, 1), NETWORK_DISCOVERY_POLICY.maxRadiusKm),
    sources: NETWORK_DISCOVERY_POLICY.sources,
    collect: NETWORK_DISCOVERY_POLICY.collectOnOpen,
    enrichExisting: NETWORK_DISCOVERY_POLICY.enrichExisting,
    shareNetworkEvents: NETWORK_DISCOVERY_POLICY.shareNetworkEvents,
  };
}
