/**
 * Shared Location Authority projection.
 *
 * Downstream surfaces must preserve canonical identity and source evidence rather
 * than inventing a second location model. This projection is deliberately tolerant
 * of both authority-bundle and already-normalized service payloads.
 */
export function locationAuthorityId(value) {
  return String(value?.location_id ?? value?.locationId ?? value?.canonical_location_id ?? value?.id ?? '');
}

export function locationAuthorityCoordinates(value) {
  const latitude = Number(value?.latitude ?? value?.lat ?? value?.geometry?.latitude);
  const longitude = Number(value?.longitude ?? value?.lng ?? value?.lon ?? value?.geometry?.longitude);
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

export function projectLocationAuthority(value) {
  if (!value) return null;
  const root = value?.location || value;
  const place = value?.place || {};
  const external = Array.isArray(value?.external_records) ? value.external_records : [];
  const latest = external[0] || value?.external_record || {};
  const raw = latest?.raw_data ?? latest?.rawData ?? value?.raw_data ?? value?.rawData ?? null;
  const tags = latest?.tags ?? latest?.osm_tags ?? raw?.tags ?? value?.osm_tags ?? value?.raw_tags ?? null;
  const coords = locationAuthorityCoordinates({ ...place, ...root });
  const id = locationAuthorityId({ ...place, ...root });

  return {
    ...place,
    ...root,
    id,
    location_id: id,
    locationId: id,
    latitude: coords?.latitude ?? root?.latitude ?? place?.latitude ?? null,
    longitude: coords?.longitude ?? root?.longitude ?? place?.longitude ?? null,
    address: root?.address ?? place?.address ?? root?.formatted_address ?? place?.formatted_address ?? '',
    source: root?.source ?? latest?.source ?? latest?.source_system ?? place?.source ?? null,
    source_dataset: root?.source_dataset ?? latest?.source_dataset ?? place?.source_dataset ?? null,
    external_location_id: latest?.external_location_id ?? latest?.external_id ?? latest?.osm_id ?? root?.external_location_id ?? null,
    external_records: external.length ? external : value?.external_records ?? [],
    raw_data: raw,
    raw_tags: tags,
    osm_tags: tags,
    source_provenance: value?.source_provenance ?? (latest && Object.keys(latest).length ? {
      source: latest.source ?? latest.source_system ?? null,
      dataset: latest.source_dataset ?? null,
      external_id: latest.external_location_id ?? latest.external_id ?? latest.osm_id ?? null,
      captured_at: latest.captured_at ?? latest.ingested_at ?? latest.created_at ?? null,
    } : null),
    amenities: value?.amenities ?? root?.amenities ?? place?.amenities ?? [],
    trust: value?.trust ?? root?.trust ?? null,
    intelligence: value?.intelligence ?? root?.intelligence ?? null,
  };
}

export function locationAuthorityRoutePoint(value) {
  const place = projectLocationAuthority(value);
  if (!place) return null;
  const coords = locationAuthorityCoordinates(place);
  return {
    locationId: place.location_id,
    id: place.location_id,
    name: place.name ?? place.brand ?? 'Location',
    address: place.address ?? '',
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    source: place.source ?? null,
    source_dataset: place.source_dataset ?? null,
    external_location_id: place.external_location_id ?? null,
    raw_tags: place.raw_tags ?? place.osm_tags ?? null,
    validation: coords ? 'valid' : 'pending',
  };
}
